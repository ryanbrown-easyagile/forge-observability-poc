import { Content, Main, PageLayout } from '@atlaskit/page-layout';
import { NoteForm, NoteList } from '../note';
import { useAgileState } from '../util/hooks';
import { Box, Stack } from '@atlaskit/primitives';
import { Events } from './events';
import { SprintSelector } from '../sprint/selector';
import Spinner from '@atlaskit/spinner';
import Heading from '@atlaskit/heading';

export function App() {
  const agileState = useAgileState();

  const getContent = () => {
    if (!agileState.projectId || !agileState.sprintId || !agileState.boardId) {
      return (
        <Stack
          alignBlock="center"
          alignInline="center"
          space="space.100"
          grow="fill"
        >
          <Spinner size="xlarge" />
          <Heading size="medium">Loading your notes ...</Heading>
        </Stack>
      );
    }
    return (
      <Stack>
        <SprintSelector boardId={agileState.boardId} />
        <NoteForm
          projectId={agileState.projectId}
          sprintId={agileState.sprintId}
        />
        <NoteList
          projectId={agileState.projectId}
          sprintId={agileState.sprintId}
        />
      </Stack>
    );
  };

  return (
    <PageLayout>
      <Content>
        <Main>
          <Box padding="space.400">{getContent()}</Box>
        </Main>
      </Content>
      <Events />
    </PageLayout>
  );
}

export default App;
