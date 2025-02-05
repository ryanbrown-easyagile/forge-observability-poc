import { ForgeToken, validateRequest } from '../../auth';
import { createNote, getNotes } from '../../data/notes';
import { error } from '../../logger';
import { Express, Request, Router } from 'express';
import { Note } from '../../model/notes';

type AuthenticatedRequest = Request & {
  authToken: ForgeToken;
};

export async function routes(app: Express) {
  const apiRoute = Router();
  apiRoute.use(async (req, res, next) => {
    const context = await validateRequest(req);
    if (!context.isValid) {
      error('Request token validation failed: ', context.failureReason);
      res.status(401).json({ msg: 'Unauthorized' });
      return;
    }
    if (context.token) {
      (req as AuthenticatedRequest).authToken = context.token;
    }
    next();
  });
  app.use('/api', apiRoute);

  apiRoute.get(
    '/project/:projectKey/sprint/:sprintId/notes',
    async (req, res) => {
      const { projectKey, sprintId } = req.params;
      if (!projectKey) {
        res.status(400).json({ msg: 'Project Key is required' });
        return;
      }
      if (!sprintId) {
        res.status(400).json({ msg: 'Sprint ID is required' });
        return;
      }

      const sprintIdValue = parseInt(sprintId);
      if (isNaN(sprintIdValue)) {
        res.status(400).json({ msg: 'Sprint ID must be a number' });
        return;
      }

      const token = (req as unknown as AuthenticatedRequest).authToken;
      const clientKey = token.app.installationId;
      if (!clientKey) {
        res.status(400).json({ msg: 'Installation ID is required' });
        return;
      }

      getNotes(clientKey, projectKey, sprintIdValue)
        .then((notes) => res.send(notes))
        .catch((err) => {
          error(err);
          res.status(500).json({ msg: 'Failed to get notes' });
        });
    }
  );

  apiRoute.post(
    '/project/:projectKey/sprint/:sprintId/notes',
    async (req, res) => {
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
      const token = (req as unknown as AuthenticatedRequest).authToken;
      const clientKey = token.app.installationId;
      createNote(
        new Note({
          sprintId,
          clientKey,
          projectKey,
          title: req.body.title,
          content: req.body.content,
          dateCreated: new Date(),
          author: token.principal,
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
