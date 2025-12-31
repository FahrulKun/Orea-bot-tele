const axios = require('axios');
const moment = require('moment');
const config = require('../config');

class Helper {
  // URL validation methods
  isValidYouTubeUrl(url) {
    const patterns = [
      /^https?:\/\/(www\.)?youtube\.com\/watch\?v=[\w-]+/,
      /^https?:\/\/youtu\.be\/[\w-]+/,
      /^https?:\/\/(www\.)?youtube\.com\/embed\/[\w-]+/
    ];
    return patterns.some(pattern => pattern.test(url));
  }

  isValidTikTokUrl(url) {
    const patterns = [
      /^https?:\/\/(www\.)?tiktok\.com\/@[\w.-]+\/video\/[\d]+/,
      /^https?:\/\/vm\.tiktok\.com\/[\w-]+/,
      /^https?:\/\/vt\.tiktok\.com\/[\w-]+/
    ];
    return patterns.some(pattern => pattern.test(url));
  }

  isValidInstagramUrl(url) {
    const patterns = [
      /^https?:\/\/(www\.)?instagram\.com\/p\/[\w-]+/,
      /^https?:\/\/(www\.)?instagram\.com\/reel\/[\w-]+/,
      /^https?:\/\/(www\.)?instagram\.com\/tv\/[\w-]+/
    ];
    return patterns.some(pattern => pattern.test(url));
  }

  isValidFacebookUrl(url) {
    const patterns = [
      /^https?:\/\/(www\.)?facebook\.com\/[\w.-]+\/videos\/[\d]+/,
      /^https?:\/\/fb\.watch\/[\w-]+/,
      /^https?:\/\/(www\.)?facebook\.com\/watch\/\?v=[\w-]+/
    ];
    return patterns.some(pattern => pattern.test(url));
  }

  // Format duration
  formatDuration(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    } else {
      return `${minutes}:${secs.toString().padStart(2, '0')}`;
    }
  }

  // Format number
  formatNumber(num) {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  }

  // Format file size
  formatFileSize(bytes) {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  }

  // Format date
  formatDate(date, format = 'DD MMMM YYYY') {
    return moment(date).format(format);
  }

  // Get premium buttons
  getPremiumButtons() {
    const { Telegraf } = require('telegraf');
    const { Markup } = require('telegraf');
    
    return Markup.inlineKeyboard([
      [
        Markup.button.callback('👑 Upgrade Premium', 'premium'),
        Markup.button.url('📞 WhatsApp Owner', `https://wa.me/${config.bot.ownerNumber.replace(/^0/, '+62')}`)
      ]
    ]);
  }

  // Get main menu keyboard
  getMainMenuKeyboard() {
    const { Markup } = require('telegraf');
    
    return Markup.inlineKeyboard([
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
      ]
    ]);
  }

  // Get admin keyboard
  getAdminKeyboard() {
    const { Markup } = require('telegraf');
    
    return Markup.inlineKeyboard([
      [
        Markup.button.callback('📊 Statistics', 'admin_stats'),
        Markup.button.callback('📢 Broadcast', 'admin_broadcast')
      ],
      [
        Markup.button.callback('👥 Users', 'admin_users'),
        Markup.button.callback('💳 Payments', 'admin_payments')
      ],
      [
        Markup.button.callback('🔧 Settings', 'admin_settings'),
        Markup.button.callback('🔄 Restart', 'admin_restart')
      ]
    ]);
  }

  // Create progress bar
  createProgressBar(current, total, length = 20) {
    const progress = Math.round((current / total) * length);
    const empty = length - progress;
    return '█'.repeat(progress) + '░'.repeat(empty);
  }

  // Sleep function
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Retry function
  async retry(fn, retries = 3, delay = 1000) {
    try {
      return await fn();
    } catch (error) {
      if (retries <= 0) throw error;
      await this.sleep(delay);
      return this.retry(fn, retries - 1, delay * 2);
    }
  }

  // Download file
  async downloadFile(url, filePath) {
    const response = await axios({
      method: 'GET',
      url: url,
      responseType: 'stream'
    });

    const writer = require('fs').createWriteStream(filePath);
    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
      writer.on('finish', resolve);
      writer.on('error', reject);
    });
  }

  // Get file extension
  getFileExtension(filename) {
    return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2);
  }

  // Generate random ID
  generateId(length = 8) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  // Validate email
  isValidEmail(email) {
    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return pattern.test(email);
  }

  // Validate phone number
  isValidPhone(phone) {
    const pattern = /^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}$/;
    return pattern.test(phone);
  }

  // Escape markdown
  escapeMarkdown(text) {
    return text.replace(/[_*[\]()~`>#+\-=|{}.!]/g, '\\$&');
  }

  // Truncate text
  truncateText(text, maxLength = 100) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + '...';
  }

  // Capitalize first letter
  capitalize(text) {
    return text.charAt(0).toUpperCase() + text.slice(1);
  }

  // Generate random color
  randomColor() {
    const colors = ['#FF6B35', '#004E89', '#A23B72', '#F18F01', '#C73E1D'];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  // Check if user is blocked
  isUserBlocked(userId) {
    // This would check against database in production
    return false;
  }

  // Get language flag
  getLanguageFlag(language) {
    const flags = {
      'id': '🇮🇩',
      'en': '🇺🇸',
      'ja': '🇯🇵',
      'ko': '🇰🇷',
      'zh': '🇨🇳',
      'es': '🇪🇸',
      'fr': '🇫🇷',
      'de': '🇩🇪',
      'ru': '🇷🇺',
      'ar': '🇸🇦'
    };
    return flags[language] || '🌐';
  }

  // Get platform icon
  getPlatformIcon(platform) {
    const icons = {
      'youtube': '📺',
      'tiktok': '🎵',
      'instagram': '📷',
      'facebook': '📘',
      'twitter': '🐦',
      'soundcloud': '🎶',
      'spotify': '🎧'
    };
    return icons[platform] || '📱';
  }

  // Create loading message
  createLoadingMessage(text = 'Loading...') {
    return `⏳ ${text}`;
  }

  // Create success message
  createSuccessMessage(text) {
    return `✅ ${text}`;
  }

  // Create error message
  createErrorMessage(text) {
    return `❌ ${text}`;
  }

  // Create warning message
  createWarningMessage(text) {
    return `⚠️ ${text}`;
  }

  // Create info message
  createInfoMessage(text) {
    return `ℹ️ ${text}`;
  }
}

module.exports = new Helper();