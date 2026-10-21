# 原生映像進階主題

## 巢狀設定屬性

Spring 的預先處理引擎會自動為設定屬性產生反射 hints。不過，若巢狀設定屬性不是內部類別，則**必須**加上 [`@NestedConfigurationProperty`][r1]，否則不會被偵測到，也無法繫結。

{{CODE_0}}

其中 `Nested` 如下：

{{CODE_1}}

{{CODE_2}}

此例會產生 `my.properties.name` 與 `my.properties.nested.number` 設定屬性。如果 `nested` 欄位沒有加上 [`@NestedConfigurationProperty`][r1]，`my.properties.nested.number` 就無法在原生映像中繫結。也可以將註解加在 getter 方法上。

使用建構子繫結時，必須將 [`@NestedConfigurationProperty`][r1] 加在欄位上：

{{CODE_3}}

使用 record 時，必須將註解加在參數上：

{{CODE_4}}

使用 Kotlin 時，必須將 [`@NestedConfigurationProperty`][r1] 加在 data class 的參數上：

{{CODE_5}}

> **注意：**所有情況都請使用 public getter 與 setter，否則屬性無法繫結。

> **譯者註：**上述提醒依原文保留；前述 record 與 Kotlin 建構子繫結範例本身並不表示必須為不可變欄位額外產生 setter。實作時應連同所採用的繫結方式閱讀。

## 轉換 Spring Boot 可執行 Jar

只要 jar 包含 AOT 產生的產物，就能將 Spring Boot [可執行 jar][r2] 轉成原生映像。這有數項用途，例如：

- 保留一般 JVM 建置流程，再於 CI/CD 平台將 JVM 應用程式轉成原生映像。
- 因為 `native-image` [不支援跨平台編譯][r3]，可以先保留不依賴特定作業系統的部署產物，再針對不同作業系統架構轉換。

轉換方式可使用 Cloud Native Buildpacks，或 GraalVM 隨附的 `native-image` 工具。

> **注意：**可執行 jar 必須包含 AOT 產生的類別與 JSON hint 檔案等產物。

### 使用 Buildpacks

Spring Boot 應用程式通常透過 Maven（`mvn spring-boot:build-image`）或 Gradle（`gradle bootBuildImage`）整合使用 Cloud Native Buildpacks。不過，也可以使用 [`pack`][r4]，把已經 AOT 處理的 Spring Boot 可執行 jar 轉成原生容器映像。

> **注意：**建置應用程式時至少需要 JDK 25，因為 Buildpacks 使用的 GraalVM native-image 版本，與編譯時使用的 Java 版本相同。

首先，確認有可用的 Docker daemon，詳見 [Get Docker][r5]。在 Linux 上，請[設定為允許非 root 使用者操作][r6]。

也需要依照 [buildpacks.io 安裝指南][r7]安裝 `pack`。

假設 `target` 目錄中已有經 AOT 處理的 `myproject-0.0.1-SNAPSHOT.jar`，執行：

{{CODE_6}}

> **注意：**使用此方式產生映像，不需要在本機安裝 GraalVM。

`pack` 完成後，可使用 `docker run` 啟動應用程式：

{{CODE_7}}

### 使用 GraalVM native-image

另一種方式是使用 GraalVM 的 `native-image` 工具。這需要在本機安裝 GraalVM 發行版，可以從 [Liberica Native Image Kit 網頁][r8]手動下載，或使用 SDKMAN! 等下載管理工具。

假設 `target` 目錄中已有經 AOT 處理的 `myproject-0.0.1-SNAPSHOT.jar`，執行：

{{CODE_8}}

> **注意：**這些指令適用於 Linux 或 macOS；Windows 需要相應調整。

> **提示：**jar 不一定包含 `@META-INF/native-image/argfile`，只有需要覆寫可達性中繼資料時才會加入。

> **警告：**`native-image` 的 `-cp` 旗標不接受萬用字元。必須確保列出所有 jar；前例使用 `find` 與 `tr` 完成此工作。

## 使用 Tracing Agent

GraalVM 原生映像的 [tracing agent][r9] 能在 JVM 上攔截反射、資源或代理的使用情況，產生相關 hints。Spring 應該會自動產生大部分 hints，但 tracing agent 可協助快速找出缺少的項目。

使用 agent 產生 hints 時，有兩種作法：

- 直接啟動應用程式並操作它。
- 執行應用程式測試，藉此觸發應用程式行為。

第一種方式適合用於某個函式庫或模式未被 Spring 辨識時，找出缺少的 hints。

第二種方式較容易建立可重複執行的流程，但預設產生的 hints 也會包含測試基礎設施需要的項目，其中部分在實際執行應用程式時並不需要。為解決此問題，agent 支援 access-filter 檔案，可從輸出中排除某些資料。

### 直接啟動應用程式

使用以下指令，在啟動應用程式時附加原生映像 tracing agent：

{{CODE_9}}

接著操作想取得 hints 的程式路徑，完成後使用 `ctrl-c` 停止應用程式。

關閉應用程式時，agent 會把 hint 檔案寫入指定的設定輸出目錄。可手動檢查這些檔案，或將它們作為原生映像建置的輸入。若要用於建置，請複製到 `src/main/resources/META-INF/native-image/`；下次建立原生映像時，GraalVM 就會納入這些檔案。

Agent 也提供更進階的設定，例如依呼叫端類別篩選記錄的 hints。詳見[官方文件][r9]。

## 自訂 Hints

如果需要自行提供反射、資源、序列化、代理等 hints，可以使用 [`RuntimeHintsRegistrar`][r10] API。建立實作此介面的類別，再對提供的 [`RuntimeHints`][r11] 實例進行適當呼叫：

{{CODE_10}}

接著，在任一 [`@Configuration`][r13] 類別上使用 [`@ImportRuntimeHints`][r12]，即可啟用；例如可加在帶有 [`@SpringBootApplication`][r14] 的應用程式類別上。

如果有需要繫結的類別，通常是 JSON 序列化或反序列化所需，可在任一 Bean 使用 [`@RegisterReflectionForBinding`][r15]。大部分 hints 都會自動推導，例如 [`@RestController`][r16] 方法接受或回傳資料的情況。但若直接使用 [`WebClient`][r17]、[`RestClient`][r18] 或 [`RestTemplate`][r19]，可能需要自行使用 [`@RegisterReflectionForBinding`][r20]。

### 測試自訂 Hints

[`RuntimeHintsPredicates`][r21] API 可用來測試 hints。它提供建立 [`Predicate`][r22] 的方法，用來檢查 [`RuntimeHints`][r11] 實例。

若使用 AssertJ，測試會像這樣：

{{CODE_11}}

### 以靜態方式提供 Hints

也可以將自訂 hints 放在一個或多個 GraalVM JSON hint 檔案中，以靜態方式提供。檔案應放在 `src/main/resources/` 下的 `META-INF/native-image/*/*/` 目錄。

[AOT 處理時產生的 hints][r23] 會寫入 `META-INF/native-image/{groupId}/{artifactId}/`。因此，請將靜態 hint 檔案放在不與此位置衝突的目錄，例如 `META-INF/native-image/{groupId}/{artifactId}-additional-hints/`。

## 已知限制

GraalVM 原生映像仍在持續發展，並非所有函式庫都提供支援。GraalVM 社群透過[可達性中繼資料][r24]協助尚未自行提供這些資料的專案。Spring 本身不包含第三方函式庫的 hints，而是依賴這個可達性中繼資料專案。

如果為 Spring Boot 應用程式產生原生映像時遇到問題，請先查看 Spring Boot wiki 的 [Spring Boot with GraalVM][r25] 頁面。也可以向 GitHub 的 [spring-aot-smoke-tests][r26] 專案回報 issue；該專案用來確認常見應用程式類型能正常運作。

如果發現某個函式庫無法搭配 GraalVM，請向[可達性中繼資料專案][r24]提出 issue。
