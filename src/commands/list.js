const { listWishes } = require('../services/db');
const { formatList } = require('../utils/formatList');
const { t } = require('../utils/lang');
const { createLogger } = require('../utils/logger');
const log = createLogger('listCommand');

const listCommand = (bot) => {
  // /list          → your own wishes
  // /list @username → that user's wishes
  bot.command('list', async (ctx) => {
    const args     = ctx.message.text.split(' ');
    const mention  = args[1]?.startsWith('@') ? args[1].slice(1).toLowerCase() : null;

    let wishes = listWishes(null); // get all, filter below

    if (mention) {
      wishes = wishes.filter(w => w.username?.toLowerCase() === mention);
      //log.info(`User ${ctx.from.id} (@${ctx.from.username}) listed wishes for @${mention} (${wishes.length} wishes)`);
      if (!wishes.length) return ctx.reply(t('list.emptyUser', { username: mention }));
      return ctx.reply(formatList(wishes, t('list.titleUser', { username: mention })), { parse_mode: 'Markdown' });
    }

    wishes = wishes.filter(w => w.userId === ctx.from.id);
    //log.info(`User ${ctx.from.id} (@${ctx.from.username}) listed their own wishes (${wishes.length} wishes)`);
    if (!wishes.length)
      return ctx.reply(t('list.empty'));
    return ctx.reply(formatList(wishes, t('list.titleMine')), { parse_mode: 'Markdown' });
  });
};

module.exports = { listCommand };
