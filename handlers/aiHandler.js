const { OpenAI } = require('openai');
const config = require('../config');
const logger = require('../utils/logger');
const database = require('../utils/database');
const helper = require('../utils/helper');

class AIHandler {
  constructor() {
    this.openai = new OpenAI({
      apiKey: config.api.openai
    });
  }

  async handleAI(ctx) {
    const message = ctx.message.text.replace('/ai', '').trim();
    
    if (!message) {
      return ctx.reply('💬 *AI Chat GPT-4*

🤖 *Ketik pesan Anda setelah /ai*
Contoh: /ai Siapa presiden Indonesia pertama?

💡 *Fitur AI:*
• Natural conversation
• Code generation
• Math problems
• Creative writing
• Translation
• And more!

👑 *Premium users get unlimited access!*', {
        parse_mode: 'Markdown'
      });
    }

    try {
      await ctx.replyWithChatAction('typing');
      
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'Anda adalah AI assistant yang sangat pintar, sopan, dan membantu. Nama Anda OreaAI. Anda dibuat oleh OREA_85. Selalu berikan jawaban yang detail dan bermanfaat.'
          },
          {
            role: 'user',
            content: message
          }
        ],
        max_tokens: 2000,
        temperature: 0.7
      });

      const response = completion.choices[0].message.content;
      
      await ctx.reply(`🤖 *OreaAI Response:*

${response}

---
💎 *Powered by GPT-4*
👨‍💻 *Author: ${config.bot.author}*`, {
        parse_mode: 'Markdown'
      });

      // Save to database
      await database.saveAIChat(ctx.from.id, message, response);

    } catch (error) {
      logger.error('AI Handler Error:', error);
      ctx.reply('❌ Maaf, terjadi kesalahan saat memproses permintaan Anda. Silakan coba lagi nanti.');
    }
  }

  async handleGPT4(ctx) {
    const message = ctx.message.text.replace('/gpt4', '').trim();
    
    if (!message) {
      return ctx.reply('🧠 *GPT-4 Pro Mode*

🚀 *Model AI tercanggih untuk hasil terbaik*
Ketik pesan Anda setelah /gpt4

💎 *Exclusive untuk Premium Users!*', {
        parse_mode: 'Markdown'
      });
    }

    if (!ctx.state.isPremium) {
      return ctx.reply('❌ *GPT-4 Pro hanya untuk Premium Users!*

👑 *Upgrade ke Premium untuk akses:*
• GPT-4 unlimited
• Higher quality responses
• Faster processing
• Priority queue
• No rate limits

💰 *Mulai dari Rp 10.000/minggu*

📞 *Order sekarang:*
WhatsApp: ${config.bot.ownerNumber}', {
        parse_mode: 'Markdown',
        ...helper.getPremiumButtons()
      });
    }

    try {
      await ctx.replyWithChatAction('typing');
      
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo',
        messages: [
          {
            role: 'system',
            content: 'Anda adalah AI assistant tingkat profesional dengan kemampuan analisis yang sangat tinggi. Berikan jawaban yang sangat detail, akurat, dan mendalam. Nama Anda OreaAI Pro.'
          },
          {
            role: 'user',
            content: message
          }
        ],
        max_tokens: 3000,
        temperature: 0.5
      });

      const response = completion.choices[0].message.content;
      
      await ctx.reply(`🧠 *GPT-4 Pro Response:*

${response}

---
🚀 *Powered by GPT-4 Turbo*
👑 *Premium Exclusive*
👨‍💻 *Author: ${config.bot.author}*`, {
        parse_mode: 'Markdown'
      });

      await database.saveAIChat(ctx.from.id, message, response, 'gpt4');

    } catch (error) {
      logger.error('GPT-4 Handler Error:', error);
      ctx.reply('❌ Maaf, terjadi kesalahan pada GPT-4 Pro. Silakan coba lagi nanti.');
    }
  }

  async handleAIChat(ctx) {
    const message = ctx.message.text;
    
    try {
      await ctx.replyWithChatAction('typing');
      
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'Anda adalah OreaAI, assistant yang sangat pintar dan ramah. Dibuat oleh OREA_85. Selalu responsif dan membantu.'
          },
          {
            role: 'user',
            content: message
          }
        ],
        max_tokens: 1500,
        temperature: 0.7
      });

      const response = completion.choices[0].message.content;
      
      await ctx.reply(response);

      await database.saveAIChat(ctx.from.id, message, response);

    } catch (error) {
      logger.error('AI Chat Error:', error);
      // Silent fail for continuous chat
    }
  }

  async handleImageGeneration(ctx) {
    const prompt = ctx.message.text.replace('/image', '').trim();
    
    if (!prompt) {
      return ctx.reply('🎨 *AI Image Generation*

🖼️ *Generate image dari teks*
Contoh: /image kucing lucu mengenakan topi

💎 *Premium Feature!*', {
        parse_mode: 'Markdown'
      });
    }

    if (!ctx.state.isPremium) {
      return ctx.reply('❌ *Image Generation hanya untuk Premium Users!*

👑 *Upgrade Premium untuk:*
• Unlimited image generation
• High quality images
• Multiple styles
• No watermarks

💰 *Mulai dari Rp 10.000/minggu*',
        helper.getPremiumButtons()
      );
    }

    try {
      await ctx.replyWithChatAction('upload_photo');
      
      const response = await this.openai.images.generate({
        model: 'dall-e-3',
        prompt: prompt,
        size: '1024x1024',
        quality: 'standard',
        n: 1
      });

      const imageUrl = response.data[0].url;
      
      await ctx.replyWithPhoto(imageUrl, {
        caption: `🎨 *Generated Image*

📝 *Prompt:* ${prompt}

---
🤖 *Generated by OreaAI*
👑 *Premium Exclusive*
👨‍💻 *Author: ${config.bot.author}*`,
        parse_mode: 'Markdown'
      });

      await database.saveImageGeneration(ctx.from.id, prompt, imageUrl);

    } catch (error) {
      logger.error('Image Generation Error:', error);
      ctx.reply('❌ Maaf, gagal generate image. Silakan coba lagi nanti.');
    }
  }

  async handleCodeHelper(ctx) {
    const args = ctx.message.text.split(' ');
    const language = args[1];
    const code = args.slice(2).join(' ');
    
    if (!language || !code) {
      return ctx.reply('💻 *Code Helper*

🔧 *Debug & optimize your code*
Format: /code <language> <code>

Contoh: /code javascript console.log("hello")

💎 *Premium Feature!*', {
        parse_mode: 'Markdown'
      });
    }

    if (!ctx.state.isPremium) {
      return ctx.reply('❌ *Code Helper hanya untuk Premium Users!*',
        helper.getPremiumButtons()
      );
    }

    try {
      await ctx.replyWithChatAction('typing');
      
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: `Anda adalah expert programmer dalam bahasa ${language}. Analisis kode berikut, berikan saran perbaikan, optimasi, dan jelaskan cara kerjanya.`
          },
          {
            role: 'user',
            content: code
          }
        ],
        max_tokens: 2000,
        temperature: 0.3
      });

      const response = completion.choices[0].message.content;
      
      await ctx.reply(`💻 *Code Analysis (${language})*

${response}

---
🔧 *Code Helper by OreaAI*
👑 *Premium Exclusive*`, {
        parse_mode: 'Markdown'
      });

    } catch (error) {
      logger.error('Code Helper Error:', error);
      ctx.reply('❌ Maaf, gagal menganalisis kode. Silakan coba lagi.');
    }
  }
}

module.exports = new AIHandler();