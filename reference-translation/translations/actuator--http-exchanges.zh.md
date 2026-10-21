# 記錄 HTTP 交換

在應用程式設定中提供 [`HttpExchangeRepository`][r1] 型別的 Bean，即可啟用 HTTP 交換記錄。
為方便使用，Spring Boot 提供 [`InMemoryHttpExchangeRepository`][r2]，預設儲存最近 100 次請求與回應交換。
相較於追蹤方案，[`InMemoryHttpExchangeRepository`][r2] 的能力有限，因此建議只用於開發環境。
正式環境建議使用可供正式運作的追蹤或可觀測性方案，例如 Zipkin 或 OpenTelemetry。
你也可以建立自己的 [`HttpExchangeRepository`][r1]。

可透過 `httpexchanges` 端點取得儲存在 [`HttpExchangeRepository`][r1] 中的請求與回應交換資訊。

## 自訂 HTTP 交換記錄

若要自訂每筆交換記錄包含的項目，請使用 `management.httpexchanges.recording.include` 設定屬性。

若要完全停用記錄，請將 `management.httpexchanges.recording.enabled` 設為 `false`。
