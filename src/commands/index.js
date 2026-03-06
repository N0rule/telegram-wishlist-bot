const { startCommand }   = require('./start');
const { newWishCommand } = require('./newwish');
const { listCommand }    = require('./list');
const { listAllCommand }    = require('./listall');
const { removeWishCommand }  = require('./removewish');


const registerCommands = (bot) => {
  startCommand(bot);
  newWishCommand(bot);
  listCommand(bot);
  listAllCommand(bot);
  removeWishCommand(bot);
  // ← drop new commands here
};

module.exports = { registerCommands };
