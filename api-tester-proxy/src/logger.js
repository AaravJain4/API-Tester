export function createLogger(config) {
  return function log(level, message, data = undefined) {
    if (!config.loggingEnabled) {
      return;
    }

    const prefix = `[api-tester-proxy] ${level.toUpperCase()} ${message}`;

    if (data === undefined) {
      console.log(prefix);
      return;
    }

    console.log(prefix, data);
  };
}
