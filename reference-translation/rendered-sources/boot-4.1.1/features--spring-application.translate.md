# SpringApplication

The [`SpringApplication`][r1] class provides a convenient way to bootstrap a Spring application that is started from a `main()` method.
In many situations, you can delegate to the static [`SpringApplication.run(Class, String...)`][r2] method, as shown in the following example:

{{CODE_0}}

{{CODE_1}}

When your application starts, you should see something similar to the following output:

{{CODE_2}}

By default, `INFO` logging messages are shown, including some relevant startup details, such as the user that launched the application.
If you need a log level other than `INFO`, you can set it, as described in [Log Levels][r3].
The application version is determined using the implementation version from the main application class’s package.
Startup information logging can be turned off by setting `spring.main.log-startup-info` to `false`.
This will also turn off logging of the application’s active profiles.

> [TIP]
>
> To add additional logging during startup, you can override `logStartupInfo(boolean)` in a subclass of [`SpringApplication`][r1].

## Startup Failure

If your application fails to start, registered [`FailureAnalyzer`][r4] beans get a chance to provide a dedicated error message and a concrete action to fix the problem.
For instance, if you start a web application on port `8080` and that port is already in use, you should see something similar to the following message:

{{CODE_3}}

> [NOTE]
>
> Spring Boot provides numerous [`FailureAnalyzer`][r4] implementations, and you can [add your own][r5].

If no failure analyzers are able to handle the exception, you can still display the full conditions report to better understand what went wrong.
To do so, you need to [enable the `debug` property][r6] or [enable `DEBUG` logging][r3] for [`ConditionEvaluationReportLoggingListener`][r7].

For instance, if you are running your application by using `java -jar`, you can enable the `debug` property as follows:

{{CODE_4}}

## Lazy Initialization

[`SpringApplication`][r1] allows an application to be initialized lazily.
When lazy initialization is enabled, beans are created as they are needed rather than during application startup.
As a result, enabling lazy initialization can reduce the time that it takes your application to start.
In a web application, enabling lazy initialization will result in many web-related beans not being initialized until an HTTP request is received.

A downside of lazy initialization is that it can delay the discovery of a problem with the application.
If a misconfigured bean is initialized lazily, a failure will no longer occur during startup and the problem will only become apparent when the bean is initialized.
Care must also be taken to ensure that the JVM has sufficient memory to accommodate all of the application’s beans and not just those that are initialized during startup.
For these reasons, lazy initialization is not enabled by default and it is recommended that fine-tuning of the JVM’s heap size is done before enabling lazy initialization.

Lazy initialization can be enabled programmatically using the `lazyInitialization` method on [`SpringApplicationBuilder`][r8] or the `setLazyInitialization` method on [`SpringApplication`][r1].
Alternatively, it can be enabled using the `spring.main.lazy-initialization` property as shown in the following example:

{{CODE_5}}

{{CODE_6}}

> [TIP]
>
> If you want to disable lazy initialization for certain beans while using lazy initialization for the rest of the application, you can explicitly set their lazy attribute to false using the `@Lazy(false)` annotation.

## Customizing the Banner

The banner that is printed on start up can be changed by adding a `banner.txt` file to your classpath or by setting the `spring.banner.location` property to the location of such a file.
If the file has an encoding other than UTF-8, you can set `spring.banner.charset`.

Inside your `banner.txt` file, you can use any key available in the [`Environment`][r9] as well as any of the following placeholders:

Table 1. Banner variables

| Variable | Description |
| --- | --- |
| `${application.version}` | The version number of your application, as declared in `MANIFEST.MF`. For example, `Implementation-Version: 1.0` is printed as `1.0`. |
| `${application.formatted-version}` | The version number of your application, as declared in `MANIFEST.MF` and formatted for display (surrounded with brackets and prefixed with `v`). For example `(v1.0)`. |
| `${spring-boot.version}` | The Spring Boot version that you are using. For example `4.1.1`. |
| `${spring-boot.formatted-version}` | The Spring Boot version that you are using, formatted for display (surrounded with brackets and prefixed with `v`). For example `(v4.1.1)`. |
| `${Ansi.NAME}` (or `${AnsiColor.NAME}`, `${AnsiBackground.NAME}`, `${AnsiStyle.NAME}`) | Where `NAME` is the name of an ANSI escape code. See [`AnsiPropertySource`][r10] for details. |
| `${application.title}` | The title of your application, as declared in `MANIFEST.MF`. For example `Implementation-Title: MyApp` is printed as `MyApp`. |

> [TIP]
>
> The `SpringApplication.setBanner(…​)` method can be used if you want to generate a banner programmatically.
> Use the [`Banner`][r11] interface and implement your own `printBanner()` method.

You can also use the `spring.main.banner-mode` property to determine if the banner has to be printed on [`System.out`][r12] (`console`), sent to the configured logger (`log`), or not produced at all (`off`).

The printed banner is registered as a singleton bean under the following name: `springBootBanner`.

> [NOTE]
>
> The `application.title`, `application.version`, and `application.formatted-version` properties are only available if you are using `java -jar` or `java -cp` with Spring Boot launchers.
> The values will not be resolved if you are running an unpacked jar and starting it with `java -cp <classpath> <mainclass>`
> or running your application as a native image.
>
> To use the `application.*` properties, launch your application as a packed jar using `java -jar` or as an unpacked jar using `java org.springframework.boot.loader.launch.JarLauncher`.
> This will initialize the `application.*` banner properties before building the classpath and launching your app.

## Customizing SpringApplication

If the [`SpringApplication`][r1] defaults are not to your taste, you can instead create a local instance and customize it.
For example, to turn off the banner, you could write:

{{CODE_7}}

{{CODE_8}}

> [NOTE]
>
> The constructor arguments passed to [`SpringApplication`][r1] are configuration sources for Spring beans.
> In most cases, these are references to [`@Configuration`][r13] classes, but they could also be direct references [`@Component`][r14] classes.

It is also possible to configure the [`SpringApplication`][r1] by using an `application.properties` file.
See [Externalized Configuration][r6] for details.

For a complete list of the configuration options, see the [`SpringApplication`][r1] API documentation.

## Fluent Builder API

If you need to build an [`ApplicationContext`][r15] hierarchy (multiple contexts with a parent/child relationship) or if you prefer using a fluent builder API, you can use the [`SpringApplicationBuilder`][r8].

The [`SpringApplicationBuilder`][r8] lets you chain together multiple method calls and includes `parent` and `child` methods that let you create a hierarchy, as shown in the following example:

{{CODE_9}}

{{CODE_10}}

> [NOTE]
>
> There are some restrictions when creating an [`ApplicationContext`][r15] hierarchy.
> For example, Web components **must** be contained within the child context, and the same [`Environment`][r9] is used for both parent and child contexts.
> See the [`SpringApplicationBuilder`][r8] API documentation for full details.

## Application Availability

When deployed on platforms, applications can provide information about their availability to the platform using infrastructure such as [Kubernetes Probes][r16].
Spring Boot includes out-of-the box support for the commonly used “liveness” and “readiness” availability states.
If you are using Spring Boot’s “actuator” support then these states are exposed as health endpoint groups.

In addition, you can also obtain availability states by injecting the [`ApplicationAvailability`][r17] interface into your own beans.

### Liveness State

The “Liveness” state of an application tells whether its internal state allows it to work correctly, or recover by itself if it is currently failing.
A broken “Liveness” state means that the application is in a state that it cannot recover from, and the infrastructure should restart the application.

> [NOTE]
>
> In general, the "Liveness" state should not be based on external checks, such as [health checks][r18].
> If it did, a failing external system (a database, a Web API, an external cache) would trigger massive restarts and cascading failures across the platform.

The internal state of Spring Boot applications is mostly represented by the Spring [`ApplicationContext`][r15].
If the application context has started successfully, Spring Boot assumes that the application is in a valid state.
An application is considered live as soon as the context has been refreshed, see [Spring Boot application lifecycle and related Application Events][r19].

### Readiness State

The “Readiness” state of an application tells whether the application is ready to handle traffic.
A failing “Readiness” state tells the platform that it should not route traffic to the application for now.
This typically happens during startup, while [`CommandLineRunner`][r20] and [`ApplicationRunner`][r21] components are being processed, or at any time if the application decides that it is too busy for additional traffic.

An application is considered ready as soon as application and command-line runners have been called, see [Spring Boot application lifecycle and related Application Events][r19].

> [TIP]
>
> Tasks expected to run during startup should be executed by [`CommandLineRunner`][r20] and [`ApplicationRunner`][r21] components instead of using Spring component lifecycle callbacks such as [`@PostConstruct`][r22].

### Managing the Application Availability State

Application components can retrieve the current availability state at any time, by injecting the [`ApplicationAvailability`][r17] interface and calling methods on it.
More often, applications will want to listen to state updates or update the state of the application.

For example, we can export the "Readiness" state of the application to a file so that a Kubernetes "exec Probe" can look at this file:

{{CODE_11}}

{{CODE_12}}

We can also update the state of the application, when the application breaks and cannot recover:

{{CODE_13}}

{{CODE_14}}

Spring Boot provides [Kubernetes HTTP probes for "Liveness" and "Readiness" with Actuator Health Endpoints][r23].
You can get more guidance about [deploying Spring Boot applications on Kubernetes in the dedicated section][r24].

## Application Events and Listeners

In addition to the usual Spring Framework events, such as [`ContextRefreshedEvent`][r25], a [`SpringApplication`][r1] sends some additional application events.

> [NOTE]
>
> Some events are actually triggered before the [`ApplicationContext`][r15] is created, so you cannot register a listener on those as a [`@Bean`][r26].
> You can register them with the `SpringApplication.addListeners(…​)` method or the `SpringApplicationBuilder.listeners(…​)` method.
>
> If you want those listeners to be registered automatically, regardless of the way the application is created, you can add a `META-INF/spring.factories` file to your project and reference your listener(s) by using the [`ApplicationListener`][r27] key, as shown in the following example:
>
{{CODE_15}}

Application events are sent in the following order, as your application runs:

1. An [`ApplicationStartingEvent`][r28] is sent at the start of a run but before any processing, except for the registration of listeners and initializers.
2. An [`ApplicationEnvironmentPreparedEvent`][r29] is sent when the [`Environment`][r9] to be used in the context is known but before the context is created.
3. An [`ApplicationContextInitializedEvent`][r30] is sent when the [`ApplicationContext`][r15] is prepared and ApplicationContextInitializers have been called but before any bean definitions are loaded.
4. An [`ApplicationPreparedEvent`][r31] is sent just before the refresh is started but after bean definitions have been loaded.
5. An [`ApplicationStartedEvent`][r32] is sent after the context has been refreshed but before any application and command-line runners have been called.
6. An [`AvailabilityChangeEvent`][r33] is sent right after with [`LivenessState.CORRECT`][r34] to indicate that the application is considered as live.
7. An [`ApplicationReadyEvent`][r35] is sent after any [application and command-line runners][r36] have been called.
8. An [`AvailabilityChangeEvent`][r33] is sent right after with [`ReadinessState.ACCEPTING_TRAFFIC`][r37] to indicate that the application is ready to service requests.
9. An [`ApplicationFailedEvent`][r38] is sent if there is an exception on startup.

The above list only includes `SpringApplicationEvent`s that are tied to a [`SpringApplication`][r1].
In addition to these, the following events are also published after [`ApplicationPreparedEvent`][r31] and before [`ApplicationStartedEvent`][r32]:

- A [`WebServerInitializedEvent`][r39] is sent after the [`WebServer`][r40] is ready.
  [`ServletWebServerInitializedEvent`][r41] and [`ReactiveWebServerInitializedEvent`][r42] are the servlet and reactive variants respectively.
- A [`ContextRefreshedEvent`][r25] is sent when an [`ApplicationContext`][r15] is refreshed.

> [TIP]
>
> You often need not use application events, but it can be handy to know that they exist.
> Internally, Spring Boot uses events to handle a variety of tasks.

> [NOTE]
>
> Event listeners should not run potentially lengthy tasks as they execute in the same thread by default.
> Consider using [application and command-line runners][r36] instead.

Application events are sent by using Spring Framework’s event publishing mechanism.
Part of this mechanism ensures that an event published to the listeners in a child context is also published to the listeners in any ancestor contexts.
As a result of this, if your application uses a hierarchy of [`SpringApplication`][r1] instances, a listener may receive multiple instances of the same type of application event.

To allow your listener to distinguish between an event for its context and an event for a descendant context, it should request that its application context is injected and then compare the injected context with the context of the event.
The context can be injected by implementing [`ApplicationContextAware`][r43] or, if the listener is a bean, by using [`@Autowired`][r44].

## Web Environment

A [`SpringApplication`][r1] attempts to create the right type of [`ApplicationContext`][r15] on your behalf.
The algorithm used to determine a [`WebApplicationType`][r45] is the following:

- If Spring MVC is present, an [`AnnotationConfigServletWebServerApplicationContext`][r46] is used
- If Spring MVC is not present and Spring WebFlux is present, an [`AnnotationConfigReactiveWebServerApplicationContext`][r47] is used
- Otherwise, [`AnnotationConfigApplicationContext`][r48] is used

This means that if you are using Spring MVC and the new [`WebClient`][r49] from Spring WebFlux in the same application, Spring MVC will be used by default.
You can override that easily by calling `setWebApplicationType(WebApplicationType)`.

It is also possible to take complete control of the [`ApplicationContext`][r15] type that is used by calling `setApplicationContextFactory(…​)`.

> [TIP]
>
> It is often desirable to call `setWebApplicationType(WebApplicationType.NONE)` when using [`SpringApplication`][r1] within a JUnit test.

## Accessing Application Arguments

If you need to access the application arguments that were passed to `SpringApplication.run(…​)`, you can inject a [`ApplicationArguments`][r50] bean.
The [`ApplicationArguments`][r50] interface provides access to both the raw `String[]` arguments as well as parsed `option` and `non-option` arguments, as shown in the following example:

{{CODE_16}}

{{CODE_17}}

> [TIP]
>
> Spring Boot also registers a [`CommandLinePropertySource`][r51] with the Spring [`Environment`][r9].
> This lets you also inject single application arguments by using the [`@Value`][r52] annotation.

## Using the ApplicationRunner or CommandLineRunner

If you need to run some specific code once the [`SpringApplication`][r1] has started, you can implement the [`ApplicationRunner`][r21] or [`CommandLineRunner`][r20] interfaces.
Both interfaces work in the same way and offer a single `run` method, which is called just before `SpringApplication.run(…​)` completes.

> [NOTE]
>
> This contract is well suited for tasks that should run after application startup but before it starts accepting traffic.

The [`CommandLineRunner`][r20] interfaces provides access to application arguments as a string array, whereas the [`ApplicationRunner`][r21] uses the [`ApplicationArguments`][r50] interface discussed earlier.
The following example shows a [`CommandLineRunner`][r20] with a `run` method:

{{CODE_18}}

{{CODE_19}}

If several [`CommandLineRunner`][r20] or [`ApplicationRunner`][r21] beans are defined that must be called in a specific order, you can additionally implement the [`Ordered`][r53] interface or use the [`Order`][r54] annotation.

## Application Exit

Each [`SpringApplication`][r1] registers a shutdown hook with the JVM to ensure that the [`ApplicationContext`][r15] closes gracefully on exit.
All the standard Spring lifecycle callbacks (such as the [`DisposableBean`][r55] interface or the [`@PreDestroy`][r56] annotation) can be used.

In addition, beans may implement the [`ExitCodeGenerator`][r57] interface if they wish to return a specific exit code when `SpringApplication.exit()` is called.
This exit code can then be passed to `System.exit()` to return it as a status code, as shown in the following example:

{{CODE_20}}

{{CODE_21}}

Also, the [`ExitCodeGenerator`][r57] interface may be implemented by exceptions.
When such an exception is encountered, Spring Boot returns the exit code provided by the implemented `getExitCode()` method.

If there is more than one [`ExitCodeGenerator`][r57], the first non-zero exit code that is generated is used.
To control the order in which the generators are called, additionally implement the [`Ordered`][r53] interface or use the [`Order`][r54] annotation.

## Admin Features

It is possible to enable admin-related features for the application by specifying the `spring.application.admin.enabled` property.
This exposes the [`SpringApplicationAdminMXBean`][r58] on the platform [`MBeanServer`][r59].
You could use this feature to administer your Spring Boot application remotely.
This feature could also be useful for any service wrapper implementation.

> [TIP]
>
> If you want to know on which HTTP port the application is running, get the property with a key of `local.server.port`.

## Application Startup tracking

During the application startup, the [`SpringApplication`][r1] and the [`ApplicationContext`][r15] perform many tasks related to the application lifecycle,
the beans lifecycle or even processing application events.
With [`ApplicationStartup`][r60], Spring Framework [allows you to track the application startup sequence with `StartupStep` objects][r62].
This data can be collected for profiling purposes, or just to have a better understanding of an application startup process.

You can choose an [`ApplicationStartup`][r60] implementation when setting up the [`SpringApplication`][r1] instance.
For example, to use the [`BufferingApplicationStartup`][r63], you could write:

{{CODE_22}}

{{CODE_23}}

The first available implementation, [`FlightRecorderApplicationStartup`][r64] is provided by Spring Framework.
It adds Spring-specific startup events to a Java Flight Recorder session and is meant for profiling applications and correlating their Spring context lifecycle with JVM events (such as allocations, GCs, class loading…​).
Once configured, you can record data by running the application with the Flight Recorder enabled:

{{CODE_24}}

Spring Boot ships with the [`BufferingApplicationStartup`][r63] variant; this implementation is meant for buffering the startup steps and draining them into an external metrics system.
Applications can ask for the bean of type [`BufferingApplicationStartup`][r63] in any component.

Spring Boot can also be configured to expose a [`startup` endpoint][r65] that provides this information as a JSON document.

## Virtual threads

Virtual threads require Java 21 or later.
For the best experience, Java 24 or later is strongly recommended.
To enable virtual threads, set the `spring.threads.virtual.enabled` property to `true`.

Before turning on this option for your application, you should consider [reading the official Java virtual threads documentation][r66].
In some cases, applications can experience lower throughput because of "Pinned Virtual Threads"; this page also explains how to detect such cases with JDK Flight Recorder or the `jcmd` CLI.

> [NOTE]
>
> If virtual threads are enabled, properties which configure thread pools don’t have an effect anymore.
> That’s because virtual threads are scheduled on a JVM wide platform thread pool and not on dedicated thread pools.

> [WARNING]
>
> One side effect of virtual threads is that they are daemon threads.
> A JVM will exit if all of its threads are daemon threads.
> This behavior can be a problem when you rely on [`@Scheduled`][r67] beans, for example, to keep your application alive.
> If you use virtual threads, the scheduler thread is a virtual thread and therefore a daemon thread and won’t keep the JVM alive.
> This not only affects scheduling and can be the case with other technologies too.
> To keep the JVM running in all cases, it is recommended to set the property `spring.main.keep-alive` to `true`.
> This ensures that the JVM is kept alive, even if all threads are virtual threads.
