const config = require('../config');
const logger = require('../utils/logger');
const helper = require('../utils/helper');
const security = require('../utils/security');

class PaymentHandler {
  async handlePayment(ctx) {
    await ctx.reply(`💳 *Payment Center*

💰 *Harga Premium OREA-Bot:*

📅 *1 Minggu - Rp 10.000*
✅ Unlimited downloads
✅ No rate limits
✅ Priority support

📅 *1 Bulan - Rp 25.000*
✅ Semua fitur 1 minggu
✅ Custom commands
✅ Early access features

📅 *3 Bulan - Rp 60.000* (Save 20%)
✅ Semua fitur 1 bulan
✅ API access
✅ 24/7 priority support

📅 *1 Tahun - Rp 200.000* (Save 33%)
✅ Semua fitur premium
✅ Lifetime support
✅ Custom features

🌟 *Lifetime - Rp 500.000*
✅ Akses selamanya
✅ All future features
✅ VVIP support

💳 *Metode Pembayaran:*
🏦 *BCA Transfer:* ${config.bot.bcaAccount}
📱 *E-Wallet:* Dana/Gopay/OVO
💳 *Kartu Kredit:* Visa/Mastercard
🪙 *Crypto:* Bitcoin/USDT

📞 *Order Sekarang:*
📱 *WhatsApp:* ${config.bot.ownerNumber}
👨‍💻 *Telegram:* @${config.bot.author}

---
💳 *Payment by OREA-Bot*
👨‍💻 *Author: ${config.bot.author}*`, {
      parse_mode: 'Markdown',
      ...Markup.inlineKeyboard([
        [
          Markup.button.callback('📱 Order via WhatsApp', 'order_whatsapp'),
          Markup.button.callback('💳 Cara Pembayaran', 'payment_guide')
        ],
        [
          Markup.button.callback('🎁 Free Trial', 'free_trial'),
          Markup.button.callback('❓ FAQ', 'payment_faq')
        ]
      ])
    });
  }

  async handleOrderWhatsApp(ctx) {
    await ctx.reply(`📱 *Order via WhatsApp*

📞 *Hubungi Owner WhatsApp:*
${config.bot.ownerNumber}

📝 *Format Order:*
Nama: [Nama Lengkap]
Username: @username_telegram
Paket: [1 Minggu/1 Bulan/3 Bulan/1 Tahun/Lifetime]
Bukti: [Screenshot transfer]

🏦 *Rekening Tujuan:*
📌 *BCA:* ${config.bot.bcaAccount}
📌 *a/n:* OREA_85

⚡ *Proses Aktivasi:*
1. ✅ Transfer sesuai paket
2. ✅ Kirim bukti transfer
3. ✅ Konfirmasi username
4. ✅ Aktivasi (maks 5 menit)
5. ✅ Enjoy premium!

💎 *Keuntungan Premium:*
• 🚀 Unlimited semua fitur
• ⚡ No rate limits
• 🎯 Priority queue
• 🎨 Exclusive features
• 🛡️ 24/7 support
• 🔓 Early access updates

📞 *Fast Response:*
• ⏰ Jam 08:00 - 22:00 WIB
• ⚡ Respon maksimal 5 menit
• 🎯 100% aman terpercaya

---
📱 *Order via WhatsApp*
👨‍💻 *Author: ${config.bot.author}*`, {
      parse_mode: 'Markdown',
      ...Markup.inlineKeyboard([
        [
          Markup.button.url('📞 WhatsApp Owner', `https://wa.me/${config.bot.ownerNumber.replace(/^0/, '+62')}`),
          Markup.button.url('👨‍💻 Telegram Owner', `https://t.me/${config.bot.author}`)
        ]
      ])
    });
  }

  async handlePaymentGuide(ctx) {
    await ctx.reply(`💳 *Cara Pembayaran*

🏦 *Transfer Bank:*
1. Buka mobile banking/atm
2. Transfer ke BCA ${config.bot.bcaAccount}
3. a/n OREA_85
4. Jumlah sesuai paket
5. Simpan bukti transfer

📱 *E-Wallet:*
1. Buka app Dana/Gopay/OVO
2. Scan QR code dari owner
3. Masukkan jumlah sesuai paket
4. Konfirmasi pembayaran
5. Screenshot bukti

💳 *Kartu Kredit:*
1. Hubungi owner langsung
2. Berikan data kartu (aman)
3. Proses pembayaran
4. Dapatkan struk pembayaran

🪙 *Crypto:*
1. Hubungi owner untuk wallet address
2. Transfer crypto sesuai nilai
3. Tunggu konfirmasi blockchain
4. Aktivasi manual

📞 *Konfirmasi Pembayaran:*
📱 *WhatsApp:* ${config.bot.ownerNumber}
📝 *Kirim:*
• Nama lengkap
• Username telegram
• Paket yang dibeli
• Bukti transfer
• Tanggal transfer

⚡ *Jam Operasional:*
• 📅 Senin - Sabtu: 08:00 - 22:00 WIB
• 📅 Minggu: 10:00 - 20:00 WIB
• ⚡ Respon maksimal 5 menit

---
💳 *Payment Guide OREA-Bot*
👨‍💻 *Author: ${config.bot.author}*`, {
      parse_mode: 'Markdown'
    });
  }

  async handleFreeTrial(ctx) {
    if (ctx.session.trialUsed) {
      return ctx.reply('❌ *Free Trial sudah pernah digunakan!*

💰 *Dapatkan premium mulai dari Rp 10.000/minggu*

📞 *Order sekarang:*
WhatsApp: ${config.bot.ownerNumber}',
        helper.getPremiumButtons()
      );
    }

    // Check if user is already premium
    if (ctx.state.isPremium) {
      return ctx.reply('✅ *Anda sudah premium!*

🎉 *Nikmati semua fitur premium tanpa batas!*

---
👑 *Premium User*
🤖 *OREA-Bot*`);
    }

    // Start free trial (1 hour)
    ctx.session.trialUsed = true;
    ctx.session.trialEnds = Date.now() + (60 * 60 * 1000); // 1 hour

    await ctx.reply(`🎁 *Free Trial Activated!*

⏰ *Durasi:* 1 jam
🎯 *Fitur yang bisa dicoba:*
• ✅ AI Chat unlimited
• ✅ Download 5 video
• ✅ Sticker maker
• ✅ Image editor
• ✅ Voice effects
• ✅ All games

💡 *Coba sekarang:*
• /ai <pesan> - Chat AI
• /yt <url> - Download YouTube
• /sticker - Buat sticker
• /game - Main game

⏰ *Trial berakhir dalam:* 1 jam
💰 *Upgrade premium untuk akses selamanya!*

---
🎁 *Free Trial by OREA-Bot*
👨‍💻 *Author: ${config.bot.author}*`, {
      parse_mode: 'Markdown'
    });

    // Set timeout to end trial
    setTimeout(async () => {
      if (ctx.session.trialEnds && Date.now() > ctx.session.trialEnds) {
        try {
          await ctx.telegram.sendMessage(ctx.from.id, `⏰ *Free Trial Berakhir!*

💰 *Upgrade premium untuk melanjutkan:*
• Rp 10.000/minggu
• Rp 25.000/bulan
• Rp 60.000/3 bulan

📞 *Order sekarang:*
WhatsApp: ${config.bot.ownerNumber}

---
🎁 *Trial Ended*
🤖 *OREA-Bot*`, {
            parse_mode: 'Markdown'
          });
        } catch (error) {
          logger.error('Trial end notification error:', error);
        }
      }
    }, 60 * 60 * 1000); // 1 hour
  }

  async handlePaymentFAQ(ctx) {
    await ctx.reply(`❓ *Payment FAQ*

❓ *Apakah pembayaran aman?*
✅ Ya, 100% aman dan terpercaya

❓ *Bagaimana cara aktivasi?*
✅ Transfer → Kirim bukti → Aktivasi 5 menit

❓ *Apakah ada garansi?*
✅ Ya, garansi uang kembali 7 hari

❓ *Bisa request fitur?*
✅ Ya, premium users bisa request fitur

❓ *Apakah data saya aman?*
✅ Ya, privacy 100% terjamin

❓ *Bagaimana jika ada masalah?*
✅ Hubungi owner, langsung dibantu

❓ *Bisa downgrade paket?*
✅ Ya, bisa kapan saja

❓ *Apakah ada diskon?*
✅ Ya, untuk pembelian 3 bulan+ ke atas

❓ *Bagaimana cara renewal?*
✅ Hubungi owner 1 hari sebelum expired

❓ *Apakah ada bonus?*
✅ Ya, bonus setiap pembelian 3 bulan+

---
❓ *FAQ by OREA-Bot*
👨‍💻 *Author: ${config.bot.author}*`, {
      parse_mode: 'Markdown'
    });
  }

  async generatePaymentReference(userId, package) {
    return security.generatePaymentReference();
  }

  async validatePayment(reference, amount) {
    // This would validate actual payment in production
    return {
      valid: true,
      userId: '123456789',
      package: '1_month',
      amount: 25000,
      timestamp: new Date()
    };
  }

  async activatePremium(userId, package) {
    try {
      // Calculate expiry date
      const now = new Date();
      let expiryDate;

      switch (package) {
        case '1_week':
          expiryDate = new Date(now.getTime() + (7 * 24 * 60 * 60 * 1000));
          break;
        case '1_month':
          expiryDate = new Date(now.getTime() + (30 * 24 * 60 * 60 * 1000));
          break;
        case '3_months':
          expiryDate = new Date(now.getTime() + (90 * 24 * 60 * 60 * 1000));
          break;
        case '1_year':
          expiryDate = new Date(now.getTime() + (365 * 24 * 60 * 60 * 1000));
          break;
        case 'lifetime':
          expiryDate = new Date('2099-12-31');
          break;
        default:
          throw new Error('Invalid package');
      }

      // Save to database
      await this.savePremiumSubscription(userId, package, expiryDate);

      return {
        success: true,
        expiryDate: expiryDate,
        package: package
      };

    } catch (error) {
      logger.error('Activate Premium Error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async savePremiumSubscription(userId, package, expiryDate) {
    // This would save to actual database
    logger.info(`Premium subscription saved for user ${userId}: ${package} until ${expiryDate}`);
  }
}

module.exports = new PaymentHandler();