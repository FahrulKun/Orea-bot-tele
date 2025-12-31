const config = require('../config');
const logger = require('../utils/logger');
const helper = require('../utils/helper');
const database = require('../utils/database');
const axios = require('axios');

class ImageHandler {
  async handleEditImage(ctx) {
    if (!ctx.message.photo && !ctx.message.reply_to_message?.photo) {
      return ctx.reply('🎨 *Image Editor*

🖼️ *Edit foto dengan berbagai efek:*
1. Kirim foto dengan caption /editimage
2. Reply foto dengan /editimage <effect>

📋 *Available Effects:*
• blur - Blur effect
• grayscale - Black & white
• sepia - Vintage effect
• invert - Invert colors
• brightness - Brightness adjustment
• contrast - Contrast adjustment
• vintage - Vintage look
• cold - Cold tone
• warm - Warm tone
• dramatic - Dramatic effect

💎 *Premium users get 20+ effects!*', {
        parse_mode: 'Markdown'
      });
    }

    const effect = ctx.message.text.replace('/editimage', '').trim() || 'grayscale';
    
    try {
      await ctx.replyWithChatAction('upload_photo');
      await ctx.reply('🎨 *Sedang mengedit foto...*');

      const photo = ctx.message.photo || ctx.message.reply_to_message.photo;
      const fileId = photo[photo.length - 1].file_id;
      
      const file = await ctx.telegram.getFile(fileId);
      const fileUrl = `https://api.telegram.org/file/bot${config.bot.token}/${file.file_path}`;
      
      const response = await axios({
        method: 'GET',
        url: fileUrl,
        responseType: 'arraybuffer'
      });

      const imageBuffer = Buffer.from(response.data);
      
      // Apply effect
      const processedBuffer = await this.applyImageEffect(imageBuffer, effect, ctx.state.isPremium);
      
      await ctx.replyWithPhoto({
        source: processedBuffer
      }, {
        caption: `🎨 *Edited Image*

🎭 *Effect:* ${effect}

---
🤖 *Edited by OREA-Bot*
👨‍💻 *Author: ${config.bot.author}*`,
        parse_mode: 'Markdown'
      });

    } catch (error) {
      logger.error('Image Editor Error:', error);
      ctx.reply('❌ Maaf, gagal mengedit foto. Silakan coba lagi.');
    }
  }

  async handlePhoto(ctx) {
    // Handle incoming photos for various features
    if (ctx.session.expectingPhoto) {
      // Handle based on context
      switch (ctx.session.photoContext) {
        case 'sticker':
          await this.handlePhotoForSticker(ctx);
          break;
        case 'meme':
          await this.handlePhotoForMeme(ctx);
          break;
        default:
          break;
      }
    }
  }

  async handlePhotoForSticker(ctx) {
    try {
      const photo = ctx.message.photo[ctx.message.photo.length - 1];
      const fileId = photo.file_id;
      
      const file = await ctx.telegram.getFile(fileId);
      const fileUrl = `https://api.telegram.org/file/bot${config.bot.token}/${file.file_path}`;
      
      const response = await axios({
        method: 'GET',
        url: fileUrl,
        responseType: 'arraybuffer'
      });

      const imageBuffer = Buffer.from(response.data);
      
      // Convert to sticker
      const processedBuffer = await this.convertToSticker(imageBuffer);
      
      await ctx.replyWithSticker({
        source: processedBuffer
      });

      ctx.session.expectingPhoto = false;
      ctx.session.photoContext = null;

    } catch (error) {
      logger.error('Photo to Sticker Error:', error);
      ctx.reply('❌ Gagal mengkonversi foto ke sticker.');
    }
  }

  async handlePhotoForMeme(ctx) {
    try {
      const photo = ctx.message.photo[ctx.message.photo.length - 1];
      const fileId = photo.file_id;
      
      const file = await ctx.telegram.getFile(fileId);
      const fileUrl = `https://api.telegram.org/file/bot${config.bot.token}/${file.file_path}`;
      
      const response = await axios({
        method: 'GET',
        url: fileUrl,
        responseType: 'arraybuffer'
      });

      const imageBuffer = Buffer.from(response.data);
      
      // Create meme
      const processedBuffer = await this.createMeme(imageBuffer, ctx.session.memeText || 'MEME');
      
      await ctx.replyWithPhoto({
        source: processedBuffer
      }, {
        caption: '😄 *Meme created successfully!*',
        parse_mode: 'Markdown'
      });

      ctx.session.expectingPhoto = false;
      ctx.session.photoContext = null;
      ctx.session.memeText = null;

    } catch (error) {
      logger.error('Meme Creation Error:', error);
      ctx.reply('❌ Gagal membuat meme.');
    }
  }

  async handleVideo(ctx) {
    // Handle incoming videos for various features
    if (ctx.session.expectingVideo) {
      // Handle based on context
      switch (ctx.session.videoContext) {
        case 'sticker':
          await this.handleVideoForSticker(ctx);
          break;
        default:
          break;
      }
    }
  }

  async handleDocument(ctx) {
    // Handle incoming documents
    if (ctx.session.expectingDocument) {
      // Handle based on context
      switch (ctx.session.documentContext) {
        case 'sticker':
          await this.handleDocumentForSticker(ctx);
          break;
        default:
          break;
      }
    }
  }

  async handleVideoForSticker(ctx) {
    try {
      const video = ctx.message.video;
      const fileId = video.file_id;
      
      const file = await ctx.telegram.getFile(fileId);
      const fileUrl = `https://api.telegram.org/file/bot${config.bot.token}/${file.file_path}`;
      
      const response = await axios({
        method: 'GET',
        url: fileUrl,
        responseType: 'arraybuffer'
      });

      const videoBuffer = Buffer.from(response.data);
      
      // Convert to sticker (extract frame)
      const processedBuffer = await this.convertVideoToSticker(videoBuffer);
      
      await ctx.replyWithSticker({
        source: processedBuffer
      });

      ctx.session.expectingVideo = false;
      ctx.session.videoContext = null;

    } catch (error) {
      logger.error('Video to Sticker Error:', error);
      ctx.reply('❌ Gagal mengkonversi video ke sticker.');
    }
  }

  async handleDocumentForSticker(ctx) {
    try {
      const document = ctx.message.document;
      const fileId = document.file_id;
      
      const file = await ctx.telegram.getFile(fileId);
      const fileUrl = `https://api.telegram.org/file/bot${config.bot.token}/${file.file_path}`;
      
      const response = await axios({
        method: 'GET',
        url: fileUrl,
        responseType: 'arraybuffer'
      });

      const documentBuffer = Buffer.from(response.data);
      
      // Convert to sticker
      const processedBuffer = await this.convertDocumentToSticker(documentBuffer);
      
      await ctx.replyWithSticker({
        source: processedBuffer
      });

      ctx.session.expectingDocument = false;
      ctx.session.documentContext = null;

    } catch (error) {
      logger.error('Document to Sticker Error:', error);
      ctx.reply('❌ Gagal mengkonversi document ke sticker.');
    }
  }

  async applyImageEffect(imageBuffer, effect, isPremium) {
    const sharp = require('sharp');
    
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
        case 'vintage':
          if (isPremium) {
            sharpImage = sharpImage.modulate({ brightness: 1.2, saturation: 0.8 }).tint({ r: 255, g: 238, b: 196 });
          } else {
            throw new Error('Vintage effect is premium only');
          }
          break;
        case 'cold':
          if (isPremium) {
            sharpImage = sharpImage.tint({ r: 200, g: 220, b: 255 });
          } else {
            throw new Error('Cold effect is premium only');
          }
          break;
        case 'warm':
          if (isPremium) {
            sharpImage = sharpImage.tint({ r: 255, g: 220, b: 200 });
          } else {
            throw new Error('Warm effect is premium only');
          }
          break;
        case 'dramatic':
          if (isPremium) {
            sharpImage = sharpImage.linear(1.5, -50).sharpen();
          } else {
            throw new Error('Dramatic effect is premium only');
          }
          break;
        default:
          throw new Error('Effect not found');
      }
      
      return await sharpImage.png().toBuffer();
    } catch (error) {
      logger.error('Image Effect Error:', error);
      throw error;
    }
  }

  async convertToSticker(imageBuffer) {
    const sharp = require('sharp');
    
    try {
      return await sharp(imageBuffer)
        .resize(512, 512, {
          fit: 'contain',
          background: { r: 255, g: 255, b: 255, alpha: 0 }
        })
        .png()
        .toBuffer();
    } catch (error) {
      logger.error('Convert to Sticker Error:', error);
      throw error;
    }
  }

  async createMeme(imageBuffer, text) {
    const sharp = require('sharp');
    const { createCanvas, loadImage } = require('canvas');
    
    try {
      // Load image
      const image = await loadImage(imageBuffer);
      const canvas = createCanvas(image.width, image.height);
      const ctx = canvas.getContext('2d');
      
      // Draw image
      ctx.drawImage(image, 0, 0);
      
      // Add text
      ctx.font = 'bold 48px Impact';
      ctx.fillStyle = 'white';
      ctx.strokeStyle = 'black';
      ctx.lineWidth = 3;
      ctx.textAlign = 'center';
      
      // Top text
      const topText = text.toUpperCase();
      const topY = 60;
      ctx.strokeText(topText, canvas.width / 2, topY);
      ctx.fillText(topText, canvas.width / 2, topY);
      
      // Convert to buffer
      return canvas.toBuffer('image/png');
    } catch (error) {
      logger.error('Meme Creation Error:', error);
      throw error;
    }
  }

  async convertVideoToSticker(videoBuffer) {
    // This would extract a frame from video and convert to sticker
    // For now, return a placeholder
    return videoBuffer;
  }

  async convertDocumentToSticker(documentBuffer) {
    // This would convert document to sticker
    // For now, return a placeholder
    return documentBuffer;
  }
}

module.exports = new ImageHandler();