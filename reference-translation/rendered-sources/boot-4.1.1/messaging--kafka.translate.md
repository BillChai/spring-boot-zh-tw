# Apache Kafka Support

[Apache Kafka][r1] is supported by providing auto-configuration of the `spring-kafka` project.

Kafka configuration is controlled by external configuration properties in `spring.kafka.*`.
For example, you might declare the following section in `application.properties`:

{{CODE_0}}

{{CODE_1}}

> [TIP]
>
> To create a topic on startup, add a bean of type [`NewTopic`][r2].
> If the topic already exists, the bean is ignored.

See [`KafkaProperties`][r3] for more supported options.

## Sending a Message

Spring’s [`KafkaTemplate`][r4] is auto-configured, and you can autowire it directly in your own beans, as shown in the following example:

{{CODE_2}}

{{CODE_3}}

> [NOTE]
>
> If the property `spring.kafka.producer.transaction-id-prefix` is defined, a [`KafkaTransactionManager`][r5] is automatically configured.
> Also, if a [`RecordMessageConverter`][r6] bean is defined, it is automatically associated to the auto-configured [`KafkaTemplate`][r4].

If there’s a bean of type `KafkaTemplateObservationConvention` in the context, it is automatically registered on the `KafkaTemplate`.

## Receiving a Message

When the Apache Kafka infrastructure is present, any bean can be annotated with [`@KafkaListener`][r7] to create a listener endpoint.
If no [`KafkaListenerContainerFactory`][r8] has been defined, a default one is automatically configured with keys defined in `spring.kafka.listener.*`.

The following component creates a listener endpoint on the `someTopic` topic:

{{CODE_4}}

{{CODE_5}}

If a [`KafkaTransactionManager`][r5] bean is defined, it is automatically associated to the container factory.
Similarly, if a [`RecordFilterStrategy`][r9], [`CommonErrorHandler`][r10], [`AfterRollbackProcessor`][r11] or [`ConsumerAwareRebalanceListener`][r12] bean is defined, it is automatically associated to the default factory.

Depending on the listener type, a [`RecordMessageConverter`][r6] or [`BatchMessageConverter`][r13] bean is associated to the default factory.
If only a [`RecordMessageConverter`][r6] bean is present for a batch listener, it is wrapped in a [`BatchMessageConverter`][r13].

> [TIP]
>
> A custom [`ChainedKafkaTransactionManager`][r14] must be marked [`@Primary`][r15] as it usually references the auto-configured [`KafkaTransactionManager`][r5] bean.

If there’s a bean of type `KafkaListenerObservationConvention` in the context, it is automatically registered on the container factory.

## Kafka Streams

Spring for Apache Kafka provides a factory bean to create a [`StreamsBuilder`][r16] object and manage the lifecycle of its streams.
Spring Boot auto-configures the required [`KafkaStreamsConfiguration`][r17] bean as long as `kafka-streams` is on the classpath and Kafka Streams is enabled by the [`@EnableKafkaStreams`][r18] annotation.

Enabling Kafka Streams means that the application id and bootstrap servers must be set.
The former can be configured using `spring.kafka.streams.application-id`, defaulting to `spring.application.name` if not set.
The latter can be set globally or specifically overridden only for streams.

Several additional properties are available using dedicated properties; other arbitrary Kafka properties can be set using the `spring.kafka.streams.properties` namespace.
See also [Additional Kafka Properties][r19] for more information.

To use the factory bean, wire [`StreamsBuilder`][r16] into your [`@Bean`][r20] as shown in the following example:

{{CODE_6}}

{{CODE_7}}

By default, the streams managed by the [`StreamsBuilder`][r16] object are started automatically.
You can customize this behavior using the `spring.kafka.streams.auto-startup` property.

> [TIP]
>
> You can also register an arbitrary number of beans that implement [`StreamsBuilderFactoryBeanConfigurer`][r21] for more advanced customizations.

## Additional Kafka Properties

The properties supported by auto configuration are shown in the [Integration Properties][r22] section of the Appendix.
Note that, for the most part, these properties (hyphenated or camelCase) map directly to the Apache Kafka dotted properties.
See the Apache Kafka documentation for details.

Properties that don’t include a client type (`producer`, `consumer`, `admin`, or `streams`) in their name are considered to be common and apply to all clients.
Most of these common properties can be overridden for one or more of the client types, if needed.

Apache Kafka designates properties with an importance of HIGH, MEDIUM, or LOW.
Spring Boot auto-configuration supports all HIGH importance properties, some selected MEDIUM and LOW properties, and any properties that do not have a default value.

Only a subset of the properties supported by Kafka are available directly through the [`KafkaProperties`][r3] class.
If you wish to configure the individual client types with additional properties that are not directly supported, use the following properties:

{{CODE_8}}

{{CODE_9}}

This sets the common `prop.one` Kafka property to `first` (applies to producers, consumers, admins, and streams), the `prop.two` admin property to `second`, the `prop.three` consumer property to `third`, the `prop.four` producer property to `fourth` and the `prop.five` streams property to `fifth`.

You can also configure the Spring Kafka [`JacksonJsonDeserializer`][r23] as follows:

{{CODE_10}}

{{CODE_11}}

Similarly, you can disable the [`JacksonJsonSerializer`][r24] default behavior of sending type information in headers:

{{CODE_12}}

{{CODE_13}}

> [IMPORTANT]
>
> Properties set in this way override any configuration item that Spring Boot explicitly supports.

## Testing with Embedded Kafka

Spring for Apache Kafka provides a convenient way to test projects with an embedded Apache Kafka broker.
To use this feature, annotate a test class with [`@EmbeddedKafka`][r25] from the `spring-kafka-test` module.
For more information, please see the Spring for Apache Kafka [reference manual][r26].

To make Spring Boot auto-configuration work with the aforementioned embedded Apache Kafka broker, you need to remap a system property for embedded broker addresses (populated by the [`EmbeddedKafkaBroker`][r27]) into the Spring Boot configuration property for Apache Kafka.
There are several ways to do that:

- Provide a system property to map embedded broker addresses into `spring.kafka.bootstrap-servers` in the test class:

{{CODE_14}}

{{CODE_15}}

- Configure a property name on the [`@EmbeddedKafka`][r25] annotation:

{{CODE_16}}

{{CODE_17}}

- Use a placeholder in configuration properties:

{{CODE_18}}

{{CODE_19}}
