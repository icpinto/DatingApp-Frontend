import { pickFirst, toNumberOrUndefined } from "../../../utils/conversationUtils";

const toTrimmedStringOrUndefined = (value) => {
  if (value === undefined || value === null) {
    return undefined;
  }

  const stringified = String(value).trim();
  return stringified.length ? stringified : undefined;
};

const parseUserLikeObject = (value) => {
  if (!value || typeof value !== "object") {
    return { id: undefined, username: undefined };
  }

  const id = toNumberOrUndefined(
    pickFirst(
      value.user_id,
      value.id,
      value.userId,
      value.UserID,
      value.UserId,
      value.profile_id,
      value.profileId,
      value.user?.id,
      value.user?.user_id
    )
  );

  const username = toTrimmedStringOrUndefined(
    pickFirst(
      value.username,
      value.user_name,
      value.name,
      value.display_name,
      value.displayName,
      value.handle,
      value.user?.username,
      value.user?.name,
      value.profile?.username,
      value.profile?.name
    )
  );

  return { id, username };
};

const getUserInfoFromKeys = (conversation, keys = []) => {
  let id;
  let username;

  keys.forEach((key) => {
    if (!key) return;

    const directId = toNumberOrUndefined(
      pickFirst(
        conversation?.[`${key}_id`],
        conversation?.[`${key}Id`],
        conversation?.[`${key}ID`],
        conversation?.[`${key}_user_id`]
      )
    );

    if (id === undefined && directId !== undefined) {
      id = directId;
    }

    const directUsername = toTrimmedStringOrUndefined(
      pickFirst(
        conversation?.[`${key}_username`],
        conversation?.[`${key}_name`],
        conversation?.[`${key}Username`],
        conversation?.[`${key}Name`]
      )
    );

    if (!username && directUsername) {
      username = directUsername;
    }

    const nested = conversation?.[key];
    const nestedInfo = parseUserLikeObject(nested);

    if (id === undefined && nestedInfo.id !== undefined) {
      id = nestedInfo.id;
    }

    if (!username && nestedInfo.username) {
      username = nestedInfo.username;
    }
  });

  return { id, username };
};

const getConversationUsers = (conversation = {}) => ({
  user1: getUserInfoFromKeys(conversation, [
    "user1",
    "user_one",
    "userOne",
    "user_1",
    "first_user",
    "firstUser",
  ]),
  user2: getUserInfoFromKeys(conversation, [
    "user2",
    "user_two",
    "userTwo",
    "user_2",
    "second_user",
    "secondUser",
  ]),
});

const getProfileDisplayName = (profile) => {
  if (!profile || typeof profile !== "object") {
    return undefined;
  }

  const preferred = toTrimmedStringOrUndefined(
    pickFirst(
      profile.username,
      profile.display_name,
      profile.displayName,
      profile.name,
      profile.preferred_name,
      profile.preferredName,
      profile.user?.username,
      profile.user?.name
    )
  );

  if (preferred) {
    return preferred;
  }

  const fullName = [
    toTrimmedStringOrUndefined(pickFirst(profile.first_name, profile.firstName)),
    toTrimmedStringOrUndefined(pickFirst(profile.last_name, profile.lastName)),
  ]
    .filter(Boolean)
    .join(" ");

  if (fullName.trim().length) {
    return fullName.trim();
  }

  const email = toTrimmedStringOrUndefined(profile.email);
  if (email) {
    const usernamePart = email.split("@")[0];
    return usernamePart || undefined;
  }

  return undefined;
};

const getConversationPartnerDetails = (
  conversation = {},
  currentUserId,
  profiles = {}
) => {
  const { user1, user2 } = getConversationUsers(conversation);

  let otherUserId;
  let conversationUsername;

  const lifecycleStatusRaw = toTrimmedStringOrUndefined(
    pickFirst(
      conversation.other_lifecycle_status,
      conversation.otherLifecycleStatus,
      conversation.other_user_lifecycle_status,
      conversation.otherUserLifecycleStatus,
      conversation.partner_lifecycle_status,
      conversation.partnerLifecycleStatus
    )
  );

  const lifecycleStatus = lifecycleStatusRaw
    ? lifecycleStatusRaw.toLowerCase()
    : undefined;

  if (
    user1.id !== undefined &&
    currentUserId !== undefined &&
    user1.id === currentUserId
  ) {
    otherUserId = user2.id;
    conversationUsername = user2.username;
  } else if (
    user2.id !== undefined &&
    currentUserId !== undefined &&
    user2.id === currentUserId
  ) {
    otherUserId = user1.id;
    conversationUsername = user1.username;
  } else {
    if (user1.id !== undefined && user1.id !== currentUserId) {
      otherUserId = user1.id;
      conversationUsername = user1.username;
    } else if (user2.id !== undefined && user2.id !== currentUserId) {
      otherUserId = user2.id;
      conversationUsername = user2.username;
    } else {
      conversationUsername = user1.username || user2.username;
    }
  }

  if (otherUserId === undefined || otherUserId === currentUserId) {
    const candidateArrays = [
      conversation.users,
      conversation.participants,
      conversation.members,
      conversation.memberships,
      conversation.userProfiles,
      conversation.profileUsers,
    ];

    for (const arr of candidateArrays) {
      if (!Array.isArray(arr)) continue;

      for (const entry of arr) {
        const parsed = parseUserLikeObject(entry);

        if (!conversationUsername && parsed.username) {
          conversationUsername = parsed.username;
        }

        if (
          parsed.id !== undefined &&
          (currentUserId === undefined || parsed.id !== currentUserId)
        ) {
          otherUserId = parsed.id;
          if (!conversationUsername && parsed.username) {
            conversationUsername = parsed.username;
          }
          break;
        }
      }

      if (otherUserId !== undefined && otherUserId !== currentUserId) {
        break;
      }
    }
  }

  const profile =
    otherUserId !== undefined && otherUserId !== null
      ? profiles?.[otherUserId]
      : undefined;

  const profileName = getProfileDisplayName(profile);
  let displayName =
    toTrimmedStringOrUndefined(conversationUsername) ||
    toTrimmedStringOrUndefined(profileName) ||
    "Unknown user";

  if (lifecycleStatus === "deactivated") {
    displayName = "Deactivated account";
  } else if (lifecycleStatus === "deleted") {
    displayName = "Deleted user";
  }

  const bio = toTrimmedStringOrUndefined(profile?.bio) || "No bio available";

  return { otherUserId, displayName, bio, lifecycleStatus };
};

const extractLastMessageInfo = (conversation = {}) => {
  const lastMessage = pickFirst(
    conversation.last_message,
    conversation.lastMessage,
    conversation.latest_message,
    conversation.latestMessage,
    conversation.most_recent_message,
    conversation.mostRecentMessage
  );

  let body = pickFirst(
    conversation.last_message_body,
    conversation.lastMessageBody
  );
  let mime_type = pickFirst(
    conversation.last_message_mime_type,
    conversation.lastMessageMimeType
  );
  let timestamp = pickFirst(
    conversation.last_message_timestamp,
    conversation.lastMessageTimestamp,
    conversation.last_message_sent_at,
    conversation.lastMessageSentAt,
    conversation.last_message_time,
    conversation.lastMessageTime
  );

  if (
    lastMessage &&
    typeof lastMessage === "object" &&
    !Array.isArray(lastMessage)
  ) {
    body = pickFirst(
      body,
      lastMessage.body,
      lastMessage.message,
      lastMessage.text,
      lastMessage.content,
      lastMessage.Body,
      lastMessage.Message
    );
    mime_type = pickFirst(
      mime_type,
      lastMessage.mime_type,
      lastMessage.mimeType,
      lastMessage.MimeType
    );
    timestamp = pickFirst(
      timestamp,
      lastMessage.timestamp,
      lastMessage.created_at,
      lastMessage.createdAt,
      lastMessage.sent_at,
      lastMessage.sentAt,
      lastMessage.updated_at,
      lastMessage.updatedAt
    );
  } else if (lastMessage !== undefined && lastMessage !== null) {
    body = pickFirst(body, lastMessage);
  }

  return {
    body,
    mime_type,
    timestamp,
  };
};

const buildMessagePreview = (body, mimeType) => {
  if (mimeType && mimeType !== "text/plain") {
    return "Media message";
  }

  if (typeof body === "string") {
    const trimmed = body.trim();
    return trimmed.length ? trimmed : "No messages yet";
  }

  if (body !== undefined && body !== null) {
    try {
      const stringified = String(body);
      return stringified.trim().length ? stringified : "No messages yet";
    } catch (err) {
      return "No messages yet";
    }
  }

  return "No messages yet";
};

const formatLastMessageTimestamp = (timestamp) => {
  if (!timestamp) {
    return "";
  }

  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const now = new Date();
  const sameDay = date.toDateString() === now.toDateString();

  if (sameDay) {
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  const sameYear = date.getFullYear() === now.getFullYear();
  return date.toLocaleDateString([], {
    month: "short",
    day: "numeric",
    ...(sameYear ? {} : { year: "numeric" }),
  });
};

const getCurrentUserId = () =>
  toNumberOrUndefined(localStorage.getItem("user_id"));

export {
  buildMessagePreview,
  extractLastMessageInfo,
  formatLastMessageTimestamp,
  getConversationPartnerDetails,
  getConversationUsers,
  getCurrentUserId,
  parseUserLikeObject,
  toTrimmedStringOrUndefined,
};
