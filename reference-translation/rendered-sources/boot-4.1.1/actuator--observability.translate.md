# Observability

Observability is the ability to observe the internal state of a running system from the outside.
It consists of the three pillars: logging, metrics and traces.

For metrics and traces, Spring Boot uses [Micrometer Observation][r1].
To create your own observations (which will lead to metrics and traces), you can inject an [`ObservationRegistry`][r2].

{{CODE_0}}

{{CODE_1}}

> [NOTE]
>
> Low cardinality tags will be added to metrics and traces, while high cardinality tags will only be added to traces.

Beans of type [`ObservationPredicate`][r3], [`GlobalObservationConvention`][r4], [`ObservationFilter`][r5] and [`ObservationHandler`][r6] will be automatically registered on the [`ObservationRegistry`][r2].
You can additionally register any number of [`ObservationRegistryCustomizer`][r7] beans to further configure the registry.

> [TIP]
>
> Observability for JDBC can be configured using a separate project.
> The [Datasource Micrometer project][r8] provides a Spring Boot starter which automatically creates observations when JDBC operations are invoked.
> Read more about it [in the reference documentation][r9].

> [TIP]
>
> Observability for R2DBC is built into Spring Boot.
> To enable it, add the `io.r2dbc:r2dbc-proxy` dependency to your project.

## Context Propagation

Observability support relies on the [Context Propagation library][r10] for forwarding the current observation across threads and reactive pipelines.
By default, [`ThreadLocal`][r11] values are not automatically reinstated in reactive operators.
This behavior is controlled with the `spring.reactor.context-propagation` property, which can be set to `auto` to enable automatic propagation.

If you’re working with [`@Async`][r12] methods and the [`AsyncTaskExecutor`][r13] is auto-configured, you have to opt-in for context propagation using the `spring.task.execution.propagate-context` property.

If you are configuring the [`AsyncTaskExecutor`][r13] yourself, then you need to register a [`ContextPropagatingTaskDecorator`][r14] bean, as shown in the following example:

{{CODE_2}}

{{CODE_3}}

For more details about observations please see the [Micrometer Observation documentation][r1].

## Common Tags

Common tags are generally used for dimensional drill-down on the operating environment, such as host, instance, region, stack, and others.
Common tags are applied to all observations as low cardinality tags and can be configured, as the following example shows:

{{CODE_4}}

{{CODE_5}}

The preceding example adds `region` and `stack` tags to all observations with a value of `us-east-1` and `prod`, respectively.

## Preventing Observations

If you’d like to prevent some observations from being reported, you can use the `management.observations.enable` properties:

{{CODE_6}}

{{CODE_7}}

The preceding example will prevent all observations with a name starting with `denied.prefix` or `another.denied.prefix`.

> [TIP]
>
> If you want to prevent Spring Security from reporting observations, set the property `management.observations.enable.spring.security` to `false`.

If you need greater control over the prevention of observations, you can register beans of type [`ObservationPredicate`][r3].
Observations are only reported if all the [`ObservationPredicate`][r3] beans return `true` for that observation.

{{CODE_8}}

{{CODE_9}}

The preceding example will prevent all observations whose name contains "denied".

## Micrometer Observation Annotations support

To enable scanning of observability annotations like [`@Observed`][r15], [`@Timed`][r16], [`@Counted`][r17], [`@MeterTag`][r18] and [`@NewSpan`][r19], set the `management.observations.annotations.enabled` property to `true`.
A dependency on `org.aspectj:aspectjweaver`, which is part of `spring-boot-starter-aspectj`, is also required.
This feature is supported by Micrometer directly.
Please refer to the [Micrometer][r20], [Micrometer Observation][r21] and [Micrometer Tracing][r22] reference docs.

> [NOTE]
>
> When you annotate methods or classes which are already instrumented (for example, [Spring Data repositories][r23] or [Spring MVC controllers][r24]), you will get duplicate observations.
> In that case you can either disable the automatic instrumentation using [properties][r25] or an [`ObservationPredicate`][r3] and rely on your annotations, or you can remove your annotations.

## OpenTelemetry Support

> [NOTE]
>
> There are several ways to support [OpenTelemetry][r26] in your application.
> You can use the [OpenTelemetry Java Agent][r27] or the [OpenTelemetry Spring Boot Starter][r28],
> which are supported by the OTel community; the metrics and traces use the semantic conventions defined by OTel libraries.
> This documentation describes OpenTelemetry as officially supported by the Spring team, using Micrometer and the OTLP exporter;
> the metrics and traces use the semantic conventions described in the Spring projects documentation, such as [Spring Framework][r29].

Spring Boot’s actuator module includes basic support for OpenTelemetry.

It provides a bean of type [`OpenTelemetry`][r30], and if there are beans of type [`SdkTracerProvider`][r31], [`ContextPropagators`][r32], [`SdkLoggerProvider`][r33] or [`SdkMeterProvider`][r34] in the application context, they automatically get registered.
Additionally, it provides a [`Resource`][r35] bean.
The attributes of the auto-configured [`Resource`][r35] can be configured via the `management.opentelemetry.resource-attributes` configuration property.
Auto-configured attributes will be merged with attributes from the `OTEL_RESOURCE_ATTRIBUTES` and `OTEL_SERVICE_NAME` environment variables, with attributes configured through the configuration property taking precedence over those from the environment variables.

If you have defined your own [`Resource`][r35] bean, this will no longer be the case.

> [NOTE]
>
> Spring Boot does not provide automatic exporting of OpenTelemetry metrics or logs.
> Exporting OpenTelemetry traces is only auto-configured when used together with [Micrometer Tracing][r36].

### Disabling OpenTelemetry

The OpenTelemetry support can be disabled by setting the `management.opentelemetry.enabled` property to `false`.
This behaves similarly to the [`OTEL_SDK_DISABLED`][r37] environment variable (but negated): when the SDK is disabled, metrics, traces, and logging will use no-op implementations.
Context propagators are not affected and continue to function normally.

> [NOTE]
>
> Keep in mind that Spring Boot doesn’t use OpenTelemetry’s metrics functionality, so metrics might still be enabled even when disabling OpenTelemetry.

### Environment variables

Spring Boot supports a subset of the [OpenTelemetry SDK environment variables][r38].
These environment variables are automatically mapped to Spring Boot configuration properties at startup.
When an environment variable has a signal-specific variant (for example, `OTEL_EXPORTER_OTLP_TRACES_ENDPOINT`) and a general variant (`OTEL_EXPORTER_OTLP_ENDPOINT`), the signal-specific variant takes precedence and is used as-is.
When the general variant is used as a fallback, the signal-specific path (`v1/traces`, `v1/metrics`, or `v1/logs`) is appended to it.
For example, setting `OTEL_EXPORTER_OTLP_ENDPOINT=http://collector:4318` results in `[collector:4318/v1/traces][r39]` for traces.

This mapping can be disabled by setting `management.opentelemetry.map-environment-variables` to `false`.

#### General

| Environment Variable | Spring Boot Property |
| --- | --- |
| `OTEL_SDK_DISABLED` | `management.opentelemetry.enabled` (inverted) |
| `OTEL_PROPAGATORS` | `management.tracing.propagation.type` and `management.tracing.baggage.enabled` |
| `OTEL_TRACES_SAMPLER` | `management.opentelemetry.tracing.sampler` |
| `OTEL_TRACES_SAMPLER_ARG` | `management.tracing.sampling.probability` |
| `OTEL_METRICS_EXEMPLAR_FILTER` | `management.tracing.exemplars.include` |

#### Metrics Exporter

| Environment Variable | Spring Boot Property |
| --- | --- |
| `OTEL_EXPORTER_OTLP_METRICS_ENDPOINT` / `OTEL_EXPORTER_OTLP_ENDPOINT` | `management.otlp.metrics.export.url` |
| `OTEL_EXPORTER_OTLP_METRICS_TEMPORALITY_PREFERENCE` | `management.otlp.metrics.export.aggregation-temporality` |
| `OTEL_EXPORTER_OTLP_METRICS_DEFAULT_HISTOGRAM_AGGREGATION` | `management.otlp.metrics.export.histogram-flavor` |
| `OTEL_EXPORTER_OTLP_METRICS_COMPRESSION` / `OTEL_EXPORTER_OTLP_COMPRESSION` | `management.otlp.metrics.export.compression-mode` |
| `OTEL_EXPORTER_OTLP_METRICS_TIMEOUT` / `OTEL_EXPORTER_OTLP_TIMEOUT` | `management.otlp.metrics.export.read-timeout` |
| `OTEL_EXPORTER_OTLP_METRICS_HEADERS` / `OTEL_EXPORTER_OTLP_HEADERS` | `management.otlp.metrics.export.headers` |
| `OTEL_METRIC_EXPORT_INTERVAL` | `management.otlp.metrics.export.step` |
| `OTEL_METRICS_EXPORTER` | `management.otlp.metrics.export.enabled` (only `otlp` enables OTLP export; other values disable it but do not enable alternative exporters) |
| `OTEL_EXPORTER_OTLP_METRICS_CERTIFICATE` / `OTEL_EXPORTER_OTLP_CERTIFICATE` | `management.otlp.metrics.export.ssl.bundle` (auto-configured SSL bundle) |
| `OTEL_EXPORTER_OTLP_METRICS_CLIENT_KEY` / `OTEL_EXPORTER_OTLP_CLIENT_KEY` | `management.otlp.metrics.export.ssl.bundle` (auto-configured SSL bundle) |
| `OTEL_EXPORTER_OTLP_METRICS_CLIENT_CERTIFICATE` / `OTEL_EXPORTER_OTLP_CLIENT_CERTIFICATE` | `management.otlp.metrics.export.ssl.bundle` (auto-configured SSL bundle) |

#### Traces Exporter

| Environment Variable | Spring Boot Property |
| --- | --- |
| `OTEL_EXPORTER_OTLP_TRACES_ENDPOINT` / `OTEL_EXPORTER_OTLP_ENDPOINT` | `management.opentelemetry.tracing.export.otlp.endpoint` |
| `OTEL_EXPORTER_OTLP_TRACES_COMPRESSION` / `OTEL_EXPORTER_OTLP_COMPRESSION` | `management.opentelemetry.tracing.export.otlp.compression` |
| `OTEL_EXPORTER_OTLP_TRACES_TIMEOUT` / `OTEL_EXPORTER_OTLP_TIMEOUT` | `management.opentelemetry.tracing.export.otlp.timeout` |
| `OTEL_EXPORTER_OTLP_TRACES_PROTOCOL` / `OTEL_EXPORTER_OTLP_PROTOCOL` | `management.opentelemetry.tracing.export.otlp.transport` |
| `OTEL_EXPORTER_OTLP_TRACES_HEADERS` / `OTEL_EXPORTER_OTLP_HEADERS` | `management.opentelemetry.tracing.export.otlp.headers` |
| `OTEL_BSP_SCHEDULE_DELAY` | `management.opentelemetry.tracing.export.schedule-delay` |
| `OTEL_BSP_EXPORT_TIMEOUT` | `management.opentelemetry.tracing.export.timeout` |
| `OTEL_BSP_MAX_QUEUE_SIZE` | `management.opentelemetry.tracing.export.max-queue-size` |
| `OTEL_BSP_MAX_EXPORT_BATCH_SIZE` | `management.opentelemetry.tracing.export.max-batch-size` |
| `OTEL_TRACES_EXPORTER` | `management.tracing.export.otlp.enabled` (only `otlp` enables OTLP export; other values disable it but do not enable alternative exporters) |
| `OTEL_SPAN_ATTRIBUTE_VALUE_LENGTH_LIMIT` / `OTEL_ATTRIBUTE_VALUE_LENGTH_LIMIT` | `management.opentelemetry.tracing.limits.max-attribute-value-length` |
| `OTEL_SPAN_ATTRIBUTE_COUNT_LIMIT` / `OTEL_ATTRIBUTE_COUNT_LIMIT` | `management.opentelemetry.tracing.limits.max-attributes` |
| `OTEL_SPAN_EVENT_COUNT_LIMIT` | `management.opentelemetry.tracing.limits.max-events` |
| `OTEL_SPAN_LINK_COUNT_LIMIT` | `management.opentelemetry.tracing.limits.max-links` |
| `OTEL_EVENT_ATTRIBUTE_COUNT_LIMIT` | `management.opentelemetry.tracing.limits.max-attributes-per-event` |
| `OTEL_LINK_ATTRIBUTE_COUNT_LIMIT` | `management.opentelemetry.tracing.limits.max-attributes-per-link` |
| `OTEL_EXPORTER_OTLP_TRACES_CERTIFICATE` / `OTEL_EXPORTER_OTLP_CERTIFICATE` | `management.opentelemetry.tracing.export.otlp.ssl.bundle` (auto-configured SSL bundle) |
| `OTEL_EXPORTER_OTLP_TRACES_CLIENT_KEY` / `OTEL_EXPORTER_OTLP_CLIENT_KEY` | `management.opentelemetry.tracing.export.otlp.ssl.bundle` (auto-configured SSL bundle) |
| `OTEL_EXPORTER_OTLP_TRACES_CLIENT_CERTIFICATE` / `OTEL_EXPORTER_OTLP_CLIENT_CERTIFICATE` | `management.opentelemetry.tracing.export.otlp.ssl.bundle` (auto-configured SSL bundle) |

#### Logs Exporter

| Environment Variable | Spring Boot Property |
| --- | --- |
| `OTEL_EXPORTER_OTLP_LOGS_ENDPOINT` / `OTEL_EXPORTER_OTLP_ENDPOINT` | `management.opentelemetry.logging.export.otlp.endpoint` |
| `OTEL_EXPORTER_OTLP_LOGS_COMPRESSION` / `OTEL_EXPORTER_OTLP_COMPRESSION` | `management.opentelemetry.logging.export.otlp.compression` |
| `OTEL_EXPORTER_OTLP_LOGS_TIMEOUT` / `OTEL_EXPORTER_OTLP_TIMEOUT` | `management.opentelemetry.logging.export.otlp.timeout` |
| `OTEL_EXPORTER_OTLP_LOGS_PROTOCOL` / `OTEL_EXPORTER_OTLP_PROTOCOL` | `management.opentelemetry.logging.export.otlp.transport` |
| `OTEL_EXPORTER_OTLP_LOGS_HEADERS` / `OTEL_EXPORTER_OTLP_HEADERS` | `management.opentelemetry.logging.export.otlp.headers` |
| `OTEL_BLRP_SCHEDULE_DELAY` | `management.opentelemetry.logging.export.schedule-delay` |
| `OTEL_BLRP_EXPORT_TIMEOUT` | `management.opentelemetry.logging.export.timeout` |
| `OTEL_BLRP_MAX_QUEUE_SIZE` | `management.opentelemetry.logging.export.max-queue-size` |
| `OTEL_BLRP_MAX_EXPORT_BATCH_SIZE` | `management.opentelemetry.logging.export.max-batch-size` |
| `OTEL_LOGS_EXPORTER` | `management.logging.export.otlp.enabled` (only `otlp` enables OTLP export; other values disable it but do not enable alternative exporters) |
| `OTEL_LOGRECORD_ATTRIBUTE_VALUE_LENGTH_LIMIT` / `OTEL_ATTRIBUTE_VALUE_LENGTH_LIMIT` | `management.opentelemetry.logging.limits.max-attribute-value-length` |
| `OTEL_LOGRECORD_ATTRIBUTE_COUNT_LIMIT` / `OTEL_ATTRIBUTE_COUNT_LIMIT` | `management.opentelemetry.logging.limits.max-attributes` |
| `OTEL_EXPORTER_OTLP_LOGS_CERTIFICATE` / `OTEL_EXPORTER_OTLP_CERTIFICATE` | `management.opentelemetry.logging.export.otlp.ssl.bundle` (auto-configured SSL bundle) |
| `OTEL_EXPORTER_OTLP_LOGS_CLIENT_KEY` / `OTEL_EXPORTER_OTLP_CLIENT_KEY` | `management.opentelemetry.logging.export.otlp.ssl.bundle` (auto-configured SSL bundle) |
| `OTEL_EXPORTER_OTLP_LOGS_CLIENT_CERTIFICATE` / `OTEL_EXPORTER_OTLP_CLIENT_CERTIFICATE` | `management.opentelemetry.logging.export.otlp.ssl.bundle` (auto-configured SSL bundle) |

#### Resource

The following environment variables configure the OpenTelemetry resource:

- [`OTEL_RESOURCE_ATTRIBUTES`][r37]
- [`OTEL_SERVICE_NAME`][r37]

> [NOTE]
>
> The `OTEL_RESOURCE_ATTRIBUTES` environment variable consists of a list of key-value pairs.
> For example: `key1=value1,key2=value2,key3=spring%20boot`.
> All attribute values are treated as strings, and any characters outside the baggage-octet range must be **percent-encoded**.

#### Unsupported Environment Variables

Other environment variables as described in [the OpenTelemetry documentation][r38] are not supported.

If you want all environment variables specified by OpenTelemetry’s SDK to be effective, you have to supply your own `OpenTelemetry` bean.

> [WARNING]
>
> Doing this will switch off Spring Boot’s OpenTelemetry auto-configuration and may break the built-in observability functionality.

First, add a dependency to `io.opentelemetry:opentelemetry-sdk-extension-autoconfigure` to get [OpenTelemetry’s zero-code SDK autoconfigure module][r40], then add this configuration:

{{CODE_10}}

### Logging

The [`OpenTelemetryLoggingAutoConfiguration`][r41] configures OpenTelemetry’s [`SdkLoggerProvider`][r33].
Exporting logs via OTLP is supported through the [`OtlpLoggingAutoConfiguration`][r42], which enables OTLP log exporting over HTTP or gRPC.

> [NOTE]
>
> If you need to apply advanced customizations to OTLP log record exporters, consider registering [`OtlpHttpLogRecordExporterBuilderCustomizer`][r43] or [`OtlpGrpcLogRecordExporterBuilderCustomizer`][r44] beans.
> These will be invoked before the creation of the [`OtlpHttpLogRecordExporter`][r45] or [`OtlpGrpcLogRecordExporter`][r46].
> The customizers take precedence over anything applied by the auto-configuration.

However, while there is a `SdkLoggerProvider` bean, Spring Boot doesn’t support bridging logs to this bean out of the box.
This can be done with 3rd-party log bridges, as described in the [Logging with OpenTelemetry][r47] section.

### Metrics

The choice of metrics in the Spring portfolio is Micrometer, which means that metrics are not collected and exported through the OpenTelemetry’s [`SdkMeterProvider`][r34].
Spring Boot doesn’t provide a `SdkMeterProvider` bean.

However, Micrometer metrics can be exported via OTLP to any OpenTelemetry capable backend using the [`OtlpMeterRegistry`][r48], as described in the [Metrics with OTLP][r49] section.

> [NOTE]
>
> Micrometer’s OTLP registry doesn’t use the `Resource` bean, but setting `OTEL_RESOURCE_ATTRIBUTES`, `OTEL_SERVICE_NAME` or `management.opentelemetry.resource-attributes` works.

#### Metrics via the OpenTelemetry API and SDK

If you or a dependency you include make use of OpenTelemetry’s [`MeterProvider`][r50], those metrics are not exported.

We strongly recommend that you report your metrics with Micrometer.
If a dependency you include uses OpenTelemetry’s `MeterProvider`, you can include this configuration in your application to configure a `MeterProvider` bean, which you then have to wire into your dependency:

{{CODE_11}}

This configuration also enables metrics export via OTLP over HTTP.

### Tracing

If Micrometer tracing is used, the [`OpenTelemetryTracingAutoConfiguration`][r51] configures OpenTelemetry’s [`SdkTracerProvider`][r31].
Exporting traces through OTLP is enabled by the [`OtlpTracingAutoConfiguration`][r52], which supports exporting traces with OTLP over HTTP or gRPC.

We strongly recommend using the Micrometer Observation or Tracing API instead of using the OpenTelemetry API directly.
