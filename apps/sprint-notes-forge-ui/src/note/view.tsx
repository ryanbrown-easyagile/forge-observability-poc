import { Stack, Text } from '@atlaskit/primitives';
import Heading from '@atlaskit/heading';
import { NoteType } from './type';
import Avatar from '@atlaskit/avatar';
import Comment, { CommentAuthor, CommentTime } from '@atlaskit/comment';
import { useEffect, useState } from 'react';
import { getUser, User } from '../services/userService';

type NoteProps = {
  note: NoteType;
};

export function Note({ note }: NoteProps) {
  const [user, setUser] = useState<User | undefined>(undefined);

  useEffect(() => {
    getUser(note.author)
      .then((user) => {
        setUser(user);
      })
  }, [note.author]);

  return (
    // <Stack>
    //   <Heading size="medium" as="h2">
    //     {note.title}
    //   </Heading>
    //   <Text>{note.content}</Text>
    // </Stack>
    <Comment
      avatar={
        <Avatar
          name={user ? user.displayName : 'unknown'}
          src={user ? user.avatarUrls['48x48'] : undefined}
          size="small"
        />
      }
      author={
        <CommentAuthor>{user ? user.displayName : 'unknown'}</CommentAuthor>
      }
      type="author"
      time={<CommentTime>{note.dateCreated}</CommentTime>}
      content={
        <Stack>
          <Heading size="small" as="h3">
            {note.title}
          </Heading>
          <Text>{note.content}</Text>
        </Stack>
      }
    ></Comment>
  );
}
