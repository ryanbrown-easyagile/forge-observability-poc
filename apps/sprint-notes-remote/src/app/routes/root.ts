import { FastifyInstance } from 'fastify';
import { validateRequest } from '../../auth';

export default async function (fastify: FastifyInstance) {
  fastify.get('/', async function () {
    return { message: 'Hello API' };
  });
  fastify.get<{
    Params: { projectKey: string; sprintId: number };
  }>('/api/project/:projectKey/sprint/:sprintId/notes', async (req, res) => {
    const context = await validateRequest(req);
    if(!context.isValid) {
      console.error("Request token validation failed: ", context.failureReason);
      res.status(401).send();
      return;
    }
    const { projectKey, sprintId } = req.params;
    if (!projectKey) {
      res.status(400).send({ msg: 'Project Key is required' });
      return;
    }
    if (!sprintId) {
      res.status(400).send({ msg: 'Sprint ID is required' });
      return;
    }

    if (isNaN(sprintId)) {
      res.status(400).send({ msg: 'Sprint ID must be a number' });
      return;
    }

    // const clientKey = context.token?.app.installationId;
    // getNotes(clientKey, projectKey, sprintId)
    //   .then((notes) => res.json(notes))
    //   .catch((err) => {
    //     error(err);
    //     res.status(500).json({ msg: 'Failed to get notes' });
    //   });
  });
}
