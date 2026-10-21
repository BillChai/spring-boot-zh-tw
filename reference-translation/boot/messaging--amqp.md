# AMQP

<!-- source-attribution -->
> **非官方繁體中文翻譯** · Spring Boot 4.1.1 · 翻譯日期：2026-10-21  
> [官方英文網站](https://docs.spring.io/spring-boot/4.1/reference/messaging/amqp.html) · [固定版本英文來源](https://github.com/spring-projects/spring-boot/blob/v4.1.1/documentation/spring-boot-docs/src/docs/antora/modules/reference/pages/messaging/amqp.adoc) · [本地原文快照](../sources/spring-boot/documentation/spring-boot-docs/src/docs/antora/modules/reference/pages/messaging/amqp.adoc)  
> 原始作者與授權見 [來源聲明](../NOTICE.md)。官方範例及設定鍵保留原文，額外圖解另標示為譯者補充。

<!-- translation-status: translated -->

Advanced Message Queuing Protocol（AMQP）是訊息導向中介軟體使用的平台中立線路層協定。Spring AMQP 將 Spring 核心概念套用到以 AMQP 為基礎的訊息解決方案。Spring Boot 提供透過 RabbitMQ 使用 AMQP 的多項便利功能，包括 `spring-boot-starter-amqp`。

## RabbitMQ 支援

[RabbitMQ][messaging--amqp-r1] 是以 AMQP 協定為基礎、輕量、可靠、可擴展且可攜的訊息 broker。Spring 使用 RabbitMQ 透過 AMQP 協定通訊。

RabbitMQ 設定由 `spring.rabbitmq.*` 外部化設定屬性控制。例如，可以在 `application.properties` 宣告：

```properties
spring.rabbitmq.host=localhost
spring.rabbitmq.port=5672
spring.rabbitmq.username=admin
spring.rabbitmq.password=secret
```

```yaml
spring:
  rabbitmq:
    host: "localhost"
    port: 5672
    username: "admin"
    password: "secret"
```

也可以用 `addresses` 屬性設定相同連線：

```properties
spring.rabbitmq.addresses=amqp://admin:secret@localhost
```

```yaml
spring:
  rabbitmq:
    addresses: "amqp://admin:secret@localhost"
```

> **注意：**以這種方式指定地址時，會忽略 `host` 與 `port` 屬性。若地址使用 `amqps` 協定，會自動啟用 SSL 支援。

其他屬性設定選項請參閱 [`RabbitProperties`][messaging--amqp-r2]。若要設定 Spring AMQP 使用的 RabbitMQ [`ConnectionFactory`][messaging--amqp-r3] 底層細節，請定義 [`ConnectionFactoryCustomizer`][messaging--amqp-r4] Bean。

如果應用程式內容中存在 [`ConnectionNameStrategy`][messaging--amqp-r5] Bean，會自動用來為自動設定的 [`CachingConnectionFactory`][messaging--amqp-r6] 所建立的連線命名。

若要對整個應用程式的 [`RabbitTemplate`][messaging--amqp-r7] 進行附加式客製，請使用 [`RabbitTemplateCustomizer`][messaging--amqp-r8] Bean。

> **提示：**更多資訊請參閱[理解 RabbitMQ 使用的 AMQP 協定][messaging--amqp-r9]。

## 傳送訊息

Spring 的 [`AmqpTemplate`][messaging--amqp-r10] 與 [`AmqpAdmin`][messaging--amqp-r11] 會自動設定，可直接注入自己的 Bean：

```kotlin
import org.springframework.amqp.core.AmqpAdmin
import org.springframework.amqp.core.AmqpTemplate
import org.springframework.stereotype.Component

@Component
class MyBean(private val amqpAdmin: AmqpAdmin, private val amqpTemplate: AmqpTemplate) {

	// ...

	fun someMethod() {
		amqpAdmin.getQueueInfo("someQueue")
	}

	fun someOtherMethod() {
		amqpTemplate.convertAndSend("hello")
	}

}
```

```java
import org.springframework.amqp.core.AmqpAdmin;
import org.springframework.amqp.core.AmqpTemplate;
import org.springframework.stereotype.Component;

@Component
public class MyBean {

	private final AmqpAdmin amqpAdmin;

	private final AmqpTemplate amqpTemplate;

	public MyBean(AmqpAdmin amqpAdmin, AmqpTemplate amqpTemplate) {
		this.amqpAdmin = amqpAdmin;
		this.amqpTemplate = amqpTemplate;
	}

	// ...

	public void someMethod() {
		this.amqpAdmin.getQueueInfo("someQueue");
	}

	public void someOtherMethod() {
		this.amqpTemplate.convertAndSend("hello");
	}

}
```

> **注意：**[`RabbitMessagingTemplate`][messaging--amqp-r12] 也可以用類似方式注入。如果定義 [`MessageConverter`][messaging--amqp-r13] Bean，會自動與自動設定的 [`AmqpTemplate`][messaging--amqp-r10] 關聯。

如有需要，任何定義成 Bean 的 [`Queue`][messaging--amqp-r14] 都會自動用來在 RabbitMQ 實例上宣告對應佇列。

可以為 [`AmqpTemplate`][messaging--amqp-r10] 啟用重試，例如在 broker 連線中斷時重試操作：

```properties
spring.rabbitmq.template.retry.enabled=true
spring.rabbitmq.template.retry.initial-interval=2s
```

```yaml
spring:
  rabbitmq:
    template:
      retry:
        enabled: true
        initial-interval: "2s"
```

預設不啟用重試。也可以宣告 [`RabbitTemplateRetrySettingsCustomizer`][messaging--amqp-r16] Bean，以程式客製 [`RetryTemplate`][messaging--amqp-r15]。

如果需要建立更多 [`RabbitTemplate`][messaging--amqp-r7] 實例，或覆寫預設值，Spring Boot 提供 [`RabbitTemplateConfigurer`][messaging--amqp-r17] Bean，可使用與自動設定所使用工廠相同的設定，初始化自己的 `RabbitTemplate`。

如果應用程式內容中有 [`RabbitTemplateObservationConvention`][messaging--amqp-r18] Bean，會自動設定到 [`RabbitTemplate`][messaging--amqp-r7]。

## 傳送訊息至 Stream

若要傳送訊息至特定 stream，請指定其名稱：

```properties
spring.rabbitmq.stream.name=my-stream
```

```yaml
spring:
  rabbitmq:
    stream:
      name: "my-stream"
```

如果定義 [`MessageConverter`][messaging--amqp-r13]、[`StreamMessageConverter`][messaging--amqp-r19]、[`ProducerCustomizer`][messaging--amqp-r20] 或 [`RabbitStreamTemplateObservationConvention`][messaging--amqp-r21] Bean，會自動關聯至自動設定的 [`RabbitStreamTemplate`][messaging--amqp-r22]。

若需要建立更多 [`RabbitStreamTemplate`][messaging--amqp-r22] 實例，或覆寫預設值，Spring Boot 提供 [`RabbitStreamTemplateConfigurer`][messaging--amqp-r23] Bean，可使用與自動設定工廠相同的設定，初始化自己的 `RabbitStreamTemplate`。

### SSL

若要讓 RabbitMQ Streams 使用 SSL，請將 `spring.rabbitmq.stream.ssl.enabled` 設為 `true`，或透過 `spring.rabbitmq.stream.ssl.bundle` 指定要使用的 [SSL bundle][messaging--amqp-r24]。

## 接收訊息

當 Rabbit 基礎設施存在時，可以在 Bean 使用 [`@RabbitListener`][messaging--amqp-r25] 建立監聽端點。如果未定義 [`RabbitListenerContainerFactory`][messaging--amqp-r26]，會自動設定預設的 [`SimpleRabbitListenerContainerFactory`][messaging--amqp-r27]；可透過 `spring.rabbitmq.listener.type` 改用 direct 容器。

如果定義 [`MessageConverter`][messaging--amqp-r13]、[`MessageRecoverer`][messaging--amqp-r28] 或 [`RabbitListenerObservationConvention`][messaging--amqp-r29] Bean，會自動與預設工廠關聯。

下例在 `someQueue` 佇列上建立監聽端點：

```kotlin
import org.springframework.amqp.rabbit.annotation.RabbitListener
import org.springframework.stereotype.Component

@Component
class MyBean {

	@RabbitListener(queues = ["someQueue"])
	fun processMessage(content: String?) {
		// ...
	}

}
```

```java
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Component
public class MyBean {

	@RabbitListener(queues = "someQueue")
	public void processMessage(String content) {
		// ...
	}

}
```

> **提示：**更多資訊請參閱 [`@EnableRabbit`][messaging--amqp-r30]。

若需要建立更多 [`RabbitListenerContainerFactory`][messaging--amqp-r26] 實例，或覆寫預設工廠，Spring Boot 提供 [`SimpleRabbitListenerContainerFactoryConfigurer`][messaging--amqp-r31] 與 [`DirectRabbitListenerContainerFactoryConfigurer`][messaging--amqp-r32]，可分別用與自動設定相同的設定，初始化 [`SimpleRabbitListenerContainerFactory`][messaging--amqp-r27] 及 [`DirectRabbitListenerContainerFactory`][messaging--amqp-r33]。

> **提示：**不論選擇哪種容器，自動設定都會提供這兩個 configurer Bean。

例如，下列組態類別提供另一個使用特定 [`MessageConverter`][messaging--amqp-r13] 的工廠：

```kotlin
import org.springframework.amqp.rabbit.config.SimpleRabbitListenerContainerFactory
import org.springframework.amqp.rabbit.connection.CachingConnectionFactory
import org.springframework.amqp.rabbit.connection.ConnectionFactory
import org.springframework.boot.amqp.autoconfigure.SimpleRabbitListenerContainerFactoryConfigurer
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration

@Configuration(proxyBeanMethods = false)
class MyRabbitConfiguration {

	@Bean
	fun myFactory(configurer: SimpleRabbitListenerContainerFactoryConfigurer): SimpleRabbitListenerContainerFactory {
		val factory = SimpleRabbitListenerContainerFactory()
		val connectionFactory = getCustomConnectionFactory()
		configurer.configure(factory, connectionFactory)
		factory.setMessageConverter(MyMessageConverter())
		return factory
	}

	fun getCustomConnectionFactory() : ConnectionFactory {
		return ...
	}

}
```

```java
import org.springframework.amqp.rabbit.config.SimpleRabbitListenerContainerFactory;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.boot.amqp.autoconfigure.SimpleRabbitListenerContainerFactoryConfigurer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration(proxyBeanMethods = false)
public class MyRabbitConfiguration {

	@Bean
	public SimpleRabbitListenerContainerFactory myFactory(SimpleRabbitListenerContainerFactoryConfigurer configurer) {
		SimpleRabbitListenerContainerFactory factory = new SimpleRabbitListenerContainerFactory();
		ConnectionFactory connectionFactory = getCustomConnectionFactory();
		configurer.configure(factory, connectionFactory);
		factory.setMessageConverter(new MyMessageConverter());
		return factory;
	}

	private ConnectionFactory getCustomConnectionFactory() {
		return ...
	}

}
```

接著可在任何帶有 [`@RabbitListener`][messaging--amqp-r25] 的方法使用它：

```kotlin
import org.springframework.amqp.rabbit.annotation.RabbitListener
import org.springframework.stereotype.Component

@Component
class MyBean {

	@RabbitListener(queues = ["someQueue"], containerFactory = "myFactory")
	fun processMessage(content: String?) {
		// ...
	}

}
```

```java
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Component
public class MyBean {

	@RabbitListener(queues = "someQueue", containerFactory = "myFactory")
	public void processMessage(String content) {
		// ...
	}

}
```

可以啟用重試，處理監聽器拋出例外的情況。預設使用 [`RejectAndDontRequeueRecoverer`][messaging--amqp-r34]，也可以自行定義 [`MessageRecoverer`][messaging--amqp-r28]。重試次數耗盡後，訊息會被拒絕，接著遭丟棄，或在 broker 已有對應設定時送至 dead-letter exchange。

預設不啟用重試。也可以宣告 [`RabbitListenerRetrySettingsCustomizer`][messaging--amqp-r36] Bean，以程式客製 [`RetryPolicy`][messaging--amqp-r35]。

> **重要：**預設情況下，如果未啟用重試，而監聽器拋出例外，訊息投遞會無限重試。可用兩種方式改變：將 `defaultRequeueRejected` 設為 `false`，不再重新投遞；或拋出 [`AmqpRejectAndDontRequeueException`][messaging--amqp-r37]，指示應拒絕此訊息。啟用重試且達到最大投遞次數後，也會使用後者機制。

## 譯者圖解：應用端重試與 broker 重新投遞要分開看

```mermaid
flowchart TD
    Delivery["訊息送至監聽器"] --> Process["執行處理邏輯"]
    Process --> Result{"成功？"}
    Result -->|是| Success["依確認設定完成處理"]
    Result -->|否| Retry["依 listener 重試設定處理"]
    Retry --> Reject["耗盡後依 recoverer 拒絕等處理"]
    Retry --> Requeue["未啟用重試時，仍須檢查 requeue 行為"]
    Requeue -. "預設可能再次投遞" .-> Delivery
```

「停用重試」不等於 broker 永遠不再投遞；應一起閱讀正文的 `defaultRequeueRejected` 與 recoverer 規則。

[messaging--amqp-r1]: https://www.rabbitmq.com/
[messaging--amqp-r2]: https://docs.spring.io/spring-boot/4.1.1/api/java/org/springframework/boot/amqp/autoconfigure/RabbitProperties.html
[messaging--amqp-r3]: https://rabbitmq.github.io/rabbitmq-java-client/api/current/com/rabbitmq/client/ConnectionFactory.html
[messaging--amqp-r4]: https://docs.spring.io/spring-boot/4.1.1/api/java/org/springframework/boot/amqp/autoconfigure/ConnectionFactoryCustomizer.html
[messaging--amqp-r5]: https://docs.spring.io/spring-amqp/docs/4.1.x/api/org/springframework/amqp/rabbit/connection/ConnectionNameStrategy.html
[messaging--amqp-r6]: https://docs.spring.io/spring-amqp/docs/4.1.x/api/org/springframework/amqp/rabbit/connection/CachingConnectionFactory.html
[messaging--amqp-r7]: https://docs.spring.io/spring-amqp/docs/4.1.x/api/org/springframework/amqp/rabbit/core/RabbitTemplate.html
[messaging--amqp-r8]: https://docs.spring.io/spring-boot/4.1.1/api/java/org/springframework/boot/amqp/autoconfigure/RabbitTemplateCustomizer.html
[messaging--amqp-r9]: https://spring.io/blog/2010/06/14/understanding-amqp-the-protocol-used-by-rabbitmq/
[messaging--amqp-r10]: https://docs.spring.io/spring-amqp/docs/4.1.x/api/org/springframework/amqp/core/AmqpTemplate.html
[messaging--amqp-r11]: https://docs.spring.io/spring-amqp/docs/4.1.x/api/org/springframework/amqp/core/AmqpAdmin.html
[messaging--amqp-r12]: https://docs.spring.io/spring-amqp/docs/4.1.x/api/org/springframework/amqp/rabbit/core/RabbitMessagingTemplate.html
[messaging--amqp-r13]: https://docs.spring.io/spring-amqp/docs/4.1.x/api/org/springframework/amqp/support/converter/MessageConverter.html
[messaging--amqp-r14]: https://docs.spring.io/spring-amqp/docs/4.1.x/api/org/springframework/amqp/core/Queue.html
[messaging--amqp-r15]: https://docs.spring.io/spring-framework/docs/7.0.x/javadoc-api/org/springframework/core/retry/RetryTemplate.html
[messaging--amqp-r16]: https://docs.spring.io/spring-boot/4.1.1/api/java/org/springframework/boot/amqp/autoconfigure/RabbitTemplateRetrySettingsCustomizer.html
[messaging--amqp-r17]: https://docs.spring.io/spring-boot/4.1.1/api/java/org/springframework/boot/amqp/autoconfigure/RabbitTemplateConfigurer.html
[messaging--amqp-r18]: https://docs.spring.io/spring-amqp/docs/4.1.x/api/org/springframework/amqp/rabbit/support/micrometer/RabbitTemplateObservationConvention.html
[messaging--amqp-r19]: https://docs.spring.io/spring-amqp/docs/4.1.x/api/org/springframework/rabbit/stream/support/converter/StreamMessageConverter.html
[messaging--amqp-r20]: https://docs.spring.io/spring-amqp/docs/4.1.x/api/org/springframework/rabbit/stream/producer/ProducerCustomizer.html
[messaging--amqp-r21]: https://docs.spring.io/spring-amqp/docs/4.1.x/api/org/springframework/rabbit/stream/micrometer/RabbitStreamTemplateObservationConvention.html
[messaging--amqp-r22]: https://docs.spring.io/spring-amqp/docs/4.1.x/api/org/springframework/rabbit/stream/producer/RabbitStreamTemplate.html
[messaging--amqp-r23]: https://docs.spring.io/spring-boot/4.1.1/api/java/org/springframework/boot/amqp/autoconfigure/RabbitStreamTemplateConfigurer.html
[messaging--amqp-r24]: https://docs.spring.io/spring-boot/4.1/reference/features/ssl.html#features.ssl.bundles
[messaging--amqp-r25]: https://docs.spring.io/spring-amqp/docs/4.1.x/api/org/springframework/amqp/rabbit/annotation/RabbitListener.html
[messaging--amqp-r26]: https://docs.spring.io/spring-amqp/docs/4.1.x/api/org/springframework/amqp/rabbit/listener/RabbitListenerContainerFactory.html
[messaging--amqp-r27]: https://docs.spring.io/spring-amqp/docs/4.1.x/api/org/springframework/amqp/rabbit/config/SimpleRabbitListenerContainerFactory.html
[messaging--amqp-r28]: https://docs.spring.io/spring-amqp/docs/4.1.x/api/org/springframework/amqp/rabbit/retry/MessageRecoverer.html
[messaging--amqp-r29]: https://docs.spring.io/spring-amqp/docs/4.1.x/api/org/springframework/amqp/rabbit/support/micrometer/RabbitListenerObservationConvention.html
[messaging--amqp-r30]: https://docs.spring.io/spring-amqp/docs/4.1.x/api/org/springframework/amqp/rabbit/annotation/EnableRabbit.html
[messaging--amqp-r31]: https://docs.spring.io/spring-boot/4.1.1/api/java/org/springframework/boot/amqp/autoconfigure/SimpleRabbitListenerContainerFactoryConfigurer.html
[messaging--amqp-r32]: https://docs.spring.io/spring-boot/4.1.1/api/java/org/springframework/boot/amqp/autoconfigure/DirectRabbitListenerContainerFactoryConfigurer.html
[messaging--amqp-r33]: https://docs.spring.io/spring-amqp/docs/4.1.x/api/org/springframework/amqp/rabbit/config/DirectRabbitListenerContainerFactory.html
[messaging--amqp-r34]: https://docs.spring.io/spring-amqp/docs/4.1.x/api/org/springframework/amqp/rabbit/retry/RejectAndDontRequeueRecoverer.html
[messaging--amqp-r35]: https://docs.spring.io/spring-framework/docs/7.0.x/javadoc-api/org/springframework/core/retry/RetryPolicy.html
[messaging--amqp-r36]: https://docs.spring.io/spring-boot/4.1.1/api/java/org/springframework/boot/amqp/autoconfigure/RabbitListenerRetrySettingsCustomizer.html
[messaging--amqp-r37]: https://docs.spring.io/spring-amqp/docs/4.1.x/api/org/springframework/amqp/AmqpRejectAndDontRequeueException.html
