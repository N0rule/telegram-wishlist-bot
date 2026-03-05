const { listWishes } = require('../services/db');
const { formatList } = require('../utils/formatList');

const listCommand = (bot) => {
  // /list          → your own wishes
  // /list @username → that user's wishes
  bot.command('list', async (ctx) => {
    const args     = ctx.message.text.split(' ');
    const mention  = args[1]?.startsWith('@') ? args[1].slice(1).toLowerCase() : null;

    let wishes = listWishes(null); // get all, filter below

    if (mention) {
      wishes = wishes.filter(w => w.username?.toLowerCase() === mention);
      if (!wishes.length)
        return ctx.reply(`📭 No wishes found for @${mention}.`);
      return ctx.reply(formatList(wishes, `Wishes by @${mention}`), { parse_mode: 'Markdown' });
    }

    wishes = wishes.filter(w => w.userId === ctx.from.id);
    if (!wishes.length)
      return ctx.reply('📭 You have no wishes yet. Try /newwish!');
    return ctx.reply(formatList(wishes, 'My Wishes'), { parse_mode: 'Markdown' });
  });
};

module.exports = { listCommand };
