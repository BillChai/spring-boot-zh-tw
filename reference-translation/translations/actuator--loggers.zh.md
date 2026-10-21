# Logger

Spring Boot Actuator 能在執行期間檢視及設定應用程式的日誌等級。
你可以檢視完整清單或單一 logger 的設定，其中同時包含明確設定的日誌等級，以及日誌框架給予它的實際生效等級。
等級可以是以下其中之一：

- `TRACE`
- `DEBUG`
- `INFO`
- `WARN`
- `ERROR`
- `FATAL`
- `OFF`
- `null`

`null` 表示沒有明確設定。

## 設定 Logger

若要設定某個 logger，請將部分實體內容以 `POST` 傳送至該資源的 URI，如下例所示：

{{CODE_0}}

> [TIP]
>
> 若要「重設」logger 的特定等級，改用預設設定，可將 `configuredLevel` 的值設為 `null`。

## OpenTelemetry

預設並未設定透過 OpenTelemetry 記錄日誌。
你必須提供 OpenTelemetry 日誌端點的位置，才能完成設定：

{{CODE_1}}

{{CODE_2}}

`management.opentelemetry.logging.export.*` 設定屬性可用來設定 [`BatchLogRecordProcessor`][r1]。
例如將匯出間隔改為 15 秒：

{{CODE_3}}

{{CODE_4}}

`management.opentelemetry.logging.limits.*` 設定屬性可設定日誌記錄限制。
例如將每筆日誌記錄的屬性數量限制為 64，並將屬性值長度上限設為 256 個字元：

{{CODE_5}}

{{CODE_6}}

若需要完整控制，可以註冊自訂的 [`LogLimits`][r2] Bean。

> [NOTE]
>
> OpenTelemetry 的 Logback appender 與 Log4j appender 並非 Spring Boot 的一部分。
> 詳情請參閱 [OpenTelemetry Java instrumentation GitHub 儲存庫][r5]中的 [OpenTelemetry Logback appender][r3] 或 [OpenTelemetry Log4j2 appender][r4]。

> [TIP]
>
> 必須在 `logback-spring.xml` 或 `log4j2-spring.xml` 設定 appender，OpenTelemetry 日誌功能才會運作。

Logback 與 Log4j 的 `OpenTelemetryAppender` 都需要存取 [`OpenTelemetry`][r6] 實例，才能正常運作。
必須在應用程式啟動期間，以程式方式設定此實例，可採用以下做法：

{{CODE_7}}

{{CODE_8}}
