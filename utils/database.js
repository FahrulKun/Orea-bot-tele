const mongoose = require('mongoose');
const redis = require('redis');
const config = require('../config');
const logger = require('./logger');

class Database {
  constructor() {
    this.mongodb = null;
    this.redis = null;
  }

  async connect() {
    try {
      // Connect to MongoDB
      await mongoose.connect(config.database.mongodb);
      logger.info('✅ MongoDB connected successfully');
      this.mongodb = mongoose.connection;

      // Connect to Redis
      this.redis = redis.createClient({ url: config.database.redis });
      await this.redis.connect();
      logger.info('✅ Redis connected successfully');

      return true;
    } catch (error) {
      logger.error('Database connection error:', error);
      return false;
    }
  }

  async saveUser(user) {
    try {
      const User = mongoose.model('User', new mongoose.Schema({
        telegramId: { type: String, unique: true },
        firstName: String,
        lastName: String,
        username: String,
        isPremium: { type: Boolean, default: false },
        isAdmin: { type: Boolean, default: false },
        language: { type: String, default: 'id' },
        downloadCount: { type: Number, default: 0 },
        lastActive: { type: Date, default: Date.now },
        createdAt: { type: Date, default: Date.now }
      }));

      await User.findOneAndUpdate(
        { telegramId: user.id.toString() },
        {
          $set: {
            firstName: user.first_name,
            lastName: user.last_name,
            username: user.username,
            lastActive: new Date()
          },
          $setOnInsert: {
            telegramId: user.id.toString(),
            isPremium: config.security.premiumUsers.includes(user.id.toString()),
            isAdmin: config.security.adminIds.includes(user.id.toString())
          }
        },
        { upsert: true }
      );

      logger.userAction(user.id, 'user_saved');
    } catch (error) {
      logger.error('Save user error:', error);
    }
  }

  async saveAIChat(userId, message, response, model = 'gpt-4') {
    try {
      const Chat = mongoose.model('Chat', new mongoose.Schema({
        userId: String,
        message: String,
        response: String,
        model: String,
        timestamp: { type: Date, default: Date.now }
      }));

      await Chat.create({
        userId: userId.toString(),
        message,
        response,
        model
      });

      logger.aiChat(userId, message, response.length);
    } catch (error) {
      logger.error('Save AI chat error:', error);
    }
  }

  async saveDownload(userId, platform, url, title) {
    try {
      const Download = mongoose.model('Download', new mongoose.Schema({
        userId: String,
        platform: String,
        url: String,
        title: String,
        timestamp: { type: Date, default: Date.now }
      }));

      await Download.create({
        userId: userId.toString(),
        platform,
        url,
        title
      });

      // Update user download count
      await this.updateUserDownloadCount(userId);

      logger.download(userId, platform, url, true);
    } catch (error) {
      logger.error('Save download error:', error);
      logger.download(userId, platform, url, false);
    }
  }

  async saveSticker(userId, type) {
    try {
      const Sticker = mongoose.model('Sticker', new mongoose.Schema({
        userId: String,
        type: String,
        timestamp: { type: Date, default: Date.now }
      }));

      await Sticker.create({
        userId: userId.toString(),
        type
      });

      logger.userAction(userId, 'sticker_created', { type });
    } catch (error) {
      logger.error('Save sticker error:', error);
    }
  }

  async saveImageGeneration(userId, prompt, imageUrl) {
    try {
      const ImageGen = mongoose.model('ImageGen', new mongoose.Schema({
        userId: String,
        prompt: String,
        imageUrl: String,
        timestamp: { type: Date, default: Date.now }
      }));

      await ImageGen.create({
        userId: userId.toString(),
        prompt,
        imageUrl
      });

      logger.userAction(userId, 'image_generated', { promptLength: prompt.length });
    } catch (error) {
      logger.error('Save image generation error:', error);
    }
  }

  async updateUserDownloadCount(userId) {
    try {
      const User = mongoose.model('User');
      await User.updateOne(
        { telegramId: userId.toString() },
        { $inc: { downloadCount: 1 } }
      );
    } catch (error) {
      logger.error('Update download count error:', error);
    }
  }

  async getUserStats(userId) {
    try {
      const User = mongoose.model('User');
      const user = await User.findOne({ telegramId: userId.toString() });
      
      if (!user) return null;

      const Download = mongoose.model('Download');
      const downloadCount = await Download.countDocuments({ userId: userId.toString() });

      const Chat = mongoose.model('Chat');
      const chatCount = await Chat.countDocuments({ userId: userId.toString() });

      return {
        user: {
          telegramId: user.telegramId,
          firstName: user.firstName,
          username: user.username,
          isPremium: user.isPremium,
          isAdmin: user.isAdmin,
          joinDate: user.createdAt
        },
        stats: {
          downloads: downloadCount,
          chats: chatCount,
          totalDownloads: user.downloadCount
        }
      };
    } catch (error) {
      logger.error('Get user stats error:', error);
      return null;
    }
  }

  async getBotStats() {
    try {
      const User = mongoose.model('User');
      const totalUsers = await User.countDocuments();
      const premiumUsers = await User.countDocuments({ isPremium: true });
      const activeUsers = await User.countDocuments({ 
        lastActive: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
      });

      const Download = mongoose.model('Download');
      const totalDownloads = await Download.countDocuments();
      const todayDownloads = await Download.countDocuments({
        timestamp: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
      });

      const Chat = mongoose.model('Chat');
      const totalChats = await Chat.countDocuments();
      const todayChats = await Chat.countDocuments({
        timestamp: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
      });

      return {
        users: {
          total: totalUsers,
          premium: premiumUsers,
          active: activeUsers
        },
        downloads: {
          total: totalDownloads,
          today: todayDownloads
        },
        chats: {
          total: totalChats,
          today: todayChats
        }
      };
    } catch (error) {
      logger.error('Get bot stats error:', error);
      return null;
    }
  }

  async cacheSet(key, value, ttl = 3600) {
    try {
      if (this.redis) {
        await this.redis.setEx(key, ttl, JSON.stringify(value));
      }
    } catch (error) {
      logger.error('Cache set error:', error);
    }
  }

  async cacheGet(key) {
    try {
      if (this.redis) {
        const value = await this.redis.get(key);
        return value ? JSON.parse(value) : null;
      }
      return null;
    } catch (error) {
      logger.error('Cache get error:', error);
      return null;
    }
  }

  async cacheDelete(key) {
    try {
      if (this.redis) {
        await this.redis.del(key);
      }
    } catch (error) {
      logger.error('Cache delete error:', error);
    }
  }

  async close() {
    try {
      if (this.mongodb) {
        await mongoose.connection.close();
        logger.info('✅ MongoDB connection closed');
      }
      if (this.redis) {
        await this.redis.quit();
        logger.info('✅ Redis connection closed');
      }
    } catch (error) {
      logger.error('Database close error:', error);
    }
  }
}

module.exports = new Database();