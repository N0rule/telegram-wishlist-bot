const { t }          = require('../utils/lang');
const { mainMenu }   = require('../utils/keyboard');

const startCommand = (bot) => {
  bot.command('start', (ctx) =>
    ctx.reply(t('start.welcome'), {
      parse_mode: 'Markdown',
      ...mainMenu(t),
    })
  );
};
module.exports = { startCommand };
