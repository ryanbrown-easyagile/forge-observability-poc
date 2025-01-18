import { WebTracerProvider } from '@opentelemetry/sdk-trace-web';
import { getWebAutoInstrumentations } from '@opentelemetry/auto-instrumentations-web';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { registerInstrumentations } from '@opentelemetry/instrumentation';
import { ZoneContextManager } from '@opentelemetry/context-zone';
import { B3InjectEncoding, B3Propagator } from '@opentelemetry/propagator-b3';
import { ATTR_SERVICE_NAME } from '@opentelemetry/semantic-conventions';
import { Resource } from '@opentelemetry/resources';
import { Counter, metrics } from '@opentelemetry/api';
import {
  MeterProvider,
  PeriodicExportingMetricReader,
} from '@opentelemetry/sdk-metrics';
import { logs, SeverityNumber } from '@opentelemetry/api-logs';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-http';
import { OTLPLogExporter } from '@opentelemetry/exporter-logs-otlp-http';
import {
  BatchLogRecordProcessor,
  LoggerProvider,
} from '@opentelemetry/sdk-logs';

const observabilityHost = 'https://rbrown-otel.ngrok.app';

export function initTracing(serviceName: string) {
  const exporter = new OTLPTraceExporter({
    url: `${observabilityHost}/v1/traces`,
  });
  const resource = new Resource({
    [ATTR_SERVICE_NAME]: serviceName,
  });
  const provider = new WebTracerProvider({
    resource,
    spanProcessors: [new BatchSpanProcessor(exporter)],
  });

  provider.register({
    contextManager: new ZoneContextManager(),
    propagator: new B3Propagator({
      injectEncoding: B3InjectEncoding.MULTI_HEADER
    }),
  });

  const meterProvider = new MeterProvider({
    resource,
    readers: [
      new PeriodicExportingMetricReader({
        exporter: new OTLPMetricExporter({
          url: `${observabilityHost}/v1/metrics`,
        }),
      }),
    ],
  });
  metrics.setGlobalMeterProvider(meterProvider);

  const loggerProvider = new LoggerProvider({
    resource,
  });
  loggerProvider.addLogRecordProcessor(
    new BatchLogRecordProcessor(
      new OTLPLogExporter({ url: `${observabilityHost}/v1/logs` })
    )
  );
  logs.setGlobalLoggerProvider(loggerProvider);

  registerInstrumentations({
    meterProvider: meterProvider,
    loggerProvider,
    instrumentations: [
      getWebAutoInstrumentations({
        // load custom configuration for xml-http-request instrumentation
        '@opentelemetry/instrumentation-xml-http-request': {
          clearTimingResources: true,
        },
        '@opentelemetry/instrumentation-document-load': {
          enabled: true,
          ignorePerformancePaintEvents: false,
        },
      }),
    ],
  });
}

export function logError(message: string) {
  logs.getLogger('ea-notes-ui', '1.0.0').emit({
    body: message,
    severityNumber: SeverityNumber.ERROR,
    severityText: 'ERROR',
  });
}

const counters: { [key: string]: Counter } = {};

export function increaseCounterMetric(name: string) {
  const meter = metrics.getMeter('ea-notes-ui', '1.0.0');
  let counter = counters[name];
  if (!counter) {
    counter = meter.createCounter(name);
    counters[name] = counter;
  }
  counter.add(1);
}
