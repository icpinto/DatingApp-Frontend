import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  List,
  ListItem,
  Paper,
  Drawer,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import chatService from "../../services/chatService";
import { useWebSocket } from "../../context/WebSocketProvider";

function ChatDrawer({ conversationId, user1_id, user2_id, open, onClose }) {
  const {
    messages,
    sendMessage,
    joinConversation,
    leaveConversation,
    markRead,
  } = useWebSocket();
  const [conversationMessages, setConversationMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [error, setError] = useState(null);
  const messagesContainerRef = useRef(null);

  const sender_id = Number(localStorage.getItem("user_id"));
  let receiver_id = sender_id === user1_id ? user2_id : user1_id;

  // Fetch initial messages
  useEffect(() => {
    if (conversationId) {
      const fetchMessages = async () => {
        try {
          const token = localStorage.getItem("token");
          const response = await chatService.get(
            `/conversations/${conversationId}/messages`,
            {
              headers: {
                Authorization: `${token}`,
              },
            }
          );
          setConversationMessages(response.data || []);
        } catch (err) {
          setError("Failed to fetch messages");
        }
      };
      fetchMessages();
    }
  }, [conversationId]);

    // Append real-time messages from WebSocket without duplicating
    useEffect(() => {
      const filteredMessages = messages.filter(
        (m) => String(m.conversation_id) === String(conversationId)
      );

      if (filteredMessages.length > 0) {
        setConversationMessages((prevMessages) => {
          const existing = new Set(
            prevMessages.map((m) => m.message_id ?? m.timestamp)
          );
          const newMessages = filteredMessages.filter(
            (m) => !existing.has(m.message_id ?? m.timestamp)
          );
          return [...prevMessages, ...newMessages];
        });
      }
    }, [messages, conversationId]);

    // Join/leave conversation rooms over WebSocket
    useEffect(() => {
      if (conversationId && open) {
        joinConversation(conversationId);
      }
      return () => {
        if (conversationId) {
          leaveConversation(conversationId);
        }
      };
    }, [conversationId, open, joinConversation, leaveConversation]);

  // Clear messages when closing the drawer
  useEffect(() => {
    return () => setConversationMessages([]);
  }, [conversationId]);

  // Keep the latest message in view
    useEffect(() => {
      if (messagesContainerRef.current) {
        messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
      }
    }, [conversationMessages]);

    // Mark the latest message as read when conversation updates
    useEffect(() => {
      if (conversationMessages.length > 0) {
        const last = conversationMessages[conversationMessages.length - 1];
        if (last.message_id) {
          markRead(conversationId, last.message_id);
        }
      }
    }, [conversationMessages, conversationId, markRead]);

  // Handle sending a new message
  const handleSendMessage = () => {
    if (newMessage.trim() === "") return;

    // Message displayed locally in the UI
      const displayMessage = {
        body: newMessage,
        conversation_id: Number(conversationId),
        sender_id: Number(sender_id),
        receiver_id: Number(receiver_id),
        timestamp: new Date().toISOString(),
      };

      // Message format expected by the server
      const wsMessage = {
        type: "send_message",
        conversation_id: String(conversationId),
        client_msg_id: Date.now().toString(),
        body: newMessage,
        mime_type: "text/plain",
      };

    // Optimistically update the conversation messages
      setConversationMessages((prevMessages) => [...prevMessages, displayMessage]);

    sendMessage(wsMessage); // Send the message over WebSocket
    setNewMessage(""); // Clear input
  };

  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <Box sx={{ width: 400, padding: 2 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography variant="h5" gutterBottom>
            Conversation
          </Typography>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>

        <Box
          ref={messagesContainerRef}
          sx={{
            maxHeight: "70vh",
            overflowY: "auto",
            mt: 2,
          }}
        >
          {/* Check if conversationMessages is null or empty */}
          {Array.isArray(conversationMessages) && conversationMessages.length === 0 ? (
            <Typography variant="body1" color="text.secondary">
              No messages yet. Start the conversation!
            </Typography>
          ) : (
            <List>
              {conversationMessages.map((message, index) => {
                const isSender = message.sender_id === sender_id;
                return (
                  <ListItem
                    key={index}
                    sx={{
                      display: "flex",
                      justifyContent: isSender ? "flex-start" : "flex-end",
                      mb: 1,
                    }}
                  >
                    <Paper
                      elevation={2}
                      sx={{
                        padding: 1.5,
                        maxWidth: "70%",
                        bgcolor: isSender ? "primary.light" : "grey.300",
                        color: isSender ? "black" : "black",
                        borderRadius: "12px",
                        borderBottomRightRadius: isSender ? "12px" : 0,
                        borderBottomLeftRadius: isSender ? 0 : "12px",
                      }}
                    >
                        <Typography variant="body2">{message.body}</Typography>
                      <Typography
                        variant="caption"
                        sx={{ display: "block", textAlign: "right", mt: 1, color: "text.secondary" }}
                      >
                        {new Date(message.timestamp || message.CreatedAt).toLocaleString()}
                      </Typography>
                    </Paper>
                  </ListItem>
                );
              })}
            </List>
          )}
        </Box>

        <Box sx={{ display: "flex", mt: 2 }}>
          <TextField
            variant="outlined"
            fullWidth
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
          />
          <Button variant="contained" color="primary" onClick={handleSendMessage} sx={{ ml: 2 }}>
            Send
          </Button>
        </Box>
      </Box>
    </Drawer>
  );
}

export default ChatDrawer;
