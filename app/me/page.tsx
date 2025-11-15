"use client";

import { useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, LogOut, Mail, Calendar, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import useAuth from "@/hooks/useAuth";
import LoginContainer from "@/components/login/LoginContainer";
import LoginLoading from "@/components/login/LoginLoading";

export default function MePage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  const handleLogout = useCallback(async () => {
    try {
      await logout();
      toast.success("Logged out successfully");
      router.push("/login");
    } catch (error) {
      toast.error("Failed to log out", {
        description:
          error instanceof Error ? error.message : "Please try again.",
      });
    }
  }, [logout, router]);

  if (loading) {
    return <LoginLoading />;
  }

  if (!user) {
    return null;
  }

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <LoginContainer>
      <div className="text-center mb-6">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 text-foreground tracking-tight">
          Your Account
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground px-2">
          Manage your account information and preferences
        </p>
      </div>

      <div className="space-y-4">
        {/* User Info Card */}
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3 pb-4 border-b border-border">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              <div>
                <p className="font-medium text-foreground">Account Status</p>
                <p className="text-sm text-muted-foreground">Active</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">Email</p>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
              </div>

              {user.user_metadata?.full_name && (
                <div className="flex items-start gap-3">
                  <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">Name</p>
                    <p className="text-sm text-muted-foreground">
                      {user.user_metadata.full_name}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">
                    Member Since
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(user.created_at)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Logout Button */}
        <Button
          variant="outline"
          onClick={handleLogout}
          className="w-full"
          size="lg"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Sign out
        </Button>
      </div>
    </LoginContainer>
  );
}
