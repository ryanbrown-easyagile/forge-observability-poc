import { useEffect, useState } from 'react';
import { NoteType } from './type';
import { Note } from './view';
import { Stack } from '@atlaskit/primitives';
import { useNoteCreatedListener } from './event';
import { useSprintChangedListener } from '../sprint';
import { invoke } from '@forge/bridge';

type NoteListProps = {
  sprintId: number;
  projectId: string;
};

type NoteList = {
  notes: NoteType[];
}

export function NoteList(props: NoteListProps) {
  const [notes, setNotes] = useState<NoteType[]>([]);
  const [sprintId, setSprintId] = useState(props.sprintId);
  
  useSprintChangedListener((sprintId) => {
    setSprintId(sprintId);
  });

  const refreshNotes = (projectId: string, sprintId: number) => {
    invoke('getNotes', { projectId, sprintId })
      .then((data) => {
        setNotes((data as NoteList).notes);
      });
  };

  useNoteCreatedListener(() => {
    refreshNotes(props.projectId, sprintId);
  });

  useEffect(() => {
    refreshNotes(props.projectId, sprintId);
  }, [props.projectId, sprintId]);
  return (
    <Stack>
      {notes.map((note) => (
        <Note key={note.id} note={note} />
      ))}
    </Stack>
  );
}
