import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

const WebSocketContext = createContext(null);

export const WebSocketProvider = ({ children }) => {
  const ws = useRef(null);
  const reconnectTimeout = useRef(null);
  const shouldReconnect = useRef(true);

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
    setConversations((prev) => ({
      ...prev,
      [conversationId]: {
        ...(prev[conversationId] || {}),
        messages: msgs,
      },
    }));
  }, []);

  const addLocalMessage = useCallback((conversationId, message) => {
    setConversations((prev) => {
      const convo = prev[conversationId] || { messages: [], lastRead: null };
      return {
        ...prev,
        [conversationId]: {
          ...convo,
          messages: [...convo.messages, message],
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
        const id = payload.message_id;
        if (!processedMessageIds.current.has(id)) {
          processedMessageIds.current.add(id);
          const formatted = {
            conversation_id: msg.conversation_id,
            message_id: id,
            sender_id: Number(payload.sender_id),
            body: payload.body,
            mime_type: payload.mime_type,
            timestamp: payload.created_at,
          };
          setConversations((prev) => {
            const convo = prev[msg.conversation_id] || {
              messages: [],
              lastRead: null,
            };
            return {
              ...prev,
              [msg.conversation_id]: {
                ...convo,
                messages: [...convo.messages, formatted],
              },
            };
          });
        }
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

  const setupSocket = () => {
    const token = localStorage.getItem("token");

    // Close existing connection
    if (ws.current) {
      ws.current.close();
    }

    const wsEndpoint = token
      ? `${wsUrl}/ws?token=${encodeURIComponent(token)}`
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
        reconnectTimeout.current = setTimeout(setupSocket, 5000);
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
    shouldReconnect.current = true;
    const cleanup = setupSocket();
    return () => {
      shouldReconnect.current = false;
      clearTimeout(reconnectTimeout.current);
      cleanup();
    };
  }, []);

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
