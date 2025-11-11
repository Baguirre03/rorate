"use client";

import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import LoginContainer from "./LoginContainer";

interface LoginEmailSentProps {
  email: string;
  onResend: () => void;
}

export default function LoginEmailSent({
  email,
  onResend,
}: LoginEmailSentProps) {
  return (
    <LoginContainer>
      <div className="text-center mb-6">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 text-foreground tracking-tight">
          Check your email
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground px-2">
          We sent a magic link to{" "}
          <strong className="text-foreground">{email}</strong>
        </p>
      </div>

      <div className="space-y-4">
        <div className="p-6 rounded-lg border border-border bg-card">
          <div className="flex items-start gap-3">
            <Mail className="h-5 w-5 text-foreground mt-0.5" />
            <div className="flex-1">
              <p className="font-medium text-foreground mb-2">
                Email sent successfully
              </p>
              <p className="text-sm text-muted-foreground">
                Click the link in the email to sign in. The link will expire
                soon.
              </p>
            </div>
          </div>
        </div>

        <Button
          variant="outline"
          onClick={onResend}
          className="w-full"
          size="lg"
        >
          Send another email
        </Button>
      </div>
    </LoginContainer>
  );
}
