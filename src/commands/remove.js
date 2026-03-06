const { removeWish, getWishById } = require('../services/db');
const { deleteWishPost }          = require('../services/channelPoster');
const { t } = require('../utils/lang');

const removeCommand = (bot) => {
  bot.command('remove', async (ctx) => {
    const id = Number(ctx.message.text.split(' ')[1]);

    if (!id)                        return ctx.reply(t('remove.usage'), { parse_mode: 'Markdown' });
    const wish = getWishById(id);
    if (!wish)                      return ctx.reply(t('remove.notFound', { id }), { parse_mode: 'Markdown' });
    if (wish.userId !== ctx.from.id) return ctx.reply(t('remove.notOwner'));

    await deleteWishPost(ctx.telegram, wish.id);
    removeWish(id, ctx.from.id);
    return ctx.reply(t('remove.success', { name: wish.name }), { parse_mode: 'Markdown' });
  });
};
module.exports = { removeCommand };
