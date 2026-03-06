const { Scenes, Markup } = require('telegraf');
const { createWish } = require('../services/db');
const { postWish }   = require('../services/channelPoster');
const { createLogger } = require('../utils/logger');
const log = createLogger('newWish');
const { t } = require('../utils/lang');


const cancelBtn = Markup.inlineKeyboard([[
  Markup.button.callback(t('newWish.btnSkip'),   'SKIP'),
  Markup.button.callback(t('newWish.btnCancel'), 'CANCEL'),
]]);

const cancelOnly = Markup.inlineKeyboard([[
  Markup.button.callback(t('newWish.btnCancel'), 'CANCEL'),
]]);

async function leave(ctx, msg) {
  if (ctx.callbackQuery) await ctx.answerCbQuery();
  await ctx.reply(msg);
  return ctx.scene.leave();
}

const newWishScene = new Scenes.WizardScene(
  'NEW_WISH',

  // ── Step 0: Enter scene, ask for name ─────────────────────────────────────
  async (ctx) => {
    ctx.wizard.state.wish = {};
    await ctx.reply(t('newWish.stepName'), {
      parse_mode: 'Markdown',
      ...cancelOnly,
    });
    return ctx.wizard.next();
  },

  // ── Step 1: Save name, ask for description ────────────────────────────────
  async (ctx) => {
    if (ctx.callbackQuery) {
      await ctx.answerCbQuery();
      if (ctx.callbackQuery.data === 'CANCEL') return leave(ctx, t('newWish.cancelled'));
    }
    if (!ctx.message?.text) return ctx.reply(t('newWish.errName'));
    ctx.wizard.state.wish.name = ctx.message.text;
    await ctx.reply(t('newWish.stepDescription'), {
      parse_mode: 'Markdown',
      ...cancelBtn,
    });
    return ctx.wizard.next();
  },

  // ── Step 2: Save description, ask for photo ───────────────────────────────
  async (ctx) => {
    if (ctx.callbackQuery) {
      await ctx.answerCbQuery();
      if (ctx.callbackQuery.data === 'CANCEL') return leave(ctx, t('newWish.cancelled'));
      if (ctx.callbackQuery.data === 'SKIP') ctx.wizard.state.wish.description = null;
    } else if (ctx.message?.text) {
      ctx.wizard.state.wish.description = ctx.message.text;
    } else {
      return ctx.reply(t('newWish.errDescription'));
    }

    await ctx.reply(t('newWish.stepPhoto'), {
      parse_mode: 'Markdown',
      ...cancelBtn,
    });
    return ctx.wizard.next();
  },

  // ── Step 3: Save photo, persist & post to channel ─────────────────────────
  async (ctx) => {
    if (ctx.callbackQuery) {
      await ctx.answerCbQuery();
      if (ctx.callbackQuery.data === 'CANCEL') return leave(ctx, t('newWish.cancelled'));
      // SKIP → photoId stays undefined → null below
    } else if (ctx.message?.photo) {
      // Telegram sends multiple sizes; last = highest resolution
      ctx.wizard.state.wish.photoId = ctx.message.photo.at(-1).file_id;
    } else if (ctx.message?.text !== '/skip') {
      return ctx.reply(t('newWish.errPhoto'));
    }

    const { name, description = null, photoId = null } = ctx.wizard.state.wish;

    const data = {
      userId:   ctx.from.id,
      username: ctx.from.username || ctx.from.first_name,
      name,
      description,
      photoId,
    };

    try {
      // 1. Post to channel first → get the message_id
      const messageId = await postWish(ctx.telegram, data);

      // 2. Save to DB using messageId as the id
      const wish = createWish({ id: messageId, ...data });
      
      await ctx.reply(t('newWish.posted', { name, id: messageId }), { parse_mode: 'Markdown' });
    } catch (err) {
    log.error('[newWish]', err.message);
    await ctx.reply(t('newWish.errPost'));
  }

    return ctx.scene.leave();
  }
);

module.exports = { newWishScene };
