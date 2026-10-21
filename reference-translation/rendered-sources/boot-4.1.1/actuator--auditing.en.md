# Auditing

Once Spring Security is in play, Spring Boot Actuator has a flexible audit framework that publishes events (by default, “authentication success”, “failure” and “access denied” exceptions).
This feature can be very useful for reporting and for implementing a lock-out policy based on authentication failures.

You can enable auditing by providing a bean of type [`AuditEventRepository`][r1] in your application’s configuration.
For convenience, Spring Boot offers an [`InMemoryAuditEventRepository`][r2].
[`InMemoryAuditEventRepository`][r2] has limited capabilities, and we recommend using it only for development environments.
For production environments, consider creating your own alternative [`AuditEventRepository`][r1] implementation.

## Custom Auditing

To customize published security events, you can provide your own implementations of [`AbstractAuthenticationAuditListener`][r3] and [`AbstractAuthorizationAuditListener`][r4].

You can also use the audit services for your own business events.
To do so, either inject the [`AuditEventRepository`][r1] bean into your own components and use that directly or publish an [`AuditApplicationEvent`][r5] with the Spring [`ApplicationEventPublisher`][r6] (by implementing [`ApplicationEventPublisherAware`][r7]).
