const winston = require('winston');
const path = require('path');
const fs = require('fs-extra');
const config = require('../config');

// Ensure logs directory exists
fs.ensureDirSync(path.dirname(config.logging.logFile));
fs.ensureDirSync(path.dirname(config.logging.errorLogFile));

// Create logger
const logger = winston.createLogger({
  level: config.logging.level,
  format: winston.format.combine(
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'orea-bot' },
  transports: [
    // Write all logs with importance level of `error` or less to `error.log`
    new winston.transports.File({ 
      filename: config.logging.errorLogFile, 
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5
    }),
    // Write all logs to `combined.log`
    new winston.transports.File({ 
      filename: config.logging.logFile,
      maxsize: 5242880, // 5MB
      maxFiles: 5
    })
  ]
});

// If we're not in production, log to the console
if (config.server.nodeEnv !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }));
}

// Custom logging methods
logger.botStart = (botInfo) => {
  logger.info('🤖 Bot Started', {
    name: botInfo.name,
    username: botInfo.username,
    author: botInfo.author,
    owner: botInfo.ownerNumber,
    timestamp: new Date().toISOString()
  });
};

logger.userAction = (userId, action, details = {}) => {
  logger.info('👤 User Action', {
    userId,
    action,
    details,
    timestamp: new Date().toISOString()
  });
};

logger.download = (userId, platform, url, success = true) => {
  logger.info('📥 Download Action', {
    userId,
    platform,
    url: config.development.hideSensitiveData ? '[HIDDEN]' : url,
    success,
    timestamp: new Date().toISOString()
  });
};

logger.aiChat = (userId, message, responseLength) => {
  logger.info('🤖 AI Chat', {
    userId,
    messageLength: message.length,
    responseLength,
    timestamp: new Date().toISOString()
  });
};

logger.payment = (userId, amount, type, status) => {
  logger.info('💳 Payment', {
    userId,
    amount,
    type,
    status,
    timestamp: new Date().toISOString()
  });
};

logger.error = (message, error = {}) => {
  logger.error('❌ Error', {
    message,
    error: error.message || error,
    stack: error.stack,
    timestamp: new Date().toISOString()
  });
};

module.exports = logger;