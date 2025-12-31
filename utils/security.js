const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const config = require('../config');
const logger = require('./logger');

class Security {
  constructor() {
    this.jwtSecret = config.security.jwtSecret;
    this.encryptionKey = config.security.encryptionKey;
  }

  // Generate JWT token
  generateToken(payload, expiresIn = '24h') {
    try {
      return jwt.sign(payload, this.jwtSecret, { expiresIn });
    } catch (error) {
      logger.error('JWT generation error:', error);
      return null;
    }
  }

  // Verify JWT token
  verifyToken(token) {
    try {
      return jwt.verify(token, this.jwtSecret);
    } catch (error) {
      logger.error('JWT verification error:', error);
      return null;
    }
  }

  // Encrypt sensitive data
  encrypt(text) {
    try {
      const algorithm = 'aes-256-cbc';
      const key = crypto.createHash('sha256').update(this.encryptionKey).digest('hex').substr(0, 32);
      const iv = crypto.randomBytes(16);
      
      let cipher = crypto.createCipheriv(algorithm, Buffer.from(key), iv);
      let encrypted = cipher.update(text);
      encrypted = Buffer.concat([encrypted, cipher.final()]);
      
      return iv.toString('hex') + ':' + encrypted.toString('hex');
    } catch (error) {
      logger.error('Encryption error:', error);
      return null;
    }
  }

  // Decrypt sensitive data
  decrypt(text) {
    try {
      const algorithm = 'aes-256-cbc';
      const key = crypto.createHash('sha256').update(this.encryptionKey).digest('hex').substr(0, 32);
      
      let textParts = text.split(':');
      let iv = Buffer.from(textParts.shift(), 'hex');
      let encryptedText = Buffer.from(textParts.join(':'), 'hex');
      
      let decipher = crypto.createDecipheriv(algorithm, Buffer.from(key), iv);
      let decrypted = decipher.update(encryptedText);
      decrypted = Buffer.concat([decrypted, decipher.final()]);
      
      return decrypted.toString();
    } catch (error) {
      logger.error('Decryption error:', error);
      return null;
    }
  }

  // Generate random string
  generateRandomString(length = 32) {
    try {
      return crypto.randomBytes(length).toString('hex');
    } catch (error) {
      logger.error('Random string generation error:', error);
      return null;
    }
  }

  // Hash password
  hashPassword(password) {
    try {
      return crypto.createHash('sha256').update(password).digest('hex');
    } catch (error) {
      logger.error('Password hashing error:', error);
      return null;
    }
  }

  // Validate admin access
  isAdmin(userId) {
    return config.security.adminIds.includes(userId.toString());
  }

  // Validate premium access
  isPremium(userId) {
    return config.security.premiumUsers.includes(userId.toString());
  }

  // Check rate limit
  async checkRateLimit(userId, limit = 10, windowMs = 60000) {
    try {
      const key = `rate_limit:${userId}`;
      const now = Date.now();
      const windowStart = now - windowMs;

      // This would integrate with Redis in production
      // For now, return true (allow request)
      return true;
    } catch (error) {
      logger.error('Rate limit check error:', error);
      return true; // Allow request on error
    }
  }

  // Sanitize input
  sanitizeInput(input) {
    if (typeof input !== 'string') return input;
    
    return input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<[^>]*>/g, '')
      .trim();
  }

  // Validate URL
  isValidUrl(url) {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  // Generate API key
  generateApiKey() {
    return this.generateRandomString(64);
  }

  // Validate API key
  validateApiKey(apiKey) {
    // This would check against database in production
    return apiKey && apiKey.length === 128;
  }

  // Create session
  createSession(userId, data = {}) {
    const sessionData = {
      userId,
      ...data,
      createdAt: new Date().toISOString()
    };
    
    return {
      sessionId: this.generateRandomString(32),
      token: this.generateToken(sessionData),
      data: sessionData
    };
  }

  // Anti-spam check
  async checkSpam(userId, message) {
    try {
      // Simple spam detection
      const spamKeywords = ['spam', 'bot', 'hack', 'crack', 'illegal'];
      const messageLower = message.toLowerCase();
      
      for (const keyword of spamKeywords) {
        if (messageLower.includes(keyword)) {
          logger.userAction(userId, 'spam_detected', { keyword });
          return true;
        }
      }
      
      return false;
    } catch (error) {
      logger.error('Spam check error:', error);
      return false;
    }
  }

  // Content filter (disabled by default for freedom)
  async filterContent(content) {
    // Content filtering is disabled for freedom of speech
    // This method can be enabled if needed
    return {
      allowed: true,
      reason: null,
      filteredContent: content
    };
  }

  // Log security events
  logSecurityEvent(userId, event, details = {}) {
    logger.userAction(userId, `security_${event}`, details);
  }

  // Check suspicious activity
  async checkSuspiciousActivity(userId) {
    try {
      // This would implement various checks in production
      // For now, always return false (no suspicious activity)
      return false;
    } catch (error) {
      logger.error('Suspicious activity check error:', error);
      return false;
    }
  }

  // Generate secure payment reference
  generatePaymentReference() {
    const timestamp = Date.now().toString();
    const random = this.generateRandomString(16);
    return `PAY_${timestamp}_${random}`;
  }

  // Validate payment reference
  validatePaymentReference(reference) {
    const pattern = /^PAY_\d+_[a-f0-9]{32}$/;
    return pattern.test(reference);
  }
}

module.exports = new Security();