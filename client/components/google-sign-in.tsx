"use client";

import { GoogleLogin, type CredentialResponse } from "@react-oauth/google";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuth } from "@/app/providers";

export function GoogleSignInButton() {
  const { acceptGoogleCredential } = useAuth();
  const router = useRouter();
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  async function onSuccess(response: CredentialResponse) {
    if (!response.credential) {
      toast.error("Google did not return an ID token. Please try again.");
      return;
    }
    try {
      await acceptGoogleCredential(response.credential);
      router.push("/dashboard");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Sign-in failed. Please try again.");
    }
  }

  if (!clientId) return <div className="text-xs text-amber-200">Set NEXT_PUBLIC_GOOGLE_CLIENT_ID to enable Google sign-in.</div>;
  return <div className="google-button"><GoogleLogin onSuccess={onSuccess} onError={() => toast.error("Google sign-in was cancelled or unavailable.")} theme="filled_black" shape="pill" text="continue_with" size="large"/></div>;
}
