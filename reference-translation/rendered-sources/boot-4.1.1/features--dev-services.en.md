# Development-time Services

Development-time services provide external dependencies needed to run the application while developing it.
They are only supposed to be used while developing and are disabled when the application is deployed.

Spring Boot offers support for two development time services, Docker Compose and Testcontainers.
The next sections will provide more details about them.

## Docker Compose Support

Docker Compose is a popular technology that can be used to define and manage multiple containers for services that your application needs.
A `compose.yml` file is typically created next to your application which defines and configures service containers.

A typical workflow with Docker Compose is to run `docker compose up`, work on your application with it connecting to started services, then run `docker compose down` when you are finished.

The `spring-boot-docker-compose` module can be included in a project to provide support for working with containers using Docker Compose.
Add the module dependency to your build, as shown in the following listings for Maven and Gradle:

Maven

```xml
<dependencies>
	<dependency>
		<groupId>org.springframework.boot</groupId>
		<artifactId>spring-boot-docker-compose</artifactId>
		<optional>true</optional>
	</dependency>
</dependencies>
```

Gradle

```gradle
dependencies {
	developmentOnly("org.springframework.boot:spring-boot-docker-compose")
}
```

When this module is included as a dependency Spring Boot will do the following:

- Search for a `compose.yml` and other common compose filenames in your working directory
- Call `docker compose up` with the discovered `compose.yml`
- Create service connection beans for each supported container
- Call `docker compose stop` when the application is shutdown

If the Docker Compose services are already running when starting the application, Spring Boot will only create the service connection beans for each supported container.
It will not call `docker compose up` again and it will not call `docker compose stop` when the application is shutdown.

> [TIP]
>
> Repackaged archives do not contain Spring Boot’s Docker Compose by default.
> If you want to use this support, you need to include it.
> When using the Maven plugin, set the `excludeDockerCompose` property to `false`.
> When using the Gradle plugin, [configure the task’s classpath to include the `developmentOnly` configuration][r1].

### Prerequisites

You need to have the `docker` and `docker compose` (or `docker-compose`) CLI applications on your path.
The minimum supported Docker Compose version is 2.2.0.

### Service Connections

A service connection is a connection to any remote service.
Spring Boot’s auto-configuration can consume the details of a service connection and use them to establish a connection to a remote service.
When doing so, the connection details take precedence over any connection-related configuration properties.

When using Spring Boot’s Docker Compose support, service connections are established to the port mapped by the container.

> [NOTE]
>
> Docker compose is usually used in such a way that the ports inside the container are mapped to ephemeral ports on your computer.
> For example, a Postgres server may run inside the container using port 5432 but be mapped to a totally different port locally.
> The service connection will always discover and use the locally mapped port.

Service connections are established by using the image name of the container.
The following service connections are currently supported:

| Connection Details | Matched on |
| --- | --- |
| [`ActiveMQConnectionDetails`][r2] | Containers named "symptoma/activemq", "apache/activemq-classic" or "apache/activemq" |
| [`ArtemisConnectionDetails`][r3] | Containers named "apache/activemq-artemis" or "apache/artemis" |
| [`CassandraConnectionDetails`][r4] | Containers named "cassandra" |
| [`ElasticsearchConnectionDetails`][r5] | Containers named "elasticsearch" or "elasticsearch/elasticsearch" |
| [`HazelcastConnectionDetails`][r6] | Containers named "hazelcast/hazelcast". |
| [`JdbcConnectionDetails`][r7] | Containers named "clickhouse/clickhouse-server", "gvenzl/oracle-free", "gvenzl/oracle-xe", "mariadb", "mssql/server", "mysql", or "postgres" |
| [`LdapConnectionDetails`][r8] | Containers named "osixia/openldap", "lldap/lldap" |
| [`MongoConnectionDetails`][r9] | Containers named "mongo" |
| [`Neo4jConnectionDetails`][r10] | Containers named "neo4j" |
| [`OtlpLoggingConnectionDetails`][r11] | Containers named "otel/opentelemetry-collector-contrib", "grafana/otel-lgtm" |
| [`OtlpMetricsConnectionDetails`][r12] | Containers named "otel/opentelemetry-collector-contrib", "grafana/otel-lgtm" |
| [`OtlpTracingConnectionDetails`][r13] | Containers named "otel/opentelemetry-collector-contrib", "grafana/otel-lgtm" |
| [`PulsarConnectionDetails`][r14] | Containers named "apachepulsar/pulsar" |
| [`R2dbcConnectionDetails`][r15] | Containers named "clickhouse/clickhouse-server", "gvenzl/oracle-free", "gvenzl/oracle-xe", "mariadb", "mssql/server", "mysql", or "postgres" |
| [`RabbitConnectionDetails`][r16] | Containers named "rabbitmq" with container port 5672 mapped |
| [`RabbitStreamConnectionDetails`][r17] | Containers named "rabbitmq" with container port 5552 mapped, or port 5551 mapped when SSL is configured |
| [`DataRedisConnectionDetails`][r18] | Containers named "redis", "redis/redis-stack" or "redis/redis-stack-server" |
| [`ZipkinConnectionDetails`][r19] | Containers named "openzipkin/zipkin". |

### SSL support

Some images come with SSL enabled out of the box, or maybe you want to enable SSL for the container to mirror your production setup.
Spring Boot supports SSL configuration for supported service connections.
Please note that you still have to enable SSL on the service which is running inside the container yourself, this feature only configures SSL on the client side in your application.

SSL is supported for the following service connections:

- Cassandra
- Elasticsearch
- MongoDB
- OpenTelemetry (OTLP logging, metrics, and tracing)
- RabbitMQ
- RabbitMQ Streams
- Redis

To enable SSL support for a service, you can use [service labels][r20].

For JKS based keystores and truststores, you can use the following container labels:

- `org.springframework.boot.sslbundle.jks.key.alias`
- `org.springframework.boot.sslbundle.jks.key.password`
- `org.springframework.boot.sslbundle.jks.options.ciphers`
- `org.springframework.boot.sslbundle.jks.options.enabled-protocols`
- `org.springframework.boot.sslbundle.jks.protocol`
- `org.springframework.boot.sslbundle.jks.keystore.type`
- `org.springframework.boot.sslbundle.jks.keystore.provider`
- `org.springframework.boot.sslbundle.jks.keystore.location`
- `org.springframework.boot.sslbundle.jks.keystore.password`
- `org.springframework.boot.sslbundle.jks.truststore.type`
- `org.springframework.boot.sslbundle.jks.truststore.provider`
- `org.springframework.boot.sslbundle.jks.truststore.location`
- `org.springframework.boot.sslbundle.jks.truststore.password`

These labels mirror the properties available for [SSL bundles][r21].

For PEM based keystores and truststores, you can use the following container labels:

- `org.springframework.boot.sslbundle.pem.key.alias`
- `org.springframework.boot.sslbundle.pem.key.password`
- `org.springframework.boot.sslbundle.pem.options.ciphers`
- `org.springframework.boot.sslbundle.pem.options.enabled-protocols`
- `org.springframework.boot.sslbundle.pem.protocol`
- `org.springframework.boot.sslbundle.pem.keystore.type`
- `org.springframework.boot.sslbundle.pem.keystore.certificate`
- `org.springframework.boot.sslbundle.pem.keystore.private-key`
- `org.springframework.boot.sslbundle.pem.keystore.private-key-password`
- `org.springframework.boot.sslbundle.pem.truststore.type`
- `org.springframework.boot.sslbundle.pem.truststore.certificate`
- `org.springframework.boot.sslbundle.pem.truststore.private-key`
- `org.springframework.boot.sslbundle.pem.truststore.private-key-password`

These labels mirror the properties available for [SSL bundles][r22].

The following example enables SSL for a redis container:

```yaml
services:
  redis:
    image: 'redis:latest'
    ports:
      - '6379'
    secrets:
      - ssl-ca
      - ssl-key
      - ssl-cert
    command: 'redis-server --tls-port 6379 --port 0 --tls-cert-file /run/secrets/ssl-cert --tls-key-file /run/secrets/ssl-key --tls-ca-cert-file /run/secrets/ssl-ca'
    labels:
      - 'org.springframework.boot.sslbundle.pem.keystore.certificate=client.crt'
      - 'org.springframework.boot.sslbundle.pem.keystore.private-key=client.key'
      - 'org.springframework.boot.sslbundle.pem.truststore.certificate=ca.crt'
secrets:
  ssl-ca:
    file: 'ca.crt'
  ssl-key:
    file: 'server.key'
  ssl-cert:
    file: 'server.crt'
```

### Custom Images

Sometimes you may need to use your own version of an image to provide a service.
You can use any custom image as long as it behaves in the same way as the standard image.
Specifically, any environment variables that the standard image supports must also be used in your custom image.

If your image uses a different name, you can use a label in your `compose.yml` file so that Spring Boot can provide a service connection.
Use a label named `org.springframework.boot.service-connection` to provide the service name.

For example:

```yaml
services:
  redis:
    image: 'mycompany/mycustomredis:7.0'
    ports:
      - '6379'
    labels:
      org.springframework.boot.service-connection: redis
```

### Skipping Specific Containers

If you have a container image defined in your `compose.yml` that you don’t want connected to your application you can use a label to ignore it.
Any container with labeled with `org.springframework.boot.ignore` will be ignored by Spring Boot.

For example:

```yaml
services:
  redis:
    image: 'redis:7.0'
    ports:
      - '6379'
    labels:
      org.springframework.boot.ignore: true
```

### Using a Specific Compose File

If your compose file is not in the same directory as your application, or if it’s named differently, you can use `spring.docker.compose.file` in your `application.properties` or `application.yaml` to point to a different file.
Properties can be defined as an exact path or a path that’s relative to your application.

For example:

```properties
spring.docker.compose.file=../my-compose.yml
```

```yaml
spring:
  docker:
    compose:
      file: "../my-compose.yml"
```

### Waiting for Container Readiness

Containers started by Docker Compose may take some time to become fully ready.
The recommended way of checking for readiness is to add a `healthcheck` section under the service definition in your `compose.yml` file.

Since it’s not uncommon for `healthcheck` configuration to be omitted from `compose.yml` files, Spring Boot also checks directly for service readiness.
By default, a container is considered ready when a TCP/IP connection can be established to its mapped port.

You can disable this on a per-container basis by adding a `org.springframework.boot.readiness-check.tcp.disable` label in your `compose.yml` file.

For example:

```yaml
services:
  redis:
    image: 'redis:7.0'
    ports:
      - '6379'
    labels:
      org.springframework.boot.readiness-check.tcp.disable: true
```

You can also change timeout values in your `application.properties` or `application.yaml` file:

```properties
spring.docker.compose.readiness.tcp.connect-timeout=10s
spring.docker.compose.readiness.tcp.read-timeout=5s
```

```yaml
spring:
  docker:
    compose:
      readiness:
        tcp:
          connect-timeout: 10s
          read-timeout: 5s
```

The overall timeout can be configured using `spring.docker.compose.readiness.timeout`.

### Controlling the Docker Compose Lifecycle

By default Spring Boot calls `docker compose up` when your application starts and `docker compose stop` when it’s shut down.
If you prefer to have different lifecycle management you can use the `spring.docker.compose.lifecycle-management` property.

The following values are supported:

- `none` - Do not start or stop Docker Compose
- `start-only` - Start Docker Compose when the application starts and leave it running
- `start-and-stop` - Start Docker Compose when the application starts and stop it when the JVM exits

In addition you can use the `spring.docker.compose.start.command` property to change whether `docker compose up` or `docker compose start` is used.
The `spring.docker.compose.stop.command` allows you to configure if `docker compose down` or `docker compose stop` is used.

You can also pass additional arguments to Docker Compose commands.
The `spring.docker.compose.arguments` property allows you to specify arguments that are passed to all Docker Compose commands.
The `spring.docker.compose.start.arguments` property allows you to specify arguments that are passed only to the up (or start) command, while the `spring.docker.compose.stop.arguments` property allows you to specify arguments that are passed only to the down (or stop) command.

The following example shows how lifecycle management can be configured:

```properties
spring.docker.compose.lifecycle-management=start-and-stop
spring.docker.compose.arguments[0]=--project-name=myapp
spring.docker.compose.arguments[1]=--progress=auto
spring.docker.compose.start.command=up
spring.docker.compose.start.arguments[0]=--build
spring.docker.compose.start.arguments[1]=--force-recreate
spring.docker.compose.stop.command=down
spring.docker.compose.stop.timeout=1m
spring.docker.compose.stop.arguments[0]=--volumes
spring.docker.compose.stop.arguments[1]=--remove-orphans
```

```yaml
spring:
  docker:
    compose:
      lifecycle-management: start-and-stop
      arguments:
        - "--project-name=myapp"
        - "--progress=auto"
      start:
        command: up
        arguments:
          - "--build"
          - "--force-recreate"
      stop:
        command: down
        timeout: 1m
        arguments:
          - "--volumes"
          - "--remove-orphans"
```

### Activating Docker Compose Profiles

Docker Compose profiles are similar to Spring profiles in that they let you adjust your Docker Compose configuration for specific environments.
If you want to activate a specific Docker Compose profile you can use the `spring.docker.compose.profiles.active` property in your `application.properties` or `application.yaml` file:

```properties
spring.docker.compose.profiles.active=myprofile
```

```yaml
spring:
  docker:
    compose:
      profiles:
        active: "myprofile"
```

### Using Docker Compose in Tests

By default, Spring Boot’s Docker Compose support is disabled when running tests.

To enable Docker Compose support in tests, set `spring.docker.compose.skip.in-tests` to `false`.

When using Gradle, you also need to change the configuration of the `spring-boot-docker-compose` dependency from `developmentOnly` to `testAndDevelopmentOnly`:

Gradle

```gradle
dependencies {
	testAndDevelopmentOnly("org.springframework.boot:spring-boot-docker-compose")
}
```

## Testcontainers Support

As well as [using Testcontainers for integration testing][r23], it’s also possible to use them at development time.
The next sections will provide more details about that.

### Using Testcontainers at Development Time

This approach allows developers to quickly start containers for the services that the application depends on, removing the need to manually provision things like database servers.
Using Testcontainers in this way provides functionality similar to Docker Compose, except that your container configuration is in Java rather than YAML.

To use Testcontainers at development time you need to launch your application using your “test” classpath rather than “main”.
This will allow you to access all declared test dependencies and give you a natural place to write your test configuration.

To create a test launchable version of your application you should create an “Application” class in the `src/test` directory.
For example, if your main application is in `src/main/java/com/example/MyApplication.java`, you should create `src/test/java/com/example/TestMyApplication.java`

The `TestMyApplication` class can use the `SpringApplication.from(…​)` method to launch the real application:

```kotlin
import org.springframework.boot.fromApplication

fun main(args: Array<String>) {
	fromApplication<MyApplication>().run(*args)
}
```

```java
import org.springframework.boot.SpringApplication;

public class TestMyApplication {

	public static void main(String[] args) {
		SpringApplication.from(MyApplication::main).run(args);
	}

}
```

You’ll also need to define the [`Container`][r24] instances that you want to start along with your application.
To do this, you need to make sure that the `spring-boot-testcontainers` module has been added as a `test` dependency.
Once that has been done, you can create a [`@TestConfiguration`][r25] class that declares [`@Bean`][r26] methods for the containers you want to start.

You can also annotate your [`@Bean`][r26] methods with [`@ServiceConnection`][r27] in order to create [`ConnectionDetails`][r28] beans.
See [the service connections][r29] section for details of the supported technologies.

A typical Testcontainers configuration would look like this:

```kotlin
import org.springframework.boot.test.context.TestConfiguration
import org.springframework.boot.testcontainers.service.connection.ServiceConnection
import org.springframework.context.annotation.Bean
import org.testcontainers.neo4j.Neo4jContainer

@TestConfiguration(proxyBeanMethods = false)
class MyContainersConfiguration {

	@Bean
	@ServiceConnection
	fun neo4jContainer(): Neo4jContainer {
		return Neo4jContainer("neo4j:5")
	}

}
```

```java
import org.testcontainers.neo4j.Neo4jContainer;

import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.context.annotation.Bean;

@TestConfiguration(proxyBeanMethods = false)
public class MyContainersConfiguration {

	@Bean
	@ServiceConnection
	public Neo4jContainer neo4jContainer() {
		return new Neo4jContainer("neo4j:5");
	}

}
```

> [NOTE]
>
> The lifecycle of [`Container`][r24] beans is automatically managed by Spring Boot.
> Containers will be started and stopped automatically.

> [TIP]
>
> You can use the `spring.testcontainers.beans.startup` property to change how containers are started.
> By default `sequential` startup is used, but you may also choose `parallel` if you wish to start multiple containers in parallel.

Once you have defined your test configuration, you can use the `with(…​)` method to attach it to your test launcher:

```kotlin
import org.springframework.boot.fromApplication
import org.springframework.boot.with

fun main(args: Array<String>) {
	fromApplication<MyApplication>().with(MyContainersConfiguration::class).run(*args)
}
```

```java
import org.springframework.boot.SpringApplication;

public class TestMyApplication {

	public static void main(String[] args) {
		SpringApplication.from(MyApplication::main).with(MyContainersConfiguration.class).run(args);
	}

}
```

You can now launch `TestMyApplication` as you would any regular Java `main` method application to start your application and the containers that it needs to run.

> [TIP]
>
> You can use the Maven goal `spring-boot:test-run` or the Gradle task `bootTestRun` to do this from the command line.

#### Contributing Dynamic Properties at Development Time

If you want to contribute dynamic properties at development time from your [`Container`][r24] [`@Bean`][r26] methods, define an additional [`DynamicPropertyRegistrar`][r30] bean.
The registrar should be defined using a [`@Bean`][r26] method that injects the container from which the properties will be sourced as a parameter.
This arrangement ensures that container has been started before the properties are used.

A typical configuration would look like this:

```kotlin
import org.springframework.boot.test.context.TestConfiguration
import org.springframework.context.annotation.Bean
import org.springframework.test.context.DynamicPropertyRegistrar;
import org.testcontainers.mongodb.MongoDBContainer

@TestConfiguration(proxyBeanMethods = false)
class MyContainersConfiguration {

	@Bean
	fun mongoDbContainer(): MongoDBContainer {
		return MongoDBContainer("mongo:5.0")
	}
	
	@Bean
	fun mongoDbProperties(container: MongoDBContainer): DynamicPropertyRegistrar {
		return DynamicPropertyRegistrar { properties ->
			properties.add("spring.mongodb.host") { container.host }
			properties.add("spring.mongodb.port") { container.firstMappedPort }
		}
	}

}
```

```java
import org.testcontainers.mongodb.MongoDBContainer;

import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.test.context.DynamicPropertyRegistrar;

@TestConfiguration(proxyBeanMethods = false)
public class MyContainersConfiguration {

	@Bean
	public MongoDBContainer mongoDbContainer() {
		return new MongoDBContainer("mongo:5.0");
	}

	@Bean
	public DynamicPropertyRegistrar mongoDbProperties(MongoDBContainer container) {
		return (properties) -> {
			properties.add("spring.mongodb.host", container::getHost);
			properties.add("spring.mongodb.port", container::getFirstMappedPort);
		};
	}

}
```

> [NOTE]
>
> Using a [`@ServiceConnection`][r27] is recommended whenever possible, however, dynamic properties can be a useful fallback for technologies that don’t yet have [`@ServiceConnection`][r27] support.

#### Importing Testcontainers Declaration Classes

A common pattern when using Testcontainers is to declare [`Container`][r24] instances as static fields.
Often these fields are defined directly on the test class.
They can also be declared on a parent class or on an interface that the test implements.

For example, the following `MyContainers` interface declares `mongo` and `neo4j` containers:

```kotlin
import org.springframework.boot.testcontainers.service.connection.ServiceConnection
import org.testcontainers.junit.jupiter.Container
import org.testcontainers.mongodb.MongoDBContainer
import org.testcontainers.neo4j.Neo4jContainer

interface MyContainers {

	companion object {

		@Container
		@ServiceConnection
		@JvmField
		val mongoContainer = MongoDBContainer("mongo:5.0")

		@Container
		@ServiceConnection
		@JvmField
		val neo4jContainer = Neo4jContainer("neo4j:5")

	}

}
```

```java
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.mongodb.MongoDBContainer;
import org.testcontainers.neo4j.Neo4jContainer;

import org.springframework.boot.testcontainers.service.connection.ServiceConnection;

public interface MyContainers {

	@Container
	@ServiceConnection
	MongoDBContainer mongoContainer = new MongoDBContainer("mongo:5.0");

	@Container
	@ServiceConnection
	Neo4jContainer neo4jContainer = new Neo4jContainer("neo4j:5");

}
```

If you already have containers defined in this way, or you just prefer this style, you can import these declaration classes rather than defining your containers as [`@Bean`][r26] methods.
To do so, add the [`@ImportTestcontainers`][r31] annotation to your test configuration class:

```kotlin
import org.springframework.boot.test.context.TestConfiguration
import org.springframework.boot.testcontainers.context.ImportTestcontainers

@TestConfiguration(proxyBeanMethods = false)
@ImportTestcontainers(MyContainers::class)
class MyContainersConfiguration
```

```java
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.testcontainers.context.ImportTestcontainers;

@TestConfiguration(proxyBeanMethods = false)
@ImportTestcontainers(MyContainers.class)
public class MyContainersConfiguration {

}
```

> [TIP]
>
> If you don’t intend to use the [service connections feature][r29] but want to use [`@DynamicPropertySource`][r32] instead, remove the [`@ServiceConnection`][r27] annotation from the [`Container`][r24] fields.
> You can also add [`@DynamicPropertySource`][r33] annotated methods to your declaration class.

#### Using DevTools with Testcontainers at Development Time

When using devtools, you can annotate beans and bean methods with [`@RestartScope`][r34].
Such beans won’t be recreated when the devtools restart the application.
This is especially useful for [`Container`][r24] beans, as they keep their state despite the application restart.

```kotlin
import org.springframework.boot.devtools.restart.RestartScope
import org.springframework.boot.test.context.TestConfiguration
import org.springframework.boot.testcontainers.service.connection.ServiceConnection
import org.springframework.context.annotation.Bean
import org.testcontainers.mongodb.MongoDBContainer

@TestConfiguration(proxyBeanMethods = false)
class MyContainersConfiguration {

	@Bean
	@RestartScope
	@ServiceConnection
	fun mongoDbContainer(): MongoDBContainer {
		return MongoDBContainer("mongo:5.0")
	}

}
```

```java
import org.testcontainers.mongodb.MongoDBContainer;

import org.springframework.boot.devtools.restart.RestartScope;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.context.annotation.Bean;

@TestConfiguration(proxyBeanMethods = false)
public class MyContainersConfiguration {

	@Bean
	@RestartScope
	@ServiceConnection
	public MongoDBContainer mongoDbContainer() {
		return new MongoDBContainer("mongo:5.0");
	}

}
```

> [WARNING]
>
> If you’re using Gradle and want to use this feature, you need to change the configuration of the `spring-boot-devtools` dependency from `developmentOnly` to `testAndDevelopmentOnly`.
> With the default scope of `developmentOnly`, the `bootTestRun` task will not pick up changes in your code, as the devtools are not active.
