const { Telegraf, session, Markup, Scenes, Stage } = require('telegraf');
const { LocalSession } = require('telegraf-session-local');
const rateLimit = require('telegraf-ratelimit');
const config = require('./config');
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs-extra');

// Import handlers
const aiHandler = require('./handlers/aiHandler');
const downloadHandler = require('./handlers/downloadHandler');
const stickerHandler = require('./handlers/stickerHandler');
const imageHandler = require('./handlers/imageHandler');
const voiceHandler = require('./handlers/voiceHandler');
const translateHandler = require('./handlers/translateHandler');
const weatherHandler = require('./handlers/weatherHandler');
const cryptoHandler = require('./handlers/cryptoHandler');
const newsHandler = require('./handlers/newsHandler');
const gameHandler = require('./handlers/gameHandler');
const adminHandler = require('./handlers/adminHandler');
const paymentHandler = require('./handlers/paymentHandler');

// Import utilities
const logger = require('./utils/logger');
const database = require('./utils/database');
const cache = require('./utils/cache');
const security = require('./utils/security');
const helper = require('./utils/helper');

// Initialize Express app
const app = express();
app.use(cors());
app.use(express.json());

// Create directories
fs.ensureDirSync(config.files.downloadPath);
fs.ensureDirSync(config.files.tempPath);
fs.ensureDirSync(config.files.backupPath);
fs.ensureDirSync('./logs');

// Initialize Telegraf bot
const bot = new Telegraf(config.bot.token);

// Session management
const sessions = new LocalSession({ database: 'sessions.json' });
bot.use(sessions.middleware());

// Rate limiting
const limit = rateLimit({
  window: config.rateLimit.window,
  limit: config.rateLimit.max,
  onLimitExceeded: (ctx) => {
    return ctx.reply('⚠️ Rate limit terlampaui! Silakan coba lagi nanti.');
  }
});
bot.use(limit);

// Middleware
bot.use(async (ctx, next) => {
  const start = Date.now();
  await next();
  const ms = Date.now() - start;
  logger.info(`${ctx.updateType} from ${ctx.from.username || ctx.from.id} took ${ms}ms`);
});

// Check if user is premium
bot.use(async (ctx, next) => {
  ctx.state.isPremium = config.security.premiumUsers.includes(ctx.from.id.toString());
  ctx.state.isAdmin = config.security.adminIds.includes(ctx.from.id.toString());
  await next();
});

// Start command
bot.start(async (ctx) => {
  const user = ctx.from;
  const welcomeMessage = `
🌟 *Selamat Datang di OREA-Bot Premium!* 🌟

👋 Hai ${user.first_name} ${user.last_name || ''}!

🤖 *Saya adalah OREA-Bot, bot Telegram premium dengan fitur lengkap!*

📝 *Fitur Utama:*
• 🎯 AI Chat GPT-4
• 📥 Download Media (YT, TikTok, IG)
• 🎨 Sticker Maker & Image Editor
• 🎤 Voice Changer
• 🌍 Translator 50+ Bahasa
• 🌤️ Cuaca & Berita
• 💰 Crypto & Saham
• 🎮 Games & Quiz
• 💳 Payment System
• 📊 Analytics Dashboard

👑 *Premium Features:*
• Unlimited Downloads
• No Rate Limits
• Priority Support
• Exclusive Commands

📞 *Contact Owner:*
• 📱 ${config.bot.ownerNumber}
• 🏦 BCA: ${config.bot.bcaAccount}
• 👨‍💻 Author: ${config.bot.author}

🚀 *Ketik /menu untuk melihat semua fitur!*

💎 *Upgrade ke Premium untuk akses unlimited!*
  `;

  await ctx.replyWithPhoto(
    'https://telegra.ph/file/4a0c5b5b5b5b5b5b5b5b5b.jpg',
    {
      caption: welcomeMessage,
      parse_mode: 'Markdown',
      ...Markup.inlineKeyboard([
        [
          Markup.button.callback('📋 Menu', 'menu'),
          Markup.button.callback('👑 Premium', 'premium')
        ],
        [
          Markup.button.callback('🎮 Games', 'games'),
          Markup.button.callback('🛠️ Tools', 'tools')
        ],
        [
          Markup.button.url('📞 Contact Owner', `https://wa.me/${config.bot.ownerNumber.replace(/^0/, '+62')}`),
          Markup.button.url('🌐 Website', config.bot.website)
        ]
      ])
    }
  );

  // Save user to database
  await database.saveUser(user);
});

// Help command
bot.help(async (ctx) => {
  const helpMessage = `
📖 *Bantuan OREA-Bot*

🤖 *Commands List:*

📋 *Menu & Info:*
• /start - Mulai bot
• /help - Bantuan
• /menu - Menu utama
• /info - Info bot
• /status - Status bot
• /premium - Info premium

🎯 *AI & Chat:*
• /ai <pesan> - Chat dengan AI
• /gpt <pesan> - Chat GPT-4
• /ask <pertanyaan> - Tanya AI
• /translate <kode_bahasa> <teks> - Terjemahkan

📥 *Download Media:*
• /yt <url> - Download YouTube
• /tiktok <url> - Download TikTok
• /ig <url> - Download Instagram
• /fb <url> - Download Facebook

🎨 *Creative Tools:*
• /sticker - Buat sticker
• /meme - Buat meme
• /qrcode - Buat QR code
• /write <teks> - Tulis di kertas

🎤 *Audio Tools:*
• /voice <teks> - Text to voice
• /tovoice - Ubah teks ke suara
• /bass - Efek bass
• /slow - Efek slowmo

🌍 *Informasi:*
• /weather <kota> - Cuaca
• /news - Berita terkini
• /crypto - Info crypto
• /rate <mata_uang> - Kurs mata uang

🎮 *Games & Fun:*
• /game - Main game
• /quiz - Quiz seru
• /truth - Truth or dare
• /spin - Spin wheel

💳 *Payment & Premium:*
• /premium - Upgrade premium
• /payment - Metode pembayaran
• /balance - Cek saldo

👑 *Admin Commands:*
• /admin - Panel admin
• /broadcast - Kirim broadcast
• /stats - Statistik bot
• /users - Data users

📞 *Need Help?*
Hubungi: @${config.bot.author}
WhatsApp: ${config.bot.ownerNumber}

💡 *Tips:*
• Gunakan /menu untuk navigasi mudah
• Premium users dapat akses unlimited
• Rate limit berlaku untuk free users
  `;

  await ctx.reply(helpMessage, {
    parse_mode: 'Markdown',
    ...Markup.inlineKeyboard([
      [Markup.button.callback('📋 Menu Utama', 'menu')],
      [Markup.button.callback('👑 Upgrade Premium', 'premium')],
      [Markup.button.url('📞 Contact Owner', `https://wa.me/${config.bot.ownerNumber.replace(/^0/, '+62')}`)]
    ])
  });
});

// Menu callback
bot.action('menu', async (ctx) => {
  const menuMessage = `
📋 *Menu Utama OREA-Bot*

🎯 Pilih kategori fitur:
  `;

  await ctx.editMessageText(menuMessage, {
    parse_mode: 'Markdown',
    ...Markup.inlineKeyboard([
      [
        Markup.button.callback('🤖 AI Chat', 'ai_menu'),
        Markup.button.callback('📥 Download', 'download_menu')
      ],
      [
        Markup.button.callback('🎨 Creative', 'creative_menu'),
        Markup.button.callback('🎤 Audio', 'audio_menu')
      ],
      [
        Markup.button.callback('🌍 Info', 'info_menu'),
        Markup.button.callback('🎮 Games', 'games_menu')
      ],
      [
        Markup.button.callback('💳 Payment', 'payment_menu'),
        Markup.button.callback('⚙️ Settings', 'settings_menu')
      ],
      [
        Markup.button.callback('🔙 Kembali', 'start')
      ]
    ])
  });
});

// AI Menu
bot.action('ai_menu', async (ctx) => {
  const aiMenu = `
🤖 *AI & Chat Features*

💬 *Chat dengan AI canggih:*
• GPT-4 untuk percakapan natural
• Image generation dari teks
• Code generation & debugging
• Translation 50+ bahasa
• Math & science help

📝 *Commands:*
• /ai <pesan> - Chat AI
• /gpt4 <pesan> - GPT-4 Pro
• /image <deskripsi> - Generate image
• /translate <bahasa> <teks> - Translate
• /code <bahasa> <kode> - Debug code
  `;

  await ctx.editMessageText(aiMenu, {
    parse_mode: 'Markdown',
    ...Markup.inlineKeyboard([
      [
        Markup.button.callback('💬 Chat AI', 'ai_chat'),
        Markup.button.callback('🖼️ Generate Image', 'ai_image')
      ],
      [
        Markup.button.callback('🔄 Translate', 'ai_translate'),
        Markup.button.callback('💻 Code Helper', 'ai_code')
      ],
      [
        Markup.button.callback('🔙 Kembali', 'menu')
      ]
    ])
  });
});

// Download Menu
bot.action('download_menu', async (ctx) => {
  const downloadMenu = `
📥 *Download Media Features*

🎬 *Support Platform:*
• YouTube (video & audio)
• TikTok (video & audio)
• Instagram (post, reel, story)
• Facebook (video)
• Twitter (video & image)
• SoundCloud (audio)
• Spotify (track & playlist)

⚡ *Features:*
• High quality download
• Multiple format support
• Batch download (premium)
• No watermark (premium)
• Cloud storage (premium)
  `;

  await ctx.editMessageText(downloadMenu, {
    parse_mode: 'Markdown',
    ...Markup.inlineKeyboard([
      [
        Markup.button.callback('📺 YouTube', 'download_youtube'),
        Markup.button.callback('🎵 TikTok', 'download_tiktok')
      ],
      [
        Markup.button.callback('📷 Instagram', 'download_instagram'),
        Markup.button.callback('📘 Facebook', 'download_facebook')
      ],
      [
        Markup.button.callback('🎶 SoundCloud', 'download_soundcloud'),
        Markup.button.callback('🎧 Spotify', 'download_spotify')
      ],
      [
        Markup.button.callback('🔙 Kembali', 'menu')
      ]
    ])
  });
});

// Premium info
bot.action('premium', async (ctx) => {
  const premiumMessage = `
👑 *OREA-Bot Premium*

💎 *Exclusive Features:*
• ✅ Unlimited downloads
• ✅ No rate limits
• ✅ Priority queue
• ✅ No watermarks
• ✅ Cloud storage 10GB
• ✅ Batch operations
• ✅ Custom commands
• ✅ 24/7 support
• ✅ Early access features
• ✅ API access

💰 *Harga Premium:*
• 📅 1 Minggu: Rp 10.000
• 📅 1 Bulan: Rp 25.000
• 📅 3 Bulan: Rp 60.000
• 📅 1 Tahun: Rp 200.000
• 🌟 Lifetime: Rp 500.000

💳 *Metode Pembayaran:*
• 🏦 BCA Transfer: ${config.bot.bcaAccount}
• 📱 Dana/Gopay/OVO
• 💳 Kartu Kredit
• 🪙 Crypto

📞 *Order Premium:*
Hubungi: @${config.bot.author}
WhatsApp: ${config.bot.ownerNumber}

🎁 *Bonus:*
Dapatkan 1 hari gratis trial!
  `;

  await ctx.editMessageText(premiumMessage, {
    parse_mode: 'Markdown',
    ...Markup.inlineKeyboard([
      [
        Markup.button.callback('📱 Order via WhatsApp', 'order_premium'),
        Markup.button.callback('💳 Metode Pembayaran', 'payment_methods')
      ],
      [
        Markup.button.callback('🎁 Free Trial', 'free_trial'),
        Markup.button.callback('🔙 Kembali', 'menu')
      ]
    ])
  });
});

// Order premium
bot.action('order_premium', async (ctx) => {
  await ctx.reply(`
📱 *Order Premium OREA-Bot*

📞 *Contact Owner:*
• WhatsApp: ${config.bot.ownerNumber}
• Telegram: @${config.bot.author}

📝 *Format Order:*
Nama: [Nama Anda]
Username: @username
Paket: [1 Minggu/1 Bulan/3 Bulan/1 Tahun/Lifetime]
Bukti: [Screenshot transfer]

🏦 *Rekening BCA:*
${config.bot.bcaAccount}
a/n OREA_85

⚡ *Proses Aktivasi:*
1. Transfer sesuai paket
2. Kirim bukti transfer
3. Aktivasi maksimal 5 menit
4. Enjoy premium features!

💎 *Keuntungan Premium:*
• Unlimited semua fitur
• No ads & no limits
• Priority support 24/7
• Access ke 1000+ commands
  `, {
    parse_mode: 'Markdown',
    ...Markup.inlineKeyboard([
      [
        Markup.button.url('📞 WhatsApp Owner', `https://wa.me/${config.bot.ownerNumber.replace(/^0/', '+62')}`),
        Markup.button.url('👨‍💻 Telegram Owner', `https://t.me/${config.bot.author}`)
      ],
      [
        Markup.button.callback('🔙 Kembali', 'premium')
      ]
    ])
  });
});

// AI Chat handler
bot.command('ai', async (ctx) => {
  await aiHandler.handleAI(ctx);
});

// GPT-4 handler
bot.command('gpt4', async (ctx) => {
  await aiHandler.handleGPT4(ctx);
});

// Download handlers
bot.command('yt', async (ctx) => {
  await downloadHandler.handleYouTube(ctx);
});

bot.command('tiktok', async (ctx) => {
  await downloadHandler.handleTikTok(ctx);
});

bot.command('ig', async (ctx) => {
  await downloadHandler.handleInstagram(ctx);
});

// Sticker handler
bot.command('sticker', async (ctx) => {
  await stickerHandler.handleSticker(ctx);
});

// Image editor handler
bot.command('editimage', async (ctx) => {
  await imageHandler.handleEditImage(ctx);
});

// Voice handler
bot.command('voice', async (ctx) => {
  await voiceHandler.handleVoice(ctx);
});

// Translate handler
bot.command('translate', async (ctx) => {
  await translateHandler.handleTranslate(ctx);
});

// Weather handler
bot.command('weather', async (ctx) => {
  await weatherHandler.handleWeather(ctx);
});

// Crypto handler
bot.command('crypto', async (ctx) => {
  await cryptoHandler.handleCrypto(ctx);
});

// News handler
bot.command('news', async (ctx) => {
  await newsHandler.handleNews(ctx);
});

// Game handler
bot.command('game', async (ctx) => {
  await gameHandler.handleGame(ctx);
});

// Admin handler
bot.command('admin', async (ctx) => {
  if (!ctx.state.isAdmin) {
    return ctx.reply('❌ Command ini hanya untuk admin!');
  }
  await adminHandler.handleAdmin(ctx);
});

// Payment handler
bot.command('payment', async (ctx) => {
  await paymentHandler.handlePayment(ctx);
});

// Handle text messages for AI chat
bot.on('text', async (ctx) => {
  // Skip if message starts with /
  if (ctx.message.text.startsWith('/')) return;

  // Handle AI chat for premium users
  if (ctx.state.isPremium) {
    await aiHandler.handleAIChat(ctx);
  } else {
    // Show message for free users
    await ctx.reply('💬 *Fitur AI Chat hanya untuk premium users!*

👑 *Upgrade ke Premium untuk:*
• Unlimited AI chat
• GPT-4 access
• Image generation
• Code helper
• Translation 50+ bahasa
• Dan masih banyak lagi!

💰 *Harga mulai dari Rp 10.000/minggu*

📞 *Order sekarang:*
WhatsApp: ${config.bot.ownerNumber}
Telegram: @${config.bot.author}`, {
      parse_mode: 'Markdown',
      ...Markup.inlineKeyboard([
        [
          Markup.button.callback('👑 Upgrade Premium', 'premium'),
          Markup.button.url('📞 WhatsApp Owner', `https://wa.me/${config.bot.ownerNumber.replace(/^0/, '+62')}`)
        ]
      ])
    });
  }
});

// Handle photo messages
bot.on('photo', async (ctx) => {
  await imageHandler.handlePhoto(ctx);
});

// Handle voice messages
bot.on('voice', async (ctx) => {
  await voiceHandler.handleVoiceMessage(ctx);
});

// Handle video messages
bot.on('video', async (ctx) => {
  await imageHandler.handleVideo(ctx);
});

// Handle document messages
bot.on('document', async (ctx) => {
  await imageHandler.handleDocument(ctx);
});

// Error handling
bot.catch((err, ctx) => {
  logger.error(`Error for ${ctx.updateType}:`, err);
  ctx.reply('❌ Terjadi kesalahan! Silakan coba lagi nanti.');
});

// Launch bot
bot.launch().then(() => {
  logger.info('🤖 OREA-Bot started successfully!');
  logger.info(`📱 Bot: @${config.bot.username}`);
  logger.info(`👑 Author: ${config.bot.author}`);
  logger.info(`📞 Owner: ${config.bot.ownerNumber}`);
  logger.info(`🏦 BCA: ${config.bot.bcaAccount}`);
});

// Graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

// Express server for API
app.get('/', (req, res) => {
  res.json({
    status: 'success',
    message: 'OREA-Bot API Server',
    version: config.bot.version,
    author: config.bot.author,
    timestamp: new Date().toISOString()
  });
});

app.get('/api/status', async (req, res) => {
  try {
    const stats = await database.getBotStats();
    res.json({
      status: 'success',
      data: {
        bot: {
          name: config.bot.name,
          username: config.bot.username,
          version: config.bot.version,
          uptime: process.uptime(),
          memory: process.memoryUsage()
        },
        stats: stats,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

// Start Express server
app.listen(config.server.port, () => {
  logger.info(`🌐 API Server running on port ${config.server.port}`);
});

module.exports = bot;