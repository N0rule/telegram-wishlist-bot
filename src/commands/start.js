const { t } = require('../utils/lang');
const { createLogger } = require('../utils/logger');
const log = createLogger('startCommand');

const startCommand = (bot) => {
  bot.command('start', (ctx) => {
    //log.info(`User ${ctx.from.id} (@${ctx.from.username}) started the bot`);
    ctx.reply(t('start.welcome'), { parse_mode: 'Markdown' });
  });
};
module.exports = { startCommand };
