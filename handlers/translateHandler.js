const { Translate } = require('@google-cloud/translate').v2;
const config = require('../config');
const logger = require('../utils/logger');
const helper = require('../utils/helper');

class TranslateHandler {
  constructor() {
    this.translate = new Translate({ key: config.api.google });
  }

  async handleTranslate(ctx) {
    const args = ctx.message.text.split(' ');
    const targetLang = args[1];
    const text = args.slice(2).join(' ');
    
    if (!targetLang || !text) {
      return ctx.reply('🌍 *Translator*

🔄 *Terjemahkan teks ke berbagai bahasa*
Format: /translate <kode_bahasa> <teks>

📋 *Supported Languages:*
• id - Indonesia
• en - English
• ja - Japanese
• ko - Korean
• zh - Chinese
• es - Spanish
• fr - French
• de - German
• ru - Russian
• ar - Arabic

💎 *Premium users get unlimited translations!*', {
        parse_mode: 'Markdown'
      });
    }

    try {
      await ctx.replyWithChatAction('typing');
      
      const [translation] = await this.translate.translate(text, targetLang);
      
      await ctx.reply(`🌍 *Translation*

📝 *Original (${this.detectLanguage(text)}):*
${text}

🔄 *Translated (${targetLang}):*
${translation}

---
🤖 *Translated by OREA-Bot*
👨‍💻 *Author: ${config.bot.author}*`, {
        parse_mode: 'Markdown'
      });

    } catch (error) {
      logger.error('Translation Error:', error);
      ctx.reply('❌ Maaf, gagal menerjemahkan teks. Silakan coba lagi.');
    }
  }

  detectLanguage(text) {
    // Simple language detection (would use actual detection in production)
    const indonesianWords = ['yang', 'dan', 'untuk', 'dari', 'dengan', 'pada', 'ini', 'itu'];
    const textLower = text.toLowerCase();
    
    for (const word of indonesianWords) {
      if (textLower.includes(word)) {
        return 'id';
      }
    }
    
    return 'en';
  }
}

module.exports = new TranslateHandler();