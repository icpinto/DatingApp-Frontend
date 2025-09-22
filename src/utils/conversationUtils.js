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
    conversation.unread_messages,
    conversation.unreadMessages,
    conversation.unread_total,
    conversation.unreadTotal,
    conversation.unread,
    conversation.unreadMessagesCount
  );

  return Math.max(0, extractNumericValue(candidate));
};

