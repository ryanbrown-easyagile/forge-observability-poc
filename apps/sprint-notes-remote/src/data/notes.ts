import { NoteList, Note } from '../model/notes';
import { dataSource } from './datasource';

export async function getNotes(
  clientKey: string,
  projectKey: string,
  sprintId: number
): Promise<NoteList> {
  const notes = await dataSource.manager.find(Note, {
    where: {
      sprintId,
      clientKey,
      projectKey,
    },
  });
  return {
    sprintId,
    notes,
  };
}

export async function createNote(Note: Note): Promise<Note> {
  return await dataSource.manager.save(Note);
}
