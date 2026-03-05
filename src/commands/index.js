const { newWishCommand } = require('./newwish');
const { listCommand }    = require('./list');
const { listAllCommand }    = require('./listall');
const { removeCommand }  = require('./remove');


const registerCommands = (bot) => {
  newWishCommand(bot);
  listCommand(bot);
  listAllCommand(bot);
  removeCommand(bot);
  // ← drop new commands here
};

module.exports = { registerCommands };
