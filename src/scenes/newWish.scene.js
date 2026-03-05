const { Scenes, Markup } = require('telegraf');
const { createWish } = require('../services/db');
const { postWish }   = require('../services/channelPoster');
const { log } = require('../utils/logger');

const cancelBtn = Markup.inlineKeyboard([
  [Markup.button.callback('⏩ Skip', 'SKIP'), Markup.button.callback('❌ Cancel', 'CANCEL')],
]);

const cancelOnly = Markup.inlineKeyboard([
  [Markup.button.callback('❌ Cancel', 'CANCEL')],
]);

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
    await ctx.reply('🎁 *New Wish — Step 1 / 3*\n\nWhat is the *name* of your wish?', {
      parse_mode: 'Markdown',
      ...cancelOnly,
    });
    return ctx.wizard.next();
  },

  // ── Step 1: Save name, ask for description ────────────────────────────────
  async (ctx) => {
    if (ctx.callbackQuery) {
      await ctx.answerCbQuery();
      if (ctx.callbackQuery.data === 'CANCEL') return leave(ctx, '❌ Cancelled.');
    }
    if (!ctx.message?.text) return ctx.reply('⚠️ Please type the wish name.');

    ctx.wizard.state.wish.name = ctx.message.text;

    await ctx.reply('📝 *Step 2 / 3* — Add a *description* (or skip):', {
      parse_mode: 'Markdown',
      ...cancelBtn,
    });
    return ctx.wizard.next();
  },

  // ── Step 2: Save description, ask for photo ───────────────────────────────
  async (ctx) => {
    if (ctx.callbackQuery) {
      await ctx.answerCbQuery();
      if (ctx.callbackQuery.data === 'CANCEL') return leave(ctx, '❌ Cancelled.');
      if (ctx.callbackQuery.data === 'SKIP') ctx.wizard.state.wish.description = null;
    } else if (ctx.message?.text) {
      ctx.wizard.state.wish.description = ctx.message.text;
    } else {
      return ctx.reply('⚠️ Please send text or tap Skip.');
    }

    await ctx.reply('📷 *Step 3 / 3* — Send a *photo* (or skip):', {
      parse_mode: 'Markdown',
      ...cancelBtn,
    });
    return ctx.wizard.next();
  },

  // ── Step 3: Save photo, persist & post to channel ─────────────────────────
  async (ctx) => {
    if (ctx.callbackQuery) {
      await ctx.answerCbQuery();
      if (ctx.callbackQuery.data === 'CANCEL') return leave(ctx, '❌ Cancelled.');
      // SKIP → photoId stays undefined → null below
    } else if (ctx.message?.photo) {
      // Telegram sends multiple sizes; last = highest resolution
      ctx.wizard.state.wish.photoId = ctx.message.photo.at(-1).file_id;
    } else if (ctx.message?.text !== '/skip') {
      return ctx.reply('⚠️ Please send a photo or tap Skip.');
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
      
      await ctx.reply(`✅ Wish *"${name}"* posted to channel!\n🆔 ID: \`${wish.id}\``, {
        parse_mode: 'Markdown',
      });
    } catch (err) {
    log.error('[newWish]', err.message);
    await ctx.reply('⚠️ Failed to post. Is the bot an admin in the channel?');
  }

    return ctx.scene.leave();
  }
);

module.exports = { newWishScene };
