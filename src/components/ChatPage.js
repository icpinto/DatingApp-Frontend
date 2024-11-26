import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Box, Typography, TextField, Button, List, ListItem, ListItemText, Paper } from "@mui/material";
import axios from "axios";
import { useWebSocket } from "./WebSocketProvider";
import { useLocation } from "react-router-dom";

function ChatPage() {
  const { conversationId } = useParams();
  const { messages, sendMessage } = useWebSocket();
  const [conversationMessages, setConversationMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [error, setError] = useState(null);
  const location = useLocation();
  const { user1_id, user2_id } = location.state || {};

  const sender_id = Number(localStorage.getItem('user_id'));
  let receiver_id = sender_id === user1_id ? user2_id : user1_id;


  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`http://localhost:8080/user/conversations/${conversationId}`, {
            headers: {
              Authorization: `${token}`,
            },
          });
        setConversationMessages(response.data); 
      } catch (err) {
        setError("Failed to fetch messages");
      }
    };
    fetchMessages();
  }, [conversationId]);

  // Filter real-time messages for the current conversation
  useEffect(() => {
    const filteredMessages = messages.filter(
      (message) => message.conversationId === conversationId
    );
    setConversationMessages((prevMessages) => [...prevMessages, ...filteredMessages]);
  }, [messages, conversationId]);

  // Handle sending a new message
  const handleSendMessage = () => {
    if (newMessage.trim() === "") return;

    const messageData = {
      message: newMessage,
      conversation_id: Number(conversationId),
      sender_id: Number(sender_id),
      receiver_id: Number(receiver_id)
    };

    sendMessage(messageData); // Send the message over WebSocket
    setNewMessage(""); // Clear input
  };

  if (error) return <Typography color="error">{error}</Typography>; 

  return (
        <Box sx={{ padding: 2 }}>
      <Typography variant="h5" gutterBottom>
        Conversation
      </Typography>

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
                  justifyContent: isSender ? "flex-end" : "flex-start",
                  mb: 1,
                }}
              >
                <Paper
                  elevation={2}
                  sx={{
                    padding: 1.5,
                    maxWidth: "70%",
                    bgcolor: isSender ? "primary.main" : "grey.300",
                    color: isSender ? "white" : "black",
                    borderRadius: "12px",
                    borderBottomRightRadius: isSender ? 0 : "12px",
                    borderBottomLeftRadius: isSender ? "12px" : 0,
                  }}
                >
                  <Typography variant="body2">{message.message}</Typography>
                </Paper>
              </ListItem>
            );
          })}
        </List>
      )}

      <Box sx={{ display: "flex", mt: 2 }}>
        <TextField
          variant="outlined"
          fullWidth
          placeholder="Type a message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
        />
        <Button variant="contained" color="primary" onClick={handleSendMessage} sx={{ ml: 2 }}>
          Send
        </Button>
      </Box>
    </Box>

  );
}

export default ChatPage;
