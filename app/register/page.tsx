"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTheme } from "@/components/providers/ThemeProvider";
import { Icons } from "@/components/ui/Icons";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { api } from "@/services/api";
import { validateEmail, validatePassword, cn } from "@/utils";

function RegisterContent() {
  const router = useRouter();
  const { theme } = useTheme();
  const { addToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const isDark = theme === "dark";

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!validateEmail(formData.email))
      newErrors.email = "Invalid email address";
    const passVal = validatePassword(formData.password);
    if (!passVal.valid) newErrors.password = passVal.message;
    if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    try {
      const { token } = await api.auth.register(
        formData.email,
        formData.password,
        formData.confirmPassword,
      );
      localStorage.setItem("tese-auth-token", token);
      addToast({
        type: "success",
        title: "Account Created",
        message: "Welcome to the TESE ecosystem",
      });
      router.push("/dashboard");
    } catch {
      addToast({
        type: "error",
        title: "Error",
        message: "Registration failed. Try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const { toggleTheme } = useTheme();

  return (
    <div
      className={cn(
        "min-h-screen flex items-center justify-center p-6 transition-colors duration-500",
        isDark ? "bg-[#020617]" : "bg-[#F8FAFC]",
      )}
    >
      {/* Theme Toggle */}
      <button
        onClick={toggleTheme}
        className="absolute top-6 right-6 z-50 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 dark:bg-slate-800/50 backdrop-blur-sm hover:bg-white/20 dark:hover:bg-slate-700/50 transition-colors"
      >
        {isDark ? (
          <Icons.Sun size={20} className="text-amber-400" />
        ) : (
          <Icons.Moon size={20} className="text-slate-600" />
        )}
      </button>

      {/* Background Decor */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-rose-500/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative w-full max-w-[1100px] grid lg:grid-cols-2 bg-white/50 dark:bg-slate-900/50 backdrop-blur-2xl rounded-[3rem] shadow-2xl border border-white dark:border-slate-800 overflow-hidden">
        {/* Left Side: Information */}
        <div className="hidden lg:flex flex-col justify-between p-12 bg-slate-900 text-white relative">
          <div className="absolute inset-0 bg-gradient-to-tr from-emerald-900/40 to-transparent" />

          <div className="relative z-10">
            <Image
              src="/Tese-Light-Logo.png"
              alt="Logo"
              width={140}
              height={40}
              className="mb-12"
            />
            <h2 className="text-5xl font-black tracking-tighter leading-[1.1] mb-6">
              Join The <br />
              <span className="text-emerald-500">Elite Network.</span>
            </h2>
            <div className="space-y-4">
              {[
                {
                  icon: <Icons.ShieldCheck />,
                  text: "Enterprise Grade Security",
                },
                { icon: <Icons.Plus />, text: "Real-time Data Analytics" },
                { icon: <Icons.Plus />, text: "Global Admin Access" },
              ].map((item, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 text-slate-400 font-bold text-[10px] tracking-widest uppercase"
                >
                  <span className="text-emerald-500">{item.icon}</span>{" "}
                  {item.text}
                </div>
              ))}
            </div>
          </div>

          <p className="relative z-10 text-[9px] font-black text-slate-500 uppercase tracking-[0.3em]">
            System Registration v2.4
          </p>
        </div>

        {/* Right Side: Register Form */}
        <div className="p-8 lg:p-16 flex flex-col justify-center">
          <div className="mb-10 text-center lg:text-left">
            <h1
              className={cn(
                "text-3xl font-black tracking-tighter uppercase mb-2",
                isDark ? "text-white" : "text-slate-900",
              )}
            >
              Create Account
            </h1>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              Setup your administrator profile
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                Email Address
              </label>
              <div className="relative group">
                <Icons.Mail
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500 transition-colors"
                  size={18}
                />
                <input
                  name="email"
                  type="email"
                  placeholder="name@company.com"
                  className={cn(
                    "w-full pl-12 pr-4 py-3.5 rounded-2xl text-sm font-bold transition-all border-none outline-none",
                    isDark
                      ? "bg-slate-800 text-white ring-1 ring-slate-700 focus:ring-emerald-500"
                      : "bg-slate-50 ring-1 ring-slate-200 focus:ring-emerald-500",
                  )}
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
              {errors.email && (
                <p className="text-[9px] font-black text-rose-500 uppercase pl-2">
                  {errors.email}
                </p>
              )}
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
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  className={cn(
                    "w-full pl-12 pr-4 py-3.5 rounded-2xl text-sm font-bold transition-all border-none outline-none",
                    isDark
                      ? "bg-slate-800 text-white ring-1 ring-slate-700 focus:ring-emerald-500"
                      : "bg-slate-50 ring-1 ring-slate-200 focus:ring-emerald-500",
                  )}
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>
              {errors.password && (
                <p className="text-[9px] font-black text-rose-500 uppercase pl-2">
                  {errors.password}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                Confirm Identity
              </label>
              <div className="relative group">
                <Icons.Plus
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500 transition-colors"
                  size={18}
                />
                <input
                  name="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  className={cn(
                    "w-full pl-12 pr-4 py-3.5 rounded-2xl text-sm font-bold transition-all border-none outline-none",
                    isDark
                      ? "bg-slate-800 text-white ring-1 ring-slate-700 focus:ring-emerald-500"
                      : "bg-slate-50 ring-1 ring-slate-200 focus:ring-emerald-500",
                  )}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
              </div>
              {errors.confirmPassword && (
                <p className="text-[9px] font-black text-rose-500 uppercase pl-2">
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            <div className="pt-2">
              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  className="mt-1 w-4 h-4 rounded-lg border-slate-300 text-emerald-500 focus:ring-emerald-500"
                  required
                />
                <span className="text-[10px] font-black text-slate-400 uppercase leading-relaxed tracking-widest group-hover:text-slate-600">
                  I accept the{" "}
                  <span className="text-emerald-500">Terms of Ops</span> &
                  Privacy Protocol
                </span>
              </label>
            </div>

            <Button
              type="submit"
              isLoading={isLoading}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl py-8 font-black uppercase text-xs tracking-[0.2em] shadow-xl shadow-emerald-500/20 transition-all hover:scale-[1.01]"
            >
              Initialize Account
            </Button>
          </form>

          <p className="mt-8 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">
            Already registered?{" "}
            <Link
              href="/login"
              className="text-emerald-500 hover:text-emerald-600 ml-1"
            >
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return <RegisterContent />;
}
