import { useCallback, useEffect, useState } from "react";

import { CAPABILITIES } from "../../../domain/capabilities";
import useCapabilityEffect from "../../../shared/hooks/useCapabilityEffect";
import { trackExternalRequest } from "../../../shared/services/api";
import { isAbortError } from "../../../utils/http";
import {
  acceptMatchRequest,
  fetchReceivedRequests,
  fetchSentRequests,
  rejectMatchRequest,
} from "../api/requests.api";
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
  const [actionFeedback, setActionFeedback] = useState(null);
  const [actionInProgress, setActionInProgress] = useState(false);

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

  const clearActionFeedback = useCallback(() => {
    setActionFeedback(null);
  }, []);

  const handleRequestMutation = useCallback(
    async (id, mutation, successMessage, errorMessage) => {
      if (!id) {
        return;
      }

      setActionInProgress(true);
      try {
        await mutation(id);
        removeReceivedRequest(id);
        setActionFeedback({ severity: "success", messageKey: successMessage });
      } catch (error) {
        if (!isAbortError(error)) {
          setActionFeedback({ severity: "error", messageKey: errorMessage });
        }
      } finally {
        setActionInProgress(false);
      }
    },
    [removeReceivedRequest]
  );

  const acceptRequest = useCallback(
    (id) =>
      handleRequestMutation(
        id,
        acceptMatchRequest,
        "requests.messages.acceptSuccess",
        "requests.messages.acceptFailed"
      ),
    [handleRequestMutation]
  );

  const rejectRequest = useCallback(
    (id) =>
      handleRequestMutation(
        id,
        rejectMatchRequest,
        "requests.messages.rejectSuccess",
        "requests.messages.rejectFailed"
      ),
    [handleRequestMutation]
  );

  return {
    requests,
    sentRequests,
    loading,
    receivedError,
    sentError,
    removeReceivedRequest,
    acceptRequest,
    rejectRequest,
    actionFeedback,
    clearActionFeedback,
    actionInProgress,
  };
};
