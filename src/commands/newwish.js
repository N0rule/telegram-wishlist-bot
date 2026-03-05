const newWishCommand = (bot) => {
  bot.command('newwish', (ctx) => ctx.scene.enter('NEW_WISH'));
};
module.exports = { newWishCommand };
