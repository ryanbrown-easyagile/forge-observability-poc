import { Stack, Text } from '@atlaskit/primitives';
import Heading from '@atlaskit/heading';
import { NoteType } from './type';

type NoteProps = {
    note: NoteType
}

export function Note({note} : NoteProps) {
  return (
    <Stack>
      <Heading size="medium" as="h2">
        {note.title}
      </Heading>
      <Text>{note.content}</Text>
    </Stack>
  );
}
