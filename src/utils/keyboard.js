const { Markup } = require('telegraf');

const PAGE_SIZE = 5;

const mainMenu = (t) => Markup.inlineKeyboard([
  [Markup.button.callback(t('menu.btnNewWish'),  'MENU_NEWWISH')],
  [
    Markup.button.callback(t('menu.btnMyWishes'),  'MY_LIST:0'),
    Markup.button.callback(t('menu.btnAllWishes'), 'ALL_LIST:0'),
  ],
  [Markup.button.callback(t('menu.btnRemove'), 'REMOVE_PAGE:0')],
]);

const backRow = (t) => [Markup.button.callback(t('menu.btnBack'), 'MENU')];

const buildNavRow = (page, total, prevCb, nextCb, t) => {
  const row = [];
  if (page > 0)                       row.push(Markup.button.callback(t('menu.btnPrev'), prevCb));
  if ((page + 1) * PAGE_SIZE < total) row.push(Markup.button.callback(t('menu.btnNext'), nextCb));
  return row;
};

// View list — wish buttons do nothing (NOOP), just displayed
const viewListKeyboard = (wishes, page, prefix, t) => {
  const slice = wishes.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const rows  = slice.map((w, i) => [
    Markup.button.callback(`${page * PAGE_SIZE + i + 1}. ${w.name} (@${w.username})`, 'NOOP'),
  ]);
  const nav = buildNavRow(page, wishes.length, `${prefix}:${page - 1}`, `${prefix}:${page + 1}`, t);
  if (nav.length) rows.push(nav);
  rows.push(backRow(t));
  return Markup.inlineKeyboard(rows);
};

// Remove list — tap a wish to get a confirm dialog
const removeListKeyboard = (wishes, page, t) => {
  const slice = wishes.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const rows  = slice.map((w, i) => [
    Markup.button.callback(`${page * PAGE_SIZE + i + 1}. ${w.name}`, `REMOVE_CONFIRM:${w.id}`),
  ]);
  const nav = buildNavRow(page, wishes.length, `REMOVE_PAGE:${page - 1}`, `REMOVE_PAGE:${page + 1}`, t);
  if (nav.length) rows.push(nav);
  rows.push(backRow(t));
  return Markup.inlineKeyboard(rows);
};

const confirmKeyboard = (wishId, t) => Markup.inlineKeyboard([[
  Markup.button.callback(t('menu.btnConfirmYes'), `REMOVE_DO:${wishId}`),
  Markup.button.callback(t('menu.btnConfirmNo'),  'REMOVE_PAGE:0'),
]]);

module.exports = { PAGE_SIZE, mainMenu, viewListKeyboard, removeListKeyboard, confirmKeyboard, backRow };
