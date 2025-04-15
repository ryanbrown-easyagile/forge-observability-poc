export interface NotesRepository {
    getNotesForSprint: (sprintId: number, projectKey: string) => Promise<Note[]>;
    addNote: (note: Note) => Promise<void>;
    updateNote: (note: Note) => Promise<void>;
    deleteNote: (noteId: number) => Promise<void>;
    bulkAddNotes: (notes: Note[]) => Promise<void>;
}