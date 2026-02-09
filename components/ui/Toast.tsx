"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { cn } from "@/utils";
import { Icons } from "./Icons";

interface Toast {
  id: string;
  type: "success" | "error" | "warning" | "info";
  title: string;
  message?: string;
}

interface ToastContextType {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, "id">) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((toast: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { ...toast, id }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={cn(
              "flex items-start gap-3 p-4 rounded-xl shadow-strong animate-slide-in-bottom",
              toast.type === "success" &&
                "bg-[hsl(var(--success)/0.2)] border border-[hsl(var(--success)/0.3)] text-[hsl(var(--success))]",
              toast.type === "error" &&
                "bg-[hsl(var(--danger)/0.2)] border border-[hsl(var(--danger)/0.3)] text-[hsl(var(--danger))]",
              toast.type === "warning" &&
                "bg-[hsl(var(--warning)/0.2)] border border-[hsl(var(--warning)/0.3)] text-[hsl(var(--warning))]",
              toast.type === "info" &&
                "bg-[hsl(var(--info)/0.2)] border border-[hsl(var(--info)/0.3)] text-[hsl(var(--info))]",
            )}
          >
            {toast.type === "success" && <Icons.Check size={20} />}
            {toast.type === "error" && <Icons.XCircle size={20} />}
            {toast.type === "warning" && <Icons.AlertCircle size={20} />}
            {toast.type === "info" && <Icons.Info size={20} />}
            <div className="flex-1">
              <p className="font-medium">{toast.title}</p>
              {toast.message && (
                <p className="text-sm opacity-80 mt-0.5">{toast.message}</p>
              )}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="opacity-60 hover:opacity-100 transition-opacity"
            >
              <Icons.X size={16} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
