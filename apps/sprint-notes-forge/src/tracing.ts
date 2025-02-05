import { registerInstrumentations } from "@opentelemetry/instrumentation";
import { __getRuntime, asUser } from "@forge/api";
import {
  propagation,
  trace,
  SpanKind,
  SpanStatusCode,
  TextMapPropagator,
  Context,
  TextMapGetter,
  TextMapSetter,
  isValidTraceId,
  isValidSpanId,
  TraceFlags,
  ROOT_CONTEXT,
  context,
} from "@opentelemetry/api";
import {
  BasicTracerProvider,
  SimpleSpanProcessor,
} from "@opentelemetry/sdk-trace-node";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { ATTR_SERVICE_NAME } from "@opentelemetry/semantic-conventions";
import { Resource } from "@opentelemetry/resources";

export class ForgePropogator implements TextMapPropagator {
  inject(context: Context, carrier: any, setter: TextMapSetter<any>): void {
    return; // Let forge handle this
  }
  extract(context: Context, carrier: any, getter: TextMapGetter<any>): Context {
    console.log("Extracting trace context");
    const { traceId, spanId } = __getRuntime().tracing;
    console.log(`Extracted traceId: ${traceId}, spanId: ${spanId}`);
    if (!isValidTraceId(traceId) || !isValidSpanId(spanId)) return context;

    console.log(`Setting span context`);
    return trace.setSpanContext(context, {
      traceId,
      spanId,
      traceFlags: TraceFlags.SAMPLED,
    });
  }
  fields(): string[] {
    return []; // Let forge handle this
  }
}

export function initTracing() {
  const exporter = new OTLPTraceExporter({
    url: "https://rbrown-otel.ngrok.app/v1/traces",
  });
  const resource = new Resource({
    [ATTR_SERVICE_NAME]: "ea-notes-forge-native",
  });
  const provider = new BasicTracerProvider({
    resource,
    spanProcessors: [new SimpleSpanProcessor(exporter)],
  });
  provider.register({
    propagator: new ForgePropogator()
  });
  registerInstrumentations({
    tracerProvider: provider,
  });
  
  console.log("Provider registered");
}

type TracingAttributes = {
  [attributeKey: string]: string;
};

export function generateSpan(functionName: string) {
  const tracer = trace.getTracer("forge");
  
  return {
    start: (attrs: TracingAttributes) => {
      const span = tracer.startSpan(functionName, {
        kind: SpanKind.SERVER,
        attributes: attrs,
        root: false
      }, propagation.extract(context.active(), {}));
      console.log(`Span started: {traceId: ${span.spanContext().traceId}, spanId: ${span.spanContext().spanId}}`);
      return {
        span,
        end: (error?: any) => {
          if (error) {
            span.setStatus({
              code: SpanStatusCode.ERROR,
              message:
                error instanceof Error ? error.message : error.toString(),
            });
          }
          span.end();
        },
      };
    },
  };
}
