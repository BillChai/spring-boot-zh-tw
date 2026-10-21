# Spring Integration

Spring Boot 提供數項方便使用 [Spring Integration][r1] 的功能，包括 `spring-boot-starter-integration`。Spring Integration 對訊息傳遞，以及 HTTP、TCP 等其他傳輸方式提供抽象。如果 classpath 中存在 Spring Integration，就會透過 [`@EnableIntegration`][r2] 初始化。

Spring Integration 的輪詢邏輯依賴[自動設定的 `TaskScheduler`][r4]。預設 [`PollerMetadata`][r5] 每秒輪詢一次，單次訊息數量不設上限；可透過 `spring.integration.poller.*` 客製。

Spring Boot 也會依其他 Spring Integration 模組是否存在，設定部分功能。如果 classpath 中有 `spring-integration-jmx`，會透過 JMX 發布訊息處理統計。若有 `spring-integration-jdbc`，可在啟動時建立預設資料庫 schema：

{{CODE_0}}

{{CODE_1}}

若有 `spring-integration-rsocket`，開發者可以用 `spring.rsocket.server.*` 設定 RSocket 伺服器，再透過 [`IntegrationRSocketEndpoint`][r6] 或 [`RSocketOutboundGateway`][r7] 元件處理傳入訊息。這套基礎設施能處理 Spring Integration RSocket channel adapter；若設定 `spring.integration.rsocket.server.message-mapping-enabled`，也能處理 [`@MessageMapping`][r8] handler。

Spring Boot 也能透過設定屬性自動設定 [`ClientRSocketConnector`][r9]：

{{CODE_2}}

{{CODE_3}}

{{CODE_4}}

{{CODE_5}}

更多資訊請參閱 [`IntegrationAutoConfiguration`][r10] 與 [`IntegrationProperties`][r11]。
