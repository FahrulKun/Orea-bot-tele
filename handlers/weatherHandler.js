const weather = require('weather-js');
const config = require('../config');
const logger = require('../utils/logger');

class WeatherHandler {
  async handleWeather(ctx) {
    const city = ctx.message.text.replace('/weather', '').trim();
    
    if (!city) {
      return ctx.reply('🌤️ *Weather Info*

🌍 *Cek cuaca di berbagai kota*
Format: /weather <nama_kota>

📋 *Supported:*
• Cities worldwide
• Current weather
• 5-day forecast (premium)
• Weather alerts (premium)

💎 *Premium users get detailed forecasts!*', {
        parse_mode: 'Markdown'
      });
    }

    try {
      await ctx.replyWithChatAction('typing');
      
      weather.find({ search: city, degreeType: 'C' }, async (err, result) => {
        if (err) {
          logger.error('Weather API Error:', err);
          return ctx.reply('❌ Maaf, gagal mendapatkan info cuaca.');
        }

        if (!result || result.length === 0) {
          return ctx.reply('❌ Kota tidak ditemukan!');
        }

        const weather = result[0];
        const current = weather.current;
        
        await ctx.reply(`🌤️ *Weather in ${weather.location.name}*

🌡️ *Temperature:* ${current.temperature}°C
🤔 *Feels like:* ${current.feelslike}°C
💧 *Humidity:* ${current.humidity}%
💨 *Wind:* ${current.winddisplay}
🌅 *Sunrise:* ${weather.current.observationtime}
🌇 *Sunset:* ${weather.current.observationtime}

📝 *Sky:* ${current.skytext}

---
🤖 *Weather by OREA-Bot*
👨‍💻 *Author: ${config.bot.author}*`, {
          parse_mode: 'Markdown'
        });
      });

    } catch (error) {
      logger.error('Weather Handler Error:', error);
      ctx.reply('❌ Maaf, terjadi kesalahan saat mendapatkan info cuaca.');
    }
  }
}

module.exports = new WeatherHandler();