# JMS

<!-- source-attribution -->
> **非官方繁體中文翻譯** · Spring Boot 4.1.1 · 翻譯日期：2026-10-21  
> [官方英文網站](https://docs.spring.io/spring-boot/4.1/reference/messaging/jms.html) · [固定版本英文來源](https://github.com/spring-projects/spring-boot/blob/v4.1.1/documentation/spring-boot-docs/src/docs/antora/modules/reference/pages/messaging/jms.adoc) · [本地原文快照](../sources/spring-boot/documentation/spring-boot-docs/src/docs/antora/modules/reference/pages/messaging/jms.adoc)  
> 原始作者與授權見 [來源聲明](../NOTICE.md)。官方範例及設定鍵保留原文，額外圖解另標示為譯者補充。

<!-- translation-status: translated -->

[`ConnectionFactory`][messaging--jms-r1] 提供標準方式，建立與 JMS broker 互動的 [`Connection`][messaging--jms-r2]。雖然 Spring 使用 JMS 時需要 `ConnectionFactory`，但一般不必由應用程式直接操作，而能使用較高階的訊息抽象。詳見 Spring Framework 參考文件的[相關章節][messaging--jms-r3]。Spring Boot 也會自動設定傳送與接收訊息所需的基礎設施。

## ActiveMQ Classic 支援

當 classpath 中有 [ActiveMQ Classic][messaging--jms-r4] 時，Spring Boot 可以設定 [`ConnectionFactory`][messaging--jms-r1]。如果 broker 也存在，且設定未指定 broker URL、也未停用內嵌 broker，則會自動啟動並設定內嵌 broker。

> **注意：**`spring-boot-starter-activemq` 提供連接 ActiveMQ Classic 所需的依賴，以及整合 JMS 的 Spring 基礎設施。再加入 `org.apache.activemq:activemq-broker`，即可使用內嵌 broker。

ActiveMQ Classic 的設定由 `spring.activemq.*` 外部化屬性控制。

如果 classpath 中有 `activemq-broker`，自動設定會使用 [VM transport][messaging--jms-r5]，在同一個 JVM 實例內啟動 broker。

可透過 `spring.activemq.embedded.enabled` 停用內嵌 broker：

```properties
spring.activemq.embedded.enabled=false
```

```yaml
spring:
  activemq:
    embedded:
      enabled: false
```

設定 broker URL 也會停用內嵌 broker：

```properties
spring.activemq.broker-url=tcp://192.168.1.210:9876
spring.activemq.user=admin
spring.activemq.password=secret
```

```yaml
spring:
  activemq:
    broker-url: "tcp://192.168.1.210:9876"
    user: "admin"
    password: "secret"
```

若要完整控制內嵌 broker，請參閱 [ActiveMQ Classic 文件][messaging--jms-r6]。

預設會以 [`CachingConnectionFactory`][messaging--jms-r7] 包裝原生 [`ConnectionFactory`][messaging--jms-r1]，並採用合理設定；可透過 `spring.jms.*` 調整：

```properties
spring.jms.cache.session-cache-size=5
```

```yaml
spring:
  jms:
    cache:
      session-cache-size: 5
```

如果偏好原生的連線集區，可加入 `org.messaginghub:pooled-jms`，並設定 [`JmsPoolConnectionFactory`][messaging--jms-r8]：

```properties
spring.activemq.pool.enabled=true
spring.activemq.pool.max-connections=50
```

```yaml
spring:
  activemq:
    pool:
      enabled: true
      max-connections: 50
```

> **提示：**其他選項請參閱 [`ActiveMQProperties`][messaging--jms-r9]。也可以註冊任意數量的 [`ActiveMQConnectionFactoryCustomizer`][messaging--jms-r10] Bean，進行進階客製。

預設情況下，ActiveMQ Classic 會建立尚不存在的 destination，因此會依提供的名稱解析目的地。

## ActiveMQ Artemis 支援

當偵測到 classpath 中有 [ActiveMQ Artemis][messaging--jms-r11] 時，Spring Boot 能自動設定 [`ConnectionFactory`][messaging--jms-r1]。如果 broker 存在，會自動啟動並設定內嵌 broker，除非已明確設定 mode 屬性。

支援的模式為 `embedded` 與 `native`：前者明確要求內嵌 broker，若 classpath 找不到就應報錯；後者使用 `netty` 傳輸協定連接 broker。使用 `native` 時，Spring Boot 會設定一個以預設值連接本機 broker 的 `ConnectionFactory`。

> **注意：**`spring-boot-starter-artemis` 提供連接既有 Artemis 實例所需的依賴，以及整合 JMS 的 Spring 基礎設施。加入 `org.apache.activemq:artemis-jakarta-server` 後，可使用內嵌模式。

Artemis 設定由 `spring.artemis.*` 外部化屬性控制。例如，可在 `application.properties` 宣告：

```properties
spring.artemis.mode=native
spring.artemis.broker-url=tcp://192.168.1.210:9876
spring.artemis.user=admin
spring.artemis.password=secret
```

```yaml
spring:
  artemis:
    mode: native
    broker-url: "tcp://192.168.1.210:9876"
    user: "admin"
    password: "secret"
```

內嵌 broker 時，可以選擇是否啟用持久化，並列出應提供的目的地。可用逗號分隔清單，以預設選項建立；若要進階設定 queue 或 topic，則分別定義 [`JMSQueueConfiguration`][messaging--jms-r12] 或 [`TopicConfiguration`][messaging--jms-r13] Bean。

預設會以 [`CachingConnectionFactory`][messaging--jms-r7] 包裝原生 [`ConnectionFactory`][messaging--jms-r1]，並採用可透過 `spring.jms.*` 調整的合理設定：

```properties
spring.jms.cache.session-cache-size=5
```

```yaml
spring:
  jms:
    cache:
      session-cache-size: 5
```

若偏好原生連線集區，可加入 `org.messaginghub:pooled-jms`，並設定 [`JmsPoolConnectionFactory`][messaging--jms-r8]：

```properties
spring.artemis.pool.enabled=true
spring.artemis.pool.max-connections=50
```

```yaml
spring:
  artemis:
    pool:
      enabled: true
      max-connections: 50
```

其他選項請參閱 [`ArtemisProperties`][messaging--jms-r14]。

此流程不涉及 JNDI 查詢；目的地依名稱解析，名稱來自 Artemis 設定的 `name` 屬性，或由設定提供。

## 使用 JNDI ConnectionFactory

如果應用程式執行於應用伺服器，Spring Boot 會嘗試透過 JNDI 尋找 JMS [`ConnectionFactory`][messaging--jms-r1]，預設檢查 `java:/JmsXA` 與 `java:/XAConnectionFactory`。如需指定其他位置，請使用 `spring.jms.jndi-name`：

```properties
spring.jms.jndi-name=java:/MyConnectionFactory
```

```yaml
spring:
  jms:
    jndi-name: "java:/MyConnectionFactory"
```

## 傳送訊息

Spring 的 [`JmsClient`][messaging--jms-r15] 會自動設定，可直接注入自己的 Bean：

```kotlin
import org.springframework.jms.core.JmsClient
import org.springframework.stereotype.Component

@Component
class MyBean(private val jmsClient: JmsClient) {

	// ...

	fun someMethod() {
		jmsClient.destination("myQueue").send("hello")
	}

}
```

```java
import org.springframework.jms.core.JmsClient;
import org.springframework.stereotype.Component;

@Component
public class MyBean {

	private final JmsClient jmsClient;

	public MyBean(JmsClient jmsClient) {
		this.jmsClient = jmsClient;
	}

	// ...

	public void someMethod() {
		this.jmsClient.destination("myQueue").send("hello");
	}

}
```

> **注意：**[`JmsMessagingTemplate`][messaging--jms-r16] 也可用類似方式注入。兩者都使用傳統的 [`JmsTemplate`][messaging--jms-r17]，後者也可直接注入。若定義 [`DestinationResolver`][messaging--jms-r18] 或 [`MessageConverter`][messaging--jms-r19] Bean，會自動與自動設定的 `JmsTemplate` 關聯。

## 接收訊息

當 JMS 基礎設施存在時，可以在 Bean 使用 [`@JmsListener`][messaging--jms-r20] 建立監聽端點。若未定義 [`JmsListenerContainerFactory`][messaging--jms-r21]，會自動設定預設工廠。若定義 [`DestinationResolver`][messaging--jms-r18]、[`MessageConverter`][messaging--jms-r19] 或 [`ExceptionListener`][messaging--jms-r22] Bean，會自動與預設工廠關聯。

大多數情況下，訊息監聽器容器應使用原生 [`ConnectionFactory`][messaging--jms-r1]。如此每個容器有自己的連線，也完整負責本身的復原工作。自動設定透過 [`ConnectionFactoryUnwrapper`][messaging--jms-r23]，從自動設定的工廠解開原生連線工廠。

> **注意（原文）：**自動設定只會解開 `CachedConnectionFactory`。

> **譯者校對註：**這則原文提醒使用 `CachedConnectionFactory`，與前文連結類別 `CachingConnectionFactory` 的名稱不同；此處保留原文名稱供對照。

預設工廠具有交易能力。如果執行環境中有 [`JtaTransactionManager`][messaging--jms-r24]，預設會將其關聯至監聽器容器；否則，會啟用 `sessionTransacted`。

在後者的情況，可在監聽方法或其委派的方法加上 [`@Transactional`][messaging--jms-r25]，將本地資料儲存交易與接收訊息的處理關聯。這可確保本地交易完成後，才確認收到的訊息；也包含在相同 JMS session 上執行的回應訊息傳送。

下例在 `someQueue` 目的地建立監聽端點：

```kotlin
import org.springframework.jms.annotation.JmsListener
import org.springframework.stereotype.Component

@Component
class MyBean {

	@JmsListener(destination = "someQueue")
	fun processMessage(content: String?) {
		// ...
	}

}
```

```java
import org.springframework.jms.annotation.JmsListener;
import org.springframework.stereotype.Component;

@Component
public class MyBean {

	@JmsListener(destination = "someQueue")
	public void processMessage(String content) {
		// ...
	}

}
```

> **提示：**更多資訊請參閱 [`@EnableJms`][messaging--jms-r26] API 文件。

若需要建立更多 [`JmsListenerContainerFactory`][messaging--jms-r21] 實例，或覆寫預設工廠，Spring Boot 提供 [`DefaultJmsListenerContainerFactoryConfigurer`][messaging--jms-r27]，可使用與自動設定相同的設定，初始化 [`DefaultJmsListenerContainerFactory`][messaging--jms-r28]。

例如，下列設定提供另一個使用特定 [`MessageConverter`][messaging--jms-r19] 的工廠：

```kotlin
import jakarta.jms.ConnectionFactory
import org.springframework.boot.jms.ConnectionFactoryUnwrapper
import org.springframework.boot.jms.autoconfigure.DefaultJmsListenerContainerFactoryConfigurer
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.jms.config.DefaultJmsListenerContainerFactory

@Configuration(proxyBeanMethods = false)
class MyJmsConfiguration {

	@Bean
	fun myFactory(configurer: DefaultJmsListenerContainerFactoryConfigurer,
				  connectionFactory: ConnectionFactory): DefaultJmsListenerContainerFactory {
		val factory = DefaultJmsListenerContainerFactory()
		configurer.configure(factory, ConnectionFactoryUnwrapper.unwrapCaching(connectionFactory))
		factory.setMessageConverter(MyMessageConverter())
		return factory
	}

}
```

```java
import jakarta.jms.ConnectionFactory;

import org.springframework.boot.jms.ConnectionFactoryUnwrapper;
import org.springframework.boot.jms.autoconfigure.DefaultJmsListenerContainerFactoryConfigurer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jms.config.DefaultJmsListenerContainerFactory;

@Configuration(proxyBeanMethods = false)
public class MyJmsConfiguration {

	@Bean
	public DefaultJmsListenerContainerFactory myFactory(DefaultJmsListenerContainerFactoryConfigurer configurer,
			ConnectionFactory connectionFactory) {
		DefaultJmsListenerContainerFactory factory = new DefaultJmsListenerContainerFactory();
		configurer.configure(factory, ConnectionFactoryUnwrapper.unwrapCaching(connectionFactory));
		factory.setMessageConverter(new MyMessageConverter());
		return factory;
	}

}
```

> **注意：**此例使用 [`ConnectionFactoryUnwrapper`][messaging--jms-r23]，以與自動設定工廠相同的方式，將原生連線工廠關聯至訊息監聽器容器。

接著可在任何帶有 [`@JmsListener`][messaging--jms-r20] 的方法使用它：

```kotlin
import org.springframework.jms.annotation.JmsListener
import org.springframework.stereotype.Component

@Component
class MyBean {

	@JmsListener(destination = "someQueue", containerFactory = "myFactory")
	fun processMessage(content: String?) {
		// ...
	}

}
```

```java
import org.springframework.jms.annotation.JmsListener;
import org.springframework.stereotype.Component;

@Component
public class MyBean {

	@JmsListener(destination = "someQueue", containerFactory = "myFactory")
	public void processMessage(String content) {
		// ...
	}

}
```

類似 `DefaultJmsListenerContainerFactoryConfigurer`，Spring Boot 也提供 [`SimpleJmsListenerContainerFactoryConfigurer`][messaging--jms-r29]，可初始化 [`SimpleJmsListenerContainerFactory`][messaging--jms-r30]，並套用自動設定提供的相關設定。

> **提示：**[`DefaultMessageListenerContainer`][messaging--jms-r31] 使用拉取式機制（輪詢）處理訊息；相較之下，[`SimpleMessageListenerContainer`][messaging--jms-r32] 使用推送式機制，更接近獨立 JMS 規範的設計精神。兩者差異請參閱各自的 Javadoc 與 [Spring Framework 參考文件][messaging--jms-r33]。

[messaging--jms-r1]: https://jakarta.ee/specifications/messaging/3.1/apidocs/jakarta.messaging/jakarta/jms/ConnectionFactory.html
[messaging--jms-r2]: https://jakarta.ee/specifications/messaging/3.1/apidocs/jakarta.messaging/jakarta/jms/Connection.html
[messaging--jms-r3]: https://docs.spring.io/spring-framework/reference/7.0/integration/jms.html
[messaging--jms-r4]: https://activemq.apache.org/components/classic
[messaging--jms-r5]: https://activemq.apache.org/vm-transport-reference.html
[messaging--jms-r6]: https://activemq.apache.org/how-do-i-embed-a-broker-inside-a-connection.html
[messaging--jms-r7]: https://docs.spring.io/spring-framework/docs/7.0.x/javadoc-api/org/springframework/jms/connection/CachingConnectionFactory.html
[messaging--jms-r8]: https://javadoc.io/doc/org.messaginghub/pooled-jms/3.2.3/org/messaginghub/pooled/jms/JmsPoolConnectionFactory.html
[messaging--jms-r9]: https://docs.spring.io/spring-boot/4.1.1/api/java/org/springframework/boot/activemq/autoconfigure/ActiveMQProperties.html
[messaging--jms-r10]: https://docs.spring.io/spring-boot/4.1.1/api/java/org/springframework/boot/activemq/autoconfigure/ActiveMQConnectionFactoryCustomizer.html
[messaging--jms-r11]: https://activemq.apache.org/components/artemis/
[messaging--jms-r12]: https://javadoc.io/doc/org.apache.activemq/artemis-jms-server/2.53.0/org/apache/activemq/artemis/jms/server/config/JMSQueueConfiguration.html
[messaging--jms-r13]: https://javadoc.io/doc/org.apache.activemq/artemis-jms-server/2.53.0/org/apache/activemq/artemis/jms/server/config/TopicConfiguration.html
[messaging--jms-r14]: https://docs.spring.io/spring-boot/4.1.1/api/java/org/springframework/boot/artemis/autoconfigure/ArtemisProperties.html
[messaging--jms-r15]: https://docs.spring.io/spring-framework/docs/7.0.x/javadoc-api/org/springframework/jms/core/JmsClient.html
[messaging--jms-r16]: https://docs.spring.io/spring-framework/docs/7.0.x/javadoc-api/org/springframework/jms/core/JmsMessagingTemplate.html
[messaging--jms-r17]: https://docs.spring.io/spring-framework/docs/7.0.x/javadoc-api/org/springframework/jms/core/JmsTemplate.html
[messaging--jms-r18]: https://docs.spring.io/spring-framework/docs/7.0.x/javadoc-api/org/springframework/jms/support/destination/DestinationResolver.html
[messaging--jms-r19]: https://docs.spring.io/spring-framework/docs/7.0.x/javadoc-api/org/springframework/jms/support/converter/MessageConverter.html
[messaging--jms-r20]: https://docs.spring.io/spring-framework/docs/7.0.x/javadoc-api/org/springframework/jms/annotation/JmsListener.html
[messaging--jms-r21]: https://docs.spring.io/spring-framework/docs/7.0.x/javadoc-api/org/springframework/jms/config/JmsListenerContainerFactory.html
[messaging--jms-r22]: https://jakarta.ee/specifications/messaging/3.1/apidocs/jakarta.messaging/jakarta/jms/ExceptionListener.html
[messaging--jms-r23]: https://docs.spring.io/spring-boot/4.1.1/api/java/org/springframework/boot/jms/ConnectionFactoryUnwrapper.html
[messaging--jms-r24]: https://docs.spring.io/spring-framework/docs/7.0.x/javadoc-api/org/springframework/transaction/jta/JtaTransactionManager.html
[messaging--jms-r25]: https://docs.spring.io/spring-framework/docs/7.0.x/javadoc-api/org/springframework/transaction/annotation/Transactional.html
[messaging--jms-r26]: https://docs.spring.io/spring-framework/docs/7.0.x/javadoc-api/org/springframework/jms/annotation/EnableJms.html
[messaging--jms-r27]: https://docs.spring.io/spring-boot/4.1.1/api/java/org/springframework/boot/jms/autoconfigure/DefaultJmsListenerContainerFactoryConfigurer.html
[messaging--jms-r28]: https://docs.spring.io/spring-framework/docs/7.0.x/javadoc-api/org/springframework/jms/config/DefaultJmsListenerContainerFactory.html
[messaging--jms-r29]: https://docs.spring.io/spring-boot/4.1.1/api/java/org/springframework/boot/jms/autoconfigure/SimpleJmsListenerContainerFactoryConfigurer.html
[messaging--jms-r30]: https://docs.spring.io/spring-framework/docs/7.0.x/javadoc-api/org/springframework/jms/config/SimpleJmsListenerContainerFactory.html
[messaging--jms-r31]: https://docs.spring.io/spring-framework/docs/7.0.x/javadoc-api/org/springframework/jms/listener/DefaultMessageListenerContainer.html
[messaging--jms-r32]: https://docs.spring.io/spring-framework/docs/7.0.x/javadoc-api/org/springframework/jms/listener/SimpleMessageListenerContainer.html
[messaging--jms-r33]: https://docs.spring.io/spring-framework/reference/7.0/integration/jms/using.html#jms-mdp
