import { useEffect, useState } from 'react';

export function useBoardId() {
  const [boardId, setBoardId] = useState<string | null>(null);
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.has('boardId')) {
      setBoardId(params.get('boardId'));
    }
  }, []);
  return boardId;
}

export function useProjectId() {
  const [projectId, setProjectId] = useState<string | null>(null);
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.has('projectId')) {
      setProjectId(params.get('projectId'));
    }
  }, []);
  return projectId;
}

export function useSprintId() {
  const [sprintId, setSprintId] = useState<string | null>(null);
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.has('sprintId')) {
      setSprintId(params.get('sprintId'));
    }
  }, []);
  return sprintId;
}

