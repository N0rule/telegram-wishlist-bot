const { createLogger } = require('./logger');
const log = createLogger('lang');

const LOCALE = process.env.LOCALE || 'en';

let messages;
try {
  messages = require(`../locales/${LOCALE}.json`);
  log.ok(`Loaded locale: "${LOCALE}"`);
} catch {
  log.warn(`Locale "${LOCALE}" not found, falling back to "en".`);
  messages = require('../locales/en.json');
}

// t('list.emptyUser', { username: 'N0rule' }) → "📭 No wishes found for @N0rule."
const t = (path, vars = {}) => {
  const str = path.split('.').reduce((obj, k) => obj?.[k], messages);
  if (!str) {
    log.warn(`Missing translation key: "${path}"`);
    return path; // return the key itself as fallback
  }
  return str.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? `{${k}}`);
};

module.exports = { t };
