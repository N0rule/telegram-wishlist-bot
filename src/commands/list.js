const { listWishes } = require('../services/db');

const listCommand = (bot) => {
  bot.command('list', async (ctx) => {
    const showAll = ctx.message.text.includes('all');
    const wishes  = listWishes(showAll ? null : ctx.from.id);

    if (!wishes.length)
      return ctx.reply(showAll ? '📭 No wishes yet!' : '📭 You have no wishes. Try /newwish!');

    const lines = wishes.map((w, i) =>
      [
        `${i + 1}. *${w.name}* — @${w.username || w.userId}`,
        w.description ? `   _${w.description}_` : null,
        `   🆔 \`${w.id}\``,
      ].filter(Boolean).join('\n')
    );

    return ctx.reply(`🎁 *Wishlist${showAll ? ' (everyone)' : ''}:*\n\n${lines.join('\n\n')}`, {
      parse_mode: 'Markdown',
    });
  });
};
module.exports = { listCommand };
