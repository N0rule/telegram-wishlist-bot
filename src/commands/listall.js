const { listWishes } = require('../services/db');
const { formatList } = require('../utils/formatList');
const { t } = require('../utils/lang');

const listAllCommand = (bot) => {
  bot.command('listall', async (ctx) => {
    const wishes = listWishes(null);
    if (!wishes.length)
      return ctx.reply(t('list.emptyAll'));
    return ctx.reply(formatList(wishes, t('list.titleAll')), { parse_mode: 'Markdown' });
  });
};

module.exports = { listAllCommand };
