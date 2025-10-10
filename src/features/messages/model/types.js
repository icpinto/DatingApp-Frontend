/**
 * @typedef {Object} Conversation
 * @property {string} id
 * @property {string} peerId
 * @property {string} peerName
 * @property {string=} peerAvatarUrl
 * @property {string=} peerBio
 * @property {string=} lastMessagePreview
 * @property {string=} lastMessageAt
 * @property {number=} unreadCount
 * @property {boolean=} blocked
 */

/**
 * @typedef {Object} Message
 * @property {string} id
 * @property {string} conversationId
 * @property {string} senderId
 * @property {string} text
 * @property {string} createdAt
 */

/**
 * @typedef {Object} Thread
 * @property {Conversation|null} conversation
 * @property {Message[]} messages
 * @property {string=} peerStatus
 * @property {boolean=} blocked
 */

export const createEmptyThread = () => ({
  conversation: null,
  messages: [],
  peerStatus: undefined,
  blocked: false,
});
