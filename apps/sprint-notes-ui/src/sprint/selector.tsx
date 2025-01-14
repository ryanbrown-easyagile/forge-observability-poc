import { Inline } from '@atlaskit/primitives';
import Heading from '@atlaskit/heading';
import { IconButton } from '@atlaskit/button/new';
import { useEffect, useState } from 'react';
import { emitSprintChanged } from './events';
import ChevronRightIcon from '@atlaskit/icon/utility/chevron-right';
import ChevronLeftIcon from '@atlaskit/icon/utility/chevron-left';

type Sprint = {
  id: number;
  self: string;
  state: string;
  name: string;
  startDate: string;
  endDate: string;
  completeDate: string;
  originBoardId: number;
  goal: string;
  previousSprint: Sprint | null;
  nextSprint: Sprint | null;
};
async function getSprints(boardId: string, startAt = 0): Promise<Sprint[]> {
  const fetchSprints = async (
    boardId: string,
    startAt: number,
    sprints: Sprint[] = []
  ) => {
    return AP.request(
      `/rest/agile/1.0/board/${boardId}/sprint?startAt=${startAt}&maxResults=50`
    ).then((response): Promise<Sprint[]> => {
      const result = JSON.parse(response.body);
      result.values.forEach((sprint: Sprint, index: number) => {
        if (index > 0 && sprints.length > 0) {
          sprints[sprints.length - 1].nextSprint = sprint;
          sprint.previousSprint = sprints[sprints.length - 1];
        } else {
          sprint.previousSprint = result.values[index - 1] ?? null;
        }
        sprint.nextSprint = result.values[index + 1] ?? null;
      });
      const newSprints = sprints.concat(result.values);
      if (result.isLast) {
        return Promise.resolve(newSprints);
      } else {
        return fetchSprints(boardId, startAt + result.maxResults, newSprints);
      }
    });
  };
  return fetchSprints(boardId, startAt);
}

export function SprintSelector(props: { boardId: string }) {
  const [selectedSprint, setSelectedSprint] = useState<Sprint | undefined>();
  useEffect(() => {
    getSprints(props.boardId).then((sprints) => {
      if (sprints.length > 0) {
        const sprint =
          sprints.find((sprint) => sprint.state === 'active') ?? sprints[0];
        setSelectedSprint(sprint);
        emitSprintChanged(sprint.id);
      }
    });
  }, [props.boardId]);

  const navToNextSprint = () => {
    let nextSprint: Sprint | undefined = undefined;
    if (selectedSprint?.nextSprint) {
      nextSprint = selectedSprint?.nextSprint;
      emitSprintChanged(nextSprint.id);
    }
    setSelectedSprint(nextSprint);
  };

  const navToPreviousSprint = () => {
    let previousSprint: Sprint | undefined = undefined;
    if (selectedSprint?.previousSprint) {
      previousSprint = selectedSprint?.previousSprint;
      emitSprintChanged(previousSprint.id);
    }
    setSelectedSprint(previousSprint);
  };

  return (
    <Inline space="space.100" grow="fill" spread="space-between">
      <IconButton
        onClick={navToPreviousSprint}
        isDisabled={selectedSprint?.previousSprint === null}
        appearance="subtle"
        icon={ChevronLeftIcon}
        label="Previous Sprint"
      ></IconButton>
      <Heading size="large" as="h1">
        {selectedSprint?.name}
      </Heading>
      <IconButton
        onClick={navToNextSprint}
        isDisabled={selectedSprint?.nextSprint === null}
        appearance="subtle"
        icon={ChevronRightIcon}
        label="Next Sprint"
      ></IconButton>
    </Inline>
  );
}
