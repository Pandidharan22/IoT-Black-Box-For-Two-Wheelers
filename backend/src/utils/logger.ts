import winston from 'winston';
import config from '../config';

const logFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.colorize(),
  winston.format.printf(
    (info) => `${info.timestamp} [${info.level}] [${info.module}]: ${info.message}`
  )
);

export const createLogger = (module: string) => {
  return winston.createLogger({
    level: config.LOG_LEVEL || 'info',
    format: logFormat,
    defaultMeta: { module },
    transports: [
      new winston.transports.Console()
    ]
  });
};

// Export default logger for general use
export default createLogger('app');