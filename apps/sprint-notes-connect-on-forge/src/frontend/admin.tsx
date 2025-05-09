import React, { useEffect, useState } from 'react';
import { invoke } from '@forge/bridge';
import ForgeReconciler, {
  Stack,
  Icon,
  Heading,
  Button,
  ButtonGroup,
  Box,
  LoadingButton,
  Inline,
  Label,
  Text,
  Textfield,
  DynamicTable,
} from '@forge/react';

type DbSizes = {
  name: string;
  size: number;
}[];

type TestFetchResult = {
  sql: {
    duration: number;
    count: number;
  };
  entity: {
    duration: number;
    count: number;
  };
};

type ExplainResult = {
  id: string;
  estRows: number;
  actRows: string;
  task: string;
  'access object': string;
  'execution info': string;
  'operator info': string;
  memory: string;
  disk: string;
};

const tableHead = {
  cells: [
    {
      key: 'id',
      content: 'ID',
      isSortable: false,
    },
    {
      key: 'estRows',
      content: 'Estimated Rows',
      isSortable: false,
    },
    {
      key: 'actRows',
      content: 'Actual Rows',
      isSortable: false,
    },
    {
      key: 'task',
      content: 'Task',
      isSortable: false,
    },
    {
      key: 'accessObject',
      content: 'Access Object',
      isSortable: false,
    },
    {
      key: 'executionInfo',
      content: 'Execution Info',
      isSortable: false,
      width: 25,
    },
    {
      key: 'operatorInfo',
      content: 'Operator Info',
      isSortable: false,
    },
    {
      key: 'memory',
      content: 'Memory',
      isSortable: false,
    },
    {
      key: 'disk',
      content: 'Disk',
      isSortable: false,
    },
  ],
};

const AdminPage = () => {
  const [isClearing, setIsClearing] = useState(false);
  const [dbSize, setDbSize] = useState<DbSizes>([]);
  const [sprintId, setSprintId] = useState('');
  const [projectId, setProjectId] = useState('');
  const [dataFetchResult, setDataFetchResult] = useState<
    TestFetchResult | undefined
  >();
  const [explainResult, setExplainResult] = useState<ExplainResult[]>([]);

  const handleFetchData = () => {
    invoke<TestFetchResult>('testNotesRetrieval', { sprintId, projectId }).then(
      (result) => {
        setDataFetchResult(result);
      }
    );
  };

  const handleExplain = () => {
    invoke<ExplainResult[]>('explainNotesRetrieval', {
      sprintId,
      projectId,
    }).then((result) => {
      setExplainResult(result);
    });
  };

  useEffect(() => {
    if (!isClearing) {
      invoke<DbSizes>('getDbSize', {}).then((sizes) => {
        setDbSize(sizes);
      });
    }
  }, [isClearing]);

  const handleDeleteData = () => {
    setIsClearing(true);
    invoke('resetData', {}).finally(() => {
      setIsClearing(false);
    });
  };

  return (
    <Stack space="space.200">
      <Heading as="h3">Datastores:</Heading>
      <Box
        backgroundColor="color.background.accent.gray.subtlest"
        padding="space.200"
        xcss={{ borderRadius: 'border.radius' }}
      >
        <Stack space="space.200">
          {dbSize.map((db) => {
            return (
              <Inline>
                <Heading key={db.name} as="h4" size="small">
                  {db.name}:
                </Heading>
                <Text>{db.size} elements</Text>
              </Inline>
            );
          })}
          <Box xcss={{ width: '25%' }}>
            <Label labelFor="sprintId">Sprint ID:</Label>
            <Textfield
              id="sprintId"
              name="sprintId"
              type="text"
              value={sprintId}
              onChange={(event) => setSprintId(event.target.value)}
            />
            <Label labelFor="projectId">Project ID:</Label>
            <Textfield
              id="projectId"
              name="sprintId"
              type="text"
              value={projectId}
              onChange={(event) => setProjectId(event.target.value)}
            />
            {explainResult && explainResult.length > 0 && (
              <Stack space="space.0">
                <Heading as="h4" size="small">
                  Explain:
                </Heading>
                <DynamicTable head={tableHead} rows={explainResult.map((row, index) => ({
                  key: `row-${index}`,
                  cells: [
                    { key: 'id', content: row.id },
                    { key: 'estRows', content: row.estRows },
                    { key: 'actRows', content: row.actRows },
                    { key: 'task', content: row.task },
                    { key: 'accessObject', content: row['access object'] },
                    { key: 'executionInfo', content: row['execution info'] },
                    { key: 'operatorInfo', content: row['operator info'] },
                    { key: 'memory', content: row.memory },
                    { key: 'disk', content: row.disk },
                  ],
                }))} />
              </Stack>
            )}
            <ButtonGroup>
              <Button appearance="primary" onClick={handleFetchData}>
                Calculate
              </Button>
              <Button appearance="primary" onClick={handleExplain}>
                Explain
              </Button>
            </ButtonGroup>
          </Box>
          {dataFetchResult && (
            <>
              <Stack>
                <Heading as="h4" size="small">
                  SQL:
                </Heading>
                <Stack space="space.0">
                  <Text>Count: {dataFetchResult.sql.count}</Text>
                  <Text>
                    Time: {dataFetchResult.sql.duration.toFixed(4)} ms
                  </Text>
                </Stack>
              </Stack>
              <Stack>
                <Heading as="h4" size="small">
                  Entity:
                </Heading>
                <Stack space="space.0">
                  <Text>Count: {dataFetchResult.entity.count}</Text>
                  <Text>
                    Time: {dataFetchResult.entity.duration.toFixed(4)} ms
                  </Text>
                </Stack>
              </Stack>
            </>
          )}
        </Stack>
      </Box>

      <Heading as="h3">Admin Actions:</Heading>
      <Box
        backgroundColor="color.background.accent.gray.subtlest"
        padding="space.200"
        xcss={{ borderRadius: 'border.radius' }}
      >
        <ButtonGroup>
          <LoadingButton
            appearance="primary"
            isLoading={isClearing}
            onClick={handleDeleteData}
          >
            <Icon glyph="trash" label="Delete Data"></Icon> Clear and Refresh
            Data
          </LoadingButton>
        </ButtonGroup>
      </Box>
    </Stack>
  );
};

ForgeReconciler.render(
  <React.StrictMode>
    <AdminPage />
  </React.StrictMode>
);
