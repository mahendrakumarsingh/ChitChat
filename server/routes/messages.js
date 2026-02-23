const express = require('express');
const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// GET /api/messages/:conversationId
router.get('/:conversationId', auth, async (req, res) => {
  try {
    const { conversationId } = req.params;

    // Validate membership
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) return res.status(404).json({ error: 'Conversation not found' });

    if (!conversation.members.includes(req.user.id)) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const msgs = await Message.find({
      roomId: conversationId,
      deletedFor: { $ne: req.user.id } // Filter out messages deleted for this user
    })
      .sort({ createdAt: 1 })
      .limit(200)
      .populate('senderId', 'username name avatar');
    res.json(msgs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/messages/:messageId
router.delete('/:messageId', auth, async (req, res) => {
  try {
    const { messageId } = req.params;
    const { mode } = req.query; // 'me' or 'everyone'

    const msg = await Message.findById(messageId);
    if (!msg) return res.status(404).json({ error: 'Message not found' });

    if (mode === 'everyone') {
      // Only sender can delete for everyone
      if (msg.senderId.toString() !== req.user.id) {
        return res.status(403).json({ error: 'Not authorized to delete this message for everyone' });
      }
      msg.isDeleted = true;
      msg.content = 'This message was deleted';
      msg.type = 'text'; // Reset type to text to show placeholder
      msg.fileUrl = undefined;
    } else {
      // Delete for me
      if (!msg.deletedFor.includes(req.user.id)) {
        msg.deletedFor.push(req.user.id);
      }
    }

    await msg.save();

    // Notify about deletion
    if (req.io && req.socketService) {
      if (mode === 'everyone') {
        const conversation = await Conversation.findById(msg.roomId);
        if (conversation) {
          conversation.members.forEach(memberId => {
            // Emit to all members
            req.socketService.emitToUser(memberId.toString(), 'message:delete', {
              messageId,
              conversationId: msg.roomId
            });
          });
        }
      } else {
        // Emit only to requestor if just deleted for me
        // (Though frontend often handles this optimistically, good to confirm)
        req.socketService.emitToUser(req.user.id, 'message:delete', {
          messageId,
          conversationId: msg.roomId,
          mode: 'me'
        });
      }
    }

    res.json({ success: true, messageId, mode, isDeleted: msg.isDeleted });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// POST /api/messages
router.post('/', auth, upload.single('file'), async (req, res) => {
  try {
    const { content, conversationId, type } = req.body;

    // Allow empty content if there is a file
    if ((!content && !req.file) || !conversationId) {
      return res.status(400).json({ error: 'Missing content/file or conversationId' });
    }

    // Validate membership
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) return res.status(404).json({ error: 'Conversation not found' });

    // Check if user is member of conversation
    if (!conversation.members.includes(req.user.id)) {
      return res.status(403).json({ error: 'Not authorized to send to this conversation' });
    }

    const msgData = {
      senderId: req.user.id,
      senderName: req.user.username,
      content: content || '',
      roomId: conversationId,
      type: type || 'text'
    };

    if (req.file) {
      const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 4000}`;
      msgData.fileUrl = `${baseUrl}/uploads/${req.file.filename}`;
      msgData.fileName = req.file.originalname;
      msgData.fileSize = req.file.size;

      // Auto-detect type if not provided
      if (!type) {
        if (req.file.mimetype.startsWith('image/')) msgData.type = 'image';
        else if (req.file.mimetype.startsWith('audio/')) msgData.type = 'audio';
        else msgData.type = 'file';
      }
    }

    const msg = new Message(msgData);
    await msg.save();

    // Populate sender details for the response
    await msg.populate('senderId', 'username name avatar');

    // Update conversation lastMessage
    conversation.lastMessage = msg._id;
    conversation.updatedAt = new Date();
    await conversation.save();

    res.status(201).json(msg);

    // Emit real-time message
    if (req.io && req.socketService) {
      conversation.members.forEach(memberId => {
        // Don't need to emit to sender if they handle it optimistically, 
        // but often it's good for confirmation or just emit to everyone.
        // The helper emits to specific users.
        req.socketService.emitToUser(memberId.toString(), 'message:new', msg);
      });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
