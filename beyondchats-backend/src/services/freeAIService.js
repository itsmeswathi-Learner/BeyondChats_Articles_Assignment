const axios = require('axios');

class FreeAIService {
  
  /**
   * FREE AI Enhancement using Groq (totally free, no credit card)
   * Alternative: Hugging Face Inference API (also free)
   */
  async enhanceArticle(originalArticle, references) {
    const apiKey = process.env.GROQ_API_KEY;
    
    // If no API key, use rule-based enhancement
    if (!apiKey) {
      return this.ruleBasedEnhancement(originalArticle, references);
    }
    
    try {
      // Groq API (FREE - get key from console.groq.com)
      const response = await axios.post(
        'https://api.groq.com/openai/v1/chat/completions',
        {
          model: 'llama-3.3-70b-versatile', // Free model
          messages: [
            {
              role: 'user',
              content: this.buildPrompt(originalArticle, references)
            }
          ],
          max_tokens: 3000,
          temperature: 0.7
        },
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      return response.data.choices[0].message.content;
      
    } catch (error) {
      console.log('⚠️ AI API failed, using rule-based enhancement');
      return this.ruleBasedEnhancement(originalArticle, references);
    }
  }
  
  /**
   * Rule-based enhancement (100% free, no API needed)
   */
  ruleBasedEnhancement(originalArticle, references) {
    const enhanced = `# ${originalArticle.title}

## Overview

${this.improveText(originalArticle.content)}

## Industry Insights

Based on analysis of top-performing content in this domain:

${references.map((ref, i) => `
### ${i + 1}. ${ref.title}

${this.extractKeyPoints(ref.scrapedContent)}

**Source:** [${this.getDomain(ref.url)}](${ref.url})
`).join('\n')}

## Key Takeaways

${this.generateTakeaways(originalArticle.content, references)}

## Conclusion

${this.generateConclusion(originalArticle.content)}

---

### References

${references.map((ref, i) => `${i + 1}. [${ref.title}](${ref.url})`).join('\n')}

*Last updated: ${new Date().toLocaleDateString()}*  
*Enhanced with insights from ${references.length} industry sources*
`;
    
    return enhanced;
  }
  
  improveText(text) {
    // Add better formatting
    const sentences = text.split('.').filter(s => s.trim().length > 0);
    const paragraphs = [];
    
    for (let i = 0; i < sentences.length; i += 3) {
      paragraphs.push(sentences.slice(i, i + 3).join('. ') + '.');
    }
    
    return paragraphs.join('\n\n');
  }
  
  extractKeyPoints(content) {
    const sentences = content.split('.').filter(s => s.trim().length > 30);
    return sentences.slice(0, 3).join('. ') + '.';
  }
  
  generateTakeaways(content, references) {
    const points = [
      'Understanding the fundamentals is crucial for success',
      'Industry best practices emphasize quality and consistency',
      'Continuous learning and adaptation are key factors',
      'Leveraging the right tools can significantly improve outcomes'
    ];
    
    return points.slice(0, 3).map((p, i) => `- ${p}`).join('\n');
  }
  
  generateConclusion(content) {
    const words = content.split(' ').length;
    return `This comprehensive guide covers essential aspects of the topic with ${words} words of in-depth analysis. By following these insights and staying updated with industry trends, you can achieve better results.`;
  }
  
  getDomain(url) {
    try {
      return new URL(url).hostname.replace('www.', '');
    } catch {
      return 'Source';
    }
  }
  
  buildPrompt(originalArticle, references) {
    return `Rewrite this article professionally:

ORIGINAL: ${originalArticle.title}
${originalArticle.content.substring(0, 1000)}

REFERENCES:
${references.map(r => `- ${r.title}\n${r.scrapedContent.substring(0, 500)}`).join('\n\n')}

Make it engaging, well-structured, and professional.`;
  }
}

module.exports = new FreeAIService();