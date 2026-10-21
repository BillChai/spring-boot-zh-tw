# Metrics

Spring Boot Actuator provides dependency management and auto-configuration for [Micrometer][r1], an application metrics facade that supports [numerous monitoring systems][r2], including:

- [AppOptics][r3]
- [Atlas][r4]
- [Datadog][r5]
- [Dynatrace][r6]
- [Elastic][r7]
- [Ganglia][r8]
- [Graphite][r9]
- [Humio][r10]
- [Influx][r11]
- [JMX][r12]
- [KairosDB][r13]
- [New Relic][r14]
- [OTLP][r15]
- [Prometheus][r16]
- [Simple][r17] (in-memory)
- [Stackdriver][r18]
- [StatsD][r19]

> [TIP]
>
> To learn more about Micrometer’s capabilities, see its [reference documentation][r2], in particular the [concepts section][r20].

## Getting Started

Spring Boot auto-configures a composite [`MeterRegistry`][r21] and adds a registry to the composite for each of the supported implementations that it finds on the classpath.
Having a dependency on `micrometer-registry-{system}` in your runtime classpath is enough for Spring Boot to configure the registry.

Most registries share common features.
For instance, you can disable a particular registry even if the Micrometer registry implementation is on the classpath.
The following example disables Datadog:

{{CODE_0}}

{{CODE_1}}

You can also disable all registries unless stated otherwise by the registry-specific property, as the following example shows:

{{CODE_2}}

{{CODE_3}}

Spring Boot also adds any auto-configured registries to the global static composite registry on the [`Metrics`][r22] class, unless you explicitly tell it not to:

{{CODE_4}}

{{CODE_5}}

You can register any number of [`MeterRegistryCustomizer`][r23] beans to further configure the registry, such as applying common tags, before any meters are registered with the registry:

{{CODE_6}}

{{CODE_7}}

You can apply customizations to particular registry implementations by being more specific about the generic type:

{{CODE_8}}

{{CODE_9}}

Spring Boot also [configures built-in instrumentation][r24] that you can control through configuration or dedicated annotation markers.

## Supported Monitoring Systems

This section briefly describes each of the supported monitoring systems.

### AppOptics

By default, the AppOptics registry periodically pushes metrics to `[api.appoptics.com/v1/measurements][r25]`.
To export metrics to SaaS [AppOptics][r26], your API token must be provided:

{{CODE_10}}

{{CODE_11}}

### Atlas

By default, metrics are exported to [Atlas][r27] running on your local machine.
You can provide the location of the [Atlas server][r28]:

{{CODE_12}}

{{CODE_13}}

### Datadog

A Datadog registry periodically pushes metrics to [datadoghq][r29].
To export metrics to [Datadog][r30], you must provide your API key:

{{CODE_14}}

{{CODE_15}}

If you additionally provide an application key (optional), then metadata such as meter descriptions, types, and base units will also be exported:

{{CODE_16}}

{{CODE_17}}

By default, metrics are sent to the Datadog US [site][r31] (`[api.datadoghq.com][r32]`).
If your Datadog project is hosted on one of the other sites, or you need to send metrics through a proxy, configure the URI accordingly:

{{CODE_18}}

{{CODE_19}}

You can also change the interval at which metrics are sent to Datadog:

{{CODE_20}}

{{CODE_21}}

### Dynatrace

Dynatrace offers two metrics ingest APIs, both of which are implemented for [Micrometer][r33].
You can find the Dynatrace documentation on Micrometer metrics ingest [here][r34].

Configuration properties in the `v1` namespace apply only when exporting to the [Timeseries v1 API][r35].
Support for the V1 API is deprecated.

Configuration properties in the `v2` namespace apply only when exporting to the [Metrics v2 API][r36].

Note that this integration can export only to either the `v1` or `v2` version of the API at a time, with `v2` being strongly recommended due to the deprecation of the v1 API.
If the `device-id` (required for v1 but not used in v2) is set in the `v1` namespace, metrics are exported to the `v1` endpoint.
Otherwise, `v2` is assumed.

#### v2 API

You can use the v2 API in two ways.

##### Auto-configuration

Dynatrace auto-configuration is available for hosts that are monitored by the OneAgent or by the Dynatrace Operator for Kubernetes.

**Local OneAgent:** If a OneAgent is running on the host, metrics are automatically exported to the [local OneAgent ingest endpoint][r37].
The ingest endpoint forwards the metrics to the Dynatrace backend.

**Dynatrace Kubernetes Operator:** When running in Kubernetes with the Dynatrace Operator installed, the registry will automatically pick up your endpoint URI and API token from the operator instead.

This is the default behavior and requires no special setup beyond a dependency on `io.micrometer:micrometer-registry-dynatrace`.

##### Manual Configuration

If no auto-configuration is available, the endpoint of the [Metrics v2 API][r36] and an API token are required.
The [API token][r38] must have the “Ingest metrics” (`metrics.ingest`) permission set.
We recommend limiting the scope of the token to this one permission.
You must ensure that the endpoint URI contains the path (for example, `/api/v2/metrics/ingest`):

The URL of the Metrics API v2 ingest endpoint is different according to your deployment option:

- SaaS: `https://{your-environment-id}.live.dynatrace.com/api/v2/metrics/ingest`
- Managed deployments: `https://{your-domain}/e/{your-environment-id}/api/v2/metrics/ingest`

The example below configures metrics export using the `example` environment id:

{{CODE_22}}

{{CODE_23}}

When using the Dynatrace v2 API, the following optional features are available (more details can be found in the [Dynatrace documentation][r39]):

- Metric key prefix: Sets a prefix that is prepended to all exported metric keys.
- Enrich with Dynatrace metadata: If a OneAgent or Dynatrace operator is running, enrich metrics with additional metadata (for example, about the host, process, or pod).
- Default dimensions: Specify key-value pairs that are added to all exported metrics.
  If tags with the same key are specified with Micrometer, they overwrite the default dimensions.
- Use Dynatrace Summary instruments: In some cases the Micrometer Dynatrace registry created metrics that were rejected.
  In Micrometer 1.9.x, this was fixed by introducing Dynatrace-specific summary instruments.
  Setting this toggle to `false` forces Micrometer to fall back to the behavior that was the default before 1.9.x.
  It should only be used when encountering problems while migrating from Micrometer 1.8.x to 1.9.x.
- Export meter metadata: Starting from Micrometer 1.12.0, the Dynatrace exporter will also export meter metadata, such as unit and description by default.
  Use the `export-meter-metadata` toggle to turn this feature off.

It is possible to not specify a URI and API token, as shown in the following example.
In this scenario, the automatically configured endpoint is used:

{{CODE_24}}

{{CODE_25}}

#### v1 API (Deprecated)

The Dynatrace v1 API metrics registry pushes metrics to the configured URI periodically by using the [Timeseries v1 API][r35].
For backwards-compatibility with existing setups, when `device-id` is set (required for v1, but not used in v2), metrics are exported to the Timeseries v1 endpoint.
To export metrics to [Dynatrace][r33], your API token, device ID, and URI must be provided:

{{CODE_26}}

{{CODE_27}}

For the v1 API, you must specify the base environment URI without a path, as the v1 endpoint path is added automatically.

#### Version-independent Settings

In addition to the API endpoint and token, you can also change the interval at which metrics are sent to Dynatrace.
The default export interval is `60s`.
The following example sets the export interval to 30 seconds:

{{CODE_28}}

{{CODE_29}}

You can find more information on how to set up the Dynatrace exporter for Micrometer in the [Micrometer documentation][r33] and the [Dynatrace documentation][r34].

### Elastic

By default, metrics are exported to [Elastic][r40] running on your local machine.
You can provide the location of the Elastic server to use by using the following property:

{{CODE_30}}

{{CODE_31}}

### Ganglia

By default, metrics are exported to [Ganglia][r41] running on your local machine.
You can provide the [Ganglia server][r42] host and port, as the following example shows:

{{CODE_32}}

{{CODE_33}}

### Graphite

By default, metrics are exported to [Graphite][r43] running on your local machine.
You can provide the [Graphite server][r44] host and port, as the following example shows:

{{CODE_34}}

{{CODE_35}}

Micrometer provides a default [`HierarchicalNameMapper`][r45] that governs how a dimensional meter ID is [mapped to flat hierarchical names][r46].

> [TIP]
>
> To take control over this behavior, define your [`GraphiteMeterRegistry`][r47] and supply your own [`HierarchicalNameMapper`][r45].
> Auto-configured [`GraphiteConfig`][r48] and [`Clock`][r49] beans are provided unless you define your own:
>
{{CODE_36}}
>
{{CODE_37}}

### Humio

By default, the Humio registry periodically pushes metrics to [cloud.humio.com][r50].
To export metrics to SaaS [Humio][r51], you must provide your API token:

{{CODE_38}}

{{CODE_39}}

You should also configure one or more tags to identify the data source to which metrics are pushed:

{{CODE_40}}

{{CODE_41}}

### Influx

By default, metrics are exported to an [Influx][r52] v1 instance running on your local machine with the default configuration.
To export metrics to InfluxDB v2, configure the `org`, `bucket`, and authentication `token` for writing metrics.
You can provide the location of the [Influx server][r53] to use by using:

{{CODE_42}}

{{CODE_43}}

### JMX

Micrometer provides a hierarchical mapping to [JMX][r54], primarily as a cheap and portable way to view metrics locally.
By default, metrics are exported to the `metrics` JMX domain.
You can provide the domain to use by using:

{{CODE_44}}

{{CODE_45}}

Micrometer provides a default [`HierarchicalNameMapper`][r45] that governs how a dimensional meter ID is [mapped to flat hierarchical names][r55].

> [TIP]
>
> To take control over this behavior, define your [`JmxMeterRegistry`][r56] and supply your own [`HierarchicalNameMapper`][r45].
> Auto-configured [`JmxConfig`][r57] and [`Clock`][r49] beans are provided unless you define your own:
>
{{CODE_46}}
>
{{CODE_47}}

### KairosDB

By default, metrics are exported to [KairosDB][r58] running on your local machine.
You can provide the location of the [KairosDB server][r59] to use by using:

{{CODE_48}}

{{CODE_49}}

### New Relic

A New Relic registry periodically pushes metrics to [New Relic][r60].
To export metrics to [New Relic][r61], you must provide your API key and account ID:

{{CODE_50}}

{{CODE_51}}

You can also change the interval at which metrics are sent to New Relic:

{{CODE_52}}

{{CODE_53}}

By default, metrics are published through REST calls, but you can also use the Java Agent API if you have it on the classpath:

{{CODE_54}}

{{CODE_55}}

Finally, you can take full control by defining your own [`NewRelicClientProvider`][r62] bean.

### OTLP

By default, metrics are exported over the [OpenTelemetry protocol (OTLP)][r63] to a consumer running on your local machine.
To export to another location, provide the location of the [OTLP metrics endpoint][r64] using `management.otlp.metrics.export.url`:

{{CODE_56}}

{{CODE_57}}

Custom headers, for example for authentication, can also be provided using `management.otlp.metrics.export.headers.*` properties.

If an `OtlpMetricsSender` bean is available, it will be configured on the `OtlpMeterRegistry` that Spring Boot auto-configures.

[OTLP Exemplars][r65] are also supported.
To enable this feature, an [`ExemplarContextProvider`][r66] bean should be present.
If you use [Micrometer Tracing][r67], this will be auto-configured for you.
By default, only sampled traces are included as exemplars.
You can control this behavior using the `management.tracing.exemplars.include` property.

### Prometheus

[Prometheus][r68] expects to scrape or poll individual application instances for metrics.
Spring Boot provides an actuator endpoint at `/actuator/prometheus` to present a [Prometheus scrape][r69] with the appropriate format.

> [TIP]
>
> By default, the endpoint is not available and must be exposed. See [exposing endpoints][r70] for more details.

The following example `scrape_config` adds to `prometheus.yml`:

{{CODE_58}}

[Prometheus Exemplars][r71] are also supported.
To enable this feature, a [`SpanContext`][r72] bean should be present.
If you’re using the deprecated Prometheus simpleclient support and want to enable that feature, a [`SpanContextSupplier`][r73] bean should be present.
If you use [Micrometer Tracing][r74], this will be auto-configured for you, but you can always create your own if you want.
By default, only sampled traces are included as exemplars.
You can control this behavior using the `management.tracing.exemplars.include` property.
The value `all` is not supported with Prometheus.
Please check the [Prometheus Docs][r71], since this feature needs to be explicitly enabled on Prometheus' side, and it is only supported using the [OpenMetrics][r75] format.

For ephemeral or batch jobs that may not exist long enough to be scraped, you can use [Prometheus Pushgateway][r76] support to expose the metrics to Prometheus.

To enable Prometheus Pushgateway support, add the following dependency to your project:

{{CODE_59}}

When the Prometheus Pushgateway dependency is present on the classpath and the `management.prometheus.metrics.export.pushgateway.enabled` property is set to `true`, a [`PrometheusPushGatewayManager`][r77] bean is auto-configured.
This manages the pushing of metrics to a Prometheus Pushgateway.

You can tune the [`PrometheusPushGatewayManager`][r77] by using properties under `management.prometheus.metrics.export.pushgateway`.
For advanced configuration, you can also provide your own [`PrometheusPushGatewayManager`][r77] bean.

### Simple

Micrometer ships with a simple, in-memory backend that is automatically used as a fallback if no other registry is configured.
This lets you see what metrics are collected in the [metrics endpoint][r78].

The in-memory backend disables itself as soon as you use any other available backend.
You can also disable it explicitly:

{{CODE_60}}

{{CODE_61}}

### Stackdriver

The Stackdriver registry periodically pushes metrics to [Stackdriver][r79].
To export metrics to SaaS [Stackdriver][r80], you must provide your Google Cloud project ID:

{{CODE_62}}

{{CODE_63}}

You can also change the interval at which metrics are sent to Stackdriver:

{{CODE_64}}

{{CODE_65}}

### StatsD

The StatsD registry eagerly pushes metrics over UDP to a StatsD agent.
By default, metrics are exported to a [StatsD][r81] agent running on your local machine.
You can provide the StatsD agent host, port, and protocol to use by using:

{{CODE_66}}

{{CODE_67}}

You can also change the StatsD line protocol to use (it defaults to Datadog):

{{CODE_68}}

{{CODE_69}}

## Supported Metrics and Meters

Spring Boot provides automatic meter registration for a wide variety of technologies.
In most situations, the defaults provide sensible metrics that can be published to any of the supported monitoring systems.

### JVM Metrics

Auto-configuration enables JVM Metrics by using core Micrometer classes.
JVM metrics are published under the `jvm.` meter name.

The following JVM metrics are provided:

- Various memory and buffer pool details
- Statistics related to garbage collection
- Thread utilization
- [Virtual threads statistics][r82] (for this, `io.micrometer:micrometer-java21` has to be on the classpath)
- The number of classes loaded and unloaded
- JVM version information
- JIT compilation time

### System Metrics

Auto-configuration enables system metrics by using core Micrometer classes.
System metrics are published under the `system.`, `process.`, and `disk.` meter names.

The following system metrics are provided:

- CPU metrics
- File descriptor metrics
- Uptime metrics (both the amount of time the application has been running and a fixed gauge of the absolute start time)
- Disk space available

### Application Startup Metrics

Auto-configuration exposes application startup time metrics:

- `application.started.time`: time taken to start the application.
- `application.ready.time`: time taken for the application to be ready to service requests.

Metrics are tagged by the fully qualified name of the application class.

### Logger Metrics

Auto-configuration enables the event metrics for both Logback and Log4J2.
The details are published under the `log4j2.events.` or `logback.events.` meter names.

### Task Execution and Scheduling Metrics

Auto-configuration enables the instrumentation of all available [`ThreadPoolTaskExecutor`][r83] and [`ThreadPoolTaskScheduler`][r84] beans, as long as the underling [`ThreadPoolExecutor`][r85] is available.
Metrics are tagged by the name of the executor, which is derived from the bean name.

### JMS Metrics

Auto-configuration enables the instrumentation of all available [`JmsTemplate`][r86] beans and [`@JmsListener`][r87] annotated methods.
This will produce `"jms.message.publish"` and `"jms.message.process"` metrics respectively.
See the [Spring Framework reference documentation for more information on produced observations][r88].

> [NOTE]
>
> [`JmsClient`][r89] and [`JmsMessagingTemplate`][r90] that uses a [`JmsTemplate`][r86] bean are also instrumented.

### Spring MVC Metrics

Auto-configuration enables the instrumentation of all requests handled by Spring MVC controllers and functional handlers.
By default, metrics are generated with the name, `http.server.requests`.
You can customize the name by setting the `management.observations.http.server.requests.name` property.

See the [Spring Framework reference documentation for more information on produced observations][r91].

To add to the default tags, provide a [`@Bean`][r92] that extends [`DefaultServerRequestObservationConvention`][r93] from the `org.springframework.http.server.observation` package.
To replace the default tags, provide a [`@Bean`][r92] that implements [`ServerRequestObservationConvention`][r94].

> [TIP]
>
> In some cases, exceptions handled in web controllers are not recorded as request metrics tags.
> Applications can opt in and record exceptions by [setting handled exceptions as request attributes][r95].

By default, all requests are handled.
To customize the filter, provide a [`@Bean`][r92] that implements `FilterRegistrationBean<ServerHttpObservationFilter>`.

### Spring WebFlux Metrics

Auto-configuration enables the instrumentation of all requests handled by Spring WebFlux controllers and functional handlers.
By default, metrics are generated with the name, `http.server.requests`.
You can customize the name by setting the `management.observations.http.server.requests.name` property.

See the [Spring Framework reference documentation for more information on produced observations][r96].

To add to the default tags, provide a [`@Bean`][r92] that extends [`DefaultServerRequestObservationConvention`][r97] from the `org.springframework.http.server.reactive.observation` package.
To replace the default tags, provide a [`@Bean`][r92] that implements [`ServerRequestObservationConvention`][r98].

> [TIP]
>
> In some cases, exceptions handled in controllers and handler functions are not recorded as request metrics tags.
> Applications can opt in and record exceptions by [setting handled exceptions as request attributes][r99].

### Jersey Server Metrics

Auto-configuration enables the instrumentation of all requests handled by the Jersey JAX-RS implementation.
By default, metrics are generated with the name, `http.server.requests`.
You can customize the name by setting the `management.observations.http.server.requests.name` property.

By default, Jersey server metrics are tagged with the following information:

| Tag | Description |
| --- | --- |
| `exception` | The simple class name of any exception that was thrown while handling the request. |
| `method` | The request’s method (for example, `GET` or `POST`) |
| `outcome` | The request’s outcome, based on the status code of the response. 1xx is `INFORMATIONAL`, 2xx is `SUCCESS`, 3xx is `REDIRECTION`, 4xx is `CLIENT_ERROR`, and 5xx is `SERVER_ERROR` |
| `status` | The response’s HTTP status code (for example, `200` or `500`) |
| `uri` | The request’s URI template prior to variable substitution, if possible (for example, `/api/person/{id}`) |

To customize the tags, provide a [`@Bean`][r92] that implements [`JerseyObservationConvention`][r100].

### SSL Bundle Metrics

Spring Boot Actuator publishes expiry metrics about SSL bundles.
The metric `ssl.chain.expiry` gauges the expiry date of each certificate chain in key stores and trust stores in seconds.
This number will be negative if the chain has already expired.
This metric is tagged with the following information:

| Tag | Description |
| --- | --- |
| `bundle` | The name of the bundle which contains the certificate chain |
| `certificate` | The serial number (in hex format) of the certificate which is the soonest to expire in the chain |
| `chain` | The name of the certificate chain. |
| `source` | Whether the certificate chain comes from the key store (`keystore`) or trust store (`truststore`) |

### HTTP Client Metrics

Spring Boot Actuator manages the instrumentation of [`RestTemplate`][r101], [`WebClient`][r102] and [`RestClient`][r103].
For that, you have to inject the auto-configured builder and use it to create instances:

- [`RestTemplateBuilder`][r104] for [`RestTemplate`][r101]
- [`WebClient.Builder`][r105] for [`WebClient`][r102]
- [`RestClient.Builder`][r106] for [`RestClient`][r103]

You can also manually apply the customizers responsible for this instrumentation, namely [`ObservationRestTemplateCustomizer`][r107], [`ObservationWebClientCustomizer`][r108] and [`ObservationRestClientCustomizer`][r109].

By default, metrics are generated with the name, `http.client.requests`.
You can customize the name by setting the `management.observations.http.client.requests.name` property.

See the [Spring Framework reference documentation for more information on produced observations][r110].

To customize the tags when using [`RestTemplate`][r101] or [`RestClient`][r103], provide a [`@Bean`][r92] that implements [`ClientRequestObservationConvention`][r111] from the `org.springframework.http.client.observation` package.
To customize the tags when using [`WebClient`][r102], provide a [`@Bean`][r92] that implements [`ClientRequestObservationConvention`][r112] from the `org.springframework.web.reactive.function.client` package.

### Tomcat Metrics

Auto-configuration enables the instrumentation of Tomcat only when an MBean [`Registry`][r113] is enabled.
By default, the MBean registry is disabled, but you can enable it by setting `server.tomcat.mbeanregistry.enabled` to `true`.

Tomcat metrics are published under the `tomcat.` meter name.

### Cache Metrics

Auto-configuration enables the instrumentation of all available [`Cache`][r114] instances on startup, with metrics prefixed with `cache`.
Cache instrumentation is standardized for a basic set of metrics.
Additional, cache-specific metrics are also available.

The following cache libraries are supported:

- Cache2k
- Caffeine
- Hazelcast
- Any compliant JCache (JSR-107) implementation
- Redis

> [WARNING]
>
> Metrics should be enabled for the auto-configuration to pick them up.
> Refer to the documentation of the cache library you are using for more details.

Metrics are tagged by the name of the cache and by the name of the [`CacheManager`][r115], which is derived from the bean name.

> [NOTE]
>
> Only caches that are configured on startup are bound to the registry.
> For caches not defined in the cache’s configuration, such as caches created on the fly or programmatically after the startup phase, an explicit registration is required.
> A [`CacheMetricsRegistrar`][r116] bean is made available to make that process easier.

### Spring Batch Metrics

See the [Spring Batch reference documentation][r117].

### Spring GraphQL Metrics

See the [Spring GraphQL reference documentation][r118].

### DataSource Metrics

Auto-configuration enables the instrumentation of all available [`DataSource`][r119] objects with metrics prefixed with `jdbc.connections`.
Data source instrumentation results in gauges that represent the currently active, idle, maximum allowed, and minimum allowed connections in the pool.

Metrics are also tagged by the name of the [`DataSource`][r119] computed based on the bean name.

> [TIP]
>
> By default, Spring Boot provides metadata for all supported data sources.
> You can add additional [`DataSourcePoolMetadataProvider`][r120] beans if your favorite data source is not supported.
> See [`DataSourcePoolMetadataProvidersConfiguration`][r121] for examples.

Also, Hikari-specific metrics are exposed with a `hikaricp` prefix.
Each metric is tagged by the name of the pool (you can control it with `spring.datasource.name`).

### Hibernate Metrics

If `org.hibernate.orm:hibernate-micrometer` is on the classpath, all available Hibernate [`EntityManagerFactory`][r122] instances that have statistics enabled are instrumented with a metric named `hibernate`.

Metrics are also tagged by the name of the [`EntityManagerFactory`][r122], which is derived from the bean name.

To enable statistics, the standard JPA property `hibernate.generate_statistics` must be set to `true`.
You can enable that on the auto-configured [`EntityManagerFactory`][r122]:

{{CODE_70}}

{{CODE_71}}

### Spring Data Repository Metrics

Auto-configuration enables the instrumentation of all Spring Data [`Repository`][r123] method invocations.
By default, metrics are generated with the name, `spring.data.repository.invocations`.
You can customize the name by setting the `management.metrics.data.repository.metric-name` property.

The [`@Timed`][r124] annotation from the `io.micrometer.core.annotation` package is supported on [`Repository`][r123] interfaces and methods.
If you do not want to record metrics for all [`Repository`][r123] invocations, you can set `management.metrics.data.repository.autotime.enabled` to `false` and exclusively use [`@Timed`][r124] annotations instead.

> [NOTE]
>
> A [`@Timed`][r124] annotation with `longTask = true` enables a long task timer for the method.
> Long task timers require a separate metric name and can be stacked with a short task timer.

By default, repository invocation related metrics are tagged with the following information:

| Tag | Description |
| --- | --- |
| `repository` | The simple class name of the source [`Repository`][r123]. |
| `method` | The name of the [`Repository`][r123] method that was invoked. |
| `state` | The result state (`SUCCESS`, `ERROR`, `CANCELED`, or `RUNNING`). |
| `exception` | The simple class name of any exception that was thrown from the invocation. |

To replace the default tags, provide a [`@Bean`][r92] that implements [`RepositoryTagsProvider`][r125].

### RabbitMQ Metrics

Auto-configuration enables the instrumentation of all available RabbitMQ connection factories with a metric named `rabbitmq`.

### Spring Integration Metrics

Spring Integration automatically provides [Micrometer support][r126] whenever a [`MeterRegistry`][r21] bean is available.
Metrics are published under the `spring.integration.` meter name.

### Kafka Metrics

Auto-configuration registers a [`MicrometerConsumerListener`][r127] and [`MicrometerProducerListener`][r128] for the auto-configured consumer factory and producer factory, respectively.
It also registers a [`KafkaStreamsMicrometerListener`][r129] for [`StreamsBuilderFactoryBean`][r130].
For more detail, see the [Micrometer Native Metrics][r131] section of the Spring Kafka documentation.

### MongoDB Metrics

This section briefly describes the available metrics for MongoDB.

#### MongoDB Command Metrics

Auto-configuration registers a [`MongoMetricsCommandListener`][r132] with the auto-configured [`MongoClient`][r133].

A timer metric named `mongodb.driver.commands` is created for each command issued to the underlying MongoDB driver.
Each metric is tagged with the following information by default:

| Tag | Description |
| --- | --- |
| `command` | The name of the command issued. |
| `cluster.id` | The identifier of the cluster to which the command was sent. |
| `server.address` | The address of the server to which the command was sent. |
| `status` | The outcome of the command (`SUCCESS` or `FAILED`). |

To replace the default metric tags, define a [`MongoCommandTagsProvider`][r134] bean, as the following example shows:

{{CODE_72}}

{{CODE_73}}

To disable the auto-configured command metrics, set the following property:

{{CODE_74}}

{{CODE_75}}

#### MongoDB Connection Pool Metrics

Auto-configuration registers a [`MongoMetricsConnectionPoolListener`][r135] with the auto-configured [`MongoClient`][r133].

The following gauge metrics are created for the connection pool:

- `mongodb.driver.pool.size` reports the current size of the connection pool, including idle and in-use members.
- `mongodb.driver.pool.checkedout` reports the count of connections that are currently in use.
- `mongodb.driver.pool.waitqueuesize` reports the current size of the wait queue for a connection from the pool.

Each metric is tagged with the following information by default:

| Tag | Description |
| --- | --- |
| `cluster.id` | The identifier of the cluster to which the connection pool corresponds. |
| `server.address` | The address of the server to which the connection pool corresponds. |

To replace the default metric tags, define a [`MongoConnectionPoolTagsProvider`][r136] bean:

{{CODE_76}}

{{CODE_77}}

To disable the auto-configured connection pool metrics, set the following property:

{{CODE_78}}

{{CODE_79}}

### Neo4j Metrics

Auto-configuration registers a [`MicrometerObservationProvider`][r137] for the auto-configured [`Driver`][r138].

To override this behavior, you can register a [`ConfigBuilderCustomizer`][r139] bean with an order higher than zero.

### Jetty Metrics

Auto-configuration binds metrics for Jetty’s [`ThreadPool`][r140] by using Micrometer’s [`JettyServerThreadPoolMetrics`][r141].
Metrics for Jetty’s [`Connector`][r142] instances are bound by using Micrometer’s [`JettyConnectionMetrics`][r143] and, when `server.ssl.enabled` is set to `true`, Micrometer’s [`JettySslHandshakeMetrics`][r144].

### Redis Metrics

Auto-configuration registers a [`MicrometerTracing`][r145] for the auto-configured [`LettuceConnectionFactory`][r146].
For more detail, see the [Observability section][r147] of the Lettuce documentation.

## Registering Custom Metrics

To register custom metrics, inject [`MeterRegistry`][r21] into your component:

{{CODE_80}}

{{CODE_81}}

If your metrics depend on other beans, we recommend that you use a [`MeterBinder`][r148] to register them:

{{CODE_82}}

{{CODE_83}}

Using a [`MeterBinder`][r148] ensures that the correct dependency relationships are set up and that the bean is available when the metric’s value is retrieved.
A [`MeterBinder`][r148] implementation can also be useful if you find that you repeatedly instrument a suite of metrics across components or applications.

> [NOTE]
>
> By default, metrics from all [`MeterBinder`][r148] beans are automatically bound to the Spring-managed [`MeterRegistry`][r21].

## Customizing Individual Metrics

If you need to apply customizations to specific [`Meter`][r149] instances, you can use the [`MeterFilter`][r150] interface.

For example, if you want to rename the `mytag.region` tag to `mytag.area` for all meter IDs beginning with `com.example`, you can do the following:

{{CODE_84}}

{{CODE_85}}

> [NOTE]
>
> By default, all [`MeterFilter`][r150] beans are automatically bound to the Spring-managed [`MeterRegistry`][r21].
> Make sure to register your metrics by using the Spring-managed [`MeterRegistry`][r21] and not any of the static methods on [`Metrics`][r22].
> These use the global registry that is not Spring-managed.

### Common Tags

Common tags are generally used for dimensional drill-down on the operating environment, such as host, instance, region, stack, and others.
Commons tags are applied to all meters and can be configured, as the following example shows:

{{CODE_86}}

{{CODE_87}}

The preceding example adds `region` and `stack` tags to all meters with a value of `us-east-1` and `prod`, respectively.

> [NOTE]
>
> The order of common tags is important if you use Graphite.
> As the order of common tags cannot be guaranteed by using this approach, Graphite users are advised to define a custom [`MeterFilter`][r150] instead.

### Per-meter Properties

In addition to [`MeterFilter`][r150] beans, you can apply a limited set of customization on a per-meter basis using properties.
Per-meter customizations are applied, using Spring Boot’s [`PropertiesMeterFilter`][r151], to any meter IDs that start with the given name.
The following example filters out any meters that have an ID starting with `example.remote`.

{{CODE_88}}

{{CODE_89}}

The following properties allow per-meter customization:

Table 1. Per-meter customizations

| Property | Description |
| --- | --- |
| `management.metrics.enable` | Whether to accept meters with certain IDs. Meters that are not accepted are filtered from the [`MeterRegistry`][r21]. |
| `management.metrics.distribution.percentiles-histogram` | Whether to publish a histogram suitable for computing aggregable (across dimension) percentile approximations. |
| `management.metrics.distribution.minimum-expected-value`, `management.metrics.distribution.maximum-expected-value` | Publish fewer histogram buckets by clamping the range of expected values. |
| `management.metrics.distribution.percentiles` | Publish percentile values computed in your application |
| `management.metrics.distribution.expiry`, `management.metrics.distribution.buffer-length` | Give greater weight to recent samples by accumulating them in ring buffers which rotate after a configurable expiry, with a configurable buffer length. |
| `management.metrics.distribution.slo` | Publish a cumulative histogram with buckets defined by your service-level objectives. |

For more details on the concepts behind `percentiles-histogram`, `percentiles`, and `slo`, see the [Histograms and percentiles][r152] section of the Micrometer documentation.

## Metrics Endpoint

Spring Boot provides a `metrics` endpoint that you can use diagnostically to examine the metrics collected by an application.
The endpoint is not available by default and must be exposed.
See [exposing endpoints][r70] for more details.

Navigating to `/actuator/metrics` displays a list of available meter names.
You can drill down to view information about a particular meter by providing its name as a selector — for example, `/actuator/metrics/jvm.memory.max`.

> [TIP]
>
> The name you use here should match the name used in the code, not the name after it has been naming-convention normalized for a monitoring system to which it is shipped.
> In other words, if `jvm.memory.max` appears as `jvm_memory_max` in Prometheus because of its snake case naming convention, you should still use `jvm.memory.max` as the selector when inspecting the meter in the `metrics` endpoint.

You can also add any number of `tag=KEY:VALUE` query parameters to the end of the URL to dimensionally drill down on a meter — for example, `/actuator/metrics/jvm.memory.max?tag=area:nonheap`.

> [TIP]
>
> The reported measurements are the *sum* of the statistics of all meters that match the meter name and any tags that have been applied.
> In the preceding example, the returned `Value` statistic is the sum of the maximum memory footprints of the “Code Cache”, “Compressed Class Space”, and “Metaspace” areas of the heap.
> If you wanted to see only the maximum size for the “Metaspace”, you could add an additional `tag=id:Metaspace` — that is, `/actuator/metrics/jvm.memory.max?tag=area:nonheap&tag=id:Metaspace`.

## Integration with Micrometer Observation

A [`DefaultMeterObservationHandler`][r153] is automatically registered on the [`ObservationRegistry`][r154], which creates metrics for every completed observation.
