const Article = require('../models/Article');
const scraperService = require('../services/scraperService');

class ArticleController {
  
  async scrapeAndStore(req, res) {
    try {
      console.log('📡 Scraping...');
      const scrapedArticles = await scraperService.scrapeBeyondChatsBlogs();
      
      if (scrapedArticles.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'No articles found'
        });
      }
      
      const saved = [];
      
      for (const articleData of scrapedArticles) {
        try {
          const existing = await Article.findOne({ url: articleData.url });
          if (existing) {
            console.log(`⚠️ Exists: ${articleData.title}`);
            continue;
          }
          
          const article = new Article(articleData);
          await article.save();
          saved.push(article);
          console.log(`✅ Saved: ${article.title}`);
        } catch (error) {
          console.error(`Error: ${error.message}`);
        }
      }
      
      res.status(201).json({
        success: true,
        message: `Saved ${saved.length} articles`,
        articles: saved
      });
      
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
  
  async createArticle(req, res) {
    try {
      const article = new Article(req.body);
      await article.save();
      res.status(201).json({ success: true, article });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }
  
  async getAllArticles(req, res) {
    try {
      const { page = 1, limit = 50 } = req.query;
      
      const articles = await Article.find()
        .populate('originalArticleId')
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);
      
      const count = await Article.countDocuments();
      
      res.json({
        success: true,
        articles,
        total: count,
        pages: Math.ceil(count / limit)
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
  
  async getArticleById(req, res) {
    try {
      const article = await Article.findById(req.params.id)
        .populate('originalArticleId');
      
      if (!article) {
        return res.status(404).json({ success: false, message: 'Not found' });
      }
      
      res.json({ success: true, article });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
  
  async updateArticle(req, res) {
    try {
      const article = await Article.findByIdAndUpdate(
        req.params.id,
        { ...req.body, 'metadata.updatedAt': new Date() },
        { new: true }
      );
      
      if (!article) {
        return res.status(404).json({ success: false, message: 'Not found' });
      }
      
      res.json({ success: true, article });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }
  
  async deleteArticle(req, res) {
    try {
      const article = await Article.findByIdAndDelete(req.params.id);
      
      if (!article) {
        return res.status(404).json({ success: false, message: 'Not found' });
      }
      
      res.json({ success: true, message: 'Deleted' });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
  
  async getOriginalArticles(req, res) {
    try {
      const articles = await Article.find({ isUpdated: false })
        .sort({ createdAt: -1 });
      
      res.json({ success: true, count: articles.length, articles });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
  
  async getUpdatedArticles(req, res) {
    try {
      const articles = await Article.find({ isUpdated: true })
        .populate('originalArticleId')
        .sort({ createdAt: -1 });
      
      res.json({ success: true, count: articles.length, articles });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
}

module.exports = new ArticleController();