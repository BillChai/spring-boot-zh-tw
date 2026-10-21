# Testing Spring Boot Applications

A Spring Boot application is a Spring [`ApplicationContext`][r1], so nothing very special has to be done to test it beyond what you would normally do with a vanilla Spring context.

> [NOTE]
>
> External properties, logging, and other features of Spring Boot are installed in the context by default only if you use [`SpringApplication`][r2] to create it.

Spring Boot provides a [`@SpringBootTest`][r3] annotation, which can be used as an alternative to the standard `spring-test` [`@ContextConfiguration`][r4] annotation when you need Spring Boot features.
The annotation works by [creating the `ApplicationContext` used in your tests through `SpringApplication`][r5].
In addition to [`@SpringBootTest`][r3] a number of other annotations are also provided for [testing more specific slices][r6] of an application.

> [TIP]
>
> If you are using JUnit 4, do not forget to also add `@RunWith(SpringRunner.class)` to your test, otherwise the annotations will be ignored.
> If you are using JUnit 6, there is no need to add the equivalent `@ExtendWith(SpringExtension.class)` as [`@SpringBootTest`][r3] and the other `@…​Test` annotations are already annotated with it.

By default, [`@SpringBootTest`][r3] will not start a server.
You can use the `webEnvironment` attribute of [`@SpringBootTest`][r3] to further refine how your tests run:

- `MOCK`(Default) : Loads a web [`ApplicationContext`][r1] and provides a mock web environment.
  Embedded servers are not started when using this annotation.
  If a web environment is not available on your classpath, this mode transparently falls back to creating a regular non-web [`ApplicationContext`][r1].
  It can be used in conjunction with [`@AutoConfigureMockMvc`][r7], or [`@AutoConfigureWebTestClient`][r8]] for mock-based testing of your web application.
- `RANDOM_PORT`: Loads a [`WebServerApplicationContext`][r9] and provides a real web environment.
  Embedded servers are started and listen on a random port.
- `DEFINED_PORT`: Loads a [`WebServerApplicationContext`][r9] and provides a real web environment.
  Embedded servers are started and listen on a defined port (from your `application.properties`) or on the default port of `8080`.
- `NONE`: Loads an [`ApplicationContext`][r1] by using [`SpringApplication`][r2] but does not provide *any* web environment (mock or otherwise).

> [NOTE]
>
> If your test is [`@Transactional`][r10], it rolls back the transaction at the end of each test method by default.
> However, as using this arrangement with either `RANDOM_PORT` or `DEFINED_PORT` implicitly provides a real servlet environment, the HTTP client and server run in separate threads and, thus, in separate transactions.
> Any transaction initiated on the server does not roll back in this case.

> [NOTE]
>
> [`@SpringBootTest`][r3] with `webEnvironment = WebEnvironment.RANDOM_PORT` will also start the management server on a separate random port if your application uses a different port for the management server.

## Detecting Web Application Type

If Spring MVC is available, a regular MVC-based application context is configured.
If you have only Spring WebFlux, we will detect that and configure a WebFlux-based application context instead.

If both are present, Spring MVC takes precedence.
If you want to test a reactive web application in this scenario, you must set the `spring.main.web-application-type` property:

```kotlin
import org.springframework.boot.test.context.SpringBootTest

@SpringBootTest(properties = ["spring.main.web-application-type=reactive"])
class MyWebFluxTests {

	// ...

}
```

```java
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest(properties = "spring.main.web-application-type=reactive")
class MyWebFluxTests {

	// ...

}
```

## Detecting Test Configuration

If you are familiar with the Spring Test Framework, you may be used to using `@ContextConfiguration(classes=…​)` in order to specify which Spring [`@Configuration`][r11] to load.
Alternatively, you might have often used nested [`@Configuration`][r11] classes within your test.

When testing Spring Boot applications, this is often not required.
Spring Boot’s `@*Test` annotations search for your primary configuration automatically whenever you do not explicitly define one.

The search algorithm works up from the package that contains the test until it finds a class annotated with [`@SpringBootApplication`][r12] or [`@SpringBootConfiguration`][r13].
As long as you [structured your code][r14] in a sensible way, your main configuration is usually found.

> [NOTE]
>
> If you use a [test annotation to test a more specific slice of your application][r6], you should avoid adding configuration settings that are specific to a particular area on the [main method’s application class][r15].
>
> The underlying component scan configuration of [`@SpringBootApplication`][r12] defines exclude filters that are used to make sure slicing works as expected.
> If you are using an explicit [`@ComponentScan`][r16] directive on your [`@SpringBootApplication`][r12]-annotated class, be aware that those filters will be disabled.
> If you are using slicing, you should define them again.

If you want to customize the primary configuration, you can use a nested [`@TestConfiguration`][r17] class.
Unlike a nested [`@Configuration`][r11] class, which would be used instead of your application’s primary configuration, a nested [`@TestConfiguration`][r17] class is used in addition to your application’s primary configuration.

> [NOTE]
>
> Spring’s test framework caches application contexts between tests.
> Therefore, as long as your tests share the same configuration (no matter how it is discovered), the potentially time-consuming process of loading the context happens only once.

## Using the Test Configuration Main Method

Typically the test configuration discovered by [`@SpringBootTest`][r3] will be your main [`@SpringBootApplication`][r12].
In most well structured applications, this configuration class will also include the `main` method used to launch the application.

For example, the following is a very common code pattern for a typical Spring Boot application:

```kotlin
import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.docs.using.structuringyourcode.locatingthemainclass.MyApplication
import org.springframework.boot.runApplication

@SpringBootApplication
class MyApplication

fun main(args: Array<String>) {
	runApplication<MyApplication>(*args)
}
```

```java
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class MyApplication {

	public static void main(String[] args) {
		SpringApplication.run(MyApplication.class, args);
	}

}
```

In the example above, the `main` method doesn’t do anything other than delegate to [`SpringApplication.run(Class, String...)`][r18].
It is, however, possible to have a more complex `main` method that applies customizations before calling [`SpringApplication.run(Class, String...)`][r18].

For example, here is an application that changes the banner mode and sets additional profiles:

```kotlin
import org.springframework.boot.Banner
import org.springframework.boot.runApplication
import org.springframework.boot.autoconfigure.SpringBootApplication

@SpringBootApplication
class MyApplication

fun main(args: Array<String>) {
	runApplication<MyApplication>(*args) {
		setBannerMode(Banner.Mode.OFF)
		setAdditionalProfiles("myprofile")
	}
}
```

```java
import org.springframework.boot.Banner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class MyApplication {

	public static void main(String[] args) {
		SpringApplication application = new SpringApplication(MyApplication.class);
		application.setBannerMode(Banner.Mode.OFF);
		application.setAdditionalProfiles("myprofile");
		application.run(args);
	}

}
```

Since customizations in the `main` method can affect the resulting [`ApplicationContext`][r1], it’s possible that you might also want to use the `main` method to create the [`ApplicationContext`][r1] used in your tests.
By default, [`@SpringBootTest`][r3] will not call your `main` method, and instead the class itself is used directly to create the [`ApplicationContext`][r1]

If you want to change this behavior, you can change the `useMainMethod` attribute of [`@SpringBootTest`][r3] to [`SpringBootTest.UseMainMethod.ALWAYS`][r19] or [`SpringBootTest.UseMainMethod.WHEN_AVAILABLE`][r20].
When set to `ALWAYS`, the test will fail if no `main` method can be found.
When set to `WHEN_AVAILABLE` the `main` method will be used if it is available, otherwise the standard loading mechanism will be used.

For example, the following test will invoke the `main` method of `MyApplication` in order to create the [`ApplicationContext`][r1].
If the main method sets additional profiles then those will be active when the [`ApplicationContext`][r1] starts.

```kotlin
import org.junit.jupiter.api.Test
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.boot.test.context.SpringBootTest.UseMainMethod

@SpringBootTest(useMainMethod = UseMainMethod.ALWAYS)
class MyApplicationTests {

	@Test
	fun exampleTest() {
		// ...
	}

}
```

```java
import org.junit.jupiter.api.Test;

import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.SpringBootTest.UseMainMethod;

@SpringBootTest(useMainMethod = UseMainMethod.ALWAYS)
class MyApplicationTests {

	@Test
	void exampleTest() {
		// ...
	}

}
```

## Excluding Test Configuration

If your application uses component scanning (for example, if you use [`@SpringBootApplication`][r12] or [`@ComponentScan`][r16]), you may find top-level configuration classes that you created only for specific tests accidentally get picked up everywhere.

As we [have seen earlier][r5], [`@TestConfiguration`][r17] can be used on an inner class of a test to customize the primary configuration.
[`@TestConfiguration`][r17] can also be used on a top-level class. Doing so indicates that the class should not be picked up by scanning.
You can then import the class explicitly where it is required, as shown in the following example:

```kotlin
import org.junit.jupiter.api.Test
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.context.annotation.Import

@SpringBootTest
@Import(MyTestsConfiguration::class)
class MyTests {

	@Test
	fun exampleTest() {
		// ...
	}

}
```

```java
import org.junit.jupiter.api.Test;

import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;

@SpringBootTest
@Import(MyTestsConfiguration.class)
class MyTests {

	@Test
	void exampleTest() {
		// ...
	}

}
```

> [NOTE]
>
> If you directly use [`@ComponentScan`][r16] (that is, not through [`@SpringBootApplication`][r12]) you need to register the [`TypeExcludeFilter`][r21] with it.
> See the [`TypeExcludeFilter`][r21] API documentation for details.

> [NOTE]
>
> An imported [`@TestConfiguration`][r17] is processed earlier than an inner-class [`@TestConfiguration`][r17] and an imported [`@TestConfiguration`][r17] will be processed before any configuration found through component scanning.
> Generally speaking, this difference in ordering has no noticeable effect but it is something to be aware of if you’re relying on bean overriding.

## Using Application Arguments

If your application expects [arguments][r22], you can
have [`@SpringBootTest`][r3] inject them using the `args` attribute.

```kotlin
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.ApplicationArguments
import org.springframework.boot.test.context.SpringBootTest

@SpringBootTest(args = ["--app.test=one"])
class MyApplicationArgumentTests {

	@Test
	fun applicationArgumentsPopulated(@Autowired args: ApplicationArguments) {
		assertThat(args.optionNames).containsOnly("app.test")
		assertThat(args.getOptionValues("app.test")).containsOnly("one")
	}

}
```

```java
import org.junit.jupiter.api.Test;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.test.context.SpringBootTest;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(args = "--app.test=one")
class MyApplicationArgumentTests {

	@Test
	void applicationArgumentsPopulated(@Autowired ApplicationArguments args) {
		assertThat(args.getOptionNames()).containsOnly("app.test");
		assertThat(args.getOptionValues("app.test")).containsOnly("one");
	}

}
```

## Testing With a Mock Environment

By default, [`@SpringBootTest`][r3] does not start the server but instead sets up a mock environment for testing web endpoints.

With Spring MVC, we can query our web endpoints using [`MockMvc`][r23].
The following integrations are available:

- The regular [`MockMvc`][r24] that uses Hamcrest.
- [`MockMvcTester`][r25] that wraps [`MockMvc`][r26] and uses AssertJ.
- [`RestTestClient`][r27] where [`MockMvc`][r26] is plugged in as the server to handle requests with.
- [`WebTestClient`][r28] where [`MockMvc`][r26] is plugged in as the server to handle requests with.

The following example showcases the available integrations:

```kotlin
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.resttestclient.autoconfigure.AutoConfigureRestTestClient
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc
import org.springframework.boot.webtestclient.autoconfigure.AutoConfigureWebTestClient
import org.springframework.test.web.reactive.server.WebTestClient
import org.springframework.test.web.reactive.server.expectBody
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.assertj.MockMvcTester
import org.springframework.test.web.servlet.client.RestTestClient
import org.springframework.test.web.servlet.client.assertj.RestTestClientResponse
import org.springframework.test.web.servlet.client.expectBody
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.content
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status

@SpringBootTest
@AutoConfigureMockMvc
@AutoConfigureRestTestClient
@AutoConfigureWebTestClient
class MyMockMvcTests {

	@Test
	fun testWithMockMvc(@Autowired mvc: MockMvc) {
		mvc.perform(get("/"))
			.andExpect(status().isOk())
			.andExpect(content().string("Hello World"))
	}

	@Test // If AssertJ is on the classpath, you can use MockMvcTester
	fun testWithMockMvcTester(@Autowired mvc: MockMvcTester) {
		assertThat(mvc.get().uri("/")).hasStatusOk()
			.hasBodyTextEqualTo("Hello World")
	}

	@Test
	fun testWithRestTestClient(@Autowired webClient: RestTestClient) {
		webClient
			.get().uri("/")
			.exchange()
			.expectStatus().isOk
			.expectBody<String>().isEqualTo("Hello World")
	}

	@Test // If you prefer AssertJ, dedicated assertions are available
	fun testWithRestTestClientAssertJ(@Autowired webClient: RestTestClient) {
		val spec = webClient.get().uri("/").exchange()
		val response = RestTestClientResponse.from(spec)
		assertThat(response).hasStatusOk().bodyText().isEqualTo("Hello World")
	}

	@Test // If Spring WebFlux is on the classpath
	fun testWithWebTestClient(@Autowired webClient: WebTestClient) {
		webClient
			.get().uri("/")
			.exchange()
			.expectStatus().isOk
			.expectBody<String>().isEqualTo("Hello World")
	}

}
```

```java
import org.junit.jupiter.api.Test;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.resttestclient.autoconfigure.AutoConfigureRestTestClient;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.webtestclient.autoconfigure.AutoConfigureWebTestClient;
import org.springframework.test.web.reactive.server.WebTestClient;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.assertj.MockMvcTester;
import org.springframework.test.web.servlet.client.RestTestClient;
import org.springframework.test.web.servlet.client.RestTestClient.ResponseSpec;
import org.springframework.test.web.servlet.client.assertj.RestTestClientResponse;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@AutoConfigureRestTestClient
@AutoConfigureWebTestClient
class MyMockMvcTests {

	@Test
	void testWithMockMvc(@Autowired MockMvc mvc) throws Exception {
		mvc.perform(get("/"))
				.andExpect(status().isOk())
				.andExpect(content().string("Hello World"));
	}

	@Test // If AssertJ is on the classpath, you can use MockMvcTester
	void testWithMockMvcTester(@Autowired MockMvcTester mvc) {
		assertThat(mvc.get().uri("/"))
				.hasStatusOk()
				.hasBodyTextEqualTo("Hello World");
	}

	@Test
	void testWithRestTestClient(@Autowired RestTestClient restClient) {
		restClient
				.get().uri("/")
				.exchange()
				.expectStatus().isOk()
				.expectBody(String.class).isEqualTo("Hello World");
	}

	@Test // If you prefer AssertJ, dedicated assertions are available
	void testWithRestTestClientAssertJ(@Autowired RestTestClient restClient) {
		ResponseSpec spec = restClient.get().uri("/").exchange();
		RestTestClientResponse response = RestTestClientResponse.from(spec);
		assertThat(response).hasStatusOk()
				.bodyText().isEqualTo("Hello World");
	}

	@Test // If Spring WebFlux is on the classpath
	void testWithWebTestClient(@Autowired WebTestClient webClient) {
		webClient
				.get().uri("/")
				.exchange()
				.expectStatus().isOk()
				.expectBody(String.class).isEqualTo("Hello World");
	}

}
```

> [TIP]
>
> If you want to focus only on the web layer and not start a complete [`ApplicationContext`][r1], consider [using `@WebMvcTest` instead][r30].

With Spring WebFlux endpoints, you can use [`WebTestClient`][r28] as shown in the following example:

```kotlin
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.boot.webtestclient.autoconfigure.AutoConfigureWebTestClient
import org.springframework.test.web.reactive.server.WebTestClient
import org.springframework.test.web.reactive.server.expectBody

@SpringBootTest
@AutoConfigureWebTestClient
class MyMockWebTestClientTests {

	@Test
	fun exampleTest(@Autowired webClient: WebTestClient) {
		webClient
			.get().uri("/")
			.exchange()
			.expectStatus().isOk
			.expectBody<String>().isEqualTo("Hello World")
	}

}
```

```java
import org.junit.jupiter.api.Test;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webtestclient.autoconfigure.AutoConfigureWebTestClient;
import org.springframework.test.web.reactive.server.WebTestClient;

@SpringBootTest
@AutoConfigureWebTestClient
class MyMockWebTestClientTests {

	@Test
	void exampleTest(@Autowired WebTestClient webClient) {
		webClient
			.get().uri("/")
			.exchange()
			.expectStatus().isOk()
			.expectBody(String.class).isEqualTo("Hello World");
	}

}
```

> [TIP]
>
> Testing within a mocked environment is usually faster than running with a full servlet container.
> However, since mocking occurs at the Spring MVC layer, code that relies on lower-level servlet container behavior cannot be directly tested with MockMvc.
>
> For example, Spring Boot’s error handling is based on the “error page” support provided by the servlet container.
> This means that, whilst you can test your MVC layer throws and handles exceptions as expected, you cannot directly test that a specific [custom error page][r31] is rendered.
> If you need to test these lower-level concerns, you can start a fully running server as described in the next section.

## Testing With a Running Server

If you need to start a full running server, we recommend that you use random ports.
If you use `@SpringBootTest(webEnvironment=WebEnvironment.RANDOM_PORT)`, an available port is picked at random each time your test runs.

The [`@LocalServerPort`][r32] annotation can be used to [inject the actual port used][r33] into your test.

Tests that need to make REST calls to the started server can autowire a
[`RestTestClient`][r27] by annotating the test class with [`@AutoConfigureRestTestClient`][r34].

The configured client resolves relative links to the running server and comes with a dedicated API for verifying responses, as shown in the following example:

```kotlin
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.resttestclient.autoconfigure.AutoConfigureRestTestClient
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.boot.test.context.SpringBootTest.WebEnvironment
import org.springframework.test.web.servlet.client.RestTestClient
import org.springframework.test.web.servlet.client.expectBody

@SpringBootTest(webEnvironment = WebEnvironment.RANDOM_PORT)
@AutoConfigureRestTestClient
class MyRandomPortRestTestClientTests {

	@Test
	fun exampleTest(@Autowired webClient: RestTestClient) {
		webClient
			.get().uri("/")
			.exchange()
			.expectStatus().isOk
			.expectBody<String>().isEqualTo("Hello World")
	}

}
```

```java
import org.junit.jupiter.api.Test;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.resttestclient.autoconfigure.AutoConfigureRestTestClient;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.SpringBootTest.WebEnvironment;
import org.springframework.test.web.servlet.client.RestTestClient;

@SpringBootTest(webEnvironment = WebEnvironment.RANDOM_PORT)
@AutoConfigureRestTestClient
class MyRandomPortRestTestClientTests {

	@Test
	void exampleTest(@Autowired RestTestClient restClient) {
		restClient
			.get().uri("/")
			.exchange()
			.expectStatus().isOk()
			.expectBody(String.class).isEqualTo("Hello World");
	}

}
```

If you prefer to use AssertJ, dedicated assertions are available from [`RestTestClientResponse`][r35], as shown in the following example:

```kotlin
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.resttestclient.autoconfigure.AutoConfigureRestTestClient
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.boot.test.context.SpringBootTest.WebEnvironment
import org.springframework.test.web.servlet.client.RestTestClient
import org.springframework.test.web.servlet.client.assertj.RestTestClientResponse

@SpringBootTest(webEnvironment = WebEnvironment.RANDOM_PORT)
@AutoConfigureRestTestClient
class MyRandomPortRestTestClientAssertJTests {

	@Test
	fun exampleTest(@Autowired webClient: RestTestClient) {
		val exchange = webClient.get().uri("/").exchange()
		val response = RestTestClientResponse.from(exchange)
		assertThat(response).hasStatusOk()
			.bodyText().isEqualTo("Hello World")
	}

}
```

```java
import org.junit.jupiter.api.Test;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.resttestclient.autoconfigure.AutoConfigureRestTestClient;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.SpringBootTest.WebEnvironment;
import org.springframework.test.web.servlet.client.RestTestClient;
import org.springframework.test.web.servlet.client.RestTestClient.ResponseSpec;
import org.springframework.test.web.servlet.client.assertj.RestTestClientResponse;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(webEnvironment = WebEnvironment.RANDOM_PORT)
@AutoConfigureRestTestClient
class MyRandomPortRestTestClientAssertJTests {

	@Test
	void exampleTest(@Autowired RestTestClient restClient) {
		ResponseSpec spec = restClient.get().uri("/").exchange();
		RestTestClientResponse response = RestTestClientResponse.from(spec);
		assertThat(response).hasStatusOk().bodyText().isEqualTo("Hello World");
	}

}
```

If you have `spring-webflux` on the classpath, you can also autowire a [`WebTestClient`][r28] by annotating the test class with [`@AutoConfigureWebTestClient`][r8].

`WebTestClient` provides a similar API, as shown in the following example:

```kotlin
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.boot.test.context.SpringBootTest.WebEnvironment
import org.springframework.boot.webtestclient.autoconfigure.AutoConfigureWebTestClient
import org.springframework.test.web.reactive.server.WebTestClient
import org.springframework.test.web.reactive.server.expectBody

@SpringBootTest(webEnvironment = WebEnvironment.RANDOM_PORT)
@AutoConfigureWebTestClient
class MyRandomPortWebTestClientTests {

	@Test
	fun exampleTest(@Autowired webClient: WebTestClient) {
		webClient
			.get().uri("/")
			.exchange()
			.expectStatus().isOk
			.expectBody<String>().isEqualTo("Hello World")
	}

}
```

```java
import org.junit.jupiter.api.Test;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.SpringBootTest.WebEnvironment;
import org.springframework.boot.webtestclient.autoconfigure.AutoConfigureWebTestClient;
import org.springframework.test.web.reactive.server.WebTestClient;

@SpringBootTest(webEnvironment = WebEnvironment.RANDOM_PORT)
@AutoConfigureWebTestClient
class MyRandomPortWebTestClientTests {

	@Test
	void exampleTest(@Autowired WebTestClient webClient) {
		webClient
			.get().uri("/")
			.exchange()
			.expectStatus().isOk()
			.expectBody(String.class).isEqualTo("Hello World");
	}

}
```

> [TIP]
>
> [`WebTestClient`][r36] can also be used with a [mock environment][r7], removing the need for a running server, by annotating your test class with [`@AutoConfigureWebTestClient`][r8] from `spring-boot-webflux-test`.

> [NOTE]
>
> For certain [sliced tests][r6] you may need to use the [`@AutoConfigureWebServer`][r37] annotation to auto-configure an embedded web server.

The `spring-boot-resttestclient` module also provides a [`TestRestTemplate`][r38] facility:

```kotlin
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.boot.test.context.SpringBootTest.WebEnvironment
import org.springframework.boot.resttestclient.TestRestTemplate
import org.springframework.boot.resttestclient.autoconfigure.AutoConfigureTestRestTemplate

@SpringBootTest(webEnvironment = WebEnvironment.RANDOM_PORT)
@AutoConfigureTestRestTemplate
class MyRandomPortTestRestTemplateTests {

	@Test
	fun exampleTest(@Autowired restTemplate: TestRestTemplate) {
		val body = restTemplate.getForObject("/", String::class.java)
		assertThat(body).isEqualTo("Hello World")
	}

}
```

```java
import org.junit.jupiter.api.Test;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.resttestclient.TestRestTemplate;
import org.springframework.boot.resttestclient.autoconfigure.AutoConfigureTestRestTemplate;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.SpringBootTest.WebEnvironment;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(webEnvironment = WebEnvironment.RANDOM_PORT)
@AutoConfigureTestRestTemplate
class MyRandomPortTestRestTemplateTests {

	@Test
	void exampleTest(@Autowired TestRestTemplate restTemplate) {
		String body = restTemplate.getForObject("/", String.class);
		assertThat(body).isEqualTo("Hello World");
	}

}
```

To use `TestRestTemplate` a dependency on `spring-boot-restclient` is also required.
Take care when adding this dependency as it will enable auto-configuration for `RestClient.Builder`.
If your main code uses `RestClient.Builder`, declare the `spring-boot-restclient` dependency so that it is on your application’s main classpath and not only on its test classpath.

## Customizing RestTestClient

To customize the [`RestTestClient`][r39] bean, configure a [`RestTestClientBuilderCustomizer`][r40] bean.
Any such beans are called with the [`RestTestClient.Builder`][r41] that is used to create the [`RestTestClient`][r39].

## Customizing WebTestClient

To customize the [`WebTestClient`][r36] bean, configure a [`WebTestClientBuilderCustomizer`][r42] bean.
Any such beans are called with the [`WebTestClient.Builder`][r43] that is used to create the [`WebTestClient`][r36].

## Using JMX

As the test context framework caches context, JMX is disabled by default to prevent identical components to register on the same domain.
If such test needs access to an [`MBeanServer`][r44], consider marking it dirty as well:

```kotlin
import javax.management.MBeanServer

import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.test.annotation.DirtiesContext

@SpringBootTest(properties = ["spring.jmx.enabled=true"])
@DirtiesContext
class MyJmxTests(@Autowired val mBeanServer: MBeanServer) {

	@Test
	fun exampleTest() {
		assertThat(mBeanServer.domains).contains("java.lang")
		// ...
	}

}
```

```java
import javax.management.MBeanServer;

import org.junit.jupiter.api.Test;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.annotation.DirtiesContext;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(properties = "spring.jmx.enabled=true")
@DirtiesContext
class MyJmxTests {

	@Autowired
	private MBeanServer mBeanServer;

	@Test
	void exampleTest() {
		assertThat(this.mBeanServer.getDomains()).contains("java.lang");
		// ...
	}

}
```

## Using Observations

If you annotate [a sliced test][r6] with [`@AutoConfigureTracing`][r45] from `spring-boot-micrometer-tracing-test` or with [`@AutoConfigureMetrics`][r46] from `spring-boot-micrometer-metrics-test`, it auto-configures an [`ObservationRegistry`][r47].

## Using Metrics

Regardless of your classpath, meter registries, except the in-memory backed, are not auto-configured when using [`@SpringBootTest`][r3].

If you need to export metrics to a different backend as part of an integration test, annotate it with [`@AutoConfigureMetrics`][r46].

If you annotate [a sliced test][r6] with [`@AutoConfigureMetrics`][r46], it auto-configures an in-memory [`MeterRegistry`][r48].
Data exporting in sliced tests is not supported with the [`@AutoConfigureMetrics`][r46] annotation.

## Using Tracing

Regardless of your classpath, tracing components which are reporting data are not auto-configured when using [`@SpringBootTest`][r3].

If you need those components as part of an integration test, annotate the test with [`@AutoConfigureTracing`][r45].

If you have created your own reporting components (e.g. a custom [`SpanExporter`][r49] or `brave.handler.SpanHandler`) and you don’t want them to be active in tests, you can use the [`@ConditionalOnEnabledTracingExport`][r50] annotation to disable them.

If you annotate [a sliced test][r6] with [`@AutoConfigureTracing`][r45] , it auto-configures a no-op [`Tracer`][r51].
Data exporting in sliced tests is not supported with the [`@AutoConfigureTracing`][r45] annotation.

## Mocking and Spying Beans

When running tests, it is sometimes necessary to mock certain components within your application context.
For example, you may have a facade over some remote service that is unavailable during development.
Mocking can also be useful when you want to simulate failures that might be hard to trigger in a real environment.

Spring Framework includes a [`@MockitoBean`][r52] annotation that can be used to define a Mockito mock for a bean inside your [`ApplicationContext`][r1].
Additionally, [`@MockitoSpyBean`][r53] can be used to define a Mockito spy.
Learn more about these features in the [Spring Framework documentation][r54].

## Auto-configured Tests

Spring Boot’s auto-configuration system works well for applications but can sometimes be a little too much for tests.
It often helps to load only the parts of the configuration that are required to test a “slice” of your application.
For example, you might want to test that Spring MVC controllers are mapping URLs correctly, and you do not want to involve database calls in those tests, or you might want to test JPA entities, and you are not interested in the web layer when those tests run.

When combined with `spring-boot-test-autoconfigure`, Spring Boot’s [test modules][r55] include a number of annotations that can be used to automatically configure such “slices”.
Each of them works in a similar way, providing a `@…​Test` annotation that loads the [`ApplicationContext`][r1] and one or more `@AutoConfigure…​` annotations that can be used to customize auto-configuration settings.

> [NOTE]
>
> Each slice restricts component scan to appropriate components and loads a very restricted set of auto-configuration classes.
> If you need to exclude one of them, most `@…​Test` annotations provide an `excludeAutoConfiguration` attribute.
> Alternatively, you can use `@ImportAutoConfiguration#exclude`.

> [NOTE]
>
> Including multiple “slices” by using several `@…​Test` annotations in one test is not supported.
> If you need multiple “slices”, pick one of the `@…​Test` annotations and include the `@AutoConfigure…​` annotations of the other “slices” by hand.

> [TIP]
>
> It is also possible to use the `@AutoConfigure…​` annotations with the standard [`@SpringBootTest`][r3] annotation.
> You can use this combination if you are not interested in “slicing” your application but you want some of the auto-configured test beans.

## Auto-configured JSON Tests

To test that object JSON serialization and deserialization is working as expected, you can use the [`@JsonTest`][r56] annotation from the `spring-boot-test-autoconfigure` module.
[`@JsonTest`][r56] auto-configures the available supported JSON mapper, which can be one of the following libraries:

- Jackson [`JsonMapper`][r57], any [`@JacksonComponent`][r58] beans and any Jackson [`JacksonModule`][r59]
- Jackson 2 (deprecated) [`ObjectMapper`][r60], any [`@JsonComponent`][r61] beans and any Jackson [`Module`][r62]
- `Gson`
- `Jsonb`

> [TIP]
>
> A list of the auto-configurations that are enabled by [`@JsonTest`][r56] can be [found in the appendix][r63].

If you need to configure elements of the auto-configuration, you can use the [`@AutoConfigureJsonTesters`][r64] annotation.

Spring Boot includes AssertJ-based helpers that work with the JSONAssert and JsonPath libraries to check that JSON appears as expected.
The [`JacksonTester`][r65], [`GsonTester`][r66], [`JsonbTester`][r67], and [`BasicJsonTester`][r68] classes can be used for Jackson, Gson, Jsonb, and Strings respectively.
Any helper fields on the test class can be [`@Autowired`][r69] when using [`@JsonTest`][r56].
The following example shows a test class for Jackson:

```kotlin
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.json.JsonTest
import org.springframework.boot.test.json.JacksonTester

@JsonTest
class MyJsonTests(@Autowired val json: JacksonTester<VehicleDetails>) {

	@Test
	fun serialize() {
		val details = VehicleDetails("Honda", "Civic")
		// Assert against a `.json` file in the same package as the test
		assertThat(json.write(details)).isEqualToJson("expected.json")
		// Or use JSON path based assertions
		assertThat(json.write(details)).hasJsonPathStringValue("@.make")
		assertThat(json.write(details)).extractingJsonPathStringValue("@.make").isEqualTo("Honda")
	}

	@Test
	fun deserialize() {
		val content = "{\"make\":\"Ford\",\"model\":\"Focus\"}"
		assertThat(json.parse(content)).isEqualTo(VehicleDetails("Ford", "Focus"))
		assertThat(json.parseObject(content).make).isEqualTo("Ford")
	}

}
```

```java
import org.junit.jupiter.api.Test;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.json.JsonTest;
import org.springframework.boot.test.json.JacksonTester;

import static org.assertj.core.api.Assertions.assertThat;

@JsonTest
class MyJsonTests {

	@Autowired
	private JacksonTester<VehicleDetails> json;

	@Test
	void serialize() throws Exception {
		VehicleDetails details = new VehicleDetails("Honda", "Civic");
		// Assert against a `.json` file in the same package as the test
		assertThat(this.json.write(details)).isEqualToJson("expected.json");
		// Or use JSON path based assertions
		assertThat(this.json.write(details)).hasJsonPathStringValue("@.make");
		assertThat(this.json.write(details)).extractingJsonPathStringValue("@.make").isEqualTo("Honda");
	}

	@Test
	void deserialize() throws Exception {
		String content = "{\"make\":\"Ford\",\"model\":\"Focus\"}";
		assertThat(this.json.parse(content)).isEqualTo(new VehicleDetails("Ford", "Focus"));
		assertThat(this.json.parseObject(content).getMake()).isEqualTo("Ford");
	}

}
```

> [NOTE]
>
> JSON helper classes can also be used directly in standard unit tests.
> To do so, call the `initFields` method of the helper in your [`@BeforeEach`][r70] method if you do not use [`@JsonTest`][r56].

If you use Spring Boot’s AssertJ-based helpers to assert on a number value at a given JSON path, you might not be able to use `isEqualTo` depending on the type.
Instead, you can use AssertJ’s `satisfies` to assert that the value matches the given condition.
For instance, the following example asserts that the actual number is a float value close to `0.15` within an offset of `0.01`.

```kotlin
	@Test
	fun someTest() {
		val value = SomeObject(0.152f)
		assertThat(json.write(value)).extractingJsonPathNumberValue("@.test.numberValue")
			.satisfies(ThrowingConsumer { number ->
				assertThat(number.toFloat()).isCloseTo(0.15f, within(0.01f))
			})
	}
```

```java
	@Test
	void someTest() throws Exception {
		SomeObject value = new SomeObject(0.152f);
		assertThat(this.json.write(value)).extractingJsonPathNumberValue("@.test.numberValue")
			.satisfies((number) -> assertThat(number.floatValue()).isCloseTo(0.15f, within(0.01f)));
	}
```

## Auto-configured Spring MVC Tests

To test whether Spring MVC controllers are working as expected, use the [`@WebMvcTest`][r29] annotation from the `spring-boot-webmvc-test` module.
[`@WebMvcTest`][r29] auto-configures the Spring MVC infrastructure and limits scanned beans to [`@Controller`][r71], [`@ControllerAdvice`][r72], [`@JacksonComponent`][r58], [`@JsonComponent`][r61] (deprecated), [`Converter`][r73], [`GenericConverter`][r74], [`Filter`][r75], [`HandlerInterceptor`][r76], [`WebMvcConfigurer`][r77], [`WebMvcRegistrations`][r78], and [`HandlerMethodArgumentResolver`][r79].
Regular [`@Component`][r80] and [`@ConfigurationProperties`][r81] beans are not scanned when the [`@WebMvcTest`][r29] annotation is used.
[`@EnableConfigurationProperties`][r82] can be used to include [`@ConfigurationProperties`][r81] beans.

> [TIP]
>
> A list of the auto-configuration settings that are enabled by [`@WebMvcTest`][r29] can be [found in the appendix][r63].

> [TIP]
>
> If you need to register extra components, such as a [`JacksonModule`][r59], you can import additional configuration classes by using [`@Import`][r83] on your test.

Often, [`@WebMvcTest`][r29] is limited to a single controller and is used in combination with [`@MockitoBean`][r52] to provide mock implementations for required collaborators.

[`@WebMvcTest`][r29] also auto-configures [`MockMvc`][r26].
Mock MVC offers a powerful way to quickly test MVC controllers without needing to start a full HTTP server.
If AssertJ is available, the AssertJ support provided by [`MockMvcTester`][r84] is auto-configured as well.
If you’d like to use [`RestTestClient`][r39] in your tests, annotate your test class with [`@AutoConfigureRestTestClient`][r34].
A `RestTestClient` that uses the Mock MVC infrastructure will then be auto-configured.

> [TIP]
>
> You can also auto-configure [`MockMvc`][r26] and [`MockMvcTester`][r84] in a non-`@WebMvcTest` (such as [`@SpringBootTest`][r3]) by annotating it with [`@AutoConfigureMockMvc`][r85].
> The following example uses [`MockMvcTester`][r84]:

```kotlin
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.mockito.BDDMockito.given
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest
import org.springframework.http.MediaType
import org.springframework.test.context.bean.override.mockito.MockitoBean
import org.springframework.test.web.servlet.assertj.MockMvcTester

@WebMvcTest(UserVehicleController::class)
class MyControllerTests(@Autowired val mvc: MockMvcTester) {

	@MockitoBean
	lateinit var userVehicleService: UserVehicleService

	@Test
	fun testExample() {
		given(userVehicleService.getVehicleDetails("sboot"))
				.willReturn(VehicleDetails("Honda", "Civic"))
		assertThat(mvc.get().uri("/sboot/vehicle").accept(MediaType.TEXT_PLAIN))
				.hasStatusOk().hasBodyTextEqualTo("Honda Civic")
	}

}
```

```java
import org.junit.jupiter.api.Test;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.assertj.MockMvcTester;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.BDDMockito.given;

@WebMvcTest(UserVehicleController.class)
class MyControllerTests {

	@Autowired
	private MockMvcTester mvc;

	@MockitoBean
	private UserVehicleService userVehicleService;

	@Test
	void testExample() {
		given(this.userVehicleService.getVehicleDetails("sboot"))
			.willReturn(new VehicleDetails("Honda", "Civic"));
		assertThat(this.mvc.get().uri("/sboot/vehicle").accept(MediaType.TEXT_PLAIN))
			.hasStatusOk()
			.hasBodyTextEqualTo("Honda Civic");
	}

}
```

> [TIP]
>
> If you need to configure elements of the auto-configuration (for example, when servlet filters should be applied) you can use attributes in the [`@AutoConfigureMockMvc`][r85] annotation.

If you use HtmlUnit and Selenium, auto-configuration also provides an HtmlUnit [`WebClient`][r86] bean and/or a Selenium [`WebDriver`][r87] bean.
The following example uses HtmlUnit:

```kotlin
import org.assertj.core.api.Assertions.assertThat
import org.htmlunit.WebClient
import org.htmlunit.html.HtmlPage
import org.junit.jupiter.api.Test
import org.mockito.BDDMockito.given
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest
import org.springframework.test.context.bean.override.mockito.MockitoBean

@WebMvcTest(UserVehicleController::class)
class MyHtmlUnitTests(@Autowired val webClient: WebClient) {

	@MockitoBean
	lateinit var userVehicleService: UserVehicleService

	@Test
	fun testExample() {
		given(userVehicleService.getVehicleDetails("sboot")).willReturn(VehicleDetails("Honda", "Civic"))
		val page = webClient.getPage<HtmlPage>("/sboot/vehicle.html")
		assertThat(page.body.textContent).isEqualTo("Honda Civic")
	}

}
```

```java
import org.htmlunit.WebClient;
import org.htmlunit.html.HtmlPage;
import org.junit.jupiter.api.Test;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.BDDMockito.given;

@WebMvcTest(UserVehicleController.class)
class MyHtmlUnitTests {

	@Autowired
	private WebClient webClient;

	@MockitoBean
	private UserVehicleService userVehicleService;

	@Test
	void testExample() throws Exception {
		given(this.userVehicleService.getVehicleDetails("sboot")).willReturn(new VehicleDetails("Honda", "Civic"));
		HtmlPage page = this.webClient.getPage("/sboot/vehicle.html");
		assertThat(page.getBody().getTextContent()).isEqualTo("Honda Civic");
	}

}
```

> [NOTE]
>
> By default, Spring Boot puts [`WebDriver`][r87] beans in a special “scope” to ensure that the driver exits after each test and that a new instance is injected.
> If you do not want this behavior, you can add `@Scope(ConfigurableBeanFactory.SCOPE_SINGLETON)` to your [`WebDriver`][r87] [`@Bean`][r88] definition.

> [WARNING]
>
> The `webDriver` scope created by Spring Boot will replace any user defined scope of the same name.
> If you define your own `webDriver` scope you may find it stops working when you use [`@WebMvcTest`][r29].

If you have Spring Security on the classpath, [`@WebMvcTest`][r29] will also scan [`WebSecurityConfigurer`][r89] beans.
Instead of disabling security completely for such tests, you can use Spring Security’s test support.
More details on how to use Spring Security’s [`MockMvc`][r26] support can be found in this [Testing With Spring Security][r90] “How-to Guides” section.

> [TIP]
>
> Sometimes writing Spring MVC tests is not enough; Spring Boot can help you run [full end-to-end tests with an actual server][r91].

## Auto-configured Spring WebFlux Tests

To test that [Spring WebFlux][r92] controllers are working as expected, you can use the [`@WebFluxTest`][r93] annotation from the `spring-boot-webflux-test` module.
[`@WebFluxTest`][r93] auto-configures the Spring WebFlux infrastructure and limits scanned beans to [`@Controller`][r71], [`@ControllerAdvice`][r72], [`@JacksonComponent`][r58], [`@JsonComponent`][r61] (deprecated), [`Converter`][r73], [`GenericConverter`][r74] and [`WebFluxConfigurer`][r94].
Regular [`@Component`][r80] and [`@ConfigurationProperties`][r81] beans are not scanned when the [`@WebFluxTest`][r93] annotation is used.
[`@EnableConfigurationProperties`][r82] can be used to include [`@ConfigurationProperties`][r81] beans.

> [TIP]
>
> A list of the auto-configurations that are enabled by [`@WebFluxTest`][r93] can be [found in the appendix][r63].

> [TIP]
>
> If you need to register extra components, such as a [`JacksonModule`][r59], you can import additional configuration classes using [`@Import`][r83] on your test.

Often, [`@WebFluxTest`][r93] is limited to a single controller and used in combination with the [`@MockitoBean`][r52] annotation to provide mock implementations for required collaborators.

[`@WebFluxTest`][r93] also auto-configures [`WebTestClient`][r28], which offers a powerful way to quickly test WebFlux controllers without needing to start a full HTTP server.

> [TIP]
>
> You can also auto-configure [`WebTestClient`][r36] in a non-`@WebFluxTest` (such as [`@SpringBootTest`][r3]) by annotating it with [`@AutoConfigureWebTestClient`][r8].

The following example shows a class that uses both [`@WebFluxTest`][r93] and a [`WebTestClient`][r36]:

```kotlin
import org.junit.jupiter.api.Test
import org.mockito.BDDMockito.given
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.webflux.test.autoconfigure.WebFluxTest
import org.springframework.http.MediaType
import org.springframework.test.context.bean.override.mockito.MockitoBean
import org.springframework.test.web.reactive.server.WebTestClient
import org.springframework.test.web.reactive.server.expectBody

@WebFluxTest(UserVehicleController::class)
class MyControllerTests(@Autowired val webClient: WebTestClient) {

	@MockitoBean
	lateinit var userVehicleService: UserVehicleService

	@Test
	fun testExample() {
		given(userVehicleService.getVehicleDetails("sboot"))
			.willReturn(VehicleDetails("Honda", "Civic"))
		webClient.get().uri("/sboot/vehicle").accept(MediaType.TEXT_PLAIN).exchange()
			.expectStatus().isOk
			.expectBody<String>().isEqualTo("Honda Civic")
	}

}
```

```java
import org.junit.jupiter.api.Test;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webflux.test.autoconfigure.WebFluxTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.reactive.server.WebTestClient;

import static org.mockito.BDDMockito.given;

@WebFluxTest(UserVehicleController.class)
class MyControllerTests {

	@Autowired
	private WebTestClient webClient;

	@MockitoBean
	private UserVehicleService userVehicleService;

	@Test
	void testExample() {
		given(this.userVehicleService.getVehicleDetails("sboot"))
			.willReturn(new VehicleDetails("Honda", "Civic"));
		this.webClient.get().uri("/sboot/vehicle").accept(MediaType.TEXT_PLAIN).exchange()
			.expectStatus().isOk()
			.expectBody(String.class).isEqualTo("Honda Civic");
	}

}
```

> [TIP]
>
> This setup is only supported by WebFlux applications as using [`WebTestClient`][r36] in a mocked web application only works with WebFlux at the moment.

> [NOTE]
>
> [`@WebFluxTest`][r93] cannot detect routes registered through the functional web framework.
> For testing [`RouterFunction`][r95] beans in the context, consider importing your [`RouterFunction`][r95] yourself by using [`@Import`][r83] or by using [`@SpringBootTest`][r3].

> [NOTE]
>
> [`@WebFluxTest`][r93] cannot detect custom security configuration registered as a [`@Bean`][r88] of type [`SecurityWebFilterChain`][r96].
> To include that in your test, you will need to import the configuration that registers the bean by using [`@Import`][r83] or by using [`@SpringBootTest`][r3].

> [TIP]
>
> Sometimes writing Spring WebFlux tests is not enough; Spring Boot can help you run [full end-to-end tests with an actual server][r91].

## Auto-configured Spring GraphQL Tests

Spring GraphQL offers a dedicated testing support module; you’ll need to add it to your project:

Maven

```xml
<dependencies>
	<dependency>
		<groupId>org.springframework.graphql</groupId>
		<artifactId>spring-graphql-test</artifactId>
		<scope>test</scope>
	</dependency>
	<!-- Unless already present in the compile scope -->
	<dependency>
		<groupId>org.springframework.boot</groupId>
		<artifactId>spring-boot-starter-webflux</artifactId>
		<scope>test</scope>
	</dependency>
</dependencies>
```

Gradle

```gradle
dependencies {
	testImplementation("org.springframework.graphql:spring-graphql-test")
	// Unless already present in the implementation configuration
	testImplementation("org.springframework.boot:spring-boot-starter-webflux")
}
```

This testing module ships the [GraphQlTester][r97].
The tester is heavily used in test, so be sure to become familiar with using it.
There are [`GraphQlTester`][r98] variants and Spring Boot will auto-configure them depending on the type of tests:

- the [`ExecutionGraphQlServiceTester`][r99] performs tests on the server side, without a client nor a transport
- the [`HttpGraphQlTester`][r100] performs tests with a client that connects to a server, with or without a live server

Spring Boot helps you to test your [Spring GraphQL Controllers][r101] with the [`@GraphQlTest`][r102] annotation from the `spring-boot-graphql-test` module.
[`@GraphQlTest`][r102] auto-configures the Spring GraphQL infrastructure, without any transport nor server being involved.
This limits scanned beans to [`@Controller`][r71], [`@ControllerAdvice`][r72], [`RuntimeWiringConfigurer`][r103], [`JacksonComponent`][r58], [`@JsonComponent`][r61] (deprecated), [`Converter`][r73], [`GenericConverter`][r74], [`DataFetcherExceptionResolver`][r104], [`Instrumentation`][r105] and [`GraphQlSourceBuilderCustomizer`][r106].
Regular [`@Component`][r80] and [`@ConfigurationProperties`][r81] beans are not scanned when the [`@GraphQlTest`][r102] annotation is used.
[`@EnableConfigurationProperties`][r82] can be used to include [`@ConfigurationProperties`][r81] beans.

> [TIP]
>
> A list of the auto-configurations that are enabled by [`@GraphQlTest`][r102] can be [found in the appendix][r63].

Often, [`@GraphQlTest`][r102] is limited to a set of controllers and used in combination with the [`@MockitoBean`][r52] annotation to provide mock implementations for required collaborators.

```kotlin
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.docs.web.graphql.runtimewiring.GreetingController
import org.springframework.boot.graphql.test.autoconfigure.GraphQlTest
import org.springframework.graphql.test.tester.GraphQlTester

@GraphQlTest(GreetingController::class)
internal class GreetingControllerTests {

	@Autowired
	lateinit var graphQlTester: GraphQlTester

	@Test
	fun shouldGreetWithSpecificName() {
		graphQlTester.document("{ greeting(name: \"Alice\") } ").execute().path("greeting").entity(String::class.java)
				.isEqualTo("Hello, Alice!")
	}

	@Test
	fun shouldGreetWithDefaultName() {
		graphQlTester.document("{ greeting } ").execute().path("greeting").entity(String::class.java)
				.isEqualTo("Hello, Spring!")
	}

}
```

```java
import org.junit.jupiter.api.Test;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.docs.web.graphql.runtimewiring.GreetingController;
import org.springframework.boot.graphql.test.autoconfigure.GraphQlTest;
import org.springframework.graphql.test.tester.GraphQlTester;

@GraphQlTest(GreetingController.class)
class GreetingControllerTests {

	@Autowired
	private GraphQlTester graphQlTester;

	@Test
	void shouldGreetWithSpecificName() {
		this.graphQlTester.document("{ greeting(name: \"Alice\") } ")
			.execute()
			.path("greeting")
			.entity(String.class)
			.isEqualTo("Hello, Alice!");
	}

	@Test
	void shouldGreetWithDefaultName() {
		this.graphQlTester.document("{ greeting } ")
			.execute()
			.path("greeting")
			.entity(String.class)
			.isEqualTo("Hello, Spring!");
	}

}
```

[`@SpringBootTest`][r3] tests are full integration tests and involve the entire application.
A [`HttpGraphQlTester`][r100] bean can be added by annotating your test class with [`@AutoConfigureHttpGraphQlTester`][r107] from the `spring-boot-graphql-test` module:

```kotlin
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.graphql.test.autoconfigure.tester.AutoConfigureHttpGraphQlTester
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.boot.test.context.SpringBootTest.WebEnvironment
import org.springframework.graphql.test.tester.HttpGraphQlTester
import org.springframework.http.HttpHeaders
import org.springframework.test.web.reactive.server.WebTestClient

@SpringBootTest(webEnvironment = WebEnvironment.RANDOM_PORT)
@AutoConfigureHttpGraphQlTester
class GraphQlIntegrationTests {

	@Test
	fun shouldGreetWithSpecificName(@Autowired graphQlTester: HttpGraphQlTester) {
		val authenticatedTester = graphQlTester.mutate()
			.webTestClient { client: WebTestClient.Builder ->
				client.defaultHeaders { headers: HttpHeaders ->
					headers.setBasicAuth("admin", "ilovespring")
				}
			}.build()
		authenticatedTester.document("{ greeting(name: \"Alice\") } ").execute()
			.path("greeting").entity(String::class.java).isEqualTo("Hello, Alice!")
	}
}
```

```java
import org.junit.jupiter.api.Test;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.graphql.test.autoconfigure.tester.AutoConfigureHttpGraphQlTester;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.SpringBootTest.WebEnvironment;
import org.springframework.graphql.test.tester.HttpGraphQlTester;

@SpringBootTest(webEnvironment = WebEnvironment.RANDOM_PORT)
@AutoConfigureHttpGraphQlTester
class GraphQlIntegrationTests {

	@Test
	void shouldGreetWithSpecificName(@Autowired HttpGraphQlTester graphQlTester) {
		HttpGraphQlTester authenticatedTester = graphQlTester.mutate()
			.webTestClient((client) -> client.defaultHeaders((headers) -> headers.setBasicAuth("admin", "ilovespring")))
			.build();
		authenticatedTester.document("{ greeting(name: \"Alice\") } ")
			.execute()
			.path("greeting")
			.entity(String.class)
			.isEqualTo("Hello, Alice!");
	}

}
```

The [`HttpGraphQlTester`][r100] bean uses the relevant transport of the integration test.
When using a random or defined port, the tester is configured against the live server.
To bind the tester to `MockMvc`, make sure to annotate your test class with [`@AutoConfigureMockMvc`][r85].

## Auto-configured Data Cassandra Tests

You can use [`@DataCassandraTest`][r108] from the `spring-boot-data-cassandra-test` module to test Data Cassandra applications.
By default, it configures a [`CassandraTemplate`][r109], scans for [`@Table`][r110] classes, and configures Spring Data Cassandra repositories.
Regular [`@Component`][r80] and [`@ConfigurationProperties`][r81] beans are not scanned when the [`@DataCassandraTest`][r108] annotation is used.
[`@EnableConfigurationProperties`][r82] can be used to include [`@ConfigurationProperties`][r81] beans.
(For more about using Cassandra with Spring Boot, see [Cassandra][r111].)

> [TIP]
>
> A list of the auto-configuration settings that are enabled by [`@DataCassandraTest`][r108] can be [found in the appendix][r63].

The following example shows a typical setup for using Cassandra tests in Spring Boot:

```kotlin
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.data.cassandra.test.autoconfigure.DataCassandraTest

@DataCassandraTest
class MyDataCassandraTests(@Autowired val repository: SomeRepository)
```

```java
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.cassandra.test.autoconfigure.DataCassandraTest;

@DataCassandraTest
class MyDataCassandraTests {

	@Autowired
	private SomeRepository repository;

}
```

## Auto-configured Data Couchbase Tests

You can use [`@DataCouchbaseTest`][r112] from the `spring-boot-data-couchbase-test` module to test Data Couchbase applications.
By default, it configures a [`CouchbaseTemplate`][r113] or [`ReactiveCouchbaseTemplate`][r114], scans for [`@Document`][r115] classes, and configures Spring Data Couchbase repositories.
Regular [`@Component`][r80] and [`@ConfigurationProperties`][r81] beans are not scanned when the [`@DataCouchbaseTest`][r112] annotation is used.
[`@EnableConfigurationProperties`][r82] can be used to include [`@ConfigurationProperties`][r81] beans.
(For more about using Couchbase with Spring Boot, see [Couchbase][r116], earlier in this chapter.)

> [TIP]
>
> A list of the auto-configuration settings that are enabled by [`@DataCouchbaseTest`][r112] can be [found in the appendix][r63].

The following example shows a typical setup for using Couchbase tests in Spring Boot:

```kotlin
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.data.couchbase.test.autoconfigure.DataCouchbaseTest

@DataCouchbaseTest
class MyDataCouchbaseTests(@Autowired val repository: SomeRepository) {

	// ...

}
```

```java
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.couchbase.test.autoconfigure.DataCouchbaseTest;

@DataCouchbaseTest
class MyDataCouchbaseTests {

	@Autowired
	private SomeRepository repository;

	// ...

}
```

## Auto-configured Data Elasticsearch Tests

You can use [`@DataElasticsearchTest`][r117] from the `spring-boot-data-elasticsearch-test` module to test Data Elasticsearch applications.
By default, it configures an [`ElasticsearchTemplate`][r118], scans for [`@Document`][r119] classes, and configures Spring Data Elasticsearch repositories.
Regular [`@Component`][r80] and [`@ConfigurationProperties`][r81] beans are not scanned when the [`@DataElasticsearchTest`][r117] annotation is used.
[`@EnableConfigurationProperties`][r82] can be used to include [`@ConfigurationProperties`][r81] beans.
(For more about using Elasticsearch with Spring Boot, see [Elasticsearch][r120], earlier in this chapter.)

> [TIP]
>
> A list of the auto-configuration settings that are enabled by [`@DataElasticsearchTest`][r117] can be [found in the appendix][r63].

The following example shows a typical setup for using Elasticsearch tests in Spring Boot:

```kotlin
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.data.elasticsearch.test.autoconfigure.DataElasticsearchTest

@DataElasticsearchTest
class MyDataElasticsearchTests(@Autowired val repository: SomeRepository) {

	// ...

}
```

```java
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.elasticsearch.test.autoconfigure.DataElasticsearchTest;

@DataElasticsearchTest
class MyDataElasticsearchTests {

	@Autowired
	private SomeRepository repository;

	// ...

}
```

## Auto-configured Data JPA Tests

You can use the [`@DataJpaTest`][r121] annotation from the `spring-boot-data-jpa-test` module to test Data JPA applications.
By default, it scans for [`@Entity`][r122] classes and configures Spring Data JPA repositories.
If an embedded database is available on the classpath, it configures one as well.
SQL queries are logged by default by setting the `spring.jpa.show-sql` property to `true`.
This can be disabled using the `showSql` attribute of the annotation.

Regular [`@Component`][r80] and [`@ConfigurationProperties`][r81] beans are not scanned when the [`@DataJpaTest`][r121] annotation is used.
[`@EnableConfigurationProperties`][r82] can be used to include [`@ConfigurationProperties`][r81] beans.

> [TIP]
>
> A list of the auto-configuration settings that are enabled by [`@DataJpaTest`][r121] can be [found in the appendix][r63].

By default, data JPA tests are transactional and roll back at the end of each test.
See the [relevant section][r123] in the Spring Framework Reference Documentation for more details.
If that is not what you want, you can disable transaction management for a test or for the whole class as follows:

```kotlin
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest
import org.springframework.transaction.annotation.Propagation
import org.springframework.transaction.annotation.Transactional

@DataJpaTest
@Transactional(propagation = Propagation.NOT_SUPPORTED)
class MyNonTransactionalTests {

	// ...

}
```

```java
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

@DataJpaTest
@Transactional(propagation = Propagation.NOT_SUPPORTED)
class MyNonTransactionalTests {

	// ...

}
```

Data JPA tests may also inject a [`TestEntityManager`][r124] bean, which provides an alternative to the standard JPA [`EntityManager`][r125] that is specifically designed for tests.

> [TIP]
>
> [`TestEntityManager`][r124] can also be auto-configured to any of your Spring-based test class by adding [`@AutoConfigureTestEntityManager`][r126].
> When doing so, make sure that your test is running in a transaction, for instance by adding [`@Transactional`][r10] on your test class or method.

A [`JdbcTemplate`][r127] is also available if you need that.
The following example shows the [`@DataJpaTest`][r121] annotation in use:

```kotlin
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest
import org.springframework.boot.jpa.test.autoconfigure.TestEntityManager

@DataJpaTest
class MyRepositoryTests(@Autowired val entityManager: TestEntityManager, @Autowired val repository: UserRepository) {

	@Test
	fun testExample() {
		entityManager.persist(User("sboot", "1234"))
		val user = repository.findByUsername("sboot")
		assertThat(user?.username).isEqualTo("sboot")
		assertThat(user?.employeeNumber).isEqualTo("1234")
	}

}
```

```java
import org.junit.jupiter.api.Test;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.boot.jpa.test.autoconfigure.TestEntityManager;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
class MyRepositoryTests {

	@Autowired
	private TestEntityManager entityManager;

	@Autowired
	private UserRepository repository;

	@Test
	void testExample() {
		this.entityManager.persist(new User("sboot", "1234"));
		User user = this.repository.findByUsername("sboot");
		assertThat(user.getUsername()).isEqualTo("sboot");
		assertThat(user.getEmployeeNumber()).isEqualTo("1234");
	}

}
```

In-memory embedded databases generally work well for tests, since they are fast and do not require any installation.
If, however, you prefer to run tests against a real database you can use the [`@AutoConfigureTestDatabase`][r128] annotation, as shown in the following example:

```kotlin
import org.springframework.boot.jdbc.test.autoconfigure.AutoConfigureTestDatabase
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest

@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
class MyRepositoryTests {

	// ...

}
```

```java
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.boot.jdbc.test.autoconfigure.AutoConfigureTestDatabase;
import org.springframework.boot.jdbc.test.autoconfigure.AutoConfigureTestDatabase.Replace;

@DataJpaTest
@AutoConfigureTestDatabase(replace = Replace.NONE)
class MyRepositoryTests {

	// ...

}
```

## Auto-configured JDBC Tests

[`@JdbcTest`][r129] from the `spring-boot-jdbc-test` module is similar to [`@DataJdbcTest`][r130] but is for tests that only require a [`DataSource`][r131] and do not use Spring Data JDBC.
By default, it configures an in-memory embedded database and a [`JdbcTemplate`][r127].
Regular [`@Component`][r80] and [`@ConfigurationProperties`][r81] beans are not scanned when the [`@JdbcTest`][r129] annotation is used.
[`@EnableConfigurationProperties`][r82] can be used to include [`@ConfigurationProperties`][r81] beans.

> [TIP]
>
> A list of the auto-configurations that are enabled by [`@JdbcTest`][r129] can be [found in the appendix][r63].

By default, JDBC tests are transactional and roll back at the end of each test.
See the [relevant section][r123] in the Spring Framework Reference Documentation for more details.
If that is not what you want, you can disable transaction management for a test or for the whole class, as follows:

```kotlin
import org.springframework.boot.jdbc.test.autoconfigure.JdbcTest
import org.springframework.transaction.annotation.Propagation
import org.springframework.transaction.annotation.Transactional

@JdbcTest
@Transactional(propagation = Propagation.NOT_SUPPORTED)
class MyTransactionalTests
```

```java
import org.springframework.boot.jdbc.test.autoconfigure.JdbcTest;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

@JdbcTest
@Transactional(propagation = Propagation.NOT_SUPPORTED)
class MyTransactionalTests {

}
```

If you prefer your test to run against a real database, you can use the [`@AutoConfigureTestDatabase`][r128] annotation in the same way as for [`@DataJpaTest`][r121].
(See [Auto-configured Data JPA Tests][r132].)

## Auto-configured Data JDBC Tests

[`@DataJdbcTest`][r130] from the `spring-boot-data-jdbc-test` module is similar to [`@JdbcTest`][r129] but is for tests that use Spring Data JDBC repositories.
By default, it configures an in-memory embedded database, a [`JdbcTemplate`][r127], and Spring Data JDBC repositories.
Only [`AbstractJdbcConfiguration`][r133] subclasses are scanned when the [`@DataJdbcTest`][r130] annotation is used, regular [`@Component`][r80] and [`@ConfigurationProperties`][r81] beans are not scanned.
[`@EnableConfigurationProperties`][r82] can be used to include [`@ConfigurationProperties`][r81] beans.

> [TIP]
>
> A list of the auto-configurations that are enabled by [`@DataJdbcTest`][r130] can be [found in the appendix][r63].

By default, Data JDBC tests are transactional and roll back at the end of each test.
See the [relevant section][r123] in the Spring Framework Reference Documentation for more details.
If that is not what you want, you can disable transaction management for a test or for the whole test class as [shown in the JDBC example][r134].

If you prefer your test to run against a real database, you can use the [`@AutoConfigureTestDatabase`][r128] annotation in the same way as for [`@DataJpaTest`][r121].
(See [Auto-configured Data JPA Tests][r132].)

## Auto-configured Data R2DBC Tests

[`@DataR2dbcTest`][r135] from the `spring-boot-data-r2dbc-test` module is similar to [`@DataJdbcTest`][r130] but is for tests that use Spring Data R2DBC repositories.
By default, it configures an in-memory embedded database, an [`R2dbcEntityTemplate`][r136], and Spring Data R2DBC repositories.
Regular [`@Component`][r80] and [`@ConfigurationProperties`][r81] beans are not scanned when the [`@DataR2dbcTest`][r135] annotation is used.
[`@EnableConfigurationProperties`][r82] can be used to include [`@ConfigurationProperties`][r81] beans.

> [TIP]
>
> A list of the auto-configurations that are enabled by [`@DataR2dbcTest`][r135] can be [found in the appendix][r63].

By default, Data R2DBC tests are not transactional.

If you prefer your test to run against a real database, you can use the [`@AutoConfigureTestDatabase`][r128] annotation in the same way as for [`@DataJpaTest`][r121].
(See [Auto-configured Data JPA Tests][r132].)

## Auto-configured jOOQ Tests

You can use [`@JooqTest`][r137] from `spring-boot-jooq-test` in a similar fashion as [`@JdbcTest`][r129] but for jOOQ-related tests.
As jOOQ relies heavily on a Java-based schema that corresponds with the database schema, the existing [`DataSource`][r131] is used.
If you want to replace it with an in-memory database, you can use [`@AutoConfigureTestDatabase`][r128] to override those settings.
(For more about using jOOQ with Spring Boot, see [Using jOOQ][r138].)
Regular [`@Component`][r80] and [`@ConfigurationProperties`][r81] beans are not scanned when the [`@JooqTest`][r137] annotation is used.
[`@EnableConfigurationProperties`][r82] can be used to include [`@ConfigurationProperties`][r81] beans.

> [TIP]
>
> A list of the auto-configurations that are enabled by [`@JooqTest`][r137] can be [found in the appendix][r63].

[`@JooqTest`][r137] configures a [`DSLContext`][r139].
The following example shows the [`@JooqTest`][r137] annotation in use:

```kotlin
import org.jooq.DSLContext
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.jooq.test.autoconfigure.JooqTest

@JooqTest
class MyJooqTests(@Autowired val dslContext: DSLContext) {

	// ...

}
```

```java
import org.jooq.DSLContext;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.jooq.test.autoconfigure.JooqTest;

@JooqTest
class MyJooqTests {

	@Autowired
	private DSLContext dslContext;

	// ...

}
```

JOOQ tests are transactional and roll back at the end of each test by default.
If that is not what you want, you can disable transaction management for a test or for the whole test class as [shown in the JDBC example][r134].

## Auto-configured Data MongoDB Tests

You can use [`@DataMongoTest`][r140] from the `spring-boot-data-mongodb-test` module to test MongoDB applications.
By default, it configures a [`MongoTemplate`][r141], scans for [`@Document`][r142] classes, and configures Spring Data MongoDB repositories.
Regular [`@Component`][r80] and [`@ConfigurationProperties`][r81] beans are not scanned when the [`@DataMongoTest`][r140] annotation is used.
[`@EnableConfigurationProperties`][r82] can be used to include [`@ConfigurationProperties`][r81] beans.
(For more about using MongoDB with Spring Boot, see [MongoDB][r143].)

> [TIP]
>
> A list of the auto-configuration settings that are enabled by [`@DataMongoTest`][r140] can be [found in the appendix][r63].

The following class shows the [`@DataMongoTest`][r140] annotation in use:

```kotlin
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.data.mongodb.test.autoconfigure.DataMongoTest
import org.springframework.data.mongodb.core.MongoTemplate

@DataMongoTest
class MyDataMongoDbTests(@Autowired val mongoTemplate: MongoTemplate) {

	// ...

}
```

```java
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.mongodb.test.autoconfigure.DataMongoTest;
import org.springframework.data.mongodb.core.MongoTemplate;

@DataMongoTest
class MyDataMongoDbTests {

	@Autowired
	private MongoTemplate mongoTemplate;

	// ...

}
```

## Auto-configured Data Neo4j Tests

You can use [`@DataNeo4jTest`][r144] from the `spring-boot-data-neo4j-test` module to test Neo4j applications.
By default, it scans for [`@Node`][r145] classes, and configures Spring Data Neo4j repositories.
Regular [`@Component`][r80] and [`@ConfigurationProperties`][r81] beans are not scanned when the [`@DataNeo4jTest`][r144] annotation is used.
[`@EnableConfigurationProperties`][r82] can be used to include [`@ConfigurationProperties`][r81] beans.
(For more about using Neo4J with Spring Boot, see [Neo4j][r146].)

> [TIP]
>
> A list of the auto-configuration settings that are enabled by [`@DataNeo4jTest`][r144] can be [found in the appendix][r63].

The following example shows a typical setup for using Neo4J tests in Spring Boot:

```kotlin
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.data.neo4j.test.autoconfigure.DataNeo4jTest

@DataNeo4jTest
class MyDataNeo4jTests(@Autowired val repository: SomeRepository) {

	// ...

}
```

```java
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.neo4j.test.autoconfigure.DataNeo4jTest;

@DataNeo4jTest
class MyDataNeo4jTests {

	@Autowired
	private SomeRepository repository;

	// ...

}
```

By default, Data Neo4j tests are transactional and roll back at the end of each test.
See the [relevant section][r123] in the Spring Framework Reference Documentation for more details.
If that is not what you want, you can disable transaction management for a test or for the whole class, as follows:

```kotlin
import org.springframework.boot.data.neo4j.test.autoconfigure.DataNeo4jTest
import org.springframework.transaction.annotation.Propagation
import org.springframework.transaction.annotation.Transactional

@DataNeo4jTest
@Transactional(propagation = Propagation.NOT_SUPPORTED)
class MyDataNeo4jTests
```

```java
import org.springframework.boot.data.neo4j.test.autoconfigure.DataNeo4jTest;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

@DataNeo4jTest
@Transactional(propagation = Propagation.NOT_SUPPORTED)
class MyDataNeo4jTests {

}
```

> [NOTE]
>
> Transactional tests are not supported with reactive access.
> If you are using this style, you must configure [`@DataNeo4jTest`][r144] tests as described above.

## Auto-configured Data Redis Tests

You can use [`@DataRedisTest`][r147] from the `spring-boot-data-redis-test` module to test Data Redis applications.
By default, it scans for [`@RedisHash`][r148] classes and configures Spring Data Redis repositories.
Regular [`@Component`][r80] and [`@ConfigurationProperties`][r81] beans are not scanned when the [`@DataRedisTest`][r147] annotation is used.
[`@EnableConfigurationProperties`][r82] can be used to include [`@ConfigurationProperties`][r81] beans.
(For more about using Redis with Spring Boot, see [Redis][r149].)

> [TIP]
>
> A list of the auto-configuration settings that are enabled by [`@DataRedisTest`][r147] can be [found in the appendix][r63].

The following example shows the [`@DataRedisTest`][r147] annotation in use:

```kotlin
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.data.redis.test.autoconfigure.DataRedisTest

@DataRedisTest
class MyDataRedisTests(@Autowired val repository: SomeRepository) {

	// ...

}
```

```java
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.redis.test.autoconfigure.DataRedisTest;

@DataRedisTest
class MyDataRedisTests {

	@Autowired
	private SomeRepository repository;

	// ...

}
```

## Auto-configured Data LDAP Tests

You can use [`@DataLdapTest`][r150] to test Data LDAP applications.
By default, it configures an in-memory embedded LDAP (if available), configures an [`LdapTemplate`][r151], scans for [`@Entry`][r152] classes, and configures Spring Data LDAP repositories.
Regular [`@Component`][r80] and [`@ConfigurationProperties`][r81] beans are not scanned when the [`@DataLdapTest`][r150] annotation is used.
[`@EnableConfigurationProperties`][r82] can be used to include [`@ConfigurationProperties`][r81] beans.
(For more about using LDAP with Spring Boot, see [LDAP][r153].)

> [TIP]
>
> A list of the auto-configuration settings that are enabled by [`@DataLdapTest`][r150] can be [found in the appendix][r63].

The following example shows the [`@DataLdapTest`][r150] annotation in use:

```kotlin
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.data.ldap.test.autoconfigure.DataLdapTest
import org.springframework.ldap.core.LdapTemplate

@DataLdapTest
class MyDataLdapTests(@Autowired val ldapTemplate: LdapTemplate) {

	// ...

}
```

```java
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.ldap.test.autoconfigure.DataLdapTest;
import org.springframework.ldap.core.LdapTemplate;

@DataLdapTest
class MyDataLdapTests {

	@Autowired
	private LdapTemplate ldapTemplate;

	// ...

}
```

In-memory embedded LDAP generally works well for tests, since it is fast and does not require any developer installation.
If, however, you prefer to run tests against a real LDAP server, you should exclude the embedded LDAP auto-configuration, as shown in the following example:

```kotlin
import org.springframework.boot.ldap.autoconfigure.embedded.EmbeddedLdapAutoConfiguration
import org.springframework.boot.data.ldap.test.autoconfigure.DataLdapTest

@DataLdapTest(excludeAutoConfiguration = [EmbeddedLdapAutoConfiguration::class])
class MyDataLdapTests {

	// ...

}
```

```java
import org.springframework.boot.data.ldap.test.autoconfigure.DataLdapTest;
import org.springframework.boot.ldap.autoconfigure.embedded.EmbeddedLdapAutoConfiguration;

@DataLdapTest(excludeAutoConfiguration = EmbeddedLdapAutoConfiguration.class)
class MyDataLdapTests {

	// ...

}
```

## Auto-configured REST Clients

You can use the [`@RestClientTest`][r154] annotation from the `spring-boot-restclient-test` module to test REST clients.
By default, it auto-configures Jackson, GSON, and Jsonb support, configures a [`RestTemplateBuilder`][r155] and a [`RestClient.Builder`][r156], and adds support for [`MockRestServiceServer`][r157].
Regular [`@Component`][r80] and [`@ConfigurationProperties`][r81] beans are not scanned when the [`@RestClientTest`][r154] annotation is used.
[`@EnableConfigurationProperties`][r82] can be used to include [`@ConfigurationProperties`][r81] beans.

> [TIP]
>
> A list of the auto-configuration settings that are enabled by [`@RestClientTest`][r154] can be [found in the appendix][r63].

The specific beans that you want to test should be specified by using the `value` or `components` attribute of [`@RestClientTest`][r154].

When using a [`RestTemplateBuilder`][r155] in the beans under test and `RestTemplateBuilder.baseUri(String baseUri)` has been called when building the [`RestTemplate`][r158], then the base URI should be omitted from the [`MockRestServiceServer`][r157] expectations as shown in the following example:

```kotlin
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.restclient.test.autoconfigure.RestClientTest
import org.springframework.http.MediaType
import org.springframework.test.web.client.MockRestServiceServer
import org.springframework.test.web.client.match.MockRestRequestMatchers
import org.springframework.test.web.client.response.MockRestResponseCreators

@RestClientTest(RemoteVehicleDetailsService::class)
class MyRestTemplateServiceTests(
	@Autowired val service: RemoteVehicleDetailsService,
	@Autowired val server: MockRestServiceServer) {

	@Test
	fun getVehicleDetailsWhenResultIsSuccessShouldReturnDetails() {
		server.expect(MockRestRequestMatchers.requestTo("/greet/details"))
			.andRespond(MockRestResponseCreators.withSuccess("hello", MediaType.TEXT_PLAIN))
		val greeting = service.callRestService()
		assertThat(greeting).isEqualTo("hello")
	}

}
```

```java
import org.junit.jupiter.api.Test;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.restclient.test.autoconfigure.RestClientTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.client.MockRestServiceServer;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess;

@RestClientTest(org.springframework.boot.docs.testing.springbootapplications.autoconfiguredrestclient.RemoteVehicleDetailsService.class)
class MyRestTemplateServiceTests {

	@Autowired
	private RemoteVehicleDetailsService service;

	@Autowired
	private MockRestServiceServer server;

	@Test
	void getVehicleDetailsWhenResultIsSuccessShouldReturnDetails() {
		this.server.expect(requestTo("/greet/details")).andRespond(withSuccess("hello", MediaType.TEXT_PLAIN));
		String greeting = this.service.callRestService();
		assertThat(greeting).isEqualTo("hello");
	}

}
```

When using a [`RestClient.Builder`][r156] in the beans under test, or when using a [`RestTemplateBuilder`][r155] without calling `baseUri(String baseUri)`, the full URI must be used in the [`MockRestServiceServer`][r157] expectations as shown in the following example:

```kotlin
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.restclient.test.autoconfigure.RestClientTest
import org.springframework.http.MediaType
import org.springframework.test.web.client.MockRestServiceServer
import org.springframework.test.web.client.match.MockRestRequestMatchers
import org.springframework.test.web.client.response.MockRestResponseCreators

@RestClientTest(RemoteVehicleDetailsService::class)
class MyRestClientServiceTests(
	@Autowired val service: RemoteVehicleDetailsService,
	@Autowired val server: MockRestServiceServer) {

	@Test
	fun getVehicleDetailsWhenResultIsSuccessShouldReturnDetails() {
		server.expect(MockRestRequestMatchers.requestTo("https://example.com/greet/details"))
			.andRespond(MockRestResponseCreators.withSuccess("hello", MediaType.TEXT_PLAIN))
		val greeting = service.callRestService()
		assertThat(greeting).isEqualTo("hello")
	}

}
```

```java
import org.junit.jupiter.api.Test;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.restclient.test.autoconfigure.RestClientTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.client.MockRestServiceServer;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess;

@RestClientTest(RemoteVehicleDetailsService.class)
class MyRestClientServiceTests {

	@Autowired
	private RemoteVehicleDetailsService service;

	@Autowired
	private MockRestServiceServer server;

	@Test
	void getVehicleDetailsWhenResultIsSuccessShouldReturnDetails() {
		this.server.expect(requestTo("https://example.com/greet/details"))
			.andRespond(withSuccess("hello", MediaType.TEXT_PLAIN));
		String greeting = this.service.callRestService();
		assertThat(greeting).isEqualTo("hello");
	}

}
```

## Auto-configured Web Clients

You can use the [`@WebClientTest`][r159] annotation from the `spring-boot-webclient-test` module to test code that uses `WebClient`.
By default, it auto-configures Jackson, GSON, and Jsonb support, and configures a [`WebClient.Builder`][r160].
Regular [`@Component`][r80] and [`@ConfigurationProperties`][r81] beans are not scanned when the [`@WebClientTest`][r159] annotation is used.
[`@EnableConfigurationProperties`][r82] can be used to include [`@ConfigurationProperties`][r81] beans.

> [TIP]
>
> A list of the auto-configuration settings that are enabled by [`@WebClientTest`][r159] can be [found in the appendix][r63].

The specific beans that you want to test should be specified by using the `value` or `components` attribute of [`@WebClientTest`][r159].

## Auto-configured Spring REST Docs Tests

You can use the [`@AutoConfigureRestDocs`][r161] annotation from the `spring-boot-restdocs- module to use [Spring REST Docs][r162] in your tests with Mock MVC or WebTestClient.
It removes the need for the JUnit extension in Spring REST Docs.

[`@AutoConfigureRestDocs`][r161] can be used to override the default output directory (`target/generated-snippets` if you are using Maven or `build/generated-snippets` if you are using Gradle).
It can also be used to configure the host, scheme, and port that appears in any documented URIs.

### Auto-configured Spring REST Docs Tests With Mock MVC

[`@AutoConfigureRestDocs`][r161] customizes the [`MockMvc`][r26] bean to use Spring REST Docs when testing servlet-based web applications.
You can inject it by using [`@Autowired`][r69] and use it in your tests as you normally would when using Mock MVC and Spring REST Docs, as shown in the following example:

```java
import org.junit.jupiter.api.Test;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.restdocs.test.autoconfigure.AutoConfigureRestDocs;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.assertj.MockMvcTester;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.restdocs.mockmvc.MockMvcRestDocumentation.document;

@WebMvcTest(UserController.class)
@AutoConfigureRestDocs
class MyUserDocumentationTests {

	@Autowired
	private MockMvcTester mvc;

	@Test
	void listUsers() {
		assertThat(this.mvc.get().uri("/users").accept(MediaType.TEXT_PLAIN)).hasStatusOk()
			.apply(document("list-users"));
	}

}
```

If you prefer to use the AssertJ integration, [`MockMvcTester`][r84] is available as well, as shown in the following example:

```java
import org.junit.jupiter.api.Test;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.restdocs.test.autoconfigure.AutoConfigureRestDocs;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.assertj.MockMvcTester;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.restdocs.mockmvc.MockMvcRestDocumentation.document;

@WebMvcTest(UserController.class)
@AutoConfigureRestDocs
class MyUserDocumentationTests {

	@Autowired
	private MockMvcTester mvc;

	@Test
	void listUsers() {
		assertThat(this.mvc.get().uri("/users").accept(MediaType.TEXT_PLAIN)).hasStatusOk()
			.apply(document("list-users"));
	}

}
```

Both reuses the same [`MockMvc`][r26] instance behind the scenes so any configuration to it applies to both.

If you require more control over Spring REST Docs configuration than offered by the attributes of [`@AutoConfigureRestDocs`][r161], you can use a [`RestDocsMockMvcConfigurationCustomizer`][r163] bean, as shown in the following example:

```kotlin
import org.springframework.boot.restdocs.test.autoconfigure.RestDocsMockMvcConfigurationCustomizer
import org.springframework.boot.test.context.TestConfiguration
import org.springframework.restdocs.mockmvc.MockMvcRestDocumentationConfigurer
import org.springframework.restdocs.templates.TemplateFormats

@TestConfiguration(proxyBeanMethods = false)
class MyRestDocsConfiguration : RestDocsMockMvcConfigurationCustomizer {

	override fun customize(configurer: MockMvcRestDocumentationConfigurer) {
		configurer.snippets().withTemplateFormat(TemplateFormats.markdown())
	}

}
```

```java
import org.springframework.boot.restdocs.test.autoconfigure.RestDocsMockMvcConfigurationCustomizer;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.restdocs.mockmvc.MockMvcRestDocumentationConfigurer;
import org.springframework.restdocs.templates.TemplateFormats;

@TestConfiguration(proxyBeanMethods = false)
public class MyRestDocsConfiguration implements RestDocsMockMvcConfigurationCustomizer {

	@Override
	public void customize(MockMvcRestDocumentationConfigurer configurer) {
		configurer.snippets().withTemplateFormat(TemplateFormats.markdown());
	}

}
```

If you want to make use of Spring REST Docs support for a parameterized output directory, you can create a [`RestDocumentationResultHandler`][r164] bean.
The auto-configuration calls `alwaysDo` with this result handler, thereby causing each [`MockMvc`][r26] call to automatically generate the default snippets.
The following example shows a [`RestDocumentationResultHandler`][r164] being defined:

```kotlin
import org.springframework.boot.test.context.TestConfiguration
import org.springframework.context.annotation.Bean
import org.springframework.restdocs.mockmvc.MockMvcRestDocumentation
import org.springframework.restdocs.mockmvc.RestDocumentationResultHandler

@TestConfiguration(proxyBeanMethods = false)
class MyResultHandlerConfiguration {

	@Bean
	fun restDocumentation(): RestDocumentationResultHandler {
		return MockMvcRestDocumentation.document("{method-name}")
	}

}
```

```java
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.restdocs.mockmvc.MockMvcRestDocumentation;
import org.springframework.restdocs.mockmvc.RestDocumentationResultHandler;

@TestConfiguration(proxyBeanMethods = false)
public class MyResultHandlerConfiguration {

	@Bean
	public RestDocumentationResultHandler restDocumentation() {
		return MockMvcRestDocumentation.document("{method-name}");
	}

}
```

### Auto-configured Spring REST Docs Tests With WebTestClient

[`@AutoConfigureRestDocs`][r161] can also be used with [`WebTestClient`][r36] when testing reactive web applications.
You can inject it by using [`@Autowired`][r69] and use it in your tests as you normally would when using [`@WebFluxTest`][r93] and Spring REST Docs, as shown in the following example:

```kotlin
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.restdocs.test.autoconfigure.AutoConfigureRestDocs
import org.springframework.boot.webflux.test.autoconfigure.WebFluxTest
import org.springframework.restdocs.webtestclient.WebTestClientRestDocumentation
import org.springframework.test.web.reactive.server.WebTestClient

@WebFluxTest
@AutoConfigureRestDocs
class MyUsersDocumentationTests(@Autowired val webTestClient: WebTestClient) {

	@Test
	fun listUsers() {
		webTestClient
			.get().uri("/")
			.exchange()
			.expectStatus()
			.isOk
			.expectBody()
			.consumeWith(WebTestClientRestDocumentation.document("list-users"))
	}

}
```

```java
import org.junit.jupiter.api.Test;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.restdocs.test.autoconfigure.AutoConfigureRestDocs;
import org.springframework.boot.webflux.test.autoconfigure.WebFluxTest;
import org.springframework.test.web.reactive.server.WebTestClient;

import static org.springframework.restdocs.webtestclient.WebTestClientRestDocumentation.document;

@WebFluxTest
@AutoConfigureRestDocs
class MyUsersDocumentationTests {

	@Autowired
	private WebTestClient webTestClient;

	@Test
	void listUsers() {
		this.webTestClient
			.get().uri("/")
		.exchange()
		.expectStatus()
			.isOk()
		.expectBody()
			.consumeWith(document("list-users"));
	}

}
```

If you require more control over Spring REST Docs configuration than offered by the attributes of [`@AutoConfigureRestDocs`][r161], you can use a [`RestDocsWebTestClientConfigurationCustomizer`][r165] bean, as shown in the following example:

```kotlin
import org.springframework.boot.restdocs.test.autoconfigure.RestDocsWebTestClientConfigurationCustomizer
import org.springframework.boot.test.context.TestConfiguration
import org.springframework.restdocs.webtestclient.WebTestClientRestDocumentationConfigurer

@TestConfiguration(proxyBeanMethods = false)
class MyRestDocsConfiguration : RestDocsWebTestClientConfigurationCustomizer {

	override fun customize(configurer: WebTestClientRestDocumentationConfigurer) {
		configurer.snippets().withEncoding("UTF-8")
	}

}
```

```java
import org.springframework.boot.restdocs.test.autoconfigure.RestDocsWebTestClientConfigurationCustomizer;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.restdocs.webtestclient.WebTestClientRestDocumentationConfigurer;

@TestConfiguration(proxyBeanMethods = false)
public class MyRestDocsConfiguration implements RestDocsWebTestClientConfigurationCustomizer {

	@Override
	public void customize(WebTestClientRestDocumentationConfigurer configurer) {
		configurer.snippets().withEncoding("UTF-8");
	}

}
```

If you want to make use of Spring REST Docs support for a parameterized output directory, you can use a [`WebTestClientBuilderCustomizer`][r42] to configure a consumer for every entity exchange result.
The following example shows such a [`WebTestClientBuilderCustomizer`][r42] being defined:

```kotlin
import org.springframework.boot.test.context.TestConfiguration
import org.springframework.boot.webtestclient.autoconfigure.WebTestClientBuilderCustomizer
import org.springframework.context.annotation.Bean
import org.springframework.restdocs.webtestclient.WebTestClientRestDocumentation
import org.springframework.test.web.reactive.server.WebTestClient

@TestConfiguration(proxyBeanMethods = false)
class MyWebTestClientBuilderCustomizerConfiguration {

	@Bean
	fun restDocumentation(): WebTestClientBuilderCustomizer {
		return WebTestClientBuilderCustomizer { builder: WebTestClient.Builder ->
			builder.entityExchangeResultConsumer(
				WebTestClientRestDocumentation.document("{method-name}")
			)
		}
	}

}
```

```java
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.webtestclient.autoconfigure.WebTestClientBuilderCustomizer;
import org.springframework.context.annotation.Bean;

import static org.springframework.restdocs.webtestclient.WebTestClientRestDocumentation.document;

@TestConfiguration(proxyBeanMethods = false)
public class MyWebTestClientBuilderCustomizerConfiguration {

	@Bean
	public WebTestClientBuilderCustomizer restDocumentation() {
		return (builder) -> builder.entityExchangeResultConsumer(document("{method-name}"));
	}

}
```

## Auto-configured Spring Web Services Tests

### Auto-configured Spring Web Services Client Tests

You can use [`@WebServiceClientTest`][r166] from the `spring-boot-webservices-test` module to test applications that call web services using the Spring Web Services project.
By default, it configures a [`MockWebServiceServer`][r167] bean and automatically customizes your [`WebServiceTemplateBuilder`][r168].
(For more about using Web Services with Spring Boot, see [Web Services][r169].)

> [TIP]
>
> A list of the auto-configuration settings that are enabled by [`@WebServiceClientTest`][r166] can be [found in the appendix][r63].

The following example shows the [`@WebServiceClientTest`][r166] annotation in use:

```kotlin
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.webservices.test.autoconfigure.client.WebServiceClientTest
import org.springframework.ws.test.client.MockWebServiceServer
import org.springframework.ws.test.client.RequestMatchers
import org.springframework.ws.test.client.ResponseCreators
import org.springframework.xml.transform.StringSource

@WebServiceClientTest(SomeWebService::class)
class MyWebServiceClientTests(
		@Autowired val server: MockWebServiceServer, @Autowired val someWebService: SomeWebService) {

	@Test
	fun mockServerCall() {
		server
			.expect(RequestMatchers.payload(StringSource("<request/>")))
			.andRespond(ResponseCreators.withPayload(StringSource("<response><status>200</status></response>")))
		assertThat(this.someWebService.test()).extracting(Response::status).isEqualTo(200)
	}

}
```

```java
import org.junit.jupiter.api.Test;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webservices.test.autoconfigure.client.WebServiceClientTest;
import org.springframework.ws.test.client.MockWebServiceServer;
import org.springframework.xml.transform.StringSource;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.ws.test.client.RequestMatchers.payload;
import static org.springframework.ws.test.client.ResponseCreators.withPayload;

@WebServiceClientTest(SomeWebService.class)
class MyWebServiceClientTests {

	@Autowired
	private MockWebServiceServer server;

	@Autowired
	private SomeWebService someWebService;

	@Test
	void mockServerCall() {
		this.server
			.expect(payload(new StringSource("<request/>")))
			.andRespond(withPayload(new StringSource("<response><status>200</status></response>")));
		assertThat(this.someWebService.test())
			.extracting(Response::getStatus)
			.isEqualTo(200);
	}

}
```

### Auto-configured Spring Web Services Server Tests

You can use [`@WebServiceServerTest`][r170] from the `spring-boot-webservices-test` module to test applications that implement web services using the Spring Web Services project.
By default, it configures a [`MockWebServiceClient`][r171] bean that can be used to call your web service endpoints.
(For more about using Web Services with Spring Boot, see [Web Services][r169].)

> [TIP]
>
> A list of the auto-configuration settings that are enabled by [`@WebServiceServerTest`][r170] can be [found in the appendix][r63].

The following example shows the [`@WebServiceServerTest`][r170] annotation in use:

```kotlin
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.webservices.test.autoconfigure.server.WebServiceServerTest
import org.springframework.ws.test.server.MockWebServiceClient
import org.springframework.ws.test.server.RequestCreators
import org.springframework.ws.test.server.ResponseMatchers
import org.springframework.xml.transform.StringSource

@WebServiceServerTest(ExampleEndpoint::class)
class MyWebServiceServerTests(@Autowired val client: MockWebServiceClient) {

	@Test
	fun mockServerCall() {
		client
			.sendRequest(RequestCreators.withPayload(StringSource("<ExampleRequest/>")))
			.andExpect(ResponseMatchers.payload(StringSource("<ExampleResponse>42</ExampleResponse>")))
	}

}
```

```java
import org.junit.jupiter.api.Test;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webservices.test.autoconfigure.server.WebServiceServerTest;
import org.springframework.ws.test.server.MockWebServiceClient;
import org.springframework.ws.test.server.RequestCreators;
import org.springframework.ws.test.server.ResponseMatchers;
import org.springframework.xml.transform.StringSource;

@WebServiceServerTest(ExampleEndpoint.class)
class MyWebServiceServerTests {

	@Autowired
	private MockWebServiceClient client;

	@Test
	void mockServerCall() {
		this.client
			.sendRequest(RequestCreators.withPayload(new StringSource("<ExampleRequest/>")))
			.andExpect(ResponseMatchers.payload(new StringSource("<ExampleResponse>42</ExampleResponse>")));
	}

}
```

## Additional Auto-configuration and Slicing

Each slice provides one or more `@AutoConfigure…​` annotations that namely defines the auto-configurations that should be included as part of a slice.
Additional auto-configurations can be added on a test-by-test basis by creating a custom `@AutoConfigure…​` annotation or by adding [`@ImportAutoConfiguration`][r172] to the test as shown in the following example:

```kotlin
import org.springframework.boot.autoconfigure.ImportAutoConfiguration
import org.springframework.boot.integration.autoconfigure.IntegrationAutoConfiguration
import org.springframework.boot.jdbc.test.autoconfigure.JdbcTest

@JdbcTest
@ImportAutoConfiguration(IntegrationAutoConfiguration::class)
class MyJdbcTests
```

```java
import org.springframework.boot.autoconfigure.ImportAutoConfiguration;
import org.springframework.boot.integration.autoconfigure.IntegrationAutoConfiguration;
import org.springframework.boot.jdbc.test.autoconfigure.JdbcTest;

@JdbcTest
@ImportAutoConfiguration(IntegrationAutoConfiguration.class)
class MyJdbcTests {

}
```

> [NOTE]
>
> Make sure to not use the regular [`@Import`][r83] annotation to import auto-configurations as they are handled in a specific way by Spring Boot.

Alternatively, additional auto-configurations can be added for any use of a slice annotation by registering them in a file stored in `META-INF/spring` as shown in the following example:

META-INF/spring/org.springframework.boot.jdbc.test.autoconfigure.JdbcTest.imports

```text
com.example.IntegrationAutoConfiguration
```

In this example, the `com.example.IntegrationAutoConfiguration` is enabled on every test annotated with [`@JdbcTest`][r129].

> [TIP]
>
> You can use comments with `#` in this file.

> [TIP]
>
> A slice or `@AutoConfigure…​` annotation can be customized this way as long as it is meta-annotated with [`@ImportAutoConfiguration`][r172].

## User Configuration and Slicing

If you [structure your code][r14] in a sensible way, your [`@SpringBootApplication`][r12] class is [used by default][r5] as the configuration of your tests.

It then becomes important not to litter the application’s main class with configuration settings that are specific to a particular area of its functionality.

Assume that you are using Spring Data MongoDB, you rely on the auto-configuration for it, and you have enabled auditing.
You could define your [`@SpringBootApplication`][r12] as follows:

```kotlin
import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.data.mongodb.config.EnableMongoAuditing

@SpringBootApplication
@EnableMongoAuditing
class MyApplication {

	// ...

}
```

```java
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.mongodb.config.EnableMongoAuditing;

@SpringBootApplication
@EnableMongoAuditing
public class MyApplication {

	// ...

}
```

Because this class is the source configuration for the test, any slice test actually tries to enable Mongo auditing, which is definitely not what you want to do.
A recommended approach is to move that area-specific configuration to a separate [`@Configuration`][r11] class at the same level as your application, as shown in the following example:

```kotlin
import org.springframework.context.annotation.Configuration
import org.springframework.data.mongodb.config.EnableMongoAuditing

@Configuration(proxyBeanMethods = false)
@EnableMongoAuditing
class MyMongoConfiguration {

	// ...

}
```

```java
import org.springframework.context.annotation.Configuration;
import org.springframework.data.mongodb.config.EnableMongoAuditing;

@Configuration(proxyBeanMethods = false)
@EnableMongoAuditing
public class MyMongoConfiguration {

	// ...

}
```

> [NOTE]
>
> Depending on the complexity of your application, you may either have a single [`@Configuration`][r11] class for your customizations or one class per domain area.
> The latter approach lets you enable it in one of your tests, if necessary, with the [`@Import`][r83] annotation.
> See [this how-to section][r173] for more details on when you might want to enable specific [`@Configuration`][r11] classes for slice tests.

Test slices exclude [`@Configuration`][r11] classes from scanning.
For example, for a [`@WebMvcTest`][r29], the following configuration will not include the given [`WebMvcConfigurer`][r77] bean in the application context loaded by the test slice:

```kotlin
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer

@Configuration(proxyBeanMethods = false)
class MyWebConfiguration {

	@Bean
	fun testConfigurer(): WebMvcConfigurer {
		return object : WebMvcConfigurer {
			// ...
		}
	}

}
```

```java
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration(proxyBeanMethods = false)
public class MyWebConfiguration {

	@Bean
	public WebMvcConfigurer testConfigurer() {
		return new WebMvcConfigurer() {
			// ...
		};
	}

}
```

The configuration below will, however, cause the custom [`WebMvcConfigurer`][r77] to be loaded by the test slice.

```kotlin
import org.springframework.stereotype.Component
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer

@Component
class MyWebMvcConfigurer : WebMvcConfigurer {

	// ...

}
```

```java
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Component
public class MyWebMvcConfigurer implements WebMvcConfigurer {

	// ...

}
```

Another source of confusion is classpath scanning.
Assume that, while you structured your code in a sensible way, you need to scan an additional package.
Your application may resemble the following code:

```kotlin
import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.context.annotation.ComponentScan

@SpringBootApplication
@ComponentScan("com.example.app", "com.example.another")
class MyApplication {

	// ...

}
```

```java
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.ComponentScan;

@SpringBootApplication
@ComponentScan({ "com.example.app", "com.example.another" })
public class MyApplication {

	// ...

}
```

Doing so effectively overrides the default component scan directive with the side effect of scanning those two packages regardless of the slice that you chose.
For instance, a [`@DataJpaTest`][r121] seems to suddenly scan components and user configurations of your application.
Again, moving the custom directive to a separate class is a good way to fix this issue.

> [TIP]
>
> If this is not an option for you, you can create a [`@SpringBootConfiguration`][r13] somewhere in the hierarchy of your test so that it is used instead.
> Alternatively, you can specify a source for your test, which disables the behavior of finding a default one.

## Using Spock to Test Spring Boot Applications

Spock 2.4 or later can be used to test a Spring Boot application.
To do so, add a dependency on a `-groovy-5.0` version of Spock’s `spock-spring` module to your application’s build.
`spock-spring` integrates Spring’s test framework into Spock.
See [the documentation for Spock’s Spring module][r174] for further details.
