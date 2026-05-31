import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
  const cookieStore = cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

  // Get user session
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Fetch jobs for this user, ordered by created_at descending
  const { data: jobs, error } = await supabase
    .from('jobs')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(jobs);
}

export async function POST(request: Request) {
  const cookieStore = cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

  // Get user session
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { company, role, url, notes, applied_date, status } = body;

    // Validate required fields
    if (!company || !role) {
      return NextResponse.json(
        { error: 'Company and Role are required fields.' },
        { status: 400 }
      );
    }

    // Insert new job
    const { data: job, error } = await supabase
      .from('jobs')
      .insert({
        user_id: session.user.id,
        company,
        role,
        url: url || null,
        notes: notes || null,
        applied_date: applied_date || new Date().toISOString().split('T')[0],
        status: status || 'applied',
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Add initial entry in status_history
    await supabase.from('status_history').insert({
      job_id: job.id,
      old_status: null,
      new_status: job.status,
    });

    return NextResponse.json(job, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Invalid request body' },
      { status: 400 }
    );
  }
}
