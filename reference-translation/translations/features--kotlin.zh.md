# Kotlin 支援

[Kotlin][r1] 是以 JVM（以及其他平台）為目標的靜態型別語言，能撰寫簡潔、優雅的程式碼，並與現有 Java 函式庫[互通][r2]。

Spring Boot 透過 Spring Framework、Spring Data、Reactor 等其他 Spring 專案的能力提供 Kotlin 支援。詳情請參閱 [Spring Framework 的 Kotlin 支援文件][r3]。

開始使用 Spring Boot 與 Kotlin 最容易的方式，是跟著[這份完整教學][r4]操作，也可以透過 [start.spring.io][r5] 建立 Kotlin 專案。如果需要協助，可以加入 [Kotlin Slack][r6] 的 `#spring` 頻道，或在 [Stack Overflow][r7] 使用 `spring` 與 `kotlin` 標籤提問。

## 必要條件

Spring Boot 至少需要 Kotlin 2.2.x，並透過依賴管理選定適合的 Kotlin 版本。使用 Kotlin 時，classpath 必須包含 `org.jetbrains.kotlin:kotlin-stdlib` 與 `org.jetbrains.kotlin:kotlin-reflect`。

Kotlin 2.2.x 引進[將註解傳遞至參數、欄位與屬性的新預設規則][r8]。為避免相關警告，並採用可能在未來版本成為 Kotlin 預設值的行為，建議設定 `-Xannotation-default-target=param-property` 編譯旗標。

因為 [Kotlin 類別預設為 final][r9]，通常會需要設定 [kotlin-spring][r10] 外掛，自動將帶有 Spring 註解的類別開放繼承，讓框架能建立代理。

在 Kotlin 中序列化／反序列化 JSON 資料，需要 [Jackson Kotlin 模組][r11]；若 classpath 中具有此模組，便會自動註冊。

> **提示：**透過 [start.spring.io][r5] 建立 Kotlin 專案時，預設就會提供這些依賴與外掛。

## Null 安全性

[Null 安全性][r12] 是 Kotlin 的重要功能之一。它會在編譯階段處理 `null`，避免把問題延後到執行階段才遭遇 [`NullPointerException`][r13]。這有助於消除一種常見的錯誤來源，也不必付出 [`Optional`][r14] 等包裝型別的成本。Kotlin 也允許搭配可為 null 的值使用函數式結構，詳見[這份完整的 Kotlin null 安全性指南][r15]。

雖然 Java 的型別系統無法直接表達 null 安全性，大多數 Spring 專案會透過 [JSpecify][r17] 註解提供 [null 安全性][r16]資訊。

從 Kotlin 2.1 起，Kotlin 會對 `org.jspecify.annotations` 套件的可空性註解採取嚴格處理。

## Kotlin API

### runApplication

Spring Boot 提供符合 Kotlin 慣用寫法的 `runApplication<MyApplication>(*args)` 來執行應用程式：

{{CODE_0}}

它可直接取代 `SpringApplication.run(MyApplication::class.java, *args)`，也允許客製應用程式，如下例：

{{CODE_1}}

### 擴充功能

Kotlin 的[擴充功能][r18]能為既有類別增加功能。Spring Boot Kotlin API 利用這個機制，為現有 API 增加 Kotlin 專用的便利寫法。

例如，Spring Boot 提供 [`TestRestTemplate`][r19] 擴充功能，類似 Spring Framework 對 [`RestOperations`][r20] 提供的擴充；其中一項能力，是使用 Kotlin 的具體化型別參數（reified type parameters）。

## 依賴管理

為避免 classpath 混用不同版本的 Kotlin 依賴，Spring Boot 會匯入 Kotlin BOM。

使用 Maven 時，可以設定 `kotlin.version` 屬性調整 Kotlin 版本，並由外掛管理提供 `kotlin-maven-plugin`。使用 Gradle 時，Spring Boot 外掛會自動讓 `kotlin.version` 與 Kotlin 外掛版本一致。

Spring Boot 也會匯入 Kotlin Coroutines BOM，以管理 Coroutines 依賴的版本；可透過 `kotlin-coroutines.version` 屬性客製版本。

> **提示：**透過 [start.spring.io][r5] 建立至少包含一項 Reactive 依賴的 Kotlin 專案時，預設會提供 `org.jetbrains.kotlinx:kotlinx-coroutines-reactor`。

## @ConfigurationProperties

[`@ConfigurationProperties`][r21] 搭配[建構子繫結][r22]時，支援具有不可變 `val` 屬性的 data class：

{{CODE_2}}

由於與 Java 互通的限制，value class 的支援有限。尤其在設定屬性繫結時，無法依賴 value class 的預設值；這種情況應改用 data class。

> **提示：**若要透過 annotation processor 產生[自己的中繼資料][r23]，應搭配 `spring-boot-configuration-processor` 依賴[設定 `kapt`][r24]。請注意，受限於 kapt 提供的模型，偵測預設值、已棄用項目等部分功能無法運作。

## 測試

雖然可以使用 JUnit 4 測試 Kotlin 程式碼，但預設提供且建議使用的是 JUnit 6。JUnit 6 允許測試類別只建立一次實例，再供該類別的所有測試重複使用，因此能在非靜態方法上使用 [`@BeforeAll`][r25] 與 [`@AfterAll`][r26]，很適合 Kotlin。

若要 mock Kotlin 類別，建議使用 [MockK][r27]。若需要 Mockito 專用的 [`@MockitoBean`、`@MockitoSpyBean` 註解][r29]在 `MockK` 中的對應功能，可使用 [SpringMockK][r30]，其提供相似的 `@MockkBean` 與 `@SpykBean`。

## 資源

### 延伸閱讀

- [Kotlin 語言參考文件][r31]
- [Kotlin Slack][r32]，包含專用的 `#spring` 頻道。
- [Stack Overflow 的 `spring` 與 `kotlin` 標籤][r7]
- [在瀏覽器中試用 Kotlin][r33]
- [Kotlin 部落格][r34]
- [Awesome Kotlin][r35]
- [教學：使用 Spring Boot 與 Kotlin 建立 Web 應用程式][r4]
- [使用 Kotlin 開發 Spring Boot 應用程式][r36]
- [使用 Kotlin、Spring Boot 與 PostgreSQL 建立地理空間通訊應用程式][r37]
- [Spring Framework 5.0 的 Kotlin 支援介紹][r38]
- [Spring Framework 5 Kotlin API：函數式寫法][r39]

### 範例

- [spring-boot-kotlin-demo][r40]：一般的 Spring Boot 與 Spring Data JPA 專案。
- [mixit][r41]：Spring Boot 2、WebFlux 與 Reactive Spring Data MongoDB。
- [spring-kotlin-fullstack][r42]：WebFlux Kotlin 全端範例，前端使用 Kotlin2js，而非 JavaScript 或 TypeScript。
- [spring-petclinic-kotlin][r43]：Spring PetClinic 範例應用程式的 Kotlin 版本。
- [spring-kotlin-deepdive][r44]：逐步從 Boot 1.0 與 Java 遷移至 Boot 2.0 與 Kotlin。
- [spring-boot-coroutines-demo][r45]：Coroutines 範例專案。

> **譯者註：**本節資源清單依原文保留，部分範例明確使用舊版 Boot；它們不是本書 4.1.1 的相容性範本。
