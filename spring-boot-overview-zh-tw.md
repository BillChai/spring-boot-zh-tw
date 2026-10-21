# Spring 與 Spring Boot：從手作痛點理解框架設計

> 繁體中文概要導讀 · Kotlin 範例版  
> 編寫與來源查核日期：2026-10-20  
> 核心問題：框架接手了什麼工作？你還需要負責什麼？需求改變時如何擴充？

## 關於這本書

本書依 Spring 官方英文文件整理，以繁體中文重新解說概念，搭配自行設計的預約系統案例。這是非官方的主題式導讀，不是 Reference 的逐段全譯，也不涵蓋全部 Spring 專案。每章附上對應的官方英文連結與閱讀重點，方便核對。

你只需要大致理解 Kotlin 的 class、interface、建構子和函式，就可以開始閱讀。不必先記住所有 annotation。第一次閱讀時，先掌握每章的問題與分工；需要實作時，再回到官方文件查完整設定。

### 版本與程式碼範圍

本次查閱的動態文件頁面顯示 Spring Boot 4.1.1、Spring Framework 7.0.9；這是各自文件頁面的版本標示，不是本書替專案選定或驗證的相依版本組合。連結未固定版本，官方可能更新內容。實際開發請使用所選 Spring Boot 版本管理的依賴組合，並切換到相符版本的文件。

範例是獨立的概念片段，省略 package、部分 import、基礎建設與資料模型；不能將所有章節直接串接成完整應用程式。本書未建立或執行 Kotlin 專案，也未對片段進行編譯測試。使用 Spring 註解標記的片段，假設已加入對應依賴、完成 Bean 註冊，並在需要時啟用相關功能。

### 如何閱讀

- 第一輪：第 1～4 章，理解框架如何組裝應用程式。
- 第二輪：第 5～8 章，沿著 HTTP → 業務邏輯 → 資料庫理解常見功能。
- 第三輪：第 9～12 章，理解安全性、執行效率、測試與營運。
- 每章只問自己：這項能力減少哪種重複工作？哪些決策依然屬於我？

## 目錄

1. [Spring 與 Spring Boot 各自負責什麼](#chapter-01)
2. [IoC 與 DI：讓物件的合作方式可以替換](#chapter-02)
3. [Starter 與自動設定：讓整合成本降低](#chapter-03)
4. [外部化設定：同一份程式如何適應不同環境](#chapter-04)
5. [Web MVC：把 HTTP 轉成業務函式呼叫](#chapter-05)
6. [資料存取：接手重複工作，保留查詢責任](#chapter-06)
7. [AOP 與 Proxy：把共通行為放在方法周圍](#chapter-07)
8. [交易管理：讓一組資料操作一起成功或失敗](#chapter-08)
9. [Spring Security：集中處理身分與權限](#chapter-09)
10. [快取與背景工作：把執行策略抽離業務流程](#chapter-10)
11. [測試支援：依問題選擇驗證範圍](#chapter-11)
12. [Actuator 與功能地圖：讓應用程式可以營運](#chapter-12)

- [附錄 A：英文與繁體中文術語表](#appendix-a)
- [附錄 B：理解題參考答案](#appendix-b)
- [附錄 C：後續閱讀路線與來源說明](#appendix-c)

---

<a id="chapter-01"></a>

## 第 1 章　Spring 與 Spring Boot 各自負責什麼

### 手作時的痛點

假設你要做預約 API。除了「還有名額才能預約」，還需要啟動 HTTP 伺服器、解析 JSON、建立資料庫連線、組裝服務、處理錯誤、讀取設定，以及提供監控資訊。

這些基礎工作會出現在許多應用程式中。若每個團隊自行設計一套，維護方式與測試方式也容易各不相同。

### 框架提供的解法

Spring Framework 提供一組可合作的基礎能力：管理物件、注入依賴、處理 Web 請求、管理交易等。你把業務程式放進這個執行結構中，框架在適當時機呼叫它。

Spring Boot 則進一步降低組裝成本：搭配依賴管理、常用依賴集合與自動設定，讓你不必每次都從零把元件串起來。它也支援內嵌伺服器與正式環境需要的管理功能。

| 層次 | 在預約系統中的角色 |
| --- | --- |
| 業務程式 | 決定誰可以預約、何時扣除名額 |
| Spring Framework | 管理服務物件、派送請求、提供交易等機制 |
| Spring Boot | 根據依賴與設定，協助準備框架及相關基礎元件 |
| 其他 Spring 專案 | 例如 Spring Data 提供資料存取抽象，Spring Security 提供安全機制 |

### 可擴充設計與你的責任

框架提供共同的組合方式，讓某些實作可以替換。但「可替換」有邊界：換資料庫仍可能需要調整 SQL、資料型別與交易行為。抽象可以降低耦合，不能保證底層差異全部消失。

本書的閱讀方式是：先理解業務與基礎設施的責任分配，再學習 Boot 如何協助整合。

**理解題：**「取消預約必須在開始前 24 小時完成」應該由 Spring Boot 自動設定，還是由你的業務程式決定？

### 官方英文對照

- [Spring Framework Overview](https://docs.spring.io/spring-framework/reference/overview.html)：讀 **What We Mean by "Spring"** 與 **Design Philosophy**。
- [Spring Boot](https://spring.io/projects/spring-boot)：讀 **Features**，確認 Boot 提供的便利性。

---

<a id="chapter-02"></a>

## 第 2 章　IoC 與 DI：讓物件的合作方式可以替換

### 手作時的痛點

預約成功後需要寄信。如果 `BookingService` 自己建立 `EmailNotifier`，它就同時負責預約流程與通知實作的選擇。測試想換成假的通知器時，會比較麻煩。

先看不依賴 Spring 的改善方式：

```kotlin
interface Notifier {
    fun send(message: String)
}

class BookingService(private val notifier: Notifier) {
    fun confirm() {
        notifier.send("預約成功")
    }
}
```

`BookingService` 只要求有人提供 `Notifier`，沒有自己決定如何寄送。外部可以寫 `BookingService(emailNotifier)`，也可以傳入測試用實作。這就是建構子注入；它本身不需要框架。

### 框架提供的解法

當系統有很多服務時，手動組裝物件仍然需要維護。Spring 的 IoC 容器接手物件的建立與組裝；由它管理的物件稱為 Bean。常見的容器介面是 `ApplicationContext`。

你可以透過 `@Service`、`@Component` 等註解標記，讓掃描機制找到元件；也可以透過 `@Bean` 明確定義建立方式。Spring 再依照依賴關係組裝它們。不是所有一般物件都會自動成為 Bean。

### 可擴充設計與你的責任

上述 interface 是替換位置。當容器中有多個 `Notifier` 候選者時，可以使用 `@Primary` 指定優先候選，或以 `@Qualifier` 縮小選擇範圍；需要全部實作時，也可以注入集合。

你仍要設計合理的合作介面。把整個系統都塞進一個巨大 service，再交給 Spring 建立，不會自動變成容易維護的設計。

常見的 singleton Bean 也不表示它自動具備執行緒安全。不要把每位使用者的暫存狀態隨意存在共用 service 欄位中。

**理解題：**不使用 Spring，能不能把 `EmailNotifier` 換成測試用的 `Notifier`？

### 官方英文對照

- [Introduction to the Spring IoC Container and Beans](https://docs.spring.io/spring-framework/reference/core/beans/introduction.html)：確認 Bean 與容器的定義。
- [Dependency Injection](https://docs.spring.io/spring-framework/reference/core/beans/dependencies/factory-collaborators.html)：讀 **Constructor-based Dependency Injection**。
- [Fine-tuning Annotation-based Autowiring with Qualifiers](https://docs.spring.io/spring-framework/reference/core/beans/annotation-config/autowired-qualifiers.html)：了解多個候選者的選擇方式。
- [Bean Scopes](https://docs.spring.io/spring-framework/reference/core/beans/factory-scopes.html)：確認 singleton 的共用範圍。

---

<a id="chapter-03"></a>

## 第 3 章　Starter 與自動設定：讓整合成本降低

### 手作時的痛點

想提供 JSON API，可能需要 Web 框架、JSON 函式庫、伺服器與相容的版本。依賴下載完成後，仍需要建立與連接相關物件。

### 框架提供的解法

這裡有三件不同的事：

| 機制 | 解決的問題 |
| --- | --- |
| 依賴管理 | 提供一組協調過的依賴版本，減少逐一選版的工作 |
| Starter | 把某類功能常用的依賴整理成方便加入的集合 |
| Auto-configuration／自動設定 | 根據類別路徑、設定值、既有 Bean 等條件，準備適合的組態 |

因此，「加入 Starter」與「所有功能一定啟用」不能畫上等號。自動設定必須符合條件；有些功能還需要額外設定或明確啟用。

例如應用程式需要資料來源時，Boot 可以在條件成立時協助建立 `DataSource`；當你提供自己的 `DataSource` Bean，相關預設建立邏輯可以退讓。這種退讓行為取決於個別自動設定的條件，不能泛化成「自己宣告任何 Bean 都會覆蓋一切」。

### 可擴充設計與你的責任

實作時可依序考慮：

1. 有沒有官方提供的設定屬性？
2. 有沒有 customizer 或其他擴充介面？
3. 是否需要自己提供 Bean？
4. 是否真的需要排除特定自動設定？

這是本書建議的調整順序，目的在於盡量保留 Boot 已處理好的整合。

如果不知道某項設定為什麼生效，可利用 `--debug` 查看條件判斷報告。你需要理解「哪些條件成立」，而不只猜測是哪個 annotation 產生效果。

**理解題：**Starter 解決依賴集合，自動設定解決元件組裝；兩者是不是同一件事？

### 官方英文對照

- [Build Systems](https://docs.spring.io/spring-boot/reference/using/build-systems.html)：讀 **Dependency Management** 與 **Starters**。
- [Auto-configuration](https://docs.spring.io/spring-boot/reference/using/auto-configuration.html)：讀自動設定與逐步替換預設設定的說明。
- [Creating Your Own Auto-configuration](https://docs.spring.io/spring-boot/reference/features/developing-auto-configuration.html)：需要共用團隊整合邏輯時，再讀條件式設定。

---

<a id="chapter-04"></a>

## 第 4 章　外部化設定：同一份程式如何適應不同環境

### 手作時的痛點

開發環境使用測試通知服務，正式環境使用真實服務。如果 URL、timeout 等值寫死在業務程式中，切換環境就需要改程式。

如果每個 class 自己讀環境變數、轉換型別與填入預設值，這些處理又會重複出現。

### 框架提供的解法

Spring Boot 可以從 properties、YAML、環境變數、命令列參數等來源取得設定，再按照規則決定有效值。`@ConfigurationProperties` 可以把同一組設定繫結成有型別的物件。

```kotlin
@ConfigurationProperties("booking")
data class BookingProperties(
    val notificationEnabled: Boolean = true,
    val notificationTimeout: Duration = Duration.ofSeconds(3)
)
```

```yaml
booking:
  notification-enabled: true
  notification-timeout: 3s
```

這個片段需要 `java.time.Duration`，並透過 `@ConfigurationPropertiesScan` 或 `@EnableConfigurationProperties` 註冊設定類別。只加上類別標記，不代表在任何情境下都已完成註冊。

### 可擴充設計與你的責任

Profiles 可用來區分環境或條件下的設定與元件。對多個環境共用的程式，設定物件能把「讀取外部值」與「使用值執行業務」分開。

你仍要決定預設值是否合理、必要值缺少時是否拒絕啟動，以及敏感值從哪裡取得。把密碼移到 YAML，不等於完成秘密管理。

診斷設定問題時，先確認來源與覆蓋順序，再確認繫結結果。不要只看到某個檔案中的值，就認定應用程式一定使用它。

**理解題：**正式環境的 timeout 和 YAML 寫的不一樣，第一個應查的是業務演算法，還是設定來源與優先順序？

### 官方英文對照

- [Externalized Configuration](https://docs.spring.io/spring-boot/reference/features/external-config.html)：讀設定來源順序、**Type-safe Configuration Properties** 與 **Constructor Binding**。
- [Kotlin Support](https://docs.spring.io/spring-boot/reference/features/kotlin.html)：讀 **@ConfigurationProperties**，對照 Kotlin `data class` 用法。
- [Profiles](https://docs.spring.io/spring-boot/reference/features/profiles.html)：了解環境設定的啟用方式。

---

<a id="chapter-05"></a>

## 第 5 章　Web MVC：把 HTTP 轉成業務函式呼叫

### 手作時的痛點

HTTP 請求進來後，需要判斷路徑與方法、解析資料、呼叫業務程式，再決定回應狀態與格式。如果每個端點都手動處理，規則容易分散。

### 框架提供的解法

Spring MVC 提供共同的請求處理流程。你宣告端點、參數與回傳值，框架負責將它們接到 HTTP。

```kotlin
@RestController
@RequestMapping("/bookings")
class BookingController(private val service: BookingQueryService) {
    @GetMapping("/{id}")
    fun find(@PathVariable("id") id: Long): BookingView =
        service.find(id)
}
```

`BookingQueryService` 與 `BookingView` 是應用程式自行定義的型別。這段展示的是：URL 中的 `id` 轉成 `Long`，再傳給一般的 Kotlin 方法。適當的訊息轉換器可以將回傳物件轉成 JSON。

在輸入檢查方面，可結合 Bean Validation：

```kotlin
data class CreateBookingRequest(
    @field:NotBlank val customerName: String
)
```

需加入 Validation 支援，並在對應的 Controller 請求參數使用 `@Valid @RequestBody` 才能示範這種驗證流程。`@field:` 明確指出標記放在 Kotlin 屬性的底層欄位。

### 可擴充設計與你的責任

共同的錯誤回應可以由 `@RestControllerAdvice` 與 `@ExceptionHandler` 集中處理；特殊輸入型別可以使用 converter 或 argument resolver 擴充。

格式驗證與業務驗證也要分開。「姓名不能空白」適合放在輸入條件；「這個時段是否還有名額」需要業務與資料狀態判斷。不能因為輸入通過 `@Valid`，就認定預約一定合法。

你仍要定義 API 契約、HTTP 狀態、錯誤內容與權限規則。框架簡化傳輸處理，但不替你決定產品行為。

**理解題：**把所有例外一律轉成 HTTP 200，會不會讓呼叫方失去判斷失敗的依據？

### 官方英文對照

- [Spring Web MVC](https://docs.spring.io/spring-framework/reference/web/webmvc.html)：了解 Servlet Web 框架的定位。
- [Annotated Controllers](https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-controller.html)：對照端點與方法參數。
- [Validation](https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-controller/ann-validation.html)：核對驗證生效的條件。
- [Exceptions](https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-controller/ann-exceptionhandler.html)：閱讀集中處理例外的方式。

---

<a id="chapter-06"></a>

## 第 6 章　資料存取：接手重複工作，保留查詢責任

### 手作時的痛點

使用 JDBC 查詢資料時，除了 SQL，還要處理連線、statement、結果讀取、資源關閉與例外。對每個查詢重寫一次，容易遺漏處理步驟。

### 框架提供的解法

`JdbcTemplate` 將共通流程集中起來。你提供 SQL、參數與結果轉換方式，Spring 處理許多重複的 JDBC 工作。

```kotlin
fun findCustomerName(id: Long): String? =
    jdbcTemplate.queryForObject(
        "select customer_name from booking where id = ?",
        String::class.java,
        id
    )
```

`jdbcTemplate` 在此假設已由建構子取得，資料表也已存在。參數透過 placeholder 傳入，而不是拼接進 SQL。

注意這個 API 預期查到一筆：沒有資料或多筆資料會以例外表示。回傳型別為 `String?` 並不代表「找不到資料一定回傳 null」；nullable 型別不能取代對 API 契約的理解。

Spring Data 則提供 Repository 抽象，協助減少常見資料存取操作的重複程式。Spring Data JPA 還需要搭配 JPA 與實際的 persistence provider；它和 JDBC 的抽象層次不同。

### 可擴充設計與你的責任

你可以選擇自己掌握 SQL，或採用 Repository 抽象，再針對複雜需求補上自訂查詢與實作。這是依需求選擇，不是學完 JPA 就應把 JDBC 全部換掉。

索引、查詢筆數、N+1、鎖定與資料一致性仍需要觀察實際行為。少寫程式碼並不直接保證更快。

**理解題：**把 100 次資料庫查詢隱藏在一個 Repository 方法後面，是否代表只剩一次資料庫往返？

### 官方英文對照

- [Using the JDBC Core Classes](https://docs.spring.io/spring-framework/reference/data-access/jdbc/core.html)：讀 `JdbcTemplate` 的分工與查詢範例。
- [JdbcOperations API](https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/jdbc/core/JdbcOperations.html)：查 `queryForObject` 的結果筆數與例外契約。
- [Spring Data JPA — Core concepts](https://docs.spring.io/spring-data/jpa/reference/repositories/core-concepts.html)：了解 Repository 抽象。

---

<a id="chapter-07"></a>

## 第 7 章　AOP 與 Proxy：把共通行為放在方法周圍

### 手作時的痛點

多個方法都需要計時、交易或其他共通處理時，直接把前置與後置邏輯貼進每個方法，容易出現遺漏或不一致。

### 框架提供的解法

Spring AOP 常透過代理物件（Proxy）在方法呼叫周圍加入行為。先把它想成一條有前後處理的呼叫路徑：

```text
呼叫端
  → 代理物件：執行前置處理
    → 真正的業務物件：執行方法
  ← 代理物件：處理回傳或例外
```

呼叫端取得的參考可能指向代理物件，代理物件再委派給真正的業務物件。共通機制因此能集中實作。

### 可擴充設計與你的責任

你可以定義切面與要套用的範圍，但先理解內建交易、快取等功能通常更有幫助。不必為了使用 AOP 而把所有業務分支都搬進切面。

最重要的限制是：在常見的 proxy 模式中，同一個物件內部以 `this.otherMethod()` 呼叫另一個方法，會繞過代理物件。方法上雖然有標記，對應的代理行為仍可能沒有執行。

Kotlin 的 class 與方法預設是 `final`。當 Spring 需要以子類別建立代理時，這會影響代理能力。一般 Spring Kotlin 專案使用 `kotlin-spring` plugin，協助開放相關 Spring 類別；要確認專案真的有設定它。`private` 等方法也不能因為加了標記就假定一定可被攔截。

**理解題：**「方法上有 annotation」與「這次呼叫確實經過代理物件」是同一件事嗎？

### 官方英文對照

- [Proxying Mechanisms](https://docs.spring.io/spring-framework/reference/core/aop/proxying.html)：讀 **Understanding AOP Proxies** 與 self invocation 的限制。
- [Spring Projects in Kotlin](https://docs.spring.io/spring-framework/reference/languages/kotlin/spring-projects-in.html)：了解 Kotlin 的 final 與 Spring plugin。

---

<a id="chapter-08"></a>

## 第 8 章　交易管理：讓一組資料操作一起成功或失敗

### 手作時的痛點

建立預約有兩個資料操作：扣除名額、寫入預約紀錄。若前者成功、後者失敗，資料可能變得不一致。手動管理交易時，需要正確處理開始、提交、回滾與資源。

### 框架提供的解法

Spring 提供交易抽象與宣告式交易，讓你以方法為邊界表達需求：

```kotlin
@Service
class BookingService(
    private val slots: SlotRepository,
    private val bookings: BookingRepository
) {
    @Transactional
    fun book(slotId: Long) {
        slots.reserveOne(slotId)
        bookings.insert(slotId)
    }
}
```

這裡的 Repository 是教學用自訂介面。只有當它們使用同一個適當的交易管理器與參與交易的資料資源，且呼叫確實經過交易攔截流程，這個邊界才有預期意義。

### 可擴充設計與你的責任

你可以設定傳播方式、隔離層級與回滾條件。一般預設回滾規則以 `RuntimeException` 與 `Error` 為主；不要假設所有 checked exception 都會自動回滾。Kotlin 不要求在語法上宣告 checked exception，仍不代表 Spring 的規則因此消失。專案也可能調整全域或個別方法規則。

交易不能自動阻止超賣。兩筆請求同時看到剩一個名額時，仍需要原子更新、鎖定或資料庫限制等設計。

已寄出的 Email 也不會隨資料庫回滾而收回。「資料庫成功後才觸發通知」與「通知可靠送達」是不同問題，後者可能需要持久化事件與重試流程。

**理解題：**在 `@Transactional` 方法裡寄信，是否代表寄信和資料庫寫入一定能一起回滾？

### 官方英文對照

- [Using @Transactional](https://docs.spring.io/spring-framework/reference/data-access/transaction/declarative/annotations.html)：讀啟用條件、proxy 模式與交易屬性。
- [Rolling Back a Declarative Transaction](https://docs.spring.io/spring-framework/reference/data-access/transaction/declarative/rolling-back.html)：核對回滾規則。
- [Transaction-bound Events](https://docs.spring.io/spring-framework/reference/data-access/transaction/event.html)：了解事件如何與交易階段配合；這本身不等於持久化訊息佇列。

---

<a id="chapter-09"></a>

## 第 9 章　Spring Security：集中處理身分與權限

### 手作時的痛點

如果每個 Controller 都自己解析憑證、驗證登入狀態與檢查角色，新端點很容易漏掉其中一項。不同端點也可能出現不一致的失敗回應。

### 框架提供的解法

Spring Security 提供共同的安全處理架構。在 Servlet 應用程式中，請求會經過安全過濾器鏈；不同元件分工處理安全相關工作。

先分清楚：

| 名詞 | 回答的問題 | 預約系統例子 |
| --- | --- | --- |
| 身分驗證 Authentication | 你是誰？ | 確認請求代表會員 A |
| 授權 Authorization | 你可以做什麼？ | 確認會員 A 能否取消這筆預約 |

身分驗證成功，不代表可以操作所有資料。

### 可擴充設計與你的責任

應用程式可依需求選擇身分來源、驗證機制與授權規則。以 `SecurityFilterChain` 等配置點整合安全機制，能避免在每個 Controller 重複相同流程。

但「只有登入者能存取 `/bookings/**`」還不能表達完整的資料權限。會員 A 不應只因為知道會員 B 的預約編號，就能取消 B 的預約。資料歸屬、租戶隔離與操作權限仍要在適當層次判斷。

本書不提供一份宣稱適用所有專案的安全設定。Session、token、瀏覽器互動與跨來源請求等條件會影響設計，應依實際情境選擇官方章節。

**理解題：**某個 API 限定登入後可呼叫，是否已足以防止使用者操作別人的資料？

### 官方英文對照

- [Spring Security Servlet Architecture](https://docs.spring.io/spring-security/reference/servlet/architecture.html)：理解 `FilterChainProxy` 與 `SecurityFilterChain`。
- [Authorization](https://docs.spring.io/spring-security/reference/servlet/authorization/index.html)：了解請求與方法層級的授權能力。

---

<a id="chapter-10"></a>

## 第 10 章　快取與背景工作：把執行策略抽離業務流程

### 手作時的痛點

熱門時段清單不必每次都查資料庫；過期預約需要定期清理；某些通知可以交由背景執行。如果在業務方法裡自行管理快取 Map、執行緒與計時器，容易混合不同責任。

### 框架提供的解法

Spring 提供快取抽象、工作執行與排程支援：

| 能力 | 接手的部分 | 仍需自行決定 |
| --- | --- | --- |
| Cache abstraction | 統一方法結果快取的使用方式 | 快取鍵、失效條件、一致性、底層實作 |
| `@Async` | 將適當的方法呼叫交給 executor | 執行緒池、失敗處理、工作是否可遺失 |
| `@Scheduled` | 依時間規則觸發工作 | 重複執行的影響、多節點協調、重試 |

快取概念片段：

```kotlin
@Cacheable(cacheNames = ["slotNames"])
fun findSlotName(slotId: Long): String =
    repository.findName(slotId)
```

這個片段假設已啟用快取、配置 `CacheManager`，並透過代理呼叫該方法。快取有效期間等能力取決於底層快取產品與設定，不是 `@Cacheable` 自帶的萬用行為。

### 可擴充設計與你的責任

框架讓你更容易替換快取實作、設定 executor 或指定排程器。但多個應用程式實例可能各自執行排程；annotation 不自帶全系統只執行一次的保證。

`@Async` 也不等於可靠訊息系統。程序終止時，尚未完成的記憶體內工作可能遺失。需要可靠送達時，必須考慮持久化、重試與冪等性。

**理解題：**應用程式從一個實例擴成三個實例，原本的定時工作是否一定仍只執行一次？

### 官方英文對照

- [Cache Abstraction](https://docs.spring.io/spring-framework/reference/integration/cache.html)：區分快取抽象與實際儲存機制。
- [Declarative Annotation-based Caching](https://docs.spring.io/spring-framework/reference/integration/cache/annotations.html)：讀啟用方式、快取鍵與代理限制。
- [Task Execution and Scheduling](https://docs.spring.io/spring-framework/reference/integration/scheduling.html)：讀 `@Async`、`@Scheduled` 與 executor。

---

<a id="chapter-11"></a>

## 第 11 章　測試支援：依問題選擇驗證範圍

### 手作時的痛點

如果只想驗證取消預約的規則，卻必須啟動伺服器、資料庫與所有外部服務，測試會很慢，也容易被無關環境問題影響。

### 框架提供的解法

先看第 2 章的設計如何直接幫助測試：

```kotlin
val sent = mutableListOf<String>()
val fakeNotifier = object : Notifier {
    override fun send(message: String) {
        sent += message
    }
}

BookingService(fakeNotifier).confirm()
check(sent == listOf("預約成功"))
```

這段沿用第 2 章的 `BookingService`；它是普通 Kotlin 檢查，不需要 Spring 容器。真正測試專案可以使用測試框架的 assertion。

需要驗證框架整合時，Spring Boot 提供不同範圍的測試支援。例如 `@WebMvcTest` 聚焦 Web MVC，`@DataJpaTest` 聚焦 JPA，`@SpringBootTest` 載入較完整的應用程式環境。測試切片不是把整個應用程式照搬進來，需要提供測試範圍所需的合作物件。

### 可擴充設計與你的責任

用測試目的選範圍：

- 業務條件：優先使用一般單元測試。
- HTTP 參數、驗證與回應：使用適合的 Web 測試。
- ORM 映射與查詢：使用資料存取測試，必要時搭配真實類型的資料庫。
- 自動設定、依賴組裝、跨層合作：使用整合測試。

`@SpringBootTest` 預設不等於真的啟動可由網路存取的 HTTP 伺服器；要依 `webEnvironment` 選項判斷。使用 mock 資料庫也不能證明正式資料庫的 SQL 與交易行為正確。

**理解題：**只測「開始前不足 24 小時不能取消」，一定需要啟動完整 Spring 應用程式嗎？

### 官方英文對照

- [Testing Spring Boot Applications](https://docs.spring.io/spring-boot/reference/testing/spring-boot-applications.html)：讀測試切片與 `@SpringBootTest` 的 Web environment。
- [Unit Testing](https://docs.spring.io/spring-framework/reference/testing/unit.html)：理解一般物件設計如何降低測試對容器的依賴。

---

<a id="chapter-12"></a>

## 第 12 章　Actuator 與功能地圖：讓應用程式可以營運

### 手作時的痛點

服務能回傳結果之後，你還需要知道：它是否健康？請求是否變慢？哪些依賴發生問題？每個專案各寫一套管理端點，成本高且格式不一致。

### 框架提供的解法

Spring Boot Actuator 提供管理與觀測相關能力，例如健康狀態、指標，以及診斷應用程式設定的端點。它讓應用程式更容易接入營運工具。

「端點存在」、「透過 HTTP 暴露」與「誰有權存取」是不同設定問題。不要因為管理端點有用，就把全部診斷資訊公開在網際網路上。

### 可擴充設計與你的責任

你可以加入自己的健康檢查與業務指標。例如除了程序還在，也觀察預約成功率、失敗原因與通知處理延遲。

健康檢查通過不代表所有業務流程都正確；單一數字也不能解釋全部問題。需要根據服務目標組合 logs、metrics 與 traces，並制定有意義的告警。

### 回頭看整體設計

| 遇到的問題 | 先想到的能力 | 重要擴充位置 |
| --- | --- | --- |
| 服務彼此耦合，難以替換 | DI 與 IoC | 介面、Bean 註冊、候選選擇 |
| 基礎元件串接重複 | Boot 自動設定 | 屬性、customizer、自訂 Bean |
| 環境值散落 | 外部化設定 | 有型別的設定物件 |
| HTTP 處理重複 | MVC | Controller、converter、advice |
| SQL 基礎處理重複 | JDBC／Spring Data | 查詢與資料映射 |
| 方法前後共通邏輯 | AOP | 切面與代理邊界 |
| 多項資料操作需一致 | Transaction | 業務交易邊界與管理器 |
| 身分與權限規則分散 | Security | 安全鏈、授權規則 |
| 重複查詢或背景工作 | Cache／Scheduling | provider、executor、排程策略 |
| 測試太慢或範圍不明 | 測試切片與整合測試 | 合作物件替身、測試範圍 |
| 上線後缺乏可見性 | Actuator | 健康檢查與業務指標 |

表格是本書的整理。Spring 的價值可以從這些分工看出來：把重複的基礎工作集中成可整合的機制，同時留下業務決策與實作替換的位置。

**理解題：**健康端點顯示正常，是否能證明「取消預約不會退錯金額」？

### 官方英文對照

- [Production-ready Features](https://docs.spring.io/spring-boot/reference/actuator/index.html)：了解 Actuator 的定位。
- [Endpoints](https://docs.spring.io/spring-boot/reference/actuator/endpoints.html)：讀存取、暴露與安全性。
- [Metrics](https://docs.spring.io/spring-boot/reference/actuator/metrics.html)：了解內建與自訂指標。
- [Spring Projects](https://spring.io/projects/)：查閱其他專案的責任範圍。

---

<a id="appendix-a"></a>

## 附錄 A　英文與繁體中文術語表

以下是本書統一使用的譯名，不代表所有社群或官方中文文件都使用相同詞彙。API 與 annotation 保留原名，方便搜尋。

| 英文 | 本書用語 | 閱讀時抓住的意思 |
| --- | --- | --- |
| Framework | 框架 | 提供共同執行結構與擴充位置 |
| Library | 函式庫 | 程式可以呼叫的功能集合 |
| Dependency | 依賴 | 一個物件或模組需要的合作對象 |
| Dependency Injection | 依賴注入（DI） | 由外部提供合作物件 |
| Inversion of Control | 控制反轉（IoC） | 由外部機制掌握部分建立或呼叫流程 |
| Container | 容器 | 本書主要指管理 Bean 的 Spring 容器，不是 Docker 容器 |
| Bean | Bean | Spring 容器管理的物件 |
| Constructor | 建構子 | 建立物件時接受必要資料與依賴的位置 |
| Interface | 介面 | 宣告合作對象應提供的能力 |
| Implementation | 實作 | 真正完成能力的程式 |
| Lifecycle | 生命週期 | 物件建立、使用與銷毀等階段 |
| Scope | 作用域 | Bean 實例的共用範圍 |
| Singleton | singleton／單例 | 在此指每個容器、每個 Bean 定義的一個共用實例 |
| Configuration | 設定／組態 | 依上下文指值或元件組裝方式 |
| Auto-configuration | 自動設定 | 依條件提供預設組態 |
| Convention over configuration | 慣例優於設定 | 採用常見預設以減少重複設定 |
| Binding | 繫結 | 將來源資料連接或轉換到目標欄位／物件 |
| Annotation | 註解標記 | 例如 `@Service`；不同於文字 comment |
| Proxy | 代理物件 | 在真正物件前接收呼叫的物件 |
| Aspect | 切面 | 組織跨多處套用的行為 |
| Interceptor | 攔截器 | 在特定處理流程加入行為的元件 |
| Transaction | 交易 | 按規則共同提交或回滾的一組操作 |
| Commit / Rollback | 提交／回滾 | 確認交易結果／撤銷交易中的變更 |
| Persistence | 持久化 | 將狀態保存至可持續存在的儲存媒介 |
| Repository | Repository／資料存取介面 | 本書指資料操作抽象；不是 Git 儲存庫 |
| Serialization | 序列化 | 將物件轉為可傳輸或儲存的表示 |
| Deserialization | 反序列化 | 從資料表示建立物件 |
| Validation | 驗證 | 檢查資料或條件是否符合規則 |
| Authentication | 身分驗證 | 確認對方是誰 |
| Authorization | 授權 | 判斷可否執行操作 |
| Cache | 快取 | 保存可重用的結果以減少重複工作 |
| Thread pool | 執行緒池 | 管理一組可執行工作的執行緒 |
| Observability | 可觀測性 | 由輸出資訊理解系統內部行為的能力 |
| Test slice | 測試切片 | 只載入特定技術範圍的測試設定 |
| Boilerplate | 重複的制式程式碼 | 為完成共通流程而反覆撰寫的部分 |

一般語言規則參考 [Taiwanese Mandarin Translate Skill](https://github.com/JamestsaiTW/Taiwanese-Mandarin-translate-Skill)；補充查詢資源為 [Microsoft 在地化指南](https://learn.microsoft.com/en-us/globalization/reference/microsoft-style-guides)及[國家教育研究院樂詞網](https://terms.naer.edu.tw/)。詳細查核與編輯決策見同目錄的 [translation-research.md](translation-research.md)。

<a id="appendix-b"></a>

## 附錄 B　理解題參考答案

1. **取消期限由業務程式決定。** 框架提供執行與整合機制，不知道產品規則。
2. **可以不靠 Spring 替換通知器。** 透過建構子傳入不同實作即可；容器讓大量物件的組裝更容易管理。
3. **Starter 與自動設定不同。** 前者整理依賴，後者在條件成立時準備組態與元件。
4. **先查設定來源與優先順序。** 檔案中的值可能被其他來源覆蓋，也可能未被正確繫結。
5. **會。** 回應契約需要讓呼叫方辨識成功與失敗；集中處理例外不代表消除失敗語意。
6. **不代表。** 方法抽象可能隱藏多次 SQL，必須觀察實際查詢與資料庫往返。
7. **不同。** annotation 是宣告；是否生效還取決於啟用條件、受管理物件與呼叫路徑。
8. **不代表。** 一般資料庫交易無法撤回已送出的外部 Email。
9. **不足。** 還要判斷資料歸屬與操作權限，不能只檢查登入。
10. **不一定。** 多個實例可能各自排程；跨節點協調需另外設計。
11. **不需要。** 純業務條件可用一般單元測試驗證，時間最好透過可控制的來源提供。
12. **不能。** 健康檢查只證明它檢查的條件；金額與業務正確性需要對應驗證。

<a id="appendix-c"></a>

## 附錄 C　後續閱讀路線與來源說明

### 接下來只選一條路線

若你想確認自己理解框架的設計價值，先回到第 2 章，手動組裝兩種通知器，再讓 Spring 幫忙組裝。比較的是「組裝責任移到哪裡」，而非程式碼短了多少。

若你已能解釋 DI，接著讀第 3～4 章，觀察自動設定條件與外部設定。嘗試回答：某個 Bean 是誰建立的？目前使用的 timeout 從哪裡來？

若你平常已經在維護 API，則讀第 5～8 章，沿著一次請求找出 HTTP 邊界、業務邊界與交易邊界。不要先把時間花在背完整的 annotation 清單。

### 其他官方入口

- [Building an Application with Spring Boot](https://spring.io/guides/gs/spring-boot/)：小型應用程式導覽；原文可能以 Java 為主。
- [Kotlin Support](https://docs.spring.io/spring-boot/reference/features/kotlin.html)：以 Kotlin 開始時的依賴與 plugin 注意事項。
- [Spring Framework Documentation](https://docs.spring.io/spring-framework/reference/index.html)：完整功能分類入口。
- [Spring Boot Reference](https://docs.spring.io/spring-boot/reference/index.html)：Boot 完整文件入口。

### 內容歸屬與閱讀邊界

官方技術文件及其名稱、商標與程式碼仍歸原權利人所有。Spring 官方文件網站標示 Copyright © 2005 - Broadcom。官方文件的作者與貢獻者資訊可由上述文件首頁及其原始碼連結查閱。

本書採自行編寫的中文解說、比較表、概念片段與理解題，沒有整批複製官方圖文，也不宣稱是官方出版物或完整授權譯本。具體 API 行為應以實際使用版本的英文文件與測試結果為準。

本書刻意不深入 WebFlux、批次處理、訊息代理、Spring Cloud、原生映像與原始碼實作。這些主題各有不同前提；先建立目前這份核心功能地圖，再依真實需求延伸。
