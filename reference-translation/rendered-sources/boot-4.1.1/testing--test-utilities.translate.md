# Test Utilities

A few test utility classes that are generally useful when testing your application are packaged as part of `spring-boot`.

## ConfigDataApplicationContextInitializer

[`ConfigDataApplicationContextInitializer`][r1] is an [`ApplicationContextInitializer`][r2] that you can apply to your tests to load Spring Boot `application.properties` files.
You can use it when you do not need the full set of features provided by [`@SpringBootTest`][r3], as shown in the following example:

{{CODE_0}}

{{CODE_1}}

> [NOTE]
>
> Using [`ConfigDataApplicationContextInitializer`][r1] alone does not provide support for `@Value("${…​}")` injection.
> Its only job is to ensure that `application.properties` files are loaded into Spring’s [`Environment`][r4].
> For [`@Value`][r5] support, you need to either additionally configure a [`PropertySourcesPlaceholderConfigurer`][r6] or use [`@SpringBootTest`][r3], which auto-configures one for you.

## TestPropertyValues

[`TestPropertyValues`][r7] lets you quickly add properties to a [`ConfigurableEnvironment`][r8] or [`ConfigurableApplicationContext`][r9].
You can call it with `key=value` strings, as follows:

{{CODE_2}}

{{CODE_3}}

## OutputCaptureExtension

[`OutputCaptureExtension`][r10] is a JUnit [`Extension`][r11] that you can use to capture [`System.out`][r12] and [`System.err`][r13] output.
To use it, add `@ExtendWith(OutputCaptureExtension.class)` and inject [`CapturedOutput`][r14] as an argument to your test class constructor or test method as follows:

{{CODE_4}}

{{CODE_5}}

## TestRestTemplate

[`TestRestTemplate`][r15] is a convenience alternative to Spring’s [`RestTemplate`][r16] that is useful in integration tests.
It’s provided by the `spring-boot-resttestclient` module.
A dependency on `spring-boot-restclient` is also required.
Take care when adding this dependency as it will enable auto-configuration for `RestClient.Builder`.
If your main code uses `RestClient.Builder`, declare the `spring-boot-restclient` dependency so that it is on your application’s main classpath and not only on its test classpath.

You can get a vanilla template or one that sends Basic HTTP authentication (with a username and password).
In either case, the template is fault tolerant.
This means that it behaves in a test-friendly way by not throwing exceptions on 4xx and 5xx errors.
Instead, such errors can be detected through the returned [`ResponseEntity`][r17] and its status code.

If you need fluent API for assertions, consider using [`RestTestClient`][r18] that works with [mock environments][r19] and [end-to-end tests][r20].

If you are using Spring WebFlux, consider the [`WebTestClient`][r21] that provides a similar API and works with [mock environments][r19], [WebFlux integration tests][r22], and [end-to-end tests][r20].

It is recommended, but not mandatory, to use the Apache HTTP Client (version 5.1 or better).
If you have that on your classpath, the [`TestRestTemplate`][r15] responds by configuring the client appropriately.

[`TestRestTemplate`][r15] can be instantiated directly in your integration tests, as shown in the following example:

{{CODE_6}}

{{CODE_7}}

Alternatively, if you use the [`@SpringBootTest`][r3] annotation with `WebEnvironment.RANDOM_PORT` or `WebEnvironment.DEFINED_PORT`, you can inject a fully configured [`TestRestTemplate`][r15] by annotating the test class with [`@AutoConfigureTestRestTemplate`][r23].
If necessary, additional customizations can be applied through the [`RestTemplateBuilder`][r24] bean.

Any URLs that do not specify a host and port automatically connect to the embedded server, as shown in the following example:

{{CODE_8}}

{{CODE_9}}
