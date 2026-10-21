# gRPC

Google Remote Procedure Call (gRPC) is a high-performance RPC framework that enables client-server communication using binary messages.
Spring Boot includes support for developing and testing both client and server gRPC applications.

The underlying message format used by gRPC is Protocol Buffers, which allow messages to be created and consumed by a wide variety of programming languages.

## Service Definitions

To develop a gRPC application, you first need a Protocol Buffers service definition file.
A `.proto` file defines the services and messages that your application can consume or provide.

Here’s an example of a typical `.proto` file that uses [the `proto3` revision][r1] of the protocol buffers language:

```protobuf
syntax = "proto3";

option java_package = "com.example.grpc.proto";
option java_multiple_files = true;

service HelloWorld {
    rpc SayHello (HelloRequest) returns (HelloReply) {}
}

message HelloRequest {
    string name = 1;
}

message HelloReply {
    string message = 1;
}
```

This file defines a `HelloWorld` service with a single method that accepts a `HelloRequest` message and returns a `HelloReply` message.
The `HelloRequest` message contains a `name` string field.
The `HelloReply` message contains a `message` string field.

With the exception of the `java_package` and `java_multiple_files` options, there is nothing in the `.proto` file that is specific to the Java programming language.

### Generating Java Code

Since `.proto` files are language agnostic, we need a process to convert them into usable Java code.
We can then use the generated code to either make a remote procedure call to a running service or implement the service ourselves so that others may call it.

The exact process you use to generate code will depend on your build system.
Spring Boot supports both Maven and Gradle protobuf plugins, but you are free to use whatever solution works best for you.

#### Using the Maven Plugin

Spring Boot includes dependency management for the `io.github.ascopes:protobuf-maven-plugin` Maven plugin.
If you are using the `spring-boot-starter-parent` POM, you’ll also get sensible out-of-the-box configuration.

The following shows a typical Maven POM file that uses the plugin:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
	xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
	<modelVersion>4.0.0</modelVersion>
    <parent>
		<groupId>org.springframework.boot</groupId>
		<artifactId>spring-boot-starter-parent</artifactId>
		<version>4.1.1</version>
	</parent>
	<groupId>com.example</groupId>
	<artifactId>myproject</artifactId>
	<version>0.0.1-SNAPSHOT</version>

	<build>
		<plugins>
			<plugin>
				<groupId>io.github.ascopes</groupId>
				<artifactId>protobuf-maven-plugin</artifactId>
			</plugin>
			<plugin>
				<groupId>org.springframework.boot</groupId>
				<artifactId>spring-boot-maven-plugin</artifactId>
			</plugin>
		</plugins>
	</build>

</project>
```

Since POM above extends `spring-boot-starter-parent`, you’ll get the following:

- Configuration of the `protoc` version.
- Configuration of the `binary-maven` plugin.
- Execution configuration for the `generate` goal.

The `.proto` files should be added to `src/main/proto`.

> [TIP]
>
> If you don’t use `spring-boot-starter-parent`, or you want to configure the plugin directly, refer to the [protobuf-maven-plugin documentation][r2].
> If you use Spring Boot’s dependency management the `${protobuf-java.version}` and `${grpc-java.version}` properties will be useful.

#### Using the Gradle Plugin

Spring Boot includes dependency management for the `com.google.protobuf:protobuf-gradle-plugin` Gradle plugin.
In addition, the `spring-boot-gradle-plugin` will react to the presence of the protobuf plugin and configure it appropriately.

The following shows a typical Gradle file that uses the plugin:

```gradle
plugins {
	id 'java'
	id 'org.springframework.boot' version '4.1.1'
	id 'io.spring.dependency-management' version '1.1.7'
	id 'com.google.protobuf' version '0.9.6'
}

group = 'com.example'
version = '0.0.1-SNAPSHOT'

java {
	toolchain {
		languageVersion = JavaLanguageVersion.of(17)
	}
}

repositories {
	mavenCentral()
}

protobuf {
	plugins {
		grpc {}
	}
}
```

The `org.springframework.boot` reacts to the `com.google.protobuf` plugin and configures `protoc` and its version.
Additionally, because the `protobuf` extension has been configured to use the `grpc` plugin, the `org.springframework.boot` plugin also configures `protoc-gen-grpc-java` and its version.

The `.proto` files should be added to `src/main/proto`.

> [TIP]
>
> If you don’t use `org.springframework.boot` plugin, or you want to configure the plugin directly, refer to the [protobuf-gradle-plugin documentation][r3].

## Writing a gRPC Server Application

Spring Boot provides a `spring-boot-grpc-server` module and a `spring-boot-starter-grpc-server` starter POM that you can use for server applications.

In order to write the actual server code, you’ll need to extend one or more of the base classes generated from your `.proto` file and expose them as Spring beans.
Spring gRPC will automatically expose any bean that implements [`BindableService`][r4] as a gRPC server.
Since all `.proto` generated classes implement [`BindableService`][r4], adding them as beans is enough to expose them over gRPC.

> [TIP]
>
> For more details, see [the Spring gRPC documentation][r5].

The following example shows how the `HelloWorld` service from the `.proto` file above could be implemented.
In this example, we’re using the [`@GrpcService`][r6] annotation and assuming that the code is in a package that will be picked up by component scanning:

```kotlin
import io.grpc.stub.StreamObserver
import org.springframework.grpc.server.service.GrpcService

@GrpcService
class MyHelloWorldService : HelloWorldGrpc.HelloWorldImplBase() {

	override fun sayHello(request: HelloRequest,  responseObserver: StreamObserver<HelloReply>) {
		val message = "Hello '${request.getName()}'"
		val reply = HelloReply.newBuilder().setMessage(message).build()
		responseObserver.onNext(reply)
		responseObserver.onCompleted()
	}

}
```

```java
import io.grpc.stub.StreamObserver;

import org.springframework.grpc.server.service.GrpcService;

@GrpcService
public class MyHelloWorldService extends HelloWorldGrpc.HelloWorldImplBase {

	@Override
	public void sayHello(HelloRequest request, StreamObserver<HelloReply> responseObserver) {
		String message = "Hello '%s'".formatted(request.getName());
		HelloReply reply = HelloReply.newBuilder().setMessage(message).build();
		responseObserver.onNext(reply);
		responseObserver.onCompleted();
	}

}
```

If the application makes used of `spring-boot-starter-grpc-server`, then Netty will be used as the server implementation listening on port `9090`.

You can test your application using [grpcurl][r7]:

```shell
$ grpcurl -d '{"name":"Spring"}' -plaintext localhost:9090 HelloWorld.SayHello
```

```json
{
  "message": "Hello 'Spring'"
}
```

### Switching to a Netty Shaded Server

If you find that the version of Netty provided by the `spring-boot-starter-grpc-server` starter POM isn’t compatible with other libraries you use, you can switch to a “shaded” version.

To switch, you can exclude `io.grpc:grpc-netty` and include `io.grpc:grpc-netty-shaded`.
For example:

```xml
<dependency>
	<groupId>org.springframework.boot</groupId>
	<artifactId>spring-boot-starter-grpc-server</artifactId>
	<exclusions>
		<!-- Exclude the gRPC Netty dependency -->
		<exclusion>
			<groupId>io.grpc</groupId>
			<artifactId>grpc-netty</artifactId>
		</exclusion>
	</exclusions>
</dependency>
<!-- Use gRPC Netty Shaded instead -->
<dependency>
	<groupId>io.grpc</groupId>
	<artifactId>grpc-netty-shaded</artifactId>
</dependency>
```

```gradle
dependencies {
	implementation('org.springframework.boot:spring-boot-starter-grpc-server') {
		// Exclude the gRPC Netty dependency
		exclude group: 'io.grpc', module: 'grpc-netty'
	}
	// Use gRPC Netty Shaded instead
	implementation "io.grpc:grpc-netty-shaded"
}
```

### Switching to a Servlet Container

It’s possible to expose gRPC services using a regular Servlet Container such as Tomcat rather than using Netty.
To do so, your Servlet Container must be configured to support HTTP/2.

To switch to the Servlet gRPC implementation, you can exclude `io.grpc:grpc-netty` and include `io.grpc:grpc-servlet-jakarta`.
For example:

```xml
<dependency>
	<groupId>org.springframework.boot</groupId>
	<artifactId>spring-boot-starter-webmvc</artifactId>
</dependency>
<dependency>
	<groupId>org.springframework.boot</groupId>
	<artifactId>spring-boot-starter-grpc-server</artifactId>
	<exclusions>
		<!-- Exclude the gRPC Netty dependency -->
		<exclusion>
			<groupId>io.grpc</groupId>
			<artifactId>grpc-netty</artifactId>
		</exclusion>
	</exclusions>
</dependency>
<!-- Use gRPC Servlet Jakarta instead -->
<dependency>
	<groupId>io.grpc</groupId>
	<artifactId>grpc-servlet-jakarta</artifactId>
</dependency>
```

```gradle
dependencies {
	implementation('org.springframework.boot:spring-boot-starter-webmvc') {
	implementation('org.springframework.boot:spring-boot-starter-grpc-server') {
		// Exclude the gRPC Netty dependency
		exclude group: 'io.grpc', module: 'grpc-netty'
	}
	// Use gRPC Servlet Jakarta instead
	implementation "io.grpc:grpc-servlet-jakarta"
}
```

> [TIP]
>
> Remember to include a Servlet Container dependency – `spring-boot-starter-tomcat`, for example – and to set `server.http2.enabled` to `true`.

> [NOTE]
>
> When using a servlet container, certain gRPC server configuration properties are not relevant and will be ignored.
> For example, `spring.grpc.server.port` is ignored since `server.port` is used to set a web server port.

### SSL Support

SSL can be configured for both `grpc-netty` and `grpc-netty-shaded` servers using SSL bundles.
See the [SSL core documentation][r8] for details on how to declare an SSL bundle.

Once your bundle has been defined, you can use the following properties in your gRPC server application to use it:

```properties
spring.grpc.server.ssl.bundle=mysslbundle
```

```yaml
spring:
  grpc:
    server:
      ssl:
        bundle: mysslbundle
```

Client authentication can also be configured by setting `spring.grpc.server.ssl.client-auth` to `optional` or `require`.

> [TIP]
>
> To temporarily disable server SSL support – to aid with testing, for example – set `spring.grpc.server.ssl.enabled` to `false`.

### Using an In-Process Server

You can run an in-process server by including the `io.grpc:grpc-inprocess` dependency on your classpath and defining a `spring.grpc.server.inprocess.name` property.
In this mode, the in-process server factory is auto-configured in addition to the regular server factory.

The name you provide can be used as a client channel target using the form `in-process:<name>`.

### Reflection

When it’s available, Spring Boot will auto-configure the [gRPC Reflection service][r9].
This allows clients to browse the metadata of your services and download their `.proto` files.

The reflection service resides in the `io.grpc:grpc-services` library, which is an optional dependency.
You will need to add the dependency to your project in order for auto-configuration to apply.

> [TIP]
>
> If you have the `io.grpc:grpc-services` library but prefer that reflection isn’t auto-configured, you can set `spring.grpc.server.reflection.enabled` to `false`.

### Server Health

A gRPC server can provide health information using a standard service API ([health/v1][r10]).
This allows clients to check on the health of your server services a route traffic appropriately.

Spring Boot provides a bridge between its own `spring-boot-health` module and the standard gRPC health service.
Health information is provided whenever the `io.grpc:grpc-services` and `org.springframework.boot:spring-boot-health` modules are on your classpath.

> [TIP]
>
> If you don’t want health indicators to be exposed, you can set `spring.grpc.server.health.enabled` to `false`.

#### Service Specific Health Mappings

By default, health information is provided for the overall server status (`""`) using all available health indicators.

It is also possible to provide fine-grained health information for specific services by including only a sub-set of health indicators.
Custom mapping and ordering rules can also be defined on a per-service basis.

For example, the following configuration will provide health for “myservice” using only the `db` and `redis` indicators.

```properties
spring.grpc.server.health.service.myservice.include[0]=db
spring.grpc.server.health.service.myservice.include[1]=redis
```

```yaml
spring:
  grpc:
    server:
      health:
        service:
          myservice:
            include:
            - db
            - redis
```

> [TIP]
>
> You can set `spring.grpc.server.health.include-overall-health` to `false` to disable the overall server status health if you only want to provide service-specific health.

#### Push Configuration

Unlike web-based health checks, gRPC health information is periodically pushed rather than pulled.
By default, the first health push happens 5 seconds after the application starts and then every subsequent 5 seconds.

To fine-tune this, you can use the following properties:

```properties
spring.grpc.server.health.schedule.period=5m
spring.grpc.server.health.schedule.delay=2s
```

```yaml
spring:
  grpc:
    server:
      health:
        schedule:
          period: 5m
          delay: 2s
```

> [TIP]
>
> You can also set `spring.grpc.server.health.schedule.enabled` to `false` if want to send health updates in some other way.

### Securing gRPC Server Applications

#### Netty Based Servers

Spring gRPC includes features that allow you to secure your Netty based server applications declaratively using Spring Security.
This follows similar patterns to those you would use to secure a regular web application.

Spring Boot provides auto-configuration for both [`GrpcSecurity`][r11] and [`SecurityGrpcExceptionHandler`][r12] beans.
Typically gRPC application are then secured using [`@PreAuthorize`][r13] annotations on your gRPC service beans, or a [`AuthenticationProcessInterceptor`][r14] bean.

For more details, please see [the Spring gRPC documentation][r15].

#### Servlet Container Based Servers

If your gRPC server is running [within a standard Servlet Container][r16], you can use typical [web security configuration][r17] to secure your application.
Spring Boot will auto-configre [`GrpcServerExecutorProvider`][r18] and [`SecurityContextServerInterceptor`][r19] beans to ensure that Spring Security works correctly.

Cross-Site Request Forgery (CSRF) protection is incompatible with the gRPC protocol and will be disabled by default for all gRPC requests.
If you prefer to configure your own CSRF protection, you can switch this off by setting `spring.grpc.server.security.csrf.enabled` to `false`.

To help with manual Security configuration, Spring Boot provides request matchers for gRPC services.
Matches are available for both servlet and reactive stacks.
For example, the following will include all gRPC services with the exception of “special”.

```kotlin
import org.springframework.boot.grpc.server.autoconfigure.security.web.servlet.GrpcRequest
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.security.config.Customizer.withDefaults
import org.springframework.security.config.annotation.web.builders.HttpSecurity
import org.springframework.security.web.SecurityFilterChain

@Configuration(proxyBeanMethods = false)
class MySecurityConfiguration {

	@Bean
	fun securityFilterChain(http: HttpSecurity): SecurityFilterChain {
		http.securityMatcher(GrpcRequest.toAnyService().excluding("special"))
		http.authorizeHttpRequests { requests -> requests.anyRequest().hasRole("GRPC_ADMIN") }
		http.httpBasic(withDefaults())
		return http.build()
	}

}
```

```java
import org.springframework.boot.grpc.server.autoconfigure.security.web.servlet.GrpcRequest;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;

import static org.springframework.security.config.Customizer.withDefaults;

@Configuration(proxyBeanMethods = false)
public class MySecurityConfiguration {

	@Bean
	public SecurityFilterChain securityFilterChain(HttpSecurity http) {
		http.securityMatcher(GrpcRequest.toAnyService().excluding("special"));
		http.authorizeHttpRequests((requests) -> requests.anyRequest().hasRole("GRPC_ADMIN"));
		http.httpBasic(withDefaults());
		return http.build();
	}

}
```

> [NOTE]
>
> For reactive matches use [`org.springframework.boot.grpc.server.autoconfigure.security.web.servlet.GrpcRequest`][r20].

#### OAuth2 Resource Server

[OAuth2][r21] is a widely used authorization framework.
Spring Boot’s OAuth2 Resource Server support in compatible with gRPC and may be configured in the usual way.

For details of how to configure an OAuth2 Resource Server to use with your gRPC server application, see the [“OAuth2” section][r22] of under “Security”.

## Writing a gRPC Client Application

Spring Boot provides a `spring-boot-grpc-client` module and a `spring-boot-starter-grpc-client` starter POM that you can use for client applications.

Clients can call remote gRPC services by importing one or more of the “stub” classes generated from their `.proto` file.
You can use the [`@ImportGrpcClients`][r23] annotation to import the stub classes you want to use.

Each import includes a `target` which can either be a logical channel name, or the base URL of the remote server.
We typically recommend using channel names rather than hard-coding targets.

Here’s a typical example:

```kotlin
import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.docs.features.springapplication.MyApplication
import org.springframework.boot.runApplication
import org.springframework.grpc.client.ImportGrpcClients

@SpringBootApplication(proxyBeanMethods = false)
@ImportGrpcClients(target = "hello", types = [HelloWorldGrpc.HelloWorldBlockingStub::class])
class MyApplication

fun main(args: Array<String>) {
	runApplication<MyApplication>(*args)
}
```

```java
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.grpc.client.ImportGrpcClients;

@SpringBootApplication(proxyBeanMethods = false)
@ImportGrpcClients(target = "hello", types = HelloWorldGrpc.HelloWorldBlockingStub.class)
public class MyApplication {

	public static void main(String[] args) {
		SpringApplication.run(MyApplication.class, args);
	}

}
```

> [NOTE]
>
> If you don’t specify a `target` then “default” is used.

> [TIP]
>
> You can use the `basePackageClasses` or `basePackages` attribute of [`@ImportGrpcClients`][r23] to import all stubs in given package.

### Channel Properties

When the `target` attribute of [`@ImportGrpcClients`][r23] uses a logical channel name, you’ll need to provide some properties so that Spring Boot can find the actual gRPC server to call.

To do that, you can add an entry using `spring.grpc.channel.<name>.*` properties.
Typically, you’ll configure the actual real `target`, along with any other settings that are unique to the channel.

For example, the following will configure `myservice` to use the real target of `static://grpc.example.com:9090`.
It also changes the keep-alive timeout and the maximum message size permitted:

```properties
spring.grpc.client.channel.myservice.target=static://grpc.example.com:9090
spring.grpc.client.channel.myservice.inbound.keepalive.timeout=40s
spring.grpc.client.channel.myservice.inbound.message.max-size=8MB
```

```yaml
spring:
  grpc:
    client:
      channel:
        myservice:
          target: static://grpc.example.com:9090
          inbound:
            keepalive:
              timeout: 40s
            message:
              max-size: 8MB
```

### Using Stub Beans

With your [`@ImportGrpcClients`][r23] annotations in place, and your properties written, you can use stubs as you would any other bean.

For example, here’s the `HelloWorldStub` being injected into a `ApplicationRunner` bean:

```kotlin
import org.springframework.boot.ApplicationArguments
import org.springframework.boot.ApplicationRunner

class MyApplicationRunner(val helloStub: HelloWorldGrpc.HelloWorldBlockingStub) : ApplicationRunner {

	override fun run(args: ApplicationArguments) {
		val request = HelloRequest.newBuilder().setName("Spring").build()
		val reply: HelloReply = helloStub.sayHello(request)
		println(reply.getMessage())
	}

}
```

```java
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.docs.io.grpc.client.stubbeans.HelloWorldGrpc.HelloWorldBlockingStub;
import org.springframework.stereotype.Component;

@Component
class MyApplicationRunner implements ApplicationRunner {

	private final HelloWorldBlockingStub helloStub;

	MyApplicationRunner(HelloWorldGrpc.HelloWorldBlockingStub helloStub) {
		this.helloStub = helloStub;
	}

	@Override
	public void run(ApplicationArguments args) throws Exception {
		HelloRequest request = HelloRequest.newBuilder().setName("Spring").build();
		HelloReply reply = this.helloStub.sayHello(request);
		System.out.println(reply.getMessage());
	}

}
```

### Switching to Netty Shaded Client Transport

Under the hood, remote gRPC network calls are made using Netty.
If you find that the version of Netty provided by the `spring-boot-starter-grpc-client` starter POM isn’t compatible with other libraries you use, you can switch to a “shaded” version.

To switch, you can excluded `io.grpc:grpc-netty` and include `io.grpc:grpc-netty-shaded`.
For example:

```xml
<dependency>
	<groupId>org.springframework.boot</groupId>
	<artifactId>spring-boot-starter-grpc-client</artifactId>
	<exclusions>
		<!-- Exclude the gRPC Netty dependency -->
		<exclusion>
			<groupId>io.grpc</groupId>
			<artifactId>grpc-netty</artifactId>
		</exclusion>
	</exclusions>
</dependency>
<!-- Use gRPC Netty Shaded instead -->
<dependency>
	<groupId>io.grpc</groupId>
	<artifactId>grpc-netty-shaded</artifactId>
</dependency>
```

```gradle
dependencies {
	implementation('org.springframework.boot:spring-boot-starter-grpc-client') {
		// Exclude the gRPC Netty dependency
		exclude group: 'io.grpc', module: 'grpc-netty'
	}
	// Use gRPC Netty Shaded instead
	implementation "io.grpc:grpc-netty-shaded"
}
```

### SSL Support

Client gRPC applications can connect to gRPC services using SSL/TSL encrypted connections.
You can configure gRPC connections to use standard one-way-TLS, or mutual TLS

#### Standard one-way TLS

To use standard one-way TLS, you can set the `ssl.enabled` property to `true` in your channel properties.
For example, the following will enable an SSL/TLS connection for the `myservice` channel:

```properties
spring.grpc.client.channel.myservice.target=static://grpc.example.com:9090
spring.grpc.client.channel.myservice.ssl.enabled=true
```

```yaml
spring:
  grpc:
    client:
      channel:
        myservice:
          target: static://grpc.example.com:9090
          ssl:
            enabled: true
```

#### Mutual TLS

Mutual TLS (mTLS) is a security protocol that requires both the client and the server to present certificates to each other.
To use mutual TLS, you can set the `ssl.bundle` property in your channel properties.
See the [SSL core features documentation][r8] for details on how to declare an SSL bundle.

Here is an example the configures the `myservice` channel to use the `mybundle` bundle for mutual TLS:

```properties
spring.grpc.client.channel.myservice.target=static://grpc.example.com:9090
spring.grpc.client.channel.myservice.ssl.bundle=mybundle
```

```yaml
spring:
  grpc:
    client:
      channel:
        myservice:
          target: static://grpc.example.com:9090
          ssl:
            bundle: mybundle
```

> [TIP]
>
> To temporarily disable client SSL support – to aid with testing, for example – set `bypass-certificate-validation` to `true` on your channel config:
>
> ```properties
> spring.grpc.client.channel.myservice.bypass-certificate-validation=true
> ```
>
> ```yaml
> spring:
>   grpc:
>     client:
>       channel:
>         myservice:
>           bypass-certificate-validation: true
> ```

### Using In-Process Channels

You can communicate with an [in-process server][r24] (i.e. not listening on a network port) by including the `io.grpc.grpc-inprocess` dependency on your classpath.

In this mode, the in-process channel factory is auto-configured in addition to the regular channel factories (e.g. Netty).
To prevent users from having to deal with multiple channel factories, a composite channel factory is configured as the primary channel factory bean.
The composite consults its composed factories to find the first one that supports the channel target.

To use the in-process server, the channel target must be set to `in-process:<name>`

> [TIP]
>
> To disable the in-process channel factory, you can set the `spring.grpc.client.inprocess.enabled` property to `false`.

### Observability

Spring Boot provides auto-configuration of the [`ObservationGrpcClientInterceptor`][r25] whenever Micrometer is available.
This interceptor provides observability into your gRPC client applications.

> [TIP]
>
> If you use Micrometer, but prefer to not to use it for gRPC, you can set `spring.grpc.client.observation.enabled` to `false`.

### Channel Customization

If you need to customize your gRPC channel beyond the basic properties, you can use a [`GrpcChannelBuilderCustomizer`][r26].
Each customizer is called with the logical target name and the [`ManagedChannelBuilder`][r27] that will build the channel.
There’s also a convenient `matching(String pattern)` factory method that will limit customizations to targets that match the given regex pattern.

A common customizer use-case is to add [security interceptors][r28] to the builder.
For example, here we’re adding the [`BearerTokenAuthenticationInterceptor`][r29] to the target matching “hello”:

```kotlin
import io.grpc.ManagedChannelBuilder
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.grpc.client.GrpcChannelBuilderCustomizer
import org.springframework.grpc.client.interceptor.security.BasicAuthenticationInterceptor
import java.util.function.Consumer

@Configuration(proxyBeanMethods = false)
class MyGrpcConfiguration {

	@Bean
	fun helloChannelCustomizer(): GrpcChannelBuilderCustomizer<*> {
		return GrpcChannelBuilderCustomizer.matching("hello", { builder ->
			builder.intercept(BasicAuthenticationInterceptor("user", "password"))
		})
	}

}
```

```java
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.grpc.client.GrpcChannelBuilderCustomizer;
import org.springframework.grpc.client.interceptor.security.BasicAuthenticationInterceptor;

@Configuration(proxyBeanMethods = false)
public class MyGrpcConfiguration {

	@Bean
	GrpcChannelBuilderCustomizer<?> helloChannelCustomizer() {
		return GrpcChannelBuilderCustomizer.matching("hello",
				(builder) -> builder.intercept(new BasicAuthenticationInterceptor("user", "password")));
	}

}
```

## Testing gRPC Applications

To help test your gRPC client and server applications, you can use the `spring-boot-grpc-test` module or the `spring-boot-starter-grpc-client-test` / `spring-boot-starter-grpc-server-test` starter POMs.

### Using In-Process Test Transport

The [`@AutoConfigureTestGrpcTransport`][r30] annotation allows you to quickly replace gRPC communication channels with in-process channels specifically designed for testing.
Unlike regular in-process channels, these test channels do not require any configuration.

Using test gRPC transport means that you don’t need to actually listen on a network port to start your application.
This allows your tests to run quickly, whilst still ensuring that your application works as expected.

By default, using [`@AutoConfigureTestGrpcTransport`][r30] will:

- Configure test [`GrpcServerFactory`][r31] / [`GrpcChannelFactory`][r32] beans
- Disable any gRPC servelt registration.
- Disable [`GrpcServerFactory`][r31] bean auto-configuration.
- Disable [`GrpcChannelFactory`][r32] bean auto-configuration.

The following example shows how you can use [`@AutoConfigureTestGrpcTransport`][r30] to test a gRPC server application:

```kotlin
import org.assertj.core.api.Assertions.assertThat
import org.jooq.DSLContext
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.grpc.test.autoconfigure.AutoConfigureTestGrpcTransport
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.grpc.client.ImportGrpcClients

@SpringBootTest
@AutoConfigureTestGrpcTransport
@ImportGrpcClients(types = [HelloWorldGrpc.HelloWorldBlockingStub::class])
class MyGrpcTests(@Autowired val helloStub: HelloWorldGrpc.HelloWorldBlockingStub) {

	@Test
	fun sayHello() {
		val request = HelloRequest.newBuilder().setName("Spring").build()
		val reply = helloStub.sayHello(request)
		assertThat(reply.getMessage()).isEqualTo("Hello 'Spring'")
	}

}
```

```java
import org.junit.jupiter.api.Test;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.grpc.test.autoconfigure.AutoConfigureTestGrpcTransport;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.grpc.client.ImportGrpcClients;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@AutoConfigureTestGrpcTransport
@ImportGrpcClients(types = HelloWorldGrpc.HelloWorldBlockingStub.class)
class MyGrpcTests {

	@Autowired
	private HelloWorldGrpc.HelloWorldBlockingStub helloStub;

	@Test
	void sayHello() {
		HelloRequest request = HelloRequest.newBuilder().setName("Spring").build();
		HelloReply reply = this.helloStub.sayHello(request);
		assertThat(reply.getMessage()).isEqualTo("Hello 'Spring'");
	}

}
```

### Testing With a Running Server

If you prefer to test your gRPC application by starting the real server and using the actual network connection, we recommend that you use random ports.
This will ensure that you can run your tests in any environment, and that you won’t accidentally call real services.

To start a gRPC server using a random port, set `spring.grpc.server.port` to `0`.
You can use the [`@LocalGrpcServerPort`][r33] annotation to obtain the actual port that the server started on.

Here’s an example test:

```kotlin
import io.grpc.ManagedChannel
import io.grpc.netty.NettyChannelBuilder
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.springframework.boot.grpc.test.autoconfigure.LocalGrpcServerPort
import org.springframework.boot.test.context.SpringBootTest

@SpringBootTest(properties = ["spring.grpc.server.port=0"])
class MyGrpcIntegrationTests {

	@LocalGrpcServerPort
	var port = 0

	@Test
	fun sayHello() {
		val target = "localhost:${port}"
		val channel: ManagedChannel = NettyChannelBuilder.forTarget(target).usePlaintext().build()
		try {
			val hello: HelloWorldGrpc.HelloWorldBlockingStub = HelloWorldGrpc.newBlockingStub(channel)
			val request = HelloRequest.newBuilder().setName("Spring").build()
			assertThat(hello.sayHello(request).getMessage()).isEqualTo("Hello 'Spring'")
		} finally {
			channel.shutdown()
		}
	}
}
```

```java
import io.grpc.ManagedChannel;
import io.grpc.netty.NettyChannelBuilder;
import org.junit.jupiter.api.Test;

import org.springframework.boot.docs.io.grpc.testing.localserverport.HelloWorldGrpc.HelloWorldBlockingStub;
import org.springframework.boot.grpc.test.autoconfigure.LocalGrpcServerPort;
import org.springframework.boot.test.context.SpringBootTest;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(properties = "spring.grpc.server.port=0")
class MyGrpcIntegrationTests {

	@LocalGrpcServerPort
	private int port;

	@Test
	void sayHello() {
		String target = "localhost:%s".formatted(this.port);
		ManagedChannel channel = NettyChannelBuilder.forTarget(target).usePlaintext().build();
		try {
			HelloWorldBlockingStub hello = HelloWorldGrpc.newBlockingStub(channel);
			HelloRequest request = HelloRequest.newBuilder().setName("Spring").build();
			assertThat(hello.sayHello(request).getMessage()).isEqualTo("Hello 'Spring'");
		}
		finally {
			channel.shutdown();
		}
	}

}
```
