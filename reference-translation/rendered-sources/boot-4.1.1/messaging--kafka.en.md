# Apache Kafka Support

[Apache Kafka][r1] is supported by providing auto-configuration of the `spring-kafka` project.

Kafka configuration is controlled by external configuration properties in `spring.kafka.*`.
For example, you might declare the following section in `application.properties`:

```properties
spring.kafka.bootstrap-servers=localhost:9092
spring.kafka.consumer.group-id=myGroup
```

```yaml
spring:
  kafka:
    bootstrap-servers: "localhost:9092"
    consumer:
      group-id: "myGroup"
```

> [TIP]
>
> To create a topic on startup, add a bean of type [`NewTopic`][r2].
> If the topic already exists, the bean is ignored.

See [`KafkaProperties`][r3] for more supported options.

## Sending a Message

Spring’s [`KafkaTemplate`][r4] is auto-configured, and you can autowire it directly in your own beans, as shown in the following example:

```kotlin
import org.springframework.kafka.core.KafkaTemplate
import org.springframework.stereotype.Component

@Component
class MyBean(private val kafkaTemplate: KafkaTemplate<String, String>) {

	// ...

	fun someMethod() {
		kafkaTemplate.send("someTopic", "Hello")
	}

}
```

```java
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

@Component
public class MyBean {

	private final KafkaTemplate<String, String> kafkaTemplate;

	public MyBean(KafkaTemplate<String, String> kafkaTemplate) {
		this.kafkaTemplate = kafkaTemplate;
	}

	// ...

	public void someMethod() {
		this.kafkaTemplate.send("someTopic", "Hello");
	}

}
```

> [NOTE]
>
> If the property `spring.kafka.producer.transaction-id-prefix` is defined, a [`KafkaTransactionManager`][r5] is automatically configured.
> Also, if a [`RecordMessageConverter`][r6] bean is defined, it is automatically associated to the auto-configured [`KafkaTemplate`][r4].

If there’s a bean of type `KafkaTemplateObservationConvention` in the context, it is automatically registered on the `KafkaTemplate`.

## Receiving a Message

When the Apache Kafka infrastructure is present, any bean can be annotated with [`@KafkaListener`][r7] to create a listener endpoint.
If no [`KafkaListenerContainerFactory`][r8] has been defined, a default one is automatically configured with keys defined in `spring.kafka.listener.*`.

The following component creates a listener endpoint on the `someTopic` topic:

```kotlin
import org.springframework.kafka.annotation.KafkaListener
import org.springframework.stereotype.Component

@Component
class MyBean {

	@KafkaListener(topics = ["someTopic"])
	fun processMessage(content: String?) {
		// ...
	}

}
```

```java
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Component
public class MyBean {

	@KafkaListener(topics = "someTopic")
	public void processMessage(String content) {
		// ...
	}

}
```

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

```kotlin
import org.apache.kafka.common.serialization.Serdes
import org.apache.kafka.streams.KeyValue
import org.apache.kafka.streams.StreamsBuilder
import org.apache.kafka.streams.kstream.KStream
import org.apache.kafka.streams.kstream.Produced
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.kafka.annotation.EnableKafkaStreams
import org.springframework.kafka.support.serializer.JacksonJsonSerde

@Configuration(proxyBeanMethods = false)
@EnableKafkaStreams
class MyKafkaStreamsConfiguration {

	@Bean
	fun kStream(streamsBuilder: StreamsBuilder): KStream<Int, String> {
		val stream = streamsBuilder.stream<Int, String>("ks1In")
		stream.map(this::uppercaseValue).to("ks1Out", Produced.with(Serdes.Integer(), JacksonJsonSerde()))
		return stream
	}

	private fun uppercaseValue(key: Int, value: String): KeyValue<Int, String> {
		return KeyValue(key, value.uppercase())
	}

}
```

```java
import java.util.Locale;

import org.apache.kafka.common.serialization.Serdes;
import org.apache.kafka.streams.KeyValue;
import org.apache.kafka.streams.StreamsBuilder;
import org.apache.kafka.streams.kstream.KStream;
import org.apache.kafka.streams.kstream.Produced;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.annotation.EnableKafkaStreams;
import org.springframework.kafka.support.serializer.JacksonJsonSerde;

@Configuration(proxyBeanMethods = false)
@EnableKafkaStreams
public class MyKafkaStreamsConfiguration {

	@Bean
	public KStream<Integer, String> kStream(StreamsBuilder streamsBuilder) {
		KStream<Integer, String> stream = streamsBuilder.stream("ks1In");
		stream.map(this::uppercaseValue).to("ks1Out", Produced.with(Serdes.Integer(), new JacksonJsonSerde<>()));
		return stream;
	}

	private KeyValue<Integer, String> uppercaseValue(Integer key, String value) {
		return new KeyValue<>(key, value.toUpperCase(Locale.getDefault()));
	}

}
```

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

```properties
spring.kafka.properties[prop.one]=first
spring.kafka.admin.properties[prop.two]=second
spring.kafka.consumer.properties[prop.three]=third
spring.kafka.producer.properties[prop.four]=fourth
spring.kafka.streams.properties[prop.five]=fifth
```

```yaml
spring:
  kafka:
    properties:
      "[prop.one]": "first"
    admin:
      properties:
        "[prop.two]": "second"
    consumer:
      properties:
        "[prop.three]": "third"
    producer:
      properties:
        "[prop.four]": "fourth"
    streams:
      properties:
        "[prop.five]": "fifth"
```

This sets the common `prop.one` Kafka property to `first` (applies to producers, consumers, admins, and streams), the `prop.two` admin property to `second`, the `prop.three` consumer property to `third`, the `prop.four` producer property to `fourth` and the `prop.five` streams property to `fifth`.

You can also configure the Spring Kafka [`JacksonJsonDeserializer`][r23] as follows:

```properties
spring.kafka.consumer.value-deserializer=org.springframework.kafka.support.serializer.JacksonJsonDeserializer
spring.kafka.consumer.properties[spring.json.value.default.type]=com.example.Invoice
spring.kafka.consumer.properties[spring.json.trusted.packages]=com.example.main,com.example.another
```

```yaml
spring:
  kafka:
    consumer:
      value-deserializer: "org.springframework.kafka.support.serializer.JacksonJsonDeserializer"
      properties:
        "[spring.json.value.default.type]": "com.example.Invoice"
        "[spring.json.trusted.packages]": "com.example.main,com.example.another"
```

Similarly, you can disable the [`JacksonJsonSerializer`][r24] default behavior of sending type information in headers:

```properties
spring.kafka.producer.value-serializer=org.springframework.kafka.support.serializer.JacksonJsonSerializer
spring.kafka.producer.properties[spring.json.add.type.headers]=false
```

```yaml
spring:
  kafka:
    producer:
      value-serializer: "org.springframework.kafka.support.serializer.JacksonJsonSerializer"
      properties:
        "[spring.json.add.type.headers]": false
```

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

```kotlin
	init {
		System.setProperty(EmbeddedKafkaBroker.BROKER_LIST_PROPERTY, "spring.kafka.bootstrap-servers")
	}
```

```java
	static {
		System.setProperty(EmbeddedKafkaBroker.BROKER_LIST_PROPERTY, "spring.kafka.bootstrap-servers");
	}
```

- Configure a property name on the [`@EmbeddedKafka`][r25] annotation:

```kotlin
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.kafka.test.context.EmbeddedKafka

@SpringBootTest
@EmbeddedKafka(topics = ["someTopic"], bootstrapServersProperty = "spring.kafka.bootstrap-servers")
class MyTest {

	// ...

}
```

```java
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.kafka.test.context.EmbeddedKafka;

@SpringBootTest
@EmbeddedKafka(topics = "someTopic", bootstrapServersProperty = "spring.kafka.bootstrap-servers")
class MyTest {

	// ...

}
```

- Use a placeholder in configuration properties:

```properties
spring.kafka.bootstrap-servers=${spring.embedded.kafka.brokers}
```

```yaml
spring:
  kafka:
    bootstrap-servers: "${spring.embedded.kafka.brokers}"
```
