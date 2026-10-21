# Spring Batch

<!-- source-attribution -->
> **非官方繁體中文翻譯** · Spring Boot 4.1.1 · 翻譯日期：2026-10-21  
> [官方英文網站](https://docs.spring.io/spring-boot/4.1/reference/io/spring-batch.html) · [固定版本英文來源](https://github.com/spring-projects/spring-boot/blob/v4.1.1/documentation/spring-boot-docs/src/docs/antora/modules/reference/pages/io/spring-batch.adoc) · [本地原文快照](../sources/spring-boot/documentation/spring-boot-docs/src/docs/antora/modules/reference/pages/io/spring-batch.adoc)  
> 原始作者與授權見 [來源聲明](../NOTICE.md)。官方範例及設定鍵保留原文，額外圖解另標示為譯者補充。

<!-- translation-status: translated -->

Spring Boot 提供多項便利功能，協助使用 [Spring Batch][io--spring-batch-r1]，其中包含在啟動時執行工作。

建置批次應用程式時，可自動設定下列儲存：

- 記憶體內儲存
- JDBC
- MongoDB

每種儲存都有各自的額外設定。
例如，可以自訂 JDBC 儲存的資料表前綴，如下例所示：

```properties
spring.batch.jdbc.table-prefix=CUSTOM_
```

```yaml
spring:
  batch:
    jdbc:
      table-prefix: "CUSTOM_"
```

使用 MongoDB 儲存時，可以啟用 Spring Batch 工作儲存庫綱要的初始化（集合與索引）：

```properties
spring.batch.data.mongodb.schema.initialize=true
```

```yaml
spring:
  batch:
    data:
      mongodb:
        schema:
          initialize: true
```

若要停用 Spring Boot 的自動設定並完全掌控 Spring Batch 設定，請在某個 [`@Configuration`][io--spring-batch-r3] 類別上加入 [`@EnableBatchProcessing`][io--spring-batch-r2]，或繼承 [`DefaultBatchConfiguration`][io--spring-batch-r4]。
這會讓自動設定退讓，包括 Spring Batch 資料庫綱要（JDBC 或 MongoDB）的初始化。
接著就可以使用 `@Enable*JobRepository` 註解的屬性設定 Spring Batch，而不使用前述設定屬性。

若想進一步了解如何手動設定 Spring Batch，請參閱下列 API 文件：

- [`DefaultBatchConfiguration`][io--spring-batch-r4]
- [`@EnableBatchProcessing`][io--spring-batch-r2]
- [`@EnableJdbcJobRepository`][io--spring-batch-r5]
- [`@EnableMongoJobRepository`][io--spring-batch-r6]

更多 Spring Batch 資訊，請參閱 [Spring Batch 專案頁面][io--spring-batch-r1]。

## 啟動時執行 Spring Batch 工作

當 Spring Boot 自動設定 Spring Batch，且應用程式上下文中只有一個 [`Job`][io--spring-batch-r7] Bean 時，該工作會在啟動時執行（詳情請參閱 [`JobLauncherApplicationRunner`][io--spring-batch-r8]）。
若找到多個 [`Job`][io--spring-batch-r7] Bean，必須使用 `spring.batch.job.name` 指定要執行的工作。

你可以停用執行應用程式上下文中找到的 [`Job`][io--spring-batch-r7]，如下例所示：

```properties
spring.batch.job.enabled=false
```

```yaml
spring:
  batch:
    job:
      enabled: false
```

詳情請參閱 [`BatchAutoConfiguration`][io--spring-batch-r9]、[`BatchJdbcAutoConfiguration`][io--spring-batch-r10] 與 [`BatchDataMongoAutoConfiguration`][io--spring-batch-r11]。

[io--spring-batch-r1]: https://spring.io/projects/spring-batch
[io--spring-batch-r2]: https://docs.spring.io/spring-batch/docs/6.0.x/api/org/springframework/batch/core/configuration/annotation/EnableBatchProcessing.html
[io--spring-batch-r3]: https://docs.spring.io/spring-framework/docs/7.0.x/javadoc-api/org/springframework/context/annotation/Configuration.html
[io--spring-batch-r4]: https://docs.spring.io/spring-batch/docs/6.0.x/api/org/springframework/batch/core/configuration/support/DefaultBatchConfiguration.html
[io--spring-batch-r5]: https://docs.spring.io/spring-batch/docs/6.0.x/api/org/springframework/batch/core/configuration/annotation/EnableJdbcJobRepository.html
[io--spring-batch-r6]: https://docs.spring.io/spring-batch/docs/6.0.x/api/org/springframework/batch/core/configuration/annotation/EnableMongoJobRepository.html
[io--spring-batch-r7]: https://docs.spring.io/spring-batch/docs/6.0.x/api/org/springframework/batch/core/job/Job.html
[io--spring-batch-r8]: https://docs.spring.io/spring-boot/4.1.1/api/java/org/springframework/boot/batch/autoconfigure/JobLauncherApplicationRunner.html
[io--spring-batch-r9]: https://github.com/spring-projects/spring-boot/tree/v4.1.1/module/spring-boot-batch/src/main/java/org/springframework/boot/batch/autoconfigure/BatchAutoConfiguration.java
[io--spring-batch-r10]: https://github.com/spring-projects/spring-boot/tree/v4.1.1/module/spring-boot-batch-jdbc/src/main/java/org/springframework/boot/batch/jdbc/autoconfigure/BatchJdbcAutoConfiguration.java
[io--spring-batch-r11]: https://github.com/spring-projects/spring-boot/tree/v4.1.1/module/spring-boot-batch-data-mongodb/src/main/java/org/springframework/boot/batch/mongodb/autoconfigure/BatchDataMongoAutoConfiguration.java
