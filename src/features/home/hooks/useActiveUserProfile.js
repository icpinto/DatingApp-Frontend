import { useCallback, useEffect, useRef, useState } from "react";
import { fetchRequestStatusApi, fetchUserProfileApi } from "@/features/home/api/home.api";
import { isAbortError } from "@/utils/http";
import { normalizeUserId } from "@/features/home/utils/normalizeUserId";

export function useActiveUserProfile({
  canExpandUserPreview,
  onResetMessaging,
  onProfileError,
}) {
  const [expandedUserId, setExpandedUserId] = useState(null);
  const [profileData, setProfileData] = useState({});
  const [loadingProfile, setLoadingProfile] = useState(false);
  const profileAbortRef = useRef(null);

  const resetProfile = useCallback(() => {
    if (profileAbortRef.current) {
      profileAbortRef.current.abort();
      profileAbortRef.current = null;
    }
    setExpandedUserId(null);
    setProfileData({});
  }, []);

  useEffect(() => {
    return () => {
      if (profileAbortRef.current) {
        profileAbortRef.current.abort();
        profileAbortRef.current = null;
      }
    };
  }, []);

  const handleToggleExpand = useCallback(
    async (rawUserId) => {
      if (!canExpandUserPreview) {
        return;
      }

      const normalizedUserId = normalizeUserId(rawUserId);
      if (normalizedUserId === undefined) {
        return;
      }

      if (expandedUserId === normalizedUserId) {
        resetProfile();
        return;
      }

      setExpandedUserId(normalizedUserId);
      setLoadingProfile(true);
      setProfileData({});
      if (onResetMessaging) {
        onResetMessaging();
      }

      if (profileAbortRef.current) {
        profileAbortRef.current.abort();
      }

      const controller = new AbortController();
      profileAbortRef.current = controller;

      try {
        const [profile, requestStatus] = await Promise.all([
          fetchUserProfileApi(normalizedUserId, { signal: controller.signal }),
          fetchRequestStatusApi(normalizedUserId, { signal: controller.signal }),
        ]);

        setProfileData({
          ...profile,
          requestStatus,
        });
      } catch (error) {
        if (!isAbortError(error) && onProfileError) {
          onProfileError({ type: "error", key: "home.messages.profileError" });
        }
      } finally {
        setLoadingProfile(false);
        if (profileAbortRef.current === controller) {
          profileAbortRef.current = null;
        }
      }
    },
    [
      canExpandUserPreview,
      expandedUserId,
      onProfileError,
      onResetMessaging,
      resetProfile,
    ]
  );

  return {
    expandedUserId,
    profileData,
    setProfileData,
    loadingProfile,
    handleToggleExpand,
    resetProfile,
  };
}
