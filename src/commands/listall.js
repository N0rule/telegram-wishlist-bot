const { listWishes } = require('../services/db');
const { formatList } = require('../utils/formatList');

const listAllCommand = (bot) => {
  bot.command('listall', async (ctx) => {
    const wishes = listWishes(null);
    if (!wishes.length)
      return ctx.reply('📭 No wishes yet!');
    return ctx.reply(formatList(wishes, 'All Wishes'), { parse_mode: 'Markdown' });
  });
};

module.exports = { listAllCommand };
