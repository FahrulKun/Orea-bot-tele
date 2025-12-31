const { createCanvas, loadImage } = require('canvas');
const Jimp = require('jimp');
const sharp = require('sharp');
const fs = require('fs-extra');
const path = require('path');
const config = require('../config');
const logger = require('../utils/logger');
const database = require('../utils/database');
const helper = require('../utils/helper');

class StickerHandler {
  async handleSticker(ctx) {
    if (!ctx.message.photo && !ctx.message.reply_to_message?.photo) {
      return ctx.reply('🎨 *Sticker Maker*

📸 *Cara membuat sticker:*
1. Kirim foto dengan caption /sticker
2. Reply foto dengan /sticker
3. Kirim gambar lalu ketik /sticker

✨ *Features:*
• Custom size
• Add text
• Effects & filters
• Animated stickers (premium)
• Batch convert (premium)

💎 *Premium users get advanced features!*', {
        parse_mode: 'Markdown'
      });
    }

    try {
      await ctx.replyWithChatAction('upload_sticker');
      await ctx.reply('🎨 *Sedang membuat sticker...*');

      // Get photo
      const photo = ctx.message.photo || ctx.message.reply_to_message.photo;
      const fileId = photo[photo.length - 1].file_id;
      
      // Get file info
      const file = await ctx.telegram.getFile(fileId);
      const fileUrl = `https://api.telegram.org/file/bot${config.bot.token}/${file.file_path}`;
      
      // Download image
      const response = await axios({
        method: 'GET',
        url: fileUrl,
        responseType: 'arraybuffer'
      });

      const imageBuffer = Buffer.from(response.data);
      
      // Process image for sticker
      const processedBuffer = await this.processSticker(imageBuffer, ctx.state.isPremium);
      
      // Send as sticker
      await ctx.replyWithSticker({
        source: processedBuffer
      });

      await ctx.reply('✅ *Sticker berhasil dibuat!*

💡 *Tips:*
• Premium users dapat membuat animated stickers
• Tambahkan teks dengan /sticker_text
• Gunakan efek dengan /sticker_effect');

      // Save to database
      await database.saveSticker(ctx.from.id, 'created');

    } catch (error) {
      logger.error('Sticker Maker Error:', error);
      ctx.reply('❌ Maaf, gagal membuat sticker. Silakan coba lagi.');
    }
  }

  async handleStickerText(ctx) {
    const args = ctx.message.text.split(' ');
    const text = args.slice(1).join(' ');
    
    if (!text) {
      return ctx.reply('📝 *Sticker with Text*

🎨 *Tambahkan teks ke sticker*
Format: /sticker_text <teks>

💡 *Tips:*
• Reply foto untuk background
• Maksimal 50 karakter
• Premium: custom fonts & colors', {
        parse_mode: 'Markdown'
      });
    }

    if (!ctx.message.reply_to_message?.photo) {
      return ctx.reply('❌ *Reply foto untuk menambahkan teks!*');
    }

    try {
      await ctx.replyWithChatAction('upload_sticker');
      
      const photo = ctx.message.reply_to_message.photo;
      const fileId = photo[photo.length - 1].file_id;
      
      const file = await ctx.telegram.getFile(fileId);
      const fileUrl = `https://api.telegram.org/file/bot${config.bot.token}/${file.file_path}`;
      
      const response = await axios({
        method: 'GET',
        url: fileUrl,
        responseType: 'arraybuffer'
      });

      const imageBuffer = Buffer.from(response.data);
      
      // Add text to image
      const processedBuffer = await this.addTextToSticker(imageBuffer, text, ctx.state.isPremium);
      
      await ctx.replyWithSticker({
        source: processedBuffer
      });

      await ctx.reply(`✅ *Text "${text}" berhasil ditambahkan!*`);

    } catch (error) {
      logger.error('Sticker Text Error:', error);
      ctx.reply('❌ Maaf, gagal menambahkan teks. Silakan coba lagi.');
    }
  }

  async handleStickerEffect(ctx) {
    const effect = ctx.message.text.replace('/sticker_effect', '').trim();
    
    if (!effect) {
      return ctx.reply('🎭 *Sticker Effects*

🎨 *Tambahkan efek ke sticker*
Format: /sticker_effect <effect>

📋 *Available Effects:*
• blur - Blur effect
• grayscale - Black & white
• sepia - Vintage effect
• invert - Invert colors
• brightness - Brightness adjustment
• contrast - Contrast adjustment

💎 *Premium users get 20+ effects!*', {
        parse_mode: 'Markdown'
      });
    }

    if (!ctx.message.reply_to_message?.photo && !ctx.message.reply_to_message?.sticker) {
      return ctx.reply('❌ *Reply foto atau sticker untuk menambahkan efek!*');
    }

    try {
      await ctx.replyWithChatAction('upload_sticker');
      
      let imageBuffer;
      
      if (ctx.message.reply_to_message.photo) {
        const photo = ctx.message.reply_to_message.photo;
        const fileId = photo[photo.length - 1].file_id;
        
        const file = await ctx.telegram.getFile(fileId);
        const fileUrl = `https://api.telegram.org/file/bot${config.bot.token}/${file.file_path}`;
        
        const response = await axios({
          method: 'GET',
          url: fileUrl,
          responseType: 'arraybuffer'
        });

        imageBuffer = Buffer.from(response.data);
      } else {
        // Handle sticker
        const sticker = ctx.message.reply_to_message.sticker;
        const file = await ctx.telegram.getFile(sticker.file_id);
        const fileUrl = `https://api.telegram.org/file/bot${config.bot.token}/${file.file_path}`;
        
        const response = await axios({
          method: 'GET',
          url: fileUrl,
          responseType: 'arraybuffer'
        });

        imageBuffer = Buffer.from(response.data);
      }
      
      // Apply effect
      const processedBuffer = await this.applyEffect(imageBuffer, effect, ctx.state.isPremium);
      
      await ctx.replyWithSticker({
        source: processedBuffer
      });

      await ctx.reply(`✅ *Efek "${effect}" berhasil diterapkan!*`);

    } catch (error) {
      logger.error('Sticker Effect Error:', error);
      ctx.reply('❌ Maaf, gagal menerapkan efek. Silakan coba lagi.');
    }
  }

  async handleStickerPack(ctx) {
    const packName = ctx.message.text.replace('/sticker_pack', '').trim();
    
    if (!packName) {
      return ctx.reply('📦 *Sticker Pack Creator*

🎨 *Buat sticker pack kustom*
Format: /sticker_pack <nama_pack>

💡 *Cara penggunaan:*
1. Kirim command dengan nama pack
2. Kirim beberapa foto (maksimal 50)
3. Ketik "selesai" untuk membuat pack

💎 *Premium exclusive feature!*', {
        parse_mode: 'Markdown'
      });
    }

    if (!ctx.state.isPremium) {
      return ctx.reply('❌ *Sticker Pack Creator hanya untuk Premium Users!*',
        helper.getPremiumButtons()
      );
    }

    // Store pack creation session
    ctx.session.stickerPack = {
      name: packName,
      stickers: []
    };

    await ctx.reply(`📦 *Membuat sticker pack: ${packName}*

📸 *Kirim foto untuk sticker (maksimal 50)*
⏹️ *Ketik "selesai" untuk menyelesaikan*

💡 *Tips:*
• Kirim foto berkualitas tinggi
• Hindari foto dengan watermark
• Usahakan rasio 1:1 untuk hasil terbaik`);
  }

  // Helper methods
  async processSticker(imageBuffer, isPremium) {
    try {
      let processedImage;
      
      if (isPremium) {
        // Premium processing with better quality
        processedImage = await sharp(imageBuffer)
          .resize(512, 512, {
            fit: 'contain',
            background: { r: 255, g: 255, b: 255, alpha: 0 }
          })
          .png()
          .toBuffer();
      } else {
        // Standard processing
        processedImage = await sharp(imageBuffer)
          .resize(512, 512, {
            fit: 'contain',
            background: { r: 255, g: 255, b: 255, alpha: 0 }
          })
          .png({ quality: 80 })
          .toBuffer();
      }
      
      return processedImage;
    } catch (error) {
      logger.error('Sticker Processing Error:', error);
      throw error;
    }
  }

  async addTextToSticker(imageBuffer, text, isPremium) {
    try {
      const image = await Jimp.read(imageBuffer);
      const font = isPremium ? 
        await Jimp.loadFont(Jimp.FONT_SANS_32_WHITE) : 
        await Jimp.loadFont(Jimp.FONT_SANS_16_WHITE);
      
      // Calculate text position
      const textWidth = Jimp.measureText(font, text);
      const textHeight = Jimp.measureTextHeight(font, text);
      const x = (image.bitmap.width - textWidth) / 2;
      const y = image.bitmap.height - textHeight - 10;
      
      // Add text with shadow for better visibility
      image.print(font, x + 1, y + 1, text);
      image.print(font, x - 1, y - 1, text);
      image.print(font, x + 1, y - 1, text);
      image.print(font, x - 1, y + 1, text);
      image.print(font, x, y, text);
      
      // Resize to sticker dimensions
      image.resize(512, 512);
      
      return await image.getBufferAsync(Jimp.MIME_PNG);
    } catch (error) {
      logger.error('Text Addition Error:', error);
      throw error;
    }
  }

  async applyEffect(imageBuffer, effect, isPremium) {
    try {
      let sharpImage = sharp(imageBuffer);
      
      switch (effect.toLowerCase()) {
        case 'blur':
          sharpImage = sharpImage.blur(5);
          break;
        case 'grayscale':
          sharpImage = sharpImage.grayscale();
          break;
        case 'sepia':
          sharpImage = sharpImage.tint({ r: 255, g: 238, b: 196 });
          break;
        case 'invert':
          sharpImage = sharpImage.negate();
          break;
        case 'brightness':
          sharpImage = sharpImage.modulate({ brightness: 1.5 });
          break;
        case 'contrast':
          sharpImage = sharpImage.linear(1.5, 0);
          break;
        default:
          if (isPremium) {
            // Premium effects
            return await this.applyPremiumEffect(imageBuffer, effect);
          } else {
            throw new Error('Effect not available');
          }
      }
      
      const processedBuffer = await sharpImage
        .resize(512, 512)
        .png()
        .toBuffer();
      
      return processedBuffer;
    } catch (error) {
      logger.error('Effect Application Error:', error);
      throw error;
    }
  }

  async applyPremiumEffect(imageBuffer, effect) {
    // Premium effects implementation
    const effects = {
      'vintage': async (img) => img.modulate({ brightness: 1.2, saturation: 0.8 }).tint({ r: 255, g: 238, b: 196 }),
      'cold': async (img) => img.tint({ r: 200, g: 220, b: 255 }),
      'warm': async (img) => img.tint({ r: 255, g: 220, b: 200 }),
      'dramatic': async (img) => img.linear(1.5, -50).sharpen(),
      'dreamy': async (img) => img.blur(1).modulate({ brightness: 1.1, saturation: 1.2 })
    };
    
    if (effects[effect]) {
      return await effects[effect](sharp(imageBuffer))
        .resize(512, 512)
        .png()
        .toBuffer();
    }
    
    throw new Error('Premium effect not found');
  }
}

module.exports = new StickerHandler();