const fs   = require('fs');
const path = require('path');

const DB_PATH = path.resolve(__dirname, '../../data/wishes.json');

const read = () => {
  if (!fs.existsSync(DB_PATH)) {
    fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
    fs.writeFileSync(DB_PATH, '[]');
    return [];
  }
  return JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
};

const write = (data) => fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));

const createWish = ({ userId, username, name, description, photoId }) => {
  const wishes = read();
  const wish = {
    id: Date.now(),        // timestamp-based ID, unique enough
    userId,
    username,
    name,
    description: description || null,
    photoId:     photoId   || null,
    createdAt:   new Date().toISOString(),
  };
  wishes.push(wish);
  write(wishes);
  return wish;
};

const listWishes  = (userId = null) => {
  const wishes = read();
  return userId ? wishes.filter(w => w.userId === userId) : wishes;
};

const removeWish  = (id, userId) => {
  const wishes = read();
  const idx = wishes.findIndex(w => w.id === id && w.userId === userId);
  if (idx === -1) return false;
  wishes.splice(idx, 1);
  write(wishes);
  return true;
};

const getWishById = (id) => read().find(w => w.id === id) ?? null;

module.exports = { createWish, listWishes, removeWish, getWishById };
