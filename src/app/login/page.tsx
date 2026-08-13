"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/components/AuthProvider";
import { FiMail, FiLock, FiLoader } from "react-icons/fi";
import { clsx } from "clsx";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const { signInAsGuest } = useAuth();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");

    let error = null;

    if (isSignUp) {
      const res = await supabase.auth.signUp({
        email,
        password,
      });
      error = res.error;
      if (!error && res.data.user?.identities?.length === 0) {
        // Supabase sometimes returns no error but empty identities if user already exists
        error = { message: "User already exists. Please sign in." } as any;
      }
    } else {
      const res = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      error = res.error;
    }

    if (error) {
      setErrorMsg(error.message);
    }
    setIsLoading(false);
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 min-h-screen">
      <div className="w-full max-w-md flex flex-col gap-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight mb-2">ProjectCal</h1>
          <p className="text-sm opacity-70">
            {isSignUp ? "Create an account to save your data" : "Sign in to access your timetable"}
          </p>
        </div>

        <div className="glass-panel p-8 flex flex-col gap-6">
          <form onSubmit={handleAuth} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold opacity-70 uppercase tracking-wider ml-1">Email</label>
              <div className="relative">
                <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 opacity-50" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-black/10 dark:bg-white/5 border border-white/10 rounded-xl pl-11 pr-5 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold opacity-70 uppercase tracking-wider ml-1">Password</label>
              <div className="relative">
                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 opacity-50" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-black/10 dark:bg-white/5 border border-white/10 rounded-xl pl-11 pr-5 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
              </div>
            </div>

            {errorMsg && (
              <p className="text-red-500 text-sm bg-red-500/10 p-3 rounded-lg border border-red-500/20 text-center">
                {errorMsg}
              </p>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="mt-2 w-full bg-foreground text-background font-semibold py-3 rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
            >
              {isLoading ? <FiLoader className="animate-spin" /> : (isSignUp ? "Sign Up" : "Sign In")}
            </button>
          </form>

          <div className="flex items-center justify-center gap-4 opacity-50 text-xs uppercase tracking-widest">
            <div className="h-px bg-current flex-1"></div>
            <span>or</span>
            <div className="h-px bg-current flex-1"></div>
          </div>

          <button
            onClick={signInAsGuest}
            type="button"
            className="w-full glass hover:bg-white/20 font-medium py-3 rounded-xl transition-all"
          >
            Continue as Guest
          </button>
        </div>

        <p className="text-center text-sm opacity-70">
          {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
          <button
            onClick={() => {
              setIsSignUp(!isSignUp);
              setErrorMsg("");
            }}
            className="font-semibold underline hover:text-blue-400 transition-colors"
          >
            {isSignUp ? "Sign In" : "Sign Up"}
          </button>
        </p>
      </div>
    </div>
  );
}
