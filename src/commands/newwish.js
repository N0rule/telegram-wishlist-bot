const { createLogger } = require('../utils/logger');
const log = createLogger('newWishCommand');

const newWishCommand = (bot) => {
  bot.command('newwish', (ctx) => {
    //log.info(`User ${ctx.from.id} (@${ctx.from.username}) initiated new wish creation`);
    ctx.scene.enter('NEW_WISH');
  });
};
module.exports = { newWishCommand };
