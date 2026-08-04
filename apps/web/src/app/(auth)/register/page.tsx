"use client";

import { useActionState } from "react";
import Link from "next/link";
import { UserPlus, Mail, Lock, User, ArrowRight } from "lucide-react";
import { registerAction, type AuthActionState } from "@/server/actions/auth";
import { Button } from "@/shared/components/ui/Button";
import { Input } from "@/shared/components/ui/Input";

export default function RegisterPage() {
  const [state, formAction, isPending] = useActionState<AuthActionState, FormData>(
    registerAction,
    {},
  );

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      {/* Background gradient orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 h-80 w-80 rounded-full bg-accent-secondary/10 blur-[100px]" />
        <div className="absolute -bottom-40 -right-40 h-80 w-80 rounded-full bg-accent-primary/10 blur-[100px]" />
      </div>

      <div className="w-full max-w-md animate-fade-in-up">
        {/* Logo & Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl gradient-primary mb-4 glow">
            <span className="text-2xl">🐾</span>
          </div>
          <h1 className="text-2xl font-bold gradient-text">Compawion</h1>
          <p className="text-sm text-text-secondary mt-1">
            Create your pet&apos;s digital guardian
          </p>
        </div>

        {/* Register Card */}
        <div className="glass-card p-6 space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-text-primary">Create account</h2>
            <p className="text-sm text-text-secondary mt-0.5">
              Set up your home in under 2 minutes
            </p>
          </div>

          {state.error && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-danger/10 border border-danger/20">
              <span className="text-sm text-danger">{state.error}</span>
            </div>
          )}

          <form action={formAction} className="space-y-4">
            <Input
              name="displayName"
              type="text"
              label="Your name"
              placeholder="John"
              icon={<User className="h-4 w-4" />}
              required
              autoComplete="name"
            />
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
              hint="At least 8 characters"
              required
              autoComplete="new-password"
            />

            <Button
              type="submit"
              className="w-full"
              loading={isPending}
              icon={<UserPlus className="h-4 w-4" />}
              iconRight={<ArrowRight className="h-4 w-4" />}
            >
              Create Account
            </Button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-text-muted mt-6">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-accent-primary hover:text-accent-glow transition-colors"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
