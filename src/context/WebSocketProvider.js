import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

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

const extractRecipientLastReadMessageId = (value = {}) => {
  if (!value || typeof value !== "object") {
    return undefined;
  }

  const candidates = [
    value.last_read_message_id_by_recipient,
    value.lastReadMessageIdByRecipient,
    value.last_read_message_by_recipient?.message_id,
    value.last_read_message_by_recipient?.messageId,
    value.last_read_message_by_recipient?.MessageID,
    value.last_read_message_by_recipient?.id,
    value.last_read_message_by_recipient?.ID,
    value.last_read_by_recipient?.message_id,
    value.last_read_by_recipient?.messageId,
    value.last_read_by_recipient?.MessageID,
    value.last_read_by_recipient?.id,
    value.last_read_by_recipient?.ID,
    value.lastReadByRecipient?.message_id,
    value.lastReadByRecipient?.messageId,
    value.lastReadByRecipient?.MessageID,
    value.lastReadByRecipient?.id,
    value.lastReadByRecipient?.ID,
    value.recipient_last_read_message_id,
    value.recipientLastReadMessageId,
    value.recipient_last_read_message?.message_id,
    value.recipient_last_read_message?.messageId,
    value.recipient_last_read_message?.MessageID,
    value.recipient_last_read_message?.id,
    value.recipient_last_read_message?.ID,
    value.recipientLastReadMessage?.message_id,
    value.recipientLastReadMessage?.messageId,
    value.recipientLastReadMessage?.MessageID,
    value.recipientLastReadMessage?.id,
    value.recipientLastReadMessage?.ID,
  ];

  for (const candidate of candidates) {
    if (candidate === undefined) {
      continue;
    }

    if (candidate === null) {
      return 0;
    }

    const numeric = toNumberOrUndefined(candidate);
    if (numeric !== undefined) {
      return numeric;
    }
  }

  return undefined;
};

const resolveConversationKey = (message = {}, payload = {}, conversation = {}) => {
  const candidates = [
    message.conversation_id,
    message.conversationId,
    message.conversationID,
    payload.conversation_id,
    payload.conversationId,
    payload.conversationID,
    payload.id,
    conversation.conversation_id,
    conversation.conversationId,
    conversation.conversationID,
    conversation.id,
  ];

  for (const candidate of candidates) {
    if (candidate === undefined || candidate === null) {
      continue;
    }

    const numeric = toNumberOrUndefined(candidate);
    if (numeric !== undefined) {
      return String(numeric);
    }

    const stringValue = toStringOrUndefined(candidate);
    if (stringValue !== undefined) {
      return stringValue;
    }
  }

  return undefined;
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
        const payload = (msg && typeof msg === "object" ? msg.payload : null) || {};
        const conversationData =
          payload &&
          typeof payload === "object" &&
          payload.conversation &&
          typeof payload.conversation === "object"
            ? payload.conversation
            : payload && typeof payload === "object"
            ? payload
            : {};

        const conversationKey = resolveConversationKey(
          msg,
          payload,
          conversationData
        );

        if (!conversationKey) {
          break;
        }

        const recipientLastRead =
          extractRecipientLastReadMessageId(payload) ??
          extractRecipientLastReadMessageId(conversationData);

        if (recipientLastRead === undefined) {
          break;
        }

        setConversations((prev) => {
          const convo = prev[conversationKey] || { messages: [], lastRead: null };
          const existingRecipientLastRead = toNumberOrUndefined(
            pickFirst(
              convo.last_read_message_id_by_recipient,
              convo.lastReadMessageIdByRecipient,
              convo.recipient_last_read_message_id,
              convo.recipientLastReadMessageId
            )
          );

          if (existingRecipientLastRead === recipientLastRead) {
            return prev;
          }

          return {
            ...prev,
            [conversationKey]: {
              ...convo,
              last_read_message_id_by_recipient: recipientLastRead,
              lastReadMessageIdByRecipient: recipientLastRead,
              recipient_last_read_message_id: recipientLastRead,
              recipientLastReadMessageId: recipientLastRead,
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
