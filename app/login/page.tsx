"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import { api } from "@/services/api";
import { AUTH_TOKEN_KEY } from "@/constants";

export default function LoginPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const { token } = await api.auth.login(email, password);
      document.cookie = `${AUTH_TOKEN_KEY}=${token}; path=/; max-age=86400`; // 24 hours
      addToast({
        type: "success",
        title: "Login successful",
        message: "Welcome back to TESE Admin Portal",
      });
      router.push("/dashboard");
    } catch {
      setError("Invalid email or password");
      addToast({
        type: "error",
        title: "Login failed",
        message: "Invalid email or password",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to your TESE Admin Portal account"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <Input
          label="Email address"
          type="email"
          placeholder="admin@tese.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={error}
          required
        />

        <Input
          label="Password"
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              className="h-4 w-4 rounded"
              style={{
                borderColor: "hsl(var(--surface-muted-foreground) / 0.3)",
                backgroundColor: "hsl(var(--surface))",
              }}
            />
            <span
              className="text-sm"
              style={{ color: "hsl(var(--surface-muted-foreground))" }}
            >
              Remember me
            </span>
          </label>
          <a
            href="#"
            className="text-sm text-primary-400 hover:text-primary-300"
          >
            Forgot password?
          </a>
        </div>

        <Button
          type="submit"
          className="w-full"
          size="lg"
          isLoading={isLoading}
        >
          Sign in
        </Button>

        <p
          className="text-center text-sm"
          style={{ color: "hsl(var(--surface-muted-foreground))" }}
        >
          Don't have an account?{" "}
          <Link
            href="/register"
            className="text-primary-400 hover:text-primary-300 font-medium"
          >
            Create one
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
