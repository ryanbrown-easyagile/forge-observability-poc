import sql from '@forge/sql';
import { NotesRepository } from '../interface';

type NoteDto = Omit<Note, 'dateCreated' | 'id'> & {
  id?: number;
  dateCreated: string;
};

const SqlNotesRepository: NotesRepository = {
  getNotesForSprint: async function (
    sprintId: number,
    projectKey: string
  ): Promise<Note[]> {
    const notes = await sql
      .prepare<NoteDto>(
        `SELECT * FROM Notes WHERE sprintId = ? AND projectKey = ?`
      )
      .bindParams(sprintId, projectKey)
      .execute();
    return notes.rows.map(toNote);
  },
  addNote: async function (note: Note): Promise<void> {
    const dto = toDto(note);
    console.log('Adding note to SQL repository: ', dto);
    await sql
      .prepare(
        `INSERT INTO Notes (sprintId, projectKey, title, content, author, dateCreated) VALUES (?, ?, ?, ?, ?, ?)`
      )
      .bindParams(
        dto.sprintId,
        dto.projectKey,
        dto.title,
        dto.content,
        dto.author,
        dto.dateCreated
      )
      .execute();
  },
  updateNote: async function (note: Note): Promise<void> {
    const dto = toDto(note);
    await sql
      .prepare(
        `UPDATE Notes SET sprintId = ?, projectKey = ?, title = ?, content = ?, author = ?, dateCreated = ? WHERE id = ?`
      )
      .bindParams(
        dto.sprintId,
        dto.projectKey,
        dto.title,
        dto.content,
        dto.author,
        dto.dateCreated,
        dto.id
      )
      .execute();
  },
  deleteNote: async function (noteId: string): Promise<void> {
    await sql
      .prepare(`DELETE FROM Notes WHERE id = ?`)
      .bindParams(parseInt(noteId))
      .execute();
  },
  bulkAddNotes: async function (notes: Note[]): Promise<void> {
    console.log(`Bulk adding ${notes.length} notes to SQL repository`);
    notes.forEach(async (note) => {
      await this.addNote(note);
    });
  },
  clearNotes: async function (): Promise<void> {
    await sql.prepare(`DELETE FROM Notes`).execute();
  },
  count: async function (): Promise<number> {
    const result = await sql
      .prepare<{ count: number }>(`SELECT COUNT(*) as count FROM Notes`)
      .execute();
    return result.rows[0].count;
  },
};

type ExplainResult = {
  id: string;
  estRows: number;
  actRows: string;
  task: string;
  'access object': string;
  'execution info': string;
  'operator info': string;
  memory: string;
  disk: string;
};

export async function explainGetNotes(
  sprintId: number,
  projectKey: string
): Promise<ExplainResult[]> {
  const result = await sql
    .prepare<ExplainResult>(
      `EXPLAIN ANALYZE SELECT * FROM Notes WHERE sprintId = ? AND projectKey = ?`
    )
    .bindParams(sprintId, projectKey)
    .execute();
  return result.rows;
}

function toDto(note: Note): NoteDto {
  return {
    ...note,
    id: note.id ? parseInt(note.id) : undefined,
    dateCreated: note.dateCreated.toISOString(),
  };
}

function toNote(dto: NoteDto): Note {
  return {
    ...dto,
    id: dto.id ? dto.id.toString() : undefined,
    dateCreated: new Date(dto.dateCreated),
  };
}

export default SqlNotesRepository;
