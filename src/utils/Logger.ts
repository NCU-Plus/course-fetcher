import { configure, getLogger } from 'log4js';

configure({
  appenders: {
    fetcher: { type: 'file', filename: './log/fetcher.log' },
    database: { type: 'file', filename: './log/database.log' },
  },
  categories: {
    default: { appenders: ['fetcher'], level: 'info' },
    database: { appenders: ['database'], level: 'info' },
  },
});

export const Logger = getLogger('fetcher');

export const DatabaseLogger = getLogger('database');
