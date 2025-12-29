const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const articleRoutes = require('./src/routes/articleRoutes');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/beyondchats';

mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch((err) => console.error('❌ MongoDB Error:', err.message));

// Routes
app.use('/api/articles', articleRoutes);

app.get('/', (req, res) => {
  res.json({ 
    message: '🚀 BeyondChats API',
    status: 'Running',
    endpoints: {
      scrape: 'POST /api/articles/scrape',
      articles: 'GET /api/articles',
      original: 'GET /api/articles/original',
      updated: 'GET /api/articles/updated'
    }
  });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server: http://localhost:${PORT}`);
});