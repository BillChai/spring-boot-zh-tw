# Spring for GraphQL

If you want to build GraphQL applications, you can take advantage of Spring Boot’s auto-configuration for [Spring for GraphQL][r1].
The Spring for GraphQL project is based on [GraphQL Java][r2].
You’ll need the `spring-boot-starter-graphql` starter at a minimum.
Because GraphQL is transport-agnostic, you’ll also need to have one or more additional starters in your application to expose your GraphQL API over the web:

| Starter | Transport | Implementation |
| --- | --- | --- |
| `spring-boot-starter-web` | HTTP | Spring MVC |
| `spring-boot-starter-websocket` | WebSocket | WebSocket for Servlet apps |
| `spring-boot-starter-webflux` | HTTP, WebSocket | Spring WebFlux |
| `spring-boot-starter-rsocket` | TCP, WebSocket | Spring WebFlux on Reactor Netty |

## GraphQL Schema

A Spring GraphQL application requires a defined schema at startup.
By default, you can write ".graphqls" or ".gqls" schema files under `src/main/resources/graphql/**` and Spring Boot will pick them up automatically.
You can customize the locations with `spring.graphql.schema.locations` and the file extensions with `spring.graphql.schema.file-extensions`.

> [NOTE]
>
> If you want Spring Boot to detect schema files in all your application modules and dependencies for that location,
> you can set `spring.graphql.schema.locations` to `"classpath*:graphql/**/"` (note the `classpath*:` prefix).

In the following sections, we’ll consider this sample GraphQL schema, defining two types and two queries:

```json
type Query {
    greeting(name: String! = "Spring"): String!
    project(slug: ID!): Project
}

""" A Project in the Spring portfolio """
type Project {
    """ Unique string id used in URLs """
    slug: ID!
    """ Project name """
    name: String!
    """ URL of the git repository """
    repositoryUrl: String!
    """ Current support status """
    status: ProjectStatus!
}

enum ProjectStatus {
    """ Actively supported by the Spring team """
    ACTIVE
    """ Supported by the community """
    COMMUNITY
    """ Prototype, not officially supported yet  """
    INCUBATING
    """ Project being retired, in maintenance mode """
    ATTIC
    """ End-Of-Lifed """
    EOL
}
```

> [NOTE]
>
> By default, [field introspection][r3] will be allowed on the schema as it is required for tools such as GraphiQL.
> If you wish to not expose information about the schema, you can disable introspection by setting `spring.graphql.schema.introspection.enabled` to `false`.

## GraphQL RuntimeWiring

The GraphQL Java [`RuntimeWiring.Builder`][r4] can be used to register custom scalar types, directives, type resolvers, [`DataFetcher`][r5], and more.
You can declare [`RuntimeWiringConfigurer`][r6] beans in your Spring config to get access to the [`RuntimeWiring.Builder`][r4].
Spring Boot detects such beans and adds them to the [GraphQlSource builder][r7].

Typically, however, applications will not implement [`DataFetcher`][r5] directly and will instead create [annotated controllers][r8].
Spring Boot will automatically detect [`@Controller`][r9] classes with annotated handler methods and register those as `DataFetcher`s.
Here’s a sample implementation for our greeting query with a [`@Controller`][r9] class:

```kotlin
import org.springframework.graphql.data.method.annotation.Argument
import org.springframework.graphql.data.method.annotation.QueryMapping
import org.springframework.stereotype.Controller

@Controller
class GreetingController {

	@QueryMapping
	fun greeting(@Argument name: String): String {
		return "Hello, $name!"
	}

}
```

```java
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.stereotype.Controller;

@Controller
public class GreetingController {

	@QueryMapping
	public String greeting(@Argument String name) {
		return "Hello, " + name + "!";
	}

}
```

## Querydsl and QueryByExample Repositories Support

Spring Data offers support for both Querydsl and QueryByExample repositories.
Spring GraphQL can [configure Querydsl and QueryByExample repositories as `DataFetcher`][r10].

Spring Data repositories annotated with [`@GraphQlRepository`][r11] and extending one of:

- [`QuerydslPredicateExecutor`][r12]
- [`ReactiveQuerydslPredicateExecutor`][r13]
- [`QueryByExampleExecutor`][r14]
- [`ReactiveQueryByExampleExecutor`][r15]

are detected by Spring Boot and considered as candidates for [`DataFetcher`][r5] for matching top-level queries.

## Transports

### HTTP and WebSocket

The GraphQL HTTP endpoint is at HTTP POST `/graphql` by default.
It also supports the `"text/event-stream"` media type over Server Sent Events for subscriptions only.
The path can be customized with `spring.graphql.http.path`.

> [TIP]
>
> The HTTP endpoint for both Spring MVC and Spring WebFlux is provided by a `RouterFunction` bean with an [`@Order`][r16] of `0`.
> If you define your own `RouterFunction` beans, you may want to add appropriate [`@Order`][r16] annotations to ensure that they are sorted correctly.

The GraphQL WebSocket endpoint is off by default. To enable it:

- For a Servlet application, add the WebSocket starter `spring-boot-starter-websocket`
- For a WebFlux application, no additional dependency is required
- For both, the `spring.graphql.websocket.path` application property must be set

Spring GraphQL provides a [Web Interception][r17] model.
This is quite useful for retrieving information from an HTTP request header and set it in the GraphQL context or fetching information from the same context and writing it to a response header.
With Spring Boot, you can declare a [`WebGraphQlInterceptor`][r18] bean to have it registered with the web transport.

[Spring MVC][r19] and [Spring WebFlux][r20] support CORS (Cross-Origin Resource Sharing) requests.
CORS is a critical part of the web config for GraphQL applications that are accessed from browsers using different domains.

Spring Boot supports many configuration properties under the `spring.graphql.cors.*` namespace; here’s a short configuration sample:

```properties
spring.graphql.cors.allowed-origins=https://example.org
spring.graphql.cors.allowed-methods=GET,POST
spring.graphql.cors.max-age=1800s
```

```yaml
spring:
  graphql:
    cors:
      allowed-origins: "https://example.org"
      allowed-methods: GET,POST
      max-age: 1800s
```

### RSocket

RSocket is also supported as a transport, on top of WebSocket or TCP.
Once the [RSocket server is configured][r21], we can configure our GraphQL handler on a particular route using `spring.graphql.rsocket.mapping`.
For example, configuring that mapping as `"graphql"` means we can use that as a route when sending requests with the [`RSocketGraphQlClient`][r22].

Spring Boot auto-configures a `RSocketGraphQlClient.Builder<?>` bean that you can inject in your components:

```kotlin
@Component
class RSocketGraphQlClientExample(private val builder: RSocketGraphQlClient.Builder<*>) {
```

```java
@Component
public class RSocketGraphQlClientExample {

	private final RSocketGraphQlClient graphQlClient;

	public RSocketGraphQlClientExample(RSocketGraphQlClient.Builder<?> builder) {
		this.graphQlClient = builder.tcp("example.spring.io", 8181).route("graphql").build();
	}
```

And then send a request:
include-code::RSocketGraphQlClientExample[tag=request]

## Exception Handling

Spring GraphQL enables applications to register one or more Spring [`DataFetcherExceptionResolver`][r23] components that are invoked sequentially.
The Exception must be resolved to a list of [`GraphQLError`][r24] objects, see [Spring GraphQL exception handling documentation][r25].
Spring Boot will automatically detect [`DataFetcherExceptionResolver`][r23] beans and register them with the [`GraphQlSource.Builder`][r26].

## GraphiQL and Schema Printer

Spring GraphQL offers infrastructure for helping developers when consuming or developing a GraphQL API.

Spring GraphQL ships with a default [GraphiQL][r27] page that is exposed at `"/graphiql"` by default.
This page is disabled by default and can be turned on with the `spring.graphql.graphiql.enabled` property.
Many applications exposing such a page will prefer a custom build.
A default implementation is very useful during development, this is why it is exposed automatically with [`spring-boot-devtools`][r28] during development.

You can also choose to expose the GraphQL schema in text format at `/graphql/schema` when the `spring.graphql.schema.printer.enabled` property is enabled.
