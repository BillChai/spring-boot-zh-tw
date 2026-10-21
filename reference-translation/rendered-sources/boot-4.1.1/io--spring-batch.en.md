# Spring Batch

Spring Boot offers several conveniences for working with [Spring Batch][r1], including running a Job on startup.

When building a batch application, the following stores can be auto-configured:

- In-memory
- JDBC
- MongoDB

Each store has specific additional settings.
For instance, it is possible to customize the tables prefix for the JDBC store, as shown in the following example:

```properties
spring.batch.jdbc.table-prefix=CUSTOM_
```

```yaml
spring:
  batch:
    jdbc:
      table-prefix: "CUSTOM_"
```

When using the MongoDB store, you can enable initialization of the Spring Batch job repository schema (collections and indexes):

```properties
spring.batch.data.mongodb.schema.initialize=true
```

```yaml
spring:
  batch:
    data:
      mongodb:
        schema:
          initialize: true
```

To disable Spring Boot’s auto-configuration and take complete control of Spring Batch’s configuration, add [`@EnableBatchProcessing`][r2] to one of your [`@Configuration`][r3] classes or extend [`DefaultBatchConfiguration`][r4].
This will cause the auto-configuration to back off, including initialization of Spring Batch’s database schema (JDBC or MongoDB).
Spring Batch can then be configured using the `@Enable*JobRepository` annotation’s attributes rather than the previously described configuration properties.

To learn more about manually configuring Spring Batch, see the API documentation of:

- [`DefaultBatchConfiguration`][r4]
- [`@EnableBatchProcessing`][r2]
- [`@EnableJdbcJobRepository`][r5]
- [`@EnableMongoJobRepository`][r6]

For more information about Spring Batch, see the [Spring Batch project page][r1].

## Running Spring Batch Jobs on Startup

When Spring Boot auto-configures Spring Batch, and if a single [`Job`][r7] bean is found in the application context, it is executed on startup (see [`JobLauncherApplicationRunner`][r8] for details).
If multiple [`Job`][r7] beans are found, the job that should be executed must be specified using `spring.batch.job.name`.

You can disable running a [`Job`][r7] found in the application context, as shown in the following example:

```properties
spring.batch.job.enabled=false
```

```yaml
spring:
  batch:
    job:
      enabled: false
```

See [`BatchAutoConfiguration`][r9], [`BatchJdbcAutoConfiguration`][r10], and [`BatchDataMongoAutoConfiguration`][r11] for more details.
