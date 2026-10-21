# 測試公用工具

`spring-boot` 封裝了一些在測試應用程式時普遍實用的測試工具類別。

## ConfigDataApplicationContextInitializer

[`ConfigDataApplicationContextInitializer`][r1] 是一種 [`ApplicationContextInitializer`][r2]，可套用到測試，載入 Spring Boot 的 `application.properties` 檔案。
當你不需要 [`@SpringBootTest`][r3] 提供的全部功能時，可以使用它，如下例所示：

{{CODE_0}}

{{CODE_1}}

> [NOTE]
>
> 單獨使用 [`ConfigDataApplicationContextInitializer`][r1]，不會提供 `@Value("${…​}")` 注入支援。
> 它唯一的工作是確保 `application.properties` 檔案被載入 Spring 的 [`Environment`][r4]。
> 若需要 [`@Value`][r5] 支援，必須另外設定 [`PropertySourcesPlaceholderConfigurer`][r6]，或使用會自動替你設定它的 [`@SpringBootTest`][r3]。

## TestPropertyValues

[`TestPropertyValues`][r7] 可讓你快速將屬性加入 [`ConfigurableEnvironment`][r8] 或 [`ConfigurableApplicationContext`][r9]。
呼叫時可以傳入 `key=value` 字串，如下所示：

{{CODE_2}}

{{CODE_3}}

## OutputCaptureExtension

[`OutputCaptureExtension`][r10] 是 JUnit 的 [`Extension`][r11]，可用來擷取 [`System.out`][r12] 與 [`System.err`][r13] 的輸出。
使用時加入 `@ExtendWith(OutputCaptureExtension.class)`，並將 [`CapturedOutput`][r14] 作為參數，注入測試類別的建構子或測試方法，如下所示：

{{CODE_4}}

{{CODE_5}}

## TestRestTemplate

[`TestRestTemplate`][r15] 是 Spring [`RestTemplate`][r16] 的便利替代方案，適用於整合測試。
它由 `spring-boot-resttestclient` 模組提供。
此外也需要 `spring-boot-restclient` 依賴。
加入此依賴時請留意，它會啟用 `RestClient.Builder` 的自動設定。
若正式程式碼使用 `RestClient.Builder`，應將 `spring-boot-restclient` 宣告於應用程式的主要 classpath，而不只是測試 classpath。

你可以取得一般的 template，或會傳送 HTTP Basic 身分驗證資訊（使用者名稱與密碼）的 template。
兩者都具備容錯行為。
也就是說，遇到 4xx 與 5xx 錯誤時不會擲出例外，讓測試更容易撰寫。
你可以透過回傳的 [`ResponseEntity`][r17] 及其狀態碼偵測這些錯誤。

若需要流暢的斷言 API，可考慮使用 [`RestTestClient`][r18]，它支援[模擬環境][r19]與[端對端測試][r20]。

若使用 Spring WebFlux，可考慮 [`WebTestClient`][r21]；它提供類似 API，支援[模擬環境][r19]、[WebFlux 整合測試][r22]及[端對端測試][r20]。

建議使用 Apache HTTP Client 5.1 或更新版本，但不是強制要求。
若它位於 classpath，則 [`TestRestTemplate`][r15] 會據此適當設定用戶端。

你可以在整合測試中直接建立 [`TestRestTemplate`][r15] 實例，如下例所示：

{{CODE_6}}

{{CODE_7}}

另一種方式是使用 [`@SpringBootTest`][r3] 搭配 `WebEnvironment.RANDOM_PORT` 或 `WebEnvironment.DEFINED_PORT`，並在測試類別標註 [`@AutoConfigureTestRestTemplate`][r23]，即可注入已完整設定的 [`TestRestTemplate`][r15]。
必要時可透過 [`RestTemplateBuilder`][r24] Bean 進一步自訂。

未指定主機與連接埠的 URL，會自動連到嵌入式伺服器，如下例所示：

{{CODE_8}}

{{CODE_9}}
