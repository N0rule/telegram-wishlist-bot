const getAllowed = () =>
  (process.env.ALLOWED_USERS ?? '').split(',').map(Number).filter(Boolean);

const auth = (ctx, next) => {
  if (!getAllowed().includes(ctx.from?.id)) {
    return ctx.reply('⛔ You are not authorized to use this bot.');
  }
  return next();
};

module.exports = { auth };
