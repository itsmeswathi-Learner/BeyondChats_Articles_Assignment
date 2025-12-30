const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const articleRoutes = require('./src/routes/articleRoutes');

const app = express();

app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://*.vercel.app'
  ],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ MongoDB (Render-safe)
console.log("Mongo URI from env:", process.env.MONGODB_URI);

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => {
    console.error('❌ MongoDB Error:', err.message);
    process.exit(1);
  });

// Routes
app.use('/api/articles', articleRoutes);

app.get('/', (req, res) => {
  res.json({
    message: '🚀 BeyondChats API',
    status: 'Running'
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
