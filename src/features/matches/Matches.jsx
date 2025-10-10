import React, { useEffect, useState } from "react";
import { Container, Stack } from "@mui/material";

import api, { trackExternalRequest } from "../../shared/services/api";
import { spacing } from "../../styles";
import { useTranslation } from "../../i18n";
import { useAccountLifecycle } from "../../shared/context/AccountLifecycleContext";
import { CAPABILITIES } from "../../domain/capabilities";
import Guard from "./Guard";
import { useUserCapabilities } from "../../shared/context/UserContext";
import { isAbortError } from "../../utils/http";
import useCapabilityEffect from "../../shared/hooks/useCapabilityEffect";
import IncomingRequestsList from "./components/IncomingRequestsList";
import SentRequestsList from "./components/SentRequestsList";

const normalizeRequests = (payload) => {
  if (!payload) return [];
  if (Array.isArray(payload.requests)) return payload.requests;
  if (Array.isArray(payload.data)) return payload.data;
  if (Array.isArray(payload)) return payload;
  return [];
};

function MatchesContent({ onRequestCountChange = () => {}, accountLifecycle }) {
  const [requests, setRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [receivedError, setReceivedError] = useState(null);
  const [sentError, setSentError] = useState(null);
  const [profiles, setProfiles] = useState({});
  const [sentProfiles, setSentProfiles] = useState({});
  const { groups } = useUserCapabilities();
  const { t } = useTranslation();

  const requestCapabilities = groups.requests;
  const canViewReceived = requestCapabilities.viewReceived.can;
  const canViewSent = requestCapabilities.viewSent.can;
  const canRespond = requestCapabilities.respond.can;
  const isDeactivated = accountLifecycle?.isDeactivated;

  useCapabilityEffect(
    [
      canViewReceived ? CAPABILITIES.REQUESTS_VIEW_RECEIVED : null,
      canViewSent ? CAPABILITIES.REQUESTS_VIEW_SENT : null,
    ],
    () => {
      if (!canViewReceived && !canViewSent) {
        setLoading(false);
        setRequests([]);
        setSentRequests([]);
        setReceivedError(null);
        setSentError(null);
        return undefined;
      }

      let isMounted = true;
      setLoading(true);
      const controller = new AbortController();
      const unregister = trackExternalRequest(controller);
      const operations = [];

      if (canViewReceived) {
        operations.push(api.get("/user/requests", { signal: controller.signal }));
      }

      if (canViewSent) {
        operations.push(
          api.get("user/sentRequests", { signal: controller.signal })
        );
      }

      const handleResults = async () => {
        const results = await Promise.allSettled(operations);
        let index = 0;

        if (canViewReceived) {
          const result = results[index++];
          if (isMounted) {
            if (result.status === "fulfilled") {
              setRequests(normalizeRequests(result.value.data));
              setReceivedError(null);
            } else if (!isAbortError(result.reason)) {
              setRequests([]);
              setReceivedError("requests.messages.receivedError");
            }
          }
        } else if (isMounted) {
          setRequests([]);
          setReceivedError(null);
        }

        if (canViewSent) {
          const result = results[index++];
          if (isMounted) {
            if (result.status === "fulfilled") {
              setSentRequests(normalizeRequests(result.value.data));
              setSentError(null);
            } else if (!isAbortError(result.reason)) {
              setSentRequests([]);
              setSentError("requests.messages.sentError");
            }
          }
        } else if (isMounted) {
          setSentRequests([]);
          setSentError(null);
        }

        if (isMounted) {
          setLoading(false);
        }
      };

      handleResults();

      return () => {
        isMounted = false;
        unregister();
        controller.abort();
      };
    },
    [canViewReceived, canViewSent],
    { enabled: canViewReceived || canViewSent }
  );

  useEffect(() => {
    if (!canViewReceived) {
      onRequestCountChange(0);
      return;
    }
    onRequestCountChange(requests.length);
  }, [requests, onRequestCountChange, canViewReceived]);

  useCapabilityEffect(
    CAPABILITIES.REQUESTS_VIEW_RECEIVED,
    () => {
      if (!canViewReceived || requests.length === 0) {
        setProfiles({});
        return undefined;
      }

      const controller = new AbortController();
      const unregister = trackExternalRequest(controller);

      const fetchProfiles = async () => {
        const profilesData = {};
        await Promise.all(
          requests.map(async (req) => {
            try {
              const res = await api.get(`/user/profile/${req.sender_id}`, {
                signal: controller.signal,
              });
              profilesData[req.sender_id] = res.data;
            } catch (e) {
              if (isAbortError(e)) {
                return;
              }
              profilesData[req.sender_id] = null;
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
    [requests, canViewReceived],
    { enabled: canViewReceived && requests.length > 0 }
  );

  useCapabilityEffect(
    CAPABILITIES.REQUESTS_VIEW_SENT,
    () => {
      if (!canViewSent || sentRequests.length === 0) {
        setSentProfiles({});
        return undefined;
      }

      const controller = new AbortController();
      const unregister = trackExternalRequest(controller);

      const fetchSentProfiles = async () => {
        const profilesData = {};
        await Promise.all(
          sentRequests.map(async (req) => {
            if (!req.receiver_id) return;
            try {
              const res = await api.get(`/user/profile/${req.receiver_id}`, {
                signal: controller.signal,
              });
              profilesData[req.receiver_id] = res.data;
            } catch (e) {
              if (isAbortError(e)) {
                return;
              }
              profilesData[req.receiver_id] = null;
            }
          })
        );
        setSentProfiles(profilesData);
      };

      fetchSentProfiles();

      return () => {
        unregister();
        controller.abort();
      };
    },
    [sentRequests, canViewSent],
    { enabled: canViewSent && sentRequests.length > 0 }
  );

  const handleAccept = async (id) => {
    if (!canRespond) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await api.post(
        `/user/acceptRequest`,
        { id: parseInt(id, 10) },
        {
          headers: {
            Authorization: `${token}`,
          },
        }
      );
      setRequests((prev) => prev.filter((request) => request.id !== id));
    } catch (err) {
      alert(t("requests.messages.acceptFailed"));
    }
  };

  const handleReject = async (id) => {
    if (!canRespond) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await api.post(
        `/user/rejectRequest`,
        { id: parseInt(id, 10) },
        {
          headers: {
            Authorization: `${token}`,
          },
        }
      );
      setRequests((prev) => prev.filter((request) => request.id !== id));
    } catch (err) {
      alert(t("requests.messages.rejectFailed"));
    }
  };

  return (
    <Container sx={{ p: spacing.pagePadding }}>
      <Stack spacing={spacing.section}>
        <Guard can={CAPABILITIES.REQUESTS_VIEW_RECEIVED}>
          <IncomingRequestsList
            requests={requests}
            profiles={profiles}
            loading={loading}
            error={receivedError}
            canRespond={canRespond}
            isDeactivated={isDeactivated}
            onAccept={handleAccept}
            onReject={handleReject}
          />
        </Guard>
        <Guard can={CAPABILITIES.REQUESTS_VIEW_SENT}>
          <SentRequestsList
            requests={sentRequests}
            profiles={sentProfiles}
            loading={loading}
            error={sentError}
          />
        </Guard>
      </Stack>
    </Container>
  );
}

function Matches(props) {
  const accountLifecycle = useAccountLifecycle();

  return <MatchesContent {...props} accountLifecycle={accountLifecycle} />;
}

export default Matches;
