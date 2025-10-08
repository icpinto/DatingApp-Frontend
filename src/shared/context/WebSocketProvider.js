import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  extractUnreadCount as extractConversationUnreadCount,
  pickFirst,
  toNumberOrUndefined,
} from "../../utils/conversationUtils";
import {
  extractLastReadId,
  hasMessageChanged,
  normalizeMessage,
  normalizeMessageHistory,
  resolveConversationKey,
} from "../../utils/messageUtils";
import { useAccountLifecycle } from "./AccountLifecycleContext";
import { useUserCapabilities } from "./UserContext";
import { CAPABILITIES } from "../../domain/capabilities";
import { createWebSocketManager } from "../services/ws";

const WebSocketContext = createContext(null);

const ensureMessagesArray = (messages) =>
  Array.isArray(messages) ? messages : [];

const discardPendingDuplicates = (messages, formatted) => {
  if (!Array.isArray(messages) || messages.length === 0) {
    return ensureMessagesArray(messages);
  }

  if (formatted.client_msg_id) {
    const filtered = messages.filter(
      (messageItem) => messageItem.client_msg_id !== formatted.client_msg_id
    );
    return filtered.length === messages.length ? messages : filtered;
  }

  if (formatted.message_id && formatted.sender_id !== undefined) {
    const pendingIndex = messages.findIndex(
      (messageItem) =>
        !messageItem.message_id &&
        messageItem.sender_id === formatted.sender_id &&
        messageItem.body === formatted.body
    );

    if (pendingIndex !== -1) {
      return [
        ...messages.slice(0, pendingIndex),
        ...messages.slice(pendingIndex + 1),
      ];
    }
  }

  return messages;
};

const upsertMessageById = (messages, formatted) => {
  const normalizedMessages = ensureMessagesArray(messages);

  if (!formatted.message_id) {
    return { messages: normalizedMessages, changed: false, found: false };
  }

  const existingIndex = normalizedMessages.findIndex(
    (messageItem) => messageItem?.message_id === formatted.message_id
  );

  if (existingIndex === -1) {
    return {
      messages: [...normalizedMessages, formatted],
      changed: true,
      found: false,
    };
  }

  const mergedMessage = {
    ...normalizedMessages[existingIndex],
    ...formatted,
  };

  if (!hasMessageChanged(normalizedMessages[existingIndex], mergedMessage)) {
    return { messages: normalizedMessages, changed: false, found: true };
  }

  const nextMessages = [...normalizedMessages];
  nextMessages.splice(existingIndex, 1, mergedMessage);

  return { messages: nextMessages, changed: true, found: true };
};

export const WebSocketProvider = ({ children }) => {
  const wsClientRef = useRef(null);
  const [authToken, setAuthToken] = useState(() => localStorage.getItem("token"));
  const [conversations, setConversations] = useState({});
  const processedMessageIds = useRef(new Set());
  const joinedConversations = useRef(new Set());
  const [lastError, setLastError] = useState(null);
  const { isDeactivated, loading: lifecycleLoading } = useAccountLifecycle() ?? {};
  const { groups, hasCapability } = useUserCapabilities();
  const messagingAllowed = groups.messaging.viewInbox.can;
  const appShellAccessible = hasCapability
    ? hasCapability(CAPABILITIES.APP_VIEW_SHELL)
    : true;

  const resetMessagingState = useCallback(() => {
    processedMessageIds.current.clear();
    joinedConversations.current.clear();
    setConversations({});
    setLastError(null);
  }, []);

  const baseUrl = process.env.REACT_APP_CHAT_WS_URL || "http://localhost:8081";
  const wsUrl = baseUrl.replace(/^http/, "ws");

  if (!wsClientRef.current) {
    wsClientRef.current = createWebSocketManager(wsUrl, {
      reconnectDelay: 5000,
      pingInterval: 30000,
    });
  }
  const wsClient = wsClientRef.current;

  const send = useCallback(
    (data) => {
      if (!messagingAllowed) {
        return;
      }
      wsClientRef.current?.send(data);
    },
    [messagingAllowed]
  );

  const updateConversationState = useCallback((conversationId, updater) => {
    if (conversationId === undefined || conversationId === null) {
      return;
    }

    setConversations((prev) => {
      const key = String(conversationId);
      const existing = prev[key];
      const previous = existing || { messages: [], lastRead: null };
      const next = updater(previous);

      if (!next) {
        return prev;
      }

      if (existing && next === existing) {
        return prev;
      }

      if (!existing && next === previous) {
        return prev;
      }

      return {
        ...prev,
        [key]: next,
      };
    });
  }, []);

  const hydrateConversations = useCallback(
    (snapshotList) => {
      if (!messagingAllowed) {
        return;
      }

      if (!Array.isArray(snapshotList) || snapshotList.length === 0) {
        return;
      }

      snapshotList.forEach((snapshot) => {
        if (!snapshot || typeof snapshot !== "object") {
          return;
        }

        const conversationId = pickFirst(
          snapshot.id,
          snapshot.conversation_id,
          snapshot.conversationId,
          snapshot.conversationID
        );

        if (conversationId === undefined || conversationId === null) {
          return;
        }

        const lastReadId = extractLastReadId(snapshot);
        const unreadCount = toNumberOrUndefined(
          extractConversationUnreadCount(snapshot)
        );

        updateConversationState(conversationId, (existing = {}) => {
          const normalizedMessages = ensureMessagesArray(
            existing.messages || snapshot.messages
          );

          const mergedConversation = {
            ...existing,
            ...snapshot,
            messages: normalizedMessages,
          };

          if (lastReadId !== undefined && lastReadId !== null) {
            mergedConversation.lastRead = lastReadId;
          }

          if (unreadCount !== undefined && unreadCount !== null) {
            mergedConversation.__localUnreadCount = unreadCount;
            mergedConversation.unread_count = unreadCount;
            mergedConversation.unreadCount = unreadCount;
            mergedConversation.unread_messages_count = unreadCount;
          }

          return mergedConversation;
        });
      });
    },
    [messagingAllowed, updateConversationState]
  );

  const joinConversation = useCallback(
    (conversationId) => {
      if (!messagingAllowed) {
        return;
      }

      if (conversationId === undefined || conversationId === null) {
        return;
      }

      const key = String(conversationId);
      joinedConversations.current.add(key);
      send({ type: "join", conversation_id: key });
    },
    [messagingAllowed, send]
  );

  const leaveConversation = useCallback(
    (conversationId) => {
      if (!messagingAllowed) {
        return;
      }

      if (conversationId === undefined || conversationId === null) {
        return;
      }

      const key = String(conversationId);
      joinedConversations.current.delete(key);
      send({ type: "leave", conversation_id: key });
    },
    [messagingAllowed, send]
  );

  const setConversationHistory = useCallback(
    (conversationId, messages) => {
      if (!messagingAllowed) {
        return;
      }

      const normalizedMessages = normalizeMessageHistory(conversationId, messages, {
        pending: false,
      });

      normalizedMessages.forEach((message) => {
        if (message.message_id) {
          processedMessageIds.current.add(message.message_id);
        }
      });

      updateConversationState(conversationId, (conversation) => ({
        ...conversation,
        messages: normalizedMessages,
      }));
    },
    [messagingAllowed, updateConversationState]
  );

  const addLocalMessage = useCallback(
    (conversationId, message) => {
      if (!messagingAllowed) {
        return;
      }

      const normalized = normalizeMessage(conversationId, message, {
        pending: true,
      });

      updateConversationState(conversationId, (conversation) => {
        const history = ensureMessagesArray(conversation.messages);

        return {
          ...conversation,
          messages: [...history, normalized],
        };
      });
    },
    [messagingAllowed, updateConversationState]
  );

  const markRead = useCallback(
    (conversationId, messageId) => {
      if (!messagingAllowed) {
        return;
      }

      if (conversationId === undefined || conversationId === null) {
        return;
      }

      send({
        type: "read",
        conversation_id: String(conversationId),
        message_id: messageId,
      });

      updateConversationState(conversationId, (conversation) => {
        if (conversation.lastRead === messageId) {
          return conversation;
        }

        return {
          ...conversation,
          lastRead: messageId,
        };
      });
    },
    [messagingAllowed, send, updateConversationState]
  );

  const sendMessage = useCallback(
    (messageData) => {
      if (!messagingAllowed) {
        return;
      }
      send(messageData);
    },
    [messagingAllowed, send]
  );

  const processIncomingMessage = useCallback(
    (msg) => {
      if (!messagingAllowed) {
        return;
      }

      const payload = msg?.payload || {};
      const formatted = normalizeMessage(msg?.conversation_id, payload, {
        pending: false,
      });
      const conversationKey = resolveConversationKey(msg, formatted, payload);

      if (formatted.message_id) {
        if (processedMessageIds.current.has(formatted.message_id)) {
          return;
        }

        processedMessageIds.current.add(formatted.message_id);
      }

      if (!conversationKey) {
        return;
      }

      updateConversationState(conversationKey, (conversation) => {
        const existingMessages = ensureMessagesArray(conversation.messages);
        const withoutPending = discardPendingDuplicates(
          existingMessages,
          formatted
        );

        const { messages: merged, changed, found } = upsertMessageById(
          withoutPending,
          formatted
        );

        if (formatted.message_id) {
          if (!changed && found) {
            if (withoutPending !== existingMessages) {
              return {
                ...conversation,
                messages: withoutPending,
              };
            }

            return conversation;
          }

          return {
            ...conversation,
            messages: merged,
          };
        }

        if (withoutPending !== existingMessages) {
          return {
            ...conversation,
            messages: [...withoutPending, formatted],
          };
        }

        return {
          ...conversation,
          messages: [...existingMessages, formatted],
        };
      });
    },
    [messagingAllowed, updateConversationState]
  );

  const processConversationUpdate = useCallback(
    (msg) => {
      if (!messagingAllowed) {
        return;
      }

      const payload = msg?.payload || {};
      const messagePayload =
        pickFirst(
          payload.message,
          payload.last_message,
          payload.latest_message,
          payload.lastMessage,
          payload.latestMessage
        ) || payload;

      const formatted = normalizeMessage(msg?.conversation_id, messagePayload, {
        pending: false,
      });

      const conversationKey = resolveConversationKey(msg, formatted, payload);

      if (formatted.message_id) {
        processedMessageIds.current.add(formatted.message_id);
      }

      if (!conversationKey) {
        return;
      }

      const lastReadId = extractLastReadId(payload);
      const unreadFromPayload = extractConversationUnreadCount(payload);
      const normalizedUnread = toNumberOrUndefined(unreadFromPayload);
      const formattedMessageId = toNumberOrUndefined(formatted.message_id);

      updateConversationState(conversationKey, (conversation) => {
        const existingMessages = ensureMessagesArray(conversation.messages);
        const withoutPending = discardPendingDuplicates(
          existingMessages,
          formatted
        );

        let nextMessages = withoutPending;
        let messagesChanged = false;

        if (formatted.message_id) {
          const { messages: mergedMessages, changed } = upsertMessageById(
            withoutPending,
            formatted
          );

          if (changed) {
            nextMessages = mergedMessages;
            messagesChanged = true;
          }
        }

        const previousLastRead = conversation.lastRead;
        let nextLastRead = previousLastRead;
        let lastReadChanged = false;

        if (
          lastReadId !== undefined &&
          lastReadId !== null &&
          (previousLastRead === undefined ||
            previousLastRead === null ||
            lastReadId > previousLastRead)
        ) {
          nextLastRead = lastReadId;
          lastReadChanged = true;
        }

        const previousUnread = toNumberOrUndefined(
          extractConversationUnreadCount(conversation)
        );
        let nextUnread = previousUnread;
        let unreadChanged = false;

        if (
          normalizedUnread !== undefined &&
          normalizedUnread !== null &&
          normalizedUnread !== previousUnread
        ) {
          nextUnread = normalizedUnread;
          unreadChanged = true;
        }

        if (!messagesChanged && !lastReadChanged && !unreadChanged) {
          if (withoutPending !== existingMessages) {
            return {
              ...conversation,
              messages: withoutPending,
            };
          }

          return conversation;
        }

        const updatedConversation = {
          ...conversation,
          messages: messagesChanged ? nextMessages : withoutPending,
        };

        if (formattedMessageId !== undefined && formattedMessageId !== null) {
          updatedConversation.__lastMessageId = formattedMessageId;
          updatedConversation.last_message_id = formattedMessageId;
          updatedConversation.lastMessageId = formattedMessageId;
          updatedConversation.message_id = formattedMessageId;
        }

        if (lastReadChanged) {
          updatedConversation.lastRead = nextLastRead;
          updatedConversation.last_read_message_id = nextLastRead;
          updatedConversation.lastReadMessageId = nextLastRead;
        }

        if (unreadChanged) {
          updatedConversation.__localUnreadCount = nextUnread;
          updatedConversation.unread_count = nextUnread;
          updatedConversation.unreadCount = nextUnread;
          updatedConversation.unread_messages_count = nextUnread;
        }

        return updatedConversation;
      });
    },
    [messagingAllowed, updateConversationState]
  );

  const processReadReceipt = useCallback(
    (msg) => {
      if (!messagingAllowed) {
        return;
      }

      if (
        !msg ||
        msg.conversation_id === undefined ||
        msg.conversation_id === null
      ) {
        return;
      }

      updateConversationState(msg.conversation_id, (conversation) => {
        if (conversation.lastRead === msg.message_id) {
          return conversation;
        }

        return {
          ...conversation,
          lastRead: msg.message_id,
        };
      });
    },
    [messagingAllowed, updateConversationState]
  );

  const handleServerError = useCallback((msg) => {
    console.error("WebSocket server error:", msg?.error);
    setLastError(msg?.error || null);
  }, []);

  const messageHandlers = useMemo(
    () => ({
      message: processIncomingMessage,
      conversation_updated: processConversationUpdate,
      read: processReadReceipt,
      error: handleServerError,
    }),
    [
      handleServerError,
      processConversationUpdate,
      processIncomingMessage,
      processReadReceipt,
    ]
  );

  const handleMessage = useCallback(
    (event) => {
      try {
        const msg = JSON.parse(event.data);
        const handler = messageHandlers[msg.type];

        if (handler) {
          handler(msg);
        }
      } catch (error) {
        console.error("Failed to parse WebSocket message", error);
      }
    },
    [messageHandlers]
  );

  useEffect(() => {
    const handleTokenChange = () => {
      const nextToken = localStorage.getItem("token");
      setAuthToken(nextToken);
    };

    window.addEventListener("storage", handleTokenChange);
    window.addEventListener("auth-token-changed", handleTokenChange);

    return () => {
      window.removeEventListener("storage", handleTokenChange);
      window.removeEventListener("auth-token-changed", handleTokenChange);
    };
  }, []);

  useEffect(() => {
    wsClient.setHandlers({
      onOpen: () => {
        joinedConversations.current.forEach((id) =>
          wsClient.send({ type: "join", conversation_id: id })
        );
      },
      onMessage: handleMessage,
      onError: (error) => {
        console.error("WebSocket error:", error);
      },
      onClose: () => {
        // rely on state resets via reconnection logic
      },
    });
  }, [handleMessage, wsClient]);

  useEffect(() => {
    wsClient.updateToken(authToken);
    if (!authToken) {
      resetMessagingState();
    }
  }, [authToken, resetMessagingState, wsClient]);

  useEffect(() => {
    const capabilityEnabled =
      messagingAllowed &&
      !isDeactivated &&
      !lifecycleLoading &&
      appShellAccessible &&
      Boolean(authToken);

    wsClient.setCapabilityEnabled(
      messagingAllowed && !isDeactivated && !lifecycleLoading && appShellAccessible
    );

    if (!messagingAllowed || !appShellAccessible) {
      resetMessagingState();
    }

    if (!capabilityEnabled) {
      if (!appShellAccessible) {
        wsClient.shutdown();
      } else {
        wsClient.disconnect();
      }
      return;
    }

    wsClient.connect(authToken);
  }, [
    authToken,
    appShellAccessible,
    isDeactivated,
    lifecycleLoading,
    messagingAllowed,
    resetMessagingState,
    wsClient,
  ]);

  useEffect(() => () => {
    wsClient.disconnect();
  }, [wsClient]);

  const shutdown = useCallback(() => {
    wsClient.shutdown();
    resetMessagingState();
  }, [resetMessagingState, wsClient]);

  const totalUnreadCount = useMemo(() => {
    if (!conversations || typeof conversations !== "object") {
      return 0;
    }

    return Object.values(conversations).reduce((sum, conversation) => {
      if (!conversation || typeof conversation !== "object") {
        return sum;
      }

      const unread = toNumberOrUndefined(
        extractConversationUnreadCount(conversation)
      );

      return sum + (unread ?? 0);
    }, 0);
  }, [conversations]);

  const contextValue = useMemo(
    () => ({
      conversations,
      lastError,
      joinConversation,
      leaveConversation,
      sendMessage,
      markRead,
      setConversationHistory,
      addLocalMessage,
      hydrateConversations,
      totalUnreadCount,
      shutdown,
    }),
    [
      conversations,
      lastError,
      joinConversation,
      leaveConversation,
      sendMessage,
      markRead,
      setConversationHistory,
      addLocalMessage,
      hydrateConversations,
      totalUnreadCount,
      shutdown,
    ]
  );

  return (
    <WebSocketContext.Provider value={contextValue}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => useContext(WebSocketContext);
