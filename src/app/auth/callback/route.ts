/**
 * HOW TO ENABLE GOOGLE OAUTH IN SUPABASE:
 * 
 * 1. Go to the Google Cloud Console (https://console.cloud.google.com).
 * 2. Create a new project or select an existing one. Set up your OAuth consent screen.
 * 3. Go to "APIs & Services" > "Credentials".
 * 4. Click "Create Credentials" > "OAuth client ID". Choose Application Type: "Web application".
 * 5. Under "Authorized redirect URIs", add your Supabase project callback URL:
 *    https://<your-supabase-project-ref>.supabase.co/auth/v1/callback
 * 6. Copy the generated "Client ID" and "Client Secret".
 * 7. Go to your Supabase Dashboard (https://supabase.com/dashboard).
 * 8. Navigate to your project, then go to "Authentication" > "Providers".
 * 9. Click on "Google", enable it, paste the Client ID and Client Secret, and save.
 */

import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  if (code) {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    // Exchange the code for a user session
    await supabase.auth.exchangeCodeForSession(code);
  }

  // URL to redirect to after sign in process completes
  return NextResponse.redirect(new URL('/', request.url));
}
