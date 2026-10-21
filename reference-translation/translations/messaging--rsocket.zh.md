# RSocket

[RSocket][r1] 是用於位元組串流傳輸的二進位協定，能透過單一連線上的非同步訊息傳遞，提供對稱的互動模型。

Spring Framework 的 `spring-messaging` 模組，在用戶端與伺服器端都支援 RSocket requester 與 responder。詳情與協定概覽，請參閱 Framework 的 [RSocket 章節][r2]。

## RSocket Strategies 自動設定

Spring Boot 會自動設定 [`RSocketStrategies`][r3] Bean，提供 RSocket payload 編碼與解碼所需的基礎設施。預設會依序嘗試設定：

1. 使用 Jackson 的 [CBOR][r4] codec。
2. 使用 Jackson 的 JSON codec。

`spring-boot-starter-rsocket` 提供這兩項依賴。客製選項請參閱 [Jackson 支援][r5]。

可建立實作 [`RSocketStrategiesCustomizer`][r6] 的 Bean，客製 `RSocketStrategies`。請注意 [`@Order`][r7] 很重要，因為它決定 codec 的順序。

## RSocket 伺服器自動設定

Spring Boot 提供 RSocket 伺服器自動設定，所需依賴由 `spring-boot-starter-rsocket` 提供。

依應用程式類型與設定，Spring Boot 可以在 WebFlux 伺服器上，透過 WebSocket 暴露 RSocket，也可以啟動獨立的 RSocket 伺服器。

對 WebFlux 應用程式，即 [`WebApplicationType.REACTIVE`][r8] 類型而言，只有符合下列屬性時，RSocket 伺服器才會整合進 Web 伺服器：

{{CODE_0}}

{{CODE_1}}

> **警告：**只有 Reactor Netty 支援將 RSocket 整合進 Web 伺服器，因為 RSocket 本身以該函式庫建立。

另一種方式，是將 RSocket TCP 或 WebSocket 伺服器作為獨立的內嵌伺服器啟動。除了必要依賴外，唯一必要的設定是指定連接埠：

{{CODE_2}}

{{CODE_3}}

## Spring Messaging 的 RSocket 支援

Spring Boot 會自動設定 RSocket 所需的 Spring Messaging 基礎設施。

也就是說，會建立 [`RSocketMessageHandler`][r9] Bean，處理送往應用程式的 RSocket 請求。

> **提示：**可使用 [`@ControllerAdvice`][r10] 處理例外。

## 使用 RSocketRequester 呼叫服務

伺服器與用戶端之間建立 [`RSocket`][r11] 通道後，任何一方都能向另一方傳送或接收請求。

伺服器端可在 RSocket [`@Controller`][r13] 的任一 handler 方法注入 [`RSocketRequester`][r12]。用戶端則必須先設定並建立 RSocket 連線。針對此情況，Spring Boot 會自動設定具有預期 codec 的 [`RSocketRequester.Builder`][r14]，並套用所有 [`RSocketConnectorConfigurer`][r15] Bean。

`RSocketRequester.Builder` 是 prototype Bean，因此每個注入點都會取得新的實例。這是刻意的設計：builder 具有狀態，不應使用同一實例建立不同設定的 requester。

以下是典型範例：

{{CODE_4}}

{{CODE_5}}
