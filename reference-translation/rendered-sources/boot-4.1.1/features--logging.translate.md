# Logging

Spring Boot uses [Commons Logging][r1] for all internal logging but leaves the underlying log implementation open.
Default configurations are provided for [Java Util Logging][r2], [Log4j2][r3], and [Logback][r4].
In each case, loggers are pre-configured to use console output with optional file output also available.

By default, if you use the starters, Logback is used for logging.
Appropriate Logback routing is also included to ensure that dependent libraries that use Java Util Logging, Commons Logging, Log4J, or SLF4J all work correctly.

> [TIP]
>
> There are a lot of logging frameworks available for Java.
> Do not worry if the above list seems confusing.
> Generally, you do not need to change your logging dependencies and the Spring Boot defaults work just fine.

> [TIP]
>
> When you deploy your application to a servlet container or application server, logging performed with the Java Util Logging API is not routed into your application’s logs.
> This prevents logging performed by the container or other applications that have been deployed to it from appearing in your application’s logs.

## Log Format

The default log output from Spring Boot resembles the following example:

{{CODE_0}}

The following items are output:

- Date and Time: Millisecond precision and easily sortable.
- Log Level: `ERROR`, `WARN`, `INFO`, `DEBUG`, or `TRACE`.
- Process ID.
- A `---` separator to distinguish the start of actual log messages.
- Application name: Enclosed in square brackets (logged by default only if `spring.application.name` is set)
- Application group: Enclosed in square brackets (logged by default only if `spring.application.group` is set)
- Thread name: Enclosed in square brackets (may be truncated for console output).
- Correlation ID: If tracing is enabled (not shown in the sample above)
- Logger name: This is usually the source class name (often abbreviated).
- The log message.

> [NOTE]
>
> Logback does not have a `FATAL` level.
> It is mapped to `ERROR`.

> [TIP]
>
> If you have a `spring.application.name` property but don’t want it logged you can set `logging.include-application-name` to `false`.

> [TIP]
>
> If you have a `spring.application.group` property but don’t want it logged you can set `logging.include-application-group` to `false`.

> [TIP]
>
> For more details about correlation IDs, please [see this documentation][r5].

## Console Output

The default log configuration echoes messages to the console as they are written.
By default, `ERROR`-level, `WARN`-level, and `INFO`-level messages are logged.
You can also enable a “debug” mode by starting your application with a `--debug` flag.

{{CODE_1}}

> [NOTE]
>
> You can also specify `debug=true` in your `application.properties`.

When the debug mode is enabled, a selection of core loggers (embedded container, Hibernate, and Spring Boot) are configured to output more information.
Enabling the debug mode does *not* configure your application to log all messages with `DEBUG` level.

Alternatively, you can enable a “trace” mode by starting your application with a `--trace` flag (or `trace=true` in your `application.properties`).
Doing so enables trace logging for a selection of core loggers (embedded container, Hibernate schema generation, and the whole Spring portfolio).

If you want to disable console-based logging, you can set the `logging.console.enabled` property to `false`.

### Color-coded Output

If your terminal supports ANSI, color output is used to aid readability.
You can set `spring.output.ansi.enabled` to a [supported value][r6] to override the auto-detection.

Color coding is configured by using the `%clr` conversion word.
In its simplest form, the converter colors the output according to the log level, as shown in the following example:

{{CODE_2}}

The following table describes the mapping of log levels to colors:

| Level | Color |
| --- | --- |
| `FATAL` | Red |
| `ERROR` | Red |
| `WARN` | Yellow |
| `INFO` | Green |
| `DEBUG` | Green |
| `TRACE` | Green |

Alternatively, you can specify the color and styles that should be used by providing them as options to the conversion.
For example, to make the text yellow and bold, use the following setting:

{{CODE_3}}

The following text colors are supported:

- `black`
- `blue`
- `bright_black`
- `bright_blue`
- `bright_cyan`
- `bright_green`
- `bright_magenta`
- `bright_red`
- `bright_white`
- `bright_yellow`
- `cyan`
- `green`
- `magenta`
- `red`
- `white`
- `yellow`

The following background colors are supported:

- `bg_black`
- `bg_blue`
- `bg_bright_black`
- `bg_bright_blue`
- `bg_bright_cyan`
- `bg_bright_green`
- `bg_bright_magenta`
- `bg_bright_red`
- `bg_bright_white`
- `bg_bright_yellow`
- `bg_cyan`
- `bg_green`
- `bg_magenta`
- `bg_red`
- `bg_white`
- `bg_yellow`

The following styles are supported:

- `bold`
- `faint`
- `italic`
- `normal`
- `reverse`
- `underline`

## File Output

By default, Spring Boot logs only to the console and does not write log files.
If you want to write log files in addition to the console output, you need to set a `logging.file.name` or `logging.file.path` property (for example, in your `application.properties`).
If both properties are set, `logging.file.path` is ignored and only `logging.file.name` is used.

The following table shows how the `logging.*` properties can be used together:

Table 1. Logging properties

| `logging.file.name` | `logging.file.path` | Description |
| --- | --- | --- |
| *(none)* | *(none)* | Console only logging. |
| Specific file (for example, `my.log`) | *(none)* | Writes to the location specified by `logging.file.name`. The location can be absolute or relative to the current directory. |
| *(none)* | Specific directory (for example, `/var/log`) | Writes `spring.log` to the directory specified by `logging.file.path`. The directory can be absolute or relative to the current directory. |
| Specific file | Specific directory | Writes to the location specified by `logging.file.name` and ignores `logging.file.path`. The location can be absolute or relative to the current directory. |

Log files rotate when they reach 10 MB and, as with console output, `ERROR`-level, `WARN`-level, and `INFO`-level messages are logged by default.
Note that Log4J2 requires `logging.file.path` to be set with such configuration.

> [TIP]
>
> Logging properties are independent of the actual logging infrastructure.
> As a result, specific configuration keys (such as `logback.configurationFile` for Logback) are not managed by spring Boot.

## File Rotation

If you are using Logback or Log4j2, it is possible to fine-tune log rotation settings using your `application.properties` or `application.yaml` file.
For all other logging system, you will need to configure rotation settings directly yourself.

The following rotation policy properties are supported for Logback:

| Name | Description |
| --- | --- |
| `logging.logback.rollingpolicy.file-name-pattern` | The filename pattern used to create log archives. |
| `logging.logback.rollingpolicy.clean-history-on-start` | If log archive cleanup should occur when the application starts. |
| `logging.logback.rollingpolicy.max-file-size` | The maximum size of log file before it is archived. |
| `logging.logback.rollingpolicy.total-size-cap` | The maximum amount of size log archives can take before being deleted. |
| `logging.logback.rollingpolicy.max-history` | The maximum number of archive log files to keep (defaults to 7). |

If you are using Log4j2, the following rotation policy properties are available:

| Name | Description |
| --- | --- |
| `logging.log4j2.rollingpolicy.file-name-pattern` | The filename pattern used to create log archives. |
| `logging.log4j2.rollingpolicy.max-file-size` | The maximum size of log file before it is archived (defaults to 10MB). |
| `logging.log4j2.rollingpolicy.max-history` | The maximum number of archive log files to keep (defaults to 7). |
| `logging.log4j2.rollingpolicy.strategy` | Rolling policy strategy (defaults to 'size'). |
| `logging.log4j2.rollingpolicy.cron` | Cron expression used when the strategy is 'cron' (default to every day at midnight). |
| `logging.log4j2.rollingpolicy.time-interval` | Time based triggering interval when the strategy is 'time' or 'size-and-time' (default to 1). |
| `logging.log4j2.rollingpolicy.time-modulate` | Whether to align the next rollover time to occur at the top of the interval when the strategy is time based (defaults to `false`). |

## Log Levels

All the supported logging systems can have the logger levels set in the Spring [`Environment`][r7] (for example, in `application.properties`) by using `logging.level.<logger-name>=<level>` where `level` is one of TRACE, DEBUG, INFO, WARN, ERROR, FATAL, or OFF.
The `root` logger can be configured by using `logging.level.root`.

The following example shows potential logging settings in `application.properties`:

{{CODE_4}}

{{CODE_5}}

It is also possible to set logging levels using environment variables.
For example, `LOGGING_LEVEL_ORG_SPRINGFRAMEWORK_WEB=DEBUG` will set `org.springframework.web` to `DEBUG`.

> [NOTE]
>
> The above approach will only work for package level logging.
> Since relaxed binding [always converts environment variables to lowercase][r8], it is not possible to configure logging for an individual class in this way.
> If you need to configure logging for a class, you can use [the `SPRING_APPLICATION_JSON`][r9] variable.

## Log Groups

It is often useful to be able to group related loggers together so that they can all be configured at the same time.
For example, you might commonly change the logging levels for *all* Tomcat related loggers, but you can not easily remember top level packages.

To help with this, Spring Boot allows you to define logging groups in your Spring [`Environment`][r7].
For example, here is how you could define a “tomcat” group by adding it to your `application.properties`:

{{CODE_6}}

{{CODE_7}}

Once defined, you can change the level for all the loggers in the group with a single line:

{{CODE_8}}

{{CODE_9}}

Spring Boot includes the following pre-defined logging groups that can be used out-of-the-box:

| Name | Loggers |
| --- | --- |
| web | `org.springframework.core.codec`, `org.springframework.http`, `org.springframework.web`, `org.springframework.boot.actuate.endpoint.web`, `org.springframework.boot.web.servlet.ServletContextInitializerBeans` |
| sql | `org.springframework.jdbc.core`, `org.hibernate.SQL`, [`LoggerListener`][r10] |

## Using a Log Shutdown Hook

In order to release logging resources when your application terminates, a shutdown hook that will trigger log system cleanup when the JVM exits is provided.
This shutdown hook is registered automatically unless your application is deployed as a war file.
If your application has complex context hierarchies the shutdown hook may not meet your needs.
If it does not, disable the shutdown hook and investigate the options provided directly by the underlying logging system.
For example, Logback offers [context selectors][r11] which allow each Logger to be created in its own context.
You can use the `logging.register-shutdown-hook` property to disable the shutdown hook.
Setting it to `false` will disable the registration.
You can set the property in your `application.properties` or `application.yaml` file:

{{CODE_10}}

{{CODE_11}}

## Custom Log Configuration

The various logging systems can be activated by including the appropriate libraries on the classpath and can be further customized by providing a suitable configuration file in the root of the classpath or in a location specified by the following Spring [`Environment`][r7] property: `logging.config`.

You can force Spring Boot to use a particular logging system by using the `org.springframework.boot.logging.LoggingSystem` system property.
The value should be the fully qualified class name of a [`LoggingSystem`][r12] implementation.
You can also disable Spring Boot’s logging configuration entirely by using a value of `none`.

> [NOTE]
>
> Since logging is initialized **before** the [`ApplicationContext`][r13] is created, it is not possible to control logging from [`@PropertySources`][r14] in Spring [`@Configuration`][r15] files.
> The only way to change the logging system or disable it entirely is through System properties.

Depending on your logging system, the following files are loaded:

| Logging System | Customization |
| --- | --- |
| Logback | `logback-spring.xml`, `logback-spring.groovy`, `logback.xml`, or `logback.groovy` |
| Log4j2 | `log4j2-spring.xml` or `log4j2.xml` |
| JDK (Java Util Logging) | `logging.properties` |

> [NOTE]
>
> When possible, we recommend that you use the `-spring` variants for your logging configuration (for example, `logback-spring.xml` rather than `logback.xml`).
> If you use standard configuration locations, Spring cannot completely control log initialization.

> [WARNING]
>
> There are known classloading issues with Java Util Logging that cause problems when running from an 'executable jar'.
> We recommend that you avoid it when running from an 'executable jar' if at all possible.

To help with the customization, some other properties are transferred from the Spring [`Environment`][r7] to System properties.
This allows the properties to be consumed by logging system configuration. For example, setting `logging.file.name` in `application.properties` or `LOGGING_FILE_NAME` as an environment variable will result in the `LOG_FILE` System property being set.
The properties that are transferred are described in the following table:

| Spring Environment | System Property | Comments |
| --- | --- | --- |
| `logging.exception-conversion-word` | `LOG_EXCEPTION_CONVERSION_WORD` | The conversion word used when logging exceptions. |
| `logging.file.name` | `LOG_FILE` | If defined, it is used in the default log configuration. |
| `logging.file.path` | `LOG_PATH` | If defined, it is used in the default log configuration. |
| `logging.pattern.console` | `CONSOLE_LOG_PATTERN` | The log pattern to use on the console (stdout). |
| `logging.pattern.dateformat` | `LOG_DATEFORMAT_PATTERN` | Appender pattern for log date format. |
| `logging.charset.console` | `CONSOLE_LOG_CHARSET` | The charset to use for console logging. |
| `logging.threshold.console` | `CONSOLE_LOG_THRESHOLD` | The log level threshold to use for console logging. |
| `logging.pattern.file` | `FILE_LOG_PATTERN` | The log pattern to use in a file (if `LOG_FILE` is enabled). |
| `logging.charset.file` | `FILE_LOG_CHARSET` | The charset to use for file logging (if `LOG_FILE` is enabled). |
| `logging.threshold.file` | `FILE_LOG_THRESHOLD` | The log level threshold to use for file logging. |
| `logging.pattern.level` | `LOG_LEVEL_PATTERN` | The format to use when rendering the log level (default `%5p`). |
| `logging.structured.format.console` | `CONSOLE_LOG_STRUCTURED_FORMAT` | The structured logging format to use for console logging. |
| `logging.structured.format.file` | `FILE_LOG_STRUCTURED_FORMAT` | The structured logging format to use for file logging. |
| `PID` | `PID` | The current process ID (discovered if possible and when not already defined as an OS environment variable). |

If you use Logback, the following properties are also transferred:

| Spring Environment | System Property | Comments |
| --- | --- | --- |
| `logging.logback.rollingpolicy.file-name-pattern` | `LOGBACK_ROLLINGPOLICY_FILE_NAME_PATTERN` | Pattern for rolled-over log file names (default `${LOG_FILE}.%d{yyyy-MM-dd}.%i.gz`). |
| `logging.logback.rollingpolicy.clean-history-on-start` | `LOGBACK_ROLLINGPOLICY_CLEAN_HISTORY_ON_START` | Whether to clean the archive log files on startup. |
| `logging.logback.rollingpolicy.max-file-size` | `LOGBACK_ROLLINGPOLICY_MAX_FILE_SIZE` | Maximum log file size. |
| `logging.logback.rollingpolicy.total-size-cap` | `LOGBACK_ROLLINGPOLICY_TOTAL_SIZE_CAP` | Total size of log backups to be kept. |
| `logging.logback.rollingpolicy.max-history` | `LOGBACK_ROLLINGPOLICY_MAX_HISTORY` | Maximum number of archive log files to keep. |

All the supported logging systems can consult System properties when parsing their configuration files.
See the default configurations in `spring-boot.jar` for examples:

- [Logback][r16]
- [Log4j 2][r17]
- [Java Util logging][r18]

> [TIP]
>
> If you want to use a placeholder in a logging property, you should use [Spring Boot’s syntax][r19] and not the syntax of the underlying framework.
> Notably, if you use Logback, you should use `:` as the delimiter between a property name and its default value and not use `:-`.

> [TIP]
>
> You can add MDC and other ad-hoc content to log lines by overriding only the `LOG_LEVEL_PATTERN` (or `logging.pattern.level` with Logback).
> For example, if you use `logging.pattern.level=user:%X{user} %5p`, then the default log format contains an MDC entry for "user", if it exists, as shown in the following example.
>
{{CODE_12}}

## Structured Logging

Structured logging is a technique where the log output is written in a well-defined, often machine-readable format.
Spring Boot supports structured logging and has support for the following JSON formats out of the box:

- [Elastic Common Schema (ECS)][r20]
- [Graylog Extended Log Format (GELF)][r21]
- [Logstash][r22]

To enable structured logging, set the property `logging.structured.format.console` (for console output) or `logging.structured.format.file` (for file output) to the id of the format you want to use.

If you are using [Custom Log Configuration][r23], update your configuration to respect `CONSOLE_LOG_STRUCTURED_FORMAT` and `FILE_LOG_STRUCTURED_FORMAT` system properties.
Take `CONSOLE_LOG_STRUCTURED_FORMAT` for example:

{{CODE_13}}

You can also refer to the default configurations included in Spring Boot:

- [Logback Structured Console Appender][r24]
- [Logback Structured File Appender][r25]

{{CODE_14}}

You can also refer to the default configurations included in Spring Boot:

- [Log4j2 Console Appender][r17]
- [Log4j2 Console and File Appender][r26]

### Elastic Common Schema

[Elastic Common Schema][r27] is a JSON based logging format.

To enable the Elastic Common Schema log format, set the appropriate `format` property to `ecs`:

{{CODE_15}}

{{CODE_16}}

A log line looks like this:

{{CODE_17}}

This format also adds every key value pair contained in the MDC to the JSON object.
You can also use the [SLF4J fluent logging API][r28] to add key value pairs to the logged JSON object with the [addKeyValue][r29] method.

The `service` values can be customized using `logging.structured.ecs.service` properties:

{{CODE_18}}

{{CODE_19}}

> [NOTE]
>
> `logging.structured.ecs.service.name` will default to `spring.application.name` if not specified.

> [NOTE]
>
> `logging.structured.ecs.service.version` will default to `spring.application.version` if not specified.

### Graylog Extended Log Format (GELF)

[Graylog Extended Log Format][r30] is a JSON based logging format for the Graylog log analytics platform.

To enable the Graylog Extended Log Format, set the appropriate `format` property to `gelf`:

{{CODE_20}}

{{CODE_21}}

A log line looks like this:

{{CODE_22}}

This format also adds every key value pair contained in the MDC to the JSON object.
You can also use the [SLF4J fluent logging API][r28] to add key value pairs to the logged JSON object with the [addKeyValue][r29] method.

Several fields can be customized using `logging.structured.gelf` properties:

{{CODE_23}}

{{CODE_24}}

> [NOTE]
>
> `logging.structured.gelf.host` will default to `spring.application.name` if not specified.

> [NOTE]
>
> `logging.structured.gelf.service.version` will default to `spring.application.version` if not specified.

### Logstash JSON format

The [Logstash JSON format][r31] is a JSON based logging format.

To enable the Logstash JSON log format, set the appropriate `format` property to `logstash`:

{{CODE_25}}

{{CODE_26}}

A log line looks like this:

{{CODE_27}}

This format also adds every key value pair contained in the MDC to the JSON object.
You can also use the [SLF4J fluent logging API][r28] to add key value pairs to the logged JSON object with the [addKeyValue][r29] method.

If you add [markers][r32], these will show up in a `tags` string array in the JSON.

### Customizing Structured Logging JSON

Spring Boot attempts to pick sensible defaults for the JSON names and values output for structured logging.
Sometimes, however, you may want to make small adjustments to the JSON for your own needs.
For example, it’s possible that you might want to change some of the names to match the expectations of your log ingestion system.
You might also want to filter out certain members since you don’t find them useful.

The following properties allow you to change the way that structured logging JSON is written:

| Property | Description |
| --- | --- |
| `logging.structured.json.include` & `logging.structured.json.exclude` | Filters specific paths from the JSON |
| `logging.structured.json.rename` | Renames a specific member in the JSON |
| `logging.structured.json.add` | Adds additional members to the JSON |

For example, the following will exclude `log.level`, rename `process.id` to `procid` and add a fixed `corpname` field:

{{CODE_28}}

{{CODE_29}}

> [TIP]
>
> For more advanced customizations, you can use the [`StructuredLoggingJsonMembersCustomizer`][r33] interface.
> You can reference one or more implementations using the `logging.structured.json.customizer` property.
> You can also declare implementations by listing them in a `META-INF/spring.factories` file.

### Customizing Structured Logging Stack Traces

Complete stack traces are included in the JSON output whenever a message is logged with an exception.
This amount of information may be costly to process by your log ingestion system, so you may want to tune the way that stack traces are printed.

To do this, you can use one or more of the following properties:

| Property | Description |
| --- | --- |
| `logging.structured.json.stacktrace.root` | Use `last` to print the root item last (same as Java) or `first` to print the root item first. |
| `logging.structured.json.stacktrace.max-length` | The maximum length that should be printed |
| `logging.structured.json.stacktrace.max-throwable-depth` | The maximum number of frames to print per stack trace (including common and suppressed frames) |
| `logging.structured.json.stacktrace.include-common-frames` | If common frames should be included or removed |
| `logging.structured.json.stacktrace.include-hashes` | If a hash of the stack trace should be included |

For example, the following will use root first stack traces, limit their length, and include hashes.

{{CODE_30}}

{{CODE_31}}

> [TIP]
>
> If you need complete control over stack trace printing you can set `logging.structured.json.stacktrace.printer` to the name of a [`StackTracePrinter`][r34] implementation.
> You can also set it to `logging-system` to force regular logging system stack trace output to be used.
>
> Your `StackTracePrinter` implementation can also include a constructor argument that accepts a [`StandardStackTracePrinter`][r35] if it wishes to apply further customization to the stack trace printer created from the properties.

### Supporting Other Structured Logging Formats

The structured logging support in Spring Boot is extensible, allowing you to define your own custom format.
To do this, implement the [`StructuredLogFormatter`][r36] interface. The generic type argument has to be [`ILoggingEvent`][r37] when using Logback and [`LogEvent`][r38] when using Log4j2 (that means your implementation is tied to a specific logging system).
Your implementation is then called with the log event and returns the [`String`][r39] to be logged, as seen in this example:

{{CODE_32}}

{{CODE_33}}

As you can see in the example, you can return any format, it doesn’t have to be JSON.

To enable your custom format, set the property `logging.structured.format.console` or `logging.structured.format.file` to the fully qualified class name of your implementation.

Your implementation can use some constructor parameters, which are injected automatically.
Please see the JavaDoc of [`StructuredLogFormatter`][r36] for more details.

## Logback Extensions

Spring Boot includes a number of extensions to Logback that can help with advanced configuration.
You can use these extensions in your `logback-spring.xml` configuration file.

> [NOTE]
>
> Because the standard `logback.xml` configuration file is loaded too early, you cannot use extensions in it.
> You need to either use `logback-spring.xml` or define a `logging.config` property.

> [WARNING]
>
> The extensions cannot be used with Logback’s [configuration scanning][r40].
> If you attempt to do so, making changes to the configuration file results in an error similar to one of the following being logged:

{{CODE_34}}

### Profile-specific Configuration

The `<springProfile>` tag lets you optionally include or exclude sections of configuration based on the active Spring profiles.
Profile sections are supported anywhere within the `<configuration>` element.
Use the `name` attribute to specify which profile accepts the configuration.
The `<springProfile>` tag can contain a profile name (for example `staging`) or a profile expression.
A profile expression allows for more complicated profile logic to be expressed, for example `production & (eu-central | eu-west)`.
Check the [Spring Framework reference guide][r41] for more details.
The following listing shows three sample profiles:

{{CODE_35}}

### Environment Properties

The `<springProperty>` tag lets you expose properties from the Spring [`Environment`][r7] for use within Logback.
Doing so can be useful if you want to access values from your `application.properties` file in your Logback configuration.
The tag works in a similar way to Logback’s standard `<property>` tag.
However, rather than specifying a direct `value`, you specify the `source` of the property (from the [`Environment`][r7]).
If you need to store the property somewhere other than in `local` scope, you can use the `scope` attribute.
If you need a fallback value (in case the property is not set in the [`Environment`][r7]), you can use the `defaultValue` attribute.
The following example shows how to expose properties for use within Logback:

{{CODE_36}}

> [NOTE]
>
> The `source` must be specified in kebab case (such as `my.property-name`).
> However, properties can be added to the [`Environment`][r7] by using the relaxed rules.

## Log4j2 Extensions

Spring Boot includes a number of extensions to Log4j2 that can help with advanced configuration.
You can use these extensions in any `log4j2-spring.xml` configuration file.

> [NOTE]
>
> Because the standard `log4j2.xml` configuration file is loaded too early, you cannot use extensions in it.
> You need to either use `log4j2-spring.xml` or define a `logging.config` property.

> [NOTE]
>
> The extensions supersede the [Spring Boot support][r42] provided by Log4J.
> You should make sure not to include the `org.apache.logging.log4j:log4j-spring-boot` module in your build.

### Profile-specific Configuration

The `<SpringProfile>` tag lets you optionally include or exclude sections of configuration based on the active Spring profiles.
Profile sections are supported anywhere within the `<Configuration>` element.
Use the `name` attribute to specify which profile accepts the configuration.
The `<SpringProfile>` tag can contain a profile name (for example `staging`) or a profile expression.
A profile expression allows for more complicated profile logic to be expressed, for example `production & (eu-central | eu-west)`.
Check the [Spring Framework reference guide][r41] for more details.
The following listing shows three sample profiles:

{{CODE_37}}

### Environment Properties Lookup

If you want to refer to properties from your Spring [`Environment`][r7] within your Log4j2 configuration you can use `spring:` prefixed [lookups][r43].
Doing so can be useful if you want to access values from your `application.properties` file in your Log4j2 configuration.

The following example shows how to set Log4j2 properties named `applicationName` and `applicationGroup` that read `spring.application.name` and `spring.application.group` from the Spring [`Environment`][r7]:

{{CODE_38}}

> [NOTE]
>
> The lookup key should be specified in kebab case (such as `my.property-name`).

### Log4j2 System Properties

Log4j2 supports a number of [System Properties][r44] that can be used to configure various items.
For example, the `log4j2.skipJansi` system property can be used to configure if the [`ConsoleAppender`][r45] will try to use a [Jansi][r46] output stream on Windows.

All system properties that are loaded after the Log4j2 initialization can be obtained from the Spring [`Environment`][r7].
For example, you could add `log4j2.skipJansi=false` to your `application.properties` file to have the [`ConsoleAppender`][r45] use Jansi on Windows.

> [NOTE]
>
> The Spring [`Environment`][r7] is only considered when system properties and OS environment variables do not contain the value being loaded.

> [WARNING]
>
> System properties that are loaded during early Log4j2 initialization cannot reference the Spring [`Environment`][r7].
> For example, the property Log4j2 uses to allow the default Log4j2 implementation to be chosen is used before the Spring Environment is available.
