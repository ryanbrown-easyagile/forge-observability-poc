import { useEffect, useState } from 'react';
import { NoteType } from './type';
import { Note } from './view';
import { Stack } from '@atlaskit/primitives';
import { useNoteCreatedListener } from './event';

type NoteListProps = {
    sprintId: string,
    projectId: string
}

export function NoteList(props : NoteListProps) {
    const [notes, setNotes] = useState<NoteType[]>([]);
    const refreshNotes = (projectId: string, sprintId: string) => {
        fetch(`/api/project/${projectId}/sprint/${sprintId}/notes`)
            .then(response => response.json())
            .then(data => {
                setNotes(data.notes);
            });
    }

    useNoteCreatedListener((note) => {
        refreshNotes(props.projectId, props.sprintId);
    });

    useEffect(() => {
        refreshNotes(props.projectId, props.sprintId);
    }, [props.projectId, props.sprintId]);
    return (
        <Stack>
            {
                notes.map(note => (
                    <Note key={note.id} note={note} />
                ))
            }
        </Stack>
    );
}