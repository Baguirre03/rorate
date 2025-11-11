"use client";

import { useState, useCallback, Suspense } from "react";
import useAuth from "@/hooks/useAuth";
import LoginLoading from "@/components/login/LoginLoading";
import LoginSignedIn from "@/components/login/LoginSignedIn";
import LoginEmailSent from "@/components/login/LoginEmailSent";
import LoginForm from "@/components/login/LoginForm";

function LoginFormContainer() {
  const [emailSent, setEmailSent] = useState(false);
  const [email, setEmail] = useState("");
  const { user, login, logout, loading } = useAuth();

  const handleLogin = useCallback(
    async (email: string) => {
      const data = await login(email);
      if (data) {
        return data;
      }
      throw new Error("Failed to send email");
    },
    [login]
  );

  const handleEmailSent = useCallback((email: string) => {
    setEmail(email);
    setEmailSent(true);
  }, []);

  const handleResend = useCallback(() => {
    setEmailSent(false);
    setEmail("");
  }, []);

  const handleLogout = useCallback(async () => {
    await logout();
    setEmailSent(false);
    setEmail("");
  }, [logout]);

  if (loading) {
    return <LoginLoading />;
  }

  if (user) {
    return <LoginSignedIn user={user} onLogout={handleLogout} />;
  }

  if (emailSent) {
    return <LoginEmailSent email={email} onResend={handleResend} />;
  }

  return <LoginForm onLogin={handleLogin} onEmailSent={handleEmailSent} />;
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginLoading />}>
      <LoginFormContainer />
    </Suspense>
  );
}
