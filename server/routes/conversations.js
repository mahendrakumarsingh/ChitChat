const express = require('express');
const Conversation = require('../models/Conversation');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// GET /api/conversations - Get all conversations for current user
router.get('/', auth, async (req, res) => {
    try {
        const conversations = await Conversation.find({
            members: { $in: [req.user.id] }
        })
            .populate('members', 'username name avatar')
            .populate('lastMessage')
            .sort({ updatedAt: -1 });

        res.json(conversations);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// POST /api/conversations - Create or get existing conversation
router.post('/', auth, async (req, res) => {
    try {
        const { receiverId } = req.body;

        if (!receiverId) return res.status(400).json({ error: 'Receiver ID is required' });

        // Check if conversation already exists
        let conversation = await Conversation.findOne({
            members: { $all: [req.user.id, receiverId] },
            isGroup: false
        });

        if (conversation) {
            return res.json(conversation);
        }

        // Create new conversation
        conversation = new Conversation({
            members: [req.user.id, receiverId]
        });

        await conversation.save();

        // Populate members for response
        conversation = await conversation.populate('members', 'username name avatar');

        res.status(201).json(conversation);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
