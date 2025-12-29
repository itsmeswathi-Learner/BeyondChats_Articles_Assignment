const axios = require('axios');
const cheerio = require('cheerio');

class ScraperService {
  
  async scrapeBeyondChatsBlogs() {
    try {
      console.log('🔍 Scraping BeyondChats blogs...');
      
      const response = await axios.get('https://www.beyondchats.com/blogs', {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        timeout: 15000
      });
      
      const $ = cheerio.load(response.data);
      const links = new Set();
      
      $('a[href*="/blog"]').each((i, elem) => {
        const href = $(elem).attr('href');
        if (href) {
          const url = href.startsWith('http') ? href : `https://www.beyondchats.com${href}`;
          links.add(url);
        }
      });
      
      const articles = [];
      const linksArray = Array.from(links).slice(0, 5);
      
      for (const url of linksArray) {
        try {
          const article = await this.scrapeArticleContent(url);
          if (article) {
            articles.push(article);
            console.log(`✅ ${article.title.substring(0, 50)}...`);
          }
          await this.sleep(1000);
        } catch (error) {
          console.log(`⚠️ Failed: ${url}`);
        }
      }
      
      console.log(`✅ Scraped ${articles.length} articles`);
      return articles;
      
    } catch (error) {
      console.error('❌ Scraping error:', error.message);
      
      // Return mock data if scraping fails
      return this.getMockArticles();
    }
  }
  
  async scrapeArticleContent(url) {
    const response = await axios.get(url, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      timeout: 10000
    });
    
    const $ = cheerio.load(response.data);
    
    const title = $('h1').first().text().trim() || 
                  $('title').text().trim() || 
                  'Article';
    
    let content = '';
    const selectors = ['article', '.post-content', '.entry-content', 'main'];
    
    for (const sel of selectors) {
      const elem = $(sel);
      if (elem.length > 0) {
        elem.find('script, style, nav, header, footer').remove();
        content = elem.text().trim();
        if (content.length > 200) break;
      }
    }
    
    if (!content || content.length < 100) {
      content = $('p').map((i, el) => $(el).text().trim())
                      .get()
                      .filter(t => t.length > 20)
                      .join('\n\n');
    }
    
    const author = $('.author').first().text().trim() || 
                   $('meta[name="author"]').attr('content') || 
                   'BeyondChats';
    
    return {
      title: title.substring(0, 300),
      content: content.substring(0, 10000),
      excerpt: content.substring(0, 200) + '...',
      url: url,
      author: author.substring(0, 100),
      publishedDate: new Date(),
      metadata: {
        scrapedAt: new Date(),
        wordCount: content.split(/\s+/).length
      }
    };
  }
  
  async searchGoogle(query) {
    try {
      console.log(`🔍 Searching: "${query}"`);
      
      const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
      const response = await axios.get(searchUrl, {
        headers: { 'User-Agent': 'Mozilla/5.0' },
        timeout: 10000
      });
      
      const $ = cheerio.load(response.data);
      const results = [];
      
      $('a').each((i, elem) => {
        const href = $(elem).attr('href');
        if (href && href.startsWith('/url?q=')) {
          const url = decodeURIComponent(href.split('/url?q=')[1].split('&')[0]);
          if (url.startsWith('http') && 
              !url.includes('google.com') &&
              !url.includes('youtube.com')) {
            results.push(url);
          }
        }
      });
      
      return [...new Set(results)].slice(0, 2);
      
    } catch (error) {
      console.log('⚠️ Google search failed, using fallback');
      return [];
    }
  }
  
  getMockArticles() {
    // Fallback mock data if scraping completely fails
    return [
      {
        title: 'Getting Started with AI Chatbots',
        content: 'AI chatbots are revolutionizing customer service. They provide 24/7 support, instant responses, and can handle multiple conversations simultaneously. Modern chatbots use natural language processing to understand user intent and provide relevant responses. Implementation involves training the model on your specific use case and integrating it with your existing systems.',
        excerpt: 'AI chatbots are revolutionizing customer service...',
        url: 'https://beyondchats.com/blog/mock-article-1',
        author: 'BeyondChats',
        publishedDate: new Date(),
        metadata: { scrapedAt: new Date(), wordCount: 50 }
      },
      {
        title: 'Customer Support Automation Best Practices',
        content: 'Automating customer support can significantly improve efficiency and customer satisfaction. Best practices include: identifying repetitive tasks, implementing tiered support levels, using AI for initial triage, maintaining human oversight for complex issues, and continuously training your automation systems based on real interactions.',
        excerpt: 'Automating customer support can significantly improve...',
        url: 'https://beyondchats.com/blog/mock-article-2',
        author: 'BeyondChats',
        publishedDate: new Date(),
        metadata: { scrapedAt: new Date(), wordCount: 45 }
      }
    ];
  }
  
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

module.exports = new ScraperService();