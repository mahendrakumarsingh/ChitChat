const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  senderName: String,
  content: { type: String, default: '' },
  type: { type: String, enum: ['text', 'image', 'file', 'audio'], default: 'text' },
  fileUrl: String,
  fileName: String,
  fileSize: Number,
  roomId: { type: String, default: 'global' },
  deletedFor: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  isDeleted: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Message', MessageSchema);
