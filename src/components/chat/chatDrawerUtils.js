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
      message.authorId,
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

const resolveMessageBody = (message = {}) =>
  pickFirst(
    message.body,
    message.message,
    message.text,
    message.content,
    message.Body,
    message.Message
  );

export {
  formatMessageTimestamp,
  resolveMessageBody,
  resolveMessageId,
  resolveMessageSenderId,
};
