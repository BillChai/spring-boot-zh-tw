# Loggers

Spring Boot Actuator includes the ability to view and configure the log levels of your application at runtime.
You can view either the entire list or an individual logger’s configuration, which is made up of both the explicitly configured logging level as well as the effective logging level given to it by the logging framework.
These levels can be one of:

- `TRACE`
- `DEBUG`
- `INFO`
- `WARN`
- `ERROR`
- `FATAL`
- `OFF`
- `null`

`null` indicates that there is no explicit configuration.

## Configure a Logger

To configure a given logger, `POST` a partial entity to the resource’s URI, as the following example shows:

{{CODE_0}}

> [TIP]
>
> To “reset” the specific level of the logger (and use the default configuration instead), you can pass a value of `null` as the `configuredLevel`.

## OpenTelemetry

By default, logging via OpenTelemetry is not configured.
You have to provide the location of the OpenTelemetry logs endpoint to configure it:

{{CODE_1}}

{{CODE_2}}

The `management.opentelemetry.logging.export.*` configuration properties can be used to configure the [`BatchLogRecordProcessor`][r1].
For example, to change the export interval to 15 seconds:

{{CODE_3}}

{{CODE_4}}

The `management.opentelemetry.logging.limits.*` configuration properties can be used to configure log record limits.
For example, to limit the number of attributes per log record to 64 and the maximum attribute value length to 256 characters:

{{CODE_5}}

{{CODE_6}}

If you need full control, you can register a custom [`LogLimits`][r2] bean.

> [NOTE]
>
> The OpenTelemetry Logback appender and Log4j appender are not part of Spring Boot.
> For more details, see the [OpenTelemetry Logback appender][r3] or the [OpenTelemetry Log4j2 appender][r4] in the [OpenTelemetry Java instrumentation GitHub repository][r5].

> [TIP]
>
> You have to configure the appender in your `logback-spring.xml` or `log4j2-spring.xml` configuration to get OpenTelemetry logging working.

The `OpenTelemetryAppender` for both Logback and Log4j requires access to an [`OpenTelemetry`][r6] instance to function properly.
This instance must be set programmatically during application startup, which can be done like this:

{{CODE_7}}

{{CODE_8}}
