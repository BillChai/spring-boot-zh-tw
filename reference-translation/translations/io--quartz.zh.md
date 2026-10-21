# Quartz 排程器

Spring Boot 提供多項便利功能，協助使用 [Quartz 排程器][r1]，其中包含 `spring-boot-starter-quartz` starter。
若有 Quartz，就會透過 [`SchedulerFactoryBean`][r3] 抽象自動設定 [`Scheduler`][r2]。

下列型別的 Bean 會自動被找到，並與 [`Scheduler`][r2] 關聯：

- [`JobDetail`][r4]：定義特定工作。
  可以使用 [`JobBuilder`][r5] API 建立 [`JobDetail`][r4] 實例。
- [`Calendar`][r6]。
- [`Trigger`][r7]：定義特定工作何時觸發。

預設使用記憶體內的 [`JobStore`][r8]。
不過，如果應用程式中有 [`DataSource`][r9] Bean，且適當設定 `spring.quartz.job-store-type` 屬性，就可以設定以 JDBC 為基礎的儲存，如下例所示：

{{CODE_0}}

{{CODE_1}}

使用 JDBC 儲存時，可以在啟動時初始化綱要，如下例所示：

{{CODE_2}}

{{CODE_3}}

> [WARNING]
>
> 預設會偵測資料庫，並使用 Quartz 程式庫提供的標準指令碼初始化。
> 這些指令碼會移除既有資料表，導致每次重新啟動都刪除所有觸發器。
> 若要使用自訂指令碼，請設定 `spring.quartz.jdbc.schema` 屬性。
> 某些標準指令碼，例如 SQL Server、Azure SQL 與 Sybase 使用的指令碼，必須修改後才能使用。
> 遇到這些情況，請複製指令碼，依照其中註解的指示編輯，再設定 `spring.quartz.jdbc.schema` 使用自訂指令碼。

若要讓 Quartz 使用不同於應用程式主要 [`DataSource`][r9] 的資料來源，請宣告 [`DataSource`][r9] Bean，並在其 [`@Bean`][r10] 方法上加上 [`@QuartzDataSource`][r11]。
這可確保 [`SchedulerFactoryBean`][r3] 與綱要初始化都使用 Quartz 專用的 [`DataSource`][r9]。
同樣地，若要讓 Quartz 使用不同於應用程式主要 [`TransactionManager`][r12] 的交易管理器，請宣告 [`TransactionManager`][r12] Bean，並在其 [`@Bean`][r10] 方法上加上 [`@QuartzTransactionManager`][r13]。

預設情況下，透過設定建立的工作，不會覆寫已從持久化工作儲存讀取並註冊的工作。
若要允許覆寫既有工作定義，請設定 `spring.quartz.overwrite-existing-jobs` 屬性。

你可以使用 `spring.quartz` 屬性與 [`SchedulerFactoryBeanCustomizer`][r14] Bean 自訂 Quartz 排程器；後者允許以程式自訂 [`SchedulerFactoryBean`][r3]。
進階 Quartz 設定屬性則可透過 `spring.quartz.properties.*` 自訂。

> [NOTE]
>
> 特別是，[`Executor`][r15] Bean 不會與排程器關聯，因為 Quartz 提供了透過 `spring.quartz.properties` 設定排程器的方式。
> 若需要自訂任務執行器，可考慮實作 [`SchedulerFactoryBeanCustomizer`][r14]。

工作可以定義 setter 來注入資料對映屬性。
一般 Bean 也可以用類似方式注入，如下例所示：

{{CODE_4}}

{{CODE_5}}
