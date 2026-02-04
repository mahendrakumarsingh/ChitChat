const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: 'Missing fields' });

    // Check if email or username (derived from name?) exists
    // For simplicity, let's generate username from name or use email prefix
    // But the schema requires username. Let's use email as username or allow user to provide it?
    // The frontend form provides: Name, Email, Password.
    // Let's derive username from email prefix for now + random number to ensure uniqueness
    const username = email.split('@')[0] + Math.floor(Math.random() * 1000);

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ error: 'User already exists' });

    const hash = await bcrypt.hash(password, 10);
    const user = new User({
      username,
      email,
      name,
      passwordHash: hash
    });
    await user.save();
    res.status(201).json({ ok: true, id: user._id, username: user.username, email: user.email });
  } catch (err) {
    console.error(err);
    if (err.code === 11000) {
      return res.status(400).json({ error: 'Email or Username already taken' });
    }
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body; // Expecting email for login now as per AuthScreen inputs
    // Wait, AuthScreen sends "username" and "password" in useAuth.js login function?
    // Let's check useAuth.js again.
    // useAuth.js login(username, password) -> body { username, password }
    // AuthScreen calls login(formData.email, formData.password).
    // So "username" argument in useAuth contains the email.
    // So the payload key is "username" but value is email.

    // To be safe, let's check both or fix frontend to send "email".
    // Let's assume frontend sends { username: "email@val", password: "..." }
    // So we check if the input looks like an email?

    // Actually, I will update useAuth.js to send { email, password } for login.
    // So here I should expect { email, password }.

    if (!email || !password) return res.status(400).json({ error: 'Missing fields' });

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id, username: user.username }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, id: user._id, username: user.username, email: user.email, name: user.name });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
