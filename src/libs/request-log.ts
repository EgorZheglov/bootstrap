import expressWinston from 'express-winston';
import winston, { format } from 'winston';

const { printf } = format;

const customLogFormat = printf(
  ({ message, level }) => `${level} [request] ${message}`
);

const requestLogger = expressWinston.logger({
  transports: [new winston.transports.Console({ level: process.env.DEBUG })],

  format: winston.format.combine(
    winston.format.json(),
    winston.format.colorize(),
    customLogFormat
  ),

  level: 'debug',

  msg: (req): string =>
    `method:${req.method}, path:${req.path}, body:${JSON.stringify(
      req.body
    )}, url:${req.url}, params:${JSON.stringify(req.params)}`,
});

export default requestLogger;
