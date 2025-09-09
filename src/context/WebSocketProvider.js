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

    const socket = new WebSocket(`ws://localhost:8080/ws/${token}`);
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
