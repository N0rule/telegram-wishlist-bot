require('dotenv').config();
const { Telegraf, Scenes, session } = require('telegraf');
const { newWishScene }  = require('./scenes/newWish.scene');
const { registerCommands } = require('./commands');
const { auth } = require('./middleware/auth');
const { checkChannel } = require('./services/channelPoster');
const { log } = require('./utils/logger');

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

const startBot = async () => {
  log.info('🤖 Wishlist bot is running!');
  await checkChannel(bot.telegram);  // runs first, bot.telegram is ready right after new Telegraf()
  bot.launch();                      // starts polling — intentionally NOT awaited
};

startBot();

process.once('SIGINT',  () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
