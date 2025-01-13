import { Content, Main, PageLayout } from '@atlaskit/page-layout';
import { NoteForm, NoteList } from '../note';
import { useAgileState } from '../util/hooks';
import { Box, Stack } from '@atlaskit/primitives';
import PageHeader from '@atlaskit/page-header';
import { Events } from './events';

export function App() {
  const agileState = useAgileState();

  const getContent = () => {
    if (!agileState.projectId || !agileState.sprintId) {
      return <div>Project or sprint not provided</div>;
    }
    return (
      <Stack>
        <NoteForm projectId={agileState.projectId} sprintId={agileState.sprintId} />
        <NoteList projectId={agileState.projectId} sprintId={agileState.sprintId} />
      </Stack>
    );
  };

  return (
    <PageLayout>
      <Content>
        <Main>
          <Box padding="space.400">
            <PageHeader>Sprint Notes</PageHeader>
            {getContent()}
          </Box>
        </Main>
      </Content>
      <Events />
    </PageLayout>
  );
}

export default App;
