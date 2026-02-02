const mongoose = require('mongoose');

const ConversationSchema = new mongoose.Schema({
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    lastMessage: { type: mongoose.Schema.Types.ObjectId, ref: 'Message' },
    isGroup: { type: Boolean, default: false },
    name: { type: String }, // For group chats
}, { timestamps: true });

module.exports = mongoose.model('Conversation', ConversationSchema);
