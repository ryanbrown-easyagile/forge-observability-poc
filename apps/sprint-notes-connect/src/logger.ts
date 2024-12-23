import winston, {Logger} from 'winston';
import expressWinston from 'express-winston';
import { Express } from 'express';

let _logger : Logger;
function getLogger() {
    if (_logger) {
        return _logger
    }
    if (process.env.NODE_ENV === 'production') {
        _logger = winston.createLogger({
            level: 'info',
            format: winston.format.json(),
            defaultMeta: { service: 'ea-notes' },
            transports: [
                new winston.transports.Console(),
            ],
        });
    } else {
        _logger = winston.createLogger({
            level: 'info',
            format: winston.format.json(),
            defaultMeta: { service: 'ea-notes' },
            transports: [
                new winston.transports.Console(),
            ],
        });
    }
    return _logger;
}

export function info(message: string) {
    getLogger().info(message);
}

export function error(message: string) {
    getLogger().error(message);
}

export function warn(message: string) {
    getLogger().warn(message);
}

export function debug(message: string) {
    getLogger().debug(message);
}

export function initialiseExpressLogger(app: Express) {
  // Log requests, using an appropriate formatter by env
  app.use(expressWinston.logger({
    winstonInstance: getLogger(),
    meta: true,
    msg: 'Request Received {{req.method}} {{req.path}}',
    requestWhitelist: ['url', 'headers', 'method', 'httpVersion', 'originalUrl', 'query'], 
    headerBlacklist: ['authorization'],
    requestFilter: (req, propName) => {
      console.log('propName', propName);
      if (propName === 'url' || propName === 'originalUrl') {
        return redactJwtTokens(req[propName]);
      }
      if (propName === 'query' && req[propName].jwt) {
        req[propName].jwt = 'redacted';
      }
      return req[propName];
    },
  }));
  getLogger().info('Express logger initialised');
}

function redactJwtTokens(value: string) {
  const [path, queryString] = value.split('?');
  const params = new URLSearchParams(queryString);
  params.forEach((_value, key) => {
    if (key.toLowerCase() === 'jwt') {
      params.set(key, 'redacted');
    }
  });
  return `${path}?${params.toString()}`;
}
