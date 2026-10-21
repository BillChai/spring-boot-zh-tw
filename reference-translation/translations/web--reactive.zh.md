# 反應式 Web 應用程式

Spring Boot 透過 Spring WebFlux 自動設定，簡化反應式 Web 應用程式的開發。

## 「Spring WebFlux 框架」

Spring WebFlux 是 Spring Framework 5.0 引入的反應式 Web 框架。
與 Spring MVC 不同，它不需要 Servlet API，完全非同步且非阻塞，並透過 [Reactor 專案][r2]實作 [Reactive Streams][r1] 規範。

Spring WebFlux 提供函數式與註解式兩種風格。
註解式相當接近 Spring MVC 模型，如下例所示：

{{CODE_0}}

{{CODE_1}}

WebFlux 是 Spring Framework 的一部分，詳細資訊可參閱其[參考文件][r3]。

函數式變體「WebFlux.fn」將路由設定與實際請求處理分開，如下例所示：

{{CODE_2}}

{{CODE_3}}

{{CODE_4}}

{{CODE_5}}

「WebFlux.fn」是 Spring Framework 的一部分，詳細資訊可參閱其[參考文件][r4]。

> [TIP]
>
> 你可以定義任意數量的 [`RouterFunction`][r5] Bean，將路由定義模組化。
> 若需要套用優先順序，也可以為 Bean 排序。

若要開始使用，請在應用程式加入 `spring-boot-starter-webflux` 模組。

> [NOTE]
>
> 如果應用程式同時加入 `spring-boot-starter-web` 與 `spring-boot-starter-webflux`，Spring Boot 會自動設定 Spring MVC，而不是 WebFlux。
> 採用此行為的原因，是許多 Spring 開發人員會在 Spring MVC 應用程式中加入 `spring-boot-starter-webflux`，以使用反應式 [`WebClient`][r6]。
> 你仍可透過 `SpringApplication.setWebApplicationType(WebApplicationType.REACTIVE)` 指定應用程式型別，強制使用所選型別。

### Spring WebFlux 自動設定

Spring Boot 為 Spring WebFlux 提供適合大多數應用程式的自動設定。

自動設定在 Spring 預設值之上，加入下列功能：

- 為 [`HttpMessageReader`][r7] 與 [`HttpMessageWriter`][r8] 實例設定編解碼器（詳見[本文後續說明][r9]）。
- 支援提供靜態資源，包括 WebJars（詳見[本文後續說明][r10]）。

如果想保留 Spring Boot 的 WebFlux 功能，同時加入額外的 [WebFlux 設定][r11]，可以加入自行定義、型別為 [`WebFluxConfigurer`][r13] 的 [`@Configuration`][r12] 類別，但**不要**加上 [`@EnableWebFlux`][r14]。

若想對自動設定的 [`HttpHandler`][r15] 加入其他自訂，可以定義 [`WebHttpHandlerBuilderCustomizer`][r16] 型別的 Bean，透過它們修改 [`WebHttpHandlerBuilder`][r17]。

若要完全掌控 Spring WebFlux，可以加入自己的 [`@Configuration`][r12]，並標註 [`@EnableWebFlux`][r14]。

### Spring WebFlux 轉換服務

若要自訂 Spring WebFlux 使用的 [`ConversionService`][r18]，可以提供具有 `addFormatters` 方法的 [`WebFluxConfigurer`][r13] Bean。

也可使用 `spring.webflux.format.*` 設定屬性自訂轉換。
未設定時，使用下列預設值：

| 屬性 | `DateTimeFormatter` | 格式化的型別 |
| --- | --- | --- |
| `spring.webflux.format.date` | `ofLocalizedDate(FormatStyle.SHORT)` | `java.util.Date` 與 [`LocalDate`][r19] |
| `spring.webflux.format.time` | `ofLocalizedTime(FormatStyle.SHORT)` | java.time 的 [`LocalTime`][r20] 與 [`OffsetTime`][r21] |
| `spring.webflux.format.date-time` | `ofLocalizedDateTime(FormatStyle.SHORT)` | java.time 的 [`LocalDateTime`][r22]、[`OffsetDateTime`][r23] 與 [`ZonedDateTime`][r24] |

### 使用 HttpMessageReader 與 HttpMessageWriter 的 HTTP 編解碼器

Spring WebFlux 使用 [`HttpMessageReader`][r7] 與 [`HttpMessageWriter`][r8] 介面轉換 HTTP 請求和回應。
它們透過 [`CodecConfigurer`][r25] 設定，依據 classpath 中可用的程式庫提供合理預設值。

Spring Boot 提供編解碼器專用的設定屬性 `spring.http.codecs.*`。
也會使用 [`CodecCustomizer`][r26] 實例套用進一步自訂。
例如，`spring.jackson.*` 設定鍵會套用到 Jackson 編解碼器。

若需要加入或自訂編解碼器，可以建立自訂 [`CodecCustomizer`][r26] 元件，如下例所示：

{{CODE_6}}

{{CODE_7}}

你也可以使用 [Boot 的自訂 JSON 序列化器與反序列化器][r27]。

### 靜態內容

預設情況下，Spring Boot 從 classpath 中的 `/static`（或 `/public`、`/resources`、`/META-INF/resources`）目錄提供靜態內容。
它使用 Spring WebFlux 的 [`ResourceWebHandler`][r28]，因此你可以加入自己的 [`WebFluxConfigurer`][r13] 並覆寫 `addResourceHandlers` 方法，修改此行為。

預設資源會對映到 `/**`，但可以設定 `spring.webflux.static-path-pattern` 屬性調整。
例如，可如下將所有資源移到 `/resources/**`：

{{CODE_8}}

{{CODE_9}}

你也可以使用 `spring.web.resources.static-locations` 自訂靜態資源位置。
這會用指定的目錄位置清單取代預設值。
如此設定後，預設歡迎頁偵測也會改用自訂位置。
因此，如果啟動時任一位置存在 `index.html`，它就會成為應用程式首頁。

除了前述「標準」靜態資源位置，還會特別處理 [Webjars 內容][r29]。
預設情況下，路徑位於 `/webjars/**` 的資源，只要以 Webjars 格式封裝，就會從 jar 檔提供。
此路徑可透過 `spring.webflux.webjars-path-pattern` 屬性自訂。

> [TIP]
>
> Spring WebFlux 應用程式並不嚴格依賴 Servlet API，因此無法部署為 war 檔，也不使用 `src/main/webapp` 目錄。

### 歡迎頁

Spring Boot 支援靜態與範本式歡迎頁。
它先在設定的靜態內容位置尋找 `index.html`。
若找不到，就接著尋找 `index` 範本。
只要找到其中之一，就會自動將它作為應用程式歡迎頁。

這只是應用程式實際定義之首頁路由的後備選項。
順序由 [`HandlerMapping`][r30] Bean 的順序決定，預設如下：

| 對映 | 用途 |
| --- | --- |
| `org.springframework.web.reactive.function.server.support.RouterFunctionMapping` | 透過 [`RouterFunction`][r5] Bean 宣告的端點 |
| `org.springframework.web.reactive.result.method.annotation.RequestMappingHandlerMapping` | 在 [`@Controller`][r31] Bean 中宣告的端點 |
| 歡迎頁的 `RouterFunctionMapping` | 歡迎頁支援 |

### 範本引擎

除了 REST Web 服務，也可使用 Spring WebFlux 提供動態 HTML 內容。
Spring WebFlux 支援多種範本技術，包括 Thymeleaf、FreeMarker 與 Mustache。

Spring Boot 包含下列範本引擎的自動設定支援：

- [FreeMarker][r32]
- [Thymeleaf][r33]
- [Mustache][r34]

> [NOTE]
>
> WebFlux 並不支援所有 FreeMarker 功能。
> 詳情請查看各屬性的說明。

使用這些範本引擎的預設設定時，會自動從 `src/main/resources/templates` 讀取範本。

### 錯誤處理

Spring Boot 提供 [`WebExceptionHandler`][r35]，以合理方式處理所有錯誤。
它在處理順序中的位置，緊接於最後考慮的 WebFlux 內建處理器之前。
對機器用戶端，它會產生 JSON 回應，包含錯誤詳細資訊、HTTP 狀態與例外訊息。
對瀏覽器用戶端，則有「whitelabel」錯誤處理器，將相同資料轉為 HTML 格式。
你也可以提供自己的 HTML 範本顯示錯誤（請參閱[下一節][r36]）。

直接自訂 Spring Boot 錯誤處理之前，可以先使用 Spring WebFlux 的 [RFC 9457 Problem Details][r37] 支援。
Spring WebFlux 能以 `application/problem+json` 媒體型別產生自訂錯誤訊息，例如：

{{CODE_10}}

將 `spring.webflux.problemdetails.enabled` 設為 `true`，即可啟用此支援。

自訂此功能的第一步，通常是沿用既有機制，但替換或補充錯誤內容。
為此，你可以加入 [`ErrorAttributes`][r38] 型別的 Bean。

若要改變錯誤處理行為，可以實作 [`ErrorWebExceptionHandler`][r39]，並註冊該型別的 Bean 定義。
由於 [`ErrorWebExceptionHandler`][r39] 相當底層，Spring Boot 也提供便利的 [`AbstractErrorWebExceptionHandler`][r40]，讓你以 WebFlux 函數式方式處理錯誤，如下例所示：

{{CODE_11}}

{{CODE_12}}

若需要更完整的掌控，也可以直接繼承 [`DefaultErrorWebExceptionHandler`][r41]，覆寫特定方法。

某些情況下，在控制器層處理的錯誤，不會被 Web 觀測或[指標基礎設施][r42]記錄。
應用程式可[將已處理的例外設定到觀測上下文][r43]，確保觀測記錄這些例外。

#### 自訂錯誤頁

若要為特定狀態碼顯示自訂 HTML 錯誤頁，可以加入從 `error/*` 解析的檢視，例如將檔案加入 `/error` 目錄。
錯誤頁可以是靜態 HTML（放在任一靜態資源目錄下），也可以透過範本建置。
檔名應為確切狀態碼、狀態碼系列遮罩，或在其他選項都不符合時作為預設的 `error`。
請注意，預設錯誤檢視的路徑是 `error/error`；Spring MVC 則為 `error`。

例如，若要將 `404` 對映到靜態 HTML 檔，目錄結構如下：

{{CODE_13}}

若要使用 Mustache 範本對映所有 `5xx` 錯誤，目錄結構如下：

{{CODE_14}}

### Web 過濾器

Spring WebFlux 提供 [`WebFilter`][r44] 介面，可實作它來過濾 HTTP 請求與回應交換。
應用程式上下文中找到的 [`WebFilter`][r44] Bean，會自動用來過濾每次交換。

若過濾器順序很重要，可以實作 [`Ordered`][r45] 或標註 [`@Order`][r46]。
Spring Boot 自動設定可能會替你設定 Web 過濾器。
此時會使用下表中的順序：

| Web 過濾器 | 順序 |
| --- | --- |
| [`WebFilterChainProxy`][r47]（Spring Security） | `-100` |
| [`HttpExchangesWebFilter`][r48] | `Ordered.LOWEST_PRECEDENCE - 10` |

### API 版本管理

Spring WebFlux 支援 API 版本管理，讓 HTTP API 可以隨時間演進。
相同的 `@Controller` 路徑可多次對映，以支援不同 API 版本。

詳情請參閱 [Spring Framework 參考文件][r49]。

加入對映後，還需要設定 Spring WebFlux，讓它能使用請求傳送的版本資訊。
版本通常放在 HTTP 標頭、查詢參數、媒體型別參數，或路徑中。

若要設定 Spring WebFlux，可使用 [`WebFluxConfigurer`][r13] Bean 並覆寫 `configureApiVersioning(…)` 方法，或使用屬性。

例如，下列設定會從 `X-Version` HTTP 標頭取得版本資訊；未傳送標頭時，預設使用 `1.0.0`。

{{CODE_15}}

{{CODE_16}}

> [NOTE]
>
> 如果你的設定需要多種策略，例如同時使用標頭與查詢參數，可考慮覆寫 `configureApiVersioning` 方法，以程式宣告順序。

若需要更完整掌控，也可以定義 [`ApiVersionResolver`][r50]、[`ApiVersionParser`][r51] 與 [`ApiVersionDeprecationHandler`][r52] Bean；它們會被注入自動設定的 Spring WebFlux 設定中。

> [TIP]
>
> 用戶端的 `WebClient` 與 `RestClient` 也支援 API 版本管理。
> 詳情請參閱 [API 版本管理][r53]。

## 內嵌反應式伺服器支援

Spring Boot 支援下列內嵌反應式 Web 伺服器：Reactor Netty、Tomcat 與 Jetty。
大多數開發人員會使用對應 starter 取得完整設定的實例。
預設內嵌伺服器在連接埠 8080 監聽 HTTP 請求。

### 自訂反應式伺服器

可透過 Spring [`Environment`][r54] 屬性設定常見的反應式 Web 伺服器設定。
通常會在 `application.properties` 或 `application.yaml` 檔中定義這些屬性。

常見伺服器設定包括：

- 網路設定：傳入 HTTP 請求的監聽連接埠（`server.port`）、要繫結的介面位址（`server.address`）等。
- 錯誤管理：錯誤頁位置（`spring.web.error.path`）等。
- [SSL][r55]
- [HTTP 壓縮][r56]

Spring Boot 盡可能公開常用設定，但無法涵蓋所有情況。
對於這些情況，`server.netty.*` 等專用命名空間提供伺服器專屬的自訂。

> [TIP]
>
> 完整清單請參閱 [`ServerProperties`][r57] 類別。

#### 以程式自訂

若需要以程式設定反應式 Web 伺服器，可以註冊實作 [`WebServerFactoryCustomizer`][r58] 介面的 Spring Bean。
[`WebServerFactoryCustomizer`][r58] 讓你存取 [`ConfigurableReactiveWebServerFactory`][r59]，其中包含多個自訂用的 setter 方法。
下例展示以程式設定連接埠：

{{CODE_17}}

{{CODE_18}}

[`JettyReactiveWebServerFactory`][r60]、[`NettyReactiveWebServerFactory`][r61] 與 [`TomcatReactiveWebServerFactory`][r62] 是 [`ConfigurableReactiveWebServerFactory`][r59] 的專用變體，分別提供 Jetty、Reactor Netty 與 Tomcat 的額外自訂 setter 方法。
下例展示如何自訂 [`NettyReactiveWebServerFactory`][r61]，以存取 Reactor Netty 專屬設定選項：

{{CODE_19}}

{{CODE_20}}

#### 直接自訂 ConfigurableReactiveWebServerFactory

更進階的使用情境若需要繼承 [`ReactiveWebServerFactory`][r63]，可以自行公開該型別的 Bean。

許多設定選項都有對應 setter。
若需要更特殊的處理，也提供數個受保護的方法「掛鉤」。
詳情請參閱 [`ConfigurableReactiveWebServerFactory`][r59] API 文件。

> [NOTE]
>
> 自動設定的自訂器仍會套用到你的自訂工廠，因此請謹慎使用此選項。

## 反應式伺服器資源設定

自動設定 Reactor Netty 或 Jetty 伺服器時，Spring Boot 會建立特定 Bean，為伺服器實例提供 HTTP 資源：[`ReactorResourceFactory`][r64] 或 [`JettyResourceFactory`][r65]。

預設情況下，若符合下列條件，這些資源也會與 Reactor Netty 及 Jetty 用戶端共用，以取得最佳效能：

- 伺服器與用戶端使用相同技術。
- 用戶端實例使用 Spring Boot 自動設定的 [`WebClient.Builder`][r66] Bean 建立。

開發人員可提供自訂的 [`ReactorResourceFactory`][r64] 或 [`JettyResourceFactory`][r65] Bean，覆寫 Jetty 與 Reactor Netty 的資源設定；這會同時套用到用戶端與伺服器。

用戶端資源設定的更多資訊，請參閱 [WebClient 執行環境][r67]章節。
