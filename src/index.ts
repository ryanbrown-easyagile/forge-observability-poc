import Resolver from '@forge/resolver';
import { invokeRemote } from "@forge/api";

const resolver = new Resolver();

resolver.define('getNotes', async ({context, payload}) => {
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

resolver.define('saveNotes', async ({context, payload}) => {
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