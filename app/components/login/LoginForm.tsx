"use client";

import { useState, useCallback } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Mail, Send, Loader2 } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import LoginContainer from "./LoginContainer";

interface LoginFormProps {
  onLogin: (email: string) => Promise<unknown>;
  onEmailSent: (email: string) => void;
  onGoogleSignin: () => Promise<unknown>;
}

export default function LoginForm({
  onLogin,
  onEmailSent,
  onGoogleSignin,
}: LoginFormProps) {
  const [email, setEmail] = useState("");

  const loginMutation = useMutation({
    mutationFn: async ({ email }: { email: string }) => {
      const data = await onLogin(email);
      if (data) {
        return data;
      }
      throw new Error("Failed to send email");
    },
    onSuccess: (_, variables) => {
      onEmailSent(variables.email);
      toast.success("Check your email!", {
        description: "We sent you a magic link to sign in.",
      });
    },
    onError: (error: Error) => {
      toast.error("Failed to send email", {
        description: error.message || "Please try again.",
      });
    },
  });

  const googleSigninMutation = useMutation({
    mutationFn: async () => {
      const data = await onGoogleSignin();
      if (data) {
        return data;
      }
      throw new Error("Failed to sign in with Google");
    },
    onError: (error: Error) => {
      toast.error("Failed to sign in with Google", {
        description: error.message || "Please try again.",
      });
    },
  });

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!email.trim()) {
        toast.error("Please enter your email");
        return;
      }

      loginMutation.mutate({ email: email.trim() });
    },
    [email, loginMutation]
  );

  return (
    <LoginContainer>
      {/* Header Section - Matching submit form style */}
      <div className="text-center mb-6">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 text-foreground tracking-tight">
          Sign in to your account
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground px-2">
          Enter your email to receive a secure magic link. No password required.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email Input */}
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium">
            Email address <span className="text-destructive">*</span>
          </Label>
          <div className="relative">
            <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-10"
              required
              disabled={loginMutation.isPending}
              autoComplete="email"
              autoFocus
            />
          </div>
          <p className="text-xs text-muted-foreground">
            We&apos;ll send you a secure link to sign in instantly
          </p>
        </div>

        {/* Submit Button */}
        <div className="pt-4">
          <Button
            type="submit"
            className="w-full"
            disabled={loginMutation.isPending || !email.trim()}
            size="lg"
          >
            {loginMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Send magic link
              </>
            )}
          </Button>
        </div>
      </form>

      {/* Divider */}
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">Or</span>
        </div>
      </div>

      {/* Google Sign In Button */}
      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={() => googleSigninMutation.mutate()}
        disabled={googleSigninMutation.isPending || loginMutation.isPending}
        size="lg"
      >
        {googleSigninMutation.isPending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Signing in...
          </>
        ) : (
          <>
            <Image
              src="/google.png"
              alt="Google"
              width={20}
              height={20}
              className="mr-2"
            />
            Sign in With Google
          </>
        )}
      </Button>
    </LoginContainer>
  );
}
