"use client";

import React, { useState } from "react";
import { Icons } from "@/components/ui/Icons";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { cn } from "@/utils";
import { useTheme } from "@/components/providers/ThemeProvider";

export default function ProfilePage() {
  const { theme } = useTheme();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "TESE Admin",
    email: "admin@tese.com",
    role: "Administrator",
    phone: "+27 12 345 6789",
    address: "123 TESE Street, Johannesburg, South Africa",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    setIsEditing(false);
    // Add toast notification logic here if available
  };

  return (
    <div className="p-8 space-y-10 min-h-screen transition-colors duration-300 bg-slate-50 dark:bg-slate-950">
      {/* 1. HERO PROFILE SECTION */}
      <div className="relative overflow-hidden rounded-[3rem] bg-slate-900 dark:bg-slate-900 p-8 text-white shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-[80px] -mr-20 -mt-20" />
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
          <div className="relative group">
            <div className="h-32 w-32 rounded-[2.5rem] bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-4xl font-black shadow-xl border-4 border-white/10 group-hover:scale-105 transition-transform duration-500">
              TA
            </div>
            <button className="absolute bottom-0 right-0 p-2 bg-white text-slate-900 rounded-xl shadow-lg hover:bg-emerald-500 hover:text-white transition-colors">
              <Icons.Camera size={16} />
            </button>
          </div>

          <div className="text-center md:text-left flex-1">
            <h1 className="text-4xl font-black tracking-tighter">
              {formData.name}
            </h1>
            <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-2">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-2">
                <Icons.ShieldCheck size={14} /> {formData.role}
              </span>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Icons.MapPin size={14} /> Johannesburg, SA
              </span>
            </div>
          </div>

          <div className="flex gap-3">
            {!isEditing ? (
              <Button
                onClick={() => setIsEditing(true)}
                className="bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/10 text-white rounded-2xl px-8 py-6 font-black uppercase text-[10px] tracking-widest"
              >
                <Icons.Edit className="mr-2" size={16} /> Edit Profile
              </Button>
            ) : (
              <Button
                onClick={handleSave}
                className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl px-8 py-6 font-black uppercase text-[10px] tracking-widest shadow-lg shadow-emerald-500/20"
              >
                Save Changes
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* 2. PERSONAL INFORMATION */}
        <Card className="lg:col-span-2 p-8 rounded-[3rem] border-none shadow-xl bg-white dark:bg-slate-900 transition-colors duration-300">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 transition-colors duration-300">
              Account Details
            </h2>
            {isEditing && (
              <button
                onClick={() => setIsEditing(false)}
                className="text-[10px] font-black text-rose-500 uppercase"
              >
                Cancel
              </button>
            )}
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            {[
              {
                label: "Full Name",
                name: "name",
                value: formData.name,
                type: "text",
                icon: <Icons.User />,
              },
              {
                label: "Email Address",
                name: "email",
                value: formData.email,
                type: "email",
                icon: <Icons.Mail />,
              },
              {
                label: "Phone Number",
                name: "phone",
                value: formData.phone,
                type: "tel",
                icon: <Icons.Phone />,
              },
              {
                label: "User Role",
                name: "role",
                value: formData.role,
                type: "text",
                icon: <Icons.Shield />,
                disabled: true,
              },
            ].map((field, i) => (
              <div key={i} className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1 transition-colors duration-300">
                  {field.label}
                </label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-600 group-focus-within:text-emerald-500 transition-colors">
                    {field.icon}
                  </div>
                  <input
                    name={field.name}
                    type={field.type}
                    value={field.value}
                    onChange={handleInputChange}
                    disabled={!isEditing || field.disabled}
                    className={cn(
                      "w-full pl-12 pr-4 py-4 rounded-2xl text-sm font-bold transition-all border-none outline-none",
                      isEditing && !field.disabled
                        ? "bg-slate-50 dark:bg-slate-800 ring-2 ring-emerald-500/20 focus:ring-emerald-500 text-slate-900 dark:text-white"
                        : "bg-slate-50/50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 cursor-not-allowed",
                    )}
                  />
                </div>
              </div>
            ))}
            <div className="md:col-span-2 space-y-2">
              <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1 transition-colors duration-300">
                Office Address
              </label>
              <input
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                disabled={!isEditing}
                className={cn(
                  "w-full px-6 py-4 rounded-2xl text-sm font-bold transition-all border-none outline-none",
                  isEditing
                    ? "bg-slate-50 dark:bg-slate-800 ring-2 ring-emerald-500/20 focus:ring-emerald-500 text-slate-900 dark:text-white"
                    : "bg-slate-50/50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400",
                )}
              />
            </div>
          </div>
        </Card>

        {/* 3. SECURITY & DANGER ZONE */}
        <div className="space-y-8">
          <Card className="p-8 rounded-[3rem] border-none shadow-xl bg-white dark:bg-slate-900 transition-colors duration-300">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-6 transition-colors duration-300">
              Security
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-[2rem] bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 group hover:border-emerald-200 dark:hover:border-emerald-800 transition-all">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                    <Icons.Lock size={18} />
                  </div>
                  <div>
                    <p className="text-xs font-black text-slate-800 dark:text-slate-200 transition-colors duration-300">
                      Password
                    </p>
                    <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase">
                      30 Days ago
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-colors duration-300"
                >
                  Update
                </Button>
              </div>

              <div className="flex items-center justify-between p-4 rounded-[2rem] bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 group hover:border-emerald-200 dark:hover:border-emerald-800 transition-all">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                    <Icons.ShieldCheck size={18} />
                  </div>
                  <div>
                    <p className="text-xs font-black text-slate-800 dark:text-slate-200 transition-colors duration-300">
                      2FA Auth
                    </p>
                    <p className="text-[9px] font-bold text-rose-500 uppercase tracking-tighter">
                      Disabled
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-colors duration-300"
                >
                  Setup
                </Button>
              </div>
            </div>
          </Card>

          <Card className="p-8 rounded-[3rem] border-none shadow-xl bg-white dark:bg-slate-900 group hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors duration-500">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-rose-500 mb-4 transition-colors duration-300">
              Danger Zone
            </h3>
            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase leading-relaxed mb-6 transition-colors duration-300">
              Deleting your account will permanently remove all data and
              creators associated with you.
            </p>
            <Button className="w-full bg-rose-100 dark:bg-rose-900/30 hover:bg-rose-500 text-rose-600 dark:text-rose-400 hover:text-white rounded-2xl py-6 font-black uppercase text-[10px] tracking-widest transition-all">
              <Icons.Trash2 size={14} className="mr-2" /> Delete Account
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}
