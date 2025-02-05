type QueryOptions = {
  headers?: Record<string, string>;
};
export function queryGraphQL<T>(
  url: string,
  query: any,
  variables?: any,
  options?: QueryOptions
): Promise<T> {
  return fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...options?.headers,
    },
    body: JSON.stringify({
      query,
      variables,
    }),
  }).then((r) => r.json() as T);
}

export async function getLogsFromForge(
  startDate: Date,
  endDate: Date,
  appId: string,
  environmentId: string,
  headers: Record<string, string>
) {
  // Function to fetch logs
  const fetchLogs = async (
    startDate: Date,
    endDate: Date,
    cursor: string | null
  ) => {
    const url =
      `https://api.atlassian.com/v1/app/logs/${appId}` +
      `?environmentId=${environmentId}` +
      `&startDate=${startDate.toISOString()}` +
      `&endDate=${endDate.toISOString()}` +
      `&level=INFO&level=ERROR` +
      `${cursor ? `&cursor=${cursor}` : ''}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        ...headers,
      },
    });

    const data = (await response.json()) as any;
    const logs = data.appLogs;

    // if data.cursor exists, fetch next data
    if (data && data.cursor) {
      const moreLogs = (await fetchLogs(
        startDate,
        endDate,
        data.cursor
      )) as any;
      logs.concat(moreLogs);
    }
    return logs;
  };

  // Call fetchLogs function
  const allLogs = await fetchLogs(startDate, endDate, null);
  return {
    resourceLogs: [
      {
        resource: {
          attributes: [
            {
              key: 'service.name',
              value: {
                stringValue: 'sprint-notes-forge-with-remotes',
              },
            },
          ],
        },
        scopeLogs: [
          {
            scope: {
              name: 'my.library',
              version: '1.0.0',
              attributes: [
                {
                  key: 'my.scope.attribute',
                  value: {
                    stringValue: 'some scope attribute',
                  },
                },
              ],
            },
            logRecords: allLogs,
          },
        ],
      },
    ],
  };
}

export function sendMetricsToOtel(baseUrl: string, metrics: any) {
  console.info('Sending metrics to Otel: ' + JSON.stringify(metrics));
  return fetch(`${baseUrl}/v1/metrics`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(metrics),
  });
}

export function sendLogsToOtel(baseUrl: string, logs: any) {
  console.log('Sending logs to Otel: ' + JSON.stringify(logs));
  return fetch(`${baseUrl}/v1/logs`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(logs),
  });
}
