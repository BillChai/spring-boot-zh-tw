# 追蹤

Spring Boot Actuator 為 [Micrometer Tracing][r1] 提供依賴管理與自動設定；Micrometer Tracing 是熱門追蹤函式庫的統一門面。

> [TIP]
>
> 若要深入了解 Micrometer Tracing 的能力，請參閱其[參考文件][r1]。

## 支援的追蹤器

Spring Boot 提供以下追蹤器的自動設定：

- [OpenTelemetry][r2] 搭配 [OTLP][r3]。
- [OpenZipkin Brave][r4] 搭配 [Zipkin][r5]。

## 入門

首先需要一個範例應用程式，作為追蹤入門的示範。
[開發第一個 Spring Boot 應用程式][r6]章節中的簡單「Hello World!」Web 應用程式，就足以滿足這裡的需求。
我們會使用 Brave 追蹤器，並以 Zipkin 作為追蹤後端。

回顧一下，主要應用程式的程式碼如下：

{{CODE_0}}

{{CODE_1}}

> [NOTE]
>
> `home()` 方法增加了一行日誌敘述，稍後會用到。

現在必須加入 `org.springframework.boot:spring-boot-starter-zipkin` 依賴。

接著加入以下應用程式屬性：

{{CODE_2}}

{{CODE_3}}

Spring Boot 預設只取樣 10% 的請求，避免追蹤後端負荷過重。
此屬性將取樣比例改為 100%，讓每個請求都傳送到追蹤後端。

若要收集並視覺化追蹤資料，需要一個執行中的追蹤後端。
這裡使用 Zipkin。
[Zipkin 快速入門指南][r7]說明如何在本機啟動 Zipkin。

Zipkin 啟動後，就可以啟動應用程式。

以瀏覽器開啟 [localhost:8080][r8]，應會看見以下輸出：

{{CODE_4}}

背後的流程是為 HTTP 請求建立 observation，接著橋接至 Brave，再由 Brave 向 Zipkin 回報一筆新的 trace。

現在開啟位於 [localhost:9411][r9] 的 Zipkin UI，按下「Run Query」列出收集到的所有 trace。
你應該會看見一筆 trace。
按下「Show」即可檢視詳細資訊。

## 日誌關聯 ID

關聯 ID 提供實用的方法，將日誌檔案中的各行連結到 span 或 trace。
使用 Micrometer Tracing 時，Spring Boot 預設會在日誌中加入關聯 ID。

預設關聯 ID 由 [MDC][r10] 中的 `traceId` 與 `spanId` 值組成。
例如 Micrometer Tracing 加入 MDC `traceId` 值 `803B448A0489F84084905D3093480352`，以及 MDC `spanId` 值 `3425F23BB2432450` 時，日誌輸出會包含關聯 ID `[803B448A0489F84084905D3093480352-3425F23BB2432450]`。

若偏好不同的關聯 ID 格式，可使用 `logging.pattern.correlation` 屬性定義。
例如以下設定會讓 Logback 使用 Spring Cloud Sleuth 先前採用的關聯 ID 格式：

{{CODE_5}}

{{CODE_6}}

> [NOTE]
>
> 上例將 `logging.include-application-name` 設為 `false`，避免日誌訊息重複出現應用程式名稱，因為 `logging.pattern.correlation` 已包含它。
> 此外，`logging.pattern.correlation` 尾端包含空白，用來與預設緊接其後的 logger 名稱分隔。

> [TIP]
>
> 關聯 ID 仰賴上下文傳遞。
> 詳情請閱讀[這份文件][r11]。

## 傳遞 Trace

若要透過網路自動傳遞 trace，請使用自動設定的 [`RestTemplateBuilder`][r12]、[`RestClient.Builder`][r13] 或 [`WebClient.Builder`][r14] 建立用戶端。

> [WARNING]
>
> 如果未透過自動設定的 builder，而自行建立 [`RestTemplate`][r15]、[`RestClient`][r16] 或 [`WebClient`][r17]，自動傳遞 trace 將無法運作！

## 追蹤器實作

由於 Micrometer Tracer 支援多種追蹤器實作，Spring Boot 可搭配多種依賴組合。
OpenTelemetry 搭配 OTLP，以及 Brave 搭配 Zipkin 是常見組合，並有專用 starter。

### OpenTelemetry 搭配 OTLP

使用 OpenTelemetry 追蹤並以 OTLP 回報資料，需要以下依賴：

- `org.springframework.boot:spring-boot-starter-opentelemetry`

使用 `management.opentelemetry.tracing.export.otlp.*` 設定屬性，設定透過 OTLP 回報資料的行為。

> [NOTE]
>
> 若需要對 OTLP span exporter 進行進階自訂，可考慮註冊 [`OtlpHttpSpanExporterBuilderCustomizer`][r18] 或 [`OtlpGrpcSpanExporterBuilderCustomizer`][r19] Bean。
> 它們會在建立 `OtlpHttpSpanExporter` 或 `OtlpGrpcSpanExporter` 前呼叫。
> 這些 customizer 的優先順序高於自動設定套用的任何設定。

### OpenTelemetry 搭配 Zipkin

> [WARNING]
>
> OpenTelemetry 已[將 Zipkin 支援標為棄用][r20]。
> 對應的自動設定將在 Spring Boot 4.2 移除。
> 請改用 Brave，或考慮使用 [Zipkin OTel 模組][r21]直接接收 OTLP。

使用 OpenTelemetry 追蹤並向 Zipkin 回報資料，需要以下依賴：

- `org.springframework.boot:spring-boot-micrometer-tracing-opentelemetry`：Spring Boot 對以 OpenTelemetry 為基礎的 Micrometer Tracing 所提供的支援。
- `io.micrometer:micrometer-tracing-bridge-otel`：將 Micrometer Observation API 橋接至 OpenTelemetry。
- `org.springframework.boot:spring-boot-zipkin`：Spring Boot 的 Zipkin 支援。
- `io.opentelemetry:opentelemetry-exporter-zipkin`：向 Zipkin 回報 trace 的 OpenTelemetry exporter。

使用 `management.tracing.export.zipkin.*` 設定屬性設定向 Zipkin 回報資料的行為。

### OpenZipkin Brave 搭配 Zipkin

使用 OpenZipkin Brave 追蹤並向 Zipkin 回報資料，需要以下依賴：

- `org.springframework.boot:spring-boot-starter-zipkin`

使用 `management.tracing.export.zipkin.*` 設定屬性設定向 Zipkin 回報資料的行為。

## 取樣

Spring Boot 預設只取樣 10% 的請求，避免追蹤後端負荷過重。
可透過 `management.tracing.sampling.probability` 屬性設定比例。

使用 OpenTelemetry 時，還可以透過 `management.opentelemetry.tracing.sampler` 屬性設定取樣器。
支援以下取樣器：

| 取樣器 | 說明 |
| --- | --- |
| `always-on` | 對每筆 trace 取樣。 |
| `always-off` | 捨棄每筆 trace。 |
| `trace-id-ratio` | 依 `management.tracing.sampling.probability` 對部分 trace 取樣。 |
| `parent-based-always-on` | 若父 span 已取樣，就對子 span 取樣。若沒有父 span，對每筆 trace 取樣。 |
| `parent-based-always-off` | 若父 span 已取樣，就對子 span 取樣。若沒有父 span，捨棄每筆 trace。 |
| `parent-based-trace-id-ratio`（預設） | 若父 span 已取樣，就對子 span 取樣。若沒有父 span，依 `management.tracing.sampling.probability` 對部分 trace 取樣。 |

## Span 限制

使用 OpenTelemetry 時，可透過 `management.opentelemetry.tracing.limits.*` 設定屬性設定 span 限制。
這些屬性能控制每個 span 的屬性、事件與連結數量上限，以及字串屬性值的長度上限。

例如將每個 span 的屬性數量限制為 64，屬性值長度上限設為 256 個字元：

{{CODE_7}}

{{CODE_8}}

若需要完整控制，可註冊自訂的 [`SpanLimits`][r22] Bean。

## 與 Micrometer Observation 整合

[`TracingAwareMeterObservationHandler`][r23] 會自動註冊到 [`ObservationRegistry`][r24]，為每個已完成的 observation 建立 span。

## 建立自訂 Span

你可以藉由啟動 observation 建立自己的 span。
為此，請將 [`ObservationRegistry`][r24] 注入元件：

{{CODE_9}}

{{CODE_10}}

這會建立名稱為 "some-operation"，並帶有 "some-tag=some-value" 標籤的 observation。

> [TIP]
>
> 若想建立 span 而不建立指標，必須使用 Micrometer [較底層的 `Tracer` API][r25]。

## Baggage

你可以使用 [`Tracer`][r26] API 建立 baggage：

{{CODE_11}}

{{CODE_12}}

此範例建立名為 `baggage1`、值為 `value1` 的 baggage。
使用 W3C 傳遞格式時，baggage 會自動透過網路傳遞。
使用 B3 傳遞格式時，則不會自動傳遞 baggage。
若要手動指定透過網路傳遞的 baggage，請使用 `management.tracing.baggage.remote-fields` 設定屬性；W3C 也適用。
以上例而言，將此屬性設為 `baggage1`，就會產生 HTTP 標頭 `baggage1: value1`。

若要將 baggage 傳遞到 MDC，請使用 `management.tracing.baggage.correlation.fields` 設定屬性。
以上例而言，設為 `baggage1` 後，會產生名為 `baggage1` 的 MDC 項目。

## 測試

使用 [`@SpringBootTest`][r27] 時，會向外回報資料的追蹤元件不會自動設定。
詳情請參閱[使用追蹤][r28]。

## 譯者圖解：一次請求如何串起服務與日誌

```mermaid
flowchart LR
    A[HTTP 請求] --> B[Observation]
    B --> C[Micrometer Tracing]
    C --> D[Brave 或 OpenTelemetry]
    D --> E[追蹤後端]
    C --> F[MDC 的 traceId 與 spanId]
    F --> G[帶關聯 ID 的日誌]
    C --> H[自動設定的 HTTP client builder]
    H --> I[將追蹤上下文傳給下一個服務]
```
