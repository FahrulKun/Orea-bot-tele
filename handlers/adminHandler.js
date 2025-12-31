const config = require('../config');
const logger = require('../utils/logger');
const database = require('../utils/database');
const helper = require('../utils/helper');

class AdminHandler {
  async handleAdmin(ctx) {
    if (!ctx.state.isAdmin) {
      return ctx.reply('❌ Command ini hanya untuk admin!');
    }

    await ctx.reply(`👑 *Admin Panel*

📊 *Pilih menu admin:*

📈 *Statistics:* Lihat statistik bot
📢 *Broadcast:* Kirim pesan ke semua user
👥 *Users:* Kelola data user
💳 *Payments:* Lihat transaksi
🔧 *Settings:* Pengaturan bot
🔄 *Restart:* Restart bot

---
🤖 *OREA-Bot Admin Panel*
👨‍💻 *Author: ${config.bot.author}*`, {
      parse_mode: 'Markdown',
      ...helper.getAdminKeyboard()
    });
  }

  async handleStats(ctx) {
    if (!ctx.state.isAdmin) return;

    try {
      const stats = await database.getBotStats();
      
      await ctx.reply(`📊 *Bot Statistics*

👥 *Users:*
• Total: ${stats.users.total}
• Premium: ${stats.users.premium}
• Active (24h): ${stats.users.active}

📥 *Downloads:*
• Total: ${stats.downloads.total}
• Today: ${stats.downloads.today}

💬 *Chats:*
• Total: ${stats.chats.total}
• Today: ${stats.chats.today}

🤖 *Bot Info:*
• Uptime: ${Math.floor(process.uptime() / 3600)}h
• Memory: ${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB
• Version: ${config.bot.version}

---
📊 *Last updated: ${new Date().toLocaleString('id-ID')}*`, {
        parse_mode: 'Markdown'
      });

    } catch (error) {
      logger.error('Admin Stats Error:', error);
      ctx.reply('❌ Gagal mengambil statistik!');
    }
  }

  async handleBroadcast(ctx) {
    if (!ctx.state.isAdmin) return;

    if (!ctx.session.broadcastMode) {
      ctx.session.broadcastMode = true;
      return ctx.reply(`📢 *Broadcast Mode*

📝 *Ketik pesan yang ingin dikirim:*
💡 *Format:*
• Text biasa
• Markdown supported
• Max 4096 karakter

⏹️ *Ketik "cancel" untuk membatalkan*`);
    }

    const message = ctx.message.text;
    
    if (message.toLowerCase() === 'cancel') {
      delete ctx.session.broadcastMode;
      return ctx.reply('❌ *Broadcast dibatalkan*');
    }

    try {
      await ctx.reply('📢 *Mengirim broadcast...*');
      
      // Get all users (simplified)
      const users = await this.getAllUsers();
      let success = 0;
      let failed = 0;

      for (const user of users) {
        try {
          await ctx.telegram.sendMessage(user.telegramId, message);
          success++;
        } catch (error) {
          failed++;
          logger.error(`Broadcast failed for user ${user.telegramId}:`, error);
        }
      }

      delete ctx.session.broadcastMode;
      
      await ctx.reply(`✅ *Broadcast Selesai!*

📊 *Results:*
✅ Berhasil: ${success}
❌ Gagal: ${failed}
📱 Total: ${users.length}

---
📢 *Broadcast by ${ctx.from.first_name}*`);

    } catch (error) {
      logger.error('Broadcast Error:', error);
      ctx.reply('❌ Gagal mengirim broadcast!');
    }
  }

  async handleUsers(ctx) {
    if (!ctx.state.isAdmin) return;

    try {
      const users = await this.getAllUsers();
      const recentUsers = users.slice(-10).reverse();
      
      let userMessage = `👥 *Recent Users* (10 terbaru)\n\n`;
      
      recentUsers.forEach((user, index) => {
        userMessage += `${index + 1}. ${user.firstName} (@${user.username || 'no_username'})\n`;
        userMessage += `   📱 ID: ${user.telegramId}\n`;
        userMessage += `   👑 Premium: ${user.isPremium ? '✅' : '❌'}\n`;
        userMessage += `   📅 Join: ${helper.formatDate(user.createdAt)}\n\n`;
      });

      userMessage += `---
👥 *Total Users:* ${users.length}
👑 *Premium Users:* ${users.filter(u => u.isPremium).length}

📊 *Data by OREA-Bot Admin*`;

      await ctx.reply(userMessage, {
        parse_mode: 'Markdown'
      });

    } catch (error) {
      logger.error('Admin Users Error:', error);
      ctx.reply('❌ Gagal mengambil data user!');
    }
  }

  async handlePayments(ctx) {
    if (!ctx.state.isAdmin) return;

    await ctx.reply(`💳 *Payment Management*

📊 *Payment Statistics:*
• Today's Revenue: Rp 0
• This Month: Rp 0
• Total Revenue: Rp 0

🔄 *Recent Transactions:*
• No transactions yet

💡 *Features:*
• View transaction history
• Manage premium users
• Payment analytics
• Refund management

---
💳 *Payment Admin Panel*`);
  }

  async handleSettings(ctx) {
    if (!ctx.state.isAdmin) return;

    await ctx.reply(`⚙️ *Bot Settings*

🔧 *Current Settings:*
• Bot Name: ${config.bot.name}
• Version: ${config.bot.version}
• Environment: ${config.server.nodeEnv}
• Rate Limit: ${config.rateLimit.max}/min
• Max File Size: ${config.files.maxSize / 1024 / 1024}MB

🎛️ *Available Actions:*
• Toggle features
• Update rate limits
• Manage premium users
• API configuration

---
⚙️ *Settings Admin Panel*`);
  }

  async handleRestart(ctx) {
    if (!ctx.state.isAdmin) return;

    await ctx.reply(`🔄 *Restarting Bot...*

⏹️ *Bot akan restart dalam 5 detik*
📊 *Semua session akan disimpan*
🔄 *Bot akan online kembali segera*

---
🔄 *Restart by ${ctx.from.first_name}*`);

    // Graceful restart
    setTimeout(() => {
      process.exit(0);
    }, 5000);
  }

  // Helper methods
  async getAllUsers() {
    try {
      // This would query actual database
      return [
        {
          telegramId: '123456789',
          firstName: 'User',
          username: 'user123',
          isPremium: true,
          createdAt: new Date()
        }
      ];
    } catch (error) {
      logger.error('Get All Users Error:', error);
      return [];
    }
  }
}

module.exports = new AdminHandler();