# Task Execution and Scheduling

In the absence of an [`Executor`][r1] bean in the context, Spring Boot auto-configures an [`AsyncTaskExecutor`][r2].
When virtual threads are enabled (using Java 21+ and `spring.threads.virtual.enabled` set to `true`) this will be a [`SimpleAsyncTaskExecutor`][r3] that uses virtual threads.
Otherwise, it will be a [`ThreadPoolTaskExecutor`][r4] with sensible defaults.

The auto-configured [`AsyncTaskExecutor`][r2] is used for the following integrations unless a custom [`Executor`][r1] bean is defined:

- Execution of asynchronous tasks using [`@EnableAsync`][r5], unless a bean of type [`AsyncConfigurer`][r6] is defined.
- Asynchronous handling of [`Callable`][r7] return values from controller methods in Spring for GraphQL.
- Asynchronous request handling in Spring MVC.
- Support for blocking execution in Spring WebFlux.
- Utilized for inbound and outbound message channels in Spring WebSocket.
- Bootstrap executor for JPA, based on the bootstrap mode of JPA repositories.
- Bootstrap executor for [background initialization][r8] of beans in the `ApplicationContext`.

While this approach works in most scenarios, Spring Boot allows you to override the auto-configured [`AsyncTaskExecutor`][r2].
By default, when a custom [`Executor`][r1] bean is registered, the auto-configured [`AsyncTaskExecutor`][r2] backs off, and the custom [`Executor`][r1] is used for regular task execution (via [`@EnableAsync`][r5]).

However, Spring MVC, Spring WebFlux, and Spring GraphQL all require a bean named `applicationTaskExecutor`.
For Spring MVC and Spring WebFlux, this bean must be of type [`AsyncTaskExecutor`][r2], whereas Spring GraphQL does not enforce this type requirement.

Spring WebSocket and JPA will use [`AsyncTaskExecutor`][r2] if either a single bean of this type is available or a bean named `applicationTaskExecutor` is defined.

Finally, the boostrap executor of the `ApplicationContext` uses a bean named `applicationTaskExecutor` unless a bean named `bootstrapExecutor` is defined.

The following code snippet demonstrates how to register a custom [`AsyncTaskExecutor`][r2] to be used with Spring MVC, Spring WebFlux, Spring GraphQL, Spring WebSocket, JPA, and background initialization of beans.

{{CODE_0}}

{{CODE_1}}

> [NOTE]
>
> The `applicationTaskExecutor` bean will also be used for regular task execution if there is no [`@Primary`][r9] bean or a bean named `taskExecutor` of type [`Executor`][r1] or [`AsyncConfigurer`][r6] present in the application context.

> [WARNING]
>
> If neither the auto-configured `AsyncTaskExecutor` nor the `applicationTaskExecutor` bean is defined, the application defaults to a bean named `taskExecutor` for regular task execution ([`@EnableAsync`][r5]), following Spring Framework’s behavior.
> However, this bean will not be used for Spring MVC, Spring WebFlux, Spring GraphQL.
> It could, however, be used for Spring WebSocket or JPA if the bean’s type is [`AsyncTaskExecutor`][r2].

If your application needs multiple `Executor` beans for different integrations, such as one for regular task execution with [`@EnableAsync`][r5] and other for Spring MVC, Spring WebFlux, Spring WebSocket and JPA, you can configure them as follows.

{{CODE_2}}

{{CODE_3}}

> [TIP]
>
> The auto-configured [`ThreadPoolTaskExecutorBuilder`][r10] or [`SimpleAsyncTaskExecutorBuilder`][r11] allow you to easily create instances of type [`AsyncTaskExecutor`][r2] that replicate the default behavior of auto-configuration.
>
{{CODE_4}}
>
{{CODE_5}}

If a `taskExecutor` named bean is not an option, you can mark your bean as [`@Primary`][r9] or define an [`AsyncConfigurer`][r6] bean to specify the `Executor` responsible for handling regular task execution with [`@EnableAsync`][r5].
The following example demonstrates how to achieve this.

{{CODE_6}}

{{CODE_7}}

To register a custom [`Executor`][r1] while keeping the auto-configured [`AsyncTaskExecutor`][r2], you can create a custom [`Executor`][r1] bean and set the `defaultCandidate=false` attribute in its [`@Bean`][r12] annotation, as demonstrated in the following example:

{{CODE_8}}

{{CODE_9}}

In that case, you will be able to autowire your custom [`Executor`][r1] into other components while retaining the auto-configured [`AsyncTaskExecutor`][r2].
However, remember to use the [`@Qualifier`][r13] annotation alongside [`@Autowired`][r14].

If this is not possible for you, you can request Spring Boot to auto-configure an [`AsyncTaskExecutor`][r2] anyway, as follows:

{{CODE_10}}

{{CODE_11}}

The auto-configured [`AsyncTaskExecutor`][r2] will be used automatically for all integrations, even if a custom [`Executor`][r1] bean is registered, including those marked as [`@Primary`][r9].
These integrations include:

- Asynchronous task execution ([`@EnableAsync`][r5]), unless an [`AsyncConfigurer`][r6] bean is present.
- Spring for GraphQL’s asynchronous handling of [`Callable`][r7] return values from controller methods.
- Spring MVC’s asynchronous request processing.
- Spring WebFlux’s blocking execution support.
- Utilized for inbound and outbound message channels in Spring WebSocket.
- Bootstrap executor for JPA, based on the bootstrap mode of JPA repositories.
- Bootstrap executor for [background initialization][r8] of beans in the `ApplicationContext`, unless a bean named `bootstrapExecutor` is defined.

> [TIP]
>
> Depending on your target arrangement, you could set `spring.task.execution.mode` to `force` to auto-configure an `applicationTaskExecutor`, change your [`Executor`][r1] into an [`AsyncTaskExecutor`][r2] or define both an [`AsyncTaskExecutor`][r2] and an [`AsyncConfigurer`][r6] wrapping your custom [`Executor`][r1].

> [WARNING]
>
> When `force` mode is enabled, `applicationTaskExecutor` will also be configured for regular task execution with [`@EnableAsync`][r5], even if a [`@Primary`][r9] bean or a bean named `taskExecutor` of type [`Executor`][r1] is present.
> The only way to override the `Executor` for regular tasks is by registering an [`AsyncConfigurer`][r6] bean.

When a [`ThreadPoolTaskExecutor`][r4] is auto-configured, the thread pool uses 8 core threads that can grow and shrink according to the load.
Those default settings can be fine-tuned using the `spring.task.execution` namespace, as shown in the following example:

{{CODE_12}}

{{CODE_13}}

This changes the thread pool to use a bounded queue so that when the queue is full (100 tasks), the thread pool increases to maximum 16 threads.
Shrinking of the pool is more aggressive as threads are reclaimed when they are idle for 10 seconds (rather than 60 seconds by default).

A scheduler can also be auto-configured if it needs to be associated with scheduled task execution (using [`@EnableScheduling`][r15] for instance).

If virtual threads are enabled (using Java 21+ and `spring.threads.virtual.enabled` set to `true`) this will be a [`SimpleAsyncTaskScheduler`][r16] that uses virtual threads.
This [`SimpleAsyncTaskScheduler`][r16] will ignore any pooling related properties.

If virtual threads are not enabled, it will be a [`ThreadPoolTaskScheduler`][r17] with sensible defaults.
The [`ThreadPoolTaskScheduler`][r17] uses one thread by default and its settings can be fine-tuned using the `spring.task.scheduling` namespace, as shown in the following example:

{{CODE_14}}

{{CODE_15}}

A [`ThreadPoolTaskExecutorBuilder`][r10] bean, a [`SimpleAsyncTaskExecutorBuilder`][r11] bean, a [`ThreadPoolTaskSchedulerBuilder`][r18] bean and a [`SimpleAsyncTaskSchedulerBuilder`][r19] are made available in the context if a custom executor or scheduler needs to be created.
The [`SimpleAsyncTaskExecutorBuilder`][r11] and [`SimpleAsyncTaskSchedulerBuilder`][r19] beans are auto-configured to use virtual threads if they are enabled (using Java 21+ and `spring.threads.virtual.enabled` set to `true`).
