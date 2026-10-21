# Spring Integration

Spring Boot offers several conveniences for working with [Spring Integration][r1], including the `spring-boot-starter-integration` starter.
Spring Integration provides abstractions over messaging and also other transports such as HTTP, TCP, and others.
If Spring Integration is available on your classpath, it is initialized through the [`@EnableIntegration`][r2] annotation.

Spring Integration polling logic relies [on the auto-configured `TaskScheduler`][r4].
The default [`PollerMetadata`][r5] (poll unbounded number of messages every second) can be customized with `spring.integration.poller.*` configuration properties.

Spring Boot also configures some features that are triggered by the presence of additional Spring Integration modules.
If `spring-integration-jmx` is also on the classpath, message processing statistics are published over JMX.
If `spring-integration-jdbc` is available, the default database schema can be created on startup, as shown in the following line:

{{CODE_0}}

{{CODE_1}}

If `spring-integration-rsocket` is available, developers can configure an RSocket server using `spring.rsocket.server.*` properties and let it use [`IntegrationRSocketEndpoint`][r6] or [`RSocketOutboundGateway`][r7] components to handle incoming RSocket messages.
This infrastructure can handle Spring Integration RSocket channel adapters and [`@MessageMapping`][r8] handlers (given `spring.integration.rsocket.server.message-mapping-enabled` is configured).

Spring Boot can also auto-configure an [`ClientRSocketConnector`][r9] using configuration properties:

{{CODE_2}}

{{CODE_3}}

{{CODE_4}}

{{CODE_5}}

See the [`IntegrationAutoConfiguration`][r10] and [`IntegrationProperties`][r11] classes for more details.
