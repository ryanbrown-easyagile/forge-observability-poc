import { AddOn } from 'atlassian-connect-express';
import { Express, Request } from 'express';
import { createNote, getNotes } from './data/notes';
import { AceRequest } from './types';
import { Note } from '@jira-observability/es-notes-domain';

export default function routes(app: Express, addon: AddOn) {
    // Redirect root path to /atlassian-connect.json,
    // which will be served by atlassian-connect-express.
    app.get('/', (req, res) => {
        res.redirect('/atlassian-connect.json');
    });

    // This is an example route used by "generalPages" module (see atlassian-connect.json).
    // Verify that the incoming request is authenticated with Atlassian Connect.
    app.get('/hello-world', addon.authenticate(), (req, res) => {
        // Rendering a template is easy; the render method takes two params: the name of the component or template file, and its props.
        // Handlebars and jsx are both supported, but please note that jsx changes require `npm run watch-jsx` in order to be picked up by the server.
        res.render(
          'hello-world.hbs', // change this to 'hello-world.jsx' to use the Atlaskit & React version
          {
            title: 'Atlassian Connect'
            //, issueId: req.query['issueId']
            //, browserOnly: true // you can set this to disable server-side rendering for react views
          }
        );
    });

    type NotePathParams = {projectKey: string, sprintId: string};
    type NoteResponseBody = Note | {msg: string};
    type NoteRequestBody = {title: string, content: string};

    app.get('/project/:projectKey/sprint/:sprintId/notes', addon.authenticate(), async (req, res) => {
      if (!req.params.projectKey) {
        res.status(400).json({msg: 'Project Key is required'});
        return;
      }
      const projectId = req.params.projectKey;
      if (!req.params.sprintId) {
        res.status(400).json({msg: 'Sprint ID is required'});
        return;
      }
      const sprintId = parseInt(req.params.sprintId);
      if (isNaN(sprintId)) {
        res.status(400).json({msg: 'Sprint ID must be a number'});
        return;
      }
      const aceRequest = req as AceRequest<NotePathParams, NoteResponseBody, unknown>;
      const clientKey = aceRequest.context.clientKey;
      res.json(getNotes(clientKey, projectId, sprintId));
    });

    app.put('/project/:projectKey/sprint/:sprintId/notes', addon.authenticate(), async (req: Request<NotePathParams, NoteResponseBody, NoteRequestBody>, res) => {
      if (!req.params.projectKey) {
        res.status(400).json({msg: 'Project ID is required'});
        return;
      }
      const projectKey = req.params.projectKey;
      if (!req.params.sprintId) {
        res.status(400).json({msg: 'Sprint ID is required'});
        return;
      }
      const sprintId = parseInt(req.params.sprintId);
      if (isNaN(sprintId)) {
        res.status(400).json({msg: 'Sprint ID must be a number'});
        return;
      }
      const aceRequest = req as AceRequest<NotePathParams, NoteResponseBody, NoteRequestBody>;
      const clientKey = aceRequest.context.clientKey;
      res.json(await createNote(new Note({
        sprintId,
        clientKey,
        projectKey,
        title: req.body.title,
        content: req.body.content,
        dateCreated: new Date(),
        author: aceRequest.context.userAccountId,
      })));
    });
}
