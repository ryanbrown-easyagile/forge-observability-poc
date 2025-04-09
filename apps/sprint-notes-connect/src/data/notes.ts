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

export async function getNotesByInstallationId(
  installationId: string,
  projectKey: string,
  sprintId: number
): Promise<NoteList> {
  const notes = await dataSource.manager.find(Note, {
    where: {
      sprintId,
      installationId,
      projectKey,
    },
  });
  return {
    sprintId,
    notes,
  };
}

export async function updateInstallationIds(
  clientKey: string,
  installationId: string
) {
  const result = await dataSource
    .createQueryBuilder()
    .update(Note)
    .set({ installationId })
    .where('clientKey = :clientKey and installationId is null', { clientKey })
    .execute();
  console.log(
    `Updated ${result.affected} notes with installationId ${installationId} for clientKey ${clientKey}`)
}

export async function createNote(Note: Note): Promise<Note> {
  return await dataSource.manager.save(Note);
}
