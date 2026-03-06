const startCommand = (bot) => {
  bot.command('start', (ctx) =>
    ctx.reply(
      '👋 *Wishlist Bot*\n\n' +
      '/newwish — Add a new wish 🎁\n' +
      '/list — View your wishes 📋\n' +
      '/list @username — View someone\'s wishes 👤\n' +
      '/listall — View everyone\'s wishes 🌍\n' +
      '/remove <id> — Remove a wish ❌',
      { parse_mode: 'Markdown' }
    )
  );
};

module.exports = { startCommand };
