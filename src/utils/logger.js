const COLORS = {
  reset:  '\x1b[0m',
  dim:    '\x1b[2m',
  cyan:   '\x1b[36m',
  green:  '\x1b[32m',
  yellow: '\x1b[33m',
  red:    '\x1b[31m',
};

const ts = () => new Date().toLocaleTimeString('en-GB'); // HH:MM:SS

const createLogger = (source = 'app') => ({
  info:  (...a) => console.log (`${COLORS.dim}${ts()}${COLORS.reset} ${COLORS.cyan}[${source}]${COLORS.reset} ℹ️ `, ...a),
  ok:    (...a) => console.log (`${COLORS.dim}${ts()}${COLORS.reset} ${COLORS.green}[${source}]${COLORS.reset} ✅`, ...a),
  warn:  (...a) => console.warn(`${COLORS.dim}${ts()}${COLORS.reset} ${COLORS.yellow}[${source}]${COLORS.reset} ⚠️ `, ...a),
  error: (...a) => console.error(`${COLORS.dim}${ts()}${COLORS.reset} ${COLORS.red}[${source}]${COLORS.reset} ❌`, ...a),
});

// default instance for bot.js / one-off use
const log = createLogger('app');

module.exports = { log, createLogger };
