const { Markup } = require('telegraf');

const PAGE_SIZE = 5;

// ── Main menu — no remove button ───────────────────────────────────────────
const mainMenu = (t) => Markup.inlineKeyboard([
  [Markup.button.callback(t('menu.btnNewWish'),  'MENU_NEWWISH')],
  [
    Markup.button.callback(t('menu.btnMyWishes'),  'MY_LIST:0'),
    Markup.button.callback(t('menu.btnAllWishes'), 'ALL_LIST:0'),
  ],
]);

const backRow = (t) => [Markup.button.callback(t('menu.btnBack'), 'MENU')];

const buildNavRow = (page, total, prevCb, nextCb, t) => {
  const row = [];
  if (page > 0)                       row.push(Markup.button.callback(t('menu.btnPrev'), prevCb));
  if ((page + 1) * PAGE_SIZE < total) row.push(Markup.button.callback(t('menu.btnNext'), nextCb));
  return row;
};

// ── My Wishes — each wish is tappable → triggers remove confirm ────────────
const myWishesKeyboard = (wishes, page, t) => {
  const slice = wishes.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const rows  = slice.map((w, i) => [
    Markup.button.callback(
      `🗑 ${page * PAGE_SIZE + i + 1}. ${w.name}`,
      `REMOVE_CONFIRM:${w.id}`
    ),
  ]);
  const nav = buildNavRow(page, wishes.length, `MY_LIST:${page - 1}`, `MY_LIST:${page + 1}`, t);
  if (nav.length) rows.push(nav);
  rows.push(backRow(t));
  return Markup.inlineKeyboard(rows);
};

// ── All Wishes — no wish buttons, only pagination + back ──────────────────
const allWishesKeyboard = (wishes, page, t) => {
  const rows = [];
  const nav  = buildNavRow(page, wishes.length, `ALL_LIST:${page - 1}`, `ALL_LIST:${page + 1}`, t);
  if (nav.length) rows.push(nav);
  rows.push(backRow(t));
  return Markup.inlineKeyboard(rows);
};

// ── Confirm remove dialog ──────────────────────────────────────────────────
const confirmKeyboard = (wishId, t) => Markup.inlineKeyboard([[
  Markup.button.callback(t('menu.btnConfirmYes'), `REMOVE_DO:${wishId}`),
  Markup.button.callback(t('menu.btnConfirmNo'),  `MY_LIST:0`),
]]);

module.exports = { PAGE_SIZE, mainMenu, myWishesKeyboard, allWishesKeyboard, confirmKeyboard, backRow };
