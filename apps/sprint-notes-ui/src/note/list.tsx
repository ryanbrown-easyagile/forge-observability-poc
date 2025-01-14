import { useEffect, useState } from 'react';
import { NoteType } from './type';
import { Note } from './view';
import { Stack } from '@atlaskit/primitives';
import { useNoteCreatedListener } from './event';
import { useAtlassianJWT } from '../util/hooks';
import { useSprintChangedListener } from '../sprint';

type NoteListProps = {
  sprintId: number;
  projectId: string;
};

export function NoteList(props: NoteListProps) {
  const [notes, setNotes] = useState<NoteType[]>([]);
  const [sprintId, setSprintId] = useState(props.sprintId);
  const jwt = useAtlassianJWT();
  useSprintChangedListener((sprintId) => {
    setSprintId(sprintId);
  });

  const refreshNotes = (projectId: string, sprintId: number, jwt?: string) => {
    if (!jwt) {
      return;
    }
    fetch(`/api/project/${projectId}/sprint/${sprintId}/notes`, {
      headers: {
        Accept: 'application/json',
        Authorization: `JWT ${jwt}`,
        'Content-Type': 'application/json',
      },
    })
      .then((response) => response.json())
      .then((data) => {
        setNotes(data.notes);
      });
  };

  useNoteCreatedListener((note) => {
    refreshNotes(props.projectId, sprintId, jwt);
  });

  useEffect(() => {
    refreshNotes(props.projectId, sprintId, jwt);
  }, [props.projectId, sprintId, jwt]);
  return (
    <Stack>
      {notes.map((note) => (
        <Note key={note.id} note={note} />
      ))}
    </Stack>
  );
}
