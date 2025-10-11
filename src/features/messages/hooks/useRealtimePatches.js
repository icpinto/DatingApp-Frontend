import { useCallback, useEffect } from "react";

import {
  extractLastMessageId,
  extractLastReadMessageId,
  extractUnreadCount,
  getLatestMessageSnapshot,
  toNumberOrUndefined,
} from "../../../utils/conversationUtils";

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

  const wsUnreadCount = toNumberOrUndefined(extractUnreadCount(wsConversation));
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
  const previousUnread = toNumberOrUndefined(extractUnreadCount(conversation));

  if (unreadCount !== undefined && unreadCount !== previousUnread) {
    updates.__localUnreadCount = unreadCount;
    updates.unread_count = unreadCount;
    updates.unreadCount = unreadCount;
    updates.unread_messages_count = unreadCount;
  }

  const normalizedLastRead = toNumberOrUndefined(lastRead);
  const existingLastRead = extractLastReadMessageId(conversation);

  if (normalizedLastRead !== undefined && normalizedLastRead !== existingLastRead) {
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

const useRealtimePatches = ({
  canViewConversationList,
  currentUserId,
  wsConversations,
  selectedConversationId,
  resolveConversationId,
  getConversationKey,
  setConversations,
}) => {
  const applyRealtimeUpdates = useCallback(
    (previous = []) => {
      if (!canViewConversationList) {
        return previous;
      }

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
      canViewConversationList,
      currentUserId,
      getConversationKey,
      resolveConversationId,
      selectedConversationId,
      wsConversations,
    ]
  );

  useEffect(() => {
    setConversations((prev) => applyRealtimeUpdates(prev));
  }, [applyRealtimeUpdates, setConversations]);

  return { applyRealtimeUpdates };
};

export default useRealtimePatches;
