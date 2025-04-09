import { Stack, Text } from '@atlaskit/primitives';
import Heading from '@atlaskit/heading';
import { NoteType } from './type';
import Avatar from '@atlaskit/avatar';
import Comment, {
  CommentAuthor,
  CommentTime,
} from '@atlaskit/comment';
import { useEffect, useState } from 'react';

type NoteProps = {
  note: NoteType;
};

type User = {
  accountId: string;
  accountType: string;
  active: boolean;
  avatarUrls: {
    '16x16': string;
    '24x24': string;
    '32x32': string;
    '48x48': string;
  };
  displayName: string;
  emailAddress: string;
};

export function Note({ note }: NoteProps) {
  const [user, setUser] = useState<User | undefined>(undefined);

  useEffect(() => {
    AP.request({
      url: `/rest/api/2/user?accountId=${note.author}`,
      type: 'GET',
      contentType: 'application/json',
    })
      .then((response) => {
        const user = JSON.parse(response.body) as User;
        console.log('User:', user);
        setUser(user);
      })
      .catch((error) => {
        console.error('Error fetching user:', error);
      });
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
          src={user ? user.avatarUrls['16x16'] : undefined}
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
