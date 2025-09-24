export const pickFirst = (...values) =>
  values.find((value) => value !== undefined && value !== null);

export const toNumberOrUndefined = (value) => {
  if (value === undefined || value === null) {
    return undefined;
  }

  const numeric = Number(value);
  return Number.isNaN(numeric) ? undefined : numeric;
};

export const normalizeConversationList = (payload) => {
  const visited = new WeakSet();

  const explore = (value) => {
    if (Array.isArray(value)) {
      return value;
    }

    if (!value || typeof value !== "object") {
      return [];
    }

    if (visited.has(value)) {
      return [];
    }

    visited.add(value);

    const preferredKeys = ["conversations", "data", "results", "items"];
    for (const key of preferredKeys) {
      if (Array.isArray(value[key])) {
        return value[key];
      }
    }

    for (const child of Object.values(value)) {
      const nested = explore(child);
      if (nested.length) {
        return nested;
      }
    }

    return [];
  };

  return explore(payload);
};

export const flattenConversationEntry = (entry) => {
  if (entry && typeof entry === "object" && entry.conversation) {
    const { conversation, ...rest } = entry;
    return { ...conversation, ...rest };
  }

  return entry;
};

const pickNumeric = (...sources) => {
  for (const source of sources) {
    if (source === undefined) {
      continue;
    }

    if (
      source &&
      typeof source === "object" &&
      Object.prototype.hasOwnProperty.call(source, "value")
    ) {
      const { value, treatNullAsZero = false } = source;

      if (value === null) {
        if (treatNullAsZero) {
          return 0;
        }

        continue;
      }

      const numeric = toNumberOrUndefined(value);
      if (numeric !== undefined) {
        return numeric;
      }

      continue;
    }

    if (source === null) {
      continue;
    }

    const numeric = toNumberOrUndefined(source);
    if (numeric !== undefined) {
      return numeric;
    }
  }

  return undefined;
};

export const extractLastMessageId = (conversation = {}) =>
  pickNumeric(
    conversation.__lastMessageId,
    conversation.last_message_id,
    conversation.lastMessageId,
    conversation.last_message?.message_id,
    conversation.last_message?.messageId,
    conversation.last_message?.MessageID,
    conversation.last_message?.id,
    conversation.last_message?.ID,
    conversation.lastMessage?.message_id,
    conversation.lastMessage?.messageId,
    conversation.lastMessage?.MessageID,
    conversation.lastMessage?.id,
    conversation.lastMessage?.ID,
    conversation.last_message?.message?.id,
    conversation.last_message?.message?.message_id,
    conversation.last_message?.message?.messageId
  );

export const extractLastReadMessageId = (conversation = {}) =>
  pickNumeric(
    conversation.__lastReadMessageId,
    { value: conversation.last_read_message_id, treatNullAsZero: true },
    { value: conversation.lastReadMessageId, treatNullAsZero: true },
    { value: conversation.last_read_message?.message_id, treatNullAsZero: true },
    { value: conversation.last_read_message?.messageId, treatNullAsZero: true },
    { value: conversation.last_read_message?.MessageID, treatNullAsZero: true },
    { value: conversation.last_read_message?.id, treatNullAsZero: true },
    { value: conversation.last_read_message?.ID, treatNullAsZero: true },
    { value: conversation.last_read?.message_id, treatNullAsZero: true },
    { value: conversation.last_read?.messageId, treatNullAsZero: true },
    { value: conversation.last_read?.MessageID, treatNullAsZero: true },
    { value: conversation.last_read?.id, treatNullAsZero: true },
    { value: conversation.last_read?.ID, treatNullAsZero: true },
    { value: conversation.lastRead?.message_id, treatNullAsZero: true },
    { value: conversation.lastRead?.messageId, treatNullAsZero: true },
    { value: conversation.lastRead?.MessageID, treatNullAsZero: true },
    { value: conversation.lastRead?.id, treatNullAsZero: true },
    { value: conversation.lastRead?.ID, treatNullAsZero: true }
  );

const extractNumericValue = (value) => {
  if (Array.isArray(value)) {
    return value.length;
  }

  if (value && typeof value === "object") {
    const nested = pickFirst(
      value.__localUnreadCount,
      value.count,
      value.total,
      value.unread,
      value.value,
      value.messages,
      value.messageCount
    );

    if (Array.isArray(nested)) {
      return nested.length;
    }

    const numeric = toNumberOrUndefined(nested);
    if (numeric !== undefined) {
      return numeric;
    }
  }

  const numeric = toNumberOrUndefined(value);
  if (numeric !== undefined) {
    return numeric;
  }

  if (value === true) {
    return 1;
  }

  return 0;
};

const exploreUnreadFields = (value, visited = new WeakSet()) => {
  if (!value || typeof value !== "object") {
    return undefined;
  }

  if (visited.has(value)) {
    return undefined;
  }

  visited.add(value);

  let fallback;

  for (const [key, nestedValue] of Object.entries(value)) {
    if (typeof key === "string" && key.toLowerCase().includes("unread")) {
      const numeric = extractNumericValue(nestedValue);

      if (numeric > 0) {
        return numeric;
      }

      if (fallback === undefined) {
        fallback = numeric;
      }
    }
  }

  for (const nestedValue of Object.values(value)) {
    if (nestedValue && typeof nestedValue === "object") {
      const nestedNumeric = exploreUnreadFields(nestedValue, visited);

      if (nestedNumeric !== undefined) {
        if (nestedNumeric > 0) {
          return nestedNumeric;
        }

        if (fallback === undefined) {
          fallback = nestedNumeric;
        }
      }
    }
  }

  return fallback;
};

export const extractUnreadCount = (conversation = {}) => {
  const localOverride = toNumberOrUndefined(conversation.__localUnreadCount);
  if (localOverride !== undefined) {
    return Math.max(0, localOverride);
  }

  const candidate = pickFirst(
    conversation.unread_count,
    conversation.unreadCount,
    conversation.unread_message_count,
    conversation.unreadMessageCount,
    conversation.unread_messages_count,
    conversation.unreadMessagesCount,
    conversation.unread_messages_total,
    conversation.unreadMessagesTotal,
    conversation.unread_message_total,
    conversation.unreadMessageTotal,
    conversation.unread_messages,
    conversation.unreadMessages,
    conversation.unread_total,
    conversation.unreadTotal,
    conversation.unread
  );

  if (candidate !== undefined) {
    return Math.max(0, extractNumericValue(candidate));
  }

  const lastMessageId = extractLastMessageId(conversation);
  const lastReadMessageId = extractLastReadMessageId(conversation);

  if (
    lastMessageId !== undefined &&
    lastReadMessageId !== undefined &&
    lastMessageId !== null &&
    lastReadMessageId !== null
  ) {
    return Math.max(0, lastMessageId - lastReadMessageId);
  }

  const explored = exploreUnreadFields(conversation);

  if (explored !== undefined) {
    return Math.max(0, explored);
  }

  return 0;
};

const extractMessageId = (message = {}) =>
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

const extractMessageSenderId = (message = {}) =>
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

const extractMessageBody = (message = {}) =>
  pickFirst(
    message.body,
    message.message,
    message.text,
    message.content,
    message.Body,
    message.Message
  );

const extractMessageMimeType = (message = {}) =>
  pickFirst(message.mime_type, message.mimeType, message.MimeType);

const extractMessageTimestamp = (message = {}) =>
  pickFirst(
    message.timestamp,
    message.created_at,
    message.createdAt,
    message.sent_at,
    message.sentAt,
    message.updated_at,
    message.updatedAt
  );

export const getLatestMessageSnapshot = (messages = []) => {
  if (!Array.isArray(messages) || messages.length === 0) {
    return {
      message: undefined,
      messageId: undefined,
      body: undefined,
      mimeType: undefined,
      timestamp: undefined,
    };
  }

  const latest = messages[messages.length - 1];

  return {
    message: latest,
    messageId: extractMessageId(latest),
    body: extractMessageBody(latest),
    mimeType: extractMessageMimeType(latest),
    timestamp: extractMessageTimestamp(latest),
  };
};

export const computeUnreadFromMessageHistory = (
  messages = [],
  lastReadId,
  currentUserId
) => {
  if (!Array.isArray(messages) || messages.length === 0) {
    return 0;
  }

  const normalizedLastRead = toNumberOrUndefined(lastReadId);

  return messages.reduce((count, message) => {
    if (!message || typeof message !== "object") {
      return count;
    }

    if (message.pending) {
      return count;
    }

    const senderId = extractMessageSenderId(message);
    if (
      currentUserId !== undefined &&
      senderId !== undefined &&
      senderId === currentUserId
    ) {
      return count;
    }

    const messageId = extractMessageId(message);
    if (messageId === undefined) {
      return count;
    }

    if (normalizedLastRead !== undefined) {
      return messageId > normalizedLastRead ? count + 1 : count;
    }

    return count + 1;
  }, 0);
};

