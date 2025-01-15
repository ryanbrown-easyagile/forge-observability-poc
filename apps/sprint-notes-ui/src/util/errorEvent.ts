import { createEvent } from 'react-event-hook';

export const { useErrorOccurredListener, emitErrorOccurred } = createEvent(
  'errorOccurred'
)<string | Error>();
