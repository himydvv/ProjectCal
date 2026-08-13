"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";
import { useRouter, usePathname } from "next/navigation";

type AuthContextType = {
  user: User | null;
  isGuest: boolean;
  isLoading: boolean;
  signInAsGuest: () => void;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isGuest, setIsGuest] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Check active sessions and sets the user
    const checkUser = async () => {
      setIsLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      const guestStatus = localStorage.getItem("projectcal_guest") === "true";
      
      if (session?.user) {
        setUser(session.user);
        setIsGuest(false);
        if (pathname === "/login") {
           router.push("/");
        }
      } else if (guestStatus) {
        setIsGuest(true);
        if (pathname === "/login") {
           router.push("/");
        }
      } else {
        if (pathname !== "/login") {
           router.push("/login");
        }
      }
      setIsLoading(false);
    };

    checkUser();

    // Listen for changes on auth state (sign in, sign out, etc.)
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setUser(session.user);
          setIsGuest(false);
          localStorage.removeItem("projectcal_guest");
          if (pathname === "/login") {
             router.push("/");
          }
        } else {
          setUser(null);
          const isGuestNow = localStorage.getItem("projectcal_guest") === "true";
          if (!isGuestNow && pathname !== "/login") {
             router.push("/login");
          }
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [pathname, router]);

  const signInAsGuest = () => {
    localStorage.setItem("projectcal_guest", "true");
    setIsGuest(true);
    router.push("/");
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem("projectcal_guest");
    setIsGuest(false);
    setUser(null);
    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{ user, isGuest, isLoading, signInAsGuest, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
