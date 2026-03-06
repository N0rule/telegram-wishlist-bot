const { t } = require('../utils/lang');

const startCommand = (bot) => {
  bot.command('start', (ctx) =>
    ctx.reply(t('start.welcome'), { parse_mode: 'Markdown' })
  );
};
module.exports = { startCommand };
