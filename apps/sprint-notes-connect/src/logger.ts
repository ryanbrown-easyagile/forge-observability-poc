import winston, {Logger} from 'winston';
import morgan from 'morgan';
import { Express, Request } from 'express';

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
    

export function initialiseExpressLogger(app: Express) { 
  // Log requests, using an appropriate formatter by env
  const devEnv = app.get('env') === 'development';
    const morganConfig = { stream: { write: (message : string) => getLogger().info(message.trim()) } };
  if (!devEnv) {
    app.use(morgan('dev', morganConfig));
  } else {
    app.use(
      morgan('combined', morganConfig)
    );
  }
  morgan.token('url', redactJwtTokens);
  getLogger().info('Express logger initialised');
}

function redactJwtTokens(req: Request) {
  const url = req.originalUrl || req.url || '';
  const params = new URLSearchParams(url);
  let redacted = url;
  params.forEach((value, key) => {
    if (key.toLowerCase() === 'jwt') {
      redacted = redacted.replace(value, 'redacted');
    }
  });
  return redacted;
}
