# Quartz 排程器

<!-- source-attribution -->
> **非官方繁體中文翻譯** · Spring Boot 4.1.1 · 翻譯日期：2026-10-21  
> [官方英文網站](https://docs.spring.io/spring-boot/4.1/reference/io/quartz.html) · [固定版本英文來源](https://github.com/spring-projects/spring-boot/blob/v4.1.1/documentation/spring-boot-docs/src/docs/antora/modules/reference/pages/io/quartz.adoc) · [本地原文快照](../sources/spring-boot/documentation/spring-boot-docs/src/docs/antora/modules/reference/pages/io/quartz.adoc)  
> 原始作者與授權見 [來源聲明](../NOTICE.md)。官方範例及設定鍵保留原文，額外圖解另標示為譯者補充。

<!-- translation-status: translated -->

Spring Boot 提供多項便利功能，協助使用 [Quartz 排程器][io--quartz-r1]，其中包含 `spring-boot-starter-quartz` starter。
若有 Quartz，就會透過 [`SchedulerFactoryBean`][io--quartz-r3] 抽象自動設定 [`Scheduler`][io--quartz-r2]。

下列型別的 Bean 會自動被找到，並與 [`Scheduler`][io--quartz-r2] 關聯：

- [`JobDetail`][io--quartz-r4]：定義特定工作。
  可以使用 [`JobBuilder`][io--quartz-r5] API 建立 [`JobDetail`][io--quartz-r4] 實例。
- [`Calendar`][io--quartz-r6]。
- [`Trigger`][io--quartz-r7]：定義特定工作何時觸發。

預設使用記憶體內的 [`JobStore`][io--quartz-r8]。
不過，如果應用程式中有 [`DataSource`][io--quartz-r9] Bean，且適當設定 `spring.quartz.job-store-type` 屬性，就可以設定以 JDBC 為基礎的儲存，如下例所示：

```properties
spring.quartz.job-store-type=jdbc
```

```yaml
spring:
  quartz:
    job-store-type: "jdbc"
```

使用 JDBC 儲存時，可以在啟動時初始化綱要，如下例所示：

```properties
spring.quartz.jdbc.initialize-schema=always
```

```yaml
spring:
  quartz:
    jdbc:
      initialize-schema: "always"
```

> **警告：**
>
> 預設會偵測資料庫，並使用 Quartz 程式庫提供的標準指令碼初始化。
> 這些指令碼會移除既有資料表，導致每次重新啟動都刪除所有觸發器。
> 若要使用自訂指令碼，請設定 `spring.quartz.jdbc.schema` 屬性。
> 某些標準指令碼，例如 SQL Server、Azure SQL 與 Sybase 使用的指令碼，必須修改後才能使用。
> 遇到這些情況，請複製指令碼，依照其中註解的指示編輯，再設定 `spring.quartz.jdbc.schema` 使用自訂指令碼。

若要讓 Quartz 使用不同於應用程式主要 [`DataSource`][io--quartz-r9] 的資料來源，請宣告 [`DataSource`][io--quartz-r9] Bean，並在其 [`@Bean`][io--quartz-r10] 方法上加上 [`@QuartzDataSource`][io--quartz-r11]。
這可確保 [`SchedulerFactoryBean`][io--quartz-r3] 與綱要初始化都使用 Quartz 專用的 [`DataSource`][io--quartz-r9]。
同樣地，若要讓 Quartz 使用不同於應用程式主要 [`TransactionManager`][io--quartz-r12] 的交易管理器，請宣告 [`TransactionManager`][io--quartz-r12] Bean，並在其 [`@Bean`][io--quartz-r10] 方法上加上 [`@QuartzTransactionManager`][io--quartz-r13]。

預設情況下，透過設定建立的工作，不會覆寫已從持久化工作儲存讀取並註冊的工作。
若要允許覆寫既有工作定義，請設定 `spring.quartz.overwrite-existing-jobs` 屬性。

你可以使用 `spring.quartz` 屬性與 [`SchedulerFactoryBeanCustomizer`][io--quartz-r14] Bean 自訂 Quartz 排程器；後者允許以程式自訂 [`SchedulerFactoryBean`][io--quartz-r3]。
進階 Quartz 設定屬性則可透過 `spring.quartz.properties.*` 自訂。

> **注意：**
>
> 特別是，[`Executor`][io--quartz-r15] Bean 不會與排程器關聯，因為 Quartz 提供了透過 `spring.quartz.properties` 設定排程器的方式。
> 若需要自訂任務執行器，可考慮實作 [`SchedulerFactoryBeanCustomizer`][io--quartz-r14]。

工作可以定義 setter 來注入資料對映屬性。
一般 Bean 也可以用類似方式注入，如下例所示：

```kotlin
import org.quartz.JobExecutionContext
import org.springframework.scheduling.quartz.QuartzJobBean

class MySampleJob : QuartzJobBean() {

	// fields ...

	private var myService: MyService? = null

	private var name: String? = null

	// Inject "MyService" bean
	fun setMyService(myService: MyService?) {
		this.myService = myService
	}

	// Inject the "name" job data property
	fun setName(name: String?) {
		this.name = name
	}

	override fun executeInternal(context: JobExecutionContext) {
		myService!!.someMethod(context.fireTime, name)
	}

}
```

```java
import org.quartz.JobExecutionContext;
import org.quartz.JobExecutionException;

import org.springframework.scheduling.quartz.QuartzJobBean;

public class MySampleJob extends QuartzJobBean {

	// fields ...

	private MyService myService;

	private String name;

	// Inject "MyService" bean
	public void setMyService(MyService myService) {
		this.myService = myService;
	}

	// Inject the "name" job data property
	public void setName(String name) {
		this.name = name;
	}

	@Override
	protected void executeInternal(JobExecutionContext context) throws JobExecutionException {
		this.myService.someMethod(context.getFireTime(), this.name);
	}

}
```

[io--quartz-r1]: https://www.quartz-scheduler.org/
[io--quartz-r2]: https://javadoc.io/doc/org.quartz-scheduler/quartz/2.5.2/org/quartz/Scheduler.html
[io--quartz-r3]: https://docs.spring.io/spring-framework/docs/7.0.x/javadoc-api/org/springframework/scheduling/quartz/SchedulerFactoryBean.html
[io--quartz-r4]: https://javadoc.io/doc/org.quartz-scheduler/quartz/2.5.2/org/quartz/JobDetail.html
[io--quartz-r5]: https://javadoc.io/doc/org.quartz-scheduler/quartz/2.5.2/org/quartz/JobBuilder.html
[io--quartz-r6]: https://javadoc.io/doc/org.quartz-scheduler/quartz/2.5.2/org/quartz/Calendar.html
[io--quartz-r7]: https://javadoc.io/doc/org.quartz-scheduler/quartz/2.5.2/org/quartz/Trigger.html
[io--quartz-r8]: https://javadoc.io/doc/org.quartz-scheduler/quartz/2.5.2/org/quartz/spi/JobStore.html
[io--quartz-r9]: https://docs.oracle.com/en/java/javase/17/docs/api/java.sql/javax/sql/DataSource.html
[io--quartz-r10]: https://docs.spring.io/spring-framework/docs/7.0.x/javadoc-api/org/springframework/context/annotation/Bean.html
[io--quartz-r11]: https://docs.spring.io/spring-boot/4.1.1/api/java/org/springframework/boot/quartz/autoconfigure/QuartzDataSource.html
[io--quartz-r12]: https://docs.spring.io/spring-framework/docs/7.0.x/javadoc-api/org/springframework/transaction/TransactionManager.html
[io--quartz-r13]: https://docs.spring.io/spring-boot/4.1.1/api/java/org/springframework/boot/quartz/autoconfigure/QuartzTransactionManager.html
[io--quartz-r14]: https://docs.spring.io/spring-boot/4.1.1/api/java/org/springframework/boot/quartz/autoconfigure/SchedulerFactoryBeanCustomizer.html
[io--quartz-r15]: https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/util/concurrent/Executor.html
