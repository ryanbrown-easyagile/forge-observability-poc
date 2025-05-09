import { invokeRemote } from '@forge/api';
import { kvs } from '@forge/kvs';
import SqlNotesRepository from '../data/sql/notesRepository';
import EntityNotesRepository from '../data/entity/notesRepository';
import { pushToNoteMigrationQueue } from './helper';

export async function migrateData(page: number, pageSize: number) {
    const response = await invokeRemote("notes-service", {
        path: `/api/notes?page=${page}&pageSize=${pageSize}`,
        method: "GET",
    });
    
    const body = await response.json() as {result: any[], nextPage?: number};
    const notes : Note[] = body.result.map((note) => {
        return {
            id: note.id,
            projectKey: note.projectKey,
            sprintId: note.sprintId,
            content: note.content,
            title: note.title,
            dateCreated: new Date(note.dateCreated),
            author: note.author
        }
    });
    console.log(`Migrating ${notes.length} notes from page ${page}`);
    if (notes.length === 0) {
        return;
    }
    await SqlNotesRepository.bulkAddNotes(notes);
    await EntityNotesRepository.bulkAddNotes(notes);
    console.log(`Migrated ${notes.length} notes from page ${page}`);
    if(body.nextPage) {
        pushToNoteMigrationQueue(body.nextPage);
    }
    else {
        kvs.set<boolean>('notes:migrated', true);
    }
}