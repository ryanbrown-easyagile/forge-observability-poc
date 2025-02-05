import { Content, Main, PageLayout } from "@atlaskit/page-layout";
import { NoteForm, NoteList } from "../note";
import { useAgileState } from "../util/hooks";
import { Box, Stack } from "@atlaskit/primitives";
import { Events } from "./events";
import { SprintSelector } from "../sprint/selector";
import Spinner from "@atlaskit/spinner";
import Heading from "@atlaskit/heading";
import { view } from "@forge/bridge";
import { useEffect } from "react";
import { NoteService } from "../services/noteService";

export function BaseApp(props: { noteService: NoteService }) {
  const agileState = useAgileState();
  useEffect(() => {
    view.theme.enable();
  }, []);

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
          noteService={props.noteService}
        />
        <NoteList
          projectId={agileState.projectId}
          sprintId={agileState.sprintId}
          noteService={props.noteService}
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

export default BaseApp;
