# Testcontainers

The [Testcontainers][r1] library provides a way to manage services running inside Docker containers.
It integrates with JUnit, allowing you to write a test class that can start up a container before any of the tests run.
Testcontainers is especially useful for writing integration tests that talk to a real backend service such as MySQL, MongoDB, Cassandra and others.

In following sections we will describe some of the methods you can use to integrate Testcontainers with your tests.

## Using Spring Beans

The containers provided by Testcontainers can be managed by Spring Boot as beans.

To declare a container as a bean, add a [`@Bean`][r2] method to your test configuration:

{{CODE_0}}

{{CODE_1}}

You can then inject and use the container by importing the configuration class in the test class:

{{CODE_2}}

{{CODE_3}}

> [TIP]
>
> This method of managing containers is often used in combination with [service connection annotations][r3].

## Using the JUnit Extension

Testcontainers provides a JUnit extension which can be used to manage containers in your tests.
The extension is activated by applying the [`@Testcontainers`][r4] annotation from Testcontainers to your test class.

You can then use the [`@Container`][r5] annotation on static container fields.

The [`@Testcontainers`][r4] annotation can be used on vanilla JUnit tests, or in combination with [`@SpringBootTest`][r6]:

{{CODE_4}}

{{CODE_5}}

The example above will start up a Neo4j container before any of the tests are run.
The lifecycle of the container instance is managed by Testcontainers, as described in [their official documentation][r7].

When using the JUnit extension, container instances are stopped after the test class has run (for static fields) or after each test method (for non-static fields).
This can cause issues when used with Spring Boot tests, as Spring’s TestContext Framework may cache the [`ApplicationContext`][r8] beyond that point and reuse it for another test class or method with the same configuration.
If the cached application context contains beans that depend on a container that has already been stopped, later tests or bean destruction callbacks may fail.
For this reason, you should prefer [managing containers as Spring beans][r9] or [importing container declarations][r10] when the application context should remain usable for as long as it is cached.

> [NOTE]
>
> In most cases, you will additionally need to configure the application to connect to the service running in the container.

## Importing Container Configuration Interfaces

A common pattern with Testcontainers is to declare the container instances as static fields in an interface.

For example, the following interface declares two containers, one named `mongo` of type [`MongoDBContainer`][r11] and another named `neo4j` of type [`Neo4jContainer`][r12]:

{{CODE_6}}

{{CODE_7}}

When you have containers declared in this way, you can reuse their configuration in multiple tests by having the test classes implement the interface.

It’s also possible to use the same interface configuration in your Spring Boot tests.
To do so, add [`@ImportTestcontainers`][r13] to your test configuration class:

{{CODE_8}}

{{CODE_9}}

## Lifecycle of Managed Containers

If you have used the annotations and extensions provided by Testcontainers, then the lifecycle of container instances is managed entirely by Testcontainers.
Please refer to the [official Testcontainers documentation][r14] for the information.

When the containers are managed by Spring as beans, then their lifecycle is managed by Spring:

- Container beans are created and started before all other beans.
- Container beans are stopped after the destruction of all other beans.

This process ensures that any beans, which rely on functionality provided by the containers, can use those functionalities.
It also ensures that they are cleaned up whilst the container is still available.

> [TIP]
>
> When your application beans rely on functionality of containers, prefer configuring the containers as Spring beans to ensure the correct lifecycle behavior.

> [NOTE]
>
> Having containers managed by Testcontainers instead of as Spring beans provides no guarantee of the order in which beans and containers will shutdown.
> It can happen that containers are shutdown before the beans relying on container functionality are cleaned up.
> This can lead to exceptions being thrown by client beans, for example, due to loss of connection.
> When the application context should remain usable for as long as it is cached, prefer managing containers as Spring beans or importing container declarations with [`@ImportTestcontainers`][r13].

Container beans are created and started once per application context managed by Spring’s TestContext Framework.
For details about how the TestContext Framework manages the underlying application contexts and beans therein, please refer to the [Spring Framework documentation][r15].

Container beans are stopped as part of the TestContext Framework’s standard application context shutdown process.
When the application context gets shutdown, the containers are shutdown as well.
This usually happens after all tests using that specific cached application context have finished executing.
It may also happen earlier, depending on the caching behavior configured in the TestContext Framework.

> [NOTE]
>
> A single test container instance can, and often is, retained across execution of tests from multiple test classes.

## Service Connections

A service connection is a connection to any remote service.
Spring Boot’s auto-configuration can consume the details of a service connection and use them to establish a connection to a remote service.
When doing so, the connection details take precedence over any connection-related configuration properties.

When using Testcontainers, connection details can be automatically created for a service running in a container by annotating the container field in the test class.

{{CODE_10}}

{{CODE_11}}

Thanks to [`@ServiceConnection`][r16], the above configuration allows Neo4j-related beans in the application to communicate with Neo4j running inside the Testcontainers-managed Docker container.
This is done by automatically defining a [`Neo4jConnectionDetails`][r17] bean which is then used by the Neo4j auto-configuration, overriding any connection-related configuration properties.

> [NOTE]
>
> You’ll need to add the `spring-boot-testcontainers` module as a test dependency in order to use service connections with Testcontainers.

Service connection annotations are processed by [`ContainerConnectionDetailsFactory`][r18] classes registered with `spring.factories`.
A [`ContainerConnectionDetailsFactory`][r18] can create a [`ConnectionDetails`][r19] bean based on a specific [`Container`][r20] subclass, or the Docker image name.

The following service connection factories are provided in the `spring-boot-testcontainers` jar:

| Connection Details | Matched on |
| --- | --- |
| [`ActiveMQConnectionDetails`][r21] | Containers named "symptoma/activemq" or [`ActiveMQContainer`][r22] |
| [`ArtemisConnectionDetails`][r23] | Containers of type [`ArtemisContainer`][r24] |
| [`CassandraConnectionDetails`][r25] | Containers of type [`CassandraContainer`][r26] |
| [`CouchbaseConnectionDetails`][r27] | Containers of type [`CouchbaseContainer`][r28] |
| [`ElasticsearchConnectionDetails`][r29] | Containers of type [`ElasticsearchContainer`][r30] |
| [`FlywayConnectionDetails`][r31] | Containers of type [`JdbcDatabaseContainer`][r32] |
| [`JdbcConnectionDetails`][r33] | Containers of type [`JdbcDatabaseContainer`][r32] |
| [`KafkaConnectionDetails`][r34] | Containers of type [`KafkaContainer`][r35], [`ConfluentKafkaContainer`][r36] or [`RedpandaContainer`][r37] |
| [`LdapConnectionDetails`][r38] | Containers named "osixia/openldap" or of type [`LLdapContainer`][r39] |
| [`LiquibaseConnectionDetails`][r40] | Containers of type [`JdbcDatabaseContainer`][r32] |
| [`MongoConnectionDetails`][r41] | Containers of type [`MongoDBContainer`][r11] or [`MongoDBAtlasLocalContainer`][r42] |
| [`Neo4jConnectionDetails`][r17] | Containers of type [`Neo4jContainer`][r12] |
| [`OtlpLoggingConnectionDetails`][r43] | Containers named "otel/opentelemetry-collector-contrib" or of type [`LgtmStackContainer`][r44] |
| [`OtlpMetricsConnectionDetails`][r45] | Containers named "otel/opentelemetry-collector-contrib" or of type [`LgtmStackContainer`][r44] |
| [`OtlpTracingConnectionDetails`][r46] | Containers named "otel/opentelemetry-collector-contrib" or of type [`LgtmStackContainer`][r44] |
| [`PulsarConnectionDetails`][r47] | Containers of type [`PulsarContainer`][r48] |
| [`R2dbcConnectionDetails`][r49] | Containers of type [`ClickHouseContainer`][r50], [`MariaDBContainer`][r51], [`MSSQLServerContainer`][r52], [`MySQLContainer`][r53], [OracleContainer (free)][r54], [OracleContainer (XE)][r55] or [`PostgreSQLContainer`][r56] |
| [`RabbitConnectionDetails`][r57] | Containers of type [`RabbitMQContainer`][r58] |
| [`RabbitStreamConnectionDetails`][r59] | Containers of type [`RabbitMQContainer`][r58] when the `@ServiceConnection` `type` attribute includes [`RabbitStreamConnectionDetails`][r59] |
| [`DataRedisConnectionDetails`][r60] | Containers of type [`RedisContainer`][r61] or [`RedisStackContainer`][r62], or containers named "redis", "redis/redis-stack" or "redis/redis-stack-server" |
| [`ZipkinConnectionDetails`][r63] | Containers named "openzipkin/zipkin" |

> [TIP]
>
> By default, with the exception of [`RabbitStreamConnectionDetails`][r59], all applicable connection details beans will be created for a given [`Container`][r20].
> For example, a [`PostgreSQLContainer`][r56] will create both [`JdbcConnectionDetails`][r33] and [`R2dbcConnectionDetails`][r49].
>
> If you want to create only a subset of the applicable types, you can use the `type` attribute of [`@ServiceConnection`][r16].
>
> To create a [`RabbitStreamConnectionDetails`][r59] bean from a [`RabbitMQContainer`][r58], you must opt in using the `type` attribute of [`@ServiceConnection`][r16].
> The container must also expose port 5552, or port 5551 when SSL is configured, for RabbitMQ Streams.

By default `Container.getDockerImageName().getRepository()` is used to obtain the name used to find connection details.
The repository portion of the Docker image name ignores any registry and the version.
This works as long as Spring Boot is able to get the instance of the [`Container`][r20], which is the case when using a `static` field like in the example above.

If you’re using a [`@Bean`][r2] method, Spring Boot won’t call the bean method to get the Docker image name, because this would cause eager initialization issues.
Instead, the return type of the bean method is used to find out which connection detail should be used.
This works as long as you’re using typed containers such as [`Neo4jContainer`][r12] or [`RabbitMQContainer`][r58].
This stops working if you’re using [`GenericContainer`][r64], for example with Redis as shown in the following example:

{{CODE_12}}

{{CODE_13}}

Spring Boot can’t tell from [`GenericContainer`][r64] which container image is used, so the `name` attribute from [`@ServiceConnection`][r16] must be used to provide that hint.

You can also use the `name` attribute of [`@ServiceConnection`][r16] to override which connection detail will be used, for example when using custom images.
If you are using the Docker image `registry.mycompany.com/mirror/myredis`, you’d use `@ServiceConnection(name="redis")` to ensure [`DataRedisConnectionDetails`][r60] are created.

### SSL with Service Connections

You can use the [`@Ssl`][r65], [`@JksKeyStore`][r66], [`@JksTrustStore`][r67], [`@PemKeyStore`][r68] and [`@PemTrustStore`][r69] annotations on a supported container to enable SSL support for that service connection.
Please note that you still have to enable SSL on the service which is running inside the Testcontainer yourself, the annotations only configure SSL on the client side in your application.

{{CODE_14}}

The above code uses the [`@PemKeyStore`][r68] annotation to load the client certificate and key into the keystore and the and [`@PemTrustStore`][r69] annotation to load the CA certificate into the truststore.
This will authenticate the client against the server, and the CA certificate in the truststore makes sure that the server certificate is valid and trusted.

The `SecureRedisContainer` in this example is a custom subclass of `RedisContainer` which copies certificates to the correct places and invokes `redis-server` with commandline parameters enabling SSL.

The SSL annotations are supported for the following service connections:

- Cassandra
- Couchbase
- Elasticsearch
- Kafka
- MongoDB
- OpenTelemetry (OTLP logging, metrics, and tracing)
- RabbitMQ
- RabbitMQ Streams
- Redis

The `ElasticsearchContainer` additionally supports automatic detection of server side SSL.
To use this feature, annotate the container with [`@Ssl`][r65], as seen in the following example, and Spring Boot takes care of the client side SSL configuration for you:

{{CODE_15}}

## Dynamic Properties

A slightly more verbose but also more flexible alternative to service connections is [`@DynamicPropertySource`][r70].
A static [`@DynamicPropertySource`][r70] method allows adding dynamic property values to the Spring Environment.

{{CODE_16}}

{{CODE_17}}

The above configuration allows Neo4j-related beans in the application to communicate with Neo4j running inside the Testcontainers-managed Docker container.
