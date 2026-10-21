# 記錄 HTTP 交換

<!-- source-attribution -->
> **非官方繁體中文翻譯** · Spring Boot 4.1.1 · 翻譯日期：2026-10-21  
> [官方英文網站](https://docs.spring.io/spring-boot/4.1/reference/actuator/http-exchanges.html) · [固定版本英文來源](https://github.com/spring-projects/spring-boot/blob/v4.1.1/documentation/spring-boot-docs/src/docs/antora/modules/reference/pages/actuator/http-exchanges.adoc) · [本地原文快照](../sources/spring-boot/documentation/spring-boot-docs/src/docs/antora/modules/reference/pages/actuator/http-exchanges.adoc)  
> 原始作者與授權見 [來源聲明](../NOTICE.md)。官方範例及設定鍵保留原文，額外圖解另標示為譯者補充。

<!-- translation-status: translated -->

在應用程式設定中提供 [`HttpExchangeRepository`][actuator--http-exchanges-r1] 型別的 Bean，即可啟用 HTTP 交換記錄。
為方便使用，Spring Boot 提供 [`InMemoryHttpExchangeRepository`][actuator--http-exchanges-r2]，預設儲存最近 100 次請求與回應交換。
相較於追蹤方案，[`InMemoryHttpExchangeRepository`][actuator--http-exchanges-r2] 的能力有限，因此建議只用於開發環境。
正式環境建議使用可供正式運作的追蹤或可觀測性方案，例如 Zipkin 或 OpenTelemetry。
你也可以建立自己的 [`HttpExchangeRepository`][actuator--http-exchanges-r1]。

可透過 `httpexchanges` 端點取得儲存在 [`HttpExchangeRepository`][actuator--http-exchanges-r1] 中的請求與回應交換資訊。

## 自訂 HTTP 交換記錄

若要自訂每筆交換記錄包含的項目，請使用 `management.httpexchanges.recording.include` 設定屬性。

若要完全停用記錄，請將 `management.httpexchanges.recording.enabled` 設為 `false`。

[actuator--http-exchanges-r1]: https://docs.spring.io/spring-boot/4.1.1/api/java/org/springframework/boot/actuate/web/exchanges/HttpExchangeRepository.html
[actuator--http-exchanges-r2]: https://docs.spring.io/spring-boot/4.1.1/api/java/org/springframework/boot/actuate/web/exchanges/InMemoryHttpExchangeRepository.html
