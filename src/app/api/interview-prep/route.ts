import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const DAILY_LIMIT = 10;
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';

export async function POST(request: Request) {
  const cookieStore = cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = session.user.id;

  try {
    const body = await request.json();
    const { company, role, notes } = body;

    if (!company || !role) {
      return NextResponse.json(
        { error: 'Company and role are required fields.' },
        { status: 400 }
      );
    }

    // Rate limiting
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const { count, error: countError } = await supabase
      .from('api_usage')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('endpoint', '/api/interview-prep')
      .gte('created_at', todayStart.toISOString());

    if (countError) {
      console.error('Error checking rate limit:', countError);
    } else if (count !== null && count >= DAILY_LIMIT) {
      return NextResponse.json(
        {
          error: `Daily limit reached. You can generate up to ${DAILY_LIMIT} interview preps per day. Try again tomorrow!`,
          limit: DAILY_LIMIT,
          used: count,
        },
        { status: 429 }
      );
    }

    const systemPrompt = `You are an expert career coach. You MUST respond with valid JSON only. 
No markdown, no code fences, no extra text before or after the JSON.
All array values must be plain strings only, never objects.`;

    const userMessage = `I have an interview at ${company} for a ${role} position.
Additional context: ${notes || 'None'}

Respond with this exact JSON structure and nothing else:
{
  "questions": ["question 1", "question 2", "question 3", "question 4", "question 5"],
  "research": ["research item 1", "research item 2", "research item 3"],
  "talkingPoints": ["talking point 1", "talking point 2"],
  "smartQuestion": "one smart question to ask them"
}

Rules:
- questions: array of exactly 5 strings, each a likely interview question
- research: array of exactly 3 strings, each a specific thing to research about ${company}
- talkingPoints: array of exactly 2 strings, each a talking point about fit for the ${role} role
- smartQuestion: a single string with one smart question to ask the interviewer
- ALL values must be plain strings, never nested objects or arrays`;

    const groqResponse = await fetch(GROQ_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage },
        ],
        temperature: 0.7,
      }),
    });

    if (!groqResponse.ok) {
      const errorData = await groqResponse.text();
      console.error('Groq API error:', errorData);
      throw new Error(`Groq API returned status ${groqResponse.status}`);
    }

    const groqData = await groqResponse.json();
    const textResponse = groqData?.choices?.[0]?.message?.content;

    if (!textResponse) {
      throw new Error('Empty response from Groq API');
    }

    // Parse JSON — strip markdown fences if present
    let jsonResponse;
    try {
      const cleaned = textResponse.replace(/```json|```/g, '').trim();
      jsonResponse = JSON.parse(cleaned);
    } catch {
      const jsonMatch = textResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          jsonResponse = JSON.parse(jsonMatch[0]);
        } catch {
          throw new Error('Failed to parse JSON from Groq response');
        }
      } else {
        throw new Error('Could not parse Groq response as JSON');
      }
    }

    // Normalize — ensure all fields are arrays of strings
    const normalize = (arr: unknown[]): string[] =>
      arr.map((item) =>
        typeof item === 'string' ? item : (item as Record<string, string>).desc || (item as Record<string, string>).text || JSON.stringify(item)
      );

    const normalized = {
      questions: normalize(jsonResponse.questions || []),
      research: normalize(jsonResponse.research || []),
      talkingPoints: normalize(jsonResponse.talkingPoints || []),
      smartQuestion: typeof jsonResponse.smartQuestion === 'string'
        ? jsonResponse.smartQuestion
        : JSON.stringify(jsonResponse.smartQuestion),
    };

    // Log usage
    const { error: insertError } = await supabase
      .from('api_usage')
      .insert({ user_id: userId, endpoint: '/api/interview-prep' });

    if (insertError) {
      console.error('Failed to log API usage:', insertError);
    }

    return NextResponse.json(normalized);
  } catch (err) {
    console.error('Error in interview-prep route:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'An error occurred.' },
      { status: 500 }
    );
  }
}