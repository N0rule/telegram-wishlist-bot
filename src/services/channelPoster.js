const CHANNEL_ID = process.env.CHANNEL_ID;
const { createLogger } = require('../utils/logger');
const log = createLogger('channelPoster');
const { t } = require('../utils/lang');
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
    log.ok(`Channel found: "${chat.title}" (ID: ${chat.id}, type: ${chat.type})`);
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
const postWish = async (telegram, { username, userId, name, description, photoId }) => {
  log.info(`Posting wish "${name}" by @${username} …`);

  const text = [
    t('channel.title'),
    ``,
    t('channel.by',    { username: username || userId }),
    t('channel.wish',  { name }),
    description ? t('channel.about', { description }) : null,
  ].filter(Boolean).join('\n');

  try {
    let sent;
    if (photoId) {
      sent = await telegram.sendPhoto(CHANNEL_ID, photoId, {
        caption:    text,
        parse_mode: 'Markdown',
      });
    } else {
      sent = await telegram.sendMessage(CHANNEL_ID, text, {
        parse_mode: 'Markdown',
      });
    }

    log.ok(`Wish posted. (ID ${sent.message_id})`);
    return sent.message_id; // wish id === channel message_id
  } catch (err) {
    log.error(`Failed to post: ${err.message}`);
    throw err;
  }
};
// ─── called every time someone deletes a wish ─────────────────────────────
const deleteWishPost = async (telegram, messageId) => {
  try {
    await telegram.deleteMessage(CHANNEL_ID, messageId);
    log.ok(`Wish deleted. (ID ${messageId})`);
  } catch (err) {
    // Message might already be manually deleted — don't crash
    log.warn(`Could not delete Wish. (ID ${messageId}): ${err.message}`);
  }
};

module.exports = { checkChannel, postWish, deleteWishPost };

