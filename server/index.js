const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const mongoUri = process.env.MONGODB_URI;
if (!mongoUri) {
  console.error('Missing MONGODB_URI in environment');
  process.exit(1);
}

// Robust connection with retry on transient failures
const connectWithRetry = (attempt = 0) => {
  const opts = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000, // fail fast so we can retry quickly
    connectTimeoutMS: 10000,
  };

  mongoose.connect(mongoUri, opts)
    .then(() => {
      console.log('MongoDB connected');
    })
    .catch(err => {
      console.error(`MongoDB connection error (attempt ${attempt + 1}):`, err && err.message ? err.message : err);
      const delay = Math.min(1000 * Math.pow(2, attempt), 30000); // exponential backoff capped at 30s
      console.log(`Retrying MongoDB connection in ${delay / 1000}s...`);
      setTimeout(() => connectWithRetry(attempt + 1), delay);
    });
};

connectWithRetry();

// Connection-level logging
mongoose.connection.on('disconnected', () => console.warn('MongoDB disconnected'));
mongoose.connection.on('error', (err) => console.error('MongoDB connection error event:', err && err.message ? err.message : err));

app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/contacts', require('./routes/contacts'));
app.use('/api/conversations', require('./routes/conversations'));
app.use('/api/messages', require('./routes/messages'));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
