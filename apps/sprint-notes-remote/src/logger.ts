import winston, { Logger } from 'winston';
import expressWinston from 'express-winston';
import { OpenTelemetryTransportV3 } from '@opentelemetry/winston-transport';
import { Express } from 'express';

let _logger: Logger;
function getLogger() {
  if (!_logger) {
    const isProduction = process.env.NODE_ENV === 'production';
    const transport: winston.transport = isProduction
      ? new OpenTelemetryTransportV3()
      : new winston.transports.Console();
    _logger = winston.createLogger({
      transports: [transport],
    });
  }
  return _logger;
}

export function info(message: string, ...optionalParams: any[]) {
  getLogger().info(message, ...optionalParams);
}

export function error(message: string | Error, ...optionalParams: any[]) {
  if (message instanceof Error) {
    getLogger().error(message);
  } else {
    getLogger().error(message, ...optionalParams);
  }
}

export function warn(message: string, ...optionalParams: any[]) {
  getLogger().warn(message, ...optionalParams);
}

export function debug(message: string, ...optionalParams: any[]) {
  getLogger().debug(message, ...optionalParams);
}

export function initialiseExpressLogger(app: Express) {
  // Log requests, using an appropriate formatter by env
  app.use(
    expressWinston.logger({
      winstonInstance: getLogger(),
      meta: true,
      msg: 'Request Received {{req.method}} {{req.path}}',
      requestWhitelist: [
        'url',
        'headers',
        'method',
        'httpVersion',
        'originalUrl',
        'query',
      ],
      headerBlacklist: ['authorization'],
      requestFilter: (req, propName) => {
        if (propName === 'url' || propName === 'originalUrl') {
          return redactJwtTokens(req[propName]);
        }
        if (propName === 'query' && req[propName].jwt) {
          req[propName].jwt = 'redacted';
        }
        return req[propName];
      },
    })
  );
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
