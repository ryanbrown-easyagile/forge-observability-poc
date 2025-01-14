import { SpanKind, Attributes, context, trace } from '@opentelemetry/api';
import { SamplingDecision } from '@opentelemetry/sdk-trace-node';
import { Sampler, AlwaysOnSampler } from '@opentelemetry/sdk-trace-base';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-grpc';
import {
  envDetector,
  hostDetector,
  osDetector,
  processDetector,
  Resource,
} from '@opentelemetry/resources';
import {
  ATTR_SERVICE_NAME,
  ATTR_HTTP_ROUTE,
} from '@opentelemetry/semantic-conventions';
import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-grpc';
import { containerDetector } from '@opentelemetry/resource-detector-container';
import { SimpleLogRecordProcessor } from '@opentelemetry/sdk-logs';
import { OTLPLogExporter } from '@opentelemetry/exporter-logs-otlp-grpc';
import { B3Propagator } from '@opentelemetry/propagator-b3';


export const setupTracing = (serviceName: string) => {
  
  const sdk = new NodeSDK({
    traceExporter: new OTLPTraceExporter({}),
    // traceExporter: new ConsoleSpanExporter(),
    resource: new Resource({
      [ATTR_SERVICE_NAME]: serviceName,
    }),
    sampler: filterSampler(ignoreHealthCheck, new AlwaysOnSampler()),
    instrumentations: [
      getNodeAutoInstrumentations({
        '@opentelemetry/instrumentation-express': {
          enabled: true,
        },
        '@opentelemetry/instrumentation-http': {
          enabled: true,
        },
        '@opentelemetry/instrumentation-winston': {
          enabled: true,
          logHook: (span, record) => {
            record['resource.service.name'] = serviceName;
          },
        },
        '@opentelemetry/instrumentation-fs': {
          requireParentSpan: true,
        },
      }),
    ],
    metricReader: new PeriodicExportingMetricReader({
      exporter: new OTLPMetricExporter(),
      // exporter: new ConsoleMetricExporter(),
    }),
    logRecordProcessors: [
      // new SimpleLogRecordProcessor(new ConsoleLogRecordExporter())
      new SimpleLogRecordProcessor(new OTLPLogExporter()),
    ],
    resourceDetectors: [
      containerDetector,
      envDetector,
      hostDetector,
      osDetector,
      processDetector,
    ],
    textMapPropagator: new B3Propagator(),
  });
  sdk.start();
};

type FilterFunction = (
  spanName: string,
  spanKind: SpanKind,
  attributes: Attributes
) => boolean;

function filterSampler(filterFn: FilterFunction, parent: Sampler): Sampler {
  return {
    shouldSample(ctx, tid, spanName, spanKind, attr, links) {
      if (!filterFn(spanName, spanKind, attr)) {
        return { decision: SamplingDecision.NOT_RECORD };
      }
      return parent.shouldSample(ctx, tid, spanName, spanKind, attr, links);
    },
    toString() {
      return `FilterSampler(${parent.toString()})`;
    },
  };
}

function ignoreHealthCheck(
  spanName: string,
  spanKind: SpanKind,
  attributes: Attributes
) {
  return (
    spanKind !== SpanKind.SERVER || attributes[ATTR_HTTP_ROUTE] !== '/health'
  );
}

type TraceInfo = {
  traceId: string;
  spanId: string;
  traceFlags: number;
}
export function getCurrentTraceInfo() : TraceInfo | undefined {
  const activeSpan = trace.getSpan(context.active());
  if (!activeSpan) {
    return undefined;
  }
  const traceId = activeSpan.spanContext().traceId;
  const spanId = activeSpan.spanContext().spanId;
  const traceFlags = activeSpan.spanContext().traceFlags;

  return { traceId, spanId, traceFlags };
}
