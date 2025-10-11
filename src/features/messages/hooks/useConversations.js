import { useCallback, useEffect, useState } from "react";

import chatService from "../../../shared/services/chatService";
import {
  flattenConversationEntry,
  normalizeConversationList,
} from "../../../utils/conversationUtils";
import { isAbortError } from "../../../utils/http";

const useConversations = ({
  canViewInbox,
  canViewConversationList,
  chatDisabled,
  hydrateConversations,
}) => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const resetState = useCallback(() => {
    setConversations([]);
    setError(null);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!canViewInbox || !canViewConversationList || chatDisabled) {
      resetState();
      return;
    }

    let isActive = true;
    const controller = new AbortController();

    const fetchConversations = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const response = await chatService.get("/conversations", {
          headers: {
            Authorization: `${token}`,
          },
          signal: controller.signal,
        });

        const normalized = normalizeConversationList(response.data)
          .map(flattenConversationEntry)
          .filter(Boolean);

        if (isActive) {
          setConversations(normalized);
          setError(null);
        }

        hydrateConversations(normalized);
      } catch (err) {
        if (isAbortError(err)) {
          return;
        }

        if (isActive) {
          setError("Failed to fetch conversations");
        }
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    };

    fetchConversations();

    return () => {
      isActive = false;
      controller.abort();
    };
  }, [
    canViewConversationList,
    canViewInbox,
    chatDisabled,
    hydrateConversations,
    resetState,
  ]);

  return { conversations, setConversations, loading, error };
};

export default useConversations;
