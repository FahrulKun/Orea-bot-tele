const config = {
  // Bot Information
  bot: {
    token: process.env.BOT_TOKEN || '',
    username: process.env.BOT_USERNAME || 'OREA_Bot',
    name: process.env.BOT_NAME || 'OREA-Bot',
    author: process.env.BOT_AUTHOR || 'OREA_85',
    ownerNumber: process.env.OWNER_NUMBER || '085891389246',
    bcaAccount: process.env.BCA_ACCOUNT || '6370506149',
    version: '1.0.0',
    description: 'Bot Telegram Premium dengan Fitur Lengkap',
    website: 'https://orea-bot.com'
  },

  // API Keys
  api: {
    openai: process.env.OPENAI_API_KEY || '',
    google: process.env.GOOGLE_API_KEY || '',
    youtube: process.env.YOUTUBE_API_KEY || '',
    spotify: {
      clientId: process.env.SPOTIFY_CLIENT_ID || '',
      clientSecret: process.env.SPOTIFY_CLIENT_SECRET || ''
    },
    twitter: {
      apiKey: process.env.TWITTER_API_KEY || '',
      apiSecret: process.env.TWITTER_API_SECRET || '',
      accessToken: process.env.TWITTER_ACCESS_TOKEN || '',
      accessTokenSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET || ''
    }
  },

  // Database Configuration
  database: {
    mongodb: process.env.MONGODB_URI || 'mongodb://localhost:27017/orea-bot',
    redis: process.env.REDIS_URL || 'redis://localhost:6379'
  },

  // Server Configuration
  server: {
    port: parseInt(process.env.PORT) || 3000,
    nodeEnv: process.env.NODE_ENV || 'development',
    webhookUrl: process.env.WEBHOOK_URL || '',
    baseUrl: process.env.API_BASE_URL || 'http://localhost:3000'
  },

  // Security Configuration
  security: {
    jwtSecret: process.env.JWT_SECRET || 'default-jwt-secret',
    encryptionKey: process.env.ENCRYPTION_KEY || 'default-encryption-key',
    adminIds: process.env.ADMIN_IDS ? process.env.ADMIN_IDS.split(',') : [],
    premiumUsers: process.env.PREMIUM_USERS ? process.env.PREMIUM_USERS.split(',') : []
  },

  // Feature Configuration
  features: {
    aiChat: process.env.ENABLE_AI_CHAT === 'true',
    download: process.env.ENABLE_DOWNLOAD === 'true',
    stickerMaker: process.env.ENABLE_STICKER_MAKER === 'true',
    imageEditor: process.env.ENABLE_IMAGE_EDITOR === 'true',
    voiceChanger: process.env.ENABLE_VOICE_CHANGER === 'true',
    translator: process.env.ENABLE_TRANSLATOR === 'true',
    weather: process.env.ENABLE_WEATHER === 'true',
    crypto: process.env.ENABLE_CRYPTO === 'true',
    news: process.env.ENABLE_NEWS === 'true',
    games: process.env.ENABLE_GAMES === 'true',
    quiz: process.env.ENABLE_QUIZ === 'true',
    poll: process.env.ENABLE_POLL === 'true',
    survey: process.env.ENABLE_SURVEY === 'true'
  },

  // Rate Limiting
  rateLimit: {
    window: parseInt(process.env.RATE_LIMIT_WINDOW) || 60000,
    max: parseInt(process.env.RATE_LIMIT_MAX) || 100,
    premiumMax: parseInt(process.env.PREMIUM_RATE_LIMIT_MAX) || 500
  },

  // File Configuration
  files: {
    maxSize: parseInt(process.env.MAX_FILE_SIZE) || 20971520, // 20MB
    allowedTypes: process.env.ALLOWED_FILE_TYPES ? process.env.ALLOWED_FILE_TYPES.split(',') : ['jpg', 'jpeg', 'png', 'gif', 'mp4', 'mp3', 'pdf', 'doc', 'docx', 'txt'],
    downloadPath: process.env.DOWNLOAD_PATH || './downloads',
    tempPath: process.env.TEMP_PATH || './temp',
    backupPath: process.env.BACKUP_PATH || './backups'
  },

  // Logging Configuration
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    logFile: process.env.LOG_FILE || './logs/bot.log',
    errorLogFile: process.env.ERROR_LOG_FILE || './logs/error.log'
  },

  // Payment Configuration
  payment: {
    provider: process.env.PAYMENT_PROVIDER || 'midtrans',
    midtrans: {
      serverKey: process.env.MIDTRANS_SERVER_KEY || '',
      clientKey: process.env.MIDTRANS_CLIENT_KEY || ''
    }
  },

  // Social Media Configuration
  socialMedia: {
    instagram: {
      username: process.env.INSTAGRAM_USERNAME || '',
      password: process.env.INSTAGRAM_PASSWORD || ''
    },
    facebook: {
      token: process.env.FACEBOOK_TOKEN || ''
    },
    tiktok: {
      sessionId: process.env.TIKTOK_SESSION_ID || ''
    }
  },

  // Monitoring Configuration
  monitoring: {
    enabled: process.env.ENABLE_MONITORING === 'true',
    interval: parseInt(process.env.MONITORING_INTERVAL) || 30000,
    healthCheckInterval: parseInt(process.env.HEALTH_CHECK_INTERVAL) || 60000
  },

  // Backup Configuration
  backup: {
    auto: process.env.AUTO_BACKUP === 'true',
    interval: parseInt(process.env.BACKUP_INTERVAL) || 86400000, // 24 hours
    maxFiles: parseInt(process.env.MAX_BACKUP_FILES) || 7
  },

  // Performance Configuration
  performance: {
    cacheTtl: parseInt(process.env.CACHE_TTL) || 3600,
    maxConcurrentDownloads: parseInt(process.env.MAX_CONCURRENT_DOWNLOADS) || 5,
    maxConcurrentUploads: parseInt(process.env.MAX_CONCURRENT_UPLOADS) || 3,
    queueSize: parseInt(process.env.QUEUE_SIZE) || 1000
  },

  // Theme Configuration
  theme: {
    name: process.env.THEME || 'dark',
    primaryColor: process.env.PRIMARY_COLOR || '#FF6B35',
    secondaryColor: process.env.SECONDARY_COLOR || '#004E89',
    accentColor: process.env.ACCENT_COLOR || '#A23B72',
    backgroundColor: process.env.BACKGROUND_COLOR || '#1A1A1A',
    textColor: process.env.TEXT_COLOR || '#FFFFFF'
  },

  // Language Configuration
  language: {
    default: process.env.DEFAULT_LANGUAGE || 'id',
    supported: process.env.SUPPORTED_LANGUAGES ? process.env.SUPPORTED_LANGUAGES.split(',') : ['id', 'en', 'ja', 'ko', 'zh', 'es', 'fr', 'de', 'ru', 'ar']
  },

  // Development Configuration
  development: {
    debug: process.env.DEBUG === 'true',
    verbose: process.env.VERBOSE === 'true',
    hideSensitiveData: process.env.HIDE_SENSITIVE_DATA !== 'false'
  }
};

module.exports = config;