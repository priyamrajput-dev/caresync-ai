const SENSITIVE_KEYS = [
  'password',
  'token',
  'jwt',
  'authorization',
  'secret',
  'apiKey',
  'api_key',
  'anthropic_api_key'
];

function sanitize(data) {
  if (!data) return data;
  if (typeof data === 'string') {
    // Mask potential token/key patterns
    return data.replace(/(sk-ant-[a-zA-Z0-9_-]{8})[a-zA-Z0-9_-]+/g, '$1***')
               .replace(/(Bearer\s+)[a-zA-Z0-9_.-]+/g, '$1***');
  }
  if (typeof data === 'object') {
    if (Array.isArray(data)) {
      return data.map(sanitize);
    }
    const sanitized = {};
    for (const [key, value] of Object.entries(data)) {
      const lower = key.toLowerCase();
      if (SENSITIVE_KEYS.some(sk => lower.includes(sk))) {
        sanitized[key] = '***REDACTED***';
      } else {
        sanitized[key] = sanitize(value);
      }
    }
    return sanitized;
  }
  return data;
}

function formatMessage(level, message, ...args) {
  const timestamp = new Date().toISOString();
  const sanitizedArgs = args.map(sanitize);
  const formattedArgs = sanitizedArgs.length ? ' ' + sanitizedArgs.map(a => typeof a === 'object' ? JSON.stringify(a) : a).join(' ') : '';
  return `[${timestamp}] [${level.toUpperCase()}] ${message}${formattedArgs}`;
}

export const logger = {
  info: (msg, ...args) => console.log(formatMessage('info', msg, ...args)),
  warn: (msg, ...args) => console.warn(formatMessage('warn', msg, ...args)),
  error: (msg, ...args) => console.error(formatMessage('error', msg, ...args)),
  debug: (msg, ...args) => {
    if (process.env.LOG_LEVEL === 'debug') {
      console.debug(formatMessage('debug', msg, ...args));
    }
  }
};
