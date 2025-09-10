import { NodeSDK } from '@opentelemetry/sdk-node';
import {
  PeriodicExportingMetricReader,
} from '@opentelemetry/sdk-metrics';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-proto';
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-proto';


const sdk = new NodeSDK({
  traceExporter: new OTLPTraceExporter({
    url: "http://jaeger:4318/v1/traces"
  }),
  metricReader: new PeriodicExportingMetricReader({
    exporter:  new OTLPMetricExporter({
      url: "http://jaeger:4318/v1/metrics"
    }),
  }),
  spanProcessors: [new BatchSpanProcessor(new OTLPTraceExporter({
    url: "http://jaeger:4318/v1/traces"
  }))],
  // This seems to be the main one!
  instrumentations: [getNodeAutoInstrumentations()],
  serviceName: "poker-2",
});


sdk.start();