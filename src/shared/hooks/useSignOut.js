import { useCallback, useMemo, useState } from "react";
import { CAPABILITIES } from "../../domain/capabilities";
import { useUserCapabilities } from "../context/UserContext";
import { signOut as signOutRequest } from "../../features/profile/api/profile.api";

const clearLocalSession = () => {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem("token");
  window.localStorage.removeItem("user_id");
  window.dispatchEvent(
    new CustomEvent("auth-token-changed", { detail: { token: null } })
  );
};

export const useSignOut = () => {
  const { select } = useUserCapabilities();
  const [signOutCapability] = useMemo(
    () => select([CAPABILITIES.APP_SIGN_OUT]),
    [select]
  );
  const [signingOut, setSigningOut] = useState(false);

  const canSignOut = Boolean(signOutCapability?.can);
  const signOutReason = signOutCapability?.reason;

  const signOut = useCallback(async () => {
    if (!canSignOut) {
      return { status: "blocked", reason: signOutReason };
    }

    const hasWindow = typeof window !== "undefined";
    const token = hasWindow ? window.localStorage.getItem("token") : null;

    if (!token) {
      clearLocalSession();
      return { status: "success", localOnly: true };
    }

    setSigningOut(true);
    try {
      await signOutRequest(token);
      clearLocalSession();
      return { status: "success", localOnly: false };
    } catch (error) {
      clearLocalSession();
      return { status: "warning", error };
    } finally {
      setSigningOut(false);
    }
  }, [canSignOut, signOutReason]);

  return {
    signOut,
    signingOut,
    canSignOut,
    signOutReason,
  };
};

export default useSignOut;
