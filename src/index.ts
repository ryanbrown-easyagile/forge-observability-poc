import Resolver from '@forge/resolver';
import { invokeRemote } from "@forge/api";

const resolver = new Resolver();

resolver.define('getNotesViaRemote', async ({context, payload}) => {
    console.log('Fetching notes for project', payload.projectId, 'and sprint', payload.sprintId);
    const res = await invokeRemote("notes-service", {
      path: `/api/project/${payload.projectId}/sprint/${payload.sprintId}/notes`,
      method: "GET"
    })

    if (res.ok) {
      return res.json();
    }
    else {
      throw new Error(`Failed to fetch notes: ${res.status}`);
    }
});

resolver.define('saveNotesViaRemote', async ({context, payload}) => {
  if(!payload.note || !payload.note.title || !payload.note.content) {
    throw new Error("Note title and content are required");
  }

  console.log(`Saving note for project ${payload.projectId} and sprint ${payload.sprintId}: ${JSON.stringify(payload.note)}`);

  const res = await invokeRemote("notes-service", {
    path: `/api/project/${payload.projectId}/sprint/${payload.sprintId}/notes`,
    method: "POST", 
    body: JSON.stringify(payload.note),
    headers: {
      'Content-Type': 'application/json',
    },
  })

  if (res.ok) {
    return res.json();
  }
  else {
    throw new Error(`Failed to save notes: ${res.status}`);
  }
});


export const handler = resolver.getDefinitions();