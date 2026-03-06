const { removeWish, getWishById } = require('../services/db');
const { deleteWishPost }          = require('../services/channelPoster');
const { t } = require('../utils/lang');
const { createLogger } = require('../utils/logger');
const log = createLogger('removeWishCommand');

const removeWishCommand = (bot) => {
  bot.command('removewish', async (ctx) => {
    const id = Number(ctx.message.text.split(' ')[1]);

    if (!id) {
      //log.warn(`User ${ctx.from.id} (@${ctx.from.username}) provided invalid ID for remove`);
      return ctx.reply(t('removeWish.usage'), { parse_mode: 'Markdown' });
    }
    const wish = getWishById(id);
    if (!wish) {
      //log.warn(`User ${ctx.from.id} (@${ctx.from.username}) tried to remove non-existent wish ID ${id}`);
      return ctx.reply(t('removeWish.notFound', { id }), { parse_mode: 'Markdown' });
    }
    if (wish.userId !== ctx.from.id) {
      //log.warn(`User ${ctx.from.id} (@${ctx.from.username}) tried to remove wish ID ${id} owned by ${wish.userId}`);
      return ctx.reply(t('removeWish.notOwner'));
    }

    await deleteWishPost(ctx.telegram, wish.id);
    removeWish(id, ctx.from.id);
    log.ok(`User ${ctx.from.id} (@${ctx.from.username}) removed wish "${wish.name}" (ID ${id})`);
    return ctx.reply(t('removeWish.success', { name: wish.name }), { parse_mode: 'Markdown' });
  });
};
module.exports = { removeWishCommand };
