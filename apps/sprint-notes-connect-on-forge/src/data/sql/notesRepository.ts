import sql from '@forge/sql';
import { NotesRepository } from '../interface';

type NoteDto = Omit<Note, 'dateCreated'> & {
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
  deleteNote: async function (noteId: number): Promise<void> {
    await sql
      .prepare(`DELETE FROM Notes WHERE id = ?`)
      .bindParams(noteId)
      .execute();
  },
  bulkAddNotes: async function (notes: Note[]): Promise<void> {
    notes.forEach(async (note) => {
        await this.addNote(note);
    });
  },
};

function toDto(note: Note): NoteDto {
  return {
    ...note,
    dateCreated: note.dateCreated.toISOString(),
  };
}

function toNote(dto: NoteDto): Note {
  return {
    ...dto,
    dateCreated: new Date(dto.dateCreated),
  };
}

export default SqlNotesRepository;
