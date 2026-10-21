# Apache Kafka 支援

<!-- source-attribution -->
> **非官方繁體中文翻譯** · Spring Boot 4.1.1 · 翻譯日期：2026-10-21  
> [官方英文網站](https://docs.spring.io/spring-boot/4.1/reference/messaging/kafka.html) · [固定版本英文來源](https://github.com/spring-projects/spring-boot/blob/v4.1.1/documentation/spring-boot-docs/src/docs/antora/modules/reference/pages/messaging/kafka.adoc) · [本地原文快照](../sources/spring-boot/documentation/spring-boot-docs/src/docs/antora/modules/reference/pages/messaging/kafka.adoc)  
> 原始作者與授權見 [來源聲明](../NOTICE.md)。官方範例及設定鍵保留原文，額外圖解另標示為譯者補充。

<!-- translation-status: translated -->

Spring Boot 透過 `spring-kafka` 專案的自動設定，支援 [Apache Kafka][messaging--kafka-r1]。

Kafka 設定由 `spring.kafka.*` 外部化屬性控制。例如，可在 `application.properties` 宣告：

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

> **提示：**若要在啟動時建立 topic，請加入 [`NewTopic`][messaging--kafka-r2] Bean。如果 topic 已存在，就會忽略該 Bean。

其他選項請參閱 [`KafkaProperties`][messaging--kafka-r3]。

## 傳送訊息

Spring 的 [`KafkaTemplate`][messaging--kafka-r4] 會自動設定，可直接注入自己的 Bean：

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

> **注意：**如果設定 `spring.kafka.producer.transaction-id-prefix`，會自動設定 [`KafkaTransactionManager`][messaging--kafka-r5]。如果定義 [`RecordMessageConverter`][messaging--kafka-r6] Bean，也會自動關聯至自動設定的 [`KafkaTemplate`][messaging--kafka-r4]。

若應用程式內容中有 `KafkaTemplateObservationConvention` Bean，會自動註冊到 `KafkaTemplate`。

## 接收訊息

當 Apache Kafka 基礎設施存在時，可以在 Bean 使用 [`@KafkaListener`][messaging--kafka-r7] 建立監聽端點。若未定義 [`KafkaListenerContainerFactory`][messaging--kafka-r8]，則使用 `spring.kafka.listener.*` 中的設定鍵，自動設定預設工廠。

下例在 `someTopic` 建立監聽端點：

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

如果定義 [`KafkaTransactionManager`][messaging--kafka-r5] Bean，會自動關聯至容器工廠。同樣地，[`RecordFilterStrategy`][messaging--kafka-r9]、[`CommonErrorHandler`][messaging--kafka-r10]、[`AfterRollbackProcessor`][messaging--kafka-r11] 或 [`ConsumerAwareRebalanceListener`][messaging--kafka-r12] Bean，也會自動與預設工廠關聯。

依監聽器類型，預設工廠會關聯 [`RecordMessageConverter`][messaging--kafka-r6] 或 [`BatchMessageConverter`][messaging--kafka-r13]。若批次監聽器只有 `RecordMessageConverter`，會將它包裝在 `BatchMessageConverter` 內。

> **提示：**自訂 [`ChainedKafkaTransactionManager`][messaging--kafka-r14] 必須標記為 [`@Primary`][messaging--kafka-r15]，因為它通常會參照自動設定的 [`KafkaTransactionManager`][messaging--kafka-r5] Bean。

若應用程式內容中有 `KafkaListenerObservationConvention` Bean，會自動註冊至容器工廠。

## Kafka Streams

Spring for Apache Kafka 提供 factory bean，建立 [`StreamsBuilder`][messaging--kafka-r16] 並管理其串流的生命週期。只要 classpath 中有 `kafka-streams`，並以 [`@EnableKafkaStreams`][messaging--kafka-r18] 啟用 Kafka Streams，Spring Boot 就會自動設定所需的 [`KafkaStreamsConfiguration`][messaging--kafka-r17] Bean。

啟用 Kafka Streams 時，必須設定 application id 與 bootstrap servers。前者使用 `spring.kafka.streams.application-id`；若未設定，預設採用 `spring.application.name`。後者可以全域設定，也可以只針對 streams 覆寫。

有些額外屬性具有專用設定；其他任意 Kafka 屬性可透過 `spring.kafka.streams.properties` 命名空間設定。詳見[其他 Kafka 屬性][messaging--kafka-r19]。

若要使用 factory bean，請將 [`StreamsBuilder`][messaging--kafka-r16] 注入 [`@Bean`][messaging--kafka-r20] 方法：

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

預設情況下，`StreamsBuilder` 管理的串流會自動啟動。可透過 `spring.kafka.streams.auto-startup` 調整此行為。

> **提示：**也可以註冊任意數量的 [`StreamsBuilderFactoryBeanConfigurer`][messaging--kafka-r21] Bean，進行進階客製。

## 其他 Kafka 屬性

自動設定支援的屬性列於附錄的[整合屬性][messaging--kafka-r22]。大部分屬性無論使用連字號或 camelCase，都直接對應 Apache Kafka 以點號分隔的屬性；詳情請參閱 Kafka 文件。

名稱中未包含用戶端類型（`producer`、`consumer`、`admin` 或 `streams`）的屬性，視為共用屬性，套用至所有用戶端。如有需要，大多數共用屬性都可針對一個或多個用戶端類型覆寫。

Apache Kafka 將屬性的重要性分為 HIGH、MEDIUM 與 LOW。Spring Boot 自動設定支援所有 HIGH 屬性、部分挑選的 MEDIUM 與 LOW 屬性，以及所有沒有預設值的屬性。

只有 Kafka 支援屬性的一部分，能直接透過 [`KafkaProperties`][messaging--kafka-r3] 設定。若要針對個別用戶端類型設定未直接支援的其他屬性，可以使用：

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

此例將共用 `prop.one` 設為 `first`，套用至 producer、consumer、admin 與 streams；admin 的 `prop.two` 設為 `second`，consumer 的 `prop.three` 設為 `third`，producer 的 `prop.four` 設為 `fourth`，streams 的 `prop.five` 設為 `fifth`。

也可如下設定 Spring Kafka 的 [`JacksonJsonDeserializer`][messaging--kafka-r23]：

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

同樣地，可停用 [`JacksonJsonSerializer`][messaging--kafka-r24] 預設將型別資訊放入標頭的行為：

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

> **重要：**以這種方式設定的屬性，會覆寫 Spring Boot 明確支援的任何對應設定項目。

## 使用內嵌 Kafka 測試

Spring for Apache Kafka 提供方便的內嵌 Apache Kafka broker 測試方式。若要使用，請在測試類別加上 `spring-kafka-test` 模組的 [`@EmbeddedKafka`][messaging--kafka-r25]。詳見 Spring for Apache Kafka [參考手冊][messaging--kafka-r26]。

要讓 Spring Boot 自動設定搭配此內嵌 broker，必須把內嵌 broker 地址的系統屬性（由 [`EmbeddedKafkaBroker`][messaging--kafka-r27] 填入），重新對映至 Spring Boot 的 Kafka 設定屬性。可採用以下方式：

- 在測試類別提供系統屬性，將內嵌 broker 地址對映至 `spring.kafka.bootstrap-servers`：

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

- 在 [`@EmbeddedKafka`][messaging--kafka-r25] 上設定屬性名稱：

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

- 在設定屬性中使用佔位符：

```properties
spring.kafka.bootstrap-servers=${spring.embedded.kafka.brokers}
```

```yaml
spring:
  kafka:
    bootstrap-servers: "${spring.embedded.kafka.brokers}"
```

[messaging--kafka-r1]: https://kafka.apache.org/
[messaging--kafka-r2]: https://kafka.apache.org/42/javadoc/org/apache/kafka/clients/admin/NewTopic.html
[messaging--kafka-r3]: https://docs.spring.io/spring-boot/4.1.1/api/java/org/springframework/boot/kafka/autoconfigure/KafkaProperties.html
[messaging--kafka-r4]: https://docs.spring.io/spring-kafka/docs/4.1.x/api/org/springframework/kafka/core/KafkaTemplate.html
[messaging--kafka-r5]: https://docs.spring.io/spring-kafka/docs/4.1.x/api/org/springframework/kafka/transaction/KafkaTransactionManager.html
[messaging--kafka-r6]: https://docs.spring.io/spring-kafka/docs/4.1.x/api/org/springframework/kafka/support/converter/RecordMessageConverter.html
[messaging--kafka-r7]: https://docs.spring.io/spring-kafka/docs/4.1.x/api/org/springframework/kafka/annotation/KafkaListener.html
[messaging--kafka-r8]: https://docs.spring.io/spring-kafka/docs/4.1.x/api/org/springframework/kafka/config/KafkaListenerContainerFactory.html
[messaging--kafka-r9]: https://docs.spring.io/spring-kafka/docs/4.1.x/api/org/springframework/kafka/listener/adapter/RecordFilterStrategy.html
[messaging--kafka-r10]: https://docs.spring.io/spring-kafka/docs/4.1.x/api/org/springframework/kafka/listener/CommonErrorHandler.html
[messaging--kafka-r11]: https://docs.spring.io/spring-kafka/docs/4.1.x/api/org/springframework/kafka/listener/AfterRollbackProcessor.html
[messaging--kafka-r12]: https://docs.spring.io/spring-kafka/docs/4.1.x/api/org/springframework/kafka/listener/ConsumerAwareRebalanceListener.html
[messaging--kafka-r13]: https://docs.spring.io/spring-kafka/docs/4.1.x/api/org/springframework/kafka/support/converter/BatchMessageConverter.html
[messaging--kafka-r14]: https://docs.spring.io/spring-kafka/docs/4.1.x/api/org/springframework/kafka/transaction/ChainedKafkaTransactionManager.html
[messaging--kafka-r15]: https://docs.spring.io/spring-framework/docs/7.0.x/javadoc-api/org/springframework/context/annotation/Primary.html
[messaging--kafka-r16]: https://kafka.apache.org/42/javadoc/org/apache/kafka/streams/StreamsBuilder.html
[messaging--kafka-r17]: https://docs.spring.io/spring-kafka/docs/4.1.x/api/org/springframework/kafka/config/KafkaStreamsConfiguration.html
[messaging--kafka-r18]: https://docs.spring.io/spring-kafka/docs/4.1.x/api/org/springframework/kafka/annotation/EnableKafkaStreams.html
[messaging--kafka-r19]: https://docs.spring.io/spring-boot/4.1/reference/messaging/kafka.html#messaging.kafka.additional-properties
[messaging--kafka-r20]: https://docs.spring.io/spring-framework/docs/7.0.x/javadoc-api/org/springframework/context/annotation/Bean.html
[messaging--kafka-r21]: https://docs.spring.io/spring-kafka/docs/4.1.x/api/org/springframework/kafka/config/StreamsBuilderFactoryBeanConfigurer.html
[messaging--kafka-r22]: https://docs.spring.io/spring-boot/4.1/appendix/application-properties/index.html#appendix.application-properties.integration
[messaging--kafka-r23]: https://docs.spring.io/spring-kafka/docs/4.1.x/api/org/springframework/kafka/support/serializer/JacksonJsonDeserializer.html
[messaging--kafka-r24]: https://docs.spring.io/spring-kafka/docs/4.1.x/api/org/springframework/kafka/support/serializer/JacksonJsonSerializer.html
[messaging--kafka-r25]: https://docs.spring.io/spring-kafka/docs/4.1.x/api/org/springframework/kafka/test/context/EmbeddedKafka.html
[messaging--kafka-r26]: https://docs.spring.io/spring-kafka/reference/4.1/testing.html#ekb
[messaging--kafka-r27]: https://docs.spring.io/spring-kafka/docs/4.1.x/api/org/springframework/kafka/test/EmbeddedKafkaBroker.html
