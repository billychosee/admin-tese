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
                "bg-green-500/20 border border-green-500/30 text-green-400",
              toast.type === "error" &&
                "bg-red-500/20 border border-red-500/30 text-red-400",
              toast.type === "warning" &&
                "bg-yellow-500/20 border border-yellow-500/30 text-yellow-400",
              toast.type === "info" &&
                "bg-blue-500/20 border border-blue-500/30 text-blue-400",
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
