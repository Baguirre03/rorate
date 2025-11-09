"use client";

import { useState, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";
import { Mail, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

function LoginForm() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [emailSent, setEmailSent] = useState(false);

  const loginMutation = useMutation({
    mutationFn: async ({ email }: { email: string }) => {
      const redirectTo = searchParams.get("redirectedFrom") || "/";
      const siteUrl = window.location.origin;
      const callbackUrl = `${siteUrl}/auth/callback?redirectTo=${encodeURIComponent(
        redirectTo
      )}`;

      const { data, error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          data: {
            confirmation_url: callbackUrl,
          },
          emailRedirectTo: callbackUrl,
        },
      });

      if (error) {
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      setEmailSent(true);
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

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!email) {
        toast.error("Please enter your email");
        return;
      }

      loginMutation.mutate({ email });
    },
    [email, loginMutation]
  );

  if (emailSent) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-black flex items-center justify-center py-12 px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">
              Check your email
            </CardTitle>
            <CardDescription className="text-center">
              We sent a magic link to <strong>{email}</strong>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-center">
              <p className="text-sm text-muted-foreground">
                Click the link in the email to sign in. The link will expire
                soon.
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setEmailSent(false);
                  setEmail("");
                }}
                className="w-full"
              >
                Send another email
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black flex items-center justify-center py-12 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            Sign in to your account
          </CardTitle>
          <CardDescription className="text-center">
            Enter your email to receive a magic link
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                  disabled={loginMutation.isPending}
                />
              </div>
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? (
                "Sending..."
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Send magic link
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-zinc-50 dark:bg-black flex items-center justify-center py-12 px-4">
          <Card className="w-full max-w-md">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-bold text-center">
                Sign in to your account
              </CardTitle>
              <CardDescription className="text-center">
                Loading...
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
