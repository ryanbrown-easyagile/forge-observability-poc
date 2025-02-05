import { AddOn } from 'atlassian-connect-express';
import { Express, Request, Router } from 'express';
import { createNote, getNotes } from './data/notes';
import { AceRequest } from './types';
import { Note } from './model/notes';
import { error, info } from './logger';
import { getCurrentTraceInfo } from './tracer';

export default function routes(app: Express, addon: AddOn) {
  app.use((req, res, next) => {
    res.setHeader(
      'Content-Security-Policy',
      "script-src https://connect-cdn.atl-paas.net 'self' 'unsafe-inline' 'unsafe-eval'; style-src https://connect-cdn.atl-paas.net 'self' 'unsafe-inline'; img-src 'self' data:; connect-src https://rbrown-otel.ngrok.app 'self'; frame-src 'self';"
    );
    next();
  });

  // Redirect root path to /atlassian-connect.json,
  // which will be served by atlassian-connect-express.
  app.get('/', (req, res) => {
    res.redirect('/atlassian-connect.json');
  });

  app.get('/notes', addon.authenticate(), (req, res) => {
    const traceInfo = getCurrentTraceInfo();
    res.render(
      'notes.hbs', // change this to 'hello-world.jsx' to use the Atlaskit & React version
      {
        title: 'Sprint Notes by Easy Agile',
        traceId: traceInfo?.traceId,
        spanId: traceInfo?.spanId,
        traceFlags: traceInfo?.traceFlags.toString().padStart(2, '0'),
      }
    );
  });

  type NotePathParams = { projectKey: string; sprintId: string };
  type NoteResponseBody = Note | { msg: string };
  type NoteRequestBody = { title: string; content: string };
  const apiRoute = Router();
  apiRoute.use(addon.authenticate(true));
  apiRoute.use((req, res, next) => {
    const traceInfo = getCurrentTraceInfo();
    if(traceInfo) {
      res.setHeader('X-B3-TraceId', traceInfo?.traceId);
      res.setHeader('X-B3-SpanId', traceInfo?.spanId);
      res.setHeader('X-B3-Flags', traceInfo?.traceFlags.toString());
    }
    next();
  });
  app.use('/api', apiRoute);

  apiRoute.get(
    '/project/:projectKey/sprint/:sprintId/notes',
    async (req, res) => {
      info('GET Notes with Headers', JSON.stringify(req.headers));
      if (!req.params.projectKey) {
        res.status(400).json({ msg: 'Project Key is required' });
        return;
      }
      const projectId = req.params.projectKey;
      if (!req.params.sprintId) {
        res.status(400).json({ msg: 'Sprint ID is required' });
        return;
      }
      const sprintId = parseInt(req.params.sprintId);
      if (isNaN(sprintId)) {
        res.status(400).json({ msg: 'Sprint ID must be a number' });
        return;
      }
      const aceRequest = req as AceRequest<
        NotePathParams,
        NoteResponseBody,
        unknown
      >;
      const clientKey = aceRequest.context.clientKey;
      getNotes(clientKey, projectId, sprintId)
        .then((notes) => res.json(notes))
        .catch((err) => {
          error(err);
          res.status(500).json({ msg: 'Failed to get notes' });
        });
    }
  );

  apiRoute.post(
    '/project/:projectKey/sprint/:sprintId/notes',
    async (
      req: Request<NotePathParams, NoteResponseBody, NoteRequestBody>,
      res
    ) => {
      if (!req.params.projectKey) {
        res.status(400).json({ msg: 'Project ID is required' });
        return;
      }
      const projectKey = req.params.projectKey;
      if (!req.params.sprintId) {
        res.status(400).json({ msg: 'Sprint ID is required' });
        return;
      }
      const sprintId = parseInt(req.params.sprintId);
      if (isNaN(sprintId)) {
        res.status(400).json({ msg: 'Sprint ID must be a number' });
        return;
      }
      const aceRequest = req as AceRequest<
        NotePathParams,
        NoteResponseBody,
        NoteRequestBody
      >;
      const clientKey = aceRequest.context.clientKey;
      createNote(
        new Note({
          sprintId,
          clientKey,
          projectKey,
          title: req.body.title,
          content: req.body.content,
          dateCreated: new Date(),
          author: aceRequest.context.userAccountId ?? 0,
        })
      )
        .then((note) => res.json(note))
        .catch((err) => {
          error(err);
          res.status(500).json({ msg: 'Failed to create note' });
        });
    }
  );
}
