import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Alert,
  Avatar,
  Card,
  CardContent,
  CardHeader,
  Container,
  Divider,
  Grid,
  Stack,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import ChatBubbleOutlineRoundedIcon from "@mui/icons-material/ChatBubbleOutlineRounded";
import ConversationListPane from "./ConversationListPane";
import ChatDrawer from "./ChatDrawer";
import api from "../../services/api";
import chatService from "../../services/chatService";
import { spacing } from "../../styles";
import { useWebSocket } from "../../context/WebSocketProvider";
import { useTranslation } from "../../i18n";
import { useAccountLifecycle } from "../../context/AccountLifecycleContext";
import {
  pickFirst,
  toNumberOrUndefined,
  normalizeConversationList,
  flattenConversationEntry,
  extractUnreadCount,
  getLatestMessageSnapshot,
  extractLastMessageId,
  extractLastReadMessageId,
} from "../../utils/conversationUtils";
import {
  ACCOUNT_DEACTIVATED_MESSAGE,
  ACCOUNT_DEACTIVATED_MESSAGING_DISABLED_MESSAGE,
} from "../../utils/accountLifecycle";
import {
  buildMessagePreview,
  extractLastMessageInfo,
  formatLastMessageTimestamp,
  getConversationPartnerDetails,
  getConversationUsers,
  getCurrentUserId,
} from "./conversationDisplayHelpers";

const buildRealtimePatch = ({
  conversation,
  wsConversation,
  currentUserId,
  selectedConversationId,
  conversationKey,
}) => {
  if (!wsConversation || typeof wsConversation !== "object") {
    return null;
  }

  const messages = Array.isArray(wsConversation.messages)
    ? wsConversation.messages
    : [];
  const lastRead = wsConversation.lastRead;
  const latestSnapshot = getLatestMessageSnapshot(messages);

  const wsUnreadCount = toNumberOrUndefined(
    extractUnreadCount(wsConversation)
  );
  let unreadCount = wsUnreadCount;

  const isSelected =
    selectedConversationId !== undefined &&
    selectedConversationId !== null &&
    conversationKey !== undefined &&
    conversationKey !== null &&
    String(conversationKey) === String(selectedConversationId);

  if (isSelected) {
    unreadCount = 0;
  }

  const updates = {};
  const previousUnread = toNumberOrUndefined(
    extractUnreadCount(conversation)
  );

  if (unreadCount !== undefined && unreadCount !== previousUnread) {
    updates.__localUnreadCount = unreadCount;
    updates.unread_count = unreadCount;
    updates.unreadCount = unreadCount;
    updates.unread_messages_count = unreadCount;
  }

  const normalizedLastRead = toNumberOrUndefined(lastRead);
  const existingLastRead = extractLastReadMessageId(conversation);

  if (
    normalizedLastRead !== undefined &&
    normalizedLastRead !== existingLastRead
  ) {
    updates.__lastReadMessageId = normalizedLastRead;
    updates.last_read_message_id = normalizedLastRead;
    updates.lastReadMessageId = normalizedLastRead;
  }

  const previousLastId = extractLastMessageId(conversation);

  if (
    latestSnapshot.messageId !== undefined &&
    latestSnapshot.messageId !== previousLastId
  ) {
    updates.__lastMessageId = latestSnapshot.messageId;

    if (latestSnapshot.message) {
      updates.last_message = latestSnapshot.message;
    }

    if (latestSnapshot.body !== undefined) {
      updates.last_message_body = latestSnapshot.body;
      updates.lastMessageBody = latestSnapshot.body;
    }

    if (latestSnapshot.mimeType !== undefined) {
      updates.last_message_mime_type = latestSnapshot.mimeType;
      updates.lastMessageMimeType = latestSnapshot.mimeType;
    }

    if (latestSnapshot.timestamp !== undefined) {
      updates.last_message_timestamp = latestSnapshot.timestamp;
      updates.lastMessageTimestamp = latestSnapshot.timestamp;
      updates.last_message_sent_at = latestSnapshot.timestamp;
      updates.lastMessageSentAt = latestSnapshot.timestamp;
    }
  }

  return Object.keys(updates).length > 0 ? updates : null;
};

function Messages({ onUnreadCountChange = () => {} }) {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedConversationId, setSelectedConversationId] = useState(null);
  const [profiles, setProfiles] = useState({});
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const currentUserId = getCurrentUserId();
  const normalizedCurrentUserId = toNumberOrUndefined(currentUserId);
  const { t } = useTranslation();
  const { conversations: wsConversations, markRead, hydrateConversations } =
    useWebSocket();
  const { isDeactivated, loading: lifecycleLoading } = useAccountLifecycle();
  const chatDisabled = !lifecycleLoading && isDeactivated;

  const resolveLifecyclePlaceholder = useCallback(
    (status) => {
      if (!status || typeof status !== "string") {
        return undefined;
      }

      const normalizedStatus = status.trim().toLowerCase();

      if (normalizedStatus === "deactivated") {
        return t("common.placeholders.deactivatedAccount", {
          defaultValue: "Deactivated account",
        });
      }

      if (normalizedStatus === "deleted") {
        return t("common.placeholders.deletedUser", {
          defaultValue: "Deleted user",
        });
      }

      return undefined;
    },
    [t]
  );

  useEffect(() => {
    let isActive = true;

    const fetchConversations = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const response = await chatService.get("/conversations", {
          headers: {
            Authorization: `${token}`,
          },
        });

        const normalized = normalizeConversationList(response.data)
          .map(flattenConversationEntry)
          .filter(Boolean);

        if (isActive) {
          setConversations(normalized);
          setError(null);
        }

        hydrateConversations(normalized);
      } catch (err) {
        if (isActive) {
          setError("Failed to fetch conversations");
        }
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    };

    fetchConversations();

    return () => {
      isActive = false;
    };
  }, [chatDisabled, hydrateConversations]);

  useEffect(() => {
    if (!Array.isArray(conversations) || conversations.length === 0) {
      setProfiles({});
      return;
    }

    let isActive = true;

    const fetchProfiles = async () => {
      const token = localStorage.getItem("token");
      const uniqueIds = new Set();

      conversations.forEach((conv) => {
        const { otherUserId } = getConversationPartnerDetails(
          conv,
          normalizedCurrentUserId
        );

        if (
          otherUserId !== undefined &&
          otherUserId !== null &&
          otherUserId !== normalizedCurrentUserId
        ) {
          uniqueIds.add(otherUserId);
        }
      });

      if (uniqueIds.size === 0) {
        if (isActive) {
          setProfiles({});
        }
        return;
      }

      const profilesData = {};

      await Promise.all(
        Array.from(uniqueIds)
          .map((id) => toNumberOrUndefined(id))
          .filter(
            (id) =>
              id !== undefined && id !== null && id !== normalizedCurrentUserId
          )
          .map(async (id) => {
            try {
              const res = await api.get(`/user/profile/${id}`, {
                headers: { Authorization: `${token}` },
              });
              profilesData[id] = res.data;
            } catch (e) {
              // ignore individual profile fetch errors
            }
          })
      );

      if (isActive) {
        setProfiles(profilesData);
      }
    };

    fetchProfiles();

    return () => {
      isActive = false;
    };
  }, [conversations, normalizedCurrentUserId]);

  useEffect(() => {
    if (typeof onUnreadCountChange !== "function") {
      return;
    }

    const totalUnread = Array.isArray(conversations)
      ? conversations.reduce(
          (sum, conversation) => sum + extractUnreadCount(conversation),
          0
        )
      : 0;

    onUnreadCountChange(totalUnread);
  }, [conversations, onUnreadCountChange]);

  const resolveConversationId = useCallback(
    (conversation) =>
      pickFirst(
        conversation?.id,
        conversation?.conversation_id,
        conversation?.conversationId,
        conversation?.conversationID
      ),
    []
  );

  const getConversationKey = useCallback(
    (conversation) => {
      if (!conversation) {
        return undefined;
      }

      const resolved = resolveConversationId(conversation);
      if (resolved !== undefined && resolved !== null) {
        return String(resolved);
      }

      const fallback = pickFirst(
        conversation?.id,
        conversation?.conversation_id,
        conversation?.conversationId,
        conversation?.conversationID
      );

      return fallback !== undefined && fallback !== null
        ? String(fallback)
        : undefined;
    },
    [resolveConversationId]
  );

  const selectedConversation = useMemo(() => {
    if (selectedConversationId === null || selectedConversationId === undefined) {
      return null;
    }

    const targetKey = String(selectedConversationId);

    if (!Array.isArray(conversations)) {
      return null;
    }

    return (
      conversations.find(
        (conversation) => getConversationKey(conversation) === targetKey
      ) || null
    );
  }, [conversations, getConversationKey, selectedConversationId]);

  const conversationPreviews = useMemo(() => {
    if (!Array.isArray(conversations)) {
      return [];
    }

    return conversations.map((conversation) => {
      const conversationId = resolveConversationId(conversation);
      const conversationKey = getConversationKey(conversation);
      const partnerDetails = getConversationPartnerDetails(
        conversation,
        currentUserId,
        profiles
      );
      const lifecyclePlaceholder = resolveLifecyclePlaceholder(
        partnerDetails.lifecycleStatus
      );
      const effectiveDisplayName =
        lifecyclePlaceholder ?? partnerDetails.displayName;
      const { body, mime_type, timestamp } = extractLastMessageInfo(conversation);
      const messagePreview = buildMessagePreview(body, mime_type);
      const formattedTimestamp = formatLastMessageTimestamp(timestamp);
      const unreadCount = extractUnreadCount(conversation);
      const avatarInitial = effectiveDisplayName
        ? effectiveDisplayName.charAt(0).toUpperCase()
        : "?";

      return {
        conversation,
        conversationId,
        conversationKey,
        displayName: effectiveDisplayName,
        messagePreview,
        formattedTimestamp,
        unreadCount,
        avatarInitial,
      };
    });
  }, [
    conversations,
    currentUserId,
    getConversationKey,
    profiles,
    resolveConversationId,
    resolveLifecyclePlaceholder,
  ]);

  useEffect(() => {
    if (selectedConversationId === null || selectedConversationId === undefined) {
      return;
    }

    if (!Array.isArray(conversations)) {
      return;
    }

    const targetKey = String(selectedConversationId);
    const exists = conversations.some(
      (conversation) => getConversationKey(conversation) === targetKey
    );

    if (!exists) {
      setSelectedConversationId(null);
    }
  }, [conversations, getConversationKey, selectedConversationId]);

  const applyRealtimeUpdates = useCallback(
    (previous = []) => {
      if (
        !Array.isArray(previous) ||
        previous.length === 0 ||
        !wsConversations ||
        typeof wsConversations !== "object" ||
        Object.keys(wsConversations).length === 0
      ) {
        return previous;
      }

      let hasChanges = false;

      const nextConversations = previous.map((conversation) => {
        const conversationId = resolveConversationId(conversation);
        if (conversationId === undefined || conversationId === null) {
          return conversation;
        }

        const key = String(conversationId);
        const wsConversation =
          wsConversations[key] ?? wsConversations[conversationId];

        if (!wsConversation) {
          return conversation;
        }

        const conversationKey = getConversationKey(conversation);
        const patch = buildRealtimePatch({
          conversation,
          wsConversation,
          currentUserId,
          selectedConversationId,
          conversationKey,
        });

        if (!patch) {
          return conversation;
        }

        hasChanges = true;
        return { ...conversation, ...patch };
      });

      return hasChanges ? nextConversations : previous;
    },
    [
      currentUserId,
      getConversationKey,
      resolveConversationId,
      selectedConversationId,
      wsConversations,
    ]
  );

  useEffect(() => {
    setConversations((prev) => applyRealtimeUpdates(prev));
  }, [applyRealtimeUpdates]);

  const handleOpenConversation = useCallback(
    (conversation) => {
      if (!conversation) {
        return;
      }

      const resolvedId = resolveConversationId(conversation);
      const conversationKey = getConversationKey(conversation);

      if (conversationKey !== undefined) {
        setSelectedConversationId(conversationKey);
      } else {
        setSelectedConversationId(null);
      }

      let resolvedLastMessageId = extractLastMessageId(conversation);

      setConversations((prev) => {
        if (!Array.isArray(prev)) {
          return prev;
        }

        return prev.map((conv) => {
          const matches =
            conversationKey === undefined
              ? conv === conversation
              : getConversationKey(conv) === conversationKey;

          if (!matches) {
            return conv;
          }

          const conversationLastMessageId = extractLastMessageId(conv);
          const updates = {
            __localUnreadCount: 0,
            unread_count: 0,
            unreadCount: 0,
            unread_messages_count: 0,
          };

          if (conversationLastMessageId !== undefined) {
            resolvedLastMessageId = conversationLastMessageId;
            updates.__lastReadMessageId = conversationLastMessageId;

            const existingReadId = extractLastReadMessageId(conv);

            if (
              existingReadId === undefined ||
              existingReadId < conversationLastMessageId
            ) {
              updates.last_read_message_id = conversationLastMessageId;
              updates.lastReadMessageId = conversationLastMessageId;
            }
          }

          return { ...conv, ...updates };
        });
      });

      let lastMessageId = resolvedLastMessageId;

      if (
        lastMessageId === undefined &&
        wsConversations &&
        typeof wsConversations === "object"
      ) {
        const lookupKey =
          resolvedId !== undefined && resolvedId !== null
            ? resolvedId
            : conversationKey;

        if (lookupKey !== undefined && lookupKey !== null) {
          const wsConversation =
            wsConversations[String(lookupKey)] ?? wsConversations[lookupKey];

          if (
            wsConversation &&
            typeof wsConversation === "object" &&
            Array.isArray(wsConversation.messages)
          ) {
            const snapshot = getLatestMessageSnapshot(wsConversation.messages);
            lastMessageId = snapshot.messageId;
          }
        }
      }

      const conversationPatch = {
        ...conversation,
        __localUnreadCount: 0,
        unread_count: 0,
        unreadCount: 0,
        unread_messages_count: 0,
      };

      if (resolvedLastMessageId !== undefined && resolvedLastMessageId !== null) {
        conversationPatch.last_read_message_id = resolvedLastMessageId;
        conversationPatch.lastReadMessageId = resolvedLastMessageId;
      }

      hydrateConversations([conversationPatch]);

      if (typeof markRead === "function" && lastMessageId !== undefined) {
        const numericId = toNumberOrUndefined(resolvedId ?? conversationKey);
        const markId =
          numericId !== undefined
            ? numericId
            : conversationKey ?? resolvedId;

        if (markId !== undefined && markId !== null) {
          markRead(markId, lastMessageId);
        }
      }
    },
    [
      getConversationKey,
      hydrateConversations,
      markRead,
      resolveConversationId,
      wsConversations,
    ]
  );

  const handleCloseConversation = useCallback(() => {
    setSelectedConversationId(null);
  }, []);

  const activeConversationKey =
    selectedConversationId !== null && selectedConversationId !== undefined
      ? String(selectedConversationId)
      : null;

  const showListPane = !isMobile || !selectedConversation;
  const showChatPane = !isMobile || Boolean(selectedConversation);

  const selectedConversationDetails = useMemo(() => {
    if (!selectedConversation) {
      return null;
    }

    const details = getConversationPartnerDetails(
      selectedConversation,
      currentUserId,
      profiles
    );
    const placeholder = resolveLifecyclePlaceholder(details.lifecycleStatus);

    if (!placeholder) {
      return details;
    }

    return { ...details, displayName: placeholder };
  }, [
    currentUserId,
    profiles,
    resolveLifecyclePlaceholder,
    selectedConversation,
  ]);

  const selectedConversationBlocked = useMemo(() => {
    if (!selectedConversation) {
      return false;
    }

    return Boolean(
      pickFirst(
        selectedConversation.blocked,
        selectedConversation.is_blocked,
        selectedConversation.isBlocked,
        selectedConversation.Blocked
      )
    );
  }, [selectedConversation]);

  const selectedConversationUsers = useMemo(() => {
    if (!selectedConversation) {
      return { user1: { id: undefined }, user2: { id: undefined } };
    }

    return getConversationUsers(selectedConversation);
  }, [selectedConversation]);

  return (
    <Container sx={{ p: spacing.pagePadding }}>
      <Stack spacing={spacing.section} sx={{ height: "100%" }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Messages
        </Typography>
        {chatDisabled ? (
          <Alert severity="warning">{ACCOUNT_DEACTIVATED_MESSAGE}</Alert>
        ) : null}
        <Grid
          container
          spacing={3}
          sx={{
            minHeight: { xs: "60vh", md: "70vh" },
          }}
          alignItems="stretch"
        >
          {showListPane && (
            <Grid item xs={12} md={4} sx={{ display: "flex", minHeight: 0 }}>
              <ConversationListPane
                loading={loading}
                error={error}
                conversations={conversationPreviews}
                selectedConversationKey={activeConversationKey}
                onConversationSelect={handleOpenConversation}
              />
            </Grid>
          )}
          {showChatPane && (
            <Grid item xs={12} md={8} sx={{ display: "flex", minHeight: 0 }}>
              <Card
                elevation={3}
                sx={{
                  width: "100%",
                  display: "flex",
                  flexDirection: "column",
                  borderRadius: 3,
                  minHeight: { xs: "50vh", md: "100%" },
                  overflow: "hidden",
                }}
              >
                {selectedConversation ? (
                  <ChatDrawer
                    conversationId={resolveConversationId(selectedConversation)}
                    user1_id={selectedConversationUsers.user1.id}
                    user2_id={selectedConversationUsers.user2.id}
                    open={Boolean(selectedConversation)}
                    onClose={handleCloseConversation}
                    partnerName={selectedConversationDetails?.displayName}
                    partnerBio={selectedConversationDetails?.bio}
                    partnerLifecycleStatus={
                      selectedConversationDetails?.lifecycleStatus
                    }
                    blocked={selectedConversationBlocked}
                    messagingDisabled={chatDisabled}
                    messagingDisabledReason={
                      ACCOUNT_DEACTIVATED_MESSAGING_DISABLED_MESSAGE
                    }
                  />
                ) : (
                  <>
                    <CardHeader
                      title="Select a conversation"
                      subheader="Choose someone from the list to start chatting"
                      avatar={
                        <Avatar
                          variant="rounded"
                          sx={{ bgcolor: "secondary.light", color: "secondary.dark" }}
                        >
                          <ChatBubbleOutlineRoundedIcon />
                        </Avatar>
                      }
                      sx={{ px: spacing.section, py: spacing.section }}
                    />
                    <Divider sx={{ borderStyle: "dashed" }} />
                    <CardContent
                      sx={{
                        flexGrow: 1,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        textAlign: "center",
                      }}
                    >
                      <Stack spacing={1.5} alignItems="center" color="text.secondary">
                        <Typography variant="body1">
                          Select a conversation from the left to view messages.
                        </Typography>
                        <Typography variant="body2">
                          Once you pick someone, you can continue your conversation here.
                        </Typography>
                      </Stack>
                    </CardContent>
                  </>
                )}
              </Card>
            </Grid>
          )}
        </Grid>
      </Stack>
    </Container>
  );
}

export default Messages;
