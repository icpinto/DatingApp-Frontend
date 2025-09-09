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
import api from "../../services/api";
import { useWebSocket } from "../../context/WebSocketProvider";

function ChatDrawer({ conversationId, user1_id, user2_id, open, onClose }) {
  const { messages, sendMessage } = useWebSocket();
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
          const response = await api.get(`/user/conversations/${conversationId}`, {
            headers: {
              Authorization: `${token}`,
            },
          });
          setConversationMessages(response.data || []);
        } catch (err) {
          setError("Failed to fetch messages");
        }
      };
      fetchMessages();
    }
  }, [conversationId]);

  // Append real-time messages from WebSocket
  useEffect(() => {
    const filteredMessages = messages.filter(
      (message) => message.conversation_id === conversationId
    );
    if (filteredMessages.length > 0) {
      setConversationMessages((prevMessages) => [...prevMessages, ...filteredMessages]);
    }
  }, [messages, conversationId]);

  // Keep the latest message in view
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [conversationMessages]);

  // Handle sending a new message
  const handleSendMessage = () => {
    if (newMessage.trim() === "") return;

    const messageData = {
      message: newMessage,
      conversation_id: Number(conversationId),
      sender_id: Number(sender_id),
      receiver_id: Number(receiver_id),
      timestamp: new Date().toISOString(), // Add a timestamp
    };

    // Optimistically update the conversation messages
    setConversationMessages((prevMessages) => [...prevMessages, messageData]);

    sendMessage(messageData); // Send the message over WebSocket
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
          {(!conversationMessages || conversationMessages.length === 0) ? (
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
                      <Typography variant="body2">{message.message}</Typography>
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
