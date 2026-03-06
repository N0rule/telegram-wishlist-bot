const fs   = require('fs');
const path = require('path');
const { createLogger } = require('../utils/logger');
const log = createLogger('db');

const DB_PATH = path.resolve(__dirname, '../../data/wishes.json');

// Reads wishes from JSON file, creates file if it doesn't exist
const read = () => {
  if (!fs.existsSync(DB_PATH)) {
    fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
    fs.writeFileSync(DB_PATH, '[]');
    return [];
  }
  return JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
};

// Writes wishes array to JSON file
const write = (data) => fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));

// Creates a new wish in the database
const createWish = ({ id, userId, username, name, description, photoId }) => {
  const wishes = read();
  const wish = {
    id,       // Telegram message_id
    userId,
    username,
    name,
    description: description || null,
    photoId:     photoId     || null,
    createdAt:   new Date().toISOString(),
  };
  wishes.push(wish);
  write(wishes);
  //log.ok(`Wish "${name}" (ID ${id}) for user ${userId} (@${username}) was successfully created in the database`);
  return wish;
};

// Lists wishes, optionally filtered by userId
const listWishes  = (userId = null) => {
  const wishes = read();
  const filtered = userId ? wishes.filter(w => w.userId === userId) : wishes;
  //log.info(`Listed ${filtered.length} wishes${userId ? ` for user ${userId}` : ' (all)'}`);
  return filtered;
};

// Removes a wish by id and userId (for ownership check)
const removeWish  = (id, userId) => {
  const wishes = read();
  const idx = wishes.findIndex(w => w.id === id && w.userId === userId);
  if (idx === -1) {
    //log.warn(`Failed to remove wish ID ${id} for user ${userId}: not found`);
    return false;
  }
  const wish = wishes[idx];
  wishes.splice(idx, 1);
  write(wishes);
  //log.ok(`Removed wish "${wish.name}" (ID ${id}) for user ${userId}`);
  return true;
};

// Finds a wish by its id
const getWishById = (id) => {
  const wish = read().find(w => w.id === id) ?? null;
  if (!wish) {
    //log.warn(`Wish ID ${id} not found`);
  }
  return wish;
};

module.exports = { createWish, listWishes, removeWish, getWishById };
