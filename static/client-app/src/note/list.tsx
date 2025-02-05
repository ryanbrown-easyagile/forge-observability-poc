import { useEffect, useState } from "react";
import { NoteType } from "./type";
import { Note } from "./view";
import { Stack } from "@atlaskit/primitives";
import { useNoteCreatedListener } from "./event";
import { useSprintChangedListener } from "../sprint";
import { NoteService } from "../services/noteService";

type NoteListProps = {
  sprintId: number;
  projectId: string;
  noteService: NoteService;
};

export function NoteList(props: NoteListProps) {
  const [notes, setNotes] = useState<NoteType[]>([]);
  const [sprintId, setSprintId] = useState(props.sprintId);

  useSprintChangedListener((sprintId) => {
    setSprintId(sprintId);
  });

  const refreshNotes = (
    projectId: string,
    sprintId: number,
    noteService: NoteService
  ) => {
    if (sprintId && projectId) {
      noteService.getNotes(projectId, sprintId).then((data) => {
        setNotes(data.notes);
      });
    }
  };

  useNoteCreatedListener(() => {
    refreshNotes(props.projectId, sprintId, props.noteService);
  });

  useEffect(() => {
    refreshNotes(props.projectId, sprintId, props.noteService);
  }, [props.projectId, sprintId, props.noteService]);
  return (
    <Stack>
      {notes.map((note) => (
        <Note key={note.id} note={note} />
      ))}
    </Stack>
  );
}
