import { useEffect, useState } from 'react';

function getQueryParam(name: string, searchParams: URLSearchParams) {
  if (searchParams.has(name)) {
    const paramValue = searchParams.get(name);
    return paramValue && paramValue.length > 0 ? paramValue : null;
  }
  return null;
}

export function useAgileState() {
  const [boardId, setBoardId] = useState<string | null>(null);
  const [projectId, setProjectId] = useState<string | null>(null);
  const [sprintId, setSprintId] = useState<number | null>(null);
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const boardId = getQueryParam('boardId', params);
    if (boardId) {
      setBoardId(boardId);
      AP.request(`/rest/agile/1.0/board/${boardId}/sprint?state=active`).then(
        (response) => {
          const data = JSON.parse(response.body);
          if (data && data.values && data.values.length > 0) {
            setSprintId(data.values[0].id);
          }
        }
      );

      AP.request(`/rest/agile/1.0/board/${boardId}`).then((response) => {
        const data = JSON.parse(response.body);
        if (data && data.location && data.location.projectId) {
          setProjectId(data.location.projectId);
        }
      });
    }
  }, []);

  return { boardId, projectId, sprintId };
}

export function useAtlassianJWT() {
  const [jwt, setJwt] = useState<string | undefined>();
  useEffect(() => {
    AP.context.getToken((token: string) => {
      setJwt(token);
    });
  }, []);
  return jwt;
}
