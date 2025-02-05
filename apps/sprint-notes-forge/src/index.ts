import Resolver from "@forge/resolver";
import { invokeRemote } from "@forge/api";
import { storage } from "@forge/api";
import { randomBytes } from "crypto";
import { generateSpan, initTracing } from "./tracing";

const resolver = new Resolver();

resolver.define("getNotesViaStorage", async ({ context, payload }) => {
  initTracing();
  const span = generateSpan("getNotesViaStorage").start({
    projectId: payload.projectId,
    sprintId: payload.sprintId,
  });
  try {
    console.log("Getting notes via storage");
    const getNotes = async (
      projectId: string,
      sprintId: number,
      cursor?: string
    ) => {
      const notePromise = storage
        .entity<{ title: string; content: string }>("note")
        .query()
        .index("by-project-and-sprint", {
          partition: [payload.projectId, payload.sprintId],
        });

      if (cursor) {
        notePromise.cursor(cursor);
      }

      const result = await notePromise.getMany();
      const notes = result.results.map((note) => note.value);
      if (result.nextCursor) {
        notes.concat(await getNotes(projectId, sprintId, result.nextCursor));
      }
      return notes;
    };
    span.end();
    return {
      sprintId: payload.sprintId,
      projectId: payload.projectId,
      notes: await getNotes(payload.projectId, payload.sprintId),
    };
  } catch (e) {
    console.error("Failed to get notes: " + e);
    span.end(e);
    throw e;
  }
});

resolver.define("saveNotesViaStorage", async ({ context, payload }) => {
  initTracing();
  const span = generateSpan("saveNotesViaStorage").start({
    projectId: payload.projectId,
    sprintId: payload.sprintId,
  });
  
  try {
    const newNote = {
      title: payload.note.title,
      content: payload.note.content,
      sprintId: payload.sprintId,
      projectId: payload.projectId,
    };
    console.log("Saving notes via storage: " + JSON.stringify(newNote));
    const key = randomBytes(16).toString("hex");
    await storage
      .entity<{
        title: string;
        content: string;
        sprintId: number;
        projectId: string;
      }>("note")
      .set(key, newNote);
    span.end();
    return newNote;
  } catch (e) {
    console.error("Failed to save note: " + e);
    span.end(e);
    throw new Error("Failed to save note");
  }
});

resolver.define("getNotesViaRemote", async ({ context, payload }) => {
  console.log("Getting notes via remote");
  console.log(
    "Fetching notes for project",
    payload.projectId,
    "and sprint",
    payload.sprintId
  );
  const res = await invokeRemote("notes-service", {
    path: `/api/project/${payload.projectId}/sprint/${payload.sprintId}/notes`,
    method: "GET",
  });

  if (res.ok) {
    return res.json();
  } else {
    throw new Error(`Failed to fetch notes: ${res.status}`);
  }
});

resolver.define("saveNotesViaRemote", async ({ context, payload }) => {
  console.log("Saving notes via remote");
  if (!payload.note || !payload.note.title || !payload.note.content) {
    throw new Error("Note title and content are required");
  }

  console.log(
    `Saving note for project ${payload.projectId} and sprint ${
      payload.sprintId
    }: ${JSON.stringify(payload.note)}`
  );

  const res = await invokeRemote("notes-service", {
    path: `/api/project/${payload.projectId}/sprint/${payload.sprintId}/notes`,
    method: "POST",
    body: JSON.stringify(payload.note),
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (res.ok) {
    return res.json();
  } else {
    throw new Error(`Failed to save notes: ${res.status}`);
  }
});

const handler = resolver.getDefinitions() as any;

export { handler as default };
