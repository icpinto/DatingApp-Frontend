import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  List,
  ListItem,
  Paper,
  IconButton,
  Divider,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import CloseIcon from "@mui/icons-material/Close";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import chatService from "../../services/chatService";
import { useWebSocket } from "../../context/WebSocketProvider";

const formatMessageTimestamp = (message) => {
  if (!message) return "";

  if (message.pending) {
    return "Sending…";
  }

  const rawTimestamp =
    message.timestamp ||
    message.created_at ||
    message.createdAt ||
    message.CreatedAt ||
    message.sent_at ||
    message.sentAt ||
    message.SentAt ||
    message.updated_at ||
    message.updatedAt ||
    null;

  if (!rawTimestamp) {
    return "—";
  }

  const parsed = new Date(rawTimestamp);
  if (Number.isNaN(parsed.getTime())) {
    return "—";
  }

  return parsed.toLocaleString();
};

function ChatDrawer({
  conversationId,
  user1_id,
  user2_id,
  open,
  onClose,
  partnerName,
  partnerBio,
}) {
  const {
    conversations,
    sendMessage,
    joinConversation,
    leaveConversation,
    markRead,
    setConversationHistory,
    addLocalMessage,
  } = useWebSocket();
  const [newMessage, setNewMessage] = useState("");
  const [error, setError] = useState(null);
  const messagesContainerRef = useRef(null);

  const conversationMessages =
    conversations[conversationId]?.messages || [];
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

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
          setConversationHistory(conversationId, response.data || []);
          setError(null);
        } catch (err) {
          setError("Failed to fetch messages");
        }
      };
      fetchMessages();
    }
  }, [conversationId, setConversationHistory]);

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

  // Keep the latest message in view
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop =
        messagesContainerRef.current.scrollHeight;
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
    const clientMsgId = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    const timestamp = new Date().toISOString();
    const displayMessage = {
      body: newMessage,
      conversation_id: Number(conversationId),
      sender_id: Number(sender_id),
      receiver_id: Number(receiver_id),
      timestamp,
      client_msg_id: clientMsgId,
    };

    // Message format expected by the server
    const wsMessage = {
      type: "send_message",
      conversation_id: String(conversationId),
      client_msg_id: clientMsgId,
      body: newMessage,
      mime_type: "text/plain",
    };

    addLocalMessage(conversationId, displayMessage);
    sendMessage(wsMessage); // Send the message over WebSocket
    setNewMessage(""); // Clear input
  };

  if (!open) {
    return null;
  }

  const headerTitle = partnerName || "Conversation";

  return (
    <Box sx={{ display: "flex", flexDirection: "column", flexGrow: 1 }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "flex-start",
          gap: 2,
        }}
      >
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h6">{headerTitle}</Typography>
          {partnerBio && (
            <Typography variant="body2" color="text.secondary">
              {partnerBio}
            </Typography>
          )}
        </Box>
        <IconButton
          onClick={onClose}
          aria-label={isMobile ? "Back to conversations" : "Close conversation"}
        >
          {isMobile ? <ArrowBackIcon /> : <CloseIcon />}
        </IconButton>
      </Box>
      <Divider sx={{ mt: 2 }} />
      <Box
        ref={messagesContainerRef}
        sx={{
          flexGrow: 1,
          overflowY: "auto",
          mt: 2,
          pr: 1,
        }}
      >
        {error && (
          <Typography color="error" variant="body2" sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}
        {Array.isArray(conversationMessages) && conversationMessages.length === 0 ? (
          <Typography variant="body1" color="text.secondary">
            No messages yet. Start the conversation!
          </Typography>
        ) : (
          <List sx={{ pb: 2 }}>
            {conversationMessages.map((message, index) => {
              const messageKey =
                message.message_id || message.client_msg_id || index;
              const isSender = message.sender_id === sender_id;
              return (
                <ListItem
                  key={messageKey}
                  sx={{
                    display: "flex",
                    justifyContent: isSender ? "flex-end" : "flex-start",
                    mb: 1.5,
                  }}
                >
                  <Paper
                    elevation={2}
                    sx={{
                      padding: 1.5,
                      maxWidth: "75%",
                      bgcolor: isSender ? "primary.main" : "grey.200",
                      color: isSender ? "primary.contrastText" : "text.primary",
                      borderRadius: "16px",
                      borderTopRightRadius: isSender ? 0 : "16px",
                      borderTopLeftRadius: isSender ? "16px" : 0,
                      opacity: message.pending ? 0.6 : 1,
                    }}
                  >
                    <Typography variant="body2">{message.body}</Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        display: "block",
                        textAlign: "right",
                        mt: 1,
                        color: "text.secondary",
                      }}
                    >
                      {formatMessageTimestamp(message)}
                    </Typography>
                  </Paper>
                </ListItem>
              );
            })}
          </List>
        )}
      </Box>
      <Divider sx={{ mt: 2 }} />
      <Box sx={{ display: "flex", mt: 2, gap: 2 }}>
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
        <Button variant="contained" color="primary" onClick={handleSendMessage}>
          Send
        </Button>
      </Box>
    </Box>
  );
}

export default ChatDrawer;
