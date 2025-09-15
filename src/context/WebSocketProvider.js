import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

const WebSocketContext = createContext(null);

export const WebSocketProvider = ({ children }) => {
  const ws = useRef(null);
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token");

    // Close any existing connection to avoid stacking listeners
    if (ws.current) {
      ws.current.close();
    }

    const baseUrl =
      process.env.REACT_APP_CHAT_WS_URL || "http://localhost:8081";
    const wsUrl = baseUrl.replace(/^http/, "ws");

    // Browsers do not allow custom headers to be specified when
    // establishing a WebSocket connection. Instead, append the token as a
    // query parameter so the server can still perform authentication.
    const wsEndpoint = token
      ? `${wsUrl}/ws?token=${encodeURIComponent(token)}`
      : `${wsUrl}/ws`;

    const socket = new WebSocket(wsEndpoint);
    ws.current = socket;

    const handleMessage = (event) => {
      const msg = JSON.parse(event.data);

      switch (msg.type) {
        case "message": {
          const payload = msg.payload || {};
          const formatted = {
            conversation_id: msg.conversation_id,
            message_id: payload.message_id,
            sender_id: Number(payload.sender_id),
            body: payload.body,
            mime_type: payload.mime_type,
            timestamp: payload.created_at,
          };
          setMessages((prev) => [...prev, formatted]);
          break;
        }
        case "read":
          // Expose read events to consumers if needed
          setMessages((prev) => [...prev, msg]);
          break;
        case "error":
          console.error("WebSocket server error:", msg.error);
          break;
        default:
          break;
      }
    };

    socket.addEventListener("open", () => {
      console.log("Connected to WebSocket");
    });
    socket.addEventListener("message", handleMessage);
    socket.addEventListener("error", (error) =>
      console.error("WebSocket error:", error)
    );
    socket.addEventListener("close", () =>
      console.log("WebSocket connection closed.")
    );

    // Send pings periodically to keep the connection alive
    const pingInterval = setInterval(() => {
      if (ws.current && ws.current.readyState === WebSocket.OPEN) {
        ws.current.send(JSON.stringify({ type: "ping" }));
      }
    }, 30000);

    // Remove listeners and close connection on unmount
    return () => {
      clearInterval(pingInterval);
      socket.removeEventListener("message", handleMessage);
      socket.close();
    };
  }, []);

  const send = (data) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(data));
    }
  };

  const joinConversation = (conversationId) =>
    send({ type: "join", conversation_id: String(conversationId) });

  const leaveConversation = (conversationId) =>
    send({ type: "leave", conversation_id: String(conversationId) });

  const sendMessage = (messageData) => send(messageData);

  const markRead = (conversationId, messageId) =>
    send({
      type: "read",
      conversation_id: String(conversationId),
      message_id: messageId,
    });

  return (
    <WebSocketContext.Provider
      value={{
        messages,
        joinConversation,
        leaveConversation,
        sendMessage,
        markRead,
      }}
    >
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => useContext(WebSocketContext);
