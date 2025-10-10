import { useEffect, useMemo, useState } from "react";
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "../../../shared/lib/react-query";
import * as api from "../api/messages.api";
import { createEmptyThread } from "../model/types";
import { useWebSocket } from "../../../shared/context/WebSocketProvider";

export const keys = {
  conversations: ["messages", "conversations"],
  thread: (id) => ["messages", "thread", id],
};

const getConversationById = (conversations, id) => {
  if (!id) {
    return null;
  }
  const normalizedId = String(id);
  return (Array.isArray(conversations) ? conversations : []).find((item) => {
    if (!item) {
      return false;
    }
    const itemId = item.id ?? item.conversationId ?? item.conversation_id;
    return itemId !== undefined && String(itemId) === normalizedId;
  }) || null;
};

export function useConversations() {
  const [activeId, setActiveId] = useState(null);
  const { hydrateConversations } = useWebSocket();
  const query = useQuery({
    queryKey: keys.conversations,
    queryFn: api.getConversations,
  });

  useEffect(() => {
    if (activeId || !Array.isArray(query.data) || query.data.length === 0) {
      return;
    }
    const first = query.data[0];
    if (first?.id) {
      setActiveId(String(first.id));
    }
  }, [activeId, query.data]);

  useEffect(() => {
    if (typeof hydrateConversations !== "function") {
      return;
    }
    if (!Array.isArray(query.data) || query.data.length === 0) {
      return;
    }
    hydrateConversations(query.data);
  }, [hydrateConversations, query.data]);

  return {
    conversations: Array.isArray(query.data) ? query.data : [],
    isLoadingConversations: query.isLoading,
    activeId,
    setActiveId,
    refetchConversations: query.refetch,
  };
}

export function useThread(conversationId) {
  const qc = useQueryClient();
  const threadQuery = useQuery({
    queryKey: keys.thread(conversationId ?? "none"),
    queryFn: () => api.getThread(conversationId),
    enabled: Boolean(conversationId),
  });

  const conversation = useMemo(() => {
    const cached = qc.getQueryData(keys.conversations) || [];
    return getConversationById(cached, conversationId);
  }, [qc, conversationId]);

  const send = useMutation({
    mutationFn: (payload) =>
      api.sendMessage(payload.conversationId, payload.text),
    onSuccess: (_result, variables) => {
      qc.invalidateQueries({ queryKey: keys.thread(variables.conversationId) });
      qc.invalidateQueries({ queryKey: keys.conversations });
    },
  });

  const block = useMutation({
    mutationFn: (peerId) => api.blockUser(peerId),
    onSuccess: () => {
      if (conversationId) {
        qc.invalidateQueries({ queryKey: keys.thread(conversationId) });
        qc.invalidateQueries({ queryKey: keys.conversations });
      }
    },
  });

  const close = useMutation({
    mutationFn: (id) => api.closeThread(id),
    onSuccess: () => {
      if (conversationId) {
        qc.invalidateQueries({ queryKey: keys.conversations });
        qc.invalidateQueries({ queryKey: keys.thread(conversationId) });
      }
    },
  });

  const threadData = threadQuery.data;
  const normalizedThread = useMemo(() => {
    if (!conversationId) {
      return createEmptyThread();
    }

    if (!threadData) {
      return {
        conversation,
        messages: [],
        peerStatus: undefined,
        blocked: conversation?.blocked ?? false,
      };
    }

    if (Array.isArray(threadData)) {
      return {
        conversation,
        messages: threadData,
        peerStatus: undefined,
        blocked: conversation?.blocked ?? false,
      };
    }

    const messages = Array.isArray(threadData.messages)
      ? threadData.messages
      : [];

    return {
      conversation: threadData.conversation || conversation,
      messages,
      peerStatus: threadData.peerStatus,
      blocked:
        typeof threadData.blocked === "boolean"
          ? threadData.blocked
          : conversation?.blocked ?? false,
    };
  }, [conversation, conversationId, threadData]);

  return {
    thread: conversationId ? normalizedThread : null,
    isLoadingThread: threadQuery.isLoading,
    threadError: threadQuery.error,
    sendMessage: (text) =>
      send.mutateAsync({
        conversationId,
        text,
      }),
    blockUser: (peerId) => block.mutateAsync(peerId),
    closeThread: (id) => close.mutateAsync(id ?? conversationId),
    isSending: send.isPending,
    isBlocking: block.isPending,
    isClosing: close.isPending,
  };
}
