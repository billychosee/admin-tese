"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTheme } from "@/components/providers/ThemeProvider";
import { Icons } from "@/components/ui/Icons";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import { api } from "@/services/api";
import { AUTH_TOKEN_KEY } from "@/constants";
import { cn } from "@/utils";

function LoginContent() {
  const router = useRouter();
  const { theme } = useTheme();
  const { addToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const isDark = theme === "dark";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const { token } = await api.auth.login(email, password);
      document.cookie = `${AUTH_TOKEN_KEY}=${token}; path=/; max-age=86400`;
      addToast({
        type: "success",
        title: "Access Granted",
        message: "Welcome to the Command Center",
      });
      router.push("/dashboard");
    } catch {
      addToast({
        type: "error",
        title: "Authorization Failed",
        message: "Please check your credentials",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className={cn(
        "min-h-screen flex items-center justify-center p-6 transition-colors duration-500",
        isDark ? "bg-[#020617]" : "bg-[#F8FAFC]",
      )}
    >
      {/* Background Decorative Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-rose-500/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative w-full max-w-[1100px] grid lg:grid-cols-2 bg-white/50 dark:bg-slate-900/50 backdrop-blur-2xl rounded-[3rem] shadow-2xl border border-white dark:border-slate-800 overflow-hidden">
        {/* Left Side: Branding/Visual */}
        <div className="hidden lg:flex flex-col justify-between p-12 bg-slate-900 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/20 to-transparent" />

          <div className="relative z-10">
            <Image
              src="/Tese-Light-Logo.png"
              alt="TESE Logo"
              width={140}
              height={40}
              className="mb-12"
            />
            <h2 className="text-5xl font-black tracking-tighter leading-[1.1] mb-6">
              Streamlining <br />
              <span className="text-emerald-500 font-outline-2">
                The Future.
              </span>
            </h2>
            <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.3em]">
              Central Management System v2.0
            </p>
          </div>

          <div className="relative z-10 flex items-center gap-4 text-xs font-bold text-slate-500 uppercase tracking-widest">
            <span className="h-px w-8 bg-slate-800" />
            Reliable. Secure. Fast.
          </div>
        </div>

        {/* Right Side: Login Form */}
        <div className="p-8 lg:p-16 flex flex-col justify-center">
          <div className="mb-10">
            <h1
              className={cn(
                "text-3xl font-black tracking-tighter uppercase mb-2",
                isDark ? "text-white" : "text-slate-900",
              )}
            >
              Admin Login
            </h1>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              Enter your secure credentials to proceed
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                Work Email
              </label>
              <div className="relative group">
                <Icons.Mail
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500 transition-colors"
                  size={18}
                />
                <input
                  type="email"
                  placeholder="admin@tese.com"
                  className={cn(
                    "w-full pl-12 pr-4 py-4 rounded-2xl text-sm font-bold transition-all border-none outline-none",
                    isDark
                      ? "bg-slate-800 text-white ring-1 ring-slate-700 focus:ring-emerald-500"
                      : "bg-slate-50 ring-1 ring-slate-200 focus:ring-emerald-500",
                  )}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                Password
              </label>
              <div className="relative group">
                <Icons.Lock
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500 transition-colors"
                  size={18}
                />
                <input
                  type="password"
                  placeholder="••••••••"
                  className={cn(
                    "w-full pl-12 pr-4 py-4 rounded-2xl text-sm font-bold transition-all border-none outline-none",
                    isDark
                      ? "bg-slate-800 text-white ring-1 ring-slate-700 focus:ring-emerald-500"
                      : "bg-slate-50 ring-1 ring-slate-200 focus:ring-emerald-500",
                  )}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded-lg border-slate-300 text-emerald-500 focus:ring-emerald-500"
                />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover:text-slate-600 transition-colors">
                  Keep me active
                </span>
              </label>
              <Link
                href="#"
                className="text-[10px] font-black text-emerald-600 uppercase tracking-widest hover:text-emerald-500"
              >
                Reset Access?
              </Link>
            </div>

            <Button
              type="submit"
              isLoading={isLoading}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl py-8 font-black uppercase text-xs tracking-[0.2em] shadow-xl shadow-emerald-500/20 transition-all hover:scale-[1.01] active:scale-[0.98]"
            >
              Authorize System Entry
            </Button>
          </form>

          <footer className="mt-12 pt-8 border-t border-slate-100 dark:border-slate-800">
            <div className="flex justify-between items-center text-[9px] font-black text-slate-400 uppercase tracking-widest">
              <span>© {new Date().getFullYear()} TESE CORP</span>
              <div className="flex gap-4">
                <span className="hover:text-slate-600 cursor-pointer">
                  Security
                </span>
                <span className="hover:text-slate-600 cursor-pointer">
                  Support
                </span>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted)
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <Icons.Loader2 className="animate-spin text-emerald-500" />
      </div>
    );

  return <LoginContent />;
}
