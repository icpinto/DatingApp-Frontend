import {
  pickFirst,
  toNumberOrUndefined,
} from "./conversationUtils";

const toStringOrUndefined = (value) => {
  if (value === undefined || value === null) {
    return undefined;
  }

  return String(value);
};

const extractTimestamp = (value) => {
  if (!value && value !== 0) {
    return null;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return value;
};

const hasMessageChanged = (previous = {}, next = {}) => {
  const allKeys = new Set([
    ...Object.keys(previous || {}),
    ...Object.keys(next || {}),
  ]);

  for (const key of allKeys) {
    if (previous?.[key] !== next?.[key]) {
      return true;
    }
  }

  return false;
};

const normalizeMessage = (conversationId, message = {}, overrides = {}) => {
  const conversation_id =
    toNumberOrUndefined(
      pickFirst(
        message.conversation_id,
        message.conversationId,
        message.ConversationID,
        message.ConversationId
      )
    ) ?? toNumberOrUndefined(conversationId);

  const message_id = toStringOrUndefined(
    pickFirst(
      message.message_id,
      message.id,
      message.ID,
      message.MessageID,
      message.MessageId
    )
  );

  const client_msg_id = toStringOrUndefined(
    pickFirst(
      message.client_msg_id,
      message.clientMsgId,
      message.clientMsgID,
      message.ClientMsgId,
      message.ClientMsgID,
      message.temp_id,
      message.tempId
    )
  );

  const sender_id = toNumberOrUndefined(
    pickFirst(
      message.sender_id,
      message.senderId,
      message.SenderID,
      message.SenderId,
      message.user_id,
      message.UserID,
      message.UserId,
      message.sender?.id,
      message.sender?.user_id,
      message.sender?.userId,
      message.user?.id,
      message.user?.user_id,
      message.user?.userId,
      message.author?.id,
      message.author?.user_id,
      message.author?.userId
    )
  );

  const receiver_id = toNumberOrUndefined(
    pickFirst(
      message.receiver_id,
      message.receiverId,
      message.ReceiverID,
      message.ReceiverId,
      message.to,
      message.to_id,
      message.ToID,
      message.ToId,
      message.receiver?.id,
      message.receiver?.user_id,
      message.receiver?.userId,
      message.recipient?.id,
      message.recipient?.user_id,
      message.recipient?.userId
    )
  );

  const body = pickFirst(message.body, message.message, message.Body, "");
  const mime_type = pickFirst(
    message.mime_type,
    message.mimeType,
    message.MimeType,
    "text/plain"
  );

  const timestamp = extractTimestamp(
    pickFirst(
      message.timestamp,
      message.created_at,
      message.createdAt,
      message.CreatedAt,
      message.sent_at,
      message.sentAt,
      message.SentAt
    )
  );

  return {
    conversation_id,
    message_id,
    client_msg_id,
    sender_id,
    receiver_id,
    body,
    mime_type,
    timestamp,
    ...overrides,
  };
};

const extractLastReadId = (payload = {}) =>
  toNumberOrUndefined(
    pickFirst(
      payload.last_read_message_id,
      payload.lastReadMessageId,
      payload.last_read?.message_id,
      payload.last_read?.messageId,
      payload.lastRead?.message_id,
      payload.lastRead?.messageId
    )
  );

const resolveConversationKey = (
  msg = {},
  formattedMessage = {},
  payload = {}
) => {
  const candidate = pickFirst(
    msg.conversation_id,
    payload.conversation_id,
    payload.conversationId,
    payload.conversationID,
    formattedMessage.conversation_id
  );

  if (candidate === undefined || candidate === null) {
    return null;
  }

  return String(candidate);
};

const normalizeMessageHistory = (conversationId, messages, overrides = {}) =>
  Array.isArray(messages)
    ? messages.map((message) =>
        normalizeMessage(conversationId, message, overrides)
      )
    : [];

export {
  extractLastReadId,
  hasMessageChanged,
  normalizeMessage,
  normalizeMessageHistory,
  resolveConversationKey,
};
