import React, { useState, useEffect, useRef } from "react";
import {
  Alert,
  Avatar,
  Box,
  Button,
  CardHeader,
  Divider,
  IconButton,
  Paper,
  Stack,
  TextField,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import CloseIcon from "@mui/icons-material/Close";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import chatService from "../../services/chatService";
import { useWebSocket } from "../../context/WebSocketProvider";
import { spacing } from "../../styles";

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
  blocked = false,
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
  const [blockError, setBlockError] = useState(null);
  const [blockSuccess, setBlockSuccess] = useState(false);
  const [isBlocking, setIsBlocking] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const messagesContainerRef = useRef(null);

  const conversationMessages =
    conversations[conversationId]?.messages || [];
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const sender_id = Number(localStorage.getItem("user_id"));
  let receiver_id = sender_id === user1_id ? user2_id : user1_id;

  useEffect(() => {
    setBlockError(null);
    setBlockSuccess(false);
    setIsBlocking(false);
    setIsBlocked(Boolean(blocked));
  }, [conversationId, user1_id, user2_id, blocked]);

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
    if (isBlocked || newMessage.trim() === "") return;

    // Message displayed locally in the UI
    const clientMsgId = `${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 10)}`;
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

  const handleBlockUser = async () => {
    if (!conversationId) {
      setBlockError("Conversation not found. Please try again.");
      return;
    }

    const targetUserId = Number(receiver_id);
    if (Number.isNaN(targetUserId)) {
      setBlockError("Unable to determine which user to block.");
      return;
    }

    try {
      setIsBlocking(true);
      setBlockError(null);
      const token = localStorage.getItem("token");
      await chatService.post(
        `/conversations/${conversationId}/block`,
        { target_user_id: targetUserId },
        {
          headers: {
            Authorization: `${token}`,
          },
        }
      );
      setBlockSuccess(true);
      setIsBlocked(true);
    } catch (err) {
      setBlockError("Failed to block user. Please try again.");
    } finally {
      setIsBlocking(false);
    }
  };

  if (!open) {
    return null;
  }

  const headerTitle = partnerName || "Conversation";
  const headerInitial = headerTitle?.charAt(0)?.toUpperCase() || "?";

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        flexGrow: 1,
        height: "100%",
        minHeight: 0,
      }}
    >
      <CardHeader
        avatar={
          <Avatar
            variant="rounded"
            sx={{ bgcolor: "primary.main", color: "primary.contrastText" }}
          >
            {headerInitial}
          </Avatar>
        }
        action={
          <Stack direction="row" spacing={1} alignItems="center">
            <Button
              variant="outlined"
              color="error"
              size="small"
              onClick={handleBlockUser}
              disabled={isBlocked || isBlocking}
            >
              {isBlocked ? "Blocked" : isBlocking ? "Blocking…" : "Block user"}
            </Button>
            <IconButton
              onClick={onClose}
              aria-label={
                isMobile ? "Back to conversations" : "Close conversation"
              }
            >
              {isMobile ? <ArrowBackIcon /> : <CloseIcon />}
            </IconButton>
          </Stack>
        }
        title={
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {headerTitle}
          </Typography>
        }
        subheader={
          partnerBio ? (
            <Typography variant="body2" color="text.secondary">
              {partnerBio}
            </Typography>
          ) : undefined
        }
        sx={{
          alignItems: "flex-start",
          px: spacing.section,
          pt: spacing.section,
          pb: spacing.section / 2,
        }}
      />
      <Divider sx={{ mx: spacing.section, borderStyle: "dashed" }} />
      <Box
        ref={messagesContainerRef}
        sx={{
          flex: "1 1 0",
          overflowY: "auto",
          minHeight: 0,
          mx: spacing.section,
          my: spacing.section / 2,
          px: spacing.section,
          py: spacing.section,
          display: "flex",
          flexDirection: "column",
          gap: spacing.section,
          bgcolor: (theme) =>
            alpha(
              theme.palette.primary.main,
              theme.palette.mode === "light" ? 0.04 : 0.16
            ),
          borderRadius: 3,
          boxShadow: (theme) =>
            `inset 0 0 0 1px ${alpha(theme.palette.primary.main, 0.12)}`,
        }}
      >
        {blockError ? (
          <Alert
            severity="error"
            onClose={() => setBlockError(null)}
            sx={{ alignSelf: "flex-start" }}
          >
            {blockError}
          </Alert>
        ) : null}
        {blockSuccess ? (
          <Alert severity="success" sx={{ alignSelf: "flex-start" }}>
            You have blocked this user. You will no longer receive messages
            from them.
          </Alert>
        ) : null}
        {error && (
          <Typography color="error" variant="body2">
            {error}
          </Typography>
        )}
        {Array.isArray(conversationMessages) &&
        conversationMessages.length === 0 ? (
          <Stack
            spacing={1}
            alignItems="center"
            justifyContent="center"
            sx={{
              textAlign: "center",
              color: "text.secondary",
              flexGrow: 1,
            }}
          >
            <Typography variant="body1">
              No messages yet. Start the conversation!
            </Typography>
          </Stack>
        ) : (
          <Stack spacing={spacing.section}>
            {conversationMessages.map((message, index) => {
              const messageKey =
                message.message_id || message.client_msg_id || index;
              const isSender = message.sender_id === sender_id;
              return (
                <Box
                  key={messageKey}
                  sx={{
                    display: "flex",
                    justifyContent: isSender ? "flex-end" : "flex-start",
                  }}
                >
                  <Paper
                    elevation={0}
                    sx={{
                      px: 2,
                      py: 1.5,
                      maxWidth: { xs: "88%", sm: "75%" },
                      bgcolor: (theme) =>
                        isSender
                          ? theme.palette.primary.main
                          : alpha(theme.palette.background.paper, 0.92),
                      color: (theme) =>
                        isSender
                          ? theme.palette.primary.contrastText
                          : theme.palette.text.primary,
                      borderRadius: "20px",
                      borderTopRightRadius: isSender ? "8px" : "20px",
                      borderTopLeftRadius: isSender ? "20px" : "8px",
                      border: (theme) =>
                        `1px solid ${
                          isSender
                            ? alpha(theme.palette.primary.dark, 0.6)
                            : theme.palette.divider
                        }`,
                      boxShadow: (theme) =>
                        isSender
                          ? `0px 8px 20px ${alpha(
                              theme.palette.primary.main,
                              0.2
                            )}`
                          : `0px 6px 18px ${alpha(
                              theme.palette.common.black,
                              0.06
                            )}`,
                      opacity: message.pending ? 0.6 : 1,
                      transition: "all 0.2s ease",
                    }}
                  >
                    <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
                      {message.body}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        display: "block",
                        textAlign: "right",
                        mt: 1,
                        color: (theme) =>
                          isSender
                            ? alpha(theme.palette.primary.contrastText, 0.8)
                            : theme.palette.text.secondary,
                      }}
                    >
                      {formatMessageTimestamp(message)}
                    </Typography>
                  </Paper>
                </Box>
              );
            })}
          </Stack>
        )}
      </Box>
      <Divider sx={{ mx: spacing.section, borderStyle: "dashed" }} />
      <Box sx={{ px: spacing.section, pb: spacing.section }}>
        {isBlocked ? (
          <Typography variant="body2" color="text.secondary">
            Messaging is disabled for this conversation.
          </Typography>
        ) : (
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1.5}
            alignItems={{ xs: "stretch", sm: "center" }}
          >
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
              disabled={isBlocked}
            />
            <Button
              variant="contained"
              color="primary"
              onClick={handleSendMessage}
              sx={{
                px: 4,
                py: 1.25,
                alignSelf: { xs: "stretch", sm: "flex-end" },
              }}
              disabled={isBlocked}
            >
              Send
            </Button>
          </Stack>
        )}
      </Box>
    </Box>
  );
}

export default ChatDrawer;
