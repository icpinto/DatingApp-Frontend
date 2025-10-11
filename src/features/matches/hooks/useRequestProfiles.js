import { useEffect, useState } from "react";

import useCapabilityEffect from "../../../shared/hooks/useCapabilityEffect";
import { trackExternalRequest } from "../../../shared/services/api";
import { isAbortError } from "../../../utils/http";
import { fetchProfile } from "../api/requests.api";

export const useRequestProfiles = ({
  requests,
  canView,
  capability,
  getUserId,
}) => {
  const [profiles, setProfiles] = useState({});
  const enabled = canView && requests.length > 0;

  useEffect(() => {
    if (!enabled) {
      setProfiles({});
    }
  }, [enabled]);

  useCapabilityEffect(
    capability,
    () => {
      const controller = new AbortController();
      const unregister = trackExternalRequest(controller);

      const fetchProfiles = async () => {
        const profilesData = {};

        await Promise.all(
          requests.map(async (request) => {
            const userId = getUserId(request);
            if (!userId) {
              return;
            }

            try {
              const response = await fetchProfile(userId, {
                signal: controller.signal,
              });
              profilesData[userId] = response.data;
            } catch (error) {
              if (isAbortError(error)) {
                return;
              }
              profilesData[userId] = null;
            }
          })
        );

        setProfiles(profilesData);
      };

      fetchProfiles();

      return () => {
        unregister();
        controller.abort();
      };
    },
    [requests, getUserId],
    { enabled }
  );

  return profiles;
};
