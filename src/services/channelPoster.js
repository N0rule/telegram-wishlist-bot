const CHANNEL_ID = process.env.CHANNEL_ID;
const { log } = require('../services/logger');

// ─── run this once at startup ──────────────────────────────────────────────
const checkChannel = async (telegram) => {
  log.info(`Checking CHANNEL_ID="${CHANNEL_ID}"…`);

  // 1. Is CHANNEL_ID even set in .env?
  if (!CHANNEL_ID) {
    log.error('CHANNEL_ID is missing from .env! Bot will not be able to post.');
    return false;
  }

  // 2. Can the bot see the channel at all? (wrong ID / bot not a member → throws)
  let chat;
  try {
    chat = await telegram.getChat(CHANNEL_ID);
    log.ok(`Channel found: "${chat.title}" (id: ${chat.id}, type: ${chat.type})`);
  } catch (err) {
    log.error(`Cannot find channel. Possible reasons:`);
    log.error(`  • CHANNEL_ID is wrong (got "${CHANNEL_ID}")`);
    log.error(`  • Bot was never added to the channel`);
    log.error(`  • Raw Telegram error: ${err.message}`);
    return false;
  }

  // 3. Channels only — check the bot's own admin status + post permission
  if (chat.type === 'channel') {
    let me;
    try {
      me = await telegram.getMe();           // get the bot's own user id
    } catch (err) {
      log.error(`getMe() failed: ${err.message}`);
      return false;
    }

    let member;
    try {
      member = await telegram.getChatMember(CHANNEL_ID, me.id);
    } catch (err) {
      log.error(`getChatMember() failed: ${err.message}`);
      return false;
    }

    log.info(`Bot status in channel: "${member.status}"`);

    if (member.status !== 'administrator') {
      log.error(`Bot is NOT an administrator. Go to channel → Administrators → Add Bot.`);
      return false;
    }

    // Telegram exposes per-permission flags on the ChatMemberAdministrator object
    const canPost = member.can_post_messages;
    if (!canPost) {
      log.warn(`Bot is admin but "Post Messages" permission is OFF.`);
      log.warn(`Go to channel → Administrators → your bot → enable "Post Messages".`);
      return false;
    }

    log.ok(`Bot is admin with post permission. Channel is ready! 🎉`);
  } else {
    // It's a group/supergroup — posting works differently, just warn
    log.warn(`CHANNEL_ID points to a ${chat.type}, not a channel. This is fine if intentional.`);
  }

  return true;
};

// ─── called every time someone creates a wish ─────────────────────────────
const postWish = async (ctx, wish) => {
  log.info(`Posting wish id=${wish.id} ("${wish.name}") by @${wish.username} …`);

  const text = [
    `🎁 *New Wish!*`,
    ``,
    `👤 *By:* @${wish.username || wish.userId}`,
    `📦 *Wish:* ${wish.name}`,
    wish.description ? `📝 *About:* ${wish.description}` : null,
    ``,
    `🆔 ID: \`${wish.id}\``,
  ].filter(l => l !== null).join('\n');

  try {
    if (wish.photoId) {
      await ctx.telegram.sendPhoto(CHANNEL_ID, wish.photoId, {
        caption:    text,
        parse_mode: 'Markdown',
      });
    } else {
      await ctx.telegram.sendMessage(CHANNEL_ID, text, { parse_mode: 'Markdown' });
    }
    log.ok(`Wish id=${wish.id} posted successfully.`);
  } catch (err) {
    log.error(`Failed to post wish id=${wish.id}: ${err.message}`);
    throw err; // bubble up so bot.js can tell the user
  }
};

module.exports = { checkChannel, postWish };
