const axios = require('axios');
const config = require('../config');
const logger = require('../utils/logger');

class NewsHandler {
  async handleNews(ctx) {
    const category = ctx.message.text.replace('/news', '').trim() || 'general';
    
    try {
      await ctx.replyWithChatAction('typing');
      await ctx.reply('📰 *Sedang mengambil berita terkini...*');

      // Get news (simplified - would use actual news API)
      const news = await this.getNews(category);
      
      if (!news || news.length === 0) {
        return ctx.reply('❌ Gagal mengambil berita. Silakan coba lagi.');
      }

      let newsMessage = `📰 *Berita Terkini - ${category.toUpperCase()}*\n\n`;
      
      news.slice(0, 5).forEach((item, index) => {
        newsMessage += `${index + 1}. *${item.title}*\n`;
        newsMessage += `📅 ${item.date}\n`;
        newsMessage += `🔗 [Baca selengkapnya](${item.url})\n\n`;
      });

      newsMessage += `---
🤖 *News by OREA-Bot*
👨‍💻 *Author: ${config.bot.author}*`;

      await ctx.reply(newsMessage, {
        parse_mode: 'Markdown',
        disable_web_page_preview: true
      });

    } catch (error) {
      logger.error('News Handler Error:', error);
      ctx.reply('❌ Maaf, gagal mengambil berita. Silakan coba lagi.');
    }
  }

  async getNews(category) {
    // This would use actual news API like NewsAPI or Guardian API
    // For now, return dummy data
    return [
      {
        title: 'Berita Penting 1 - Teknologi Terbaru',
        date: '2024-01-15',
        url: 'https://example.com/news1'
      },
      {
        title: 'Berita Penting 2 - Ekonomi Global',
        date: '2024-01-15',
        url: 'https://example.com/news2'
      },
      {
        title: 'Berita Penting 3 - Politik Indonesia',
        date: '2024-01-15',
        url: 'https://example.com/news3'
      }
    ];
  }
}

module.exports = new NewsHandler();