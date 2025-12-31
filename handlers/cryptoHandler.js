const axios = require('axios');
const config = require('../config');
const logger = require('../utils/logger');

class CryptoHandler {
  async handleCrypto(ctx) {
    const crypto = ctx.message.text.replace('/crypto', '').trim();
    
    if (!crypto) {
      return ctx.reply('💰 *Crypto Prices*

📈 *Cek harga cryptocurrency*
Format: /crypto <kode_crypto>

📋 *Popular Crypto:*
• BTC - Bitcoin
• ETH - Ethereum
• BNB - Binance Coin
• ADA - Cardano
• SOL - Solana
• DOGE - Dogecoin
• SHIB - Shiba Inu

💎 *Premium users get portfolio tracking!*', {
        parse_mode: 'Markdown'
      });
    }

    try {
      await ctx.replyWithChatAction('typing');
      
      // Get crypto price (simplified - would use actual crypto API)
      const cryptoInfo = await this.getCryptoInfo(crypto.toUpperCase());
      
      if (!cryptoInfo) {
        return ctx.reply('❌ Cryptocurrency tidak ditemukan!');
      }

      await ctx.reply(`💰 *${cryptoInfo.name} (${cryptoInfo.symbol})*

💵 *Price:* $${cryptoInfo.price}
📈 *24h Change:* ${cryptoInfo.change24h}%
📊 *Market Cap:* $${cryptoInfo.marketCap}
💧 *Volume 24h:* $${cryptoInfo.volume24h}
🔄 *Circulating Supply:* ${cryptoInfo.supply}

📈 *All Time High:* $${cryptoInfo.ath}
📉 *All Time Low:* $${cryptoInfo.atl}

---
🤖 *Crypto data by OREA-Bot*
👨‍💻 *Author: ${config.bot.author}*`, {
        parse_mode: 'Markdown'
      });

    } catch (error) {
      logger.error('Crypto Handler Error:', error);
      ctx.reply('❌ Maaf, gagal mendapatkan info crypto. Silakan coba lagi.');
    }
  }

  async getCryptoInfo(symbol) {
    // This would use actual crypto API like CoinGecko or CoinMarketCap
    // For now, return dummy data
    const cryptoData = {
      'BTC': {
        name: 'Bitcoin',
        symbol: 'BTC',
        price: '45,234.56',
        change24h: '+2.34',
        marketCap: '882.3B',
        volume24h: '28.5B',
        supply: '19.5M',
        ath: '69,044.77',
        atl: '67.81'
      },
      'ETH': {
        name: 'Ethereum',
        symbol: 'ETH',
        price: '3,456.78',
        change24h: '+1.23',
        marketCap: '415.2B',
        volume24h: '15.2B',
        supply: '120.2M',
        ath: '4,891.70',
        atl: '0.43'
      }
    };

    return cryptoData[symbol] || null;
  }
}

module.exports = new CryptoHandler();