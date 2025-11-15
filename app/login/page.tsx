"use client";

import { useState, useCallback, Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import useAuth from "@/hooks/useAuth";
import LoginLoading from "@/components/login/LoginLoading";
import LoginEmailSent from "@/components/login/LoginEmailSent";
import LoginForm from "@/components/login/LoginForm";

function LoginFormContainer() {
  const [emailSent, setEmailSent] = useState(false);
  const [email, setEmail] = useState("");
  const { user, login, googleSignin, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") || "/me";

  useEffect(() => {
    if (!loading && user) {
      router.push(redirectTo);
    }
  }, [user, loading, router, redirectTo]);

  const handleLogin = useCallback(
    async (email: string) => {
      const data = await login(email, redirectTo);
      if (data) {
        return data;
      }
      throw new Error("Failed to send email");
    },
    [login, redirectTo]
  );

  const handleEmailSent = useCallback((email: string) => {
    setEmail(email);
    setEmailSent(true);
  }, []);

  const handleResend = useCallback(() => {
    setEmailSent(false);
    setEmail("");
  }, []);

  const handleGoogleSignin = useCallback(async () => {
    const data = await googleSignin(redirectTo);
    if (data) {
      return data;
    }
    throw new Error("Failed to sign in with Google");
  }, [googleSignin, redirectTo]);

  if (loading) {
    return <LoginLoading />;
  }

  if (user) {
    return <LoginLoading />;
  }

  if (emailSent) {
    return <LoginEmailSent email={email} onResend={handleResend} />;
  }

  return (
    <LoginForm
      onLogin={handleLogin}
      onEmailSent={handleEmailSent}
      onGoogleSignin={handleGoogleSignin}
    />
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginLoading />}>
      <LoginFormContainer />
    </Suspense>
  );
}
