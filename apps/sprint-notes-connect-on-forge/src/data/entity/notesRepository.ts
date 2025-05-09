import { storage } from '@forge/api';
import { NotesRepository } from '../interface';
import { randomBytes } from 'crypto';

function getEntityStore() {
  return storage.entity<NoteDto>('notes');
}

type NoteDto = Omit<Note, 'dateCreated' | 'id'> & {
  createdAt: string;
};

const EntityNotesRepository: NotesRepository = {
  getNotesForSprint: async function (
    sprintId: number,
    projectKey: string
  ): Promise<Note[]> {
    const results = await getEntityStore()
      .query()
      .index('by-project-and-sprint', {
        partition: [projectKey, sprintId],
      })
      .getMany();
    return results.results.map((result) => {
      return toNote(result.value, result.key);
    });
  },
  addNote: async function (note: Note): Promise<void> {
    try {
      const key = randomBytes(16).toString('hex');
      const dto = toDto(note);
      console.log('Adding note to Entity repository: ', key, dto);
      getEntityStore()
        .set(key, dto)
        .then(() => getEntityStore().get(key))
        .then((newNote) => {
          console.log('Added note to Entity repository: ', key, newNote);
        });
    } catch (e) {
      console.error('Failed to add note: ' + e);
      throw e;
    }
  },
  updateNote: async function (note: Note): Promise<void> {
    if (!note.id) {
      throw new Error('Note ID is required for update');
    }
    await getEntityStore().set(note.id, toDto(note));
  },
  deleteNote: async function (noteId: string): Promise<void> {
    return await getEntityStore().delete(noteId);
  },
  bulkAddNotes: async function (notes: Note[]): Promise<void> {
    console.log(`Bulk adding ${notes.length} notes to Entity repository`);
    try {
      notes.forEach(async (note) => {
        await this.addNote(note);
      });
    } catch (e) {
      console.error('Failed to bulk add notes: ' + e);
      throw e;
    }
  },
  count: async function (): Promise<number> {
    const results = await getEntityStore().query().index('by-id').getMany();
    return results.results.length;
  },
  clearNotes: async function (): Promise<void> {
    const deleteNotes = async (cursor?: string): Promise<void> => {
      const query = getEntityStore().query().index('by-id');
      if (cursor) {
        query.cursor(cursor);
      }
      const result = await query.getMany();
      const deletePromises = result.results.map(async (result) => {
        getEntityStore().delete(result.key);
      });
      await Promise.all(deletePromises);
      if (result.nextCursor) {
        return await deleteNotes(result.nextCursor);
      }
      return;
    };
    deleteNotes();
  },
};

function toDto(note: Note): NoteDto {
  const dto : NoteDto = {
    createdAt: note.dateCreated.toISOString(),
    projectKey: note.projectKey,
    sprintId: note.sprintId,
    content: note.content,
    title: note.title,
    author: note.author
  };
  return dto;
}
function toNote(dto: NoteDto, key: string): Note {
  return {
    id: key,
    projectKey: dto.projectKey,
    sprintId: dto.sprintId,
    content: dto.content,
    title: dto.title,
    dateCreated: new Date(dto.createdAt),
    author: dto.author
  };
}

export default EntityNotesRepository;
