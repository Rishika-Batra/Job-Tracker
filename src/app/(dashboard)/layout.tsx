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

import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = cookies();
  const supabase = createServerComponentClient({ cookies: () => cookieStore });

  // Check if a session exists
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // If no session exists, redirect to login page
  if (!session) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Any layout-specific components (e.g. navigation, sidebar) can go here */}
      <main className="w-full">
        {children}
      </main>
    </div>
  );
}
