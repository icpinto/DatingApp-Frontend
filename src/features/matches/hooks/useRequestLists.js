import { useCallback, useEffect, useState } from "react";

import { CAPABILITIES } from "../../../domain/capabilities";
import useCapabilityEffect from "../../../shared/hooks/useCapabilityEffect";
import { trackExternalRequest } from "../../../shared/services/api";
import { isAbortError } from "../../../utils/http";
import { fetchReceivedRequests, fetchSentRequests } from "../api/requests.api";
import { normalizeRequests } from "../model/requests";

export const useRequestLists = ({
  canViewReceived,
  canViewSent,
  onRequestCountChange,
}) => {
  const [requests, setRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [receivedError, setReceivedError] = useState(null);
  const [sentError, setSentError] = useState(null);

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
        operations.push(
          fetchReceivedRequests({ signal: controller.signal })
        );
      }

      if (canViewSent) {
        operations.push(fetchSentRequests({ signal: controller.signal }));
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
      onRequestCountChange?.(0);
      return;
    }

    onRequestCountChange?.(requests.length);
  }, [requests, onRequestCountChange, canViewReceived]);

  const removeReceivedRequest = useCallback((id) => {
    setRequests((prev) => prev.filter((request) => request.id !== id));
  }, []);

  return {
    requests,
    sentRequests,
    loading,
    receivedError,
    sentError,
    removeReceivedRequest,
  };
};
