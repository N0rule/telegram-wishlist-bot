require('dotenv').config();
const { Telegraf, Scenes, session } = require('telegraf');
const { newWishScene }  = require('./scenes/newWish.scene');
const { registerCommands } = require('./commands');
const { auth } = require('./middleware/auth');
const { checkChannel } = require('./services/channelPoster');
const { t }        = require('./utils/lang');
const { mainMenu } = require('./utils/keyboard');
const { createLogger } = require('./utils/logger');
const log = createLogger('bot');

const bot = new Telegraf(process.env.BOT_TOKEN);

// In-memory session (required for WizardScene state)
bot.use(session());

// Register scenes
const stage = new Scenes.Stage([newWishScene]);
bot.use(stage.middleware());

// Auth wall — blocks everyone except ALLOWED_USERS
bot.use(auth);

// Register all commands
registerCommands(bot);

// catch-all: any plain text that isn't a command → show main menu
bot.on('text', (ctx) => {
  if (!ctx.message.text.startsWith('/')) {
    ctx.reply(t('start.welcome'), {
      parse_mode: 'Markdown',
      ...mainMenu(t),
    });
  }
});

const startBot = async () => {
  log.info('🤖 Wishlist bot is running!');
  await checkChannel(bot.telegram);  // runs first, bot.telegram is ready right after new Telegraf()
  bot.launch();                      // starts polling — intentionally NOT awaited
};

startBot();

process.once('SIGINT',  () => {
  log.info('🛑 Received SIGINT, stopping bot...');
  bot.stop('SIGINT');
});
process.once('SIGTERM', () => {
  log.info('🛑 Received SIGTERM, stopping bot...');
  bot.stop('SIGTERM');
});
