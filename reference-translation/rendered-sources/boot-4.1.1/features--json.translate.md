# JSON

Spring Boot provides integration with the following JSON mapping libraries:

- Jackson 3
- Jackson 2
- Gson
- JSON-B
- Kotlin Serialization

Jackson 3 is the preferred and default library.

Support for Jackson 2 is deprecated and will be removed in a future Spring Boot 4.x release.
It is provided purely to ease the migration from Jackson 2 to Jackson 3 and should not be relied up in the longer term.

## Jackson 3

Auto-configuration for Jackson 3 is provided and Jackson is part of `spring-boot-starter-json`.
When Jackson is on the classpath a [`JsonMapper`][r1] bean is automatically configured.
Several configuration properties are provided for [customizing the configuration of the `JsonMapper`][r2].

### Custom Serializers and Deserializers

If you use Jackson to serialize and deserialize JSON data, you might want to write your own [`ValueSerializer`][r3] and [`ValueDeserializer`][r4] classes.
Custom serializers are usually [registered with Jackson through a module][r5], but Spring Boot provides an alternative [`@JacksonComponent`][r6] annotation that makes it easier to directly register Spring Beans.

You can use the [`@JacksonComponent`][r6] annotation directly on [`ValueSerializer`][r3], [`ValueDeserializer`][r4] or [`KeyDeserializer`][r7] implementations.
You can also use it on classes that contain serializers/deserializers as inner classes, as shown in the following example:

{{CODE_0}}

{{CODE_1}}

All [`@JacksonComponent`][r6] beans in the [`ApplicationContext`][r8] are automatically registered with Jackson.
Because [`@JacksonComponent`][r6] is meta-annotated with [`@Component`][r9], the usual component-scanning rules apply.

Spring Boot also provides [`ObjectValueSerializer`][r10] and [`ObjectValueDeserializer`][r11] base classes that provide useful alternatives to the standard Jackson versions when serializing objects.
See [`ObjectValueSerializer`][r10] and [`ObjectValueDeserializer`][r11] in the API documentation for details.

The example above can be rewritten to use [`ObjectValueSerializer`][r10] and [`ObjectValueDeserializer`][r11] as follows:

{{CODE_2}}

{{CODE_3}}

### Mixins

Jackson has support for mixins that can be used to mix additional annotations into those already declared on a target class.
Spring Boot’s Jackson auto-configuration will scan your application’s packages for classes annotated with [`@JacksonMixin`][r12] and register them with the auto-configured [`JsonMapper`][r1].
The registration is performed by Spring Boot’s [`JacksonMixinModule`][r13].

## Jackson 2

Deprecated auto-configuration for Jackson 2 is provided by the `spring-boot-jackson2` module.
When this module is on the classpath a [`ObjectMapper`][r14] bean is automatically configured.
Several `spring.jackson2.*` configuration properties are provided for customizing the configuration.
To take more control, define one or more [`Jackson2ObjectMapperBuilderCustomizer`][r15] beans.

When both Jackson 3 and Jackson 2 are present, various configuration properties can be used to indicate that Jackson 2 is preferred:

- `spring.graphql.rsocket.preferred-json-mapper`
- `spring.http.codecs.preferred-json-mapper` (used by Spring WebFlux and reactive HTTP clients)
- `spring.http.converters.preferred-json-mapper` (used by Spring MVC and imperative HTTP clients)
- `spring.rsocket.preferred-mapper`
- `spring.websocket.messaging.preferred-json-mapper`

In each case, set the relevant property to `jackson2` to indicate that Jackson 2 is preferred.

## Gson

Auto-configuration for Gson is provided.
When Gson is on the classpath a [`Gson`][r16] bean is automatically configured.
Several `spring.gson.*` configuration properties are provided for customizing the configuration.
To take more control, one or more [`GsonBuilderCustomizer`][r17] beans can be used.

## JSON-B

Auto-configuration for JSON-B is provided.
When the JSON-B API and an implementation are on the classpath a [`Jsonb`][r18] bean will be automatically configured.
The preferred JSON-B implementation is Eclipse Yasson for which dependency management is provided.

## Kotlin Serialization

Auto-configuration for Kotlin Serialization is provided.
When `kotlinx-serialization-json` is on the classpath a [Json][r19] bean is automatically configured.
Several `spring.kotlinx.serialization.json.*` configuration properties are provided for customizing the configuration.
