const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: true },
  email: { type: String, unique: true, required: true },
  name: { type: String },
  passwordHash: { type: String, required: true },
  contacts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  avatar: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema);
