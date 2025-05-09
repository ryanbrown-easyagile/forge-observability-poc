import { runSchemaMigrations } from './data/sql/migrations';
import { kvs } from '@forge/kvs';
import { pushToNoteMigrationQueue } from './queue/helper';
import Resolver from '@forge/resolver';
import { resolveQueueHandlers } from './queue/listener';
import sqlNoteRepo, { explainGetNotes } from './data/sql/notesRepository';
import entityStoreRepo from './data/entity/notesRepository';
import { performance } from 'perf_hooks';

const resolver = new Resolver();
const defaultRepo = entityStoreRepo;

export async function doMigration() {
  const migrations = await runSchemaMigrations();
  if (migrations.statusCode !== 200) {
    return migrations;
  }
  const hasMigratedNotes = await kvs.get<boolean>('notes:migrated');
  if (hasMigratedNotes === false) {
    pushToNoteMigrationQueue(0);
  }
  return migrations;
}

resolveQueueHandlers(resolver);

resolver.define('resetData', async ({ context, payload }) => {
    await Promise.all([
        entityStoreRepo.clearNotes(),
        sqlNoteRepo.clearNotes()
    ]);
    await kvs.set('notes:migrated', false);
    pushToNoteMigrationQueue(0);
});

resolver.define('getDbSize', async ({ context, payload }) => {
    const sqlResult = await sqlNoteRepo.count();
    const entityResult = await entityStoreRepo.count();
    return [
        { name: 'sql', size: sqlResult },
        { name: 'entity', size: entityResult },
    ]
});

resolver.define('getNotesViaStorage', async ({ context, payload }) => {
  console.log('Getting notes via storage:', payload);
  let sprintId : number = payload.sprintId;
  if (typeof sprintId === 'string') {
    sprintId = parseInt(sprintId);
  }
  
  return {
    sprintId: sprintId,
    projectId: payload.projectId,
    notes: await defaultRepo.getNotesForSprint(
      sprintId,
      payload.projectId
    ),
  };
});

resolver.define('testNotesRetrieval', async ({ context, payload }) => {
    let sprintId : number = payload.sprintId;
    if (typeof sprintId === 'string') {
        sprintId = parseInt(sprintId);
    }
    
    const beforeSql = performance.now();
    const sqlResult = await sqlNoteRepo.getNotesForSprint(sprintId, payload.projectId);
    const afterSql = performance.now();
    const sqlDuration = afterSql - beforeSql;

    const beforeEntity = performance.now();
    const entityResult = await entityStoreRepo.getNotesForSprint(sprintId, payload.projectId);
    const afterEntity = performance.now();
    const entityDuration = afterEntity - beforeEntity;
        
    return {
        sql: {
            count: sqlResult.length,
            duration: sqlDuration
        },
        entity: {
            count: entityResult.length,
            duration: entityDuration
        },
    } 
});

resolver.define('explainNotesRetrieval', async ({ context, payload }) => {
    let sprintId : number = payload.sprintId;
    if (typeof sprintId === 'string') {
        sprintId = parseInt(sprintId);
    }

    return await explainGetNotes(sprintId, payload.projectId);
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
  defaultRepo.addNote(newNote);

  return newNote;
});
export const handler = resolver.getDefinitions();
