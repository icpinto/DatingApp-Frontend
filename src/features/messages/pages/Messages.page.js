import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Alert, Container, Grid, Stack, Typography, useMediaQuery } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import ChatBubbleOutlineRoundedIcon from "@mui/icons-material/ChatBubbleOutlineRounded";
import ConversationListPane from "../ui/ConversationListPane";
import ChatDrawer from "../ui/ChatDrawer";
import { spacing } from "../../../styles";
import { useWebSocket } from "../../../shared/context/WebSocketProvider";
import { useTranslation } from "../../../i18n";
import { useAccountLifecycle } from "../../../shared/context/AccountLifecycleContext";
import { CAPABILITIES } from "../../../domain/capabilities";
import Guard from "./Guard";
import { useUserCapabilities, useUserContext } from "../../../shared/context/UserContext";
import FeatureCard from "../../../shared/components/FeatureCard";
import {
  pickFirst,
  toNumberOrUndefined,
  extractUnreadCount,
  extractLastMessageId,
  extractLastReadMessageId,
  getLatestMessageSnapshot,
} from "../../../utils/conversationUtils";
import {
  ACCOUNT_DEACTIVATED_MESSAGE,
  ACCOUNT_DEACTIVATED_MESSAGING_DISABLED_MESSAGE,
} from "../../../domain/accountLifecycle";
import {
  buildMessagePreview,
  extractLastMessageInfo,
  formatLastMessageTimestamp,
  getConversationPartnerDetails,
  getConversationUsers,
  getCurrentUserId,
} from "../utils/conversationDisplayHelpers";
import useConversations from "../hooks/useConversations";
import usePartnerProfiles from "../hooks/usePartnerProfiles";
import useRealtimePatches from "../hooks/useRealtimePatches";

function MessagesContent({
  onUnreadCountChange = () => {},
  accountLifecycle,
}) {
  const [selectedConversationId, setSelectedConversationId] = useState(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const currentUserId = getCurrentUserId();
  const normalizedCurrentUserId = toNumberOrUndefined(currentUserId);
  const { t } = useTranslation();
  const { conversations: wsConversations, markRead, hydrateConversations } =
    useWebSocket();
  const { groups } = useUserCapabilities();
  const { setConversationFacts, clearConversationFacts } = useUserContext();
  const { isDeactivated = false, loading: lifecycleLoading = false } =
    accountLifecycle || {};
  const chatDisabled = !lifecycleLoading && isDeactivated;
  const messagingCapabilities = groups.messaging;
  const canViewInbox = messagingCapabilities.viewInbox.can;
  const canViewConversationList = messagingCapabilities.viewConversations.can;
  const canOpenConversation = messagingCapabilities.openConversation.can;
  const canMarkRead = messagingCapabilities.markRead.can;
  const canViewPartnerStatus = messagingCapabilities.viewPartnerStatus.can;

  const { conversations, setConversations, loading, error } = useConversations({
    canViewInbox,
    canViewConversationList,
    chatDisabled,
    hydrateConversations,
  });

  const profiles = usePartnerProfiles({
    conversations,
    canViewPartnerStatus,
    chatDisabled,
    normalizedCurrentUserId,
  });

  const resolveLifecyclePlaceholder = useCallback(
    (status) => {
      if (!canViewPartnerStatus || !status || typeof status !== "string") {
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
    [canViewPartnerStatus, t]
  );

  useEffect(() => {
    if (!canViewInbox || !canViewConversationList || chatDisabled) {
      setSelectedConversationId(null);
      setConversations([]);
      return;
    }
  }, [
    canViewConversationList,
    canViewInbox,
    chatDisabled,
    setConversations,
    setSelectedConversationId,
  ]);

  useEffect(() => {
    if (typeof onUnreadCountChange !== "function" || !canViewConversationList) {
      return;
    }

    const totalUnread = Array.isArray(conversations)
      ? conversations.reduce(
          (sum, conversation) => sum + extractUnreadCount(conversation),
          0
        )
      : 0;

    onUnreadCountChange(totalUnread);
  }, [canViewConversationList, conversations, onUnreadCountChange]);

  useEffect(() => {
    if (canViewInbox && !chatDisabled) {
      return;
    }

    setSelectedConversationId(null);
    setConversations([]);
    clearConversationFacts();
  }, [
    canViewInbox,
    chatDisabled,
    clearConversationFacts,
    setConversations,
    setSelectedConversationId,
  ]);

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

  useRealtimePatches({
    canViewConversationList,
    currentUserId,
    wsConversations,
    selectedConversationId,
    resolveConversationId,
    getConversationKey,
    setConversations,
  });

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
    if (!canViewConversationList || !Array.isArray(conversations)) {
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
    canViewConversationList,
    conversations,
    currentUserId,
    getConversationKey,
    profiles,
    resolveConversationId,
    resolveLifecyclePlaceholder,
  ]);

  useEffect(() => {
    if (!canViewConversationList) {
      setSelectedConversationId(null);
      return;
    }

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
  }, [
    canViewConversationList,
    conversations,
    getConversationKey,
    selectedConversationId,
  ]);

  useEffect(() => {
    if (!canOpenConversation) {
      setSelectedConversationId(null);
    }
  }, [canOpenConversation]);

  const handleOpenConversation = useCallback(
    (conversation) => {
      if (!canOpenConversation) {
        return;
      }

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

      if (
        typeof markRead === "function" &&
        canMarkRead &&
        lastMessageId !== undefined
      ) {
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
      canMarkRead,
      canOpenConversation,
      getConversationKey,
      hydrateConversations,
      markRead,
      setConversations,
      resolveConversationId,
      wsConversations,
    ]
  );

  const handleCloseConversation = useCallback(() => {
    setSelectedConversationId(null);
  }, [setSelectedConversationId]);

  const activeConversationKey =
    selectedConversationId !== null && selectedConversationId !== undefined
      ? String(selectedConversationId)
      : null;

  const showListPane =
    canViewConversationList && (!isMobile || !selectedConversation);
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

  useEffect(() => {
    if (!canViewInbox || chatDisabled || !selectedConversation) {
      clearConversationFacts();
      return;
    }

    const lifecycleStatus = pickFirst(
      selectedConversationDetails?.lifecycleStatus,
      selectedConversation?.other_lifecycle_status,
      selectedConversation?.otherLifecycleStatus,
      selectedConversation?.partner_lifecycle_status,
      selectedConversation?.partnerLifecycleStatus
    );

    setConversationFacts({
      isBlocked: selectedConversationBlocked,
      partnerLifecycle: lifecycleStatus,
    });

    return () => {
      clearConversationFacts();
    };
  }, [
    canViewInbox,
    chatDisabled,
    selectedConversation,
    selectedConversationBlocked,
    selectedConversationDetails,
    setConversationFacts,
    clearConversationFacts,
  ]);

  return (
    <Container sx={{ p: spacing.pagePadding }}>
      <Stack spacing={spacing.section} sx={{ height: "100%" }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Messages
        </Typography>
        {chatDisabled ? (
          <Alert severity="warning">{ACCOUNT_DEACTIVATED_MESSAGE}</Alert>
        ) : null}
        <Guard
          can={CAPABILITIES.MESSAGING_VIEW_INBOX}
          fallback={
            <Alert severity="info">
              You do not have access to messaging yet.
            </Alert>
          }
        >
          <Grid
            container
            spacing={3}
            sx={{
              minHeight: { xs: "60vh", md: "70vh" },
            }}
            alignItems="stretch"
          >
            {showListPane ? (
              <Guard can={CAPABILITIES.MESSAGING_VIEW_CONVERSATIONS}>
                <Grid item xs={12} md={4} sx={{ display: "flex", minHeight: 0 }}>
                  <ConversationListPane
                    loading={loading}
                    error={error}
                    conversations={conversationPreviews}
                    selectedConversationKey={activeConversationKey}
                    onConversationSelect={handleOpenConversation}
                  />
                </Grid>
              </Guard>
            ) : null}
            {showChatPane ? (
              <Guard
                can={CAPABILITIES.MESSAGING_VIEW_HISTORY}
                fallback={
                  <Grid item xs={12} md={8} sx={{ display: "flex", minHeight: 0 }}>
                    <FeatureCard
                      divider={false}
                      sx={{
                        width: "100%",
                        display: "flex",
                        flexDirection: "column",
                        minHeight: { xs: "50vh", md: "100%" },
                      }}
                      contentProps={{
                        sx: {
                          flexGrow: 1,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          textAlign: "center",
                          px: spacing.section,
                          py: spacing.section,
                        },
                      }}
                    >
                      <Typography variant="body1" color="text.secondary">
                        You do not have permission to view message history.
                      </Typography>
                    </FeatureCard>
                  </Grid>
                }
              >
                <Grid item xs={12} md={8} sx={{ display: "flex", minHeight: 0 }}>
                  {(() => {
                    const showPlaceholder = !selectedConversation;
                    return (
                      <FeatureCard
                    sx={{
                      width: "100%",
                      display: "flex",
                      flexDirection: "column",
                      minHeight: { xs: "50vh", md: "100%" },
                    }}
                        title={
                          showPlaceholder
                            ? "Select a conversation"
                            : undefined
                        }
                        subheader={
                          showPlaceholder
                            ? "Choose someone from the list to start chatting"
                            : undefined
                        }
                        icon={
                          showPlaceholder
                            ? ChatBubbleOutlineRoundedIcon
                            : undefined
                        }
                        avatarProps={
                          showPlaceholder
                            ? {
                                sx: {
                                  bgcolor: "secondary.light",
                                  color: "secondary.dark",
                                },
                              }
                            : undefined
                        }
                        divider={showPlaceholder}
                        contentProps={{
                          sx: showPlaceholder
                            ? {
                                flexGrow: 1,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                textAlign: "center",
                              }
                            : {
                                flexGrow: 1,
                                display: "flex",
                                flexDirection: "column",
                                p: 0,
                              },
                        }}
                      >
                        {showPlaceholder ? (
                          <Stack
                            spacing={1.5}
                            alignItems="center"
                            color="text.secondary"
                          >
                            <Typography variant="body1">
                              Select a conversation from the left to view messages.
                            </Typography>
                            <Typography variant="body2">
                              Once you pick someone, you can continue your conversation here.
                            </Typography>
                          </Stack>
                        ) : (
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
                        )}
                      </FeatureCard>
                    );
                  })()}
                </Grid>
              </Guard>
            ) : null}
          </Grid>
        </Guard>
      </Stack>
    </Container>
  );
}

function MessagesPage(props) {
  const accountLifecycle = useAccountLifecycle();

  return <MessagesContent {...props} accountLifecycle={accountLifecycle} />;
}

export default MessagesPage;
