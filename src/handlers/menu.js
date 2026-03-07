const { Markup }                                      = require('telegraf');
const { listWishes, getWishById, removeWish }         = require('../services/db');
const { deleteWishPost }                              = require('../services/channelPoster');
const { t }                                           = require('../utils/lang');
const { createLogger }                                = require('../utils/logger');
const { PAGE_SIZE, mainMenu, myWishesKeyboard,
        allWishesKeyboard, confirmKeyboard, backRow } = require('../utils/keyboard');

const log = createLogger('menuHandler');

const pageInfo = (page, total) =>
  `${t('menu.page')} ${page + 1}/${Math.max(1, Math.ceil(total / PAGE_SIZE))}`;

// My Wishes — each wish shows with number, name, optional description, id
const formatMyPage = (wishes, page) => {
  const slice = wishes.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const lines = slice.map((w, i) =>
    [
      `*${page * PAGE_SIZE + i + 1}. ${w.name}*`,
      w.description ? `· ${w.description}` : null,
      `🆔 \`${w.id}\``,
    ].filter(Boolean).join('\n')
  );
  return `📋 *${t('list.titleMine')}* — ${pageInfo(page, wishes.length)}\n${t('menu.removeTip')}\n\n${lines.join('\n\n')}`;
};

// All Wishes — includes @username after wish name, no buttons per wish
const formatAllPage = (wishes, page) => {
  const slice = wishes.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const lines = slice.map((w, i) =>
    [
      `*${page * PAGE_SIZE + i + 1}. ${w.name}* — @${w.username || w.userId}`,
      w.description ? `· ${w.description}` : null,
      `🆔 \`${w.id}\``,
    ].filter(Boolean).join('\n')
  );
  return `🌍 *${t('list.titleAll')}* — ${pageInfo(page, wishes.length)}\n\n${lines.join('\n\n')}`;
};

const registerMenuHandlers = (bot) => {

  // ── Main menu ────────────────────────────────────────────────────────────
  bot.action('MENU', async (ctx) => {
    await ctx.answerCbQuery();
    await ctx.editMessageText(t('start.welcome'), {
      parse_mode: 'Markdown',
      ...mainMenu(t),
    });
  });

  // ── New wish ─────────────────────────────────────────────────────────────
  bot.action('MENU_NEWWISH', async (ctx) => {
    await ctx.answerCbQuery();
    await ctx.deleteMessage();
    return ctx.scene.enter('NEW_WISH');
  });

  // ── My Wishes (tap wish → remove confirm) ────────────────────────────────
  bot.action(/^MY_LIST:(\d+)$/, async (ctx) => {
    await ctx.answerCbQuery();
    const page   = parseInt(ctx.match[1]);
    const wishes = listWishes(ctx.from.id);

    if (!wishes.length)
      return ctx.editMessageText(t('list.empty'), {
        ...Markup.inlineKeyboard([backRow(t)]),
      });

    await ctx.editMessageText(
      formatMyPage(wishes, page),
      { parse_mode: 'Markdown', ...myWishesKeyboard(wishes, page, t) }
    );
  });

  // ── All Wishes (no wish buttons, just text + pagination) ─────────────────
  bot.action(/^ALL_LIST:(\d+)$/, async (ctx) => {
    await ctx.answerCbQuery();
    const page   = parseInt(ctx.match[1]);
    const wishes = listWishes(null);

    if (!wishes.length)
      return ctx.editMessageText(t('list.emptyAll'), {
        ...Markup.inlineKeyboard([backRow(t)]),
      });

    await ctx.editMessageText(
      formatAllPage(wishes, page),
      { parse_mode: 'Markdown', ...allWishesKeyboard(wishes, page, t) }
    );
  });

  // ── Remove confirm dialog ────────────────────────────────────────────────
  bot.action(/^REMOVE_CONFIRM:(\d+)$/, async (ctx) => {
    await ctx.answerCbQuery();
    const wish = getWishById(parseInt(ctx.match[1]));

    if (!wish)
      return ctx.editMessageText(t('removeWish.notFound', { id: ctx.match[1] }), {
        parse_mode: 'Markdown',
        ...Markup.inlineKeyboard([backRow(t)]),
      });

    await ctx.editMessageText(
      t('menu.confirmRemove', { name: wish.name }),
      { parse_mode: 'Markdown', ...confirmKeyboard(wish.id, t) }
    );
  });

  // ── Remove execute ───────────────────────────────────────────────────────
  bot.action(/^REMOVE_DO:(\d+)$/, async (ctx) => {
    await ctx.answerCbQuery();
    const wishId = parseInt(ctx.match[1]);
    const wish   = getWishById(wishId);

    if (!wish)
      return ctx.editMessageText(t('removeWish.notFound', { id: wishId }), { parse_mode: 'Markdown' });
    if (wish.userId !== ctx.from.id)
      return ctx.editMessageText(t('removeWish.notOwner'));

    await deleteWishPost(ctx.telegram, wish.id);
    removeWish(wishId, ctx.from.id);
    log.ok(`User ${ctx.from.id} removed wish "${wish.name}" (ID ${wishId})`);

    // Go back to my wishes list after deletion
    const remaining = listWishes(ctx.from.id);
    if (!remaining.length)
      return ctx.editMessageText(
        t('removeWish.success', { name: wish.name }) + '\n\n' + t('list.empty'),
        { parse_mode: 'Markdown', ...mainMenu(t) }
      );

    return ctx.editMessageText(
      t('removeWish.success', { name: wish.name }) + '\n\n' + formatMyPage(remaining, 0),
      { parse_mode: 'Markdown', ...myWishesKeyboard(remaining, 0, t) }
    );
  });

};

module.exports = { registerMenuHandlers };
