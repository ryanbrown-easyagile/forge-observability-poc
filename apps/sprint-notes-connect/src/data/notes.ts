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

type Page<T> = {
  result: T[];
  total: number;
  page: number;
  pageSize: number;
  nextPage?: number;
}

export async function getAllNotesByInstallationId(
  installationId: string,
  page = 0,
  pageSize = 10
): Promise<Page<Note>> {
  const [notes, count] = await dataSource.manager.findAndCount(Note, {
    where: {
      installationId
    },
    take: pageSize,
    skip: page * pageSize
  });

  const maximumPages = Math.ceil(count / pageSize);
  console.log("Max pages:", maximumPages)
  let nextPage: number | undefined = page + 1;
  if (nextPage >= maximumPages) {
    console.log("Exceeded max-pages:", nextPage)
    nextPage = undefined;
  }

  return {
    result: notes,
    total: count,
    page,
    pageSize,
    nextPage
  }
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
