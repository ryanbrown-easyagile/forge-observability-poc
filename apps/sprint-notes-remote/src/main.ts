import { setupTracing } from './tracer';
setupTracing('ea-notes-remote');

import express from 'express';

import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import { routes } from './app/routes/routes';


import 'pg';
import 'reflect-metadata';
import { dataSource } from './data/datasource';
import { info } from './logger';

const port = process.env.PORT ? Number(process.env.PORT) : 6102;

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
routes(app);

dataSource.initialize().then(() => {
  app.listen(port, () => {
    info('App server running on port: ' + port);
  });
});
