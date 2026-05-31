/* src/components/Sidebar.tsx */
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Home, BarChart2, LogOut } from "lucide-react";
// removed unused imports

// Simple avatar placeholder using user email initials
function Avatar({ email }: { email: string }) {
  const initials = email
    .split("@")
    .shift()
    ?.split(" ")
    .map((s) => s[0]?.toUpperCase())
    .join("");
  return (
    <div className="flex items-center gap-2">
      <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-medium text-sm">
        {initials ?? "U"}
      </div>
      <span className="text-sm font-medium text-slate-200 truncate max-w-[8rem]" title={email}>
        {email}
      </span>
    </div>
  );
}

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClientComponentClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSession = async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
      setLoading(false);
    };
    fetchSession();
  }, [supabase]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const navItems = [
    { name: "Board", href: "/", icon: Home },
    { name: "Dashboard", href: "/dashboard", icon: BarChart2 },
  ];

  // Desktop vertical sidebar
  const desktopSidebar = (
    <aside className="hidden md:flex flex-col justify-between h-screen w-64 bg-slate-900 border-r border-slate-800 p-4">
      {/* Logo */}
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-violet-400">
          JobTracker
        </h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                isActive ? "bg-indigo-700 text-white" : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
              }`}
            >
              <Icon className="h-5 w-5" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* User & Sign Out */}
      <div className="mt-8">
        {loading ? (
          <p className="text-slate-500">Loading…</p>
        ) : session ? (
          <>
            <Avatar email={session.user.email ?? ""} />
            <button
              onClick={handleSignOut}
              className="mt-3 w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 transition"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </>
        ) : (
          <p className="text-slate-500">Not signed in</p>
        )}
      </div>
    </aside>
  );

  // Mobile bottom tab bar
  const mobileTabBar = (
    <nav className="fixed bottom-0 inset-x-0 flex justify-around items-center bg-slate-900 border-t border-slate-800 md:hidden p-2">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center text-xs ${isActive ? "text-indigo-400" : "text-slate-400"}`}
          >
            <Icon className="h-5 w-5" />
            <span>{item.name}</span>
          </Link>
        );
      })}
    </nav>
  );

  return (
    <>
      {desktopSidebar}
      {mobileTabBar}
    </>
  );
}
