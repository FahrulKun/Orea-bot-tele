const config = require('../config');
const logger = require('./logger');

class Cache {
  constructor() {
    this.cache = new Map();
    this.ttl = new Map();
  }

  async set(key, value, ttlSeconds = 3600) {
    try {
      this.cache.set(key, value);
      
      if (ttlSeconds > 0) {
        const expiryTime = Date.now() + (ttlSeconds * 1000);
        this.ttl.set(key, expiryTime);
      }

      logger.debug(`Cache SET: ${key}`);
      return true;
    } catch (error) {
      logger.error('Cache SET error:', error);
      return false;
    }
  }

  async get(key) {
    try {
      // Check if key exists
      if (!this.cache.has(key)) {
        return null;
      }

      // Check if key has expired
      if (this.ttl.has(key)) {
        const expiryTime = this.ttl.get(key);
        if (Date.now() > expiryTime) {
          this.delete(key);
          return null;
        }
      }

      const value = this.cache.get(key);
      logger.debug(`Cache GET: ${key}`);
      return value;
    } catch (error) {
      logger.error('Cache GET error:', error);
      return null;
    }
  }

  async delete(key) {
    try {
      this.cache.delete(key);
      this.ttl.delete(key);
      logger.debug(`Cache DELETE: ${key}`);
      return true;
    } catch (error) {
      logger.error('Cache DELETE error:', error);
      return false;
    }
  }

  async clear() {
    try {
      this.cache.clear();
      this.ttl.clear();
      logger.info('Cache cleared');
      return true;
    } catch (error) {
      logger.error('Cache CLEAR error:', error);
      return false;
    }
  }

  async exists(key) {
    try {
      if (!this.cache.has(key)) {
        return false;
      }

      if (this.ttl.has(key)) {
        const expiryTime = this.ttl.get(key);
        if (Date.now() > expiryTime) {
          this.delete(key);
          return false;
        }
      }

      return true;
    } catch (error) {
      logger.error('Cache EXISTS error:', error);
      return false;
    }
  }

  // Clean up expired keys
  cleanup() {
    const now = Date.now();
    let cleaned = 0;

    for (const [key, expiryTime] of this.ttl.entries()) {
      if (now > expiryTime) {
        this.delete(key);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      logger.debug(`Cache cleanup: removed ${cleaned} expired keys`);
    }
  }

  // Get cache statistics
  getStats() {
    return {
      size: this.cache.size,
      ttlSize: this.ttl.size,
      memoryUsage: process.memoryUsage()
    };
  }
}

// Auto cleanup every 5 minutes
const cache = new Cache();
setInterval(() => cache.cleanup(), 5 * 60 * 1000);

module.exports = cache;