const { createLogger } = require('../utils/logger');
const log = createLogger('auth');

// Parses ALLOWED_USERS environment variable into an array of user IDs
const getAllowed = () =>
  (process.env.ALLOWED_USERS ?? '').split(',').map(Number).filter(Boolean);

// Middleware to check if user is authorized to use the bot
const auth = (ctx, next) => {
  if (!getAllowed().includes(ctx.from?.id)) {
    log.warn(`Unauthorized access attempt by user ${ctx.from?.id} (@${ctx.from?.username})`);
    return ctx.reply('⛔ You are not authorized to use this bot.');
  }
  return next();
};

module.exports = { auth };
