"use client";

import { Metadata } from "next";
import { useState, useCallback, Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import useAuth from "@/hooks/useAuth";
import LoginLoading from "@/components/login/LoginLoading";
import LoginEmailSent from "@/components/login/LoginEmailSent";
import LoginForm from "@/components/login/LoginForm";

export const metadata: Metadata = {
  title: "Log in | rorates.fyi",
  description: "Login to rorates.fyi to submit or view return offer insights.",
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

function LoginFormContainer() {
  const [emailSent, setEmailSent] = useState(false);
  const [email, setEmail] = useState("");
  const { user, login, googleSignin, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") || "/me";
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!loading && user) {
      queryClient.invalidateQueries({ queryKey: ["hasSubmitted"] });
      router.push(redirectTo);
    }
  }, [user, loading, router, redirectTo, queryClient]);

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
