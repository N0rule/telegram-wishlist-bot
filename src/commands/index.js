const { newWishCommand } = require('./newwish');
const { listCommand }    = require('./list');
const { removeCommand }  = require('./remove');

const registerCommands = (bot) => {
  newWishCommand(bot);
  listCommand(bot);
  removeCommand(bot);
  // ← drop new commands here, e.g.: editWishCommand(bot)
};

module.exports = { registerCommands };
