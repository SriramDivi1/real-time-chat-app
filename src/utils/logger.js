class Logger {
  constructor(level = 'info') {
    this.level = level;
    this.levels = {
      error: 0,
      warn: 1,
      info: 2,
      debug: 3
    };
  }

  formatMessage(message, data = '') {
    const timestamp = new Date().toISOString();
    return `[${timestamp}] ${message} ${data}`;
  }

  error(message, error = '') {
    if (this.levels[this.level] >= this.levels.error) {
      console.error(this.formatMessage('❌ ERROR:', message), error);
    }
  }

  warn(message, data = '') {
    if (this.levels[this.level] >= this.levels.warn) {
      console.warn(this.formatMessage('⚠️  WARN:', message), data);
    }
  }

  info(message, data = '') {
    if (this.levels[this.level] >= this.levels.info) {
      console.log(this.formatMessage('ℹ️  INFO:', message), data);
    }
  }

  debug(message, data = '') {
    if (this.levels[this.level] >= this.levels.debug) {
      console.log(this.formatMessage('🐛 DEBUG:', message), data);
    }
  }
}

const logger = new Logger(process.env.LOG_LEVEL || 'info');

module.exports = { logger, Logger };
