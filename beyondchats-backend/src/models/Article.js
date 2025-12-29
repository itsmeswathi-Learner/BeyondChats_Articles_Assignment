const mongoose = require('mongoose');

const articleSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  content: { type: String, required: true },
  excerpt: { type: String, default: '' },
  url: { type: String, required: true, unique: true },
  author: { type: String, default: 'BeyondChats' },
  publishedDate: { type: Date, default: Date.now },
  isUpdated: { type: Boolean, default: false },
  originalArticleId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Article', 
    default: null 
  },
  references: [{
    title: String,
    url: String,
    scrapedContent: String,
    scrapedAt: Date
  }],
  metadata: {
    scrapedAt: { type: Date, default: Date.now },
    updatedAt: Date,
    aiModel: String,
    wordCount: Number
  }
}, { timestamps: true });

articleSchema.index({ title: 'text', content: 'text' });

module.exports = mongoose.model('Article', articleSchema);