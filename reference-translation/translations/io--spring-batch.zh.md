# Spring Batch

Spring Boot 提供多項便利功能，協助使用 [Spring Batch][r1]，其中包含在啟動時執行工作。

建置批次應用程式時，可自動設定下列儲存：

- 記憶體內儲存
- JDBC
- MongoDB

每種儲存都有各自的額外設定。
例如，可以自訂 JDBC 儲存的資料表前綴，如下例所示：

{{CODE_0}}

{{CODE_1}}

使用 MongoDB 儲存時，可以啟用 Spring Batch 工作儲存庫綱要的初始化（集合與索引）：

{{CODE_2}}

{{CODE_3}}

若要停用 Spring Boot 的自動設定並完全掌控 Spring Batch 設定，請在某個 [`@Configuration`][r3] 類別上加入 [`@EnableBatchProcessing`][r2]，或繼承 [`DefaultBatchConfiguration`][r4]。
這會讓自動設定退讓，包括 Spring Batch 資料庫綱要（JDBC 或 MongoDB）的初始化。
接著就可以使用 `@Enable*JobRepository` 註解的屬性設定 Spring Batch，而不使用前述設定屬性。

若想進一步了解如何手動設定 Spring Batch，請參閱下列 API 文件：

- [`DefaultBatchConfiguration`][r4]
- [`@EnableBatchProcessing`][r2]
- [`@EnableJdbcJobRepository`][r5]
- [`@EnableMongoJobRepository`][r6]

更多 Spring Batch 資訊，請參閱 [Spring Batch 專案頁面][r1]。

## 啟動時執行 Spring Batch 工作

當 Spring Boot 自動設定 Spring Batch，且應用程式上下文中只有一個 [`Job`][r7] Bean 時，該工作會在啟動時執行（詳情請參閱 [`JobLauncherApplicationRunner`][r8]）。
若找到多個 [`Job`][r7] Bean，必須使用 `spring.batch.job.name` 指定要執行的工作。

你可以停用執行應用程式上下文中找到的 [`Job`][r7]，如下例所示：

{{CODE_4}}

{{CODE_5}}

詳情請參閱 [`BatchAutoConfiguration`][r9]、[`BatchJdbcAutoConfiguration`][r10] 與 [`BatchDataMongoAutoConfiguration`][r11]。
