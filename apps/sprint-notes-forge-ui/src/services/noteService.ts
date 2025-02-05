import { NoteType } from "../note/type";

export type NoteList = {
  notes: NoteType[];
};
export interface NoteService {
  getNotes(projectId: string, sprintId: number): Promise<NoteList>;
  saveNote(
    projectId: string,
    sprintId: number,
    note: NoteType
  ): Promise<NoteType>;
}
