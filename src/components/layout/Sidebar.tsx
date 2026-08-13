"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FiHome, FiCalendar, FiTarget, FiMoon, FiSun, FiLogOut } from "react-icons/fi";
import { useTheme } from "next-themes";
import { useAuth } from "@/components/AuthProvider";
import { useEffect, useState } from "react";
import clsx from "clsx";

const navItems = [
  { name: "Dashboard", href: "/", icon: FiHome },
  { name: "Timetable", href: "/timetable", icon: FiCalendar },
  { name: "Goals", href: "/goals", icon: FiTarget },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const { user, isGuest, signOut } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <nav className="fixed md:static bottom-4 left-4 right-4 md:left-auto md:right-auto md:bottom-auto md:h-screen z-50">
      <div className="glass-panel w-full md:w-64 h-full md:min-h-screen px-4 py-4 md:py-8 flex md:flex-col justify-around md:justify-start gap-4">
        
        <div className="hidden md:flex flex-col mb-8 px-2">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Timetable
          </h1>
          <p className="text-xs uppercase tracking-widest opacity-50 mt-1 font-medium">Maker</p>
        </div>

        <div className="flex flex-1 md:flex-none w-full justify-around md:flex-col gap-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={clsx(
                  "flex flex-1 md:flex-none items-center justify-center md:justify-start gap-3 px-4 py-3 rounded-2xl transition-all duration-300",
                  isActive
                    ? "bg-black/5 dark:bg-white/10 shadow-sm"
                    : "hover:bg-black/5 dark:hover:bg-white/5"
                )}
              >
                <item.icon
                  className={clsx("text-xl", isActive ? "text-foreground" : "opacity-60")}
                />
                <span
                  className={clsx(
                    "hidden md:block font-medium tracking-tight",
                    isActive ? "opacity-100" : "opacity-60"
                  )}
                >
                  {item.name}
                </span>
              </Link>
            );
          })}
        </div>

        <div className="hidden md:flex flex-col mt-auto px-2">
          {mounted && (
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="flex items-center gap-3 px-4 py-3 rounded-2xl w-full transition-all duration-300 hover:bg-black/5 dark:hover:bg-white/5 opacity-70 hover:opacity-100"
            >
              {theme === 'dark' ? <FiSun className="text-xl" /> : <FiMoon className="text-xl" />}
              <span className="font-medium tracking-tight">
                {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
              </span>
            </button>
          )}
          
          {mounted && (
            <div className="flex flex-col gap-2 w-full border-t border-black/10 dark:border-white/10 pt-4 mt-2">
              <div className="px-4 text-xs font-semibold opacity-50 truncate">
                {isGuest ? "Guest Mode" : user?.email}
              </div>
              <button
                onClick={signOut}
                className="flex items-center gap-3 px-4 py-3 rounded-2xl w-full transition-all duration-300 hover:bg-black/5 dark:hover:bg-white/5 opacity-70 hover:opacity-100 text-red-500"
              >
                <FiLogOut className="text-xl" />
                <span className="font-medium tracking-tight">
                  {isGuest ? 'Sign In' : 'Sign Out'}
                </span>
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
