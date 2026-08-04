"use client";

import { useActionState } from "react";
import Link from "next/link";
import { LogIn, Mail, Lock, ArrowRight } from "lucide-react";
import { loginAction, loginWithGoogleAction, type AuthActionState } from "@/server/actions/auth";
import { Button } from "@/shared/components/ui/Button";
import { Input } from "@/shared/components/ui/Input";

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState<AuthActionState, FormData>(
    loginAction,
    {},
  );

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      {/* Background gradient orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-accent-primary/10 blur-[100px]" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-accent-secondary/10 blur-[100px]" />
      </div>

      <div className="w-full max-w-md animate-fade-in-up">
        {/* Logo & Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl gradient-primary mb-4 glow">
            <span className="text-2xl">🐾</span>
          </div>
          <h1 className="text-2xl font-bold gradient-text">Compawion</h1>
          <p className="text-sm text-text-secondary mt-1">
            The AI Operating System for Pets
          </p>
        </div>

        {/* Login Card */}
        <div className="glass-card p-6 space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-text-primary">Welcome back</h2>
            <p className="text-sm text-text-secondary mt-0.5">
              Sign in to your account
            </p>
          </div>

          {state.error && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-danger/10 border border-danger/20">
              <span className="text-sm text-danger">{state.error}</span>
            </div>
          )}

          <form action={formAction} className="space-y-4">
            <Input
              name="email"
              type="email"
              label="Email"
              placeholder="you@example.com"
              icon={<Mail className="h-4 w-4" />}
              required
              autoComplete="email"
            />
            <Input
              name="password"
              type="password"
              label="Password"
              placeholder="••••••••"
              icon={<Lock className="h-4 w-4" />}
              required
              autoComplete="current-password"
            />

            <Button
              type="submit"
              className="w-full"
              loading={isPending}
              icon={<LogIn className="h-4 w-4" />}
              iconRight={<ArrowRight className="h-4 w-4" />}
            >
              Sign In
            </Button>
          </form>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-bg-secondary px-3 text-text-muted">
                or continue with
              </span>
            </div>
          </div>

          {/* Social Login */}
          <form action={loginWithGoogleAction}>
            <Button type="submit" variant="secondary" className="w-full">
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continue with Google
            </Button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-text-muted mt-6">
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            className="text-accent-primary hover:text-accent-glow transition-colors"
          >
            Create account
          </Link>
        </p>
      </div>
    </div>
  );
}
