# Spring Session

Spring Boot provides [Spring Session][r1] auto-configuration for a range of data stores.
For each data store, a specific Spring Boot starter is provided.

When building a servlet web application, the following stores can be auto-configured:

- Redis (`spring-boot-starter-session-data-redis`)
- JDBC (`spring-boot-starter-session-jdbc`)

The servlet auto-configuration replaces the need to use `@Enable*HttpSession`.

When building a reactive web application, the Redis store can be auto-configured by depending on `spring-boot-starter-session-data-redis`.
This replaces the need to use `@EnableRedisWebSession`.

Each store has specific additional settings.
For instance, it is possible to customize the name of the table for the JDBC store, as shown in the following example:

```properties
spring.session.jdbc.table-name=SESSIONS
```

```yaml
spring:
  session:
    jdbc:
      table-name: "SESSIONS"
```

For setting the timeout of the session you can use the `spring.session.timeout` property.
If that property is not set with a servlet web application, the auto-configuration falls back to the value of `server.servlet.session.timeout`.
To provide the timeout programmatically, define a [`SessionTimeout`][r2] bean.

You can take control over Spring Session’s configuration using `@Enable*HttpSession` (servlet) or `@EnableRedisWebSession` (reactive).
This will cause the auto-configuration to back off.
Alternatively, depend on the relevant Spring Session module directly rather than using one of Spring Boot’s starters for Spring Session.
With either approach, Spring Session can then be configured using the annotation’s attributes rather than the previously described configuration properties.
