const log = {
  info:  (...args) => console.log (' ℹ️ ', ...args),
  ok:    (...args) => console.log (' ✅ ', ...args),
  warn:  (...args) => console.warn(' ⚠️ ', ...args),
  error: (...args) => console.error(' ❌ ', ...args),
};

module.exports = { log };