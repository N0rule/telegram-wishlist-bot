const { Scenes, Markup } = require('telegraf');
const { createWish } = require('../services/db');
const { postWish }   = require('../services/channelPoster');
const { createLogger } = require('../utils/logger');
const { mainMenu } = require('../utils/keyboard');
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
  if (ctx.callbackQuery) {
    await ctx.answerCbQuery();
    // ✅ edit the existing step message — no new message sent
    return ctx.editMessageText(t('start.welcome'), {
      parse_mode: 'Markdown',
      ...mainMenu(t),
    }).then(() => ctx.scene.leave());
  }
  // fallback for non-button cancel (unlikely but safe)
  await ctx.reply(msg, { parse_mode: 'Markdown', ...mainMenu(t) });
  return ctx.scene.leave();
}



const newWishScene = new Scenes.WizardScene(
  'NEW_WISH',

// ── Step 0: Enter scene, ask for name ────────────────────────────────────
async (ctx) => {
  ctx.wizard.state.wish = {};

  if (ctx.callbackQuery) {
    //log.info(`User ${ctx.from.id} (@${ctx.from.username}) started new wish creation`);
    await ctx.answerCbQuery();
    await ctx.editMessageText(t('newWish.stepName'), {
      parse_mode: 'Markdown',
      ...cancelOnly,
    });
  } else {
    // came from /newwish command → send a new message
    await ctx.reply(t('newWish.stepName'), {
      parse_mode: 'Markdown',
      ...cancelOnly,
    });
  }

  return ctx.wizard.next();
},





  // ── Step 1: Save name, ask for description ────────────────────────────────
  async (ctx) => {
    if (ctx.callbackQuery) {
      await ctx.answerCbQuery();
      if (ctx.callbackQuery.data === 'CANCEL') {
        //log.info(`User ${ctx.from.id} (@${ctx.from.username}) cancelled wish creation at name step`);
        return leave(ctx, t('newWish.cancelled'));
      }
    }
    if (!ctx.message?.text) return ctx.reply(t('newWish.errName'));
    ctx.wizard.state.wish.name = ctx.message.text;
    //log.info(`User ${ctx.from.id} (@${ctx.from.username}) set wish name: "${ctx.wizard.state.wish.name}"`);
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
      if (ctx.callbackQuery.data === 'CANCEL') {
        //log.info(`User ${ctx.from.id} (@${ctx.from.username}) cancelled wish creation at description step`);
        return leave(ctx, t('newWish.cancelled'));
      }
      if (ctx.callbackQuery.data === 'SKIP') {
        ctx.wizard.state.wish.description = null;
        //log.info(`User ${ctx.from.id} (@${ctx.from.username}) skipped description`);
      }
    } else if (ctx.message?.text) {
      ctx.wizard.state.wish.description = ctx.message.text;
      //log.info(`User ${ctx.from.id} (@${ctx.from.username}) set wish description: "${ctx.wizard.state.wish.description}"`);
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
      if (ctx.callbackQuery.data === 'CANCEL') {
        //log.info(`User ${ctx.from.id} (@${ctx.from.username}) cancelled wish creation at photo step`);
        return leave(ctx, t('newWish.cancelled'));
      }
      // SKIP → photoId stays undefined → null below
      if (ctx.callbackQuery.data === 'SKIP') {
        //log.info(`User ${ctx.from.id} (@${ctx.from.username}) skipped photo`);
      }
    } else if (ctx.message?.photo) {
      // Telegram sends multiple sizes; last = highest resolution
      ctx.wizard.state.wish.photoId = ctx.message.photo.at(-1).file_id;
      //log.info(`User ${ctx.from.id} (@${ctx.from.username}) uploaded photo for wish`);
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
      const messageId = await postWish(ctx.telegram, data);
      createWish({ id: messageId, ...data });

      // ✅ no ID shown, menu buttons appear right after
      await ctx.reply(t('newWish.posted', { name }), {
        parse_mode: 'Markdown',
        ...mainMenu(t),
      });
    } catch (err) {
      log.error(err.message);
      await ctx.reply(t('newWish.errPost'));
    }

    return ctx.scene.leave();
  }
);

module.exports = { newWishScene };
