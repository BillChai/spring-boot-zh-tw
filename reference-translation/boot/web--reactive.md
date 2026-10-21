# 反應式 Web 應用程式

<!-- source-attribution -->
> **非官方繁體中文翻譯** · Spring Boot 4.1.1 · 翻譯日期：2026-10-21  
> [官方英文網站](https://docs.spring.io/spring-boot/4.1/reference/web/reactive.html) · [固定版本英文來源](https://github.com/spring-projects/spring-boot/blob/v4.1.1/documentation/spring-boot-docs/src/docs/antora/modules/reference/pages/web/reactive.adoc) · [本地原文快照](../sources/spring-boot/documentation/spring-boot-docs/src/docs/antora/modules/reference/pages/web/reactive.adoc)  
> 原始作者與授權見 [來源聲明](../NOTICE.md)。官方範例及設定鍵保留原文，額外圖解另標示為譯者補充。

<!-- translation-status: translated -->

Spring Boot 透過 Spring WebFlux 自動設定，簡化反應式 Web 應用程式的開發。

## 「Spring WebFlux 框架」

Spring WebFlux 是 Spring Framework 5.0 引入的反應式 Web 框架。
與 Spring MVC 不同，它不需要 Servlet API，完全非同步且非阻塞，並透過 [Reactor 專案][web--reactive-r2]實作 [Reactive Streams][web--reactive-r1] 規範。

Spring WebFlux 提供函數式與註解式兩種風格。
註解式相當接近 Spring MVC 模型，如下例所示：

```kotlin
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import reactor.core.publisher.Flux
import reactor.core.publisher.Mono

@RestController
@RequestMapping("/users")
class MyRestController(private val userRepository: UserRepository, private val customerRepository: CustomerRepository) {

	@GetMapping("/{userId}")
	fun getUser(@PathVariable userId: Long): Mono<User> {
		return userRepository.findById(userId)
	}

	@GetMapping("/{userId}/customers")
	fun getUserCustomers(@PathVariable userId: Long): Flux<Customer> {
		return userRepository.findById(userId).flatMapMany { user: User ->
			customerRepository.findByUser(user)
		}
	}

	@DeleteMapping("/{userId}")
	fun deleteUser(@PathVariable userId: Long): Mono<Void> {
		return userRepository.deleteById(userId)
	}

}
```

```java
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/users")
public class MyRestController {

	private final UserRepository userRepository;

	private final CustomerRepository customerRepository;

	public MyRestController(UserRepository userRepository, CustomerRepository customerRepository) {
		this.userRepository = userRepository;
		this.customerRepository = customerRepository;
	}

	@GetMapping("/{userId}")
	public Mono<User> getUser(@PathVariable Long userId) {
		return this.userRepository.findById(userId);
	}

	@GetMapping("/{userId}/customers")
	public Flux<Customer> getUserCustomers(@PathVariable Long userId) {
		return this.userRepository.findById(userId).flatMapMany(this.customerRepository::findByUser);
	}

	@DeleteMapping("/{userId}")
	public Mono<Void> deleteUser(@PathVariable Long userId) {
		return this.userRepository.deleteById(userId);
	}

}
```

WebFlux 是 Spring Framework 的一部分，詳細資訊可參閱其[參考文件][web--reactive-r3]。

函數式變體「WebFlux.fn」將路由設定與實際請求處理分開，如下例所示：

```kotlin
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.http.MediaType
import org.springframework.web.reactive.function.server.RequestPredicates.DELETE
import org.springframework.web.reactive.function.server.RequestPredicates.GET
import org.springframework.web.reactive.function.server.RequestPredicates.accept
import org.springframework.web.reactive.function.server.RouterFunction
import org.springframework.web.reactive.function.server.RouterFunctions
import org.springframework.web.reactive.function.server.ServerResponse

@Configuration(proxyBeanMethods = false)
class MyRoutingConfiguration {

	@Bean
	fun monoRouterFunction(userHandler: MyUserHandler): RouterFunction<ServerResponse> {
		return RouterFunctions.route(
			GET("/{user}").and(ACCEPT_JSON), userHandler::getUser).andRoute(
			GET("/{user}/customers").and(ACCEPT_JSON), userHandler::getUserCustomers).andRoute(
			DELETE("/{user}").and(ACCEPT_JSON), userHandler::deleteUser)
	}

	companion object {
		private val ACCEPT_JSON = accept(MediaType.APPLICATION_JSON)
	}

}
```

```java
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.MediaType;
import org.springframework.web.reactive.function.server.RequestPredicate;
import org.springframework.web.reactive.function.server.RouterFunction;
import org.springframework.web.reactive.function.server.ServerResponse;

import static org.springframework.web.reactive.function.server.RequestPredicates.accept;
import static org.springframework.web.reactive.function.server.RouterFunctions.route;

@Configuration(proxyBeanMethods = false)
public class MyRoutingConfiguration {

	private static final RequestPredicate ACCEPT_JSON = accept(MediaType.APPLICATION_JSON);

	@Bean
	public RouterFunction<ServerResponse> monoRouterFunction(MyUserHandler userHandler) {
		return route()
				.GET("/{user}", ACCEPT_JSON, userHandler::getUser)
				.GET("/{user}/customers", ACCEPT_JSON, userHandler::getUserCustomers)
				.DELETE("/{user}", ACCEPT_JSON, userHandler::deleteUser)
				.build();
	}

}
```

```kotlin
import org.springframework.stereotype.Component
import org.springframework.web.reactive.function.server.ServerRequest
import org.springframework.web.reactive.function.server.ServerResponse
import reactor.core.publisher.Mono

@Component
class MyUserHandler {

	fun getUser(request: ServerRequest?): Mono<ServerResponse> {
		...
	}

	fun getUserCustomers(request: ServerRequest?): Mono<ServerResponse> {
		...
	}

	fun deleteUser(request: ServerRequest?): Mono<ServerResponse> {
		...
	}

}
```

```java
import reactor.core.publisher.Mono;

import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.server.ServerRequest;
import org.springframework.web.reactive.function.server.ServerResponse;

@Component
public class MyUserHandler {

	public Mono<ServerResponse> getUser(ServerRequest request) {
		...
	}

	public Mono<ServerResponse> getUserCustomers(ServerRequest request) {
		...
	}

	public Mono<ServerResponse> deleteUser(ServerRequest request) {
		...
	}

}
```

「WebFlux.fn」是 Spring Framework 的一部分，詳細資訊可參閱其[參考文件][web--reactive-r4]。

> **提示：**
>
> 你可以定義任意數量的 [`RouterFunction`][web--reactive-r5] Bean，將路由定義模組化。
> 若需要套用優先順序，也可以為 Bean 排序。

若要開始使用，請在應用程式加入 `spring-boot-starter-webflux` 模組。

> **注意：**
>
> 如果應用程式同時加入 `spring-boot-starter-web` 與 `spring-boot-starter-webflux`，Spring Boot 會自動設定 Spring MVC，而不是 WebFlux。
> 採用此行為的原因，是許多 Spring 開發人員會在 Spring MVC 應用程式中加入 `spring-boot-starter-webflux`，以使用反應式 [`WebClient`][web--reactive-r6]。
> 你仍可透過 `SpringApplication.setWebApplicationType(WebApplicationType.REACTIVE)` 指定應用程式型別，強制使用所選型別。

### Spring WebFlux 自動設定

Spring Boot 為 Spring WebFlux 提供適合大多數應用程式的自動設定。

自動設定在 Spring 預設值之上，加入下列功能：

- 為 [`HttpMessageReader`][web--reactive-r7] 與 [`HttpMessageWriter`][web--reactive-r8] 實例設定編解碼器（詳見[本文後續說明][web--reactive-r9]）。
- 支援提供靜態資源，包括 WebJars（詳見[本文後續說明][web--reactive-r10]）。

如果想保留 Spring Boot 的 WebFlux 功能，同時加入額外的 [WebFlux 設定][web--reactive-r11]，可以加入自行定義、型別為 [`WebFluxConfigurer`][web--reactive-r13] 的 [`@Configuration`][web--reactive-r12] 類別，但**不要**加上 [`@EnableWebFlux`][web--reactive-r14]。

若想對自動設定的 [`HttpHandler`][web--reactive-r15] 加入其他自訂，可以定義 [`WebHttpHandlerBuilderCustomizer`][web--reactive-r16] 型別的 Bean，透過它們修改 [`WebHttpHandlerBuilder`][web--reactive-r17]。

若要完全掌控 Spring WebFlux，可以加入自己的 [`@Configuration`][web--reactive-r12]，並標註 [`@EnableWebFlux`][web--reactive-r14]。

### Spring WebFlux 轉換服務

若要自訂 Spring WebFlux 使用的 [`ConversionService`][web--reactive-r18]，可以提供具有 `addFormatters` 方法的 [`WebFluxConfigurer`][web--reactive-r13] Bean。

也可使用 `spring.webflux.format.*` 設定屬性自訂轉換。
未設定時，使用下列預設值：

| 屬性 | `DateTimeFormatter` | 格式化的型別 |
| --- | --- | --- |
| `spring.webflux.format.date` | `ofLocalizedDate(FormatStyle.SHORT)` | `java.util.Date` 與 [`LocalDate`][web--reactive-r19] |
| `spring.webflux.format.time` | `ofLocalizedTime(FormatStyle.SHORT)` | java.time 的 [`LocalTime`][web--reactive-r20] 與 [`OffsetTime`][web--reactive-r21] |
| `spring.webflux.format.date-time` | `ofLocalizedDateTime(FormatStyle.SHORT)` | java.time 的 [`LocalDateTime`][web--reactive-r22]、[`OffsetDateTime`][web--reactive-r23] 與 [`ZonedDateTime`][web--reactive-r24] |

### 使用 HttpMessageReader 與 HttpMessageWriter 的 HTTP 編解碼器

Spring WebFlux 使用 [`HttpMessageReader`][web--reactive-r7] 與 [`HttpMessageWriter`][web--reactive-r8] 介面轉換 HTTP 請求和回應。
它們透過 [`CodecConfigurer`][web--reactive-r25] 設定，依據 classpath 中可用的程式庫提供合理預設值。

Spring Boot 提供編解碼器專用的設定屬性 `spring.http.codecs.*`。
也會使用 [`CodecCustomizer`][web--reactive-r26] 實例套用進一步自訂。
例如，`spring.jackson.*` 設定鍵會套用到 Jackson 編解碼器。

若需要加入或自訂編解碼器，可以建立自訂 [`CodecCustomizer`][web--reactive-r26] 元件，如下例所示：

```kotlin
import org.springframework.boot.http.codec.CodecCustomizer
import org.springframework.context.annotation.Bean
import org.springframework.http.codec.CodecConfigurer
import org.springframework.http.codec.ServerSentEventHttpMessageReader

class MyCodecsConfiguration {

	@Bean
	fun myCodecCustomizer(): CodecCustomizer {
		return CodecCustomizer { configurer: CodecConfigurer ->
			configurer.registerDefaults(false)
			configurer.customCodecs().register(ServerSentEventHttpMessageReader())
		}
	}

}
```

```java
import org.springframework.boot.http.codec.CodecCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.codec.ServerSentEventHttpMessageReader;

@Configuration(proxyBeanMethods = false)
public class MyCodecsConfiguration {

	@Bean
	public CodecCustomizer myCodecCustomizer() {
		return (configurer) -> {
			configurer.registerDefaults(false);
			configurer.customCodecs().register(new ServerSentEventHttpMessageReader());
			// ...
		};
	}

}
```

你也可以使用 [Boot 的自訂 JSON 序列化器與反序列化器][web--reactive-r27]。

### 靜態內容

預設情況下，Spring Boot 從 classpath 中的 `/static`（或 `/public`、`/resources`、`/META-INF/resources`）目錄提供靜態內容。
它使用 Spring WebFlux 的 [`ResourceWebHandler`][web--reactive-r28]，因此你可以加入自己的 [`WebFluxConfigurer`][web--reactive-r13] 並覆寫 `addResourceHandlers` 方法，修改此行為。

預設資源會對映到 `/**`，但可以設定 `spring.webflux.static-path-pattern` 屬性調整。
例如，可如下將所有資源移到 `/resources/**`：

```properties
spring.webflux.static-path-pattern=/resources/**
```

```yaml
spring:
  webflux:
    static-path-pattern: "/resources/**"
```

你也可以使用 `spring.web.resources.static-locations` 自訂靜態資源位置。
這會用指定的目錄位置清單取代預設值。
如此設定後，預設歡迎頁偵測也會改用自訂位置。
因此，如果啟動時任一位置存在 `index.html`，它就會成為應用程式首頁。

除了前述「標準」靜態資源位置，還會特別處理 [Webjars 內容][web--reactive-r29]。
預設情況下，路徑位於 `/webjars/**` 的資源，只要以 Webjars 格式封裝，就會從 jar 檔提供。
此路徑可透過 `spring.webflux.webjars-path-pattern` 屬性自訂。

> **提示：**
>
> Spring WebFlux 應用程式並不嚴格依賴 Servlet API，因此無法部署為 war 檔，也不使用 `src/main/webapp` 目錄。

### 歡迎頁

Spring Boot 支援靜態與範本式歡迎頁。
它先在設定的靜態內容位置尋找 `index.html`。
若找不到，就接著尋找 `index` 範本。
只要找到其中之一，就會自動將它作為應用程式歡迎頁。

這只是應用程式實際定義之首頁路由的後備選項。
順序由 [`HandlerMapping`][web--reactive-r30] Bean 的順序決定，預設如下：

| 對映 | 用途 |
| --- | --- |
| `org.springframework.web.reactive.function.server.support.RouterFunctionMapping` | 透過 [`RouterFunction`][web--reactive-r5] Bean 宣告的端點 |
| `org.springframework.web.reactive.result.method.annotation.RequestMappingHandlerMapping` | 在 [`@Controller`][web--reactive-r31] Bean 中宣告的端點 |
| 歡迎頁的 `RouterFunctionMapping` | 歡迎頁支援 |

### 範本引擎

除了 REST Web 服務，也可使用 Spring WebFlux 提供動態 HTML 內容。
Spring WebFlux 支援多種範本技術，包括 Thymeleaf、FreeMarker 與 Mustache。

Spring Boot 包含下列範本引擎的自動設定支援：

- [FreeMarker][web--reactive-r32]
- [Thymeleaf][web--reactive-r33]
- [Mustache][web--reactive-r34]

> **注意：**
>
> WebFlux 並不支援所有 FreeMarker 功能。
> 詳情請查看各屬性的說明。

使用這些範本引擎的預設設定時，會自動從 `src/main/resources/templates` 讀取範本。

### 錯誤處理

Spring Boot 提供 [`WebExceptionHandler`][web--reactive-r35]，以合理方式處理所有錯誤。
它在處理順序中的位置，緊接於最後考慮的 WebFlux 內建處理器之前。
對機器用戶端，它會產生 JSON 回應，包含錯誤詳細資訊、HTTP 狀態與例外訊息。
對瀏覽器用戶端，則有「whitelabel」錯誤處理器，將相同資料轉為 HTML 格式。
你也可以提供自己的 HTML 範本顯示錯誤（請參閱[下一節][web--reactive-r36]）。

直接自訂 Spring Boot 錯誤處理之前，可以先使用 Spring WebFlux 的 [RFC 9457 Problem Details][web--reactive-r37] 支援。
Spring WebFlux 能以 `application/problem+json` 媒體型別產生自訂錯誤訊息，例如：

```json
{
	"type": "https://example.org/problems/unknown-project",
	"title": "Unknown project",
	"status": 404,
	"detail": "No project found for id 'spring-unknown'",
	"instance": "/projects/spring-unknown"
}
```

將 `spring.webflux.problemdetails.enabled` 設為 `true`，即可啟用此支援。

自訂此功能的第一步，通常是沿用既有機制，但替換或補充錯誤內容。
為此，你可以加入 [`ErrorAttributes`][web--reactive-r38] 型別的 Bean。

若要改變錯誤處理行為，可以實作 [`ErrorWebExceptionHandler`][web--reactive-r39]，並註冊該型別的 Bean 定義。
由於 [`ErrorWebExceptionHandler`][web--reactive-r39] 相當底層，Spring Boot 也提供便利的 [`AbstractErrorWebExceptionHandler`][web--reactive-r40]，讓你以 WebFlux 函數式方式處理錯誤，如下例所示：

```kotlin
import org.springframework.boot.autoconfigure.web.WebProperties
import org.springframework.boot.webflux.error.ErrorAttributes
import org.springframework.boot.webflux.autoconfigure.error.AbstractErrorWebExceptionHandler
import org.springframework.context.ApplicationContext
import org.springframework.http.HttpStatus
import org.springframework.http.MediaType
import org.springframework.http.codec.ServerCodecConfigurer
import org.springframework.stereotype.Component
import org.springframework.web.reactive.function.server.RouterFunction
import org.springframework.web.reactive.function.server.RouterFunctions
import org.springframework.web.reactive.function.server.ServerRequest
import org.springframework.web.reactive.function.server.ServerResponse
import reactor.core.publisher.Mono

@Component
class MyErrorWebExceptionHandler(
		errorAttributes: ErrorAttributes, webProperties: WebProperties,
		applicationContext: ApplicationContext, serverCodecConfigurer: ServerCodecConfigurer
) : AbstractErrorWebExceptionHandler(errorAttributes, webProperties.resources, applicationContext) {

	init {
		setMessageReaders(serverCodecConfigurer.readers)
		setMessageWriters(serverCodecConfigurer.writers)
	}

	override fun getRoutingFunction(errorAttributes: ErrorAttributes): RouterFunction<ServerResponse> {
		return RouterFunctions.route(this::acceptsXml, this::handleErrorAsXml)
	}

	private fun acceptsXml(request: ServerRequest): Boolean {
		return request.headers().accept().contains(MediaType.APPLICATION_XML)
	}

	fun handleErrorAsXml(request: ServerRequest): Mono<ServerResponse> {
		val builder = ServerResponse.status(HttpStatus.INTERNAL_SERVER_ERROR)
		// ... additional builder calls
		return builder.build()
	}

}
```

```java
import reactor.core.publisher.Mono;

import org.springframework.boot.autoconfigure.web.WebProperties;
import org.springframework.boot.webflux.autoconfigure.error.AbstractErrorWebExceptionHandler;
import org.springframework.boot.webflux.error.ErrorAttributes;
import org.springframework.context.ApplicationContext;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.codec.ServerCodecConfigurer;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.server.RouterFunction;
import org.springframework.web.reactive.function.server.RouterFunctions;
import org.springframework.web.reactive.function.server.ServerRequest;
import org.springframework.web.reactive.function.server.ServerResponse;
import org.springframework.web.reactive.function.server.ServerResponse.BodyBuilder;

@Component
public class MyErrorWebExceptionHandler extends AbstractErrorWebExceptionHandler {

	public MyErrorWebExceptionHandler(ErrorAttributes errorAttributes, WebProperties webProperties,
			ApplicationContext applicationContext, ServerCodecConfigurer serverCodecConfigurer) {
		super(errorAttributes, webProperties.getResources(), applicationContext);
		setMessageReaders(serverCodecConfigurer.getReaders());
		setMessageWriters(serverCodecConfigurer.getWriters());
	}

	@Override
	protected RouterFunction<ServerResponse> getRoutingFunction(ErrorAttributes errorAttributes) {
		return RouterFunctions.route(this::acceptsXml, this::handleErrorAsXml);
	}

	private boolean acceptsXml(ServerRequest request) {
		return request.headers().accept().contains(MediaType.APPLICATION_XML);
	}

	public Mono<ServerResponse> handleErrorAsXml(ServerRequest request) {
		BodyBuilder builder = ServerResponse.status(HttpStatus.INTERNAL_SERVER_ERROR);
		// ... additional builder calls
		return builder.build();
	}

}
```

若需要更完整的掌控，也可以直接繼承 [`DefaultErrorWebExceptionHandler`][web--reactive-r41]，覆寫特定方法。

某些情況下，在控制器層處理的錯誤，不會被 Web 觀測或[指標基礎設施][web--reactive-r42]記錄。
應用程式可[將已處理的例外設定到觀測上下文][web--reactive-r43]，確保觀測記錄這些例外。

#### 自訂錯誤頁

若要為特定狀態碼顯示自訂 HTML 錯誤頁，可以加入從 `error/*` 解析的檢視，例如將檔案加入 `/error` 目錄。
錯誤頁可以是靜態 HTML（放在任一靜態資源目錄下），也可以透過範本建置。
檔名應為確切狀態碼、狀態碼系列遮罩，或在其他選項都不符合時作為預設的 `error`。
請注意，預設錯誤檢視的路徑是 `error/error`；Spring MVC 則為 `error`。

例如，若要將 `404` 對映到靜態 HTML 檔，目錄結構如下：

```text
src/
 +- main/
     +- java/
     |   + <source code>
     +- resources/
         +- public/
             +- error/
             |   +- 404.html
             +- <other public assets>
```

若要使用 Mustache 範本對映所有 `5xx` 錯誤，目錄結構如下：

```text
src/
 +- main/
     +- java/
     |   + <source code>
     +- resources/
         +- templates/
             +- error/
             |   +- 5xx.mustache
             +- <other templates>
```

### Web 過濾器

Spring WebFlux 提供 [`WebFilter`][web--reactive-r44] 介面，可實作它來過濾 HTTP 請求與回應交換。
應用程式上下文中找到的 [`WebFilter`][web--reactive-r44] Bean，會自動用來過濾每次交換。

若過濾器順序很重要，可以實作 [`Ordered`][web--reactive-r45] 或標註 [`@Order`][web--reactive-r46]。
Spring Boot 自動設定可能會替你設定 Web 過濾器。
此時會使用下表中的順序：

| Web 過濾器 | 順序 |
| --- | --- |
| [`WebFilterChainProxy`][web--reactive-r47]（Spring Security） | `-100` |
| [`HttpExchangesWebFilter`][web--reactive-r48] | `Ordered.LOWEST_PRECEDENCE - 10` |

### API 版本管理

Spring WebFlux 支援 API 版本管理，讓 HTTP API 可以隨時間演進。
相同的 `@Controller` 路徑可多次對映，以支援不同 API 版本。

詳情請參閱 [Spring Framework 參考文件][web--reactive-r49]。

加入對映後，還需要設定 Spring WebFlux，讓它能使用請求傳送的版本資訊。
版本通常放在 HTTP 標頭、查詢參數、媒體型別參數，或路徑中。

若要設定 Spring WebFlux，可使用 [`WebFluxConfigurer`][web--reactive-r13] Bean 並覆寫 `configureApiVersioning(…)` 方法，或使用屬性。

例如，下列設定會從 `X-Version` HTTP 標頭取得版本資訊；未傳送標頭時，預設使用 `1.0.0`。

```properties
spring.webflux.apiversion.default=1.0.0
spring.webflux.apiversion.use.header=X-Version
```

```yaml
spring:
  webflux:
    apiversion:
      default: 1.0.0
      use:
        header: X-Version
```

> **注意：**
>
> 如果你的設定需要多種策略，例如同時使用標頭與查詢參數，可考慮覆寫 `configureApiVersioning` 方法，以程式宣告順序。

若需要更完整掌控，也可以定義 [`ApiVersionResolver`][web--reactive-r50]、[`ApiVersionParser`][web--reactive-r51] 與 [`ApiVersionDeprecationHandler`][web--reactive-r52] Bean；它們會被注入自動設定的 Spring WebFlux 設定中。

> **提示：**
>
> 用戶端的 `WebClient` 與 `RestClient` 也支援 API 版本管理。
> 詳情請參閱 [API 版本管理][web--reactive-r53]。

## 內嵌反應式伺服器支援

Spring Boot 支援下列內嵌反應式 Web 伺服器：Reactor Netty、Tomcat 與 Jetty。
大多數開發人員會使用對應 starter 取得完整設定的實例。
預設內嵌伺服器在連接埠 8080 監聽 HTTP 請求。

### 自訂反應式伺服器

可透過 Spring [`Environment`][web--reactive-r54] 屬性設定常見的反應式 Web 伺服器設定。
通常會在 `application.properties` 或 `application.yaml` 檔中定義這些屬性。

常見伺服器設定包括：

- 網路設定：傳入 HTTP 請求的監聽連接埠（`server.port`）、要繫結的介面位址（`server.address`）等。
- 錯誤管理：錯誤頁位置（`spring.web.error.path`）等。
- [SSL][web--reactive-r55]
- [HTTP 壓縮][web--reactive-r56]

Spring Boot 盡可能公開常用設定，但無法涵蓋所有情況。
對於這些情況，`server.netty.*` 等專用命名空間提供伺服器專屬的自訂。

> **提示：**
>
> 完整清單請參閱 [`ServerProperties`][web--reactive-r57] 類別。

#### 以程式自訂

若需要以程式設定反應式 Web 伺服器，可以註冊實作 [`WebServerFactoryCustomizer`][web--reactive-r58] 介面的 Spring Bean。
[`WebServerFactoryCustomizer`][web--reactive-r58] 讓你存取 [`ConfigurableReactiveWebServerFactory`][web--reactive-r59]，其中包含多個自訂用的 setter 方法。
下例展示以程式設定連接埠：

```kotlin
import org.springframework.boot.web.server.WebServerFactoryCustomizer
import org.springframework.boot.web.server.reactive.ConfigurableReactiveWebServerFactory
import org.springframework.stereotype.Component

@Component
class MyWebServerFactoryCustomizer : WebServerFactoryCustomizer<ConfigurableReactiveWebServerFactory> {

	override fun customize(server: ConfigurableReactiveWebServerFactory) {
		server.setPort(9000)
	}

}
```

```java
import org.springframework.boot.web.server.WebServerFactoryCustomizer;
import org.springframework.boot.web.server.reactive.ConfigurableReactiveWebServerFactory;
import org.springframework.stereotype.Component;

@Component
public class MyWebServerFactoryCustomizer implements WebServerFactoryCustomizer<ConfigurableReactiveWebServerFactory> {

	@Override
	public void customize(ConfigurableReactiveWebServerFactory server) {
		server.setPort(9000);
	}

}
```

[`JettyReactiveWebServerFactory`][web--reactive-r60]、[`NettyReactiveWebServerFactory`][web--reactive-r61] 與 [`TomcatReactiveWebServerFactory`][web--reactive-r62] 是 [`ConfigurableReactiveWebServerFactory`][web--reactive-r59] 的專用變體，分別提供 Jetty、Reactor Netty 與 Tomcat 的額外自訂 setter 方法。
下例展示如何自訂 [`NettyReactiveWebServerFactory`][web--reactive-r61]，以存取 Reactor Netty 專屬設定選項：

```kotlin
import org.springframework.boot.web.server.WebServerFactoryCustomizer
import org.springframework.boot.reactor.netty.NettyReactiveWebServerFactory
import org.springframework.stereotype.Component
import java.time.Duration

@Component
class MyNettyWebServerFactoryCustomizer : WebServerFactoryCustomizer<NettyReactiveWebServerFactory> {

	override fun customize(factory: NettyReactiveWebServerFactory) {
		factory.addServerCustomizers({ server -> server.idleTimeout(Duration.ofSeconds(20)) })
	}

}
```

```java
import java.time.Duration;

import org.springframework.boot.reactor.netty.NettyReactiveWebServerFactory;
import org.springframework.boot.web.server.WebServerFactoryCustomizer;
import org.springframework.stereotype.Component;

@Component
public class MyNettyWebServerFactoryCustomizer implements WebServerFactoryCustomizer<NettyReactiveWebServerFactory> {

	@Override
	public void customize(NettyReactiveWebServerFactory factory) {
		factory.addServerCustomizers((server) -> server.idleTimeout(Duration.ofSeconds(20)));
	}

}
```

#### 直接自訂 ConfigurableReactiveWebServerFactory

更進階的使用情境若需要繼承 [`ReactiveWebServerFactory`][web--reactive-r63]，可以自行公開該型別的 Bean。

許多設定選項都有對應 setter。
若需要更特殊的處理，也提供數個受保護的方法「掛鉤」。
詳情請參閱 [`ConfigurableReactiveWebServerFactory`][web--reactive-r59] API 文件。

> **注意：**
>
> 自動設定的自訂器仍會套用到你的自訂工廠，因此請謹慎使用此選項。

## 反應式伺服器資源設定

自動設定 Reactor Netty 或 Jetty 伺服器時，Spring Boot 會建立特定 Bean，為伺服器實例提供 HTTP 資源：[`ReactorResourceFactory`][web--reactive-r64] 或 [`JettyResourceFactory`][web--reactive-r65]。

預設情況下，若符合下列條件，這些資源也會與 Reactor Netty 及 Jetty 用戶端共用，以取得最佳效能：

- 伺服器與用戶端使用相同技術。
- 用戶端實例使用 Spring Boot 自動設定的 [`WebClient.Builder`][web--reactive-r66] Bean 建立。

開發人員可提供自訂的 [`ReactorResourceFactory`][web--reactive-r64] 或 [`JettyResourceFactory`][web--reactive-r65] Bean，覆寫 Jetty 與 Reactor Netty 的資源設定；這會同時套用到用戶端與伺服器。

用戶端資源設定的更多資訊，請參閱 [WebClient 執行環境][web--reactive-r67]章節。

[web--reactive-r1]: https://www.reactive-streams.org/
[web--reactive-r2]: https://projectreactor.io/
[web--reactive-r3]: https://docs.spring.io/spring-framework/reference/7.0/web/webflux.html
[web--reactive-r4]: https://docs.spring.io/spring-framework/reference/7.0/web/webflux-functional.html
[web--reactive-r5]: https://docs.spring.io/spring-framework/docs/7.0.x/javadoc-api/org/springframework/web/reactive/function/server/RouterFunction.html
[web--reactive-r6]: https://docs.spring.io/spring-framework/docs/7.0.x/javadoc-api/org/springframework/web/reactive/function/client/WebClient.html
[web--reactive-r7]: https://docs.spring.io/spring-framework/docs/7.0.x/javadoc-api/org/springframework/http/codec/HttpMessageReader.html
[web--reactive-r8]: https://docs.spring.io/spring-framework/docs/7.0.x/javadoc-api/org/springframework/http/codec/HttpMessageWriter.html
[web--reactive-r9]: https://docs.spring.io/spring-boot/4.1/reference/web/reactive.html#web.reactive.webflux.httpcodecs
[web--reactive-r10]: https://docs.spring.io/spring-boot/4.1/reference/web/servlet.html#web.servlet.spring-mvc.static-content
[web--reactive-r11]: https://docs.spring.io/spring-framework/reference/7.0/web/webflux/config.html
[web--reactive-r12]: https://docs.spring.io/spring-framework/docs/7.0.x/javadoc-api/org/springframework/context/annotation/Configuration.html
[web--reactive-r13]: https://docs.spring.io/spring-framework/docs/7.0.x/javadoc-api/org/springframework/web/reactive/config/WebFluxConfigurer.html
[web--reactive-r14]: https://docs.spring.io/spring-framework/docs/7.0.x/javadoc-api/org/springframework/web/reactive/config/EnableWebFlux.html
[web--reactive-r15]: https://docs.spring.io/spring-framework/docs/7.0.x/javadoc-api/org/springframework/http/server/reactive/HttpHandler.html
[web--reactive-r16]: https://docs.spring.io/spring-boot/4.1.1/api/java/org/springframework/boot/webflux/autoconfigure/WebHttpHandlerBuilderCustomizer.html
[web--reactive-r17]: https://docs.spring.io/spring-framework/docs/7.0.x/javadoc-api/org/springframework/web/server/adapter/WebHttpHandlerBuilder.html
[web--reactive-r18]: https://docs.spring.io/spring-framework/docs/7.0.x/javadoc-api/org/springframework/core/convert/ConversionService.html
[web--reactive-r19]: https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/time/LocalDate.html
[web--reactive-r20]: https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/time/LocalTime.html
[web--reactive-r21]: https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/time/OffsetTime.html
[web--reactive-r22]: https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/time/LocalDateTime.html
[web--reactive-r23]: https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/time/OffsetDateTime.html
[web--reactive-r24]: https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/time/ZonedDateTime.html
[web--reactive-r25]: https://docs.spring.io/spring-framework/docs/7.0.x/javadoc-api/org/springframework/http/codec/CodecConfigurer.html
[web--reactive-r26]: https://docs.spring.io/spring-boot/4.1.1/api/java/org/springframework/boot/http/codec/CodecCustomizer.html
[web--reactive-r27]: https://docs.spring.io/spring-boot/4.1/reference/features/json.html#features.json.jackson.custom-serializers-and-deserializers
[web--reactive-r28]: https://docs.spring.io/spring-framework/docs/7.0.x/javadoc-api/org/springframework/web/reactive/resource/ResourceWebHandler.html
[web--reactive-r29]: https://www.webjars.org/
[web--reactive-r30]: https://docs.spring.io/spring-framework/docs/7.0.x/javadoc-api/org/springframework/web/reactive/HandlerMapping.html
[web--reactive-r31]: https://docs.spring.io/spring-framework/docs/7.0.x/javadoc-api/org/springframework/stereotype/Controller.html
[web--reactive-r32]: https://freemarker.apache.org/docs/
[web--reactive-r33]: https://www.thymeleaf.org
[web--reactive-r34]: https://mustache.github.io/
[web--reactive-r35]: https://docs.spring.io/spring-framework/docs/7.0.x/javadoc-api/org/springframework/web/server/WebExceptionHandler.html
[web--reactive-r36]: https://docs.spring.io/spring-boot/4.1/reference/web/reactive.html#web.reactive.webflux.error-handling.error-pages
[web--reactive-r37]: https://docs.spring.io/spring-framework/reference/7.0/web/webflux/ann-rest-exceptions.html
[web--reactive-r38]: https://docs.spring.io/spring-boot/4.1.1/api/java/org/springframework/boot/webflux/error/ErrorAttributes.html
[web--reactive-r39]: https://docs.spring.io/spring-boot/4.1.1/api/java/org/springframework/boot/webflux/error/ErrorWebExceptionHandler.html
[web--reactive-r40]: https://docs.spring.io/spring-boot/4.1.1/api/java/org/springframework/boot/webflux/autoconfigure/error/AbstractErrorWebExceptionHandler.html
[web--reactive-r41]: https://docs.spring.io/spring-boot/4.1.1/api/java/org/springframework/boot/webflux/autoconfigure/error/DefaultErrorWebExceptionHandler.html
[web--reactive-r42]: https://docs.spring.io/spring-boot/4.1/reference/actuator/metrics.html#actuator.metrics.supported.spring-webflux
[web--reactive-r43]: https://docs.spring.io/spring-framework/reference/7.0/integration/observability.html#observability.http-server.reactive
[web--reactive-r44]: https://docs.spring.io/spring-framework/docs/7.0.x/javadoc-api/org/springframework/web/server/WebFilter.html
[web--reactive-r45]: https://docs.spring.io/spring-framework/docs/7.0.x/javadoc-api/org/springframework/core/Ordered.html
[web--reactive-r46]: https://docs.spring.io/spring-framework/docs/7.0.x/javadoc-api/org/springframework/core/annotation/Order.html
[web--reactive-r47]: https://docs.spring.io/spring-security/reference/7.1/api/java/org/springframework/security/web/server/WebFilterChainProxy.html
[web--reactive-r48]: https://docs.spring.io/spring-boot/4.1.1/api/java/org/springframework/boot/webflux/actuate/web/exchanges/HttpExchangesWebFilter.html
[web--reactive-r49]: https://docs.spring.io/spring-framework/reference/7.0/web/webflux/controller/ann-requestmapping.html#webflux-ann-requestmapping-version
[web--reactive-r50]: https://docs.spring.io/spring-framework/docs/7.0.x/javadoc-api/org/springframework/web/reactive/accept/ApiVersionResolver.html
[web--reactive-r51]: https://docs.spring.io/spring-framework/docs/7.0.x/javadoc-api/org/springframework/web/accept/ApiVersionParser.html
[web--reactive-r52]: https://docs.spring.io/spring-framework/docs/7.0.x/javadoc-api/org/springframework/web/reactive/accept/ApiVersionDeprecationHandler.html
[web--reactive-r53]: https://docs.spring.io/spring-boot/4.1/reference/io/rest-client.html#io.rest-client.apiversioning
[web--reactive-r54]: https://docs.spring.io/spring-framework/docs/7.0.x/javadoc-api/org/springframework/core/env/Environment.html
[web--reactive-r55]: https://docs.spring.io/spring-boot/4.1/how-to/webserver.html#howto.webserver.configure-ssl
[web--reactive-r56]: https://docs.spring.io/spring-boot/4.1/how-to/webserver.html#howto.webserver.enable-response-compression
[web--reactive-r57]: https://docs.spring.io/spring-boot/4.1.1/api/java/org/springframework/boot/web/server/autoconfigure/ServerProperties.html
[web--reactive-r58]: https://docs.spring.io/spring-boot/4.1.1/api/java/org/springframework/boot/web/server/WebServerFactoryCustomizer.html
[web--reactive-r59]: https://docs.spring.io/spring-boot/4.1.1/api/java/org/springframework/boot/web/server/reactive/ConfigurableReactiveWebServerFactory.html
[web--reactive-r60]: https://docs.spring.io/spring-boot/4.1.1/api/java/org/springframework/boot/jetty/reactive/JettyReactiveWebServerFactory.html
[web--reactive-r61]: https://docs.spring.io/spring-boot/4.1.1/api/java/org/springframework/boot/reactor/netty/NettyReactiveWebServerFactory.html
[web--reactive-r62]: https://docs.spring.io/spring-boot/4.1.1/api/java/org/springframework/boot/tomcat/reactive/TomcatReactiveWebServerFactory.html
[web--reactive-r63]: https://docs.spring.io/spring-boot/4.1.1/api/java/org/springframework/boot/web/server/reactive/ReactiveWebServerFactory.html
[web--reactive-r64]: https://docs.spring.io/spring-framework/docs/7.0.x/javadoc-api/org/springframework/http/client/ReactorResourceFactory.html
[web--reactive-r65]: https://docs.spring.io/spring-framework/docs/7.0.x/javadoc-api/org/springframework/http/client/reactive/JettyResourceFactory.html
[web--reactive-r66]: https://docs.spring.io/spring-framework/docs/7.0.x/javadoc-api/org/springframework/web/reactive/function/client/WebClient.Builder.html
[web--reactive-r67]: https://docs.spring.io/spring-boot/4.1/reference/io/rest-client.html#io.rest-client.webclient.runtime
