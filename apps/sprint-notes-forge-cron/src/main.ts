import {
  getLogsFromForge,
  queryGraphQL,
  sendLogsToOtel,
  sendMetricsToOtel,
} from './client';
import { getStartingTime, saveRuntime } from './timer';

const authHeader = `Basic ${Buffer.from(
  `${process.env.FORGE_CLIENT_ID}:${process.env.FORGE_CLIENT_API_TOKEN}`
).toString('base64')}`;
const headers = {
  Authorization: authHeader,
  'User-Agent': 'ForgeMetricsExportServer/1.0.0',
  'X-ExperimentalApi': 'ForgeMetricsQuery',
};

const query = `
query Ecosystem($appId: ID!, $query: ForgeMetricsOtlpQueryInput!) {
  ecosystem {
    forgeMetrics(appId: $appId) {
      appMetrics(query: $query) {
        ... on ForgeMetricsOtlpData {
          resourceMetrics
        }
        ... on QueryError {
          message
          identifier
          extensions {
            statusCode
            errorType
          }
        }
      }
    }
  }
}
`;

const now = new Date();
const start = getStartingTime();
const appId = process.env.FORGE_APP_ID;
const otelUrl = process.env.OTEL_EXPORTER_URL || 'http://localhost:4317';
const environments = process.env.FORGE_ENVIRONMENTS
  ? process.env.FORGE_ENVIRONMENTS.split(',')
  : [];
const atlassianUrl =
  process.env.FORGE_API_URL ||
  'https://api.atlassian.com/gateway/api/forge/graphql';
const queryVariables = {
  appId: `ari:cloud:ecosystem::app/${appId}`,
  query: {
    filters: {
      environments,
      interval: {
        start: start.toISOString(),
        end: now.toISOString(),
      },
      metrics: [
        'FORGE_API_REQUEST_COUNT',
        'FORGE_API_REQUEST_LATENCY',
        'FORGE_BACKEND_INVOCATION_LATENCY',
        'FORGE_BACKEND_INVOCATION_COUNT',
        'FORGE_BACKEND_INVOCATION_ERRORS',
      ],
    },
  },
};
if (
  !appId ||
  !process.env.FORGE_CLIENT_ID ||
  !process.env.FORGE_CLIENT_API_TOKEN ||
  environments.length === 0
) {
  console.error('Missing required environment variables');
  process.exit(1);
}

console.info('Querying metrics for', queryVariables);

const metricsPromise = queryGraphQL(atlassianUrl, query, queryVariables, {
  headers,
})
  .then((data) =>
    sendMetricsToOtel(
      otelUrl,
      (data as any).data.ecosystem.forgeMetrics.appMetrics
    )
  )
  .catch((err) => console.error(err));

const logsPromise = getLogsFromForge(start, now, appId, environments[0], {
  Authorization: authHeader,
})
  .then((data) => sendLogsToOtel(otelUrl, data))
  .then(() => console.log('Metrics and logs sent to Otel')) 
  .catch((err) => console.error(err));
Promise.all([metricsPromise, logsPromise]).then(() => saveRuntime(now));
