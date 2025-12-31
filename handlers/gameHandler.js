const config = require('../config');
const logger = require('../utils/logger');
const helper = require('../utils/helper');
const { Markup } = require('telegraf');

class GameHandler {
  async handleGame(ctx) {
    const game = ctx.message.text.replace('/game', '').trim();
    
    if (!game) {
      return ctx.reply('🎮 *Games Center*

🎯 *Pilih game yang ingin dimainkan:*
• math - Math quiz
• word - Word puzzle
• guess - Guess the number
• trivia - Trivia quiz
• memory - Memory game
• riddle - Riddle challenge

💎 *Premium users get exclusive games!*', {
        parse_mode: 'Markdown',
        ...Markup.inlineKeyboard([
          [
            Markup.button.callback('🧮 Math Quiz', 'game_math'),
            Markup.button.callback('📝 Word Puzzle', 'game_word')
          ],
          [
            Markup.button.callback('🔢 Guess Number', 'game_guess'),
            Markup.button.callback('🧠 Trivia', 'game_trivia')
          ],
          [
            Markup.button.callback('🧩 Memory', 'game_memory'),
            Markup.button.callback('🤔 Riddle', 'game_riddle')
          ]
        ])
      });
    }

    switch (game.toLowerCase()) {
      case 'math':
        await this.startMathGame(ctx);
        break;
      case 'word':
        await this.startWordGame(ctx);
        break;
      case 'guess':
        await this.startGuessGame(ctx);
        break;
      default:
        ctx.reply('❌ Game tidak ditemukan!');
    }
  }

  async startMathGame(ctx) {
    const num1 = Math.floor(Math.random() * 20) + 1;
    const num2 = Math.floor(Math.random() * 20) + 1;
    const operations = ['+', '-', '*'];
    const operation = operations[Math.floor(Math.random() * operations.length)];
    
    let answer;
    switch (operation) {
      case '+':
        answer = num1 + num2;
        break;
      case '-':
        answer = num1 - num2;
        break;
      case '*':
        answer = num1 * num2;
        break;
    }

    ctx.session.mathGame = {
      question: `${num1} ${operation} ${num2}`,
      answer: answer,
      attempts: 0,
      maxAttempts: 3
    };

    await ctx.reply(`🧮 *Math Quiz*

📝 *Berapa hasil dari:*
${num1} ${operation} ${num2} = ?

💡 *Ketik jawaban Anda!*
🎯 *Kesempatan: 3x*

⏱️ *Timeout: 30 detik*`);

    // Set timeout
    setTimeout(async () => {
      if (ctx.session.mathGame) {
        await ctx.reply(`⏰ *Waktu habis!*

💡 *Jawaban yang benar:* ${ctx.session.mathGame.answer}
🔄 *Main lagi? /game math*`);
        delete ctx.session.mathGame;
      }
    }, 30000);
  }

  async startWordGame(ctx) {
    const words = ['JAKARTA', 'SURABAYA', 'BANDUNG', 'MEDAN', 'SEMARANG', 'MAKASSAR', 'PALEMBANG', 'TANGERANG'];
    const word = words[Math.floor(Math.random() * words.length)];
    const scrambled = word.split('').sort(() => Math.random() - 0.5).join('');

    ctx.session.wordGame = {
      scrambled: scrambled,
      answer: word,
      attempts: 0,
      maxAttempts: 3
    };

    await ctx.reply(`📝 *Word Puzzle*

🔤 *Susun huruf-huruf ini menjadi kata yang benar:*
${scrambled}

💡 *Ketik jawaban Anda!*
🎯 *Kesempatan: 3x*
📍 *Clue: Nama kota di Indonesia*

⏱️ *Timeout: 30 detik*`);

    setTimeout(async () => {
      if (ctx.session.wordGame) {
        await ctx.reply(`⏰ *Waktu habis!*

💡 *Jawaban yang benar:* ${ctx.session.wordGame.answer}
🔄 *Main lagi? /game word*`);
        delete ctx.session.wordGame;
      }
    }, 30000);
  }

  async startGuessGame(ctx) {
    const number = Math.floor(Math.random() * 100) + 1;
    
    ctx.session.guessGame = {
      number: number,
      attempts: 0,
      maxAttempts: 7
    };

    await ctx.reply(`🔢 *Guess the Number*

🎯 *Tebak angka antara 1-100!*
💡 *Ketik angka tebakan Anda!*
🎲 *Kesempatan: 7x*

⏱️ *Timeout: 60 detik*`);

    setTimeout(async () => {
      if (ctx.session.guessGame) {
        await ctx.reply(`⏰ *Waktu habis!*

💡 *Jawaban yang benar:* ${ctx.session.guessGame.number}
🔄 *Main lagi? /game guess*`);
        delete ctx.session.guessGame;
      }
    }, 60000);
  }

  async handleGameAnswer(ctx) {
    const answer = ctx.message.text.trim();

    // Check math game
    if (ctx.session.mathGame) {
      const game = ctx.session.mathGame;
      game.attempts++;

      if (parseInt(answer) === game.answer) {
        await ctx.reply(`🎉 *Benar!*

🏆 *Selamat, jawaban Anda benar!*
📊 *Percobaan:* ${game.attempts}x
💎 *Points:* +${10 * (game.maxAttempts - game.attempts + 1)}`);

        delete ctx.session.mathGame;
      } else {
        if (game.attempts >= game.maxAttempts) {
          await ctx.reply(`❌ *Salah!*

💡 *Jawaban yang benar:* ${game.answer}
📊 *Percobaan habis!*
🔄 *Main lagi? /game math*`);
          delete ctx.session.mathGame;
        } else {
          await ctx.reply(`❌ *Salah!*

💡 *Coba lagi!*
📊 *Sisa percobaan:* ${game.maxAttempts - game.attempts}x`);
        }
      }
      return;
    }

    // Check word game
    if (ctx.session.wordGame) {
      const game = ctx.session.wordGame;
      game.attempts++;

      if (answer.toUpperCase() === game.answer) {
        await ctx.reply(`🎉 *Benar!*

🏆 *Selamat, kata yang benar adalah ${game.answer}!*
📊 *Percobaan:* ${game.attempts}x
💎 *Points:* +${15 * (game.maxAttempts - game.attempts + 1)}`);

        delete ctx.session.wordGame;
      } else {
        if (game.attempts >= game.maxAttempts) {
          await ctx.reply(`❌ *Salah!*

💡 *Jawaban yang benar:* ${game.answer}
📊 *Percobaan habis!*
🔄 *Main lagi? /game word*`);
          delete ctx.session.wordGame;
        } else {
          await ctx.reply(`❌ *Salah!*

💡 *Coba lagi!*
📊 *Sisa percobaan:* ${game.maxAttempts - game.attempts}x`);
        }
      }
      return;
    }

    // Check guess game
    if (ctx.session.guessGame) {
      const game = ctx.session.guessGame;
      const guess = parseInt(answer);
      game.attempts++;

      if (guess === game.number) {
        await ctx.reply(`🎉 *Benar!*

🏆 *Selamat, tebakan Anda benar!*
📊 *Angka:* ${game.number}
📊 *Percobaan:* ${game.attempts}x
💎 *Points:* +${20 * (game.maxAttempts - game.attempts + 1)}`);

        delete ctx.session.guessGame;
      } else {
        if (game.attempts >= game.maxAttempts) {
          await ctx.reply(`❌ *Game Over!*

💡 *Jawaban yang benar:* ${game.number}
📊 *Percobaan habis!*
🔄 *Main lagi? /game guess*`);
          delete ctx.session.guessGame;
        } else {
          const hint = guess < game.number ? '📈 Lebih besar!' : '📉 Lebih kecil!';
          await ctx.reply(`❌ *Salah!*

${hint}
💡 *Coba lagi!*
📊 *Sisa percobaan:* ${game.maxAttempts - game.attempts}x`);
        }
      }
    }
  }
}

module.exports = new GameHandler();