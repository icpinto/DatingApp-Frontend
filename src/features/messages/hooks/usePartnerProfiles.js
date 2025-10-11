import { useEffect, useState } from "react";

import api from "../../../shared/services/api";
import { isAbortError } from "../../../utils/http";
import { toNumberOrUndefined } from "../../../utils/conversationUtils";
import { getConversationPartnerDetails } from "../utils/conversationDisplayHelpers";

const usePartnerProfiles = ({
  conversations,
  canViewPartnerStatus,
  chatDisabled,
  normalizedCurrentUserId,
}) => {
  const [profiles, setProfiles] = useState({});

  useEffect(() => {
    if (
      chatDisabled ||
      !canViewPartnerStatus ||
      !Array.isArray(conversations) ||
      conversations.length === 0
    ) {
      setProfiles({});
      return;
    }

    let isActive = true;
    const controller = new AbortController();

    const fetchProfiles = async () => {
      const token = localStorage.getItem("token");
      const uniqueIds = new Set();

      conversations.forEach((conv) => {
        const { otherUserId } = getConversationPartnerDetails(
          conv,
          normalizedCurrentUserId
        );

        if (
          otherUserId !== undefined &&
          otherUserId !== null &&
          otherUserId !== normalizedCurrentUserId
        ) {
          uniqueIds.add(otherUserId);
        }
      });

      if (uniqueIds.size === 0) {
        if (isActive) {
          setProfiles({});
        }
        return;
      }

      const profilesData = {};

      await Promise.all(
        Array.from(uniqueIds)
          .map((id) => toNumberOrUndefined(id))
          .filter(
            (id) =>
              id !== undefined && id !== null && id !== normalizedCurrentUserId
          )
          .map(async (id) => {
            try {
              const res = await api.get(`/user/profile/${id}`, {
                headers: { Authorization: `${token}` },
                signal: controller.signal,
              });
              profilesData[id] = res.data;
            } catch (error) {
              if (!isAbortError(error)) {
                // ignore individual profile fetch errors
              }
            }
          })
      );

      if (isActive) {
        setProfiles(profilesData);
      }
    };

    fetchProfiles();

    return () => {
      isActive = false;
      controller.abort();
    };
  }, [
    canViewPartnerStatus,
    chatDisabled,
    conversations,
    normalizedCurrentUserId,
  ]);

  return profiles;
};

export default usePartnerProfiles;
