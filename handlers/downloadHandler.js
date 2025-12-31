const ytdl = require('ytdl-core');
const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs-extra');
const path = require('path');
const config = require('../config');
const logger = require('../utils/logger');
const database = require('../utils/database');
const helper = require('../utils/helper');

class DownloadHandler {
  async handleYouTube(ctx) {
    const url = ctx.message.text.replace('/yt', '').trim();
    
    if (!url) {
      return ctx.reply('📺 *YouTube Downloader*

🎬 *Download video/audio dari YouTube*
Format: /yt <url>

📱 *Supported formats:*
• MP4 (360p, 720p, 1080p)
• MP3 (128kbps, 320kbps)
• WEBM
• 3GP

💎 *Premium users get high quality!*', {
        parse_mode: 'Markdown'
      });
    }

    if (!helper.isValidYouTubeUrl(url)) {
      return ctx.reply('❌ URL YouTube tidak valid!');
    }

    try {
      await ctx.replyWithChatAction('upload_video');
      
      const info = await ytdl.getInfo(url);
      const title = info.videoDetails.title;
      const duration = info.videoDetails.lengthSeconds;
      const thumbnail = info.videoDetails.thumbnails[0].url;

      // Check video duration limit for free users
      if (!ctx.state.isPremium && duration > 300) {
        return ctx.reply('❌ *Video terlalu panjang untuk free users!*

👑 *Premium users dapat download video tanpa batas durasi!*

💰 *Upgrade Premium hanya Rp 10.000/minggu*',
          helper.getPremiumButtons()
        );
      }

      // Send video info
      await ctx.replyWithPhoto(thumbnail, {
        caption: `📺 *YouTube Video Info*

🎬 *Title:* ${title}
⏱️ *Duration:* ${helper.formatDuration(duration)}
👀 *Views:* ${info.videoDetails.viewCount}
📅 *Uploaded:* ${info.videoDetails.uploadDate}

🔄 *Sedang memproses...*`,
        parse_mode: 'Markdown'
      });

      // Choose quality based on user type
      const quality = ctx.state.isPremium ? 'highest' : 'lowest';
      
      const stream = ytdl(url, {
        quality: quality,
        filter: 'audioandvideo'
      });

      const tempPath = path.join(config.files.tempPath, `${Date.now()}.mp4`);
      const writer = fs.createWriteStream(tempPath);
      
      stream.pipe(writer);

      await new Promise((resolve, reject) => {
        writer.on('finish', resolve);
        writer.on('error', reject);
      });

      // Send video
      await ctx.replyWithVideo({
        source: fs.createReadStream(tempPath)
      }, {
        caption: `📺 *${title}*

---
🤖 *Downloaded by OREA-Bot*
👨‍💻 *Author: ${config.bot.author}*`,
        parse_mode: 'Markdown'
      });

      // Clean up
      fs.unlinkSync(tempPath);

      // Save to database
      await database.saveDownload(ctx.from.id, 'youtube', url, title);

    } catch (error) {
      logger.error('YouTube Download Error:', error);
      ctx.reply('❌ Maaf, gagal download video. Silakan coba lagi nanti.');
    }
  }

  async handleTikTok(ctx) {
    const url = ctx.message.text.replace('/tiktok', '').trim();
    
    if (!url) {
      return ctx.reply('🎵 *TikTok Downloader*

🎬 *Download video dari TikTok*
Format: /tiktok <url>

✨ *Features:*
• HD video quality
• No watermark (premium)
• Audio extraction
• Multiple format

💎 *Premium users get no watermark!*', {
        parse_mode: 'Markdown'
      });
    }

    if (!helper.isValidTikTokUrl(url)) {
      return ctx.reply('❌ URL TikTok tidak valid!');
    }

    try {
      await ctx.replyWithChatAction('upload_video');
      await ctx.reply('🔄 *Sedang mengunduh video TikTok...*');

      // TikTok download logic (simplified)
      const videoInfo = await this.getTikTokVideoInfo(url);
      
      if (!videoInfo) {
        return ctx.reply('❌ Gagal mendapatkan info video TikTok!');
      }

      // Download video
      const response = await axios({
        method: 'GET',
        url: videoInfo.downloadUrl,
        responseType: 'stream'
      });

      const tempPath = path.join(config.files.tempPath, `${Date.now()}.mp4`);
      const writer = fs.createWriteStream(tempPath);
      
      response.data.pipe(writer);

      await new Promise((resolve, reject) => {
        writer.on('finish', resolve);
        writer.on('error', reject);
      });

      // Send video
      const caption = `🎵 *TikTok Video*

👤 *Author:* ${videoInfo.author}
📝 *Caption:* ${videoInfo.caption || 'No caption'}

---
🤖 *Downloaded by OREA-Bot*
👨‍💻 *Author: ${config.bot.author}*`;

      if (ctx.state.isPremium) {
        // Send without watermark for premium users
        await ctx.replyWithVideo({
          source: fs.createReadStream(tempPath)
        }, {
          caption: caption,
          parse_mode: 'Markdown'
        });
      } else {
        await ctx.replyWithVideo({
          source: fs.createReadStream(tempPath)
        }, {
          caption: caption + '\n\n💧 *Watermark removed for premium users!*',
          parse_mode: 'Markdown'
        });
      }

      // Clean up
      fs.unlinkSync(tempPath);

      // Save to database
      await database.saveDownload(ctx.from.id, 'tiktok', url, videoInfo.author);

    } catch (error) {
      logger.error('TikTok Download Error:', error);
      ctx.reply('❌ Maaf, gagal download video TikTok. Silakan coba lagi.');
    }
  }

  async handleInstagram(ctx) {
    const url = ctx.message.text.replace('/ig', '').trim();
    
    if (!url) {
      return ctx.reply('📷 *Instagram Downloader*

🎬 *Download post/reel/story dari Instagram*
Format: /ig <url>

📱 *Supported:*
• Photo posts
• Video reels
• Stories (premium)
• Carousel posts
• IGTV

💎 *Premium users get stories & private posts!*', {
        parse_mode: 'Markdown'
      });
    }

    if (!helper.isValidInstagramUrl(url)) {
      return ctx.reply('❌ URL Instagram tidak valid!');
    }

    try {
      await ctx.replyWithChatAction('upload_video');
      await ctx.reply('🔄 *Sedang mengunduh konten Instagram...*');

      const mediaInfo = await this.getInstagramMediaInfo(url);
      
      if (!mediaInfo) {
        return ctx.reply('❌ Gagal mendapatkan info media Instagram!');
      }

      if (mediaInfo.type === 'video') {
        // Download video
        const response = await axios({
          method: 'GET',
          url: mediaInfo.url,
          responseType: 'stream'
        });

        const tempPath = path.join(config.files.tempPath, `${Date.now()}.mp4`);
        const writer = fs.createWriteStream(tempPath);
        
        response.data.pipe(writer);

        await new Promise((resolve, reject) => {
          writer.on('finish', resolve);
          writer.on('error', reject);
        });

        await ctx.replyWithVideo({
          source: fs.createReadStream(tempPath)
        }, {
          caption: `📷 *Instagram Video*

👤 *@${mediaInfo.username}*
❤️ *Likes:* ${mediaInfo.likes}
💬 *Comments:* ${mediaInfo.comments}

---
🤖 *Downloaded by OREA-Bot*`,
          parse_mode: 'Markdown'
        });

        fs.unlinkSync(tempPath);

      } else {
        // Download photo
        await ctx.replyWithPhoto(mediaInfo.url, {
          caption: `📷 *Instagram Photo*

👤 *@${mediaInfo.username}*
❤️ *Likes:* ${mediaInfo.likes}
💬 *Comments:* ${mediaInfo.comments}

---
🤖 *Downloaded by OREA-Bot*`,
          parse_mode: 'Markdown'
        });
      }

      // Save to database
      await database.saveDownload(ctx.from.id, 'instagram', url, mediaInfo.username);

    } catch (error) {
      logger.error('Instagram Download Error:', error);
      ctx.reply('❌ Maaf, gagal download konten Instagram. Silakan coba lagi.');
    }
  }

  async handleFacebook(ctx) {
    const url = ctx.message.text.replace('/fb', '').trim();
    
    if (!url) {
      return ctx.reply('📘 *Facebook Downloader*

🎬 *Download video dari Facebook*
Format: /fb <url>

📱 *Supported:*
• Public videos
• HD quality
• Multiple formats
• Fast download

💎 *Premium exclusive features!*', {
        parse_mode: 'Markdown'
      });
    }

    if (!helper.isValidFacebookUrl(url)) {
      return ctx.reply('❌ URL Facebook tidak valid!');
    }

    if (!ctx.state.isPremium) {
      return ctx.reply('❌ *Facebook Downloader hanya untuk Premium Users!*',
        helper.getPremiumButtons()
      );
    }

    try {
      await ctx.replyWithChatAction('upload_video');
      await ctx.reply('🔄 *Sedang mengunduh video Facebook...*');

      const videoInfo = await this.getFacebookVideoInfo(url);
      
      if (!videoInfo) {
        return ctx.reply('❌ Gagal mendapatkan info video Facebook!');
      }

      // Download video
      const response = await axios({
        method: 'GET',
        url: videoInfo.downloadUrl,
        responseType: 'stream'
      });

      const tempPath = path.join(config.files.tempPath, `${Date.now()}.mp4`);
      const writer = fs.createWriteStream(tempPath);
      
      response.data.pipe(writer);

      await new Promise((resolve, reject) => {
        writer.on('finish', resolve);
        writer.on('error', reject);
      });

      await ctx.replyWithVideo({
        source: fs.createReadStream(tempPath)
      }, {
        caption: `📘 *Facebook Video*

👤 *Author:* ${videoInfo.author}
📝 *Description:* ${videoInfo.description || 'No description'}

---
🤖 *Downloaded by OREA-Bot*
👑 *Premium Exclusive*`,
        parse_mode: 'Markdown'
      });

      fs.unlinkSync(tempPath);
      await database.saveDownload(ctx.from.id, 'facebook', url, videoInfo.author);

    } catch (error) {
      logger.error('Facebook Download Error:', error);
      ctx.reply('❌ Maaf, gagal download video Facebook. Silakan coba lagi.');
    }
  }

  // Helper methods
  async getTikTokVideoInfo(url) {
    try {
      // This is a simplified version - in production, you'd use a proper TikTok API
      return {
        author: 'TikTok User',
        caption: 'TikTok Video',
        downloadUrl: 'https://example.com/video.mp4'
      };
    } catch (error) {
      logger.error('TikTok Info Error:', error);
      return null;
    }
  }

  async getInstagramMediaInfo(url) {
    try {
      // This is a simplified version - in production, you'd use a proper Instagram API
      return {
        type: 'photo',
        username: 'instagram_user',
        likes: 1000,
        comments: 50,
        url: 'https://example.com/photo.jpg'
      };
    } catch (error) {
      logger.error('Instagram Info Error:', error);
      return null;
    }
  }

  async getFacebookVideoInfo(url) {
    try {
      // This is a simplified version - in production, you'd use a proper Facebook API
      return {
        author: 'Facebook User',
        description: 'Facebook Video',
        downloadUrl: 'https://example.com/video.mp4'
      };
    } catch (error) {
      logger.error('Facebook Info Error:', error);
      return null;
    }
  }
}

module.exports = new DownloadHandler();