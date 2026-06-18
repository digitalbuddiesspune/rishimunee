const formatMessage = (level, message, meta) => {
  const timestamp = new Date().toISOString();
  const metaString = meta ? ` ${JSON.stringify(meta)}` : "";
  return `[${level}] ${timestamp} ${message}${metaString}`;
};

export const logger = {
  info: (message, meta) => {
    console.log(formatMessage("INFO", message, meta));
  },
  warn: (message, meta) => {
    console.warn(formatMessage("WARN", message, meta));
  },
  error: (message, meta) => {
    console.error(formatMessage("ERROR", message, meta));
  }
};

