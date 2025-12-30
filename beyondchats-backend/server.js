const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const articleRoutes = require('./src/routes/articleRoutes');

const app = express();

// ✅ CORS Configuration - Fixed for Vercel
app.use(cors({
  origin: function(origin, callback) {
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:3001',
      'https://beyondchats-assignment-alfdqgsd1.vercel.app'
    ];
    
    // Allow requests with no origin (Postman, mobile apps, etc.)
    if (!origin) return callback(null, true);
    
    // Allow all vercel preview deployments
    if (allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ MongoDB Connection
console.log("Mongo URI from env:", process.env.MONGODB_URI ? "✅ Set" : "❌ Missing");

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => {
    console.error('❌ MongoDB Error:', err.message);
    process.exit(1);
  });

// ✅ Health Check Endpoint
app.get('/', (req, res) => {
  res.json({
    message: '🚀 BeyondChats API',
    status: 'Running',
    timestamp: new Date().toISOString()
  });
});

// ✅ Database Health Check
app.get('/api/health', async (req, res) => {
  try {
    const Article = require('./src/models/Article');
    const count = await Article.countDocuments();
    const dbState = mongoose.connection.readyState;
    const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];
    
    res.json({
      status: 'healthy',
      database: states[dbState],
      articlesInDB: count,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

// ✅ Article Routes
app.use('/api/articles', articleRoutes);

// ✅ 404 Handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.path,
    method: req.method
  });
});

// ✅ Error Handler
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
});