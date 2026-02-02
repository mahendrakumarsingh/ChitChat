const express = require('express');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// GET /api/contacts - Get user's contacts
router.get('/', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).populate('contacts', 'username _id');
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json(user.contacts);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// POST /api/contacts/add - Add a contact by username
router.post('/add', auth, async (req, res) => {
    try {
        const { username } = req.body;
        if (!username) return res.status(400).json({ error: 'Username or email is required' });

        if (username === req.user.username || username === req.user.email) {
            return res.status(400).json({ error: 'Cannot add yourself as a contact' });
        }

        // Case-insensitive search by username OR email
        const contactUser = await User.findOne({
            $or: [
                { username: { $regex: new RegExp(`^${username}$`, 'i') } },
                { email: { $regex: new RegExp(`^${username}$`, 'i') } }
            ]
        });

        if (!contactUser) {
            return res.status(404).json({ error: 'User not found' });
        }

        const currentUser = await User.findById(req.user.id);

        // Check if already in contacts
        if (currentUser.contacts.includes(contactUser._id)) {
            return res.status(400).json({ error: 'User already in contacts' });
        }

        currentUser.contacts.push(contactUser._id);
        await currentUser.save();

        res.json({
            message: 'Contact added',
            contact: {
                id: contactUser._id,
                username: contactUser.username
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
