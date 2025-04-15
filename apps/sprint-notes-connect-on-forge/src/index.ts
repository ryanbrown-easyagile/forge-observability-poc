import { runSchemaMigrations } from './data/sql/migrations';
import { kvs } from '@forge/kvs';
import { pushToNoteMigrationQueue } from './queue/helper';
import Resolver from '@forge/resolver';
import { resolveQueueHandlers } from './queue/listener';
import noteRepo from './data/sql/notesRepository';

const resolver = new Resolver();

export async function doMigration() {
  const migrations = await runSchemaMigrations();
  if (migrations.statusCode !== 200) {
    return migrations;
  }
  const hasMigratedNotes = await kvs.get<boolean>('notes:migrated');
  if (!hasMigratedNotes) {
    pushToNoteMigrationQueue(0);
  }
  return migrations;
}

resolveQueueHandlers(resolver);

resolver.define('getNotesViaStorage', async ({ context, payload }) => {
  console.log('Getting notes via storage');
  return {
    sprintId: payload.sprintId,
    projectId: payload.projectId,
    notes: await noteRepo.getNotesForSprint(
      payload.sprintId,
      payload.projectId
    ),
  };
});

resolver.define('saveNotesViaStorage', async ({ context, payload }) => {
  const newNote = {
    title: payload.note.title,
    content: payload.note.content,
    sprintId: payload.sprintId,
    projectKey: payload.projectId,
    author: context.accountId,
    dateCreated: new Date(),
  };
  console.log('Saving notes via storage:', newNote);
  noteRepo.addNote(newNote);

  return newNote;
});
export const handler = resolver.getDefinitions();
