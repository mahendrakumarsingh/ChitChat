/**
 * @typedef {Object} User
 * @property {string} id
 * @property {string} name
 * @property {string} email
 * @property {string} [avatar]
 * @property {'online'|'offline'|'away'|'typing'} status
 * @property {Date} [lastSeen]
 */

/**
 * @typedef {Object} Reaction
 * @property {string} emoji
 * @property {string} userId
 */

/**
 * @typedef {Object} Message
 * @property {string} id
 * @property {string} content
 * @property {string} senderId
 * @property {User} sender
 * @property {Date} timestamp
 * @property {'text'|'image'|'file'} type
 * @property {string} [fileUrl]
 * @property {string} [fileName]
 * @property {string[]} readBy
 * @property {Reaction[]} [reactions]
 */

/**
 * @typedef {Object} Conversation
 * @property {string} id
 * @property {string} name
 * @property {string} [avatar]
 * @property {User[]} participants
 * @property {Message} [lastMessage]
 * @property {number} unreadCount
 * @property {boolean} isGroup
 * @property {Date} updatedAt
 */

/**
 * @typedef {Object} TypingIndicator
 * @property {string} conversationId
 * @property {string} userId
 * @property {string} userName
 */

/**
 * @typedef {Object} AuthState
 * @property {boolean} isAuthenticated
 * @property {User|null} user
 * @property {string|null} token
 */

/**
 * @typedef {Object} ChatState
 * @property {Conversation[]} conversations
 * @property {string|null} activeConversation
 * @property {Object.<string, Message[]>} messages
 * @property {TypingIndicator[]} typingIndicators
 * @property {string[]} onlineUsers
 */

export {};
