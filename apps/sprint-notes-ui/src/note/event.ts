import { createEvent } from 'react-event-hook';
import { NoteType } from './type';

export const { useNoteCreatedListener, emitNoteCreated } =
  createEvent('noteCreated')<NoteType>();
