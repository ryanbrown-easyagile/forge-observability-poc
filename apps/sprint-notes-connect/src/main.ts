
import { setupTracing } from './tracer';
setupTracing('ea-notes-connect');

import express from 'express';

import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import ace from 'atlassian-connect-express';

import hbs from 'hbs';

import http from 'http';
import path from 'path';
import os from 'os';
import helmet from 'helmet';
import nocache from 'nocache';

import routes from './routes';
import { info, initialiseExpressLogger } from './logger';

import pg from 'pg';
import longjohn from 'longjohn';

// if(process.env.NODE_ENV !== 'production') {
//   require('pg');
//   require('longjohn');
// }

// Bootstrap Express and atlassian-connect-express
const app = express();
const fileNames = {
  descriptorFilename: path.join(__dirname, 'atlassian-connect.json'),
    configFileName: path.join(__dirname, 'config.json')
}
const addon = ace(app, undefined, undefined, fileNames);
// See config.json
const port = addon.config.port();
app.set('port', port);

initialiseExpressLogger(app);

// Configure Handlebars
const viewsDir = path.join(__dirname, 'views');
hbs.registerPartials(viewsDir);
app.engine('hbs', hbs.__express);
app.set('view engine', 'hbs');
app.set('views', viewsDir);

// Atlassian security policy requirements
// http://go.atlassian.com/security-requirements-for-cloud-apps
// HSTS must be enabled with a minimum age of at least one year
app.use(helmet.hsts({
  maxAge: 31536000,
  includeSubDomains: false
}));
app.use(helmet.referrerPolicy({
  policy: ['origin']
}));

// Include request parsers
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());

// Include atlassian-connect-express middleware
app.use(addon.middleware());

// Mount the static files directory
const staticDir = path.join(__dirname, 'assets');
app.use(express.static(staticDir));
app.use('/atlassian-connect.json', express.static(fileNames.descriptorFilename));

// Atlassian security policy requirements
// http://go.atlassian.com/security-requirements-for-cloud-apps
app.use(nocache());

// Wire up routes
routes(app, addon);

// Boot the HTTP server
http.createServer(app).listen(port, () => {
  info('App server running at http://' + os.hostname() + ':' + port);
  // Enables auto registration/de-registration of app into a host in dev mode
  // if (devEnv) addon.register();
});