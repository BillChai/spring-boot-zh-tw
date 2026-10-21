# Spring Integration

<!-- source-attribution -->
> **非官方繁體中文翻譯** · Spring Boot 4.1.1 · 翻譯日期：2026-10-21  
> [官方英文網站](https://docs.spring.io/spring-boot/4.1/reference/messaging/spring-integration.html) · [固定版本英文來源](https://github.com/spring-projects/spring-boot/blob/v4.1.1/documentation/spring-boot-docs/src/docs/antora/modules/reference/pages/messaging/spring-integration.adoc) · [本地原文快照](../sources/spring-boot/documentation/spring-boot-docs/src/docs/antora/modules/reference/pages/messaging/spring-integration.adoc)  
> 原始作者與授權見 [來源聲明](../NOTICE.md)。官方範例及設定鍵保留原文，額外圖解另標示為譯者補充。

<!-- translation-status: translated -->

Spring Boot 提供數項方便使用 [Spring Integration][messaging--spring-integration-r1] 的功能，包括 `spring-boot-starter-integration`。Spring Integration 對訊息傳遞，以及 HTTP、TCP 等其他傳輸方式提供抽象。如果 classpath 中存在 Spring Integration，就會透過 [`@EnableIntegration`][messaging--spring-integration-r2] 初始化。

Spring Integration 的輪詢邏輯依賴[自動設定的 `TaskScheduler`][messaging--spring-integration-r4]。預設 [`PollerMetadata`][messaging--spring-integration-r5] 每秒輪詢一次，單次訊息數量不設上限；可透過 `spring.integration.poller.*` 客製。

Spring Boot 也會依其他 Spring Integration 模組是否存在，設定部分功能。如果 classpath 中有 `spring-integration-jmx`，會透過 JMX 發布訊息處理統計。若有 `spring-integration-jdbc`，可在啟動時建立預設資料庫 schema：

```properties
spring.integration.jdbc.initialize-schema=always
```

```yaml
spring:
  integration:
    jdbc:
      initialize-schema: "always"
```

若有 `spring-integration-rsocket`，開發者可以用 `spring.rsocket.server.*` 設定 RSocket 伺服器，再透過 [`IntegrationRSocketEndpoint`][messaging--spring-integration-r6] 或 [`RSocketOutboundGateway`][messaging--spring-integration-r7] 元件處理傳入訊息。這套基礎設施能處理 Spring Integration RSocket channel adapter；若設定 `spring.integration.rsocket.server.message-mapping-enabled`，也能處理 [`@MessageMapping`][messaging--spring-integration-r8] handler。

Spring Boot 也能透過設定屬性自動設定 [`ClientRSocketConnector`][messaging--spring-integration-r9]：

```properties
spring.integration.rsocket.client.host=example.org
spring.integration.rsocket.client.port=9898
```

```yaml
# Connecting to a RSocket server over TCP
spring:
  integration:
    rsocket:
      client:
        host: "example.org"
        port: 9898
```

```properties
spring.integration.rsocket.client.uri=ws://example.org
```

```yaml
# Connecting to a RSocket Server over WebSocket
spring:
  integration:
    rsocket:
      client:
        uri: "ws://example.org"
```

更多資訊請參閱 [`IntegrationAutoConfiguration`][messaging--spring-integration-r10] 與 [`IntegrationProperties`][messaging--spring-integration-r11]。

[messaging--spring-integration-r1]: https://spring.io/projects/spring-integration
[messaging--spring-integration-r2]: https://docs.spring.io/spring-integration/docs/7.1.x/api/org/springframework/integration/config/EnableIntegration.html
[messaging--spring-integration-r3]: https://docs.spring.io/spring-framework/docs/7.0.x/javadoc-api/org/springframework/scheduling/TaskScheduler.html
[messaging--spring-integration-r4]: https://docs.spring.io/spring-boot/4.1/reference/features/task-execution-and-scheduling.html
[messaging--spring-integration-r5]: https://docs.spring.io/spring-integration/docs/7.1.x/api/org/springframework/integration/scheduling/PollerMetadata.html
[messaging--spring-integration-r6]: https://docs.spring.io/spring-integration/docs/7.1.x/api/org/springframework/integration/rsocket/IntegrationRSocketEndpoint.html
[messaging--spring-integration-r7]: https://docs.spring.io/spring-integration/docs/7.1.x/api/org/springframework/integration/rsocket/outbound/RSocketOutboundGateway.html
[messaging--spring-integration-r8]: https://docs.spring.io/spring-framework/docs/7.0.x/javadoc-api/org/springframework/messaging/handler/annotation/MessageMapping.html
[messaging--spring-integration-r9]: https://docs.spring.io/spring-integration/docs/7.1.x/api/org/springframework/integration/rsocket/ClientRSocketConnector.html
[messaging--spring-integration-r10]: https://github.com/spring-projects/spring-boot/tree/v4.1.1/module/spring-boot-integration/src/main/java/org/springframework/boot/integration/autoconfigure/IntegrationAutoConfiguration.java
[messaging--spring-integration-r11]: https://docs.spring.io/spring-boot/4.1.1/api/java/org/springframework/boot/integration/autoconfigure/IntegrationProperties.html
