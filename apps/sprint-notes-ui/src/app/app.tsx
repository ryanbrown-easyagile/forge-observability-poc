import { Content, Main, PageLayout } from '@atlaskit/page-layout';
import { NoteForm, NoteList } from '../note';
import { useProjectId, useSprintId } from '../util/hooks';
import { Box, Stack } from '@atlaskit/primitives';
import PageHeader from '@atlaskit/page-header';
import { Events } from './events';

export function App() {
  const projectId = useProjectId();
  const sprintId = useSprintId();

  const getContent = () => {
    if (!projectId || !sprintId) {
      return <div>Project or sprint not provided</div>;
    }
    return (
      <Stack>
        <NoteForm projectId={projectId} sprintId={sprintId} />
        <NoteList projectId={projectId} sprintId={sprintId} />
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
