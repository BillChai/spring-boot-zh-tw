# Endpoints

Actuator endpoints let you monitor and interact with your application.
Spring Boot includes a number of built-in endpoints and lets you add your own.
For example, the `health` endpoint provides basic application health information.

You can [control access][r1] to each individual endpoint and [expose them (make them remotely accessible) over HTTP or JMX][r2].
An endpoint is considered to be available when access to it is permitted and it is exposed.
The built-in endpoints are auto-configured only when they are available.
Most applications choose exposure over HTTP, where the ID of the endpoint and a prefix of `/actuator` is mapped to a URL.
For example, by default, the `health` endpoint is mapped to `/actuator/health`.

> [TIP]
>
> To learn more about the Actuator’s endpoints and their request and response formats, see the [API documentation][r3].

The following technology-agnostic endpoints are available:

| ID | Description |
| --- | --- |
| `auditevents` | Exposes audit events information for the current application. Requires an [`AuditEventRepository`][r4] bean. |
| `beans` | Displays a complete list of all the Spring beans in your application. |
| `caches` | Exposes available caches. |
| `conditions` | Shows the conditions that were evaluated on configuration and auto-configuration classes and the reasons why they did or did not match. |
| `configprops` | Displays a collated list of all [`@ConfigurationProperties`][r5]. Subject to [sanitization][r6]. |
| `env` | Exposes properties from Spring’s [`ConfigurableEnvironment`][r7]. Subject to [sanitization][r6]. |
| `flyway` | Shows any Flyway database migrations that have been applied. Requires one or more [`Flyway`][r8] beans. |
| `health` | Shows application health information. |
| `httpexchanges` | Displays HTTP exchange information (by default, the last 100 HTTP request-response exchanges). Requires an [`HttpExchangeRepository`][r9] bean. |
| `info` | Displays arbitrary application info. |
| `integrationgraph` | Shows the Spring Integration graph. Requires a dependency on `spring-integration-core`. |
| `loggers` | Shows and modifies the configuration of loggers in the application. |
| `liquibase` | Shows any Liquibase database migrations that have been applied. Requires one or more [`Liquibase`][r10] beans. |
| `metrics` | Shows “metrics” information for the current application to diagnose the metrics the application has recorded. |
| `mappings` | Displays a collated list of all [`@RequestMapping`][r11] paths. |
| `quartz` | Shows information about Quartz Scheduler jobs. Subject to [sanitization][r6]. |
| `scheduledtasks` | Displays the scheduled tasks in your application. |
| `sessions` | Allows retrieval and deletion of user sessions from a Spring Session-backed session store. Requires a servlet-based web application that uses Spring Session. |
| `shutdown` | Lets the application be gracefully shutdown. Only works when using jar packaging. Disabled by default. |
| `startup` | Shows the [startup steps data][r12] collected by the [`ApplicationStartup`][r13]. Requires the [`SpringApplication`][r14] to be configured with a [`BufferingApplicationStartup`][r15]. |
| `threaddump` | Performs a thread dump. |

If your application is a web application (Spring MVC, Spring WebFlux, or Jersey), you can use the following additional endpoints:

| ID | Description |
| --- | --- |
| `heapdump` | Returns a heap dump file. On a HotSpot JVM, an `HPROF`-format file is returned. On an OpenJ9 JVM, a `PHD`-format file is returned. |
| `logfile` | Returns the contents of the logfile (if the `logging.file.name` or the `logging.file.path` property has been set). Supports the use of the HTTP `Range` header to retrieve part of the log file’s content. |
| `prometheus` | Exposes metrics in a format that can be scraped by a Prometheus server. Requires a dependency on `micrometer-registry-prometheus`. |

## Controlling Access to Endpoints

By default, access to all endpoints except for `shutdown` and `heapdump` is unrestricted.
To configure the permitted access to an endpoint, use its `management.endpoint.<id>.access` property.
The following example allows unrestricted access to the `shutdown` endpoint:

```properties
management.endpoint.shutdown.access=unrestricted
```

```yaml
management:
  endpoint:
    shutdown:
      access: unrestricted
```

If you prefer access to be opt-in rather than opt-out, set the `management.endpoints.access.default` property to `none` and use individual endpoint `access` properties to opt back in.
The following example allows read-only access to the `loggers` endpoint and denies access to all other endpoints:

```properties
management.endpoints.access.default=none
management.endpoint.loggers.access=read-only
```

```yaml
management:
  endpoints:
    access:
      default: none
  endpoint:
    loggers:
      access: read-only
```

> [NOTE]
>
> Inaccessible endpoints are removed entirely from the application context.
> If you want to change only the technologies over which an endpoint is exposed, use the [`include` and `exclude` properties][r2] instead.

### Limiting Access

Application-wide endpoint access can be limited using the `management.endpoints.access.max-permitted` property.
This property takes precedence over the default access or an individual endpoint’s access level.
Set it to `none` to make all endpoints inaccessible.
Set it to `read-only` to only allow read access to endpoints.

For [`@Endpoint`][r16], [`@JmxEndpoint`][r17], and [`@WebEndpoint`][r18], read access equates to the endpoint methods annotated with [`@ReadOperation`][r19].
For [`@ControllerEndpoint`][r20] and [`@RestControllerEndpoint`][r21], read access equates to request mappings that can handle `GET` and `HEAD` requests.
For [`@ServletEndpoint`][r22], read access equates to `GET` and `HEAD` requests.

## Exposing Endpoints

By default, only the health endpoint is exposed over HTTP and JMX.
Since Endpoints may contain sensitive information, you should carefully consider when to expose them.

To change which endpoints are exposed, use the following technology-specific `include` and `exclude` properties:

| Property | Default |
| --- | --- |
| `management.endpoints.jmx.exposure.exclude` |  |
| `management.endpoints.jmx.exposure.include` | `health` |
| `management.endpoints.web.exposure.exclude` |  |
| `management.endpoints.web.exposure.include` | `health` |

The `include` property lists the IDs of the endpoints that are exposed.
The `exclude` property lists the IDs of the endpoints that should not be exposed.
The `exclude` property takes precedence over the `include` property.
You can configure both the `include` and the `exclude` properties with a list of endpoint IDs.

For example, to only expose the `health` and `info` endpoints over JMX, use the following property:

```properties
management.endpoints.jmx.exposure.include=health,info
```

```yaml
management:
  endpoints:
    jmx:
      exposure:
        include: "health,info"
```

`*` can be used to select all endpoints.
For example, to expose everything over HTTP except the `env` and `beans` endpoints, use the following properties:

```properties
management.endpoints.web.exposure.include=*
management.endpoints.web.exposure.exclude=env,beans
```

```yaml
management:
  endpoints:
    web:
      exposure:
        include: "*"
        exclude: "env,beans"
```

> [NOTE]
>
> `*` has a special meaning in YAML, so be sure to add quotation marks if you want to include (or exclude) all endpoints.

> [NOTE]
>
> If your application is exposed publicly, we strongly recommend that you also [secure your endpoints][r23].

> [TIP]
>
> If you want to implement your own strategy for when endpoints are exposed, you can register an [`EndpointFilter`][r24] bean.

## Security

For security purposes, only the `/health` endpoint is exposed over HTTP by default.
You can use the `management.endpoints.web.exposure.include` property to configure the endpoints that are exposed.

> [NOTE]
>
> Before setting the `management.endpoints.web.exposure.include`, ensure that the exposed actuators do not contain sensitive information, are secured by placing them behind a firewall, or are secured by something like Spring Security.

If Spring Security is on the classpath and no other [`SecurityFilterChain`][r25] bean is present, all actuators other than `/health` are secured by Spring Boot auto-configuration.
If you define a custom [`SecurityFilterChain`][r25] bean, Spring Boot auto-configuration backs off and lets you fully control the actuator access rules.

If you wish to configure custom security for HTTP endpoints (for example, to allow only users with a certain role to access them), Spring Boot provides some convenient [`RequestMatcher`][r26] objects that you can use in combination with Spring Security.

A typical Spring Security configuration might look something like the following example:

```kotlin
import org.springframework.boot.security.autoconfigure.actuate.web.servlet.EndpointRequest
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.security.config.Customizer.withDefaults
import org.springframework.security.config.annotation.web.builders.HttpSecurity
import org.springframework.security.web.SecurityFilterChain

@Configuration(proxyBeanMethods = false)
class MySecurityConfiguration {

	@Bean
	fun securityFilterChain(http: HttpSecurity): SecurityFilterChain {
		http.securityMatcher(EndpointRequest.toAnyEndpoint()).authorizeHttpRequests { requests ->
			requests.anyRequest().hasRole("ENDPOINT_ADMIN")
		}
		http.httpBasic(withDefaults())
		return http.build()
	}

}
```

```java
import org.springframework.boot.security.autoconfigure.actuate.web.servlet.EndpointRequest;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;

import static org.springframework.security.config.Customizer.withDefaults;

@Configuration(proxyBeanMethods = false)
public class MySecurityConfiguration {

	@Bean
	public SecurityFilterChain securityFilterChain(HttpSecurity http) {
		http.securityMatcher(EndpointRequest.toAnyEndpoint());
		http.authorizeHttpRequests((requests) -> requests.anyRequest().hasRole("ENDPOINT_ADMIN"));
		http.httpBasic(withDefaults());
		return http.build();
	}

}
```

The preceding example uses `EndpointRequest.toAnyEndpoint()` to match a request to any endpoint and then ensures that all have the `ENDPOINT_ADMIN` role.
Several other matcher methods are also available on [`EndpointRequest`][r27].
See the [API documentation][r3] for details.

> [NOTE]
>
> When matching for Actuator endpoints, `EndpointRequest.to("endpoint")` will consider the endpoint root and all its subpaths,
> effectively matching `"/actuator/endpoint/**"` even if the endpoint does not declare nested routes.

If you deploy applications behind a firewall, you may prefer that all your actuator endpoints can be accessed without requiring authentication.
You can do so by changing the `management.endpoints.web.exposure.include` property, as follows:

```properties
management.endpoints.web.exposure.include=*
```

```yaml
management:
  endpoints:
    web:
      exposure:
        include: "*"
```

Additionally, if Spring Security is present, you would need to add custom security configuration that allows unauthenticated access to the endpoints, as the following example shows:

```kotlin
import org.springframework.boot.security.autoconfigure.actuate.web.servlet.EndpointRequest
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.security.config.annotation.web.builders.HttpSecurity
import org.springframework.security.web.SecurityFilterChain

@Configuration(proxyBeanMethods = false)
class MySecurityConfiguration {

	@Bean
	fun securityFilterChain(http: HttpSecurity): SecurityFilterChain {
		http.securityMatcher(EndpointRequest.toAnyEndpoint()).authorizeHttpRequests { requests ->
			requests.anyRequest().permitAll()
		}
		return http.build()
	}

}
```

```java
import org.springframework.boot.security.autoconfigure.actuate.web.servlet.EndpointRequest;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration(proxyBeanMethods = false)
public class MySecurityConfiguration {

	@Bean
	public SecurityFilterChain securityFilterChain(HttpSecurity http) {
		http.securityMatcher(EndpointRequest.toAnyEndpoint());
		http.authorizeHttpRequests((requests) -> requests.anyRequest().permitAll());
		return http.build();
	}

}
```

> [NOTE]
>
> In both of the preceding examples, the configuration applies only to the actuator endpoints.
> Since Spring Boot’s security configuration backs off completely in the presence of any [`SecurityFilterChain`][r25] bean, you need to configure an additional [`SecurityFilterChain`][r25] bean with rules that apply to the rest of the application.

### Cross Site Request Forgery Protection

Since Spring Boot relies on Spring Security’s defaults, CSRF protection is turned on by default.
This means that the actuator endpoints that require a `POST` (shutdown and loggers endpoints), a `PUT`, or a `DELETE` get a 403 (forbidden) error when the default security configuration is in use.

> [NOTE]
>
> We recommend disabling CSRF protection completely only if you are creating a service that is used by non-browser clients.

You can find additional information about CSRF protection in the [Spring Security Reference Guide][r28].

## Configuring Endpoints

Endpoints automatically cache responses to read operations that do not take any parameters.
To configure the amount of time for which an endpoint caches a response, use its `cache.time-to-live` property.
The following example sets the time-to-live of the `beans` endpoint’s cache to 10 seconds:

```properties
management.endpoint.beans.cache.time-to-live=10s
```

```yaml
management:
  endpoint:
    beans:
      cache:
        time-to-live: "10s"
```

> [NOTE]
>
> The `management.endpoint.<name>` prefix uniquely identifies the endpoint that is being configured.

## Sanitize Sensitive Values

Information returned by the `/env`, `/configprops` and `/quartz` endpoints can be sensitive, so by default values are always fully sanitized (replaced by `******`).

Values can only be viewed in an unsanitized form when:

- The `show-values` property has been set to something other than `never`
- No custom [`SanitizingFunction`][r29] beans apply

The `show-values` property can be configured for sanitizable endpoints to one of the following values:

- `never` - values are always fully sanitized (replaced by `******`)
- `always` - values are shown to all users (as long as no [`SanitizingFunction`][r30] bean applies)
- `when-authorized` - values are shown only to authorized users (as long as no [`SanitizingFunction`][r30] bean applies)

For HTTP endpoints, a user is considered to be authorized if they have authenticated and have the roles configured by the endpoint’s roles property.
By default, any authenticated user is authorized.

For JMX endpoints, all users are always authorized.

The following example allows all users with the `admin` role to view values from the `/env` endpoint in their original form.
Unauthorized users, or users without the `admin` role, will see only sanitized values.

```properties
management.endpoint.env.show-values=when-authorized
management.endpoint.env.roles=admin
```

```yaml
management:
  endpoint:
    env:
      show-values: when-authorized
      roles: "admin"
```

> [NOTE]
>
> This example assumes that no [`SanitizingFunction`][r29] beans have been defined.

## Hypermedia for Actuator Web Endpoints

A “discovery page” is added with links to all the endpoints.
The “discovery page” is available on `/actuator` by default.

To disable the “discovery page”, add the following property to your application properties:

```properties
management.endpoints.web.discovery.enabled=false
```

```yaml
management:
  endpoints:
    web:
      discovery:
        enabled: false
```

When a custom management context path is configured, the “discovery page” automatically moves from `/actuator` to the root of the management context.
For example, if the management context path is `/management`, the discovery page is available from `/management`.
When the management context path is set to `/`, the discovery page is disabled to prevent the possibility of a clash with other mappings.

## CORS Support

[Cross-origin resource sharing][r31] (CORS) is a [W3C specification][r32] that lets you specify in a flexible way what kind of cross-domain requests are authorized.
If you use Spring MVC or Spring WebFlux, you can configure Actuator’s web endpoints to support such scenarios.

CORS support is disabled by default and is only enabled once you have set the `management.endpoints.web.cors.allowed-origins` property.
The following configuration permits `GET` and `POST` calls from the `example.com` domain:

```properties
management.endpoints.web.cors.allowed-origins=https://example.com
management.endpoints.web.cors.allowed-methods=GET,POST
```

```yaml
management:
  endpoints:
    web:
      cors:
        allowed-origins: "https://example.com"
        allowed-methods: "GET,POST"
```

> [TIP]
>
> See [`CorsEndpointProperties`][r33] for a complete list of options.

## JSON

When working with JSON, Jackson is used for serialization and deserialization.
By default, an isolated [`JsonMapper`][r34] is used.
This isolation means that it does not share the same configuration as the application’s `JsonMapper` and it is not affected by `spring.jackson.*` properties.
To disable this behavior and configure Actuator to use the application’s `JsonMapper`, set `management.endpoints.jackson.isolated-json-mapper` to `false`.
Alternatively, you can define your own [`EndpointJsonMapper`][r35] bean that produces a `JsonMapper` that meets your needs.
Actuator will then use it for JSON processing.

## Implementing Custom Endpoints

If you add a [`@Bean`][r36] annotated with [`@Endpoint`][r16], any methods annotated with [`@ReadOperation`][r19], [`@WriteOperation`][r37], or [`@DeleteOperation`][r38] are automatically exposed over JMX and, in a web application, over HTTP as well.
Endpoints can be exposed over HTTP by using Jersey, Spring MVC, or Spring WebFlux.
If both Jersey and Spring MVC are available, Spring MVC is used.

The following example exposes a read operation that returns a custom object:

```kotlin
	@ReadOperation
	fun getData(): CustomData {
		return CustomData("test", 5)
	}
```

```java
	@ReadOperation
	public CustomData getData() {
		return new CustomData("test", 5);
	}
```

You can also write technology-specific endpoints by using [`@JmxEndpoint`][r17] or [`@WebEndpoint`][r18].
These endpoints are restricted to their respective technologies.
For example, [`@WebEndpoint`][r18] is exposed only over HTTP and not over JMX.

You can write technology-specific extensions by using [`@EndpointWebExtension`][r39] and [`@EndpointJmxExtension`][r40].
These annotations let you provide technology-specific operations to augment an existing endpoint.
An endpoint may have at most one extension of each type.

Finally, if you need access to web-framework-specific functionality, you can implement servlet or Spring [`@Controller`][r41] and [`@RestController`][r42] endpoints at the cost of them not being available over JMX or when using a different web framework.

### Receiving Input

Operations on an endpoint receive input through their parameters.
When exposed over the web, the values for these parameters are taken from the URL’s query parameters and from the JSON request body.
When exposed over JMX, the parameters are mapped to the parameters of the MBean’s operations.
Parameters are required by default.
They can be made optional by annotating them with JSpecify’s [`@Nullable`][r43].
Kotlin null safety is also supported.

You can map each root property in the JSON request body to a parameter of the endpoint.
Consider the following JSON request body:

```json
{
	"name": "test",
	"counter": 42
}
```

You can use this to invoke a write operation that takes `String name` and `int counter` parameters, as the following example shows:

```kotlin
	@WriteOperation
	fun updateData(name: String?, counter: Int) {
		// injects "test" and 42
	}
```

```java
	@WriteOperation
	public void updateData(String name, int counter) {
		// injects "test" and 42
	}
```

> [TIP]
>
> Because endpoints are technology agnostic, only simple types can be specified in the method signature.
> In particular, declaring a single parameter with a [`CustomData`][r44] type that defines a `name` and `counter` properties is not supported.

> [NOTE]
>
> To let the input be mapped to the operation method’s parameters, Java code that implements an endpoint should be compiled with `-parameters`.
> For Kotlin code, please review [the recommendation][r45] of the Spring Framework reference.
> This will happen automatically if you use Spring Boot’s Gradle plugin or if you use Maven and `spring-boot-starter-parent`.

#### Input Type Conversion

The parameters passed to endpoint operation methods are, if necessary, automatically converted to the required type.
Before calling an operation method, the input received over JMX or HTTP is converted to the required types by using an instance of [`ApplicationConversionService`][r46] as well as any [`Converter`][r47] or [`GenericConverter`][r48] beans qualified with [`@EndpointConverter`][r49].

### Custom Web Endpoints

Operations on an [`@Endpoint`][r16], [`@WebEndpoint`][r18], or [`@EndpointWebExtension`][r39] are automatically exposed over HTTP using Jersey, Spring MVC, or Spring WebFlux.
If both Jersey and Spring MVC are available, Spring MVC is used.

#### Web Endpoint Request Predicates

A request predicate is automatically generated for each operation on a web-exposed endpoint.

#### Path

The path of the predicate is determined by the ID of the endpoint and the base path of the web-exposed endpoints.
The default base path is `/actuator`.
For example, an endpoint with an ID of `sessions` uses `/actuator/sessions` as its path in the predicate.

You can further customize the path by annotating one or more parameters of the operation method with [`@Selector`][r50].
Such a parameter is added to the path predicate as a path variable.
The variable’s value is passed into the operation method when the endpoint operation is invoked.
If you want to capture all remaining path elements, you can add `@Selector(Match=ALL_REMAINING)` to the last parameter and make it a type that is conversion-compatible with a `String[]`.

#### HTTP method

The HTTP method of the predicate is determined by the operation type, as shown in the following table:

| Operation | HTTP method |
| --- | --- |
| [`@ReadOperation`][r19] | `GET` |
| [`@WriteOperation`][r37] | `POST` |
| [`@DeleteOperation`][r38] | `DELETE` |

#### Consumes

For a [`@WriteOperation`][r37] (HTTP `POST`) that uses the request body, the `consumes` clause of the predicate is `application/vnd.spring-boot.actuator.v2+json, application/json`.
For all other operations, the `consumes` clause is empty.

#### Produces

The `produces` clause of the predicate can be determined by the `produces` attribute of the [`@DeleteOperation`][r38], [`@ReadOperation`][r19], and [`@WriteOperation`][r37] annotations.
The attribute is optional.
If it is not used, the `produces` clause is determined automatically.

If the operation method returns `void` or [`Void`][r51], the `produces` clause is empty.
If the operation method returns a [`Resource`][r52], the `produces` clause is `application/octet-stream`.
For all other operations, the `produces` clause is `application/vnd.spring-boot.actuator.v2+json, application/json`.

#### Web Endpoint Response Status

The default response status for an endpoint operation depends on the operation type (read, write, or delete) and what, if anything, the operation returns.

If a [`@ReadOperation`][r19] returns a value, the response status will be 200 (OK).
If it does not return a value, the response status will be 404 (Not Found).

If a [`@WriteOperation`][r37] or [`@DeleteOperation`][r38] returns a value, the response status will be 200 (OK).
If it does not return a value, the response status will be 204 (No Content).

If an operation is invoked without a required parameter or with a parameter that cannot be converted to the required type, the operation method is not called, and the response status will be 400 (Bad Request).

#### Web Endpoint Range Requests

You can use an HTTP range request to request part of an HTTP resource.
When using Spring MVC or Spring Web Flux, operations that return a [`Resource`][r52] automatically support range requests.

> [NOTE]
>
> Range requests are not supported when using Jersey.

#### Web Endpoint Security

An operation on a web endpoint or a web-specific endpoint extension can receive the current [`Principal`][r53] or [`SecurityContext`][r54] as a method parameter.
The former is typically used in conjunction with [`@Nullable`][r43] to provide different behavior for authenticated and unauthenticated users.
The latter is typically used to perform authorization checks by using its `isUserInRole(String)` method.

## Health Information

You can use health information to check the status of your running application.
It is often used by monitoring software to alert someone when a production system goes down.
The information exposed by the `health` endpoint depends on the `management.endpoint.health.show-details` and `management.endpoint.health.show-components` properties, which can be configured with one of the following values:

| Name | Description |
| --- | --- |
| `never` | Details are never shown. |
| `when-authorized` | Details are shown only to authorized users. Authorized roles can be configured by using `management.endpoint.health.roles`. |
| `always` | Details are shown to all users. |

The default value is `never`.
A user is considered to be authorized when they are in one or more of the endpoint’s roles.
If the endpoint has no configured roles (the default), all authenticated users are considered to be authorized.
You can configure the roles by using the `management.endpoint.health.roles` property.

> [NOTE]
>
> If you have secured your application and wish to use `always`, your security configuration must permit access to the health endpoint for both authenticated and unauthenticated users.

Health information is collected from the content of a [`HealthContributorRegistry`][r55] (by default, all [`HealthContributor`][r56] instances defined in your [`ApplicationContext`][r57]).
Spring Boot includes a number of auto-configured [`HealthContributor`][r56] beans, and you can also write your own.

A [`HealthContributor`][r56] can be either a [`HealthIndicator`][r58] or a [`CompositeHealthContributor`][r59].
A [`HealthIndicator`][r58] provides actual health information, including a [`Status`][r60].
A [`CompositeHealthContributor`][r59] provides a composite of other [`HealthContributor`][r56] instances.
Taken together, contributors form a tree structure to represent the overall system health.

By default, the final system health is derived by a [`StatusAggregator`][r61], which sorts the statuses from each [`HealthIndicator`][r58] based on an ordered list of statuses.
The first status in the sorted list is used as the overall health status.
If no [`HealthIndicator`][r58] returns a status that is known to the [`StatusAggregator`][r61], an `UNKNOWN` status is used.

> [TIP]
>
> You can use the [`HealthContributorRegistry`][r55] to register and unregister health indicators at runtime.

### Auto-configured HealthIndicators

When appropriate, Spring Boot auto-configures the [`HealthIndicator`][r58] beans listed in the following table.
You can also enable or disable selected indicators by configuring `management.health.key.enabled`,
with the `key` listed in the following table:

| Key | Name | Description |
| --- | --- | --- |
| `cassandra` | [`CassandraDriverHealthIndicator`][r62] | Checks that a Cassandra database is up. |
| `couchbase` | [`CouchbaseHealthIndicator`][r63] | Checks that a Couchbase cluster is up. |
| `db` | [`DataSourceHealthIndicator`][r64] | Checks that a connection to [`DataSource`][r65] can be obtained. |
| `diskspace` | [`DiskSpaceHealthIndicator`][r66] | Checks for low disk space. |
| `elasticsearch` | [`ElasticsearchRestClientHealthIndicator`][r67] | Checks that an Elasticsearch cluster is up. |
| `hazelcast` | [`HazelcastHealthIndicator`][r68] | Checks that a Hazelcast server is up. |
| `jms` | [`JmsHealthIndicator`][r69] | Checks that a JMS broker is up. |
| `ldap` | [`LdapHealthIndicator`][r70] | Checks that an LDAP server is up. |
| `mail` | [`MailHealthIndicator`][r71] | Checks that a mail server is up. |
| `mongodb` | [`MongoHealthIndicator`][r72] | Checks that a Mongo database is up. |
| `neo4j` | [`Neo4jHealthIndicator`][r73] | Checks that a Neo4j database is up. |
| `ping` | [`PingHealthIndicator`][r74] | Always responds with `UP`. |
| `rabbit` | [`RabbitHealthIndicator`][r75] | Checks that a Rabbit server is up. |
| `redis` | [`DataRedisHealthIndicator`][r76] | Checks that a Redis server is up. |
| `ssl` | [`SslHealthIndicator`][r77] | Checks that SSL certificates are ok. |

> [TIP]
>
> You can disable them all by setting the `management.health.defaults.enabled` property.

> [TIP]
>
> The `ssl` [`HealthIndicator`][r58] has a "warning threshold" property named `management.health.ssl.certificate-validity-warning-threshold`.
> You can use this threshold to give yourself enough lead time to rotate the soon-to-be-expired certificate.
> If an SSL certificate will become invalid within the period defined by this threshold, the [`HealthIndicator`][r58] will report this in the details section of its response where `details.validChains.certificates.[*].validity.status` will have the value `WILL_EXPIRE_SOON`.

Additional [`HealthIndicator`][r58] beans are enabled by default:

| Key | Name | Description |
| --- | --- | --- |
| `livenessstate` | [`LivenessStateHealthIndicator`][r78] | Exposes the “Liveness” application availability state. |
| `readinessstate` | [`ReadinessStateHealthIndicator`][r79] | Exposes the “Readiness” application availability state. |

These can be disabled by using the `management.endpoint.health.probes.enabled` configuration property.

### Writing Custom HealthIndicators

To provide custom health information, you can register Spring beans that implement the [`HealthIndicator`][r58] interface.
You need to provide an implementation of the `health()` method and return a [`Health`][r80] response.
The [`Health`][r80] response should include a status and can optionally include additional details to be displayed.
The following code shows a sample [`HealthIndicator`][r58] implementation:

```kotlin
import org.springframework.boot.health.contributor.Health
import org.springframework.boot.health.contributor.HealthIndicator
import org.springframework.stereotype.Component

@Component
class MyHealthIndicator : HealthIndicator {

	override fun health(): Health {
		val errorCode = check()
		if (errorCode != 0) {
			return Health.down().withDetail("Error Code", errorCode).build()
		}
		return Health.up().build()
	}

	private fun check(): Int {
		// perform some specific health check
		return  ...
	}

}
```

```java
import org.springframework.boot.health.contributor.Health;
import org.springframework.boot.health.contributor.HealthIndicator;
import org.springframework.stereotype.Component;

@Component
public class MyHealthIndicator implements HealthIndicator {

	@Override
	public Health health() {
		int errorCode = check();
		if (errorCode != 0) {
			return Health.down().withDetail("Error Code", errorCode).build();
		}
		return Health.up().build();
	}

	private int check() {
		// perform some specific health check
		return ...
	}

}
```

> [NOTE]
>
> The identifier for a given [`HealthIndicator`][r58] is the name of the bean without the [`HealthIndicator`][r58] suffix, if it exists.
> In the preceding example, the health information is available in an entry named `my`.

> [TIP]
>
> Health indicators are usually called over HTTP and need to respond before any connection timeouts.
> Spring Boot will log a warning message for any health indicator that takes longer than 10 seconds to respond.
> If you want to configure this threshold, you can use the `management.endpoint.health.logging.slow-indicator-threshold` property.

In addition to Spring Boot’s predefined [`Status`][r60] types, [`Health`][r80] can return a custom [`Status`][r60] that represents a new system state.
In such cases, you also need to provide a custom implementation of the [`StatusAggregator`][r61] interface, or you must configure the default implementation by using the `management.endpoint.health.status.order` configuration property.

For example, assume a new [`Status`][r60] with a code of `FATAL` is being used in one of your [`HealthIndicator`][r58] implementations.
To configure the severity order, add the following property to your application properties:

```properties
management.endpoint.health.status.order=fatal,down,out-of-service,unknown,up
```

```yaml
management:
  endpoint:
    health:
      status:
        order: "fatal,down,out-of-service,unknown,up"
```

The HTTP status code in the response reflects the overall health status.
By default, `OUT_OF_SERVICE` and `DOWN` map to 503.
Any unmapped health statuses, including `UP`, map to 200.
You might also want to register custom status mappings if you access the health endpoint over HTTP.
Configuring a custom mapping disables the defaults mappings for `DOWN` and `OUT_OF_SERVICE`.
If you want to retain the default mappings, you must explicitly configure them, alongside any custom mappings.
For example, the following property maps `FATAL` to 503 (service unavailable) and retains the default mappings for `DOWN` and `OUT_OF_SERVICE`:

```properties
management.endpoint.health.status.http-mapping.down=503
management.endpoint.health.status.http-mapping.fatal=503
management.endpoint.health.status.http-mapping.out-of-service=503
```

```yaml
management:
  endpoint:
    health:
      status:
        http-mapping:
          down: 503
          fatal: 503
          out-of-service: 503
```

> [TIP]
>
> If you need more control, you can define your own [`HttpCodeStatusMapper`][r81] bean.

The following table shows the default status mappings for the built-in statuses:

| Status | Mapping |
| --- | --- |
| `DOWN` | `SERVICE_UNAVAILABLE` (`503`) |
| `OUT_OF_SERVICE` | `SERVICE_UNAVAILABLE` (`503`) |
| `UP` | No mapping by default, so HTTP status is `200` |
| `UNKNOWN` | No mapping by default, so HTTP status is `200` |

### Reactive Health Indicators

For reactive applications, such as those that use Spring WebFlux, [`ReactiveHealthContributor`][r82] provides a non-blocking contract for getting application health.
Similar to a traditional [`HealthContributor`][r56], health information is collected from the content of a [`ReactiveHealthContributorRegistry`][r83] (by default, all [`HealthContributor`][r56] and [`ReactiveHealthContributor`][r82] instances defined in your [`ApplicationContext`][r57]).
Regular [`HealthContributor`][r56] instances that do not check against a reactive API are executed on the elastic scheduler.

> [TIP]
>
> In a reactive application, you should use the [`ReactiveHealthContributorRegistry`][r83] to register and unregister health indicators at runtime.
> If you need to register a regular [`HealthContributor`][r56], you should wrap it with `ReactiveHealthContributor#adapt`.

To provide custom health information from a reactive API, you can register Spring beans that implement the [`ReactiveHealthIndicator`][r84] interface.
The following code shows a sample [`ReactiveHealthIndicator`][r84] implementation:

```kotlin
import org.springframework.boot.health.contributor.Health
import org.springframework.boot.health.contributor.ReactiveHealthIndicator
import org.springframework.stereotype.Component
import reactor.core.publisher.Mono

@Component
class MyReactiveHealthIndicator : ReactiveHealthIndicator {

	override fun health(): Mono<Health> {
		return doHealthCheck().onErrorResume { exception: Throwable ->
			Mono.just(Health.Builder().down(exception).build())
		}
	}

	private fun doHealthCheck(): Mono<Health> {
		// perform some specific health check
		return  ...
	}

}
```

```java
import reactor.core.publisher.Mono;

import org.springframework.boot.health.contributor.Health;
import org.springframework.boot.health.contributor.ReactiveHealthIndicator;
import org.springframework.stereotype.Component;

@Component
public class MyReactiveHealthIndicator implements ReactiveHealthIndicator {

	@Override
	public Mono<Health> health() {
		return doHealthCheck().onErrorResume((exception) ->
			Mono.just(new Health.Builder().down(exception).build()));
	}

	private Mono<Health> doHealthCheck() {
		// perform some specific health check
		return ...
	}

}
```

> [TIP]
>
> To handle the error automatically, consider extending from [`AbstractReactiveHealthIndicator`][r85].

### Auto-configured ReactiveHealthIndicators

When appropriate, Spring Boot auto-configures the following [`ReactiveHealthIndicator`][r84] beans:

| Key | Name | Description |
| --- | --- | --- |
| `cassandra` | [`CassandraDriverReactiveHealthIndicator`][r86] | Checks that a Cassandra database is up. |
| `couchbase` | [`CouchbaseReactiveHealthIndicator`][r87] | Checks that a Couchbase cluster is up. |
| `elasticsearch` | [`DataElasticsearchReactiveHealthIndicator`][r88] | Checks that an Elasticsearch cluster is up. |
| `mongodb` | [`MongoReactiveHealthIndicator`][r89] | Checks that a Mongo database is up. |
| `neo4j` | [`Neo4jReactiveHealthIndicator`][r90] | Checks that a Neo4j database is up. |
| `redis` | [`DataRedisReactiveHealthIndicator`][r91] | Checks that a Redis server is up. |

> [TIP]
>
> If necessary, reactive indicators replace the regular ones.
> Also, any [`HealthIndicator`][r58] that is not handled explicitly is wrapped automatically.

### Health Groups

It is sometimes useful to organize health indicators into groups that you can use for different purposes.

To create a health indicator group, you can use the `management.endpoint.health.group.<name>` property and specify a list of health indicator IDs to `include` or `exclude`.
For example, to create a group that includes only database indicators you can define the following:

```properties
management.endpoint.health.group.custom.include=db
```

```yaml
management:
  endpoint:
    health:
      group:
        custom:
          include: "db"
```

You can then check the result by hitting `[localhost:8080/actuator/health/custom][r92]`.

Similarly, to create a group that excludes the database indicators from the group and includes all the other indicators, you can define the following:

```properties
management.endpoint.health.group.custom.exclude=db
```

```yaml
management:
  endpoint:
    health:
      group:
        custom:
          exclude: "db"
```

By default, startup will fail if a health group includes or excludes a health indicator that does not exist.
To disable this behavior set `management.endpoint.health.validate-group-membership` to `false`.

By default, groups inherit the same [`StatusAggregator`][r61] and [`HttpCodeStatusMapper`][r81] settings as the system health.
However, you can also define these on a per-group basis.
You can also override the `show-details` and `roles` properties if required:

```properties
management.endpoint.health.group.custom.show-details=when-authorized
management.endpoint.health.group.custom.roles=admin
management.endpoint.health.group.custom.status.order=fatal,up
management.endpoint.health.group.custom.status.http-mapping.fatal=500
management.endpoint.health.group.custom.status.http-mapping.out-of-service=500
```

```yaml
management:
  endpoint:
    health:
      group:
        custom:
          show-details: "when-authorized"
          roles: "admin"
          status:
            order: "fatal,up"
            http-mapping:
              fatal: 500
              out-of-service: 500
```

> [TIP]
>
> You can use `@Qualifier("groupname")` if you need to register custom [`StatusAggregator`][r61] or [`HttpCodeStatusMapper`][r81] beans for use with the group.

A health group can also include/exclude a [`CompositeHealthContributor`][r59].
You can also include/exclude only a certain component of a [`CompositeHealthContributor`][r59].
This can be done using the fully qualified name of the component as follows:

```properties
management.endpoint.health.group.custom.include="test/primary"
management.endpoint.health.group.custom.exclude="test/primary/b"
```

In the example above, the `custom` group will include the [`HealthContributor`][r56] with the name `primary` which is a component of the composite `test`.
Here, `primary` itself is a composite and the [`HealthContributor`][r56] with the name `b` will be excluded from the `custom` group.

Health groups can be made available at an additional path on either the main or management port.
This is useful in cloud environments such as Kubernetes, where it is quite common to use a separate management port for the actuator endpoints for security purposes.
Having a separate port could lead to unreliable health checks because the main application might not work properly even if the health check is successful.
The health group can be configured with an additional path as follows:

```properties
management.endpoint.health.group.live.additional-path="server:/healthz"
```

This would make the `live` health group available on the main server port at `/healthz`.
The prefix is mandatory and must be either `server:` (represents the main server port) or `management:` (represents the management port, if configured.)
The path must be a single path segment.

### DataSource Health

The [`DataSource`][r65] health indicator shows the health of both standard data sources and routing data source beans.
The health of a routing data source includes the health of each of its target data sources.
In the health endpoint’s response, each of a routing data source’s targets is named by using its routing key.
If you prefer not to include routing data sources in the indicator’s output, set `management.health.db.ignore-routing-data-sources` to `true`.

## Kubernetes Probes

Applications deployed on Kubernetes can provide information about their internal state with [Container Probes][r93].
Depending on [your Kubernetes configuration][r94], the kubelet calls those probes and reacts to the result.

By default, Spring Boot manages your [Application Availability][r95] state.
If deployed in a Kubernetes environment, actuator gathers the “Liveness” and “Readiness” information from the [`ApplicationAvailability`][r96] interface and uses that information in dedicated [health indicators][r97]: [`LivenessStateHealthIndicator`][r78] and [`ReadinessStateHealthIndicator`][r79].
These indicators are shown on the global health endpoint (`"/actuator/health"`).
They are also exposed as separate HTTP Probes by using [health groups][r98]: `"/actuator/health/liveness"` and `"/actuator/health/readiness"`.

You can then configure your Kubernetes infrastructure with the following endpoint information:

```yaml
livenessProbe:
  httpGet:
    path: "/actuator/health/liveness"
    port: <actuator-port>
  failureThreshold: ...
  periodSeconds: ...

readinessProbe:
  httpGet:
    path: "/actuator/health/readiness"
    port: <actuator-port>
  failureThreshold: ...
  periodSeconds: ...
```

> [NOTE]
>
> `<actuator-port>` should be set to the port that the actuator endpoints are available on.
> It could be the main web server port or a separate management port if the `"management.server.port"` property has been set.

These health groups are automatically enabled.
You can disable them by using the `management.endpoint.health.probes.enabled` configuration property.

> [NOTE]
>
> If an application takes longer to start than the configured liveness period, Kubernetes [mentions the `"startupProbe"` as a possible solution][r99].
> Generally speaking, the `"startupProbe"` is not necessarily needed here as the `"readinessProbe"` fails until all startup tasks are done.
> This means your application will not receive traffic until it is ready.
> However, if your application takes a long time to start, consider [configuring a `"startupProbe"`][r100] that uses the liveness HTTP probe to make sure that Kubernetes won’t kill your application while it is in the process of starting.
> See the section that describes [how probes behave during the application lifecycle][r101].

If your Actuator endpoints are deployed on a separate management context, the endpoints do not use the same web infrastructure (port, connection pools, framework components) as the main application.
In this case, a probe check could be successful even if the main application does not work properly (for example, it cannot accept new connections).
For this reason, it is a good idea to make the `liveness` and `readiness` health groups available on the main server port.
This can be done by setting the following property:

```properties
management.endpoint.health.probes.add-additional-paths=true
```

This would make the `liveness` group available at `/livez` and the `readiness` group available at `/readyz` on the main server port.
Paths can be customized using the `additional-path` property on each group, see [health groups][r98] for details.

### Checking External State With Kubernetes Probes

Actuator configures the “liveness” and “readiness” probes as Health Groups.
This means that all the [health groups features][r98] are available for them.
You can, for example, configure additional Health Indicators:

```properties
management.endpoint.health.group.readiness.include=readinessState,customCheck
```

```yaml
management:
  endpoint:
    health:
      group:
        readiness:
          include: "readinessState,customCheck"
```

By default, Spring Boot does not add other health indicators to these groups.

The “liveness” probe should not depend on health checks for external systems.
If the [liveness state of an application][r102] is broken, Kubernetes tries to solve that problem by restarting the application instance.
This means that if an external system (such as a database, a Web API, or an external cache) fails, Kubernetes might restart all application instances and create cascading failures.

As for the “readiness” probe, the choice of checking external systems must be made carefully by the application developers.
For this reason, Spring Boot does not include any additional health checks in the readiness probe.
If the [readiness state of an application instance][r103] is unready, Kubernetes does not route traffic to that instance.
Some external systems might not be shared by application instances, in which case they could be included in a readiness probe.
Other external systems might not be essential to the application (the application could have circuit breakers and fallbacks), in which case they definitely should not be included.
Unfortunately, an external system that is shared by all application instances is common, and you have to make a judgement call: Include it in the readiness probe and expect that the application is taken out of service when the external service is down or leave it out and deal with failures higher up the stack, perhaps by using a circuit breaker in the caller.

> [NOTE]
>
> If all instances of an application are unready, a Kubernetes Service with `type=ClusterIP` or `NodePort` does not accept any incoming connections.
> There is no HTTP error response (503 and so on), since there is no connection.
> A service with `type=LoadBalancer` might or might not accept connections, depending on the provider.
> A service that has an explicit [ingress][r104] also responds in a way that depends on the implementation — the ingress service itself has to decide how to handle the “connection refused” from downstream.
> HTTP 503 is quite likely in the case of both load balancer and ingress.

Also, if an application uses Kubernetes [autoscaling][r105], it may react differently to applications being taken out of the load-balancer, depending on its autoscaler configuration.

### Application Lifecycle and Probe States

An important aspect of the Kubernetes Probes support is its consistency with the application lifecycle.
There is a significant difference between the [`AvailabilityState`][r106] (which is the in-memory, internal state of the application)
and the actual probe (which exposes that state).
Depending on the phase of application lifecycle, the probe might not be available.

Spring Boot publishes [application events during startup and shutdown][r107],
and probes can listen to such events and expose the [`AvailabilityState`][r106] information.

The following tables show the [`AvailabilityState`][r106] and the state of HTTP connectors at different stages.

When a Spring Boot application starts:

| Startup phase | LivenessState | ReadinessState | HTTP server | Notes |
| --- | --- | --- | --- | --- |
| Starting | `BROKEN` | `REFUSING_TRAFFIC` | Not started | Kubernetes checks the "liveness" Probe and restarts the application if it takes too long. |
| Started | `CORRECT` | `REFUSING_TRAFFIC` | Refuses requests | The application context is refreshed. The application performs startup tasks and does not receive traffic yet. |
| Ready | `CORRECT` | `ACCEPTING_TRAFFIC` | Accepts requests | Startup tasks are finished. The application is receiving traffic. |

When a Spring Boot application shuts down:

| Shutdown phase | Liveness State | Readiness State | HTTP server | Notes |
| --- | --- | --- | --- | --- |
| Running | `CORRECT` | `ACCEPTING_TRAFFIC` | Accepts requests | Shutdown has been requested. |
| Graceful shutdown | `CORRECT` | `REFUSING_TRAFFIC` | New requests are rejected | If enabled, [graceful shutdown processes in-flight requests][r108]. HTTP probes also stop accepting traffic, so the availability states are not readily available externally. |
| Shutdown complete | N/A | N/A | Server is shut down | The application context is closed and the application is shut down. |

> [TIP]
>
> See [Kubernetes Container Lifecycle][r109] for more information about Kubernetes deployment.
> In particular, it describes how to use the `preStop` hook to give your application time to shut down gracefully before Kubernetes kills it.

## Application Information

Application information exposes various information collected from all [`InfoContributor`][r110] beans defined in your [`ApplicationContext`][r57].
Spring Boot includes a number of auto-configured [`InfoContributor`][r110] beans, and you can write your own.

### Auto-configured InfoContributors

When appropriate, Spring auto-configures the following [`InfoContributor`][r110] beans:

| ID | Name | Description | Prerequisites |
| --- | --- | --- | --- |
| `build` | [`BuildInfoContributor`][r111] | Exposes build information. | A `META-INF/build-info.properties` resource. |
| `env` | [`EnvironmentInfoContributor`][r112] | Exposes any property from the [`Environment`][r113] whose name starts with `info.`. | None. |
| `git` | [`GitInfoContributor`][r114] | Exposes git information. | A `git.properties` resource. |
| `java` | [`JavaInfoContributor`][r115] | Exposes Java runtime information. | None. |
| `os` | [`OsInfoContributor`][r116] | Exposes Operating System information. | None. |
| `process` | [`ProcessInfoContributor`][r117] | Exposes process information. | None. |
| `ssl` | [`SslInfoContributor`][r118] | Exposes SSL certificate information. | An [SSL Bundle][r119] configured. |

Whether an individual contributor is enabled is controlled by its `management.info.<id>.enabled` property.
Different contributors have different defaults for this property, depending on their prerequisites and the nature of the information that they expose.

With no prerequisites to indicate that they should be enabled, the `env`, `java`, `os`, and `process` contributors are disabled by default. The `ssl` contributor has a prerequisite of having an [SSL Bundle][r119] configured but it is disabled by default.
Each can be enabled by setting its `management.info.<id>.enabled` property to `true`.

The `build` and `git` info contributors are enabled by default.
Each can be disabled by setting its `management.info.<id>.enabled` property to `false`.
Alternatively, to disable every contributor that is usually enabled by default, set the `management.info.defaults.enabled` property to `false`.

### Custom Application Information

When the `env` contributor is enabled, you can customize the data exposed by the `info` endpoint by setting `info.*` Spring properties.
All [`Environment`][r113] properties under the `info` key are automatically exposed.
For example, you could add the following settings to your `application.properties` file:

```properties
info.app.encoding=UTF-8
info.app.java.source=17
info.app.java.target=17
```

```yaml
info:
  app:
    encoding: "UTF-8"
    java:
      source: "17"
      target: "17"
```

> [TIP]
>
> Rather than hardcoding those values, you could also [expand info properties at build time][r120].
>
> Assuming you use Maven, you could rewrite the preceding example as follows:
>
> ```properties
> [email protected]@
> [email protected]@
> [email protected]@
> ```
>
> ```yaml
> info:
>   app:
>     encoding: "@project.build.sourceEncoding@"
>     java:
>       source: "@java.version@"
>       target: "@java.version@"
> ```

### Git Commit Information

Another useful feature of the `info` endpoint is its ability to publish information about the state of your `git` source code repository when the project was built.
If a [`GitProperties`][r122] bean is available, you can use the `info` endpoint to expose these properties.

> [TIP]
>
> A [`GitProperties`][r122] bean is auto-configured if a `git.properties` file is available at the root of the classpath.
> See [Generate Git Information][r123] for more detail.

By default, the endpoint exposes `git.branch`, `git.commit.id`, and `git.commit.time` properties, if present.
If you do not want any of these properties in the endpoint response, they need to be excluded from the `git.properties` file.
If you want to display the full git information (that is, the full content of `git.properties`), use the `management.info.git.mode` property, as follows:

```properties
management.info.git.mode=full
```

```yaml
management:
  info:
    git:
      mode: "full"
```

To disable the git commit information from the `info` endpoint completely, set the `management.info.git.enabled` property to `false`, as follows:

```properties
management.info.git.enabled=false
```

```yaml
management:
  info:
    git:
      enabled: false
```

### Build Information

If a [`BuildProperties`][r124] bean is available, the `info` endpoint can also publish information about your build.
This happens if a `META-INF/build-info.properties` file is available in the classpath.

> [TIP]
>
> The Maven and Gradle plugins can both generate that file.
> See [Generate Build Information][r125] for more details.

### Java Information

The `info` endpoint publishes information about your Java runtime environment, see [`JavaInfo`][r126] for more details.

### OS Information

The `info` endpoint publishes information about your Operating System, see [`OsInfo`][r127] for more details.

### Process Information

The `info` endpoint publishes information about your process, see [`ProcessInfo`][r128] for more details.

### SSL Information

The `info` endpoint publishes information about your SSL certificates (that are configured through [SSL Bundles][r119]), see [`SslInfo`][r129] for more details.

### Writing Custom InfoContributors

To provide custom application information, you can register Spring beans that implement the [`InfoContributor`][r110] interface.

The following example contributes an `example` entry with a single value:

```kotlin
import org.springframework.boot.actuate.info.Info
import org.springframework.boot.actuate.info.InfoContributor
import org.springframework.stereotype.Component
import java.util.Collections

@Component
class MyInfoContributor : InfoContributor {

	override fun contribute(builder: Info.Builder) {
		builder.withDetail("example", Collections.singletonMap("key", "value"))
	}

}
```

```java
import java.util.Collections;

import org.springframework.boot.actuate.info.Info;
import org.springframework.boot.actuate.info.InfoContributor;
import org.springframework.stereotype.Component;

@Component
public class MyInfoContributor implements InfoContributor {

	@Override
	public void contribute(Info.Builder builder) {
		builder.withDetail("example", Collections.singletonMap("key", "value"));
	}

}
```

If you reach the `info` endpoint, you should see a response that contains the following additional entry:

```json
{
	"example": {
		"key" : "value"
	}
}
```

## Software Bill of Materials (SBOM)

The `sbom` endpoint exposes the [Software Bill of Materials][r130].
CycloneDX SBOMs can be auto-detected, but other formats can be manually configured, too.

The `sbom` actuator endpoint will then expose an SBOM called "application", which describes the contents of your application.

> [TIP]
>
> To automatically generate a CycloneDX SBOM at project build time, please see the [Generate a CycloneDX SBOM][r131] section.

### Other SBOM formats

If you want to publish an SBOM in a different format, there are some configuration properties which you can use.

The configuration property `management.endpoint.sbom.application.location` sets the location for the application SBOM.
For example, setting this to `classpath:sbom.json` will use the contents of the `/sbom.json` resource on the classpath.

The media type for SBOMs in CycloneDX, SPDX and Syft format is detected automatically.
To override the auto-detected media type, use the configuration property `management.endpoint.sbom.application.media-type`.

### Additional SBOMs

The actuator endpoint can handle multiple SBOMs.
To add SBOMs, use the configuration property `management.endpoint.sbom.additional`, as shown in this example:

```properties
management.endpoint.sbom.additional.system.location=optional:file:/system.spdx.json
management.endpoint.sbom.additional.system.media-type=application/spdx+json
```

```yaml
management:
  endpoint:
    sbom:
      additional:
        system:
          location: "optional:file:/system.spdx.json"
          media-type: "application/spdx+json"
```

This will add an SBOM called "system", which is stored in `/system.spdx.json`.
The `optional:` prefix can be used to prevent a startup failure if the file doesn’t exist.
