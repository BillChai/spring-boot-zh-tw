# Servlet Web Applications

If you want to build servlet-based web applications, you can take advantage of Spring Boot’s auto-configuration for Spring MVC or Jersey.

## The “Spring Web MVC Framework”

The [Spring Web MVC framework][r1] (often referred to as “Spring MVC”) is a rich “model view controller” web framework.
Spring MVC lets you create special [`@Controller`][r2] or [`@RestController`][r3] beans to handle incoming HTTP requests.
Methods in your controller are mapped to HTTP by using [`@RequestMapping`][r4] annotations.

The following code shows a typical [`@RestController`][r3] that serves JSON data:

```kotlin
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/users")
class MyRestController(private val userRepository: UserRepository, private val customerRepository: CustomerRepository) {

	@GetMapping("/{userId}")
	fun getUser(@PathVariable userId: Long): User {
		return userRepository.findById(userId).get()
	}

	@GetMapping("/{userId}/customers")
	fun getUserCustomers(@PathVariable userId: Long): List<Customer> {
		return userRepository.findById(userId).map(customerRepository::findByUser).get()
	}

	@DeleteMapping("/{userId}")
	fun deleteUser(@PathVariable userId: Long) {
		userRepository.deleteById(userId)
	}

}
```

```java
import java.util.List;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/users")
public class MyRestController {

	private final UserRepository userRepository;

	private final CustomerRepository customerRepository;

	public MyRestController(UserRepository userRepository, CustomerRepository customerRepository) {
		this.userRepository = userRepository;
		this.customerRepository = customerRepository;
	}

	@GetMapping("/{userId}")
	public User getUser(@PathVariable Long userId) {
		return this.userRepository.findById(userId).get();
	}

	@GetMapping("/{userId}/customers")
	public List<Customer> getUserCustomers(@PathVariable Long userId) {
		return this.userRepository.findById(userId).map(this.customerRepository::findByUser).get();
	}

	@DeleteMapping("/{userId}")
	public void deleteUser(@PathVariable Long userId) {
		this.userRepository.deleteById(userId);
	}

}
```

“WebMvc.fn”, the functional variant, separates the routing configuration from the actual handling of the requests, as shown in the following example:

```kotlin
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.http.MediaType
import org.springframework.web.servlet.function.RequestPredicates.accept
import org.springframework.web.servlet.function.RouterFunction
import org.springframework.web.servlet.function.RouterFunctions
import org.springframework.web.servlet.function.ServerResponse

@Configuration(proxyBeanMethods = false)
class MyRoutingConfiguration {

	@Bean
	fun routerFunction(userHandler: MyUserHandler): RouterFunction<ServerResponse> {
		return RouterFunctions.route()
			.GET("/{user}", ACCEPT_JSON, userHandler::getUser)
			.GET("/{user}/customers", ACCEPT_JSON, userHandler::getUserCustomers)
			.DELETE("/{user}", ACCEPT_JSON, userHandler::deleteUser)
			.build()
	}

	companion object {
		private val ACCEPT_JSON = accept(MediaType.APPLICATION_JSON)
	}

}
```

```java
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.MediaType;
import org.springframework.web.servlet.function.RequestPredicate;
import org.springframework.web.servlet.function.RouterFunction;
import org.springframework.web.servlet.function.ServerResponse;

import static org.springframework.web.servlet.function.RequestPredicates.accept;
import static org.springframework.web.servlet.function.RouterFunctions.route;

@Configuration(proxyBeanMethods = false)
public class MyRoutingConfiguration {

	private static final RequestPredicate ACCEPT_JSON = accept(MediaType.APPLICATION_JSON);

	@Bean
	public RouterFunction<ServerResponse> routerFunction(MyUserHandler userHandler) {
		return route()
				.GET("/{user}", ACCEPT_JSON, userHandler::getUser)
				.GET("/{user}/customers", ACCEPT_JSON, userHandler::getUserCustomers)
				.DELETE("/{user}", ACCEPT_JSON, userHandler::deleteUser)
				.build();
	}

}
```

```kotlin
import org.springframework.stereotype.Component
import org.springframework.web.servlet.function.ServerRequest
import org.springframework.web.servlet.function.ServerResponse

@Component
class MyUserHandler {

	fun getUser(request: ServerRequest?): ServerResponse {
		...
	}

	fun getUserCustomers(request: ServerRequest?): ServerResponse {
		...
	}

	fun deleteUser(request: ServerRequest?): ServerResponse {
		...
	}

}
```

```java
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.function.ServerRequest;
import org.springframework.web.servlet.function.ServerResponse;

@Component
public class MyUserHandler {

	public ServerResponse getUser(ServerRequest request) {
		...
	}

	public ServerResponse getUserCustomers(ServerRequest request) {
		...
	}

	public ServerResponse deleteUser(ServerRequest request) {
		...
	}

}
```

Spring MVC is part of the core Spring Framework, and detailed information is available in the [reference documentation][r1].
There are also several guides that cover Spring MVC available at [spring.io/guides][r5].

> [TIP]
>
> You can define as many [`RouterFunction`][r6] beans as you like to modularize the definition of the router.
> Beans can be ordered if you need to apply a precedence.

### Spring MVC Auto-configuration

Spring Boot provides auto-configuration for Spring MVC that works well with most applications.
It replaces the need for [`@EnableWebMvc`][r7] and the two cannot be used together.
In addition to Spring MVC’s defaults, the auto-configuration provides the following features:

- Inclusion of [`ContentNegotiatingViewResolver`][r8] and [`BeanNameViewResolver`][r9] beans.
- Support for serving static resources, including support for WebJars (covered [later in this document][r10]).
- Automatic registration of [`Converter`][r11], [`GenericConverter`][r12], and [`Formatter`][r13] beans.
- Support for [`HttpMessageConverters`][r14] (covered [later in this document][r15]).
- Automatic registration of [`MessageCodesResolver`][r16] (covered [later in this document][r17]).
- Static `index.html` support.
- Automatic use of a [`ConfigurableWebBindingInitializer`][r18] bean (covered [later in this document][r19]).

If you want to keep those Spring Boot MVC customizations and make more [MVC customizations][r1] (interceptors, formatters, view controllers, and other features), you can add your own [`@Configuration`][r20] class of type [`WebMvcConfigurer`][r21] but **without** [`@EnableWebMvc`][r7].

If you want to provide custom instances of [`RequestMappingHandlerMapping`][r22], [`RequestMappingHandlerAdapter`][r23], or [`ExceptionHandlerExceptionResolver`][r24], and still keep the Spring Boot MVC customizations, you can declare a bean of type [`WebMvcRegistrations`][r25] and use it to provide custom instances of those components.
The custom instances will be subject to further initialization and configuration by Spring MVC.
To participate in, and if desired, override that subsequent processing, a [`WebMvcConfigurer`][r21] should be used.

If you do not want to use the auto-configuration and want to take complete control of Spring MVC, add your own [`@Configuration`][r20] annotated with [`@EnableWebMvc`][r7].
Alternatively, add your own [`@Configuration`][r20]-annotated [`DelegatingWebMvcConfiguration`][r26] as described in the [`@EnableWebMvc`][r7] API documentation.

### Spring MVC Conversion Service

Spring MVC uses a different [`ConversionService`][r27] to the one used to convert values from your `application.properties` or `application.yaml` file.
It means that [`Period`][r28], [`Duration`][r29] and [`DataSize`][r30] converters are not available and that [`@DurationUnit`][r31] and [`@DataSizeUnit`][r32] annotations will be ignored.

If you want to customize the [`ConversionService`][r27] used by Spring MVC, you can provide a [`WebMvcConfigurer`][r21] bean with an `addFormatters` method.
From this method you can register any converter that you like, or you can delegate to the static methods available on [`ApplicationConversionService`][r33].

Conversion can also be customized using the `spring.mvc.format.*` configuration properties.
When not configured, the following defaults are used:

| Property | `DateTimeFormatter` | Formats |
| --- | --- | --- |
| `spring.mvc.format.date` | `ofLocalizedDate(FormatStyle.SHORT)` | `java.util.Date` and [`LocalDate`][r34] |
| `spring.mvc.format.time` | `ofLocalizedTime(FormatStyle.SHORT)` | java.time’s [`LocalTime`][r35] and [`OffsetTime`][r36] |
| `spring.mvc.format.date-time` | `ofLocalizedDateTime(FormatStyle.SHORT)` | java.time’s [`LocalDateTime`][r37], [`OffsetDateTime`][r38], and [`ZonedDateTime`][r39] |

### HttpMessageConverters

Spring MVC uses the [`HttpMessageConverter`][r40] interface to convert HTTP requests and responses.
Sensible defaults are included out of the box.
For example, objects can be automatically converted to JSON (by using the Jackson library) or XML (by using the Jackson XML extension, if available, or by using JAXB if the Jackson XML extension is not available).
By default, strings are encoded in `UTF-8`.

Any [`HttpMessageConverter`][r40] bean that is present in the context is added to the list of converters.
You can also override default converters in the same way.

If you need to add or customize converters, you can declare one or more [`ClientHttpMessageConvertersCustomizer`][r41] or
[`ServerHttpMessageConvertersCustomizer`][r42] as beans. There, you can choose whether converter instances should be added
before default ones (`addCustomConverter`) or if they should override a specific default converter (like `withJsonConverter`).

See the following listing for an example:

```kotlin
import org.springframework.boot.http.converter.autoconfigure.ClientHttpMessageConvertersCustomizer
import org.springframework.boot.http.converter.autoconfigure.ServerHttpMessageConvertersCustomizer
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.http.converter.HttpMessageConverters
import org.springframework.http.converter.json.JacksonJsonHttpMessageConverter
import tools.jackson.databind.json.JsonMapper
import java.text.SimpleDateFormat

@Configuration(proxyBeanMethods = false)
class MyHttpMessageConvertersConfiguration {

	@Bean
	fun myClientConvertersCustomizer(): ClientHttpMessageConvertersCustomizer {
		return ClientHttpMessageConvertersCustomizer { clientBuilder: HttpMessageConverters.ClientBuilder ->
			clientBuilder
				.addCustomConverter(AdditionalHttpMessageConverter())
				.addCustomConverter(AnotherHttpMessageConverter())
		}
	}

	@Bean
	fun jacksonConverterCustomizer(): JacksonConverterCustomizer {
		val jsonMapper = JsonMapper.builder()
			.defaultDateFormat(SimpleDateFormat("yyyy-MM"))
			.build()
		return JacksonConverterCustomizer(jsonMapper)
	}

	// contribute a custom JSON converter to both client and server
	class JacksonConverterCustomizer(private val jsonMapper: JsonMapper) :
		ClientHttpMessageConvertersCustomizer, ServerHttpMessageConvertersCustomizer {

		override fun customize(builder: HttpMessageConverters.ClientBuilder) {
			builder.withJsonConverter(JacksonJsonHttpMessageConverter(this.jsonMapper))
		}

		override fun customize(builder: HttpMessageConverters.ServerBuilder) {
			builder.withJsonConverter(JacksonJsonHttpMessageConverter(this.jsonMapper))
		}
	}

}
```

```java
import java.text.SimpleDateFormat;

import tools.jackson.databind.json.JsonMapper;

import org.springframework.boot.http.converter.autoconfigure.ClientHttpMessageConvertersCustomizer;
import org.springframework.boot.http.converter.autoconfigure.ServerHttpMessageConvertersCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.converter.HttpMessageConverters.ClientBuilder;
import org.springframework.http.converter.HttpMessageConverters.ServerBuilder;
import org.springframework.http.converter.json.JacksonJsonHttpMessageConverter;

@Configuration(proxyBeanMethods = false)
public class MyHttpMessageConvertersConfiguration {

	@Bean
	public ClientHttpMessageConvertersCustomizer myClientConvertersCustomizer() {
		return (clientBuilder) -> clientBuilder.addCustomConverter(new AdditionalHttpMessageConverter())
			.addCustomConverter(new AnotherHttpMessageConverter());
	}

	@Bean
	public JacksonConverterCustomizer jacksonConverterCustomizer() {
		JsonMapper jsonMapper = JsonMapper.builder().defaultDateFormat(new SimpleDateFormat("yyyy-MM")).build();
		return new JacksonConverterCustomizer(jsonMapper);
	}

	// contribute a custom JSON converter to both client and server
	static class JacksonConverterCustomizer
			implements ClientHttpMessageConvertersCustomizer, ServerHttpMessageConvertersCustomizer {

		private final JsonMapper jsonMapper;

		JacksonConverterCustomizer(JsonMapper jsonMapper) {
			this.jsonMapper = jsonMapper;
		}

		@Override
		public void customize(ClientBuilder builder) {
			builder.withJsonConverter(new JacksonJsonHttpMessageConverter(this.jsonMapper));
		}

		@Override
		public void customize(ServerBuilder builder) {
			builder.withJsonConverter(new JacksonJsonHttpMessageConverter(this.jsonMapper));
		}

	}

}
```

### MessageCodesResolver

Spring MVC has a strategy for generating error codes for rendering error messages from binding errors: [`MessageCodesResolver`][r16].
If you set the `spring.mvc.message-codes-resolver-format` property `PREFIX_ERROR_CODE` or `POSTFIX_ERROR_CODE`, Spring Boot creates one for you (see the enumeration in [`DefaultMessageCodesResolver.Format`][r43]).

### Static Content

By default, Spring Boot serves static content from a directory called `/static` (or `/public` or `/resources` or `/META-INF/resources`) in the classpath or from the root of the [`ServletContext`][r44].
It uses the [`ResourceHttpRequestHandler`][r45] from Spring MVC so that you can modify that behavior by adding your own [`WebMvcConfigurer`][r21] and overriding the `addResourceHandlers` method.

In a stand-alone web application, the default servlet from the container is not enabled.
It can be enabled using the `server.servlet.register-default-servlet` property.

The default servlet acts as a fallback, serving content from the root of the [`ServletContext`][r44] if Spring decides not to handle it.
Most of the time, this does not happen (unless you modify the default MVC configuration), because Spring can always handle requests through the [`DispatcherServlet`][r46].

By default, resources are mapped on `/**`, but you can tune that with the `spring.mvc.static-path-pattern` property.
For instance, relocating all resources to `/resources/**` can be achieved as follows:

```properties
spring.mvc.static-path-pattern=/resources/**
```

```yaml
spring:
  mvc:
    static-path-pattern: "/resources/**"
```

You can also customize the static resource locations by using the `spring.web.resources.static-locations` property (replacing the default values with a list of directory locations).
The root servlet context path, `"/"`, is automatically added as a location as well.

In addition to the “standard” static resource locations mentioned earlier, a special case is made for [Webjars content][r47].
By default, any resources with a path in `/webjars/**` are served from jar files if they are packaged in the Webjars format.
The path can be customized with the `spring.mvc.webjars-path-pattern` property.

> [TIP]
>
> Do not use the `src/main/webapp` directory if your application is packaged as a jar.
> Although this directory is a common standard, it works **only** with war packaging, and it is silently ignored by most build tools if you generate a jar.

Spring Boot also supports the advanced resource handling features provided by Spring MVC, allowing use cases such as cache-busting static resources or using version agnostic URLs for Webjars.

To use version agnostic URLs for Webjars, add the `org.webjars:webjars-locator-lite` dependency.
Then declare your Webjar.
Using jQuery as an example, adding `"/webjars/jquery/jquery.min.js"` results in `"/webjars/jquery/x.y.z/jquery.min.js"` where `x.y.z` is the Webjar version.

To use cache busting, the following configuration configures a cache busting solution for all static resources, effectively adding a content hash, such as `<link href="/css/spring-2a2d595e6ed9a0b24f027f2b63b134d6.css"/>`, in URLs:

```properties
spring.web.resources.chain.strategy.content.enabled=true
spring.web.resources.chain.strategy.content.paths=/**
```

```yaml
spring:
  web:
    resources:
      chain:
        strategy:
          content:
            enabled: true
            paths: "/**"
```

> [NOTE]
>
> Links to resources are rewritten in templates at runtime, thanks to a [`ResourceUrlEncodingFilter`][r48] that is auto-configured for Thymeleaf and FreeMarker.
> You should manually declare this filter when using JSPs.
> Other template engines are currently not automatically supported but can be with custom template macros/helpers and the use of the [`ResourceUrlProvider`][r49].

When loading resources dynamically with, for example, a JavaScript module loader, renaming files is not an option.
That is why other strategies are also supported and can be combined.
A "fixed" strategy adds a static version string in the URL without changing the file name, as shown in the following example:

```properties
spring.web.resources.chain.strategy.content.enabled=true
spring.web.resources.chain.strategy.content.paths=/**
spring.web.resources.chain.strategy.fixed.enabled=true
spring.web.resources.chain.strategy.fixed.paths=/js/lib/
spring.web.resources.chain.strategy.fixed.version=v12
```

```yaml
spring:
  web:
    resources:
      chain:
        strategy:
          content:
            enabled: true
            paths: "/**"
          fixed:
            enabled: true
            paths: "/js/lib/"
            version: "v12"
```

With this configuration, JavaScript modules located under `"/js/lib/"` use a fixed versioning strategy (`"/v12/js/lib/mymodule.js"`), while other resources still use the content one (`<link href="/css/spring-2a2d595e6ed9a0b24f027f2b63b134d6.css"/>`).

See [`WebProperties.Resources`][r50] for more supported options.

> [TIP]
>
> This feature has been thoroughly described in a dedicated [blog post][r51] and in Spring Framework’s [reference documentation][r52].

### Welcome Page

Spring Boot supports both static and templated welcome pages.
It first looks for an `index.html` file in the configured static content locations.
If one is not found, it then looks for an `index` template.
If either is found, it is automatically used as the welcome page of the application.

This only acts as a fallback for actual index routes defined by the application.
The ordering is defined by the order of [`HandlerMapping`][r53] beans which is by default the following:

|  |  |
| --- | --- |
| `RouterFunctionMapping` | Endpoints declared with [`RouterFunction`][r6] beans |
| `RequestMappingHandlerMapping` | Endpoints declared in [`@Controller`][r2] beans |
| `WelcomePageHandlerMapping` | The welcome page support |

### Custom Favicon

As with other static resources, Spring Boot checks for a `favicon.ico` in the configured static content locations.
If such a file is present, it is automatically used as the favicon of the application.

### Path Matching and Content Negotiation

Spring MVC can map incoming HTTP requests to handlers by looking at the request path and matching it to the mappings defined in your application (for example, [`@GetMapping`][r54] annotations on Controller methods).

Spring Boot chooses to disable suffix pattern matching by default, which means that requests like `"GET /projects/spring-boot.json"` will not be matched to `@GetMapping("/projects/spring-boot")` mappings.
This is considered as a [best practice for Spring MVC applications][r55].
This feature was mainly useful in the past for HTTP clients which did not send proper "Accept" request headers; we needed to make sure to send the correct Content Type to the client.
Nowadays, Content Negotiation is much more reliable.

There are other ways to deal with HTTP clients that do not consistently send proper "Accept" request headers.
Instead of using suffix matching, we can use a query parameter to ensure that requests like `"GET /projects/spring-boot?format=json"` will be mapped to `@GetMapping("/projects/spring-boot")`:

```properties
spring.mvc.contentnegotiation.favor-parameter=true
```

```yaml
spring:
  mvc:
    contentnegotiation:
      favor-parameter: true
```

Or if you prefer to use a different parameter name:

```properties
spring.mvc.contentnegotiation.favor-parameter=true
spring.mvc.contentnegotiation.parameter-name=myparam
```

```yaml
spring:
  mvc:
    contentnegotiation:
      favor-parameter: true
      parameter-name: "myparam"
```

Most standard media types are supported out-of-the-box, but you can also define new ones:

```properties
spring.mvc.contentnegotiation.media-types.markdown=text/markdown
```

```yaml
spring:
  mvc:
    contentnegotiation:
      media-types:
        markdown: "text/markdown"
```

As of Spring Framework 5.3, Spring MVC supports two strategies for matching request paths to controllers.
By default, Spring Boot uses the [`PathPatternParser`][r56] strategy.
[`PathPatternParser`][r56] is an [optimized implementation][r57] but comes with some restrictions compared to the [`AntPathMatcher`][r58] strategy.
[`PathPatternParser`][r56] restricts usage of [some path pattern variants][r59].
It is also incompatible with configuring the [`DispatcherServlet`][r46] with a path prefix (`spring.mvc.servlet.path`).

The strategy can be configured using the `spring.mvc.pathmatch.matching-strategy` configuration property, as shown in the following example:

```properties
spring.mvc.pathmatch.matching-strategy=ant-path-matcher
```

```yaml
spring:
  mvc:
    pathmatch:
      matching-strategy: "ant-path-matcher"
```

Spring MVC will throw a [`NoHandlerFoundException`][r60] if a handler is not found for a request.
Note that, by default, the [serving of static content][r10] is mapped to `/**` and will, therefore, provide a handler for all requests.
If no static content is available, [`ResourceHttpRequestHandler`][r45] will throw a [`NoResourceFoundException`][r61].
For a [`NoHandlerFoundException`][r60] to be thrown, set `spring.mvc.static-path-pattern` to a more specific value such as `/resources/**` or set `spring.web.resources.add-mappings` to `false` to disable serving of static content entirely.

### ConfigurableWebBindingInitializer

Spring MVC uses a [`WebBindingInitializer`][r62] to initialize a [`WebDataBinder`][r63] for a particular request.
If you create your own [`ConfigurableWebBindingInitializer`][r18] [`@Bean`][r64], Spring Boot automatically configures Spring MVC to use it.

### Template Engines

As well as REST web services, you can also use Spring MVC to serve dynamic HTML content.
Spring MVC supports a variety of templating technologies, including Thymeleaf, FreeMarker, and JSPs.
Also, many other templating engines include their own Spring MVC integrations.

Spring Boot includes auto-configuration support for the following templating engines:

- [FreeMarker][r65]
- [Groovy][r66]
- [Thymeleaf][r67]
- [Mustache][r68]

> [TIP]
>
> If possible, JSPs should be avoided.
> There are several [known limitations][r69] when using them with embedded servlet containers.

When you use one of these templating engines with the default configuration, your templates are picked up automatically from `src/main/resources/templates`.

> [TIP]
>
> Depending on how you run your application, your IDE may order the classpath differently.
> Running your application in the IDE from its main method results in a different ordering than when you run your application by using Maven or Gradle or from its packaged jar.
> This can cause Spring Boot to fail to find the expected template.
> If you have this problem, you can reorder the classpath in the IDE to place the module’s classes and resources first.

### Error Handling

By default, Spring Boot provides an `/error` mapping that handles all errors in a sensible way, and it is registered as a “global” error page in the servlet container.
For machine clients, it produces a JSON response with details of the error, the HTTP status, and the exception message.
For browser clients, there is a “whitelabel” error view that renders the same data in HTML format (to customize it, add a [`View`][r70] that resolves to `error`).

There are a number of `spring.web.error` properties that can be set if you want to customize the default error handling behavior.
See the [Web Properties][r71] section of the Appendix.

To replace the default behavior completely, you can implement [`ErrorController`][r72] and register a bean definition of that type or add a bean of type [`ErrorAttributes`][r73] to use the existing mechanism but replace the contents.

> [TIP]
>
> The [`BasicErrorController`][r74] can be used as a base class for a custom [`ErrorController`][r72].
> This is particularly useful if you want to add a handler for a new content type (the default is to handle `text/html` specifically and provide a fallback for everything else).
> To do so, extend [`BasicErrorController`][r74], add a public method with a [`@RequestMapping`][r4] that has a `produces` attribute, and create a bean of your new type.

As of Spring Framework 6.0, [RFC 9457 Problem Details][r75] is supported.
Spring MVC can produce custom error messages with the `application/problem+json` media type, like:

```json
{
	"type": "https://example.org/problems/unknown-project",
	"title": "Unknown project",
	"status": 404,
	"detail": "No project found for id 'spring-unknown'",
	"instance": "/projects/spring-unknown"
}
```

This support can be enabled by setting `spring.mvc.problemdetails.enabled` to `true`.

You can also define a class annotated with [`@ControllerAdvice`][r76] to customize the JSON document to return for a particular controller and/or exception type, as shown in the following example:

```kotlin
import jakarta.servlet.RequestDispatcher
import jakarta.servlet.http.HttpServletRequest
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.ControllerAdvice
import org.springframework.web.bind.annotation.ExceptionHandler
import org.springframework.web.bind.annotation.ResponseBody
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler

@ControllerAdvice(basePackageClasses = [SomeController::class])
class MyControllerAdvice : ResponseEntityExceptionHandler() {

	@ResponseBody
	@ExceptionHandler(MyException::class)
	fun handleControllerException(request: HttpServletRequest, ex: Throwable): ResponseEntity<*> {
		val status = getStatus(request)
		return ResponseEntity(MyErrorBody(status.value(), ex.message), status)
	}

	private fun getStatus(request: HttpServletRequest): HttpStatus {
		val code = request.getAttribute(RequestDispatcher.ERROR_STATUS_CODE) as Int
		val status = HttpStatus.resolve(code)
		return status ?: HttpStatus.INTERNAL_SERVER_ERROR
	}

}
```

```java
import jakarta.servlet.RequestDispatcher;
import jakarta.servlet.http.HttpServletRequest;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

@ControllerAdvice(basePackageClasses = SomeController.class)
public class MyControllerAdvice extends ResponseEntityExceptionHandler {

	@ResponseBody
	@ExceptionHandler(MyException.class)
	public ResponseEntity<?> handleControllerException(HttpServletRequest request, Throwable ex) {
		HttpStatus status = getStatus(request);
		return new ResponseEntity<>(new MyErrorBody(status.value(), ex.getMessage()), status);
	}

	private HttpStatus getStatus(HttpServletRequest request) {
		Integer code = (Integer) request.getAttribute(RequestDispatcher.ERROR_STATUS_CODE);
		HttpStatus status = HttpStatus.resolve(code);
		return (status != null) ? status : HttpStatus.INTERNAL_SERVER_ERROR;
	}

}
```

In the preceding example, if `MyException` is thrown by a controller defined in the same package as `SomeController`, a JSON representation of the `MyErrorBody` POJO is used instead of the [`ErrorAttributes`][r73] representation.

In some cases, errors handled at the controller level are not recorded by web observations or the [metrics infrastructure][r77].
Applications can ensure that such exceptions are recorded with the observations by [setting the handled exception on the observation context][r78].

#### Custom Error Pages

If you want to display a custom HTML error page for a given status code, you can add a file to an `/error` directory.
Error pages can either be static HTML (that is, added under any of the static resource directories) or be built by using templates.
The name of the file should be the exact status code or a series mask.

For example, to map `404` to a static HTML file, your directory structure would be as follows:

```text
src/
 +- main/
     +- java/
     |   + <source code>
     +- resources/
         +- public/
             +- error/
             |   +- 404.html
             +- <other public assets>
```

To map all `5xx` errors by using a FreeMarker template, your directory structure would be as follows:

```text
src/
 +- main/
     +- java/
     |   + <source code>
     +- resources/
         +- templates/
             +- error/
             |   +- 5xx.ftlh
             +- <other templates>
```

For more complex mappings, you can also add beans that implement the [`ErrorViewResolver`][r79] interface, as shown in the following example:

```kotlin
import jakarta.servlet.http.HttpServletRequest
import org.springframework.boot.webmvc.autoconfigure.error.ErrorViewResolver
import org.springframework.http.HttpStatus
import org.springframework.web.servlet.ModelAndView

class MyErrorViewResolver : ErrorViewResolver {

	override fun resolveErrorView(request: HttpServletRequest, status: HttpStatus,
			model: Map<String, Any>): ModelAndView? {
		// Use the request or status to optionally return a ModelAndView
		if (status == HttpStatus.INSUFFICIENT_STORAGE) {
			// We could add custom model values here
			return ModelAndView("myview")
		}
		return null
	}

}
```

```java
import java.util.Map;

import jakarta.servlet.http.HttpServletRequest;

import org.springframework.boot.webmvc.autoconfigure.error.ErrorViewResolver;
import org.springframework.http.HttpStatus;
import org.springframework.web.servlet.ModelAndView;

public class MyErrorViewResolver implements ErrorViewResolver {

	@Override
	public ModelAndView resolveErrorView(HttpServletRequest request, HttpStatus status, Map<String, Object> model) {
		// Use the request or status to optionally return a ModelAndView
		if (status == HttpStatus.INSUFFICIENT_STORAGE) {
			// We could add custom model values here
			return new ModelAndView("myview");
		}
		return null;
	}

}
```

You can also use regular Spring MVC features such as [`@ExceptionHandler` methods][r80] and [`@ControllerAdvice`][r81].
The [`ErrorController`][r72] then picks up any unhandled exceptions.

#### Mapping Error Pages Outside of Spring MVC

For applications that do not use Spring MVC, you can use the [`ErrorPageRegistrar`][r82] interface to directly register [`ErrorPage`][r83] instances.
This abstraction works directly with the underlying embedded servlet container and works even if you do not have a Spring MVC [`DispatcherServlet`][r46].

```kotlin
import org.springframework.boot.web.error.ErrorPage
import org.springframework.boot.web.error.ErrorPageRegistrar
import org.springframework.boot.web.error.ErrorPageRegistry
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.http.HttpStatus

@Configuration(proxyBeanMethods = false)
class MyErrorPagesConfiguration {

	@Bean
	fun errorPageRegistrar(): ErrorPageRegistrar {
		return ErrorPageRegistrar { registry: ErrorPageRegistry -> registerErrorPages(registry) }
	}

	private fun registerErrorPages(registry: ErrorPageRegistry) {
		registry.addErrorPages(ErrorPage(HttpStatus.BAD_REQUEST, "/400"))
	}

}
```

```java
import org.springframework.boot.web.error.ErrorPage;
import org.springframework.boot.web.error.ErrorPageRegistrar;
import org.springframework.boot.web.error.ErrorPageRegistry;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpStatus;

@Configuration(proxyBeanMethods = false)
public class MyErrorPagesConfiguration {

	@Bean
	public ErrorPageRegistrar errorPageRegistrar() {
		return this::registerErrorPages;
	}

	private void registerErrorPages(ErrorPageRegistry registry) {
		registry.addErrorPages(new ErrorPage(HttpStatus.BAD_REQUEST, "/400"));
	}

}
```

> [NOTE]
>
> If you register an [`ErrorPage`][r83] with a path that ends up being handled by a [`Filter`][r84] (as is common with some non-Spring web frameworks, like Jersey and Wicket), then the [`Filter`][r84] has to be explicitly registered as an `ERROR` dispatcher, as shown in the following example:

```kotlin
import jakarta.servlet.DispatcherType
import org.springframework.boot.web.servlet.FilterRegistrationBean
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import java.util.EnumSet

@Configuration(proxyBeanMethods = false)
class MyFilterConfiguration {

	@Bean
	fun myFilter(): FilterRegistrationBean<MyFilter> {
		val registration = FilterRegistrationBean(MyFilter())
		// ...
		registration.setDispatcherTypes(EnumSet.allOf(DispatcherType::class.java))
		return registration
	}

}
```

```java
import java.util.EnumSet;

import jakarta.servlet.DispatcherType;

import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration(proxyBeanMethods = false)
public class MyFilterConfiguration {

	@Bean
	public FilterRegistrationBean<MyFilter> myFilter() {
		FilterRegistrationBean<MyFilter> registration = new FilterRegistrationBean<>(new MyFilter());
		// ...
		registration.setDispatcherTypes(EnumSet.allOf(DispatcherType.class));
		return registration;
	}

}
```

Note that the default [`FilterRegistrationBean`][r85] does not include the `ERROR` dispatcher type.

#### Error Handling in a WAR Deployment

When deployed to a servlet container, Spring Boot uses its error page filter to forward a request with an error status to the appropriate error page.
This is necessary as the servlet specification does not provide an API for registering error pages.
Depending on the container that you are deploying your war file to and the technologies that your application uses, some additional configuration may be required.

The error page filter can only forward the request to the correct error page if the response has not already been committed.
By default, WebSphere Application Server 8.0 and later commits the response upon successful completion of a servlet’s service method.
You should disable this behavior by setting `com.ibm.ws.webcontainer.invokeFlushAfterService` to `false`.

### CORS Support

[Cross-origin resource sharing][r86] (CORS) is a [W3C specification][r87] implemented by [most browsers][r88] that lets you specify in a flexible way what kind of cross-domain requests are authorized, instead of using some less secure and less powerful approaches such as IFRAME or JSONP.

As of version 4.2, Spring MVC [supports CORS][r89].
Using [controller method CORS configuration][r90] with [`@CrossOrigin`][r91] annotations in your Spring Boot application does not require any specific configuration.
[Global CORS configuration][r92] can be defined by registering a [`WebMvcConfigurer`][r21] bean with a customized `addCorsMappings(CorsRegistry)` method, as shown in the following example:

```kotlin
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.web.servlet.config.annotation.CorsRegistry
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer

@Configuration(proxyBeanMethods = false)
class MyCorsConfiguration {

	@Bean
	fun corsConfigurer(): WebMvcConfigurer {
		return object : WebMvcConfigurer {
			override fun addCorsMappings(registry: CorsRegistry) {
				registry.addMapping("/api/**")
			}
		}
	}

}
```

```java
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration(proxyBeanMethods = false)
public class MyCorsConfiguration {

	@Bean
	public WebMvcConfigurer corsConfigurer() {
		return new WebMvcConfigurer() {

			@Override
			public void addCorsMappings(CorsRegistry registry) {
				registry.addMapping("/api/**");
			}

		};
	}

}
```

### API Versioning

Spring MVC supports API versioning which can be used to evolve an HTTP API over time.
The same `@Controller` path can be mapped multiple times to support different versions of the API.

For more details see [Spring Framework’s reference documentation][r93].

Once mappings have been added, you additionally need to configure Spring MVC so that it is able to use any version information sent with a request.
Typically, versions are sent as HTTP headers, query parameters, media type parameters, or as part of the path.

To configure Spring MVC, you can either use a [`WebMvcConfigurer`][r21] bean and override the `configureApiVersioning(…​)` method, or you can use properties.

For example, the following will use an `X-Version` HTTP header to obtain version information and default to `1.0.0` when no header is sent.

```properties
spring.mvc.apiversion.default=1.0.0
spring.mvc.apiversion.use.header=X-Version
```

```yaml
spring:
  mvc:
    apiversion:
      default: 1.0.0
      use:
        header: X-Version
```

> [NOTE]
>
> If your setup requires multiple strategies, such as header and query parameter, consider declaring the order programmatically by overriding the `configureApiVersioning` method.

For more complete control, you can also define [`ApiVersionResolver`][r94], [`ApiVersionParser`][r95] and [`ApiVersionDeprecationHandler`][r96] beans which will be injected into the auto-configured Spring MVC configuration.

> [TIP]
>
> API versioning is also supported with both `WebClient` and `RestClient`.
> See [API Versioning][r97] for details.

## JAX-RS and Jersey

If you prefer the JAX-RS programming model for REST endpoints, you can use one of the available implementations instead of Spring MVC.
[Jersey][r98] and [Apache CXF][r99] work quite well out of the box.
CXF requires you to register its [`Servlet`][r100] or [`Filter`][r84] as a [`@Bean`][r64] in your application context.
Jersey has some native Spring support, so we also provide auto-configuration support for it in Spring Boot, together with a starter.

To get started with Jersey, include the `spring-boot-starter-jersey` as a dependency and then you need one [`@Bean`][r64] of type [`ResourceConfig`][r101] in which you register all the endpoints, as shown in the following example:

```kotlin
import org.glassfish.jersey.server.ResourceConfig
import org.springframework.stereotype.Component

@Component
class MyJerseyConfig : ResourceConfig() {

	init {
		register(MyEndpoint::class.java)
	}

}
```

```java
import org.glassfish.jersey.server.ResourceConfig;

import org.springframework.stereotype.Component;

@Component
public class MyJerseyConfig extends ResourceConfig {

	public MyJerseyConfig() {
		register(MyEndpoint.class);
	}

}
```

> [WARNING]
>
> Jersey’s support for scanning executable archives is rather limited.
> For example, it cannot scan for endpoints in a package found in a [fully executable jar file][r102] or in `WEB-INF/classes` when running an executable war file.
> To avoid this limitation, the `packages` method should not be used, and endpoints should be registered individually by using the `register` method, as shown in the preceding example.

For more advanced customizations, you can also register an arbitrary number of beans that implement [`ResourceConfigCustomizer`][r103].

All the registered endpoints should be a [`@Component`][r104] with HTTP resource annotations (`@GET` and others), as shown in the following example:

```kotlin
import jakarta.ws.rs.GET
import jakarta.ws.rs.Path
import org.springframework.stereotype.Component

@Component
@Path("/hello")
class MyEndpoint {

	@GET
	fun message(): String {
		return "Hello"
	}

}
```

```java
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;

import org.springframework.stereotype.Component;

@Component
@Path("/hello")
public class MyEndpoint {

	@GET
	public String message() {
		return "Hello";
	}

}
```

Since the [`@Endpoint`][r105] is a Spring [`@Component`][r104], its lifecycle is managed by Spring and you can use the [`@Autowired`][r106] annotation to inject dependencies and use the [`@Value`][r107] annotation to inject external configuration.
By default, the Jersey servlet is registered and mapped to `/*`.
You can change the mapping by adding [`@ApplicationPath`][r108] to your [`ResourceConfig`][r101].

By default, Jersey is set up as a servlet in a [`@Bean`][r64] of type [`ServletRegistrationBean`][r109] named `jerseyServletRegistration`.
By default, the servlet is initialized lazily, but you can customize that behavior by setting `spring.jersey.servlet.load-on-startup`.
You can disable or override that bean by creating one of your own with the same name.
You can also use a filter instead of a servlet by setting `spring.jersey.type=filter` (in which case, the [`@Bean`][r64] to replace or override is `jerseyFilterRegistration`).
The filter has an [`@Order`][r110], which you can set with `spring.jersey.filter.order`.
When using Jersey as a filter, a servlet that will handle any requests that are not intercepted by Jersey must be present.
If your application does not contain such a servlet, you may want to enable the default servlet by setting `server.servlet.register-default-servlet` to `true`.
Both the servlet and the filter registrations can be given init parameters by using `spring.jersey.init.*` to specify a map of properties.

## Embedded Servlet Container Support

For servlet application, Spring Boot includes support for embedded [Tomcat][r111] and [Jetty][r112] servers.
Most developers use the appropriate starter to obtain a fully configured instance.
By default, the embedded server listens for HTTP requests on port `8080`.

### Servlets, Filters, and Listeners

When using an embedded servlet container, you can register servlets, filters, and all the listeners (such as [`HttpSessionListener`][r113]) from the servlet spec, either by using Spring beans or by scanning for servlet components.

#### Registering Servlets, Filters, and Listeners as Spring Beans

Any [`Servlet`][r100], [`Filter`][r84], or servlet `*Listener` instance that is a Spring bean is registered with the embedded container.
This can be particularly convenient if you want to refer to a value from your `application.properties` during configuration.

By default, if the context contains only a single Servlet, it is mapped to `/`.
In the case of multiple servlet beans, the bean name is used as a path prefix.
Filters map to `/*`.

If convention-based mapping is not flexible enough, you can use the [`ServletRegistrationBean`][r109], [`FilterRegistrationBean`][r85], and [`ServletListenerRegistrationBean`][r114] classes for complete control.
If you prefer annotations over [`ServletRegistrationBean`][r109] and [`FilterRegistrationBean`][r85], you can also use [`@ServletRegistration`][r115] and
[`@FilterRegistration`][r116] as an alternative.

It is usually safe to leave filter beans unordered.
If a specific order is required, you should annotate the [`Filter`][r84] with [`@Order`][r110] or make it implement [`Ordered`][r117].
You cannot configure the order of a [`Filter`][r84] by annotating its bean method with [`@Order`][r110].
If you cannot change the [`Filter`][r84] class to add [`@Order`][r110] or implement [`Ordered`][r117], you must define a [`FilterRegistrationBean`][r85] for the [`Filter`][r84] and set the registration bean’s order using the `setOrder(int)` method.
Or, if you prefer annotations, you can also use [`@FilterRegistration`][r116] and set the `order` attribute.
Avoid configuring a filter that reads the request body at `Ordered.HIGHEST_PRECEDENCE`, since it might go against the character encoding configuration of your application.
If a servlet filter wraps the request, it should be configured with an order that is less than or equal to `OrderedFilter.REQUEST_WRAPPER_FILTER_MAX_ORDER`.

> [TIP]
>
> To see the order of every [`Filter`][r84] in your application, enable debug level logging for the `web` [logging group][r118] (`logging.level.web=debug`).
> Details of the registered filters, including their order and URL patterns, will then be logged at startup.

> [WARNING]
>
> Take care when registering [`Filter`][r84] beans since they are initialized very early in the application lifecycle.
> If you need to register a [`Filter`][r84] that interacts with other beans, consider using a [`DelegatingFilterProxyRegistrationBean`][r119] instead.

### Servlet Context Initialization

Embedded servlet containers do not directly execute the [`ServletContainerInitializer`][r120] interface or Spring’s [`WebApplicationInitializer`][r121] interface.
This is an intentional design decision intended to reduce the risk that third party libraries designed to run inside a war may break Spring Boot applications.

If you need to perform servlet context initialization in a Spring Boot application, you should register a bean that implements the [`ServletContextInitializer`][r122] interface.
The single `onStartup` method provides access to the [`ServletContext`][r44] and, if necessary, can easily be used as an adapter to an existing [`WebApplicationInitializer`][r121].

#### Init Parameters

Init parameters can be configured on the [`ServletContext`][r44] using `server.servlet.context-parameters.*` properties.
For example, the property `server.servlet.context-parameters.com.example.parameter=example` will configure a `ServletContext` init parameter named `com.example.parameter` with the value `example`.

#### Scanning for Servlets, Filters, and listeners

When using an embedded container, automatic registration of classes annotated with [`@WebServlet`][r123], [`@WebFilter`][r124], and [`@WebListener`][r125] can be enabled by using [`@ServletComponentScan`][r126].

> [TIP]
>
> [`@ServletComponentScan`][r126] has no effect in a standalone container, where the container’s built-in discovery mechanisms are used instead.

### The ServletWebServerApplicationContext

Under the hood, Spring Boot uses a different type of [`ApplicationContext`][r127] for embedded servlet container support.
The [`ServletWebServerApplicationContext`][r128] is a special type of [`WebApplicationContext`][r129] that bootstraps itself by searching for a single [`ServletWebServerFactory`][r130] bean.
Usually a [`TomcatServletWebServerFactory`][r131], or [`JettyServletWebServerFactory`][r132] has been auto-configured.

> [NOTE]
>
> You usually do not need to be aware of these implementation classes.
> Most applications are auto-configured, and the appropriate [`ApplicationContext`][r127] and [`ServletWebServerFactory`][r130] are created on your behalf.

In an embedded container setup, the [`ServletContext`][r44] is set as part of server startup which happens during application context initialization.
Because of this beans in the [`ApplicationContext`][r127] cannot be reliably initialized with a [`ServletContext`][r44].
One way to get around this is to inject [`ApplicationContext`][r127] as a dependency of the bean and access the [`ServletContext`][r44] only when it is needed.
Another way is to use a callback once the server has started.
This can be done using an [`ApplicationListener`][r133] which listens for the [`ApplicationStartedEvent`][r134] as follows:

```kotlin
import jakarta.servlet.ServletContext
import org.springframework.boot.context.event.ApplicationStartedEvent
import org.springframework.context.ApplicationContext
import org.springframework.context.ApplicationListener
import org.springframework.web.context.WebApplicationContext

class MyDemoBean : ApplicationListener<ApplicationStartedEvent> {

	private var servletContext: ServletContext? = null

	override fun onApplicationEvent(event: ApplicationStartedEvent) {
		val applicationContext: ApplicationContext = event.applicationContext
		this.servletContext = (applicationContext as WebApplicationContext).servletContext
	}

}
```

```java
import jakarta.servlet.ServletContext;

import org.springframework.boot.context.event.ApplicationStartedEvent;
import org.springframework.context.ApplicationContext;
import org.springframework.context.ApplicationListener;
import org.springframework.web.context.WebApplicationContext;

public class MyDemoBean implements ApplicationListener<ApplicationStartedEvent> {

	private ServletContext servletContext;

	@Override
	public void onApplicationEvent(ApplicationStartedEvent event) {
		ApplicationContext applicationContext = event.getApplicationContext();
		this.servletContext = ((WebApplicationContext) applicationContext).getServletContext();
	}

}
```

### Customizing Embedded Servlet Containers

Common servlet container settings can be configured by using Spring [`Environment`][r135] properties.
Usually, you would define the properties in your `application.properties` or `application.yaml` file.

Common server settings include:

- Network settings: Listen port for incoming HTTP requests (`server.port`), interface address to bind to (`server.address`), and so on.
- Session settings: Whether the session is persistent (`server.servlet.session.persistent`), session timeout (`server.servlet.session.timeout`), location of session data (`server.servlet.session.store-dir`), and session-cookie configuration (`server.servlet.session.cookie.*`).
- Error management: Location of the error page (`spring.web.error.path`) and so on.
- [SSL][r136]
- [HTTP compression][r137]

Spring Boot tries as much as possible to expose common settings, but this is not always possible.
For those cases, dedicated namespaces offer server-specific customizations (see `server.tomcat`).
For instance, [access logs][r138] can be configured with specific features of the embedded servlet container.

> [TIP]
>
> See the [`ServerProperties`][r139] class for a complete list.

#### SameSite Cookies

The `SameSite` cookie attribute can be used by web browsers to control if and how cookies are submitted in cross-site requests.
The attribute is particularly relevant for modern web browsers which have started to change the default value that is used when the attribute is missing.

If you want to change the `SameSite` attribute of your session cookie, you can use the `server.servlet.session.cookie.same-site` property.
This property is supported by auto-configured Tomcat and Jetty servers.
It is also used to configure Spring Session servlet based [`SessionRepository`][r140] beans.

For example, if you want your session cookie to have a `SameSite` attribute of `None`, you can add the following to your `application.properties` or `application.yaml` file:

```properties
server.servlet.session.cookie.same-site=none
```

```yaml
server:
  servlet:
    session:
      cookie:
        same-site: "none"
```

If you want to change the `SameSite` attribute on other cookies added to your [`HttpServletResponse`][r141], you can use a [`CookieSameSiteSupplier`][r142].
The [`CookieSameSiteSupplier`][r142] is passed a [`Cookie`][r143] and may return a `SameSite` value, or `null`.

There are a number of convenience factory and filter methods that you can use to quickly match specific cookies.
For example, adding the following bean will automatically apply a `SameSite` of `Lax` for all cookies with a name that matches the regular expression `myapp.*`.

```kotlin
import org.springframework.boot.web.server.servlet.CookieSameSiteSupplier
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration

@Configuration(proxyBeanMethods = false)
class MySameSiteConfiguration {

	@Bean
	fun applicationCookieSameSiteSupplier(): CookieSameSiteSupplier {
		return CookieSameSiteSupplier.ofLax().whenHasNameMatching("myapp.*")
	}

}
```

```java
import org.springframework.boot.web.server.servlet.CookieSameSiteSupplier;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration(proxyBeanMethods = false)
public class MySameSiteConfiguration {

	@Bean
	public CookieSameSiteSupplier applicationCookieSameSiteSupplier() {
		return CookieSameSiteSupplier.ofLax().whenHasNameMatching("myapp.*");
	}

}
```

#### Character Encoding

The character encoding behavior of the embedded servlet container for request and response handling can be configured using the `server.servlet.encoding.*` configuration properties.

When a request’s `Accept-Language` header indicates a locale for the request it will be automatically mapped to a charset by the servlet container.
Each container provides default locale to charset mappings and you should verify that they meet your application’s needs.
When they do not, use the `server.servlet.encoding.mapping` configuration property to customize the mappings, as shown in the following example:

```properties
server.servlet.encoding.mapping.ko=UTF-8
```

```yaml
server:
  servlet:
    encoding:
      mapping:
        ko: "UTF-8"
```

In the preceding example, the `ko` (Korean) locale has been mapped to `UTF-8`.
This is equivalent to a `<locale-encoding-mapping-list>` entry in a `web.xml` file of a traditional war deployment.

#### Programmatic Customization

If you need to programmatically configure your embedded servlet container, you can register a Spring bean that implements the [`WebServerFactoryCustomizer`][r144] interface.
[`WebServerFactoryCustomizer`][r144] provides access to the [`ConfigurableServletWebServerFactory`][r145], which includes numerous customization setter methods.
The following example shows programmatically setting the port:

```kotlin
import org.springframework.boot.web.server.servlet.ConfigurableServletWebServerFactory
import org.springframework.boot.web.server.WebServerFactoryCustomizer
import org.springframework.stereotype.Component

@Component
class MyWebServerFactoryCustomizer : WebServerFactoryCustomizer<ConfigurableServletWebServerFactory> {

	override fun customize(server: ConfigurableServletWebServerFactory) {
		server.setPort(9000)
	}

}
```

```java
import org.springframework.boot.web.server.WebServerFactoryCustomizer;
import org.springframework.boot.web.server.servlet.ConfigurableServletWebServerFactory;
import org.springframework.stereotype.Component;

@Component
public class MyWebServerFactoryCustomizer implements WebServerFactoryCustomizer<ConfigurableServletWebServerFactory> {

	@Override
	public void customize(ConfigurableServletWebServerFactory server) {
		server.setPort(9000);
	}

}
```

[`TomcatServletWebServerFactory`][r131], and [`JettyServletWebServerFactory`][r132] are dedicated variants of [`ConfigurableServletWebServerFactory`][r145] that have additional customization setter methods for Tomcat, and Jetty respectively.
The following example shows how to customize [`TomcatServletWebServerFactory`][r131] that provides access to Tomcat-specific configuration options:

```kotlin
import org.springframework.boot.web.server.WebServerFactoryCustomizer
import org.springframework.boot.tomcat.servlet.TomcatServletWebServerFactory
import org.springframework.stereotype.Component
import java.time.Duration

@Component
class MyTomcatWebServerFactoryCustomizer : WebServerFactoryCustomizer<TomcatServletWebServerFactory> {

	override fun customize(server: TomcatServletWebServerFactory) {
		server.addConnectorCustomizers({ connector -> connector.asyncTimeout = Duration.ofSeconds(20).toMillis() })
	}

}
```

```java
import java.time.Duration;

import org.springframework.boot.tomcat.servlet.TomcatServletWebServerFactory;
import org.springframework.boot.web.server.WebServerFactoryCustomizer;
import org.springframework.stereotype.Component;

@Component
public class MyTomcatWebServerFactoryCustomizer implements WebServerFactoryCustomizer<TomcatServletWebServerFactory> {

	@Override
	public void customize(TomcatServletWebServerFactory server) {
		server.addConnectorCustomizers((connector) -> connector.setAsyncTimeout(Duration.ofSeconds(20).toMillis()));
	}

}
```

#### Customizing ConfigurableServletWebServerFactory Directly

For more advanced use cases that require you to extend from [`ServletWebServerFactory`][r130], you can expose a bean of such type yourself.

Setters are provided for many configuration options.
Several protected method “hooks” are also provided should you need to do something more exotic.
See the [`ConfigurableServletWebServerFactory`][r145] API documentation for details.

> [NOTE]
>
> Auto-configured customizers are still applied on your custom factory, so use that option carefully.

### JSP Limitations

When running a Spring Boot application that uses an embedded servlet container (and is packaged as an executable archive), there are some limitations in the JSP support.

- With Jetty and Tomcat, it should work if you use war packaging.
  An executable war will work when launched with `java -jar`, and will also be deployable to any standard container.
  JSPs are not supported when using an executable jar.
- Creating a custom `error.jsp` page does not override the default view for [error handling][r146].
  [Custom error pages][r147] should be used instead.
- If you run your application using `mvn spring-boot:run` or `gradle bootRun` and you deviate from the standard `src/main/webapp` directory structure you may need to set a `WAR_SOURCE_DIRECTORY` environment variable so that Spring Boot can find your JSPs.
