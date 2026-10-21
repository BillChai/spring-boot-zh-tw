# Apache Kafka 支援

Spring Boot 透過 `spring-kafka` 專案的自動設定，支援 [Apache Kafka][r1]。

Kafka 設定由 `spring.kafka.*` 外部化屬性控制。例如，可在 `application.properties` 宣告：

{{CODE_0}}

{{CODE_1}}

> **提示：**若要在啟動時建立 topic，請加入 [`NewTopic`][r2] Bean。如果 topic 已存在，就會忽略該 Bean。

其他選項請參閱 [`KafkaProperties`][r3]。

## 傳送訊息

Spring 的 [`KafkaTemplate`][r4] 會自動設定，可直接注入自己的 Bean：

{{CODE_2}}

{{CODE_3}}

> **注意：**如果設定 `spring.kafka.producer.transaction-id-prefix`，會自動設定 [`KafkaTransactionManager`][r5]。如果定義 [`RecordMessageConverter`][r6] Bean，也會自動關聯至自動設定的 [`KafkaTemplate`][r4]。

若應用程式內容中有 `KafkaTemplateObservationConvention` Bean，會自動註冊到 `KafkaTemplate`。

## 接收訊息

當 Apache Kafka 基礎設施存在時，可以在 Bean 使用 [`@KafkaListener`][r7] 建立監聽端點。若未定義 [`KafkaListenerContainerFactory`][r8]，則使用 `spring.kafka.listener.*` 中的設定鍵，自動設定預設工廠。

下例在 `someTopic` 建立監聽端點：

{{CODE_4}}

{{CODE_5}}

如果定義 [`KafkaTransactionManager`][r5] Bean，會自動關聯至容器工廠。同樣地，[`RecordFilterStrategy`][r9]、[`CommonErrorHandler`][r10]、[`AfterRollbackProcessor`][r11] 或 [`ConsumerAwareRebalanceListener`][r12] Bean，也會自動與預設工廠關聯。

依監聽器類型，預設工廠會關聯 [`RecordMessageConverter`][r6] 或 [`BatchMessageConverter`][r13]。若批次監聽器只有 `RecordMessageConverter`，會將它包裝在 `BatchMessageConverter` 內。

> **提示：**自訂 [`ChainedKafkaTransactionManager`][r14] 必須標記為 [`@Primary`][r15]，因為它通常會參照自動設定的 [`KafkaTransactionManager`][r5] Bean。

若應用程式內容中有 `KafkaListenerObservationConvention` Bean，會自動註冊至容器工廠。

## Kafka Streams

Spring for Apache Kafka 提供 factory bean，建立 [`StreamsBuilder`][r16] 並管理其串流的生命週期。只要 classpath 中有 `kafka-streams`，並以 [`@EnableKafkaStreams`][r18] 啟用 Kafka Streams，Spring Boot 就會自動設定所需的 [`KafkaStreamsConfiguration`][r17] Bean。

啟用 Kafka Streams 時，必須設定 application id 與 bootstrap servers。前者使用 `spring.kafka.streams.application-id`；若未設定，預設採用 `spring.application.name`。後者可以全域設定，也可以只針對 streams 覆寫。

有些額外屬性具有專用設定；其他任意 Kafka 屬性可透過 `spring.kafka.streams.properties` 命名空間設定。詳見[其他 Kafka 屬性][r19]。

若要使用 factory bean，請將 [`StreamsBuilder`][r16] 注入 [`@Bean`][r20] 方法：

{{CODE_6}}

{{CODE_7}}

預設情況下，`StreamsBuilder` 管理的串流會自動啟動。可透過 `spring.kafka.streams.auto-startup` 調整此行為。

> **提示：**也可以註冊任意數量的 [`StreamsBuilderFactoryBeanConfigurer`][r21] Bean，進行進階客製。

## 其他 Kafka 屬性

自動設定支援的屬性列於附錄的[整合屬性][r22]。大部分屬性無論使用連字號或 camelCase，都直接對應 Apache Kafka 以點號分隔的屬性；詳情請參閱 Kafka 文件。

名稱中未包含用戶端類型（`producer`、`consumer`、`admin` 或 `streams`）的屬性，視為共用屬性，套用至所有用戶端。如有需要，大多數共用屬性都可針對一個或多個用戶端類型覆寫。

Apache Kafka 將屬性的重要性分為 HIGH、MEDIUM 與 LOW。Spring Boot 自動設定支援所有 HIGH 屬性、部分挑選的 MEDIUM 與 LOW 屬性，以及所有沒有預設值的屬性。

只有 Kafka 支援屬性的一部分，能直接透過 [`KafkaProperties`][r3] 設定。若要針對個別用戶端類型設定未直接支援的其他屬性，可以使用：

{{CODE_8}}

{{CODE_9}}

此例將共用 `prop.one` 設為 `first`，套用至 producer、consumer、admin 與 streams；admin 的 `prop.two` 設為 `second`，consumer 的 `prop.three` 設為 `third`，producer 的 `prop.four` 設為 `fourth`，streams 的 `prop.five` 設為 `fifth`。

也可如下設定 Spring Kafka 的 [`JacksonJsonDeserializer`][r23]：

{{CODE_10}}

{{CODE_11}}

同樣地，可停用 [`JacksonJsonSerializer`][r24] 預設將型別資訊放入標頭的行為：

{{CODE_12}}

{{CODE_13}}

> **重要：**以這種方式設定的屬性，會覆寫 Spring Boot 明確支援的任何對應設定項目。

## 使用內嵌 Kafka 測試

Spring for Apache Kafka 提供方便的內嵌 Apache Kafka broker 測試方式。若要使用，請在測試類別加上 `spring-kafka-test` 模組的 [`@EmbeddedKafka`][r25]。詳見 Spring for Apache Kafka [參考手冊][r26]。

要讓 Spring Boot 自動設定搭配此內嵌 broker，必須把內嵌 broker 地址的系統屬性（由 [`EmbeddedKafkaBroker`][r27] 填入），重新對映至 Spring Boot 的 Kafka 設定屬性。可採用以下方式：

- 在測試類別提供系統屬性，將內嵌 broker 地址對映至 `spring.kafka.bootstrap-servers`：

{{CODE_14}}

{{CODE_15}}

- 在 [`@EmbeddedKafka`][r25] 上設定屬性名稱：

{{CODE_16}}

{{CODE_17}}

- 在設定屬性中使用佔位符：

{{CODE_18}}

{{CODE_19}}
