# Logger

<!-- source-attribution -->
> **非官方繁體中文翻譯** · Spring Boot 4.1.1 · 翻譯日期：2026-10-21  
> [官方英文網站](https://docs.spring.io/spring-boot/4.1/reference/actuator/loggers.html) · [固定版本英文來源](https://github.com/spring-projects/spring-boot/blob/v4.1.1/documentation/spring-boot-docs/src/docs/antora/modules/reference/pages/actuator/loggers.adoc) · [本地原文快照](../sources/spring-boot/documentation/spring-boot-docs/src/docs/antora/modules/reference/pages/actuator/loggers.adoc)  
> 原始作者與授權見 [來源聲明](../NOTICE.md)。官方範例及設定鍵保留原文，額外圖解另標示為譯者補充。

<!-- translation-status: translated -->

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

```json
{
	"configuredLevel": "DEBUG"
}
```

> **提示：**
>
> 若要「重設」logger 的特定等級，改用預設設定，可將 `configuredLevel` 的值設為 `null`。

## OpenTelemetry

預設並未設定透過 OpenTelemetry 記錄日誌。
你必須提供 OpenTelemetry 日誌端點的位置，才能完成設定：

```properties
management.opentelemetry.logging.export.otlp.endpoint=https://otlp.example.com:4318/v1/logs
```

```yaml
management:
  opentelemetry:
    logging:
      export:
        otlp:
          endpoint: "https://otlp.example.com:4318/v1/logs"
```

`management.opentelemetry.logging.export.*` 設定屬性可用來設定 [`BatchLogRecordProcessor`][actuator--loggers-r1]。
例如將匯出間隔改為 15 秒：

```properties
management.opentelemetry.logging.export.schedule-delay=15s
```

```yaml
management:
  opentelemetry:
    logging:
      export:
        schedule-delay: "15s"
```

`management.opentelemetry.logging.limits.*` 設定屬性可設定日誌記錄限制。
例如將每筆日誌記錄的屬性數量限制為 64，並將屬性值長度上限設為 256 個字元：

```properties
management.opentelemetry.logging.limits.max-attributes=64
management.opentelemetry.logging.limits.max-attribute-value-length=256
```

```yaml
management:
  opentelemetry:
    logging:
      limits:
        max-attributes: 64
        max-attribute-value-length: 256
```

若需要完整控制，可以註冊自訂的 [`LogLimits`][actuator--loggers-r2] Bean。

> **注意：**
>
> OpenTelemetry 的 Logback appender 與 Log4j appender 並非 Spring Boot 的一部分。
> 詳情請參閱 [OpenTelemetry Java instrumentation GitHub 儲存庫][actuator--loggers-r5]中的 [OpenTelemetry Logback appender][actuator--loggers-r3] 或 [OpenTelemetry Log4j2 appender][actuator--loggers-r4]。

> **提示：**
>
> 必須在 `logback-spring.xml` 或 `log4j2-spring.xml` 設定 appender，OpenTelemetry 日誌功能才會運作。

Logback 與 Log4j 的 `OpenTelemetryAppender` 都需要存取 [`OpenTelemetry`][actuator--loggers-r6] 實例，才能正常運作。
必須在應用程式啟動期間，以程式方式設定此實例，可採用以下做法：

```kotlin
import io.opentelemetry.api.OpenTelemetry
import io.opentelemetry.instrumentation.logback.appender.v1_0.OpenTelemetryAppender
import org.springframework.beans.factory.InitializingBean
import org.springframework.stereotype.Component

@Component
class OpenTelemetryAppenderInitializer(
	private val openTelemetry: OpenTelemetry
) : InitializingBean {

	override fun afterPropertiesSet() = OpenTelemetryAppender.install(openTelemetry)

}
```

```java
import io.opentelemetry.api.OpenTelemetry;
import io.opentelemetry.instrumentation.logback.appender.v1_0.OpenTelemetryAppender;

import org.springframework.beans.factory.InitializingBean;
import org.springframework.stereotype.Component;

@Component
class OpenTelemetryAppenderInitializer implements InitializingBean {

	private final OpenTelemetry openTelemetry;

	OpenTelemetryAppenderInitializer(OpenTelemetry openTelemetry) {
		this.openTelemetry = openTelemetry;
	}

	@Override
	public void afterPropertiesSet() {
		OpenTelemetryAppender.install(this.openTelemetry);
	}

}
```

[actuator--loggers-r1]: https://javadoc.io/doc/io.opentelemetry/opentelemetry-sdk-logs/1.62.0/io/opentelemetry/sdk/logs/export/BatchLogRecordProcessor.html
[actuator--loggers-r2]: https://javadoc.io/doc/io.opentelemetry/opentelemetry-sdk-logs/1.62.0/io/opentelemetry/sdk/logs/LogLimits.html
[actuator--loggers-r3]: https://github.com/open-telemetry/opentelemetry-java-instrumentation/tree/main/instrumentation/logback/logback-appender-1.0/library
[actuator--loggers-r4]: https://github.com/open-telemetry/opentelemetry-java-instrumentation/tree/main/instrumentation/log4j/log4j-appender-2.17/library
[actuator--loggers-r5]: https://github.com/open-telemetry/opentelemetry-java-instrumentation
[actuator--loggers-r6]: https://javadoc.io/doc/io.opentelemetry/opentelemetry-api/1.62.0/io/opentelemetry/api/OpenTelemetry.html
