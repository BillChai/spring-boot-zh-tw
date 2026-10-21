# 端點

Actuator 端點讓你監控應用程式，並與其互動。
Spring Boot 內建多個端點，也允許加入自己的端點。
例如 `health` 端點提供基本應用程式健康資訊。

你可以[控制個別端點的存取][r1]，並[透過 HTTP 或 JMX 公開端點，讓遠端可存取][r2]。
只有允許存取且已公開的端點，才視為可用。
內建端點只有在可用時才會自動設定。
大多數應用程式選擇透過 HTTP 公開，以 `/actuator` 前綴加上端點 ID 對應到 URL。
例如 `health` 預設對應到 `/actuator/health`。

> [TIP]
>
> 若要了解 Actuator 端點及其請求、回應格式，請參閱 [API 文件][r3]。

提供以下不依賴特定技術的端點：

| ID | 說明 |
| --- | --- |
| `auditevents` | 公開目前應用程式的稽核事件資訊。需要 [`AuditEventRepository`][r4] Bean。 |
| `beans` | 顯示應用程式所有 Spring Bean 的完整清單。 |
| `caches` | 公開可用快取。 |
| `conditions` | 顯示設定與自動設定類別上已評估的條件，以及符合或不符合的原因。 |
| `configprops` | 顯示所有 [`@ConfigurationProperties`][r5] 的彙整清單。適用[敏感值遮罩][r6]。 |
| `env` | 公開 Spring [`ConfigurableEnvironment`][r7] 的屬性。適用[敏感值遮罩][r6]。 |
| `flyway` | 顯示已套用的 Flyway 資料庫移轉。需要一或多個 [`Flyway`][r8] Bean。 |
| `health` | 顯示應用程式健康資訊。 |
| `httpexchanges` | 顯示 HTTP 交換資訊，預設為最近 100 次 HTTP 請求與回應交換。需要 [`HttpExchangeRepository`][r9] Bean。 |
| `info` | 顯示任意應用程式資訊。 |
| `integrationgraph` | 顯示 Spring Integration 圖。需要 `spring-integration-core` 依賴。 |
| `loggers` | 顯示並修改應用程式的 logger 設定。 |
| `liquibase` | 顯示已套用的 Liquibase 資料庫移轉。需要一或多個 [`Liquibase`][r10] Bean。 |
| `metrics` | 顯示目前應用程式的指標資訊，用於診斷已記錄的指標。 |
| `mappings` | 顯示所有 [`@RequestMapping`][r11] 路徑的彙整清單。 |
| `quartz` | 顯示 Quartz Scheduler 工作資訊。適用[敏感值遮罩][r6]。 |
| `scheduledtasks` | 顯示應用程式中的排程工作。 |
| `sessions` | 允許從 Spring Session 的 session store 取得及刪除使用者工作階段。需要使用 Spring Session 的 Servlet Web 應用程式。 |
| `shutdown` | 讓應用程式優雅關閉。只適用於 jar 封裝。預設停用。 |
| `startup` | 顯示 [`ApplicationStartup`][r13] 收集的[啟動步驟資料][r12]。需要將 [`SpringApplication`][r14] 設定為使用 [`BufferingApplicationStartup`][r15]。 |
| `threaddump` | 執行執行緒傾印。 |

若應用程式是 Web 應用程式（Spring MVC、Spring WebFlux 或 Jersey），還能使用以下端點：

| ID | 說明 |
| --- | --- |
| `heapdump` | 回傳 heap dump 檔案。HotSpot JVM 回傳 `HPROF` 格式；OpenJ9 JVM 回傳 `PHD` 格式。 |
| `logfile` | 若已設定 `logging.file.name` 或 `logging.file.path`，回傳日誌檔內容。支援 HTTP `Range` 標頭，可取得部分內容。 |
| `prometheus` | 以 Prometheus 伺服器可抓取的格式公開指標。需要 `micrometer-registry-prometheus` 依賴。 |

## 控制端點存取

預設除 `shutdown` 與 `heapdump` 外，所有端點的存取皆不受限制。
若要設定端點允許的存取方式，請使用 `management.endpoint.<id>.access`。
下例允許對 `shutdown` 端點不受限制的存取：

{{CODE_0}}

{{CODE_1}}

若偏好預設不允許、逐一啟用的方式，可將 `management.endpoints.access.default` 設為 `none`，再以個別端點的 `access` 屬性啟用。
下例只允許唯讀存取 `loggers`，拒絕其他所有端點：

{{CODE_2}}

{{CODE_3}}

> [NOTE]
>
> 不可存取的端點會完全從應用程式上下文移除。
> 若只想修改端點透過哪些技術公開，請改用 [`include` 與 `exclude` 屬性][r2]。

### 限制存取

可使用 `management.endpoints.access.max-permitted`，限制整個應用程式的端點存取。
其優先順序高於預設存取或個別端點的存取等級。
設為 `none` 會讓所有端點不可存取。
設為 `read-only` 則只允許讀取。

對 [`@Endpoint`][r16]、[`@JmxEndpoint`][r17] 與 [`@WebEndpoint`][r18]，讀取存取代表標註 [`@ReadOperation`][r19] 的方法。
對 [`@ControllerEndpoint`][r20] 與 [`@RestControllerEndpoint`][r21]，代表能處理 `GET` 與 `HEAD` 的請求對應。
對 [`@ServletEndpoint`][r22]，代表 `GET` 與 `HEAD` 請求。

## 公開端點

預設只有 health 端點透過 HTTP 與 JMX 公開。
由於端點可能包含敏感資訊，應審慎考慮何時公開。

若要修改公開的端點，請使用以下各技術專用的 `include` 與 `exclude` 屬性：

| 屬性 | 預設值 |
| --- | --- |
| `management.endpoints.jmx.exposure.exclude` |  |
| `management.endpoints.jmx.exposure.include` | `health` |
| `management.endpoints.web.exposure.exclude` |  |
| `management.endpoints.web.exposure.include` | `health` |

`include` 列出要公開的端點 ID。
`exclude` 列出不應公開的端點 ID。
`exclude` 優先於 `include`。
兩者都可以設定端點 ID 清單。

例如只透過 JMX 公開 `health` 與 `info`：

{{CODE_4}}

{{CODE_5}}

`*` 可選取所有端點。
例如透過 HTTP 公開除 `env` 與 `beans` 外的所有端點：

{{CODE_6}}

{{CODE_7}}

> [NOTE]
>
> `*` 在 YAML 有特殊意義，因此若要納入或排除所有端點，務必加上引號。

> [NOTE]
>
> 如果應用程式公開對外，強烈建議也[保護端點安全][r23]。

> [TIP]
>
> 若想實作自己的端點公開策略，可註冊 [`EndpointFilter`][r24] Bean。

## 安全性

基於安全考量，預設只有 `/health` 透過 HTTP 公開。
可使用 `management.endpoints.web.exposure.include` 設定公開的端點。

> [NOTE]
>
> 設定 `management.endpoints.web.exposure.include` 前，請確保公開的 actuator 不含敏感資訊、位於防火牆後方受到保護，或受 Spring Security 等機制保護。

若 classpath 有 Spring Security，且沒有其他 [`SecurityFilterChain`][r25] Bean，Spring Boot 自動設定會保護 `/health` 以外的所有 actuator。
若定義自訂 [`SecurityFilterChain`][r25] Bean，Spring Boot 自動設定就會退讓，讓你完全控制 actuator 存取規則。

若想為 HTTP 端點設定自訂安全性，例如只允許特定角色存取，Spring Boot 提供方便的 [`RequestMatcher`][r26] 物件，可與 Spring Security 搭配。

典型設定可能如下：

{{CODE_8}}

{{CODE_9}}

上例以 `EndpointRequest.toAnyEndpoint()` 比對任何端點的請求，再確保存取者具有 `ENDPOINT_ADMIN` 角色。
[`EndpointRequest`][r27] 也提供其他比對方法。
詳見 [API 文件][r3]。

> [NOTE]
>
> 比對 Actuator 端點時，`EndpointRequest.to("endpoint")` 會考慮端點根路徑與所有子路徑。
> 即使端點未宣告巢狀路由，實際也會比對 `"/actuator/endpoint/**"`。

若應用程式部署於防火牆後方，你可能希望所有 actuator 端點不需驗證身分即可存取。
可如下修改 `management.endpoints.web.exposure.include`：

{{CODE_10}}

{{CODE_11}}

此外，若存在 Spring Security，還需要加入允許未驗證存取的自訂安全性設定，如下例：

{{CODE_12}}

{{CODE_13}}

> [NOTE]
>
> 上述兩個範例都只適用於 actuator 端點。
> 由於只要有任何 [`SecurityFilterChain`][r25] Bean，Spring Boot 安全性設定就會完全退讓，因此還需要另外設定 [`SecurityFilterChain`][r25] Bean，保護應用程式其餘部分。

### 跨站請求偽造防護

Spring Boot 採用 Spring Security 預設值，因此 CSRF 防護預設啟用。
這代表使用預設安全性設定時，需要 `POST`（shutdown 與 loggers）、`PUT` 或 `DELETE` 的 actuator 端點會收到 403（禁止）錯誤。

> [NOTE]
>
> 只有在建立供非瀏覽器用戶端使用的服務時，才建議完全停用 CSRF 防護。

更多資訊請參閱 [Spring Security 參考指南][r28]。

## 設定端點

端點會自動快取不接受任何參數之讀取操作的回應。
若要設定快取回應的時間，請使用 `cache.time-to-live` 屬性。
下例將 `beans` 端點的快取存活時間設為 10 秒：

{{CODE_14}}

{{CODE_15}}

> [NOTE]
>
> `management.endpoint.<name>` 前綴唯一識別正在設定的端點。

## 遮罩敏感值

`/env`、`/configprops` 與 `/quartz` 回傳的資訊可能敏感，因此預設一律完整遮罩，替換為 `******`。

只有符合下列條件，才能檢視未遮罩的值：

- `show-values` 設為 `never` 以外的值。
- 沒有適用的自訂 [`SanitizingFunction`][r29] Bean。

支援遮罩的端點可將 `show-values` 設為：

- `never`：一律完整遮罩，替換為 `******`。
- `always`：向所有使用者顯示值，前提是沒有適用的 [`SanitizingFunction`][r30] Bean。
- `when-authorized`：只向已授權使用者顯示值，前提是沒有適用的 [`SanitizingFunction`][r30] Bean。

對 HTTP 端點，使用者若已驗證身分，並具有端點 roles 屬性設定的角色，就視為已授權。
預設任何已驗證身分的使用者都已授權。

對 JMX 端點，所有使用者一律視為已授權。

下例允許所有具有 `admin` 角色的使用者檢視 `/env` 原始值。
未授權或沒有 `admin` 角色的使用者只能看見遮罩值。

{{CODE_16}}

{{CODE_17}}

> [NOTE]
>
> 此範例假設未定義任何 [`SanitizingFunction`][r29] Bean。

## Actuator Web 端點的超媒體

系統會加入包含所有端點連結的「探索頁面」。
預設位於 `/actuator`。

若要停用探索頁面，請加入以下應用程式屬性：

{{CODE_18}}

{{CODE_19}}

設定自訂管理上下文路徑時，探索頁面會自動從 `/actuator` 移到管理上下文根路徑。
例如管理上下文路徑為 `/management`，探索頁面就在 `/management`。
若設為 `/`，則停用探索頁面，以避免與其他路徑對應衝突。

## CORS 支援

[跨來源資源共用][r31]（CORS）是 [W3C 規範][r32]，讓你彈性指定允許哪些跨網域請求。
使用 Spring MVC 或 Spring WebFlux 時，可設定 Actuator Web 端點支援此情境。

CORS 預設停用，只有設定 `management.endpoints.web.cors.allowed-origins` 後才會啟用。
下列設定允許來自 `example.com` 網域的 `GET` 與 `POST` 呼叫：

{{CODE_20}}

{{CODE_21}}

> [TIP]
>
> 完整選項清單請參閱 [`CorsEndpointProperties`][r33]。

## JSON

處理 JSON 時，使用 Jackson 序列化與反序列化。
預設使用隔離的 [`JsonMapper`][r34]。
這表示它不與應用程式的 `JsonMapper` 共用設定，也不受 `spring.jackson.*` 影響。
若要停用此行為，讓 Actuator 使用應用程式的 `JsonMapper`，請將 `management.endpoints.jackson.isolated-json-mapper` 設為 `false`。
也可定義自己的 [`EndpointJsonMapper`][r35] Bean，產生符合需求的 `JsonMapper`。
Actuator 就會用它處理 JSON。

## 實作自訂端點

若加入標註 [`@Endpoint`][r16] 的 [`@Bean`][r36]，其中標註 [`@ReadOperation`][r19]、[`@WriteOperation`][r37] 或 [`@DeleteOperation`][r38] 的方法會自動透過 JMX 公開；在 Web 應用程式也會透過 HTTP 公開。
HTTP 端點可使用 Jersey、Spring MVC 或 Spring WebFlux。
Jersey 與 Spring MVC 都可用時，使用 Spring MVC。

下例公開一個回傳自訂物件的讀取操作：

{{CODE_22}}

{{CODE_23}}

也可以使用 [`@JmxEndpoint`][r17] 或 [`@WebEndpoint`][r18] 撰寫技術專屬端點。
這些端點只限於各自技術。
例如 [`@WebEndpoint`][r18] 只透過 HTTP 公開，不透過 JMX。

可使用 [`@EndpointWebExtension`][r39] 與 [`@EndpointJmxExtension`][r40] 撰寫技術專屬擴充。
這些註解讓你提供特定技術操作，擴充既有端點。
每個端點對每種類型最多只能有一個擴充。

最後，若需使用 Web 框架特有功能，可實作 Servlet 或 Spring [`@Controller`][r41]、[`@RestController`][r42] 端點；代價是它們無法透過 JMX 或其他 Web 框架使用。

### 接收輸入

端點操作透過參數接收輸入。
透過 Web 公開時，參數值來自 URL 查詢參數與 JSON 請求本文。
透過 JMX 公開時，則對應到 MBean 操作參數。
參數預設必填。
可標註 JSpecify 的 [`@Nullable`][r43] 使其成為選填。
也支援 Kotlin null safety。

可以將 JSON 請求本文每個根屬性，對應到端點參數。
考慮以下 JSON 本文：

{{CODE_24}}

可以用它呼叫接受 `String name` 與 `int counter` 的寫入操作，如下例：

{{CODE_25}}

{{CODE_26}}

> [TIP]
>
> 因為端點不依賴特定技術，方法簽章只能指定簡單型別。
> 特別是，不支援以單一 [`CustomData`][r44] 參數同時定義 `name` 與 `counter` 屬性。

> [NOTE]
>
> 為了將輸入對應到操作方法參數，實作端點的 Java 程式碼應以 `-parameters` 編譯。
> Kotlin 程式碼請參閱 Spring Framework 參考文件的[建議][r45]。
> 使用 Spring Boot Gradle plugin，或 Maven 搭配 `spring-boot-starter-parent` 時，會自動完成這項設定。

#### 輸入型別轉換

傳入端點操作方法的參數，必要時會自動轉成所需型別。
呼叫方法前，透過 JMX 或 HTTP 接收的輸入，會使用 [`ApplicationConversionService`][r46] 實例，以及以 [`@EndpointConverter`][r49] 限定的 [`Converter`][r47] 或 [`GenericConverter`][r48] Bean，轉換成所需型別。

### 自訂 Web 端點

[`@Endpoint`][r16]、[`@WebEndpoint`][r18] 或 [`@EndpointWebExtension`][r39] 的操作，會自動使用 Jersey、Spring MVC 或 Spring WebFlux 透過 HTTP 公開。
Jersey 與 Spring MVC 都可用時，使用 Spring MVC。

#### Web 端點請求述詞

系統會為公開至 Web 的端點之每個操作，自動產生請求述詞。

#### 路徑

述詞路徑由端點 ID 與 Web 端點基底路徑決定。
預設基底路徑為 `/actuator`。
例如 ID 為 `sessions` 的端點，述詞路徑就是 `/actuator/sessions`。

可在操作方法的一或多個參數標註 [`@Selector`][r50]，進一步自訂路徑。
這種參數會作為路徑變數加入路徑述詞。
呼叫端點操作時，變數值會傳入操作方法。
若要擷取剩餘所有路徑元素，可在最後一個參數加入 `@Selector(Match=ALL_REMAINING)`，並將其設為可與 `String[]` 相容轉換的型別。

#### HTTP 方法

述詞的 HTTP 方法由操作類型決定：

| 操作 | HTTP 方法 |
| --- | --- |
| [`@ReadOperation`][r19] | `GET` |
| [`@WriteOperation`][r37] | `POST` |
| [`@DeleteOperation`][r38] | `DELETE` |

#### Consumes

使用請求本文的 [`@WriteOperation`][r37]（HTTP `POST`），述詞的 `consumes` 子句為 `application/vnd.spring-boot.actuator.v2+json, application/json`。
其他操作的 `consumes` 為空。

#### Produces

述詞的 `produces` 子句可透過 [`@DeleteOperation`][r38]、[`@ReadOperation`][r19] 與 [`@WriteOperation`][r37] 的 `produces` 屬性決定。
此屬性為選填。
未使用時，自動決定 `produces`。

若操作方法回傳 `void` 或 [`Void`][r51]，`produces` 為空。
若回傳 [`Resource`][r52]，則為 `application/octet-stream`。
其他操作則為 `application/vnd.spring-boot.actuator.v2+json, application/json`。

#### Web 端點回應狀態

端點操作的預設回應狀態，依操作類型（讀取、寫入或刪除），以及是否回傳內容而定。

[`@ReadOperation`][r19] 回傳值時，狀態為 200（OK）。
未回傳值時，為 404（Not Found）。

[`@WriteOperation`][r37] 或 [`@DeleteOperation`][r38] 回傳值時，狀態為 200（OK）。
未回傳值時，為 204（No Content）。

若呼叫時缺少必要參數，或參數無法轉為所需型別，操作方法不會執行，回應狀態為 400（Bad Request）。

#### Web 端點範圍請求

可以透過 HTTP range request 請求 HTTP 資源的一部分。
使用 Spring MVC 或 Spring WebFlux 時，回傳 [`Resource`][r52] 的操作會自動支援範圍請求。

> [NOTE]
>
> Jersey 不支援範圍請求。

#### Web 端點安全性

Web 端點或 Web 專屬端點擴充的操作，可透過方法參數接收目前的 [`Principal`][r53] 或 [`SecurityContext`][r54]。
前者通常搭配 [`@Nullable`][r43]，為已驗證與未驗證使用者提供不同處理。
後者通常透過 `isUserInRole(String)` 進行授權檢查。

## 健康資訊

你可以透過健康資訊檢查執行中應用程式的狀態。
監控軟體常利用它，在正式系統故障時通知人員。
`health` 公開的資訊取決於 `management.endpoint.health.show-details` 與 `management.endpoint.health.show-components`，可設為以下值：

| 名稱 | 說明 |
| --- | --- |
| `never` | 永不顯示詳細資訊。 |
| `when-authorized` | 只向已授權使用者顯示詳細資訊。可透過 `management.endpoint.health.roles` 設定授權角色。 |
| `always` | 向所有使用者顯示詳細資訊。 |

預設值為 `never`。
使用者只要具有端點設定的一或多個角色，就視為已授權。
若端點未設定角色（預設情況），所有已驗證身分的使用者都視為已授權。
可透過 `management.endpoint.health.roles` 設定角色。

> [NOTE]
>
> 若應用程式已加上安全保護，又希望使用 `always`，安全性設定必須同時允許已驗證與未驗證使用者存取 health 端點。

健康資訊從 [`HealthContributorRegistry`][r55] 的內容收集，預設為 [`ApplicationContext`][r57] 中定義的所有 [`HealthContributor`][r56] 實例。
Spring Boot 包含多個自動設定的 [`HealthContributor`][r56] Bean，也可自行撰寫。

[`HealthContributor`][r56] 可以是 [`HealthIndicator`][r58] 或 [`CompositeHealthContributor`][r59]。
[`HealthIndicator`][r58] 提供實際健康資訊，包含 [`Status`][r60]。
[`CompositeHealthContributor`][r59] 則組合其他 [`HealthContributor`][r56] 實例。
它們共同形成樹狀結構，呈現整體系統健康。

預設最終系統健康由 [`StatusAggregator`][r61] 推導：依照有序狀態清單，排序各 [`HealthIndicator`][r58] 的狀態。
排序後第一個狀態即作為整體健康狀態。
若沒有任何 [`HealthIndicator`][r58] 回傳 [`StatusAggregator`][r61] 認識的狀態，則使用 `UNKNOWN`。

> [TIP]
>
> 可使用 [`HealthContributorRegistry`][r55]，在執行期間註冊及取消註冊健康指標。

### 自動設定的 HealthIndicator

適用時，Spring Boot 會自動設定下表的 [`HealthIndicator`][r58] Bean。
也可以透過 `management.health.key.enabled` 啟用或停用個別指標，其中 `key` 如下表：

| Key | 名稱 | 說明 |
| --- | --- | --- |
| `cassandra` | [`CassandraDriverHealthIndicator`][r62] | 檢查 Cassandra 資料庫是否正常運作。 |
| `couchbase` | [`CouchbaseHealthIndicator`][r63] | 檢查 Couchbase 叢集是否正常運作。 |
| `db` | [`DataSourceHealthIndicator`][r64] | 檢查能否取得 [`DataSource`][r65] 連線。 |
| `diskspace` | [`DiskSpaceHealthIndicator`][r66] | 檢查磁碟空間是否不足。 |
| `elasticsearch` | [`ElasticsearchRestClientHealthIndicator`][r67] | 檢查 Elasticsearch 叢集是否正常運作。 |
| `hazelcast` | [`HazelcastHealthIndicator`][r68] | 檢查 Hazelcast 伺服器是否正常運作。 |
| `jms` | [`JmsHealthIndicator`][r69] | 檢查 JMS broker 是否正常運作。 |
| `ldap` | [`LdapHealthIndicator`][r70] | 檢查 LDAP 伺服器是否正常運作。 |
| `mail` | [`MailHealthIndicator`][r71] | 檢查郵件伺服器是否正常運作。 |
| `mongodb` | [`MongoHealthIndicator`][r72] | 檢查 Mongo 資料庫是否正常運作。 |
| `neo4j` | [`Neo4jHealthIndicator`][r73] | 檢查 Neo4j 資料庫是否正常運作。 |
| `ping` | [`PingHealthIndicator`][r74] | 一律回應 `UP`。 |
| `rabbit` | [`RabbitHealthIndicator`][r75] | 檢查 Rabbit 伺服器是否正常運作。 |
| `redis` | [`DataRedisHealthIndicator`][r76] | 檢查 Redis 伺服器是否正常運作。 |
| `ssl` | [`SslHealthIndicator`][r77] | 檢查 SSL 憑證是否正常。 |

> [TIP]
>
> 可透過 `management.health.defaults.enabled` 屬性全部停用。

> [TIP]
>
> `ssl` [`HealthIndicator`][r58] 有名為 `management.health.ssl.certificate-validity-warning-threshold` 的「警告門檻」。
> 可利用此門檻，為即將到期的憑證輪替預留足夠時間。
> 若 SSL 憑證將在門檻指定期間內失效，[`HealthIndicator`][r58] 會在回應詳細資訊中回報，`details.validChains.certificates.[*].validity.status` 的值會是 `WILL_EXPIRE_SOON`。

以下額外的 [`HealthIndicator`][r58] Bean 預設啟用：

| Key | 名稱 | 說明 |
| --- | --- | --- |
| `livenessstate` | [`LivenessStateHealthIndicator`][r78] | 公開應用程式「存活性」（Liveness）可用狀態。 |
| `readinessstate` | [`ReadinessStateHealthIndicator`][r79] | 公開應用程式「就緒性」（Readiness）可用狀態。 |

可使用 `management.endpoint.health.probes.enabled` 停用。

### 撰寫自訂 HealthIndicator

若要提供自訂健康資訊，可註冊實作 [`HealthIndicator`][r58] 的 Spring Bean。
必須實作 `health()`，並回傳 [`Health`][r80] 回應。
回應應包含狀態，也可選擇包含額外顯示細節。
以下是實作範例：

{{CODE_27}}

{{CODE_28}}

> [NOTE]
>
> [`HealthIndicator`][r58] 的識別碼取自 Bean 名稱，若有 `HealthIndicator` 後綴則移除。
> 上例的健康資訊會出現在名為 `my` 的項目。

> [TIP]
>
> 健康指標通常經由 HTTP 呼叫，必須在連線逾時前回應。
> 任何健康指標若超過 10 秒才回應，Spring Boot 會記錄警告。
> 可透過 `management.endpoint.health.logging.slow-indicator-threshold` 設定門檻。

除了 Spring Boot 預先定義的 [`Status`][r60]，[`Health`][r80] 也可回傳代表新系統狀態的自訂 [`Status`][r60]。
此時也必須提供自訂 [`StatusAggregator`][r61] 實作，或透過 `management.endpoint.health.status.order` 設定預設實作。

例如某個 [`HealthIndicator`][r58] 使用代碼為 `FATAL` 的新 [`Status`][r60]。
若要設定嚴重程度順序，請加入以下應用程式屬性：

{{CODE_29}}

{{CODE_30}}

回應的 HTTP 狀態碼反映整體健康狀態。
預設 `OUT_OF_SERVICE` 與 `DOWN` 對應到 503。
未設定對應的健康狀態，包括 `UP`，都對應到 200。
若透過 HTTP 存取 health，也可能需要註冊自訂狀態對應。
設定自訂對應會停用 `DOWN` 與 `OUT_OF_SERVICE` 的預設對應。
若要保留，必須在自訂對應之外明確設定它們。
例如以下屬性將 `FATAL` 對應至 503（服務無法使用），同時保留 `DOWN` 與 `OUT_OF_SERVICE` 的預設對應：

{{CODE_31}}

{{CODE_32}}

> [TIP]
>
> 若需要更多控制，可定義自己的 [`HttpCodeStatusMapper`][r81] Bean。

內建狀態的預設對應如下：

| 狀態 | 對應 |
| --- | --- |
| `DOWN` | `SERVICE_UNAVAILABLE`（`503`） |
| `OUT_OF_SERVICE` | `SERVICE_UNAVAILABLE`（`503`） |
| `UP` | 預設無對應，因此 HTTP 狀態為 `200`。 |
| `UNKNOWN` | 預設無對應，因此 HTTP 狀態為 `200`。 |

### 反應式健康指標

對 Spring WebFlux 等反應式應用程式，[`ReactiveHealthContributor`][r82] 提供非阻塞的應用程式健康查詢契約。
類似傳統 [`HealthContributor`][r56]，健康資訊從 [`ReactiveHealthContributorRegistry`][r83] 收集，預設包含 [`ApplicationContext`][r57] 中所有 [`HealthContributor`][r56] 與 [`ReactiveHealthContributor`][r82] 實例。
不透過反應式 API 檢查的一般 [`HealthContributor`][r56]，會在 elastic scheduler 上執行。

> [TIP]
>
> 反應式應用程式應使用 [`ReactiveHealthContributorRegistry`][r83]，在執行期間註冊及取消註冊健康指標。
> 若需註冊一般 [`HealthContributor`][r56]，應以 `ReactiveHealthContributor#adapt` 包裝。

若要從反應式 API 提供自訂健康資訊，可註冊實作 [`ReactiveHealthIndicator`][r84] 的 Spring Bean。
範例如下：

{{CODE_33}}

{{CODE_34}}

> [TIP]
>
> 若要自動處理錯誤，可考慮繼承 [`AbstractReactiveHealthIndicator`][r85]。

### 自動設定的 ReactiveHealthIndicator

適用時，Spring Boot 自動設定以下 [`ReactiveHealthIndicator`][r84] Bean：

| Key | 名稱 | 說明 |
| --- | --- | --- |
| `cassandra` | [`CassandraDriverReactiveHealthIndicator`][r86] | 檢查 Cassandra 資料庫是否正常運作。 |
| `couchbase` | [`CouchbaseReactiveHealthIndicator`][r87] | 檢查 Couchbase 叢集是否正常運作。 |
| `elasticsearch` | [`DataElasticsearchReactiveHealthIndicator`][r88] | 檢查 Elasticsearch 叢集是否正常運作。 |
| `mongodb` | [`MongoReactiveHealthIndicator`][r89] | 檢查 Mongo 資料庫是否正常運作。 |
| `neo4j` | [`Neo4jReactiveHealthIndicator`][r90] | 檢查 Neo4j 資料庫是否正常運作。 |
| `redis` | [`DataRedisReactiveHealthIndicator`][r91] | 檢查 Redis 伺服器是否正常運作。 |

> [TIP]
>
> 必要時反應式指標會取代一般指標。
> 未明確處理的 [`HealthIndicator`][r58] 也會自動包裝。

### 健康群組

有時將健康指標整理為不同群組，以供不同用途使用，會很實用。

可透過 `management.endpoint.health.group.<name>` 建立群組，指定要 `include` 或 `exclude` 的健康指標 ID 清單。
例如建立只含資料庫指標的群組：

{{CODE_35}}

{{CODE_36}}

接著存取 [localhost:8080/actuator/health/custom][r92] 即可檢查結果。

同樣地，若要排除資料庫指標並納入所有其他指標，可這樣定義：

{{CODE_37}}

{{CODE_38}}

預設若健康群組納入或排除不存在的指標，啟動會失敗。
將 `management.endpoint.health.validate-group-membership` 設為 `false` 可停用此行為。

群組預設繼承整體系統健康的 [`StatusAggregator`][r61] 與 [`HttpCodeStatusMapper`][r81] 設定。
不過也能逐群組定義。
需要時也能覆寫 `show-details` 與 `roles`：

{{CODE_39}}

{{CODE_40}}

> [TIP]
>
> 若需為群組註冊自訂 [`StatusAggregator`][r61] 或 [`HttpCodeStatusMapper`][r81] Bean，可使用 `@Qualifier("groupname")`。

健康群組也可納入或排除 [`CompositeHealthContributor`][r59]。
也能只納入或排除其中特定元件。
可使用元件的完整限定名稱：

{{CODE_41}}

上例的 `custom` 群組會納入名為 `primary` 的 [`HealthContributor`][r56]，它是組合 `test` 的元件。
這裡 `primary` 本身也是組合，而其中名為 `b` 的 [`HealthContributor`][r56] 會從 `custom` 群組排除。

健康群組可以在主連接埠或管理連接埠提供額外路徑。
這對 Kubernetes 等雲端環境很實用，因為基於安全性，常會讓 actuator 使用獨立管理連接埠。
獨立連接埠可能使健康檢查不可靠：健康檢查成功時，主應用程式仍可能不正常。
可如下設定額外路徑：

{{CODE_42}}

這會讓 `live` 群組在主伺服器連接埠的 `/healthz` 可用。
前綴必填，必須是 `server:`（主伺服器連接埠）或 `management:`（已設定的管理連接埠）。
路徑必須只有單一路徑區段。

### DataSource 健康

[`DataSource`][r65] 健康指標同時顯示標準資料來源與路由資料來源 Bean 的健康狀態。
路由資料來源的健康資訊包含每個目標資料來源。
在 health 回應中，各個目標以其路由 key 命名。
若不想將路由資料來源納入輸出，請將 `management.health.db.ignore-routing-data-sources` 設為 `true`。

## Kubernetes 探針

部署到 Kubernetes 的應用程式，可以透過[容器探針][r93]提供內部狀態資訊。
kubelet 依 [Kubernetes 設定][r94]呼叫探針，並根據結果採取行動。

Spring Boot 預設管理[應用程式可用狀態][r95]。
若部署在 Kubernetes 環境，actuator 會從 [`ApplicationAvailability`][r96] 取得「存活性」與「就緒性」資訊，並用於專用[健康指標][r97]：[`LivenessStateHealthIndicator`][r78] 與 [`ReadinessStateHealthIndicator`][r79]。
這些指標會顯示在整體 health 端點（`"/actuator/health"`）。
也會透過[健康群組][r98]公開為獨立 HTTP 探針：`"/actuator/health/liveness"` 與 `"/actuator/health/readiness"`。

接著可使用以下端點資訊設定 Kubernetes 基礎設施：

{{CODE_43}}

> [NOTE]
>
> `<actuator-port>` 應設為 actuator 端點可用的連接埠。
> 可以是主 Web 伺服器連接埠，也可以是設定 `"management.server.port"` 後的獨立管理連接埠。

這些健康群組會自動啟用。
可使用 `management.endpoint.health.probes.enabled` 停用。

> [NOTE]
>
> 如果應用程式啟動時間長於設定的存活探針期間，Kubernetes [提及 `"startupProbe"` 可作為解法][r99]。
> 一般而言，此處不一定需要 `"startupProbe"`，因為所有啟動工作完成前，`"readinessProbe"` 都會失敗，代表應用程式準備好前不會收到流量。
> 不過若啟動很久，請考慮[設定使用存活 HTTP 探針的 `"startupProbe"`][r100]，確保 Kubernetes 不會在啟動過程中終止應用程式。
> 請參閱[探針在應用程式生命週期中的行為][r101]。

若 Actuator 端點部署於獨立管理上下文，就不會與主應用程式共用 Web 基礎設施，包括連接埠、連線集區與框架元件。
此時即使主應用程式不正常，例如無法接受新連線，探針仍可能成功。
因此，最好也讓 `liveness` 與 `readiness` 健康群組在主伺服器連接埠可用。
可設定以下屬性：

{{CODE_44}}

這會在主伺服器連接埠，以 `/livez` 提供 `liveness`，以 `/readyz` 提供 `readiness`。
可透過各群組的 `additional-path` 自訂路徑，詳見[健康群組][r98]。

### 透過 Kubernetes 探針檢查外部狀態

Actuator 將存活與就緒探針設定為健康群組。
因此所有[健康群組功能][r98]都可使用。
例如可以設定額外健康指標：

{{CODE_45}}

{{CODE_46}}

Spring Boot 預設不會將其他健康指標加入這些群組。

存活探針不應依賴外部系統的健康檢查。
若[應用程式存活狀態][r102]損壞，Kubernetes 會嘗試重新啟動應用程式實例來解決。
這表示外部系統，例如資料庫、Web API 或外部快取故障時，Kubernetes 可能重新啟動所有實例，造成連鎖故障。

至於就緒探針，是否檢查外部系統必須由應用程式開發者審慎決定。
因此 Spring Boot 不會在就緒探針納入額外健康檢查。
若[應用程式實例就緒狀態][r103]尚未就緒，Kubernetes 就不會將流量路由到該實例。
某些外部系統可能不是由所有應用程式實例共用，此時可以納入就緒探針。
其他外部系統可能不是必要功能，應用程式可能已有斷路器與備援方案，這時就不應納入。
但所有實例共用同一外部系統的情況很常見，需要自行判斷：納入就緒探針，接受外部服務故障時整個應用程式退出服務；或不納入，改由更上層處理失敗，例如在呼叫端使用斷路器。

> [NOTE]
>
> 若應用程式所有實例都未就緒，`type=ClusterIP` 或 `NodePort` 的 Kubernetes Service 不會接受任何傳入連線。
> 因為沒有建立連線，也就不會有 HTTP 503 等錯誤回應。
> `type=LoadBalancer` 的服務是否接受連線，取決於供應商。
> 明確設定 [ingress][r104] 的服務，其回應也取決於實作；ingress 自己必須決定如何處理下游的「connection refused」。
> 負載平衡器與 ingress 情況下，都很可能回傳 HTTP 503。

此外，若應用程式使用 Kubernetes [自動擴縮][r105]，應用程式從負載平衡器移除時，反應會依 autoscaler 設定而不同。

### 應用程式生命週期與探針狀態

Kubernetes 探針支援的重要特性，是與應用程式生命週期一致。
[`AvailabilityState`][r106] 是應用程式記憶體中的內部狀態，與公開此狀態的實際探針有明顯差異。
依生命週期階段不同，探針可能不可用。

Spring Boot 在[啟動及關閉期間發布應用程式事件][r107]。
探針可以監聽這些事件，公開 [`AvailabilityState`][r106] 資訊。

以下表格顯示各階段的 [`AvailabilityState`][r106] 與 HTTP connector 狀態。

Spring Boot 應用程式啟動時：

| 啟動階段 | LivenessState | ReadinessState | HTTP 伺服器 | 說明 |
| --- | --- | --- | --- | --- |
| 啟動中 | `BROKEN` | `REFUSING_TRAFFIC` | 尚未啟動 | Kubernetes 檢查存活探針，若耗時過久會重新啟動應用程式。 |
| 已啟動 | `CORRECT` | `REFUSING_TRAFFIC` | 拒絕請求 | 應用程式上下文已刷新。應用程式執行啟動工作，尚未接收流量。 |
| 已就緒 | `CORRECT` | `ACCEPTING_TRAFFIC` | 接受請求 | 啟動工作完成，應用程式正在接收流量。 |

Spring Boot 應用程式關閉時：

| 關閉階段 | 存活狀態 | 就緒狀態 | HTTP 伺服器 | 說明 |
| --- | --- | --- | --- | --- |
| 執行中 | `CORRECT` | `ACCEPTING_TRAFFIC` | 接受請求 | 已提出關閉要求。 |
| 優雅關閉 | `CORRECT` | `REFUSING_TRAFFIC` | 拒絕新請求 | 若啟用，[優雅關閉會處理進行中的請求][r108]。HTTP 探針也停止接受流量，因此外部不容易再取得可用狀態。 |
| 關閉完成 | 不適用 | 不適用 | 伺服器已關閉 | 應用程式上下文已關閉，應用程式結束。 |

> [TIP]
>
> Kubernetes 部署的更多資訊請參閱 [Kubernetes 容器生命週期][r109]。
> 特別是其中說明如何使用 `preStop` hook，讓 Kubernetes 終止應用程式前，有時間優雅關閉。

## 應用程式資訊

應用程式資訊公開從 [`ApplicationContext`][r57] 中所有 [`InfoContributor`][r110] Bean 收集的各種資訊。
Spring Boot 包含多個自動設定的 [`InfoContributor`][r110]，也可自行撰寫。

### 自動設定的 InfoContributor

適用時，Spring 自動設定以下 [`InfoContributor`][r110] Bean：

| ID | 名稱 | 說明 | 前提條件 |
| --- | --- | --- | --- |
| `build` | [`BuildInfoContributor`][r111] | 公開建置資訊。 | `META-INF/build-info.properties` 資源。 |
| `env` | [`EnvironmentInfoContributor`][r112] | 公開 [`Environment`][r113] 中名稱以 `info.` 開頭的所有屬性。 | 無。 |
| `git` | [`GitInfoContributor`][r114] | 公開 Git 資訊。 | `git.properties` 資源。 |
| `java` | [`JavaInfoContributor`][r115] | 公開 Java 執行期資訊。 | 無。 |
| `os` | [`OsInfoContributor`][r116] | 公開作業系統資訊。 | 無。 |
| `process` | [`ProcessInfoContributor`][r117] | 公開程序資訊。 | 無。 |
| `ssl` | [`SslInfoContributor`][r118] | 公開 SSL 憑證資訊。 | 已設定 [SSL Bundle][r119]。 |

個別 contributor 是否啟用，由其 `management.info.<id>.enabled` 控制。
依前提條件與公開資訊性質不同，各 contributor 的預設值也不同。

`env`、`java`、`os` 與 `process` 沒有可暗示應啟用的前提條件，因此預設停用。
`ssl` 雖要求已設定 [SSL Bundle][r119]，但也預設停用。
將各自的 `management.info.<id>.enabled` 設為 `true` 即可啟用。

`build` 與 `git` 資訊 contributor 預設啟用。
可將各自的 `management.info.<id>.enabled` 設為 `false` 停用。
也可將 `management.info.defaults.enabled` 設為 `false`，停用所有通常預設啟用的 contributor。

### 自訂應用程式資訊

啟用 `env` contributor 後，可以設定 `info.*` Spring 屬性，自訂 `info` 端點公開資料。
`info` key 下所有 [`Environment`][r113] 屬性都會自動公開。
例如在 `application.properties` 加入：

{{CODE_47}}

{{CODE_48}}

> [TIP]
>
> 不必將這些值寫死，也可以[在建置時展開 info 屬性][r120]。
> 假設使用 Maven，可將上例改寫為：

{{CODE_49}}

{{CODE_50}}

### Git Commit 資訊

`info` 另一個實用功能，是發布專案建置時 `git` 原始碼儲存庫的狀態。
若有 [`GitProperties`][r122] Bean，就能透過 `info` 公開這些屬性。

> [TIP]
>
> 若 classpath 根目錄有 `git.properties`，會自動設定 [`GitProperties`][r122] Bean。
> 詳見[產生 Git 資訊][r123]。

預設若存在 `git.branch`、`git.commit.id` 與 `git.commit.time`，端點會公開它們。
若不希望回應包含其中某項，必須將它從 `git.properties` 排除。
若要顯示完整 Git 資訊，也就是 `git.properties` 全部內容，請使用 `management.info.git.mode`：

{{CODE_51}}

{{CODE_52}}

若要完全停用 `info` 的 Git commit 資訊，請將 `management.info.git.enabled` 設為 `false`：

{{CODE_53}}

{{CODE_54}}

### 建置資訊

若有 [`BuildProperties`][r124] Bean，`info` 也能發布建置資訊。
當 classpath 存在 `META-INF/build-info.properties` 時，就會有這項支援。

> [TIP]
>
> Maven 與 Gradle plugin 都能產生此檔案。
> 詳見[產生建置資訊][r125]。

### Java 資訊

`info` 公開 Java 執行環境資訊，詳見 [`JavaInfo`][r126]。

### 作業系統資訊

`info` 公開作業系統資訊，詳見 [`OsInfo`][r127]。

### 程序資訊

`info` 公開程序資訊，詳見 [`ProcessInfo`][r128]。

### SSL 資訊

`info` 公開透過 [SSL Bundle][r119] 設定的 SSL 憑證資訊，詳見 [`SslInfo`][r129]。

### 撰寫自訂 InfoContributor

若要提供自訂應用程式資訊，可註冊實作 [`InfoContributor`][r110] 的 Spring Bean。

下例加入含有單一值的 `example` 項目：

{{CODE_55}}

{{CODE_56}}

存取 `info` 時，應會看見回應多出以下項目：

{{CODE_57}}

## 軟體物料清單（SBOM）

`sbom` 端點公開[軟體物料清單][r130]。
CycloneDX SBOM 可自動偵測，也能手動設定其他格式。

`sbom` actuator 端點會公開名為 "application" 的 SBOM，描述應用程式內容。

> [TIP]
>
> 若要在專案建置時自動產生 CycloneDX SBOM，請參閱[產生 CycloneDX SBOM][r131]。

### 其他 SBOM 格式

若要發布不同格式的 SBOM，可以使用以下設定屬性。

`management.endpoint.sbom.application.location` 設定應用程式 SBOM 位置。
例如設為 `classpath:sbom.json`，就會使用 classpath 的 `/sbom.json` 資源內容。

CycloneDX、SPDX 與 Syft 格式的 media type 會自動偵測。
若要覆寫，請使用 `management.endpoint.sbom.application.media-type`。

### 額外 SBOM

actuator 端點能處理多個 SBOM。
若要新增，請使用 `management.endpoint.sbom.additional`，如下例：

{{CODE_58}}

{{CODE_59}}

這會新增名為 "system"、儲存在 `/system.spdx.json` 的 SBOM。
可使用 `optional:` 前綴，避免檔案不存在時啟動失敗。

## 譯者圖解：端點能否被遠端呼叫的三個條件

```mermaid
flowchart LR
    A[端點] --> B{有效 access 是否為 none}
    B -->|是| X[端點從上下文移除]
    B -->|否| O[依 unrestricted 或 read-only 保留允許的操作]
    O --> C{該技術 exposure 納入嗎}
    C -->|否| Y[未透過 HTTP 或 JMX 公開]
    C -->|是| D{安全性規則允許請求嗎}
    D -->|否| Z[拒絕請求]
    D -->|是| E[呼叫操作]
```

## 譯者圖解：Liveness 與 Readiness 的用途不同

```mermaid
flowchart TD
    L[Liveness：實例自身是否仍能正常運作] -->|失敗| R[Kubernetes 可能重新啟動實例]
    Q[Readiness：現在是否適合接收流量] -->|失敗| T[Kubernetes 停止將流量導向此實例]
    D[共用資料庫故障] -. 不宜直接作為存活性依據 .-> L
    D -. 是否納入須依故障處理策略判斷 .-> Q
```

> 譯者註：`access=unrestricted` 是端點可用操作的設定，不代表網路已公開，也不代表略過 Spring Security；請同時對照 exposure 與安全性規則。
