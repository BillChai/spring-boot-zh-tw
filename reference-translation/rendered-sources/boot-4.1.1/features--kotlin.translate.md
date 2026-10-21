# Kotlin Support

[Kotlin][r1] is a statically-typed language targeting the JVM (and other platforms) which allows writing concise and elegant code while providing [interoperability][r2] with existing libraries written in Java.

Spring Boot provides Kotlin support by leveraging the support in other Spring projects such as Spring Framework, Spring Data, and Reactor.
See the [Spring Framework Kotlin support documentation][r3] for more information.

The easiest way to start with Spring Boot and Kotlin is to follow [this comprehensive tutorial][r4].
You can create new Kotlin projects by using [start.spring.io][r5].
Feel free to join the #spring channel of [Kotlin Slack][r6] or ask a question with the `spring` and `kotlin` tags on [Stack Overflow][r7] if you need support.

## Requirements

Spring Boot requires at least Kotlin 2.2.x and manages a suitable Kotlin version through dependency management.
To use Kotlin, `org.jetbrains.kotlin:kotlin-stdlib` and `org.jetbrains.kotlin:kotlin-reflect` must be present on the classpath.

Kotlin 2.2.x introduces [new defaulting rules for propagating annotations to parameters, fields, and properties][r8]. In order to avoid related warnings and use what will likely become the Kotlin default behavior in an upcoming version, it is recommended to configure the `-Xannotation-default-target=param-property` compiler flag.

Since [Kotlin classes are final by default][r9], you are likely to want to configure [kotlin-spring][r10] plugin in order to automatically open Spring-annotated classes so that they can be proxied.

[Jackson’s Kotlin module][r11] is required for serializing / deserializing JSON data in Kotlin.
It is automatically registered when found on the classpath.

> [TIP]
>
> These dependencies and plugins are provided by default if one bootstraps a Kotlin project on [start.spring.io][r5].

## Null-safety

One of Kotlin’s key features is [null-safety][r12].
It deals with `null` values at compile time rather than deferring the problem to runtime and encountering a [`NullPointerException`][r13].
This helps to eliminate a common source of bugs without paying the cost of wrappers like [`Optional`][r14].
Kotlin also allows using functional constructs with nullable values as described in this [comprehensive guide to null-safety in Kotlin][r15].

Although Java does not let you express null-safety in its type-system, most Spring projects
provide [null-safety][r16] via [JSpecify][r17] annotations.

As of Kotlin 2.1, Kotlin enforces strict handling of nullability annotations from the `org.jspecify.annotations` package.

## Kotlin API

### runApplication

Spring Boot provides an idiomatic way to run an application with `runApplication<MyApplication>(*args)` as shown in the following example:

{{CODE_0}}

This is a drop-in replacement for `SpringApplication.run(MyApplication::class.java, *args)`.
It also allows customization of the application as shown in the following example:

{{CODE_1}}

### Extensions

Kotlin [extensions][r18] provide the ability to extend existing classes with additional functionality.
The Spring Boot Kotlin API makes use of these extensions to add new Kotlin specific conveniences to existing APIs.

[`TestRestTemplate`][r19] extensions, similar to those provided by Spring Framework for [`RestOperations`][r20] in Spring Framework, are provided.
Among other things, the extensions make it possible to take advantage of Kotlin reified type parameters.

## Dependency Management

In order to avoid mixing different versions of Kotlin dependencies on the classpath, Spring Boot imports the Kotlin BOM.

With Maven, the Kotlin version can be customized by setting the `kotlin.version` property and plugin management is provided for `kotlin-maven-plugin`.
With Gradle, the Spring Boot plugin automatically aligns the `kotlin.version` with the version of the Kotlin plugin.

Spring Boot also manages the version of Coroutines dependencies by importing the Kotlin Coroutines BOM.
The version can be customized by setting the `kotlin-coroutines.version` property.

> [TIP]
>
> `org.jetbrains.kotlinx:kotlinx-coroutines-reactor` dependency is provided by default if one bootstraps a Kotlin project with at least one reactive dependency on [start.spring.io][r5].

## @ConfigurationProperties

[`@ConfigurationProperties`][r21] when used in combination with [constructor binding][r22] supports data classes with immutable `val` properties as shown in the following example:

{{CODE_2}}

Due to the limitations of their interoperability with Java, support for value classes is limited.
In particular, relying upon a value class’s default value will not work with configuration property binding.
In such cases, a data class should be used instead.

> [TIP]
>
> To generate [your own metadata][r23] using the annotation processor, [`kapt` should be configured][r24] with the `spring-boot-configuration-processor` dependency.
> Note that some features (such as detecting the default value or deprecated items) are not working due to limitations in the model kapt provides.

## Testing

While it is possible to use JUnit 4 to test Kotlin code, JUnit 6 is provided by default and is recommended.
JUnit 6 enables a test class to be instantiated once and reused for all of the class’s tests.
This makes it possible to use [`@BeforeAll`][r25] and [`@AfterAll`][r26] annotations on non-static methods, which is a good fit for Kotlin.

To mock Kotlin classes, [MockK][r27] is recommended.
If you need the `MockK` equivalent of the Mockito specific [`@MockitoBean` and `@MockitoSpyBean` annotations][r29], you can use [SpringMockK][r30] which provides similar `@MockkBean` and `@SpykBean` annotations.

## Resources

### Further Reading

- [Kotlin language reference][r31]
- [Kotlin Slack][r32] (with a dedicated #spring channel)
- [Stack Overflow with `spring` and `kotlin` tags][r7]
- [Try Kotlin in your browser][r33]
- [Kotlin blog][r34]
- [Awesome Kotlin][r35]
- [Tutorial: building web applications with Spring Boot and Kotlin][r4]
- [Developing Spring Boot applications with Kotlin][r36]
- [A Geospatial Messenger with Kotlin, Spring Boot and PostgreSQL][r37]
- [Introducing Kotlin support in Spring Framework 5.0][r38]
- [Spring Framework 5 Kotlin APIs, the functional way][r39]

### Examples

- [spring-boot-kotlin-demo][r40]: regular Spring Boot + Spring Data JPA project
- [mixit][r41]: Spring Boot 2 + WebFlux + Reactive Spring Data MongoDB
- [spring-kotlin-fullstack][r42]: WebFlux Kotlin fullstack example with Kotlin2js for frontend instead of JavaScript or TypeScript
- [spring-petclinic-kotlin][r43]: Kotlin version of the Spring PetClinic Sample Application
- [spring-kotlin-deepdive][r44]: a step by step migration for Boot 1.0 + Java to Boot 2.0 + Kotlin
- [spring-boot-coroutines-demo][r45]: Coroutines sample project
