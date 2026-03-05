const { removeWish, getWishById } = require('../services/db');

const removeCommand = (bot) => {
  bot.command('remove', async (ctx) => {
    const id = Number(ctx.message.text.split(' ')[1]);

    if (!id) return ctx.reply('Usage: /remove <wish\\_id>', { parse_mode: 'Markdown' });

    const wish = getWishById(id);
    if (!wish)        return ctx.reply(`❌ No wish found with ID \`${id}\`.`, { parse_mode: 'Markdown' });
    if (wish.userId !== ctx.from.id)
      return ctx.reply('⛔ You can only remove your own wishes.');

    removeWish(id, ctx.from.id);
    return ctx.reply(`✅ Wish *"${wish.name}"* removed.`, { parse_mode: 'Markdown' });
  });
};
module.exports = { removeCommand };
