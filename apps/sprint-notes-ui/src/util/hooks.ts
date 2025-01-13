import { useEffect, useState } from 'react';

function getQueryParam(name: string, searchParams: URLSearchParams) {
  if(searchParams.has(name)) {
    const paramValue = searchParams.get(name);
    return paramValue && paramValue.length > 0 ? paramValue : null;
  }
  return null;
}

export function useAgileState() {
  const [boardId, setBoardId] = useState<string | null>(null);
  const [projectId, setProjectId] = useState<string | null>(null);
  const [sprintId, setSprintId] = useState<string | null>(null);
  useEffect(() => {
    console.log("Initialising Agile State");
    const params = new URLSearchParams(window.location.search);
    const projectId = getQueryParam('projectId', params);
    if (projectId) {
      console.log("Project Id found in URL");
      setProjectId(projectId);
    }

    const boardId = getQueryParam('boardId', params);
    if (boardId) {
      console.log("Board Id found in URL");
      setBoardId(boardId);
    }

    const sprintId = getQueryParam('sprintId', params);
    if (sprintId) {
      console.log("Sprint Id found in URL");
      setSprintId(params.get('sprintId'));
    } else if (projectId) {
      console.log("Sprint Id not found in URL, fetching active sprint");
      AP.request(`/rest/agile/1.0/board/${boardId}/sprint?state=active`).then(
        (response) => {
          const data = JSON.parse(response.body);
          if (data.values.length > 0) {
            setSprintId(data.values[0].id);
          }
        }
      );
    }
  }, []);

  return { boardId, projectId, sprintId };
}
