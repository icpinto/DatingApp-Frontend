import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
} from "react";
import { Box, Divider, useMediaQuery } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import chatService from "../../services/chatService";
import { useWebSocket } from "../../context/WebSocketProvider";
import { spacing } from "../../styles";
import { toNumberOrUndefined } from "../../utils/conversationUtils";
import ChatHeaderSection from "./ChatHeaderSection";
import ChatMessageList from "./ChatMessageList";
import MessageComposerSection from "./MessageComposer";
import { useUserCapabilities } from "../../context/UserContext";
import {
  formatMessageTimestamp,
  resolveMessageBody,
  resolveMessageId,
  resolveMessageSenderId,
} from "./chatDrawerUtils";
import { isAbortError } from "../../utils/http";

function ChatDrawer({
  conversationId,
  user1_id,
  user2_id,
  open,
  onClose,
  partnerName,
  partnerBio,
  partnerLifecycleStatus,
  blocked = false,
  messagingDisabled = false,
  messagingDisabledReason,
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
  const { groups } = useUserCapabilities();
  const messagingCapabilities = groups.messaging;
  const canViewHistory = messagingCapabilities.viewHistory.can;
  const canMarkRead = messagingCapabilities.markRead.can;
  const canSendMessage = messagingCapabilities.sendMessage.can;
  const blockCapability = messagingCapabilities.blockUser;
  const canBlockUsers = blockCapability.can;
  const blockRestrictionReason = blockCapability.reason;
  const canViewPartnerStatus = messagingCapabilities.viewPartnerStatus.can;

  const normalizedConversationId = useMemo(
    () => toNumberOrUndefined(conversationId),
    [conversationId]
  );

  const conversationMessages = useMemo(() => {
    if (!canViewHistory) {
      return [];
    }

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
  }, [
    canViewHistory,
    conversations,
    conversationId,
    normalizedConversationId,
  ]);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const senderId = useMemo(
    () => toNumberOrUndefined(localStorage.getItem("user_id")),
    []
  );

  const normalizedPartnerLifecycleStatus = useMemo(() => {
    if (!canViewPartnerStatus || typeof partnerLifecycleStatus !== "string") {
      return undefined;
    }

    const trimmed = partnerLifecycleStatus.trim().toLowerCase();
    return trimmed.length ? trimmed : undefined;
  }, [canViewPartnerStatus, partnerLifecycleStatus]);

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

  useEffect(() => {
    if (
      conversationId === undefined ||
      conversationId === null ||
      !open ||
      !canViewHistory
    ) {
      return () => {};
    }

    let isActive = true;
    const controller = new AbortController();

    const fetchMessages = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await chatService.get(
          `/conversations/${conversationId}/messages`,
          {
            headers: {
              Authorization: `${token}`,
            },
            signal: controller.signal,
          }
        );

        if (isActive) {
          setConversationHistory(conversationId, response.data || []);
          setError(null);
        }
      } catch (err) {
        if (isAbortError(err)) {
          return;
        }
        if (isActive) {
          setError("Failed to fetch messages");
        }
      }
    };

    fetchMessages();

    return () => {
      isActive = false;
      controller.abort();
    };
  }, [
    canViewHistory,
    conversationId,
    open,
    setConversationHistory,
  ]);

  useEffect(() => {
    if (
      conversationId === undefined ||
      conversationId === null ||
      !canViewHistory
    ) {
      return undefined;
    }

    if (open) {
      joinConversation(conversationId);
    }

    return () => {
      leaveConversation(conversationId);
    };
  }, [conversationId, open, canViewHistory, joinConversation, leaveConversation]);

  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop =
        messagesContainerRef.current.scrollHeight;
    }
  }, [conversationMessages]);

  useEffect(() => {
    if (
      conversationId === undefined ||
      conversationId === null ||
      !Array.isArray(conversationMessages) ||
      conversationMessages.length === 0 ||
      typeof markRead !== "function" ||
      !canMarkRead
    ) {
      return;
    }

    const last = conversationMessages[conversationMessages.length - 1];
    const lastId = resolveMessageId(last);
    const lastSenderId = resolveMessageSenderId(last);
    const isPending = Boolean(last?.pending);

    if (
      lastId !== undefined &&
      lastSenderId !== undefined &&
      senderId !== undefined &&
      lastSenderId !== senderId &&
      !isPending
    ) {
      markRead(conversationId, lastId);
    }
  }, [
    canMarkRead,
    conversationId,
    conversationMessages,
    markRead,
    senderId,
  ]);

  const isLifecycleRestricted = useMemo(() => {
    if (!normalizedPartnerLifecycleStatus) {
      return false;
    }

    return ["deleted", "deactivated"].includes(normalizedPartnerLifecycleStatus);
  }, [normalizedPartnerLifecycleStatus]);

  const lifecycleDisabledReason = useMemo(() => {
    if (normalizedPartnerLifecycleStatus === "deactivated") {
      return "This user has deactivated their account. You can’t reply.";
    }

    if (normalizedPartnerLifecycleStatus === "deleted") {
      return "This user has deleted their account. You can’t reply.";
    }

    return null;
  }, [normalizedPartnerLifecycleStatus]);

  const handleSendMessage = useCallback(() => {
    const trimmedMessage = newMessage.trim();

    if (
      isBlocked ||
      isLifecycleRestricted ||
      messagingDisabled ||
      trimmedMessage === "" ||
      !canSendMessage
    ) {
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
    canSendMessage,
    conversationId,
    isBlocked,
    isLifecycleRestricted,
    messagingDisabled,
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

    if (!canBlockUsers) {
      setBlockError(
        blockRestrictionReason || "You do not have permission to block users."
      );
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
  }, [blockRestrictionReason, canBlockUsers, conversationId, receiverId]);

  if (!open) {
    return null;
  }

  const headerTitle = partnerName || "Conversation";
  const headerInitial = headerTitle?.charAt(0)?.toUpperCase() || "?";
  const hasMessages =
    Array.isArray(conversationMessages) && conversationMessages.length > 0;

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
      <ChatHeaderSection
        title={headerTitle}
        bio={partnerBio}
        initial={headerInitial}
        isMobile={isMobile}
        onClose={onClose}
        onBlockUser={handleBlockUser}
        isBlocked={isBlocked}
        isBlocking={isBlocking}
      />
      <Divider sx={{ mx: spacing.section, borderStyle: "dashed" }} />
      <ChatMessageList
        containerRef={messagesContainerRef}
        messages={preparedMessages}
        hasMessages={hasMessages}
        error={error}
        blockError={blockError}
        onDismissBlockError={() => setBlockError(null)}
        blockSuccess={blockSuccess}
        lifecycleStatus={normalizedPartnerLifecycleStatus}
      />
      <Divider sx={{ mx: spacing.section, borderStyle: "dashed" }} />
      <MessageComposerSection
        value={newMessage}
        onChange={(event) => setNewMessage(event.target.value)}
        onSend={handleSendMessage}
        isBlocked={isBlocked || isLifecycleRestricted}
        isDisabled={messagingDisabled}
        disabledReason={(function resolveDisabledReason() {
          if (isBlocked) {
            return undefined;
          }

          if (isLifecycleRestricted) {
            return lifecycleDisabledReason || undefined;
          }

          if (messagingDisabled) {
            return messagingDisabledReason || undefined;
          }

          return undefined;
        })()}
      />
    </Box>
  );
}

export default ChatDrawer;
