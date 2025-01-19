import { NoteType } from "../note/type";
import { NoteList, NoteService } from "./noteService";
import { invokeRemote } from "@forge/bridge";

type RemoteResponse<T> = {
  body: T,
  status: number,
  headers: Record<string, string>
}

export class RemoteNoteService implements NoteService {
  async getNotes(projectId: string, sprintId: number): Promise<NoteList> {
    return invokeRemote<RemoteResponse<NoteList>>({
      path: `/api/project/${projectId}/sprint/${sprintId}/notes`,
      method: "GET",
    }).then(response => {
      const traceId = response.headers['x-trace-id'];
      console.log(`getNotes complete, trace: ${traceId}`)
      return response.body;
    });
  }

  async saveNote(
    projectId: string,
    sprintId: number,
    note: NoteType
  ): Promise<NoteType> {
    return invokeRemote<RemoteResponse<NoteType>>({
        path: `/api/project/${projectId}/sprint/${sprintId}/notes`,
        method: "POST", 
        body: note,
        headers: {
          'Content-Type': 'application/json',
        },
      }).then(response => {
        console.log(`postNotes complete, trace: ${response.headers['x-trace-id']}`)
        return response.body;
      });
  }
}
