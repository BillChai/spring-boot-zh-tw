# Tracing

Spring Boot Actuator provides dependency management and auto-configuration for [Micrometer Tracing][r1], a facade for popular tracer libraries.

> [TIP]
>
> To learn more about Micrometer Tracing capabilities, see its [reference documentation][r1].

## Supported Tracers

Spring Boot ships auto-configuration for the following tracers:

- [OpenTelemetry][r2] with [OTLP][r3].
- [OpenZipkin Brave][r4] with [Zipkin][r5].

## Getting Started

We need an example application that we can use to get started with tracing.
For our purposes, the simple “Hello World!” web application that’s covered in the [Developing Your First Spring Boot Application][r6] section will suffice.
We’re going to use the Brave tracer with Zipkin as trace backend.

To recap, our main application code looks like this:

```kotlin
import org.apache.commons.logging.Log
import org.apache.commons.logging.LogFactory
import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@SpringBootApplication
class MyApplication {

	private val logger: Log = LogFactory.getLog(MyApplication::class.java)

	@RequestMapping("/")
	fun home(): String {
		logger.info("home() has been called")
		return "Hello, World!"
	}

}

fun main(args: Array<String>) {
	runApplication<MyApplication>(*args)
}
```

```java
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@SpringBootApplication
public class MyApplication {

	private static final Log logger = LogFactory.getLog(MyApplication.class);

	@RequestMapping("/")
	String home() {
		logger.info("home() has been called");
		return "Hello World!";
	}

	public static void main(String[] args) {
		SpringApplication.run(MyApplication.class, args);
	}

}
```

> [NOTE]
>
> There’s an added logger statement in the `home()` method, which will be important later.

Now we have to add the `org.springframework.boot:spring-boot-starter-zipkin` dependency.

Then add the following application properties:

```properties
management.tracing.sampling.probability=1
```

```yaml
management:
  tracing:
    sampling:
      probability: 1.0
```

By default, Spring Boot samples only 10% of requests to prevent overwhelming the trace backend.
This property switches it to 100% so that every request is sent to the trace backend.

To collect and visualize the traces, we need a running trace backend.
We use Zipkin as our trace backend here.
The [Zipkin Quickstart guide][r7] provides instructions how to start Zipkin locally.

After Zipkin is running, you can start your application.

If you open a web browser to `[localhost:8080][r8]`, you should see the following output:

```text
Hello World!
```

Behind the scenes, an observation has been created for the HTTP request, which in turn gets bridged to Brave, which reports a new trace to Zipkin.

Now open the Zipkin UI at `[localhost:9411][r9]` and press the "Run Query" button to list all collected traces.
You should see one trace.
Press the "Show" button to see the details of that trace.

## Logging Correlation IDs

Correlation IDs provide a helpful way to link lines in your log files to spans/traces.
If you are using Micrometer Tracing, Spring Boot will include correlation IDs in your logs by default.

The default correlation ID is built from `traceId` and `spanId` [MDC][r10] values.
For example, if Micrometer Tracing has added an MDC `traceId` of `803B448A0489F84084905D3093480352` and an MDC `spanId` of `3425F23BB2432450` the log output will include the correlation ID `[803B448A0489F84084905D3093480352-3425F23BB2432450]`.

If you prefer to use a different format for your correlation ID, you can use the `logging.pattern.correlation` property to define one.
For example, the following will provide a correlation ID for Logback in format previously used by Spring Cloud Sleuth:

```properties
logging.pattern.correlation=[${spring.application.name:},%X{traceId:-},%X{spanId:-}] 
logging.include-application-name=false
```

```yaml
logging:
  pattern:
    correlation: "[${spring.application.name:},%X{traceId:-},%X{spanId:-}] "
  include-application-name: false
```

> [NOTE]
>
> In the example above, `logging.include-application-name` is set to `false` to avoid the application name being duplicated in the log messages (`logging.pattern.correlation` already contains it).
> It’s also worth mentioning that `logging.pattern.correlation` contains a trailing space so that it is separated from the logger name that comes right after it by default.

> [TIP]
>
> Correlation IDs rely on context propagation.
> Please read [this documentation for more details][r11].

## Propagating Traces

To automatically propagate traces over the network, use the auto-configured [`RestTemplateBuilder`][r12], [`RestClient.Builder`][r13] or [`WebClient.Builder`][r14] to construct the client.

> [WARNING]
>
> If you create the [`RestTemplate`][r15], the [`RestClient`][r16] or the [`WebClient`][r17] without using the auto-configured builders, automatic trace propagation won’t work!

## Tracer Implementations

As Micrometer Tracer supports multiple tracer implementations, there are multiple dependency combinations possible with Spring Boot.
The combinations OpenTelemetry with OTLP and Brave with Zipkin are common and have dedicated starters.

### OpenTelemetry With OTLP

Tracing with OpenTelemetry and reporting using OTLP requires the following dependencies:

- `org.springframework.boot:spring-boot-starter-opentelemetry`

Use the `management.opentelemetry.tracing.export.otlp.*` configuration properties to configure reporting using OTLP.

> [NOTE]
>
> If you need to apply advanced customizations to OTLP span exporters, consider registering [`OtlpHttpSpanExporterBuilderCustomizer`][r18] or [`OtlpGrpcSpanExporterBuilderCustomizer`][r19] beans.
> These will be invoked before the creation of the `OtlpHttpSpanExporter` or `OtlpGrpcSpanExporter`.
> The customizers take precedence over anything applied by the auto-configuration.

### OpenTelemetry With Zipkin

> [WARNING]
>
> OpenTelemetry has [deprecated their Zipkin support][r20].
> The auto-configuration for it will be removed in Spring Boot 4.2.
> Either switch to Brave or consider using [the Zipkin OTel module][r21] for ingesting OTLP directly.

Tracing with OpenTelemetry and reporting to Zipkin requires the following dependencies:

- `org.springframework.boot:spring-boot-micrometer-tracing-opentelemetry` - Spring Boot’s support for Micrometer Tracing over OpenTelemetry.
- `io.micrometer:micrometer-tracing-bridge-otel` - bridges the Micrometer Observation API to OpenTelemetry.
- `org.springframework.boot:spring-boot-zipkin` - Spring Boot’s support for Zipkin.
- `io.opentelemetry:opentelemetry-exporter-zipkin` - OpenTelemetry exporter that reports traces to Zipkin.

Use the `management.tracing.export.zipkin.*` configuration properties to configure reporting to Zipkin.

### OpenZipkin Brave With Zipkin

Tracing with OpenZipkin Brave and reporting to Zipkin requires the following dependencies:

- `org.springframework.boot:spring-boot-starter-zipkin`

Use the `management.tracing.export.zipkin.*` configuration properties to configure reporting to Zipkin.

## Sampling

By default, Spring Boot samples only 10% of requests to prevent overwhelming the trace backend.
The `management.tracing.sampling.probability` property can be used to configure this.

When using OpenTelemetry, you can also configure which sampler is used via the `management.opentelemetry.tracing.sampler` property.
The following samplers are supported:

| Sampler | Description |
| --- | --- |
| `always-on` | Samples every trace. |
| `always-off` | Discards every trace. |
| `trace-id-ratio` | Samples a fraction of traces based on `management.tracing.sampling.probability`. |
| `parent-based-always-on` | If the parent span is sampled, samples the child span. If there is no parent, samples every trace. |
| `parent-based-always-off` | If the parent span is sampled, samples the child span. If there is no parent, discards every trace. |
| `parent-based-trace-id-ratio` (default) | If the parent span is sampled, samples the child span. If there is no parent, samples a fraction of traces based on `management.tracing.sampling.probability`. |

## Span Limits

When using OpenTelemetry, you can configure span limits via the `management.opentelemetry.tracing.limits.*` configuration properties.
These allow you to control the maximum number of attributes, events, and links per span, as well as the maximum length of string attribute values.

For example, to limit the number of attributes per span to 64 and the maximum attribute value length to 256 characters:

```properties
management.opentelemetry.tracing.limits.max-attributes=64
management.opentelemetry.tracing.limits.max-attribute-value-length=256
```

```yaml
management:
  opentelemetry:
    tracing:
      limits:
        max-attributes: 64
        max-attribute-value-length: 256
```

If you need full control, you can register a custom [`SpanLimits`][r22] bean.

## Integration with Micrometer Observation

A [`TracingAwareMeterObservationHandler`][r23] is automatically registered on the [`ObservationRegistry`][r24], which creates spans for every completed observation.

## Creating Custom Spans

You can create your own spans by starting an observation.
For this, inject [`ObservationRegistry`][r24] into your component:

```kotlin
import io.micrometer.observation.Observation
import io.micrometer.observation.ObservationRegistry
import org.springframework.stereotype.Component

@Component
class CustomObservation(private val observationRegistry: ObservationRegistry) {

	fun someOperation() {
		Observation.createNotStarted("some-operation", observationRegistry)
			.lowCardinalityKeyValue("some-tag", "some-value")
			.observe {
				// Business logic ...
			}
	}

}
```

```java
import io.micrometer.observation.Observation;
import io.micrometer.observation.ObservationRegistry;

import org.springframework.stereotype.Component;

@Component
class CustomObservation {

	private final ObservationRegistry observationRegistry;

	CustomObservation(ObservationRegistry observationRegistry) {
		this.observationRegistry = observationRegistry;
	}

	void someOperation() {
		Observation observation = Observation.createNotStarted("some-operation", this.observationRegistry);
		observation.lowCardinalityKeyValue("some-tag", "some-value");
		observation.observe(() -> {
			// Business logic ...
		});
	}

}
```

This will create an observation named "some-operation" with the tag "some-tag=some-value".

> [TIP]
>
> If you want to create a span without creating a metric, you need to use the [lower-level `Tracer` API][r25] from Micrometer.

## Baggage

You can create baggage with the [`Tracer`][r26] API:

```kotlin
import io.micrometer.tracing.Tracer
import org.springframework.stereotype.Component

@Component
class CreatingBaggage(private val tracer: Tracer) {

	fun doSomething() {
		tracer.createBaggageInScope("baggage1", "value1").use {
			// Business logic
		}
	}

}
```

```java
import io.micrometer.tracing.BaggageInScope;
import io.micrometer.tracing.Tracer;

import org.springframework.stereotype.Component;

@Component
class CreatingBaggage {

	private final Tracer tracer;

	CreatingBaggage(Tracer tracer) {
		this.tracer = tracer;
	}

	void doSomething() {
		try (BaggageInScope scope = this.tracer.createBaggageInScope("baggage1", "value1")) {
			// Business logic
		}
	}

}
```

This example creates baggage named `baggage1` with the value `value1`.
The baggage is automatically propagated over the network if you’re using W3C propagation.
If you’re using B3 propagation, baggage is not automatically propagated.
To manually propagate baggage over the network, use the `management.tracing.baggage.remote-fields` configuration property (this works for W3C, too).
For the example above, setting this property to `baggage1` results in an HTTP header `baggage1: value1`.

If you want to propagate the baggage to the MDC, use the `management.tracing.baggage.correlation.fields` configuration property.
For the example above, setting this property to `baggage1` results in an MDC entry named `baggage1`.

## Tests

Tracing components which are reporting data are not auto-configured when using [`@SpringBootTest`][r27].
See [Using Tracing][r28] for more details.
