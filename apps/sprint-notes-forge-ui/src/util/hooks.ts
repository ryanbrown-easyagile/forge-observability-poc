import { useEffect, useState } from "react";
import { view } from "@forge/bridge";

export function useAgileState() {
  const [boardId, setBoardId] = useState<string | null>(null);
  const [projectId, setProjectId] = useState<string | null>(null);
  const [sprintId, setSprintId] = useState<number | null>(null);
  useEffect(() => {
    view.getContext().then((context) => {
      setBoardId(context.extension.board.id);
      setProjectId(context.extension.project.id);
      if(context.extension.sprint) {
        setSprintId(context.extension.sprint.id);
      }
      else {
        const activeSprint = context.extension.sprints.find((sprint: {id: string, state: string}) => sprint.state === "active");
        setSprintId(activeSprint.id ?? context.extension.sprints[0].id);
      }
    });
  }, []);

  return { boardId, projectId, sprintId };
}