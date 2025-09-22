import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
} from "react";
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
import { pickFirst, toNumberOrUndefined } from "../../utils/conversationUtils";

const formatMessageTimestamp = (message) => {
  if (!message) return "";

  if (message.pending) {
    return "Sending…";
  }

  const rawTimestamp = pickFirst(
    message.timestamp,
    message.created_at,
    message.createdAt,
    message.CreatedAt,
    message.sent_at,
    message.sentAt,
    message.SentAt,
    message.updated_at,
    message.updatedAt
  );

  if (!rawTimestamp) {
    return "—";
  }

  const parsed = new Date(rawTimestamp);
  if (Number.isNaN(parsed.getTime())) {
    return "—";
  }

  return parsed.toLocaleString();
};

const resolveMessageId = (message = {}) =>
  toNumberOrUndefined(
    pickFirst(
      message.message_id,
      message.messageId,
      message.messageID,
      message.MessageId,
      message.MessageID,
      message.id
    )
  );

const resolveMessageSenderId = (message = {}) =>
  toNumberOrUndefined(
    pickFirst(
      message.sender_id,
      message.senderId,
      message.senderID,
      message.user_id,
      message.userId,
      message.author_id,
      message.authorId
    )
  );

const resolveMessageBody = (message = {}) =>
  pickFirst(
    message.body,
    message.message,
    message.text,
    message.content,
    message.Body,
    message.Message
  );

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

  const normalizedConversationId = useMemo(
    () => toNumberOrUndefined(conversationId),
    [conversationId]
  );

  const conversationMessages = useMemo(() => {
    const lookupId =
      normalizedConversationId !== undefined && normalizedConversationId !== null
        ? normalizedConversationId
        : conversationId;

    if (lookupId === undefined || lookupId === null) {
      return [];
    }

    if (!conversations || typeof conversations !== "object") {
      return [];
    }

    const key = String(lookupId);
    const entry = conversations[key] ?? conversations[lookupId];

    return Array.isArray(entry?.messages) ? entry.messages : [];
  }, [conversations, conversationId, normalizedConversationId]);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const senderId = useMemo(
    () => toNumberOrUndefined(localStorage.getItem("user_id")),
    []
  );

  const receiverId = useMemo(() => {
    const normalizedUser1 = toNumberOrUndefined(user1_id);
    const normalizedUser2 = toNumberOrUndefined(user2_id);

    if (
      senderId !== undefined &&
      normalizedUser1 !== undefined &&
      senderId === normalizedUser1
    ) {
      return normalizedUser2;
    }

    if (
      senderId !== undefined &&
      normalizedUser2 !== undefined &&
      senderId === normalizedUser2
    ) {
      return normalizedUser1;
    }

    return normalizedUser1 ?? normalizedUser2 ?? undefined;
  }, [senderId, user1_id, user2_id]);

  useEffect(() => {
    setBlockError(null);
    setBlockSuccess(false);
    setIsBlocking(false);
    setIsBlocked(Boolean(blocked));
  }, [conversationId, user1_id, user2_id, blocked]);

  const preparedMessages = useMemo(() => {
    if (!Array.isArray(conversationMessages)) {
      return [];
    }

    return conversationMessages.map((message, index) => {
      const messageId = resolveMessageId(message);
      const sender = resolveMessageSenderId(message);
      const rawBody = resolveMessageBody(message);
      const bodyText =
        typeof rawBody === "string"
          ? rawBody
          : rawBody !== undefined && rawBody !== null
          ? String(rawBody)
          : "";

      return {
        key: messageId ?? message?.client_msg_id ?? index,
        isSender:
          senderId !== undefined && sender !== undefined
            ? sender === senderId
            : false,
        body: bodyText,
        pending: Boolean(message?.pending),
        timestampLabel: formatMessageTimestamp(message),
      };
    });
  }, [conversationMessages, senderId]);

  // Fetch initial messages
  useEffect(() => {
    if (conversationId === undefined || conversationId === null || !open) {
      return;
    }

    let isActive = true;

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

        if (isActive) {
          setConversationHistory(conversationId, response.data || []);
          setError(null);
        }
      } catch (err) {
        if (isActive) {
          setError("Failed to fetch messages");
        }
      }
    };

    fetchMessages();

    return () => {
      isActive = false;
    };
  }, [conversationId, open, setConversationHistory]);

  // Join/leave conversation rooms over WebSocket
  useEffect(() => {
    if (conversationId === undefined || conversationId === null) {
      return undefined;
    }

    if (open) {
      joinConversation(conversationId);
    }

    return () => {
      leaveConversation(conversationId);
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
    if (
      conversationId === undefined ||
      conversationId === null ||
      !Array.isArray(conversationMessages) ||
      conversationMessages.length === 0 ||
      typeof markRead !== "function"
    ) {
      return;
    }

    const last = conversationMessages[conversationMessages.length - 1];
    const lastId = resolveMessageId(last);

    if (lastId !== undefined) {
      markRead(conversationId, lastId);
    }
  }, [conversationId, conversationMessages, markRead]);

  // Handle sending a new message
  const handleSendMessage = useCallback(() => {
    const trimmedMessage = newMessage.trim();

    if (isBlocked || trimmedMessage === "") {
      return;
    }

    const conversationIdentifier =
      normalizedConversationId !== undefined &&
      normalizedConversationId !== null
        ? normalizedConversationId
        : conversationId;

    if (conversationIdentifier === undefined || conversationIdentifier === null) {
      return;
    }

    const clientMsgId = `${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 10)}`;
    const timestamp = new Date().toISOString();

    const displayMessage = {
      body: trimmedMessage,
      conversation_id: conversationIdentifier,
      sender_id: senderId,
      receiver_id: receiverId,
      timestamp,
      client_msg_id: clientMsgId,
      pending: true,
    };

    const wsMessage = {
      type: "send_message",
      conversation_id: String(conversationIdentifier),
      client_msg_id: clientMsgId,
      body: trimmedMessage,
      mime_type: "text/plain",
    };

    addLocalMessage(conversationIdentifier, displayMessage);
    sendMessage(wsMessage);
    setNewMessage("");
  }, [
    addLocalMessage,
    conversationId,
    isBlocked,
    newMessage,
    normalizedConversationId,
    receiverId,
    senderId,
    sendMessage,
  ]);

  const handleBlockUser = useCallback(async () => {
    if (conversationId === undefined || conversationId === null) {
      setBlockError("Conversation not found. Please try again.");
      return;
    }

    const targetUserId = toNumberOrUndefined(receiverId);

    if (targetUserId === undefined) {
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
  }, [conversationId, receiverId]);

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
            {preparedMessages.map((message) => (
              <Box
                key={message.key}
                sx={{
                  display: "flex",
                  justifyContent: message.isSender ? "flex-end" : "flex-start",
                }}
              >
                <Paper
                  elevation={0}
                  sx={{
                    px: 2,
                    py: 1.5,
                    maxWidth: { xs: "88%", sm: "75%" },
                    bgcolor: (theme) =>
                      message.isSender
                        ? theme.palette.primary.main
                        : alpha(theme.palette.background.paper, 0.92),
                    color: (theme) =>
                      message.isSender
                        ? theme.palette.primary.contrastText
                        : theme.palette.text.primary,
                    borderRadius: "20px",
                    borderTopRightRadius: message.isSender ? "8px" : "20px",
                    borderTopLeftRadius: message.isSender ? "20px" : "8px",
                    border: (theme) =>
                      `1px solid ${
                        message.isSender
                          ? alpha(theme.palette.primary.dark, 0.6)
                          : theme.palette.divider
                      }`,
                    boxShadow: (theme) =>
                      message.isSender
                        ? `0px 8px 20px ${alpha(theme.palette.primary.main, 0.2)}`
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
                        message.isSender
                          ? alpha(theme.palette.primary.contrastText, 0.8)
                          : theme.palette.text.secondary,
                    }}
                  >
                    {message.timestampLabel}
                  </Typography>
                </Paper>
              </Box>
            ))}
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
