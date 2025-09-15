import React, { createContext, useContext, useEffect, useRef, useState } from "react";

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

    // Connect to the WebSocket endpoint and include the JWT in the
    // Authorization header required by the gateway. Browsers do not allow
    // setting arbitrary headers directly, but the environment running this
    // frontend supports passing them via the options argument.
    const socketOptions = token
      ? { headers: { Authorization: `Bearer ${token}` } }
      : undefined;
    const socket = new WebSocket(`${wsUrl}/ws`, socketOptions);
    ws.current = socket;

    const handleMessage = (event) => {
      const receivedMessage = JSON.parse(event.data);
      setMessages((prevMessages) => [...prevMessages, receivedMessage]);
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

    // Remove listeners and close connection on unmount
    return () => {
      socket.removeEventListener("message", handleMessage);
      socket.close();
    };
  }, []);

  const sendMessage = (messageData) => {
    ws.current.send(JSON.stringify(messageData));
  };

  return (
    <WebSocketContext.Provider value={{ messages, sendMessage }}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => useContext(WebSocketContext);
