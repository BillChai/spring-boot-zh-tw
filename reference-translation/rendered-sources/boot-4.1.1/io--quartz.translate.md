# Quartz Scheduler

Spring Boot offers several conveniences for working with the [Quartz scheduler][r1], including the `spring-boot-starter-quartz` starter.
If Quartz is available, a [`Scheduler`][r2] is auto-configured (through the [`SchedulerFactoryBean`][r3] abstraction).

Beans of the following types are automatically picked up and associated with the [`Scheduler`][r2]:

- [`JobDetail`][r4]: defines a particular Job.
  [`JobDetail`][r4] instances can be built with the [`JobBuilder`][r5] API.
- [`Calendar`][r6].
- [`Trigger`][r7]: defines when a particular job is triggered.

By default, an in-memory [`JobStore`][r8] is used.
However, it is possible to configure a JDBC-based store if a [`DataSource`][r9] bean is available in your application and if the `spring.quartz.job-store-type` property is configured accordingly, as shown in the following example:

{{CODE_0}}

{{CODE_1}}

When the JDBC store is used, the schema can be initialized on startup, as shown in the following example:

{{CODE_2}}

{{CODE_3}}

> [WARNING]
>
> By default, the database is detected and initialized by using the standard scripts provided with the Quartz library.
> These scripts drop existing tables, deleting all triggers on every restart.
> To use a custom script, set the `spring.quartz.jdbc.schema` property.
> Some of the standard scripts – such as those for SQL Server, Azure SQL, and Sybase – cannot be used without modification.
> In these cases, make a copy of the script and edit it as directed in the script’s comments then set `spring.quartz.jdbc.schema` to use your customized script.

To have Quartz use a [`DataSource`][r9] other than the application’s main [`DataSource`][r9], declare a [`DataSource`][r9] bean, annotating its [`@Bean`][r10] method with [`@QuartzDataSource`][r11].
Doing so ensures that the Quartz-specific [`DataSource`][r9] is used by both the [`SchedulerFactoryBean`][r3] and for schema initialization.
Similarly, to have Quartz use a [`TransactionManager`][r12] other than the application’s main [`TransactionManager`][r12] declare a [`TransactionManager`][r12] bean, annotating its [`@Bean`][r10] method with [`@QuartzTransactionManager`][r13].

By default, jobs created by configuration will not overwrite already registered jobs that have been read from a persistent job store.
To enable overwriting existing job definitions set the `spring.quartz.overwrite-existing-jobs` property.

Quartz Scheduler configuration can be customized using `spring.quartz` properties and [`SchedulerFactoryBeanCustomizer`][r14] beans, which allow programmatic [`SchedulerFactoryBean`][r3] customization.
Advanced Quartz configuration properties can be customized using `spring.quartz.properties.*`.

> [NOTE]
>
> In particular, an [`Executor`][r15] bean is not associated with the scheduler as Quartz offers a way to configure the scheduler through `spring.quartz.properties`.
> If you need to customize the task executor, consider implementing [`SchedulerFactoryBeanCustomizer`][r14].

Jobs can define setters to inject data map properties.
Regular beans can also be injected in a similar manner, as shown in the following example:

{{CODE_4}}

{{CODE_5}}
