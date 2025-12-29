const axios = require('axios');
const scraperService = require('./src/services/scraperService');
const freeAIService = require('./src/services/freeAIService');
require('dotenv').config();

const API_BASE_URL = 'http://localhost:5000/api';

class ArticleUpdater {
  
  async run() {
    console.log('🚀 Phase 2: AI Enhancement\n');
    
    const articles = await this.fetchOriginalArticles();
    console.log(`✅ Found ${articles.length} articles\n`);
    
    if (articles.length === 0) {
      console.log('Run: curl -X POST http://localhost:5000/api/articles/scrape');
      return;
    }
    
    for (let i = 0; i < articles.length; i++) {
      const article = articles[i];
      console.log(`\n[${i + 1}/${articles.length}] ${article.title}`);
      
      try {
        await this.processArticle(article);
        console.log('✅ Done!');
      } catch (error) {
        console.error('❌ Failed:', error.message);
      }
      
      await this.sleep(2000);
    }
    
    console.log('\n✨ Complete! View at http://localhost:3000');
  }
  
  async fetchOriginalArticles() {
    try {
      const response = await axios.get(`${API_BASE_URL}/articles/original`);
      return response.data.articles || [];
    } catch (error) {
      console.error('API Error:', error.message);
      return [];
    }
  }
  
  async processArticle(article) {
    console.log('  🔍 Searching Google...');
    const searchResults = await scraperService.searchGoogle(article.title);
    
    console.log('  📥 Scraping references...');
    const references = [];
    
    for (const url of searchResults) {
      try {
        const scraped = await scraperService.scrapeArticleContent(url);
        if (scraped && scraped.content.length > 100) {
          references.push({
            title: scraped.title,
            url: url,
            scrapedContent: scraped.content.substring(0, 2000),
            scrapedAt: new Date()
          });
        }
        await this.sleep(1000);
      } catch (error) {
        console.log(`  ⚠️ Skipped: ${url}`);
      }
    }
    
    console.log(`  🤖 Enhancing with ${references.length} references...`);
    const enhanced = await freeAIService.enhanceArticle(article, references);
    
    console.log('  📤 Publishing...');
    await this.publishUpdatedArticle(article, enhanced, references);
  }
  
  async publishUpdatedArticle(original, content, refs) {
    try {
      const newArticle = {
        title: original.title + ' (Enhanced)',
        content: content,
        excerpt: content.substring(0, 200) + '...',
        url: original.url + '-enhanced',
        author: original.author,
        isUpdated: true,
        originalArticleId: original._id,
        references: refs,
        metadata: {
          updatedAt: new Date(),
          aiModel: 'rule-based-free',
          wordCount: content.split(/\s+/).length
        }
      };
      
      await axios.post(`${API_BASE_URL}/articles`, newArticle);
    } catch (error) {
      throw new Error('Publish failed: ' + error.message);
    }
  }
  
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

if (require.main === module) {
  new ArticleUpdater().run()
    .then(() => process.exit(0))
    .catch(err => {
      console.error(err);
      process.exit(1);
    });
}