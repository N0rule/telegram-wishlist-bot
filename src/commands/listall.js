const { listWishes } = require('../services/db');
const { formatList } = require('../utils/formatList');
const { t } = require('../utils/lang');
const { createLogger } = require('../utils/logger');
const log = createLogger('listAllCommand');

const listAllCommand = (bot) => {
  bot.command('listall', async (ctx) => {
    const wishes = listWishes(null);
    //log.info(`User ${ctx.from.id} (@${ctx.from.username}) listed all wishes (${wishes.length} wishes)`);
    if (!wishes.length)
      return ctx.reply(t('list.emptyAll'));
    return ctx.reply(formatList(wishes, t('list.titleAll')), { parse_mode: 'Markdown' });
  });
};

module.exports = { listAllCommand };
