import { NoteType } from "../note/type";
import { NoteList, NoteService } from "./noteService";
import { invoke } from "@forge/bridge";

export class RemoteViaFunctionNoteService implements NoteService {
  async getNotes(projectId: string, sprintId: number): Promise<NoteList> {
    return invoke<NoteList>("getNotesViaRemote", { projectId, sprintId });
  }
  async saveNote(
    projectId: string,
    sprintId: number,
    note: NoteType
  ): Promise<NoteType> {
    return invoke<NoteType>("saveNotesViaRemote", { projectId, sprintId, note });
  }
}
