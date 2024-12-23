import { trace, SpanKind, Attributes } from '@opentelemetry/api';
import { registerInstrumentations } from '@opentelemetry/instrumentation';
import {
  NodeTracerProvider,
  SamplingDecision,
} from '@opentelemetry/sdk-trace-node';
import {
  Sampler,
  AlwaysOnSampler,
  BatchSpanProcessor,
} from '@opentelemetry/sdk-trace-base';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-proto';
import { Resource } from '@opentelemetry/resources';
import {
  ATTR_SERVICE_NAME,
  ATTR_HTTP_ROUTE,
} from '@opentelemetry/semantic-conventions';
import { ExpressInstrumentation } from '@opentelemetry/instrumentation-express';
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';
import { WinstonInstrumentation } from '@opentelemetry/instrumentation-winston';

export const setupTracing = (serviceName: string) => {
  const exporter = new OTLPTraceExporter({});
  const provider = new NodeTracerProvider({
    spanProcessors: [new BatchSpanProcessor(exporter)],
    resource: new Resource({
      [ATTR_SERVICE_NAME]: serviceName,
    }),
    sampler: filterSampler(ignoreHealthCheck, new AlwaysOnSampler()),
  });
  registerInstrumentations({
    tracerProvider: provider,
    instrumentations: [
      // Express instrumentation expects HTTP layer to be instrumented
      new HttpInstrumentation(),
      new ExpressInstrumentation(),
      new WinstonInstrumentation({
        logHook: (span, record) => {
          record['resource.service.name'] = serviceName;
        },
      }),
    ],
  });

  // Initialize the OpenTelemetry APIs to use the NodeTracerProvider bindings
  provider.register();

  return trace.getTracer(serviceName);
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
