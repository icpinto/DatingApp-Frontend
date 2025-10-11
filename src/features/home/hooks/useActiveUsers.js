import { useCallback, useEffect, useRef, useState } from "react";
import { fetchActiveUsersApi } from "../api/home.api";
import { getUserIdentifier, normalizeUserId } from "../utils/normalizeUserId";
import { isAbortError } from "../../../utils/http";

export function useActiveUsers({
  canViewActiveUsers,
  onResetState,
  onLoadError,
}) {
  const [activeUsers, setActiveUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const activeUsersAbortRef = useRef(null);

  const clearAbortController = useCallback(() => {
    if (activeUsersAbortRef.current) {
      activeUsersAbortRef.current.abort();
      activeUsersAbortRef.current = null;
    }
  }, []);

  const fetchActiveUsers = useCallback(
    async (params = {}) => {
      if (!canViewActiveUsers) {
        clearAbortController();
        setActiveUsers([]);
        if (onResetState) {
          onResetState();
        }
        setLoadingUsers(false);
        return;
      }

      if (activeUsersAbortRef.current) {
        activeUsersAbortRef.current.abort();
      }

      const controller = new AbortController();
      activeUsersAbortRef.current = controller;
      setLoadingUsers(true);

      try {
        const rawUsers = await fetchActiveUsersApi({
          params,
          signal: controller.signal,
        });

        const currentUserId = normalizeUserId(
          typeof window !== "undefined" ? localStorage.getItem("user_id") : null
        );

        const users = (Array.isArray(rawUsers) ? rawUsers : [])
          .filter((user) => {
            const userId = getUserIdentifier(user);
            return userId !== currentUserId;
          })
          .map((user) => ({
            ...user,
            profile_image: user.profile_image_url ?? user.profile_image,
          }));

        setActiveUsers(users);
        if (onResetState) {
          onResetState();
        }
      } catch (error) {
        if (!isAbortError(error)) {
          if (onLoadError) {
            onLoadError({ type: "error", key: "home.messages.loadActiveError" });
          }
        }
      } finally {
        if (activeUsersAbortRef.current === controller) {
          activeUsersAbortRef.current = null;
        }
        setLoadingUsers(false);
      }
    },
    [canViewActiveUsers, clearAbortController, onLoadError, onResetState]
  );

  useEffect(() => {
    return () => {
      clearAbortController();
    };
  }, [clearAbortController]);

  return {
    activeUsers,
    loadingUsers,
    fetchActiveUsers,
  };
}
