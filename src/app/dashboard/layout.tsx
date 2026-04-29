"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, Users, UserCheck, Calendar, LogOut, Settings, Fingerprint, CalendarOff } from "lucide-react";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const { setTheme, theme } = useTheme();
  
  useEffect(() => {
    if (pathname.includes("admin")) {
      setIsAdmin(true);
    } else {
      setIsAdmin(false);
    }
  }, [pathname]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  };

  const adminLinks = [
    { name: "Overview", href: "/dashboard/admin", icon: LayoutDashboard },
    { name: "Classes", href: "/dashboard/admin/classes", icon: Calendar },
    { name: "Students", href: "/dashboard/admin/students", icon: Users },
    { name: "Attendance logs", href: "/dashboard/admin/attendance", icon: UserCheck },
    { name: "Leave Requests", href: "/dashboard/admin/leaves", icon: CalendarOff },
  ];

  const studentLinks = [
    { name: "Overview", href: "/dashboard/student", icon: LayoutDashboard },
    { name: "Mark Attendance", href: "/dashboard/student/mark", icon: Fingerprint },
    { name: "Leave Apply", href: "/dashboard/student/leave", icon: CalendarOff },
  ];

  const links = isAdmin ? adminLinks : studentLinks;

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <aside className="w-64 shrink-0 bg-card border-r border-border flex flex-col justify-between">
        <div>
          <div className="h-20 flex items-center px-6 border-b border-border">
            <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tighter text-primary">
              <Fingerprint className="w-6 h-6" />
              <span>Smart Attend</span>
            </Link>
          </div>
          <nav className="p-4 space-y-1">
            {links.map((link) => {
              const active = pathname === link.href;
              const Icon = link.icon;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    active
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {link.name}
                </Link>
              );
            })}
          </nav>
        </div>
        
        <div className="p-4 border-t border-border space-y-2">
          <button 
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="flex items-center gap-3 px-3 py-2 w-full text-left rounded-lg text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground transition-all"
          >
            <Settings className="w-4 h-4" />
            Toggle Theme
          </button>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2 w-full text-left rounded-lg text-sm font-medium text-destructive hover:bg-destructive/10 transition-all"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-muted/20">
        <div className="p-8 max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
