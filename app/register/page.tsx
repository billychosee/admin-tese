"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import { api } from "@/services/api";
import { validateEmail, validatePassword } from "@/utils";

export default function RegisterPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!validateEmail(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    const passwordValidation = validatePassword(formData.password);
    if (!passwordValidation.valid) {
      newErrors.password = passwordValidation.message;
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

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
        title: "Registration successful",
        message: "Welcome to TESE Admin Portal",
      });
      router.push("/dashboard");
    } catch {
      addToast({
        type: "error",
        title: "Registration failed",
        message: "Please try again later",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Create an account"
      subtitle="Get started with TESE Admin Portal"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <Input
          label="Email address"
          type="email"
          name="email"
          placeholder="admin@tese.com"
          value={formData.email}
          onChange={handleChange}
          error={errors.email}
          required
        />

        <Input
          label="Password"
          type="password"
          name="password"
          placeholder="Create a strong password"
          value={formData.password}
          onChange={handleChange}
          error={errors.password}
          helperText="Must be at least 8 characters with uppercase, lowercase, and number"
          required
        />

        <Input
          label="Confirm password"
          type="password"
          name="confirmPassword"
          placeholder="Confirm your password"
          value={formData.confirmPassword}
          onChange={handleChange}
          error={errors.confirmPassword}
          required
        />

        <div className="flex items-start gap-2">
          <input
            type="checkbox"
            id="terms"
            className="mt-1 h-4 w-4 rounded"
            style={{
              borderColor: "hsl(var(--surface-muted-foreground) / 0.3)",
              backgroundColor: "hsl(var(--surface))",
            }}
            required
          />
          <label
            htmlFor="terms"
            className="text-sm"
            style={{ color: "hsl(var(--surface-muted-foreground))" }}
          >
            I agree to the{" "}
            <a href="#" className="text-primary-400 hover:text-primary-300">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="#" className="text-primary-400 hover:text-primary-300">
              Privacy Policy
            </a>
          </label>
        </div>

        <Button
          type="submit"
          className="w-full"
          size="lg"
          isLoading={isLoading}
        >
          Create account
        </Button>

        <p
          className="text-center text-sm"
          style={{ color: "hsl(var(--surface-muted-foreground))" }}
        >
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-primary-400 hover:text-primary-300 font-medium"
          >
            Sign in
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
