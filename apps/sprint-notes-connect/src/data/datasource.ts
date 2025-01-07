import {
  AbstractLogger,
  DataSource,
  LogLevel,
  LogMessage,
  QueryRunner,
} from 'typeorm';
import { Note } from '../model/notes';
import { info, warn, error } from '../logger';

class WinstonLogger extends AbstractLogger {
  protected override writeLog(
    level: LogLevel,
    logMessage: LogMessage | LogMessage[],
    _queryRunner?: QueryRunner
  ) {
    console.log("Writing log", logMessage);
    const messages = this.prepareLogMessages(logMessage, {
      highlightSql: false,
    });

    for (const message of messages) {
      switch (message.type ?? level) {
        case 'log':
        case 'schema-build':
        case 'migration':
          info(message.message.toString());
          break;

        case 'info':
        case 'query':
          if (message.prefix) {
            info(message.prefix, message.message);
          } else {
            info(message.message.toString());
          }
          break;

        case 'warn':
        case 'query-slow':
          if (message.prefix) {
            warn(message.prefix, message.message);
          } else {
            warn(message.message.toString());
          }
          break;

        case 'error':
        case 'query-error':
          if (message.prefix) {
            error(message.prefix, message.message);
          } else {
            error(message.message.toString());
          }
          break;
      }
    }
  }
  
}

export const dataSource: DataSource = new DataSource({
  type: 'postgres',
  entities: [Note],
  url: process.env.DATABASE_URL,
  maxQueryExecutionTime: 5000,
  logger: new WinstonLogger(),
  synchronize: true,
});
