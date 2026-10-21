# RSocket

<!-- source-attribution -->
> **非官方繁體中文翻譯** · Spring Boot 4.1.1 · 翻譯日期：2026-10-21  
> [官方英文網站](https://docs.spring.io/spring-boot/4.1/reference/messaging/rsocket.html) · [固定版本英文來源](https://github.com/spring-projects/spring-boot/blob/v4.1.1/documentation/spring-boot-docs/src/docs/antora/modules/reference/pages/messaging/rsocket.adoc) · [本地原文快照](../sources/spring-boot/documentation/spring-boot-docs/src/docs/antora/modules/reference/pages/messaging/rsocket.adoc)  
> 原始作者與授權見 [來源聲明](../NOTICE.md)。官方範例及設定鍵保留原文，額外圖解另標示為譯者補充。

<!-- translation-status: translated -->

[RSocket][messaging--rsocket-r1] 是用於位元組串流傳輸的二進位協定，能透過單一連線上的非同步訊息傳遞，提供對稱的互動模型。

Spring Framework 的 `spring-messaging` 模組，在用戶端與伺服器端都支援 RSocket requester 與 responder。詳情與協定概覽，請參閱 Framework 的 [RSocket 章節][messaging--rsocket-r2]。

## RSocket Strategies 自動設定

Spring Boot 會自動設定 [`RSocketStrategies`][messaging--rsocket-r3] Bean，提供 RSocket payload 編碼與解碼所需的基礎設施。預設會依序嘗試設定：

1. 使用 Jackson 的 [CBOR][messaging--rsocket-r4] codec。
2. 使用 Jackson 的 JSON codec。

`spring-boot-starter-rsocket` 提供這兩項依賴。客製選項請參閱 [Jackson 支援][messaging--rsocket-r5]。

可建立實作 [`RSocketStrategiesCustomizer`][messaging--rsocket-r6] 的 Bean，客製 `RSocketStrategies`。請注意 [`@Order`][messaging--rsocket-r7] 很重要，因為它決定 codec 的順序。

## RSocket 伺服器自動設定

Spring Boot 提供 RSocket 伺服器自動設定，所需依賴由 `spring-boot-starter-rsocket` 提供。

依應用程式類型與設定，Spring Boot 可以在 WebFlux 伺服器上，透過 WebSocket 暴露 RSocket，也可以啟動獨立的 RSocket 伺服器。

對 WebFlux 應用程式，即 [`WebApplicationType.REACTIVE`][messaging--rsocket-r8] 類型而言，只有符合下列屬性時，RSocket 伺服器才會整合進 Web 伺服器：

```properties
spring.rsocket.server.mapping-path=/rsocket
spring.rsocket.server.transport=websocket
```

```yaml
spring:
  rsocket:
    server:
      mapping-path: "/rsocket"
      transport: "websocket"
```

> **警告：**只有 Reactor Netty 支援將 RSocket 整合進 Web 伺服器，因為 RSocket 本身以該函式庫建立。

另一種方式，是將 RSocket TCP 或 WebSocket 伺服器作為獨立的內嵌伺服器啟動。除了必要依賴外，唯一必要的設定是指定連接埠：

```properties
spring.rsocket.server.port=9898
```

```yaml
spring:
  rsocket:
    server:
      port: 9898
```

## Spring Messaging 的 RSocket 支援

Spring Boot 會自動設定 RSocket 所需的 Spring Messaging 基礎設施。

也就是說，會建立 [`RSocketMessageHandler`][messaging--rsocket-r9] Bean，處理送往應用程式的 RSocket 請求。

> **提示：**可使用 [`@ControllerAdvice`][messaging--rsocket-r10] 處理例外。

## 使用 RSocketRequester 呼叫服務

伺服器與用戶端之間建立 [`RSocket`][messaging--rsocket-r11] 通道後，任何一方都能向另一方傳送或接收請求。

伺服器端可在 RSocket [`@Controller`][messaging--rsocket-r13] 的任一 handler 方法注入 [`RSocketRequester`][messaging--rsocket-r12]。用戶端則必須先設定並建立 RSocket 連線。針對此情況，Spring Boot 會自動設定具有預期 codec 的 [`RSocketRequester.Builder`][messaging--rsocket-r14]，並套用所有 [`RSocketConnectorConfigurer`][messaging--rsocket-r15] Bean。

`RSocketRequester.Builder` 是 prototype Bean，因此每個注入點都會取得新的實例。這是刻意的設計：builder 具有狀態，不應使用同一實例建立不同設定的 requester。

以下是典型範例：

```kotlin
import org.springframework.messaging.rsocket.RSocketRequester
import org.springframework.stereotype.Service
import reactor.core.publisher.Mono

@Service
class MyService(rsocketRequesterBuilder: RSocketRequester.Builder) {

	private val rsocketRequester: RSocketRequester

	init {
		rsocketRequester = rsocketRequesterBuilder.tcp("example.org", 9898)
	}

	fun someRSocketCall(name: String): Mono<User> {
		return rsocketRequester.route("user").data(name).retrieveMono(
			User::class.java
		)
	}

}
```

```java
import reactor.core.publisher.Mono;

import org.springframework.messaging.rsocket.RSocketRequester;
import org.springframework.stereotype.Service;

@Service
public class MyService {

	private final RSocketRequester rsocketRequester;

	public MyService(RSocketRequester.Builder rsocketRequesterBuilder) {
		this.rsocketRequester = rsocketRequesterBuilder.tcp("example.org", 9898);
	}

	public Mono<User> someRSocketCall(String name) {
		return this.rsocketRequester.route("user").data(name).retrieveMono(User.class);
	}

}
```

[messaging--rsocket-r1]: https://rsocket.io
[messaging--rsocket-r2]: https://docs.spring.io/spring-framework/reference/7.0/rsocket.html#rsocket-spring
[messaging--rsocket-r3]: https://docs.spring.io/spring-framework/docs/7.0.x/javadoc-api/org/springframework/messaging/rsocket/RSocketStrategies.html
[messaging--rsocket-r4]: https://cbor.io/
[messaging--rsocket-r5]: https://docs.spring.io/spring-boot/4.1/reference/features/json.html#features.json.jackson
[messaging--rsocket-r6]: https://docs.spring.io/spring-boot/4.1.1/api/java/org/springframework/boot/rsocket/messaging/RSocketStrategiesCustomizer.html
[messaging--rsocket-r7]: https://docs.spring.io/spring-framework/docs/7.0.x/javadoc-api/org/springframework/core/annotation/Order.html
[messaging--rsocket-r8]: https://docs.spring.io/spring-boot/4.1.1/api/java/org/springframework/boot/WebApplicationType.html#REACTIVE
[messaging--rsocket-r9]: https://docs.spring.io/spring-framework/docs/7.0.x/javadoc-api/org/springframework/messaging/rsocket/annotation/support/RSocketMessageHandler.html
[messaging--rsocket-r10]: https://docs.spring.io/spring-framework/reference/7.0/web/webmvc/mvc-controller/ann-advice.html
[messaging--rsocket-r11]: https://javadoc.io/doc/io.rsocket/rsocket-core/1.1.5/io/rsocket/RSocket.html
[messaging--rsocket-r12]: https://docs.spring.io/spring-framework/docs/7.0.x/javadoc-api/org/springframework/messaging/rsocket/RSocketRequester.html
[messaging--rsocket-r13]: https://docs.spring.io/spring-framework/docs/7.0.x/javadoc-api/org/springframework/stereotype/Controller.html
[messaging--rsocket-r14]: https://docs.spring.io/spring-framework/docs/7.0.x/javadoc-api/org/springframework/messaging/rsocket/RSocketRequester.Builder.html
[messaging--rsocket-r15]: https://docs.spring.io/spring-framework/docs/7.0.x/javadoc-api/org/springframework/messaging/rsocket/RSocketConnectorConfigurer.html
