"use client";

import { useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { User } from "@supabase/supabase-js";
import LoginContainer from "./LoginContainer";

interface LoginSignedInProps {
  user: User;
  onLogout: () => Promise<void>;
}

export default function LoginSignedIn({ user, onLogout }: LoginSignedInProps) {
  const queryClient = useQueryClient();

  const handleLogout = useCallback(async () => {
    try {
      await onLogout();
      queryClient.invalidateQueries({ queryKey: ["hasSubmitted"] });
      toast.success("Logged out successfully");
    } catch (error) {
      toast.error("Failed to log out", {
        description:
          error instanceof Error ? error.message : "Please try again.",
      });
    }
  }, [onLogout, queryClient]);

  return (
    <LoginContainer>
      <div className="text-center mb-6">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 text-foreground tracking-tight">
          You&apos;re signed in
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground px-2">
          You are currently logged in as {user.email}
        </p>
      </div>

      <div className="space-y-4">
        <div className="p-6 rounded-lg border border-border bg-card">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-green-500" />
            <div>
              <p className="font-medium text-foreground">Account active</p>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
          </div>
        </div>

        <Button
          variant="outline"
          onClick={handleLogout}
          className="w-full"
          size="lg"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </Button>
      </div>
    </LoginContainer>
  );
}
