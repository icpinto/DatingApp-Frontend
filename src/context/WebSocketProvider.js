import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { extractUnreadCount as extractConversationUnreadCount } from "../utils/conversationUtils";

const pickFirst = (...values) =>
  values.find((value) => value !== undefined && value !== null);

const toNumberOrUndefined = (value) => {
  if (value === undefined || value === null) return undefined;
  const numeric = Number(value);
  return Number.isNaN(numeric) ? undefined : numeric;
};

const toStringOrUndefined = (value) => {
  if (value === undefined || value === null) return undefined;
  return String(value);
};

const extractTimestamp = (value) => {
  if (!value && value !== 0) {
    return null;
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  return value;
};

const hasMessageChanged = (previous = {}, next = {}) => {
  const allKeys = new Set([
    ...Object.keys(previous || {}),
    ...Object.keys(next || {}),
  ]);

  for (const key of allKeys) {
    if (previous?.[key] !== next?.[key]) {
      return true;
    }
  }

  return false;
};

const normalizeMessage = (conversationId, message = {}, overrides = {}) => {
  const conversation_id =
    toNumberOrUndefined(
      pickFirst(
        message.conversation_id,
        message.conversationId,
        message.ConversationID,
        message.ConversationId
      )
    ) ?? toNumberOrUndefined(conversationId);

  const message_id = toStringOrUndefined(
    pickFirst(
      message.message_id,
      message.id,
      message.ID,
      message.MessageID,
      message.MessageId
    )
  );

  const client_msg_id = toStringOrUndefined(
    pickFirst(
      message.client_msg_id,
      message.clientMsgId,
      message.clientMsgID,
      message.ClientMsgId,
      message.ClientMsgID,
      message.temp_id,
      message.tempId
    )
  );

  const sender_id = toNumberOrUndefined(
    pickFirst(
      message.sender_id,
      message.senderId,
      message.SenderID,
      message.SenderId,
      message.user_id,
      message.UserID,
      message.UserId,
      message.sender?.id,
      message.sender?.user_id,
      message.sender?.userId,
      message.user?.id,
      message.user?.user_id,
      message.user?.userId,
      message.author?.id,
      message.author?.user_id,
      message.author?.userId
    )
  );

  const receiver_id = toNumberOrUndefined(
    pickFirst(
      message.receiver_id,
      message.receiverId,
      message.ReceiverID,
      message.ReceiverId,
      message.to,
      message.to_id,
      message.ToID,
      message.ToId,
      message.receiver?.id,
      message.receiver?.user_id,
      message.receiver?.userId,
      message.recipient?.id,
      message.recipient?.user_id,
      message.recipient?.userId
    )
  );

  const body = pickFirst(message.body, message.message, message.Body, "");
  const mime_type = pickFirst(
    message.mime_type,
    message.mimeType,
    message.MimeType,
    "text/plain"
  );

  const timestamp = extractTimestamp(
    pickFirst(
      message.timestamp,
      message.created_at,
      message.createdAt,
      message.CreatedAt,
      message.sent_at,
      message.sentAt,
      message.SentAt
    )
  );

  return {
    conversation_id,
    message_id,
    client_msg_id,
    sender_id,
    receiver_id,
    body,
    mime_type,
    timestamp,
    ...overrides,
  };
};

const extractLastReadId = (payload = {}) =>
  toNumberOrUndefined(
    pickFirst(
      payload.last_read_message_id,
      payload.lastReadMessageId,
      payload.last_read?.message_id,
      payload.last_read?.messageId,
      payload.lastRead?.message_id,
      payload.lastRead?.messageId
    )
  );

const resolveConversationKey = (
  msg = {},
  formattedMessage = {},
  payload = {}
) => {
  const candidate = pickFirst(
    msg.conversation_id,
    payload.conversation_id,
    payload.conversationId,
    payload.conversationID,
    formattedMessage.conversation_id
  );

  if (candidate === undefined || candidate === null) {
    return null;
  }

  return String(candidate);
};

const WebSocketContext = createContext(null);

export const WebSocketProvider = ({ children }) => {
  const ws = useRef(null);
  const reconnectTimeout = useRef(null);
  const shouldReconnect = useRef(true);

  const [authToken, setAuthToken] = useState(() => localStorage.getItem("token"));
  const latestTokenRef = useRef(authToken);
  const [conversations, setConversations] = useState({});
  const processedMessageIds = useRef(new Set());
  const joinedConversations = useRef(new Set());
  const [lastError, setLastError] = useState(null);

  const baseUrl =
    process.env.REACT_APP_CHAT_WS_URL || "http://localhost:8081";
  const wsUrl = baseUrl.replace(/^http/, "ws");

  const send = useCallback((data) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(data));
    }
  }, []);

  const joinConversation = useCallback(
    (conversationId) => {
      joinedConversations.current.add(String(conversationId));
      send({ type: "join", conversation_id: String(conversationId) });
    },
    [send]
  );

  const leaveConversation = useCallback(
    (conversationId) => {
      joinedConversations.current.delete(String(conversationId));
      send({ type: "leave", conversation_id: String(conversationId) });
    },
    [send]
  );

  const setConversationHistory = useCallback((conversationId, msgs) => {
    setConversations((prev) => {
      const convo = prev[conversationId] || { messages: [], lastRead: null };
      const normalizedMessages = Array.isArray(msgs)
        ? msgs.map((message) =>
            normalizeMessage(conversationId, message, { pending: false })
          )
        : [];

      normalizedMessages.forEach((message) => {
        if (message.message_id) {
          processedMessageIds.current.add(message.message_id);
        }
      });

      return {
        ...prev,
        [conversationId]: {
          ...convo,
          messages: normalizedMessages,
        },
      };
    });
  }, []);

  const addLocalMessage = useCallback((conversationId, message) => {
    const normalized = normalizeMessage(conversationId, message, {
      pending: true,
    });

    setConversations((prev) => {
      const convo = prev[conversationId] || { messages: [], lastRead: null };
      return {
        ...prev,
        [conversationId]: {
          ...convo,
          messages: [...convo.messages, normalized],
        },
      };
    });
  }, []);

  const markRead = useCallback(
    (conversationId, messageId) => {
      send({
        type: "read",
        conversation_id: String(conversationId),
        message_id: messageId,
      });
      setConversations((prev) => {
        const convo = prev[conversationId] || { messages: [], lastRead: null };
        return {
          ...prev,
          [conversationId]: { ...convo, lastRead: messageId },
        };
      });
    },
    [send]
  );

  const sendMessage = useCallback((messageData) => send(messageData), [send]);

  const handleMessage = (event) => {
    const msg = JSON.parse(event.data);

    switch (msg.type) {
      case "message": {
        const payload = msg.payload || {};
        const formatted = normalizeMessage(msg.conversation_id, payload, {
          pending: false,
        });
        const id = formatted.message_id;

        if (id && processedMessageIds.current.has(id)) {
          break;
        }

        if (id) {
          processedMessageIds.current.add(id);
        }

        setConversations((prev) => {
          let conversationKey = null;

          if (msg.conversation_id !== undefined && msg.conversation_id !== null) {
            conversationKey = String(msg.conversation_id);
          } else if (
            formatted.conversation_id !== undefined &&
            formatted.conversation_id !== null
          ) {
            conversationKey = String(formatted.conversation_id);
          }

          if (!conversationKey) {
            return prev;
          }

          const convo = prev[conversationKey] || {
            messages: [],
            lastRead: null,
          };
          let updatedMessages = [...convo.messages];

          if (formatted.client_msg_id) {
            updatedMessages = updatedMessages.filter(
              (messageItem) =>
                messageItem.client_msg_id !== formatted.client_msg_id
            );
          } else if (formatted.message_id && formatted.sender_id !== undefined) {
            const pendingIndex = updatedMessages.findIndex(
              (messageItem) =>
                !messageItem.message_id &&
                messageItem.sender_id === formatted.sender_id &&
                messageItem.body === formatted.body
            );

            if (pendingIndex !== -1) {
              updatedMessages.splice(pendingIndex, 1);
            }
          }

          if (formatted.message_id) {
            const existingIndex = updatedMessages.findIndex(
              (messageItem) => messageItem.message_id === formatted.message_id
            );

            if (existingIndex !== -1) {
              const mergedMessage = {
                ...updatedMessages[existingIndex],
                ...formatted,
              };
              updatedMessages.splice(existingIndex, 1, mergedMessage);

              return {
                ...prev,
                [conversationKey]: { ...convo, messages: updatedMessages },
              };
            }
          }

          updatedMessages.push(formatted);

          return {
            ...prev,
            [conversationKey]: { ...convo, messages: updatedMessages },
          };
        });
        break;
      }
      case "conversation_updated": {
        const payload = msg.payload || {};
        const messagePayload =
          pickFirst(
            payload.message,
            payload.last_message,
            payload.latest_message,
            payload.lastMessage,
            payload.latestMessage
          ) || payload;
        const formatted = normalizeMessage(msg.conversation_id, messagePayload, {
          pending: false,
        });
        let conversationKey = resolveConversationKey(msg, formatted, payload);
        if (!conversationKey) {
          const nestedConversation = pickFirst(
            payload.conversation,
            payload.data?.conversation,
            payload.details,
            payload.conversation_details,
            payload.conversationDetails
          );
          const nestedId = toNumberOrUndefined(
            pickFirst(
              nestedConversation?.conversation_id,
              nestedConversation?.conversationId,
              nestedConversation?.conversationID,
              nestedConversation?.id,
              nestedConversation?.ID
            )
          );
          if (nestedId !== undefined && nestedId !== null) {
            conversationKey = String(nestedId);
          }
        }
        const lastReadId = extractLastReadId(payload);
        const unreadFromPayload = extractConversationUnreadCount(payload);
        const normalizedUnread = toNumberOrUndefined(unreadFromPayload);
        const formattedMessageId = toNumberOrUndefined(formatted.message_id);

        if (formatted.message_id) {
          processedMessageIds.current.add(formatted.message_id);
        }

        if (!conversationKey) {
          break;
        }

        setConversations((prev) => {
          const convo = prev[conversationKey] || { messages: [], lastRead: null };
          const existingMessages = Array.isArray(convo.messages)
            ? convo.messages
            : [];

          let nextMessages = existingMessages;
          let messagesChanged = false;

          if (formatted.message_id) {
            const existingIndex = existingMessages.findIndex(
              (messageItem) => messageItem?.message_id === formatted.message_id
            );

            if (existingIndex !== -1) {
              const mergedMessage = {
                ...existingMessages[existingIndex],
                ...formatted,
              };

              if (
                hasMessageChanged(existingMessages[existingIndex], mergedMessage)
              ) {
                nextMessages = [...existingMessages];
                nextMessages.splice(existingIndex, 1, mergedMessage);
                messagesChanged = true;
              }
            } else {
              nextMessages = [...existingMessages, formatted];
              messagesChanged = true;
            }
          }

          const previousLastRead = convo.lastRead;
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
            pickFirst(
              convo.__localUnreadCount,
              convo.unread_count,
              convo.unreadCount,
              convo.unread_messages_count,
              convo.unreadMessagesCount
            )
          );
          let unreadChanged = false;
          let nextUnread = previousUnread;

          if (
            normalizedUnread !== undefined &&
            normalizedUnread !== null &&
            normalizedUnread !== previousUnread
          ) {
            nextUnread = normalizedUnread;
            unreadChanged = true;
          } else if (
            normalizedUnread === undefined &&
            formattedMessageId !== undefined &&
            formattedMessageId !== null &&
            lastReadId !== undefined &&
            lastReadId !== null
          ) {
            const computedUnread = Math.max(0, formattedMessageId - lastReadId);

            if (computedUnread !== previousUnread) {
              nextUnread = computedUnread;
              unreadChanged = true;
            }
          }

          if (
            !messagesChanged &&
            !lastReadChanged &&
            !unreadChanged &&
            prev[conversationKey]
          ) {
            return prev;
          }

          return {
            ...prev,
            [conversationKey]: {
              ...convo,
              messages: messagesChanged ? nextMessages : existingMessages,
              lastRead: lastReadChanged ? nextLastRead : previousLastRead,
              ...(unreadChanged
                ? {
                    __localUnreadCount: nextUnread,
                    unread_count: nextUnread,
                    unreadCount: nextUnread,
                    unread_messages_count: nextUnread,
                  }
                : {}),
            },
          };
        });

        break;
      }
      case "read": {
        setConversations((prev) => {
          const convo = prev[msg.conversation_id] || {
            messages: [],
            lastRead: null,
          };
          return {
            ...prev,
            [msg.conversation_id]: {
              ...convo,
              lastRead: msg.message_id,
            },
          };
        });
        break;
      }
      case "error":
        console.error("WebSocket server error:", msg.error);
        setLastError(msg.error);
        break;
      case "pong":
        // ignore
        break;
      default:
        break;
    }
  };

  const setupSocket = (token) => {
    const activeToken = token ?? latestTokenRef.current;

    if (reconnectTimeout.current) {
      clearTimeout(reconnectTimeout.current);
      reconnectTimeout.current = null;
    }

    // Close existing connection
    if (ws.current) {
      ws.current.close();
    }

    const wsEndpoint = activeToken
      ? `${wsUrl}/ws?token=${encodeURIComponent(activeToken)}`
      : `${wsUrl}/ws`;

    const socket = new WebSocket(wsEndpoint);
    ws.current = socket;

    socket.addEventListener("open", () => {
      console.log("Connected to WebSocket");
      joinedConversations.current.forEach((id) =>
        socket.send(JSON.stringify({ type: "join", conversation_id: id }))
      );
    });
    socket.addEventListener("message", handleMessage);
    socket.addEventListener("error", (error) => {
      console.error("WebSocket error:", error);
    });
    socket.addEventListener("close", () => {
      console.log("WebSocket connection closed.");
      if (shouldReconnect.current) {
        reconnectTimeout.current = setTimeout(() => setupSocket(), 5000);
      }
    });

    // Send pings periodically to keep the connection alive
    const pingInterval = setInterval(() => {
      if (ws.current && ws.current.readyState === WebSocket.OPEN) {
        ws.current.send(JSON.stringify({ type: "ping" }));
      }
    }, 30000);

    return () => {
      clearInterval(pingInterval);
      socket.removeEventListener("message", handleMessage);
      socket.close();
    };
  };

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
    processedMessageIds.current.clear();
    joinedConversations.current.clear();
    setConversations({});
    setLastError(null);
    latestTokenRef.current = authToken;
  }, [authToken]);

  useEffect(() => {
    shouldReconnect.current = true;
    const cleanup = setupSocket(authToken);
    return () => {
      shouldReconnect.current = false;
      clearTimeout(reconnectTimeout.current);
      reconnectTimeout.current = null;
      cleanup();
      ws.current = null;
    };
  }, [authToken]);

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
    ]
  );

  return (
    <WebSocketContext.Provider value={contextValue}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => useContext(WebSocketContext);
