const config = require('./config');

// Test configuration
console.log('🧪 Testing OREA-Bot Configuration...');
console.log('✅ Config loaded successfully');

// Test imports
try {
  const logger = require('./utils/logger');
  console.log('✅ Logger loaded successfully');
  
  const database = require('./utils/database');
  console.log('✅ Database utils loaded successfully');
  
  const security = require('./utils/security');
  console.log('✅ Security utils loaded successfully');
  
  const helper = require('./utils/helper');
  console.log('✅ Helper utils loaded successfully');
  
  const cache = require('./utils/cache');
  console.log('✅ Cache utils loaded successfully');
  
  // Test handlers
  const aiHandler = require('./handlers/aiHandler');
  console.log('✅ AI Handler loaded successfully');
  
  const downloadHandler = require('./handlers/downloadHandler');
  console.log('✅ Download Handler loaded successfully');
  
  const stickerHandler = require('./handlers/stickerHandler');
  console.log('✅ Sticker Handler loaded successfully');
  
  const imageHandler = require('./handlers/imageHandler');
  console.log('✅ Image Handler loaded successfully');
  
  const voiceHandler = require('./handlers/voiceHandler');
  console.log('✅ Voice Handler loaded successfully');
  
  const translateHandler = require('./handlers/translateHandler');
  console.log('✅ Translate Handler loaded successfully');
  
  const weatherHandler = require('./handlers/weatherHandler');
  console.log('✅ Weather Handler loaded successfully');
  
  const cryptoHandler = require('./handlers/cryptoHandler');
  console.log('✅ Crypto Handler loaded successfully');
  
  const newsHandler = require('./handlers/newsHandler');
  console.log('✅ News Handler loaded successfully');
  
  const gameHandler = require('./handlers/gameHandler');
  console.log('✅ Game Handler loaded successfully');
  
  const adminHandler = require('./handlers/adminHandler');
  console.log('✅ Admin Handler loaded successfully');
  
  const paymentHandler = require('./handlers/paymentHandler');
  console.log('✅ Payment Handler loaded successfully');
  
  console.log('\n🎉 All modules loaded successfully!');
  console.log('🤖 OREA-Bot is ready to deploy!');
  console.log(`👨‍💻 Author: ${config.bot.author}`);
  console.log(`📞 Owner: ${config.bot.ownerNumber}`);
  console.log(`🏦 BCA: ${config.bot.bcaAccount}`);
  
} catch (error) {
  console.error('❌ Error loading modules:', error.message);
  process.exit(1);
}