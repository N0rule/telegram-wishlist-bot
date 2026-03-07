const { Markup }                                     = require('telegraf');
const { listWishes, getWishById, removeWish }        = require('../services/db');
const { deleteWishPost }                             = require('../services/channelPoster');
const { t }                                          = require('../utils/lang');
const { createLogger }                               = require('../utils/logger');
const { PAGE_SIZE, mainMenu, viewListKeyboard,
        removeListKeyboard, confirmKeyboard, backRow } = require('../utils/keyboard');

const log = createLogger('menuHandler');

const pageInfo = (page, total, t) =>
  `${t('menu.page')} ${page + 1}/${Math.max(1, Math.ceil(total / PAGE_SIZE))}`;

const formatPage = (wishes, page, title, t) => {
  const slice = wishes.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const lines = slice.map((w, i) =>
    [`*${page * PAGE_SIZE + i + 1}. ${w.name}*`, w.description ? `_${w.description}_` : null, `🆔 \`${w.id}\``]
      .filter(Boolean).join('\n')
  );
  return `🎁 *${title}* — ${pageInfo(page, wishes.length, t)}\n\n${lines.join('\n\n')}`;
};

const registerMenuHandlers = (bot) => {

  // ── Main menu ──────────────────────────────────────────────────────────────
  bot.action('MENU', async (ctx) => {
    await ctx.answerCbQuery();
    await ctx.editMessageText(t('start.welcome'), {
      parse_mode: 'Markdown',
      ...mainMenu(t),
    });
  });

  // ── New wish from button ───────────────────────────────────────────────────
  bot.action('MENU_NEWWISH', async (ctx) => {
    await ctx.answerCbQuery();
    await ctx.deleteMessage();
    return ctx.scene.enter('NEW_WISH');
  });

  // ── My wishes (view, paginated) ────────────────────────────────────────────
  bot.action(/^MY_LIST:(\d+)$/, async (ctx) => {
    await ctx.answerCbQuery();
    const page   = parseInt(ctx.match[1]);
    const wishes = listWishes(ctx.from.id);

    if (!wishes.length)
      return ctx.editMessageText(t('list.empty'), {
        ...Markup.inlineKeyboard([backRow(t)]),
      });

    await ctx.editMessageText(
      formatPage(wishes, page, t('list.titleMine'), t),
      { parse_mode: 'Markdown', ...viewListKeyboard(wishes, page, 'MY_LIST', t) }
    );
  });

  // ── All wishes (view, paginated) ───────────────────────────────────────────
  bot.action(/^ALL_LIST:(\d+)$/, async (ctx) => {
    await ctx.answerCbQuery();
    const page   = parseInt(ctx.match[1]);
    const wishes = listWishes(null);

    if (!wishes.length)
      return ctx.editMessageText(t('list.emptyAll'), {
        ...Markup.inlineKeyboard([backRow(t)]),
      });

    await ctx.editMessageText(
      formatPage(wishes, page, t('list.titleAll'), t),
      { parse_mode: 'Markdown', ...viewListKeyboard(wishes, page, 'ALL_LIST', t) }
    );
  });

  // ── Remove — browse my wishes ──────────────────────────────────────────────
  bot.action(/^REMOVE_PAGE:(\d+)$/, async (ctx) => {
    await ctx.answerCbQuery();
    const page   = parseInt(ctx.match[1]);
    const wishes = listWishes(ctx.from.id);

    if (!wishes.length)
      return ctx.editMessageText(t('list.empty'), {
        ...Markup.inlineKeyboard([backRow(t)]),
      });

    await ctx.editMessageText(
      t('menu.removePrompt', { page: page + 1, total: Math.max(1, Math.ceil(wishes.length / PAGE_SIZE)) }),
      { parse_mode: 'Markdown', ...removeListKeyboard(wishes, page, t) }
    );
  });

  // ── Remove — confirm dialog ────────────────────────────────────────────────
  bot.action(/^REMOVE_CONFIRM:(\d+)$/, async (ctx) => {
    await ctx.answerCbQuery();
    const wish = getWishById(parseInt(ctx.match[1]));

    if (!wish)
      return ctx.editMessageText(t('removeWish.notFound', { id: ctx.match[1] }), {
        parse_mode:  'Markdown',
        ...Markup.inlineKeyboard([backRow(t)]),
      });

    await ctx.editMessageText(
      t('menu.confirmRemove', { name: wish.name }),
      { parse_mode: 'Markdown', ...confirmKeyboard(wish.id, t) }
    );
  });

  // ── Remove — execute ───────────────────────────────────────────────────────
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

    // Refresh the remove list after deletion
    const remaining = listWishes(ctx.from.id);
    if (!remaining.length)
      return ctx.editMessageText(
        t('removeWish.success', { name: wish.name }) + '\n\n' + t('list.empty'),
        { parse_mode: 'Markdown', ...mainMenu(t) }
      );

    return ctx.editMessageText(
      t('removeWish.success', { name: wish.name }) + '\n\n' +
      t('menu.removePrompt', { page: 1, total: Math.max(1, Math.ceil(remaining.length / PAGE_SIZE)) }),
      { parse_mode: 'Markdown', ...removeListKeyboard(remaining, 0, t) }
    );
  });

  // ── No-op for display-only buttons ────────────────────────────────────────
  bot.action('NOOP', (ctx) => ctx.answerCbQuery());
};

module.exports = { registerMenuHandlers };
