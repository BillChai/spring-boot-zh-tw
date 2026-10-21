# SQL 資料庫

<!-- source-attribution -->
> **非官方繁體中文翻譯** · Spring Boot 4.1.1 · 翻譯日期：2026-10-21  
> [官方英文網站](https://docs.spring.io/spring-boot/4.1/reference/data/sql.html) · [固定版本英文來源](https://github.com/spring-projects/spring-boot/blob/v4.1.1/documentation/spring-boot-docs/src/docs/antora/modules/reference/pages/data/sql.adoc) · [本地原文快照](../sources/spring-boot/documentation/spring-boot-docs/src/docs/antora/modules/reference/pages/data/sql.adoc)  
> 原始作者與授權見 [來源聲明](../NOTICE.md)。官方範例及設定鍵保留原文，額外圖解另標示為譯者補充。

<!-- translation-status: translated -->

[Spring Framework][data--sql-r1] 為 SQL 資料庫提供廣泛支援，從使用 [`JdbcClient`][data--sql-r2] 或 [`JdbcTemplate`][data--sql-r3] 直接進行 JDBC 存取，到 Hibernate 等完整的「物件關聯對映」技術。
[Spring Data][data--sql-r4] 提供更高一層的功能：直接從介面建立 [`Repository`][data--sql-r5] 實作，並依慣例從方法名稱產生查詢。

## 設定 DataSource

Java 的 [`DataSource`][data--sql-r6] 介面提供操作資料庫連線的標準方式。
傳統上，[`DataSource`][data--sql-r6] 使用 `URL` 與一些憑證建立資料庫連線。

> **提示：**
>
> 更多進階範例，尤其是完全掌控 DataSource 設定的方式，請參閱「How-to Guides」的[設定自訂 DataSource][data--sql-r7] 章節。

### 內嵌資料庫支援

開發應用程式時，使用記憶體內的內嵌資料庫通常很方便。
顯然，記憶體內資料庫不提供持久化儲存。
你需要在應用程式啟動時填入資料，並做好應用程式結束時資料會被捨棄的準備。

> **提示：**
>
> 「How-to Guides」包含[如何初始化資料庫][data--sql-r8]的章節。

Spring Boot 可以自動設定內嵌 [H2][data--sql-r9]、[HSQL][data--sql-r10] 與 [Derby][data--sql-r11]（已棄用）資料庫。
不需要提供任何連線 URL。
只需要在建置相依項中加入要使用的內嵌資料庫。
若 classpath 上有多個內嵌資料庫，可設定 `spring.datasource.embedded-database-connection` 屬性，控制使用哪個。
將此屬性設為 `none`，會停用內嵌資料庫自動設定。

> **注意：**
>
> 若在測試中使用此功能，可能會發現無論使用多少個應用程式上下文，整個測試套件都重用同一個資料庫。
> 若要確保每個上下文都有獨立的內嵌資料庫，請將 `spring.datasource.generate-unique-name` 設為 `true`。

例如，典型 POM 相依項如下：

```xml
<dependency>
	<groupId>org.springframework.boot</groupId>
	<artifactId>spring-boot-starter-data-jpa</artifactId>
</dependency>
<dependency>
	<groupId>org.hsqldb</groupId>
	<artifactId>hsqldb</artifactId>
	<scope>runtime</scope>
</dependency>
```

> **注意：**
>
> 必須依賴 `spring-jdbc`，才能自動設定內嵌資料庫。
> 此範例透過 `spring-boot-starter-data-jpa` 的遞移相依性帶入它。

> **提示：**
>
> 如果因任何理由自行設定內嵌資料庫的連線 URL，請務必停用資料庫的自動關閉。
> 使用 H2 時，應設定 `DB_CLOSE_ON_EXIT=FALSE`。
> 使用 HSQLDB 時，應確保沒有使用 `shutdown=true`。
> 停用資料庫自動關閉，能讓 Spring Boot 控制關閉時機，確保在不再需要存取資料庫後才關閉。

### 連線至正式環境資料庫

正式環境資料庫連線，也可以透過使用連線池的 [`DataSource`][data--sql-r6] 自動設定。

### DataSource 設定

DataSource 設定由 `spring.datasource.*` 下的外部設定屬性控制。
例如，可以在 `application.properties` 宣告下列內容：

```properties
spring.datasource.url=jdbc:mysql://localhost/test
spring.datasource.username=dbuser
spring.datasource.password=dbpass
```

```yaml
spring:
  datasource:
    url: "jdbc:mysql://localhost/test"
    username: "dbuser"
    password: "dbpass"
```

> **注意：**
>
> 至少應透過 `spring.datasource.url` 屬性指定 URL。
> 否則 Spring Boot 會嘗試自動設定內嵌資料庫。

> **提示：**
>
> Spring Boot 能從 URL 推斷大多數資料庫的 JDBC 驅動程式類別。
> 若需要指定特定類別，可以使用 `spring.datasource.driver-class-name` 屬性。

> **注意：**
>
> 建立使用連線池的 [`DataSource`][data--sql-r6] 前，必須能確認有效的 [`Driver`][data--sql-r12] 類別存在，因此會先進行此檢查。
> 換句話說，如果設定 `spring.datasource.driver-class-name=com.mysql.jdbc.Driver`，該類別就必須能夠載入。

其他支援選項請參閱 [`DataSourceProperties`][data--sql-r13] API 文件。
這些標準選項不受[實際實作][data--sql-r14]影響。
也可以使用各自的前綴（`spring.datasource.hikari.*`、`spring.datasource.tomcat.*`、`spring.datasource.dbcp2.*` 與 `spring.datasource.oracleucp.*`），微調實作專屬設定。
詳情請參閱所使用連線池實作的文件。

例如，若使用 [Tomcat 連線池][data--sql-r15]，可以自訂許多額外設定，如下例所示：

```properties
spring.datasource.tomcat.max-wait=10000
spring.datasource.tomcat.max-active=50
spring.datasource.tomcat.test-on-borrow=true
```

```yaml
spring:
  datasource:
    tomcat:
      max-wait: 10000
      max-active: 50
      test-on-borrow: true
```

這會讓連線池在沒有可用連線時等待 10000 毫秒才拋出例外，將連線數上限設為 50，並在從池中借出連線前驗證它。

### 支援的連線池

Spring Boot 使用下列演算法選擇特定實作：

1. 我們因效能與並行能力而優先選擇 [HikariCP][data--sql-r16]。
   只要 HikariCP 可用，就一定選它。
2. 否則，如果 Tomcat 的連線池 [`DataSource`][data--sql-r6] 可用，就使用它。
3. 否則，如果 [Commons DBCP2][data--sql-r17] 可用，就使用它。
4. 若 HikariCP、Tomcat 與 DBCP2 都不可用，但 Oracle UCP 可用，就使用 Oracle UCP。

> **注意：**
>
> 若使用 `spring-boot-starter-jdbc` 或 `spring-boot-starter-data-jpa` starter，就會自動取得 HikariCP 相依項。

你可以設定 `spring.datasource.type` 屬性，完全略過此演算法，直接指定連線池。
如果應用程式在 Tomcat 容器中執行，這點尤其重要，因為預設就會提供 `tomcat-jdbc`。

其他連線池隨時都可以使用 [`DataSourceBuilder`][data--sql-r18] 手動設定。
若自行定義 [`DataSource`][data--sql-r6] Bean，就不會進行自動設定。
[`DataSourceBuilder`][data--sql-r18] 支援下列連線池／資料來源：

- HikariCP
- Tomcat 連線池 [`DataSource`][data--sql-r6]
- Commons DBCP2
- Oracle UCP 與 `OracleDataSource`
- Spring Framework 的 [`SimpleDriverDataSource`][data--sql-r19]
- H2 [`JdbcDataSource`][data--sql-r20]
- PostgreSQL [`PGSimpleDataSource`][data--sql-r21]
- C3P0
- Vibur

### 連線至 JNDI DataSource

如果將 Spring Boot 應用程式部署到應用程式伺服器，可能會希望使用伺服器內建功能設定與管理 DataSource，並透過 JNDI 存取。

`spring.datasource.jndi-name` 屬性可替代 `spring.datasource.url`、`spring.datasource.username` 與 `spring.datasource.password`，從特定 JNDI 位置存取 [`DataSource`][data--sql-r6]。
例如，下列 `application.properties` 內容展示如何存取 JBoss AS 定義的 [`DataSource`][data--sql-r6]：

```properties
spring.datasource.jndi-name=java:jboss/datasources/customers
```

```yaml
spring:
  datasource:
    jndi-name: "java:jboss/datasources/customers"
```

### 延遲連線代理

當自動設定使用連線池的 `DataSource` 時，可將 `spring.datasource.connection-fetch` 設為 `lazy`，以代理包裝它，盡可能延後取得 JDBC 連線，如下例所示：

```properties
spring.datasource.connection-fetch=lazy
```

```yaml
spring:
  datasource:
    connection-fetch: "lazy"
```

啟用此功能後，只有真正需要時才會從池中取得 JDBC Connection。
JDBC 交易控制可以在尚未從池中取得 Connection，也尚未與資料庫通訊時進行；這些動作會延遲到第一次建立 JDBC Statement 時才執行。
若要存取目標自動設定 `DataSource`，請使用 `DataSource.unwrap`。

> **提示：**
>
> 如果使用 `TransactionAwareDataSourceProxy` 包裝目標 `DataSource`，請確保透過順序值為正數的 `BeanPostProcessor` 執行。

詳情請參閱 [`LazyConnectionDataSourceProxy`][data--sql-r22]。

## 使用 JdbcTemplate

Spring 的 [`JdbcTemplate`][data--sql-r3] 與 [`NamedParameterJdbcTemplate`][data--sql-r23] 類別會自動設定，你可以直接將它們自動注入自己的 Bean，如下例所示：

```kotlin
import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.stereotype.Component

@Component
class MyBean(private val jdbcTemplate: JdbcTemplate) {

	fun doSomething() {
		jdbcTemplate.execute("delete from customer")
	}

}
```

```java
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
public class MyBean {

	private final JdbcTemplate jdbcTemplate;

	public MyBean(JdbcTemplate jdbcTemplate) {
		this.jdbcTemplate = jdbcTemplate;
	}

	public void doSomething() {
		this.jdbcTemplate ...
	}

}
```

你可以使用 `spring.jdbc.template.*` 屬性自訂範本的部分屬性，如下例所示：

```properties
spring.jdbc.template.max-rows=500
```

```yaml
spring:
  jdbc:
    template:
      max-rows: 500
```

若需要調整 SQL 例外轉換，可以定義自己的 `SQLExceptionTranslator` Bean，使其與自動設定的 `JdbcTemplate` 關聯。

> **注意：**
>
> [`NamedParameterJdbcTemplate`][data--sql-r23] 在底層重用相同的 [`JdbcTemplate`][data--sql-r3] 實例。
> 如果定義了多個 [`JdbcTemplate`][data--sql-r3]，又沒有主要候選，就不會自動設定 [`NamedParameterJdbcTemplate`][data--sql-r23]。

## 使用 JdbcClient

Spring 的 [`JdbcClient`][data--sql-r2] 會依據 [`NamedParameterJdbcTemplate`][data--sql-r23] 的存在而自動設定。
你也可以直接將它注入自己的 Bean，如下例所示：

```kotlin
import org.springframework.jdbc.core.simple.JdbcClient
import org.springframework.stereotype.Component

@Component
class MyBean(private val jdbcClient: JdbcClient) {

	fun doSomething() {
		jdbcClient.sql("delete from customer").update()
	}

}
```

```java
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Component;

@Component
public class MyBean {

	private final JdbcClient jdbcClient;

	public MyBean(JdbcClient jdbcClient) {
		this.jdbcClient = jdbcClient;
	}

	public void doSomething() {
		this.jdbcClient ...
	}

}
```

若依賴自動設定建立下層 [`JdbcTemplate`][data--sql-r3]，透過 `spring.jdbc.template.*` 屬性做的任何自訂，也會反映在用戶端。

## JPA 與 Spring Data JPA

Java Persistence API 是將物件「對映」到關聯式資料庫的標準技術。
`spring-boot-starter-data-jpa` POM 提供快速入門方式。
它提供下列主要相依項：

- Hibernate：最受歡迎的 JPA 實作之一。
- Spring Data JPA：協助實作以 JPA 為基礎的儲存庫。
- Spring ORM：Spring Framework 的核心 ORM 支援。

> **提示：**
>
> 此處不深入說明 JPA 或 [Spring Data][data--sql-r4]。
> 你可以跟著 [spring.io][data--sql-r25] 的[使用 JPA 存取資料][data--sql-r24]指南操作，並閱讀 [Spring Data JPA][data--sql-r26] 與 [Hibernate][data--sql-r27] 參考文件。

### 實體類別

傳統上，JPA「實體」類別指定於 `persistence.xml` 檔。
使用 Spring Boot 時不需要此檔，而改用「實體掃描」。
預設會掃描[自動設定套件][data--sql-r28]。

任何標註 [`@Entity`][data--sql-r29]、[`@Embeddable`][data--sql-r30] 或 [`@MappedSuperclass`][data--sql-r31] 的類別都會納入考量。
典型實體類別如下例：

```kotlin
import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.GeneratedValue
import jakarta.persistence.Id
import java.io.Serializable

@Entity
class City : Serializable {

	@Id
	@GeneratedValue
	private val id: Long? = null

	@Column(nullable = false)
	var name: String? = null
		private set

	// ... etc
	@Column(nullable = false)
	var state: String? = null
		private set

	// ... additional members, often include @OneToMany mappings

	protected constructor() {
		// no-args constructor required by JPA spec
		// this one is protected since it should not be used directly
	}

	constructor(name: String?, state: String?) {
		this.name = name
		this.state = state
	}

}
```

```java
import java.io.Serializable;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;

@Entity
public class City implements Serializable {

	@Id
	@GeneratedValue
	private Long id;

	@Column(nullable = false)
	private String name;

	@Column(nullable = false)
	private String state;

	// ... additional members, often include @OneToMany mappings

	protected City() {
		// no-args constructor required by JPA spec
		// this one is protected since it should not be used directly
	}

	public City(String name, String state) {
		this.name = name;
		this.state = state;
	}

	public String getName() {
		return this.name;
	}

	public String getState() {
		return this.state;
	}

	// ... etc

}
```

> **提示：**
>
> 你可以使用 [`@EntityScan`][data--sql-r32] 註解自訂實體掃描位置。
> 請參閱「How-to Guides」的[將 @Entity 定義與 Spring 設定分開][data--sql-r33]章節。

### Spring Data JPA 儲存庫

[Spring Data JPA][data--sql-r26] 儲存庫是你可以定義來存取資料的介面。
JPA 查詢會從方法名稱自動建立。
例如，`CityRepository` 介面可以宣告 `findAllByState(String state)`，尋找特定州的所有城市。

對於較複雜的查詢，可以在方法上標註 Spring Data 的 [`Query`][data--sql-r34] 註解。

Spring Data 儲存庫通常繼承 [`Repository`][data--sql-r5] 或 [`CrudRepository`][data--sql-r35] 介面。
若使用自動設定，會在[自動設定套件][data--sql-r28]中搜尋儲存庫。

> **提示：**
>
> 可以使用 [`@EnableJpaRepositories`][data--sql-r36] 自訂儲存庫搜尋位置。

下例展示典型的 Spring Data 儲存庫介面定義：

```kotlin
import org.springframework.boot.docs.data.sql.jpaandspringdata.entityclasses.City
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.repository.Repository

interface CityRepository : Repository<City, Long> {

	fun findAll(pageable: Pageable?): Page<City>?

	fun findByNameAndStateAllIgnoringCase(name: String?, state: String?): City?

}
```

```java
import org.springframework.boot.docs.data.sql.jpaandspringdata.entityclasses.City;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.repository.Repository;

public interface CityRepository extends Repository<City, Long> {

	Page<City> findAll(Pageable pageable);

	City findByNameAndStateAllIgnoringCase(String name, String state);

}
```

Spring Data JPA 儲存庫支援三種啟動模式：default、deferred 與 lazy。
若要啟用延後或延遲啟動，請分別將 `spring.data.jpa.repositories.bootstrap-mode` 屬性設為 `deferred` 或 `lazy`。
使用延後啟動時，自動設定的 [`EntityManagerFactoryBuilder`][data--sql-r37] 需要啟動執行器；若能確定上下文中的 [`AsyncTaskExecutor`][data--sql-r38]，就會使用它。
若存在多個，會使用名為 `applicationTaskExecutor` 的執行器。

> **注意：**
>
> 使用延後或延遲啟動時，務必將任何 JPA 基礎設施存取，延後到應用程式上下文啟動階段之後。
> 可以使用 [`SmartInitializingSingleton`][data--sql-r39]，呼叫需要 JPA 基礎設施的初始化程序。
> 對於以 Spring Bean 建立的 JPA 元件（例如轉換器），若有相依項，請使用 [`ObjectProvider`][data--sql-r40] 延遲解析。

> **提示：**
>
> 此處僅觸及 Spring Data JPA 的表面。
> 完整細節請參閱 [Spring Data JPA 參考文件][data--sql-r41]。

### Spring Data Envers 儲存庫

若有 [Spring Data Envers][data--sql-r42]，JPA 儲存庫就會自動設定為支援典型 Envers 查詢。

若要使用 Spring Data Envers，請確保儲存庫繼承 [`RevisionRepository`][data--sql-r43]，如下例所示：

```kotlin
import org.springframework.boot.docs.data.sql.jpaandspringdata.entityclasses.Country
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.repository.Repository
import org.springframework.data.repository.history.RevisionRepository

interface CountryRepository :
		RevisionRepository<Country, Long, Int>,
		Repository<Country, Long> {

	fun findAll(pageable: Pageable?): Page<Country>?

}
```

```java
import org.springframework.boot.docs.data.sql.jpaandspringdata.entityclasses.Country;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.repository.Repository;
import org.springframework.data.repository.history.RevisionRepository;

public interface CountryRepository extends RevisionRepository<Country, Long, Integer>, Repository<Country, Long> {

	Page<Country> findAll(Pageable pageable);

}
```

> **注意：**
>
> 詳情請參閱 [Spring Data Envers 參考文件][data--sql-r44]。

### 建立與移除 JPA 資料庫

預設**只有**使用內嵌資料庫時，才會自動建立 JPA 資料庫，也就是 H2、HSQL 或 Derby（已棄用）。
可以透過 `spring.jpa.*` 屬性明確設定 JPA。
例如，若要建立與移除資料表，可以在 `application.properties` 加入下列設定：

```properties
spring.jpa.hibernate.ddl-auto=create-drop
```

```yaml
spring:
  jpa:
    hibernate.ddl-auto: "create-drop"
```

> **注意：**
>
> Hibernate 內部對應的屬性名稱為 `hibernate.hbm2ddl.auto`（如果你比較熟悉這個名稱）。
> 可透過 `spring.jpa.properties.*` 設定它與其他 Hibernate 原生屬性；加入實體管理器之前會移除該前綴。
> 下列內容展示如何設定 Hibernate 的 JPA 屬性：

```properties
spring.jpa.properties.hibernate.globally_quoted_identifiers=true
```

```yaml
spring:
  jpa:
    properties:
      hibernate:
        "globally_quoted_identifiers": "true"
```

上例將 `hibernate.globally_quoted_identifiers` 屬性的 `true` 值傳給 Hibernate 實體管理器。

預設 DDL 執行（或驗證）會延後到 [`ApplicationContext`][data--sql-r45] 啟動後。

### 在檢視中保持 EntityManager 開啟

如果執行 Web 應用程式，Spring Boot 預設會註冊 [`OpenEntityManagerInViewInterceptor`][data--sql-r46]，套用「Open EntityManager in View」模式，允許在 Web 檢視中延遲載入。
若不想採用此行為，請在 `application.properties` 將 `spring.jpa.open-in-view` 設為 `false`。

## Spring Data JDBC

Spring Data 包含 JDBC 儲存庫支援，會為 [`CrudRepository`][data--sql-r35] 上的方法自動產生 SQL。
對於更進階的查詢，則提供 [`@Query`][data--sql-r47] 註解。

當 classpath 上有所需相依項時，Spring Boot 會自動設定 Spring Data JDBC 儲存庫。
只要加入 `spring-boot-starter-data-jdbc` 這個相依項即可。
必要時，可以在應用程式加入 [`@EnableJdbcRepositories`][data--sql-r48] 註解，或 [`AbstractJdbcConfiguration`][data--sql-r49] 子類別，自行掌控 Spring Data JDBC 設定。

若搭配[預先處理（AOT）][data--sql-r50]使用 Spring Data JDBC（目標為 JVM 或原生映像），建議進行額外設定。
若要避免 AOT 處理期間需要資料庫連線，請定義適合應用程式資料庫的 `JdbcDialect` Bean。
例如，若使用 Postgres，請定義 `JdbcPostgresDialect` Bean。

> **提示：**
>
> Spring Data JDBC 的完整細節，請參閱[參考文件][data--sql-r51]。

## 使用 H2 Web 主控台

[H2 資料庫][data--sql-r9]提供[瀏覽器主控台][data--sql-r52]，Spring Boot 可以為你自動設定。
符合下列條件時，就會自動設定主控台：

- 你正在開發 Servlet 型 Web 應用程式。
- classpath 上有 `org.springframework.boot:spring-boot-h2console`。
- 你正在使用 [Spring Boot 開發工具][data--sql-r53]。

> **提示：**
>
> 如果沒使用 Spring Boot 開發工具，但仍想使用 H2 主控台，可將 `spring.h2.console.enabled` 屬性設為 `true`。

> **注意：**
>
> H2 主控台只供開發期間使用，因此請確保正式環境不會將 `spring.h2.console.enabled` 設為 `true`。

### 修改 H2 主控台路徑

預設主控台位於 `/h2-console`。
可使用 `spring.h2.console.path` 屬性自訂路徑。

### 在受保護的應用程式中存取 H2 主控台

H2 主控台使用框架頁面（frames），而且因僅供開發使用，沒有實作 CSRF 防護措施。
若應用程式使用 Spring Security，需要設定：

- 對主控台請求停用 CSRF 防護。
- 對主控台回應，將 `X-Frame-Options` 標頭設為 `SAMEORIGIN`。

更多 [CSRF][data--sql-r54] 與 [X-Frame-Options][data--sql-r55] 標頭資訊，請參閱 Spring Security 參考指南。

簡單設定中，可以使用如下的 [`SecurityFilterChain`][data--sql-r56]：

```kotlin
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.context.annotation.Profile
import org.springframework.core.Ordered
import org.springframework.core.annotation.Order
import org.springframework.security.config.Customizer
import org.springframework.security.config.annotation.web.builders.HttpSecurity
import org.springframework.security.web.SecurityFilterChain

@Profile("dev")
@Configuration(proxyBeanMethods = false)
class DevProfileSecurityConfiguration {

	@Bean
	@Order(Ordered.HIGHEST_PRECEDENCE)
	fun h2ConsoleSecurityFilterChain(http: HttpSecurity): SecurityFilterChain {
		return http.authorizeHttpRequests(yourCustomAuthorization())
			.csrf { csrf -> csrf.disable() }
			.headers { headers -> headers.frameOptions { frameOptions -> frameOptions.sameOrigin() } }
			.build()
	}

}
```

```java
import org.springframework.boot.security.autoconfigure.web.servlet.PathRequest;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.CsrfConfigurer;
import org.springframework.security.config.annotation.web.configurers.HeadersConfigurer.FrameOptionsConfig;
import org.springframework.security.web.SecurityFilterChain;

@Profile("dev")
@Configuration(proxyBeanMethods = false)
public class DevProfileSecurityConfiguration {

	@Bean
	@Order(Ordered.HIGHEST_PRECEDENCE)
	SecurityFilterChain h2ConsoleSecurityFilterChain(HttpSecurity http) {
		http.securityMatcher(PathRequest.toH2Console());
		http.authorizeHttpRequests(yourCustomAuthorization());
		http.csrf(CsrfConfigurer::disable);
		http.headers((headers) -> headers.frameOptions(FrameOptionsConfig::sameOrigin));
		return http.build();
	}

}
```

> **警告：**
>
> H2 主控台只供開發期間使用。
> 正式環境中，對網站停用 CSRF 防護或允許 frames，可能產生嚴重安全風險。

> **提示：**
>
> 即使主控台路徑經過自訂，`PathRequest.toH2Console()` 也會回傳正確的請求比對器。

## 使用 jOOQ

jOOQ Object Oriented Querying（[jOOQ][data--sql-r57]）是 [Data Geekery][data--sql-r58] 的熱門產品，從資料庫產生 Java 程式碼，讓你透過流暢 API 建立型別安全的 SQL 查詢。
商業版與開源版都能搭配 Spring Boot。
jOOQ 需要 Java 21 或更新版本。

### 程式碼產生

若要使用 jOOQ 型別安全查詢，需要從資料庫綱要產生 Java 類別。
可以依照 [jOOQ 使用手冊][data--sql-r59]的指示操作。
若使用 `jooq-codegen-maven` 外掛，且也使用 `spring-boot-starter-parent` 父 POM，就可以安全省略外掛的 `<version>` 標籤。
也可以使用 Spring Boot 定義的版本變數（例如 `h2.version`），宣告外掛的資料庫相依項。
下列清單展示範例：

```xml
<plugin>
	<groupId>org.jooq</groupId>
	<artifactId>jooq-codegen-maven</artifactId>
	<executions>
		...
	</executions>
	<dependencies>
		<dependency>
			<groupId>com.h2database</groupId>
			<artifactId>h2</artifactId>
			<version>${h2.version}</version>
		</dependency>
	</dependencies>
	<configuration>
		<jdbc>
			<driver>org.h2.Driver</driver>
			<url>jdbc:h2:~/yourdatabase</url>
		</jdbc>
		<generator>
			...
		</generator>
	</configuration>
</plugin>
```

### 使用 DSLContext

jOOQ 的流暢 API 透過 [`DSLContext`][data--sql-r60] 介面啟動。
Spring Boot 會將 [`DSLContext`][data--sql-r60] 自動設定為 Spring Bean，並連接到應用程式的 [`DataSource`][data--sql-r6]。
若要使用 [`DSLContext`][data--sql-r60]，可以將它注入，如下例所示：

```kotlin
import org.jooq.DSLContext
import org.springframework.stereotype.Component
import java.util.GregorianCalendar

@Component
class MyBean(private val create: DSLContext) {

}
```

```java
import java.util.GregorianCalendar;
import java.util.List;

import org.jooq.DSLContext;

import org.springframework.stereotype.Component;

import static org.springframework.boot.docs.data.sql.jooq.dslcontext.Tables.AUTHOR;

@Component
public class MyBean {

	private final DSLContext create;

	public MyBean(DSLContext dslContext) {
		this.create = dslContext;
	}

}
```

> **提示：**
>
> jOOQ 手冊通常使用名為 `create` 的變數保存 [`DSLContext`][data--sql-r60]。

接著可以使用 [`DSLContext`][data--sql-r60] 建構查詢，如下例所示：

```kotlin
	fun authorsBornAfter1980(): List<GregorianCalendar> {
		return create.selectFrom<Tables.TAuthorRecord>(Tables.AUTHOR)
			.where(Tables.AUTHOR?.DATE_OF_BIRTH?.greaterThan(GregorianCalendar(1980, 0, 1)))
			.fetch(Tables.AUTHOR?.DATE_OF_BIRTH)
	}
```

```java
	public List<GregorianCalendar> authorsBornAfter1980() {
		return this.create.selectFrom(AUTHOR)
			.where(AUTHOR.DATE_OF_BIRTH.greaterThan(new GregorianCalendar(1980, 0, 1)))
			.fetch(AUTHOR.DATE_OF_BIRTH);
```

### jOOQ SQL 方言

除非已設定 `spring.jooq.sql-dialect` 屬性，否則 Spring Boot 會替資料來源判斷要使用的 SQL 方言。
若無法偵測方言，會使用 `DEFAULT`。

> **注意：**
>
> Spring Boot 只能自動設定 jOOQ 開源版支援的方言。

### 自訂 jOOQ

你可以定義自己的 [`DefaultConfigurationCustomizer`][data--sql-r61] Bean 進行進階自訂；它會在建立 [`Configuration`][data--sql-r62] [`@Bean`][data--sql-r63] 前被呼叫。
這些自訂優先於自動設定套用的內容。

若要完全掌控 jOOQ 設定，也可以自行建立 [`Configuration`][data--sql-r62] [`@Bean`][data--sql-r63]。

## 使用 R2DBC

Reactive Relational Database Connectivity（[R2DBC][data--sql-r64]）專案將反應式程式設計 API 帶到關聯式資料庫。
R2DBC 的 [`Connection`][data--sql-r65] 提供操作非阻塞資料庫連線的標準方式。
連線透過 [`ConnectionFactory`][data--sql-r66] 提供，類似 JDBC 的 [`DataSource`][data--sql-r6]。

[`ConnectionFactory`][data--sql-r66] 設定由 `spring.r2dbc.*` 下的外部設定屬性控制。
例如，可以在 `application.properties` 宣告下列內容：

```properties
spring.r2dbc.url=r2dbc:postgresql://localhost/test
spring.r2dbc.username=dbuser
spring.r2dbc.password=dbpass
```

```yaml
spring:
  r2dbc:
    url: "r2dbc:postgresql://localhost/test"
    username: "dbuser"
    password: "dbpass"
```

> **提示：**
>
> 不需要指定驅動程式類別名稱，因為 Spring Boot 會透過 R2DBC 的 Connection Factory 探索機制取得驅動程式。

> **注意：**
>
> 至少應提供 URL。
> URL 中指定的資訊優先於個別屬性，也就是 `name`、`username`、`password` 與連線池選項。

> **提示：**
>
> 「How-to Guides」包含[如何初始化資料庫][data--sql-r67]的章節。

若要自訂 [`ConnectionFactory`][data--sql-r66] 建立的連線，也就是設定不想（或無法）放在集中式資料庫設定中的特定參數，可以使用 [`ConnectionFactoryOptionsBuilderCustomizer`][data--sql-r68] [`@Bean`][data--sql-r63]。
下例展示手動覆寫資料庫連接埠，而其他選項仍取自應用程式設定：

```kotlin
import io.r2dbc.spi.ConnectionFactoryOptions
import org.springframework.boot.r2dbc.autoconfigure.ConnectionFactoryOptionsBuilderCustomizer
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration

@Configuration(proxyBeanMethods = false)
class MyR2dbcConfiguration {

	@Bean
	fun connectionFactoryPortCustomizer(): ConnectionFactoryOptionsBuilderCustomizer {
		return ConnectionFactoryOptionsBuilderCustomizer { builder ->
			builder.option(ConnectionFactoryOptions.PORT, 5432)
		}
	}

}
```

```java
import io.r2dbc.spi.ConnectionFactoryOptions;

import org.springframework.boot.r2dbc.autoconfigure.ConnectionFactoryOptionsBuilderCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration(proxyBeanMethods = false)
public class MyR2dbcConfiguration {

	@Bean
	public ConnectionFactoryOptionsBuilderCustomizer connectionFactoryPortCustomizer() {
		return (builder) -> builder.option(ConnectionFactoryOptions.PORT, 5432);
	}

}
```

下例展示如何設定一些 PostgreSQL 連線選項：

```kotlin
import io.r2dbc.postgresql.PostgresqlConnectionFactoryProvider
import org.springframework.boot.r2dbc.autoconfigure.ConnectionFactoryOptionsBuilderCustomizer
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration

@Configuration(proxyBeanMethods = false)
class MyPostgresR2dbcConfiguration {

	@Bean
	fun postgresCustomizer(): ConnectionFactoryOptionsBuilderCustomizer {
		val options: MutableMap<String, String> = HashMap()
		options["lock_timeout"] = "30s"
		options["statement_timeout"] = "60s"
		return ConnectionFactoryOptionsBuilderCustomizer { builder ->
			builder.option(PostgresqlConnectionFactoryProvider.OPTIONS, options)
		}
	}

}
```

```java
import java.util.HashMap;
import java.util.Map;

import io.r2dbc.postgresql.PostgresqlConnectionFactoryProvider;

import org.springframework.boot.r2dbc.autoconfigure.ConnectionFactoryOptionsBuilderCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration(proxyBeanMethods = false)
public class MyPostgresR2dbcConfiguration {

	@Bean
	public ConnectionFactoryOptionsBuilderCustomizer postgresCustomizer() {
		Map<String, String> options = new HashMap<>();
		options.put("lock_timeout", "30s");
		options.put("statement_timeout", "60s");
		return (builder) -> builder.option(PostgresqlConnectionFactoryProvider.OPTIONS, options);
	}

}
```

存在 [`ConnectionFactory`][data--sql-r66] Bean 時，一般 JDBC [`DataSource`][data--sql-r6] 自動設定會退讓。
若想保留 JDBC [`DataSource`][data--sql-r6] 自動設定，且能接受在反應式應用程式中使用阻塞 JDBC API 的風險，可以在應用程式的 [`@Configuration`][data--sql-r69] 類別加入 `@Import(DataSourceAutoConfiguration.class)`，重新啟用。

### 內嵌資料庫支援

與 [JDBC 支援][data--sql-r70]類似，Spring Boot 可以自動設定供反應式使用的內嵌資料庫。
不需要提供連線 URL。
只要加入要使用的內嵌資料庫建置相依項，如下例所示：

```xml
<dependency>
	<groupId>io.r2dbc</groupId>
	<artifactId>r2dbc-h2</artifactId>
	<scope>runtime</scope>
</dependency>
```

> **注意：**
>
> 若在測試中使用此功能，可能會發現無論使用多少個應用程式上下文，整個測試套件都重用同一個資料庫。
> 若要確保每個上下文都有獨立的內嵌資料庫，請將 `spring.r2dbc.generate-unique-name` 設為 `true`。

### 使用 DatabaseClient

[`DatabaseClient`][data--sql-r71] Bean 會自動設定，你可以直接將它自動注入自己的 Bean，如下例所示：

```kotlin
import org.springframework.r2dbc.core.DatabaseClient
import org.springframework.stereotype.Component
import reactor.core.publisher.Flux

@Component
class MyBean(private val databaseClient: DatabaseClient) {

	// ...

	fun someMethod(): Flux<Map<String, Any>> {
		return databaseClient.sql("select * from user").fetch().all()
	}

}
```

```java
import java.util.Map;

import reactor.core.publisher.Flux;

import org.springframework.r2dbc.core.DatabaseClient;
import org.springframework.stereotype.Component;

@Component
public class MyBean {

	private final DatabaseClient databaseClient;

	public MyBean(DatabaseClient databaseClient) {
		this.databaseClient = databaseClient;
	}

	// ...

	public Flux<Map<String, Object>> someMethod() {
		return this.databaseClient.sql("select * from user").fetch().all();
	}

}
```

### Spring Data R2DBC 儲存庫

[Spring Data R2DBC][data--sql-r72] 儲存庫是你可以定義來存取資料的介面。
查詢會從方法名稱自動建立。
例如，`CityRepository` 介面可以宣告 `findAllByState(String state)`，尋找特定州的所有城市。

對於較複雜的查詢，可以在方法上標註 Spring Data 的 [`@Query`][data--sql-r73] 註解。

Spring Data 儲存庫通常繼承 [`Repository`][data--sql-r5] 或 [`CrudRepository`][data--sql-r35] 介面。
若使用自動設定，會在[自動設定套件][data--sql-r28]中搜尋儲存庫。

下例展示典型 Spring Data 儲存庫介面定義：

```kotlin
import org.springframework.data.repository.Repository
import reactor.core.publisher.Mono

interface CityRepository : Repository<City, Long> {

	fun findByNameAndStateAllIgnoringCase(name: String, state: String): Mono<City>

}
```

```java
import reactor.core.publisher.Mono;

import org.springframework.data.repository.Repository;

public interface CityRepository extends Repository<City, Long> {

	Mono<City> findByNameAndStateAllIgnoringCase(String name, String state);

}
```

> **提示：**
>
> 此處僅觸及 Spring Data R2DBC 的表面。完整細節請參閱 [Spring Data R2DBC 參考文件][data--sql-r51]。

## 譯者補充：相似抽象不代表可混用的執行模型

```mermaid
flowchart LR
  J[JdbcClient 或 JdbcTemplate 或 JPA] --> D[DataSource]
  D --> P[JDBC 連線池]
  P --> DB[(關聯式資料庫)]
  R[DatabaseClient 或 R2DBC Repository] --> F[ConnectionFactory]
  F --> DB
```

上方是 JDBC 路線，下方是 R2DBC 路線；選擇反應式 API 時，也需要相應的非阻塞資料庫驅動程式。

[data--sql-r1]: https://spring.io/projects/spring-framework
[data--sql-r2]: https://docs.spring.io/spring-framework/docs/7.0.x/javadoc-api/org/springframework/jdbc/core/simple/JdbcClient.html
[data--sql-r3]: https://docs.spring.io/spring-framework/docs/7.0.x/javadoc-api/org/springframework/jdbc/core/JdbcTemplate.html
[data--sql-r4]: https://spring.io/projects/spring-data
[data--sql-r5]: https://docs.spring.io/spring-data/commons/docs/4.1.x/api/org/springframework/data/repository/Repository.html
[data--sql-r6]: https://docs.oracle.com/en/java/javase/17/docs/api/java.sql/javax/sql/DataSource.html
[data--sql-r7]: https://docs.spring.io/spring-boot/4.1/how-to/data-access.html#howto.data-access.configure-custom-datasource
[data--sql-r8]: https://docs.spring.io/spring-boot/4.1/how-to/data-initialization.html
[data--sql-r9]: https://www.h2database.com
[data--sql-r10]: https://hsqldb.org/
[data--sql-r11]: https://db.apache.org/derby/
[data--sql-r12]: https://docs.oracle.com/en/java/javase/17/docs/api/java.sql/java/sql/Driver.html
[data--sql-r13]: https://docs.spring.io/spring-boot/4.1.1/api/java/org/springframework/boot/jdbc/autoconfigure/DataSourceProperties.html
[data--sql-r14]: https://docs.spring.io/spring-boot/4.1/reference/data/sql.html#data.sql.datasource.connection-pool
[data--sql-r15]: https://tomcat.apache.org/tomcat-11.0-doc/jdbc-pool.html#Common_Attributes
[data--sql-r16]: https://github.com/brettwooldridge/HikariCP
[data--sql-r17]: https://commons.apache.org/proper/commons-dbcp/
[data--sql-r18]: https://docs.spring.io/spring-boot/4.1.1/api/java/org/springframework/boot/jdbc/DataSourceBuilder.html
[data--sql-r19]: https://docs.spring.io/spring-framework/docs/7.0.x/javadoc-api/org/springframework/jdbc/datasource/SimpleDriverDataSource.html
[data--sql-r20]: https://www.h2database.com/javadoc/org/h2/jdbcx/JdbcDataSource.html
[data--sql-r21]: https://jdbc.postgresql.org/documentation/publicapi/org/postgresql/ds/PGSimpleDataSource.html
[data--sql-r22]: https://docs.spring.io/spring-framework/docs/7.0.x/javadoc-api/org/springframework/jdbc/datasource/LazyConnectionDataSourceProxy.html
[data--sql-r23]: https://docs.spring.io/spring-framework/docs/7.0.x/javadoc-api/org/springframework/jdbc/core/namedparam/NamedParameterJdbcTemplate.html
[data--sql-r24]: https://spring.io/guides/gs/accessing-data-jpa/
[data--sql-r25]: https://spring.io
[data--sql-r26]: https://spring.io/projects/spring-data-jpa
[data--sql-r27]: https://hibernate.org/orm/documentation/
[data--sql-r28]: https://docs.spring.io/spring-boot/4.1/reference/using/auto-configuration.html#using.auto-configuration.packages
[data--sql-r29]: https://jakarta.ee/specifications/persistence/3.2/apidocs/jakarta.persistence/jakarta/persistence/Entity.html
[data--sql-r30]: https://jakarta.ee/specifications/persistence/3.2/apidocs/jakarta.persistence/jakarta/persistence/Embeddable.html
[data--sql-r31]: https://jakarta.ee/specifications/persistence/3.2/apidocs/jakarta.persistence/jakarta/persistence/MappedSuperclass.html
[data--sql-r32]: https://docs.spring.io/spring-boot/4.1.1/api/java/org/springframework/boot/persistence/autoconfigure/EntityScan.html
[data--sql-r33]: https://docs.spring.io/spring-boot/4.1/how-to/data-access.html#howto.data-access.separate-entity-definitions-from-spring-configuration
[data--sql-r34]: https://docs.spring.io/spring-data/jpa/docs/4.1.x/api/org/springframework/data/jpa/repository/Query.html
[data--sql-r35]: https://docs.spring.io/spring-data/commons/docs/4.1.x/api/org/springframework/data/repository/CrudRepository.html
[data--sql-r36]: https://docs.spring.io/spring-data/jpa/docs/4.1.x/api/org/springframework/data/jpa/repository/config/EnableJpaRepositories.html
[data--sql-r37]: https://docs.spring.io/spring-boot/4.1.1/api/java/org/springframework/boot/jpa/EntityManagerFactoryBuilder.html
[data--sql-r38]: https://docs.spring.io/spring-framework/docs/7.0.x/javadoc-api/org/springframework/core/task/AsyncTaskExecutor.html
[data--sql-r39]: https://docs.spring.io/spring-framework/docs/7.0.x/javadoc-api/org/springframework/beans/factory/SmartInitializingSingleton.html
[data--sql-r40]: https://docs.spring.io/spring-framework/docs/7.0.x/javadoc-api/org/springframework/beans/factory/ObjectProvider.html
[data--sql-r41]: https://docs.spring.io/spring-data/jpa/reference/4.1
[data--sql-r42]: https://spring.io/projects/spring-data-envers
[data--sql-r43]: https://docs.spring.io/spring-data/commons/docs/4.1.x/api/org/springframework/data/repository/history/RevisionRepository.html
[data--sql-r44]: https://docs.spring.io/spring-data/jpa/reference/4.1/envers.html
[data--sql-r45]: https://docs.spring.io/spring-framework/docs/7.0.x/javadoc-api/org/springframework/context/ApplicationContext.html
[data--sql-r46]: https://docs.spring.io/spring-framework/docs/7.0.x/javadoc-api/org/springframework/orm/jpa/support/OpenEntityManagerInViewInterceptor.html
[data--sql-r47]: https://docs.spring.io/spring-data/jdbc/docs/4.1.x/api/org/springframework/data/jdbc/repository/query/Query.html
[data--sql-r48]: https://docs.spring.io/spring-data/jdbc/docs/4.1.x/api/org/springframework/data/jdbc/repository/config/EnableJdbcRepositories.html
[data--sql-r49]: https://docs.spring.io/spring-data/jdbc/docs/4.1.x/api/org/springframework/data/jdbc/repository/config/AbstractJdbcConfiguration.html
[data--sql-r50]: https://docs.spring.io/spring-boot/4.1/reference/packaging/aot.html
[data--sql-r51]: https://docs.spring.io/spring-data/relational/reference/4.1
[data--sql-r52]: https://www.h2database.com/html/quickstart.html#h2_console
[data--sql-r53]: https://docs.spring.io/spring-boot/4.1/reference/using/devtools.html
[data--sql-r54]: https://docs.spring.io/spring-security/reference/7.1/features/exploits/csrf.html
[data--sql-r55]: https://docs.spring.io/spring-security/reference/7.1/features/exploits/headers.html#headers-frame-options
[data--sql-r56]: https://docs.spring.io/spring-security/reference/7.1/api/java/org/springframework/security/web/SecurityFilterChain.html
[data--sql-r57]: https://www.jooq.org/
[data--sql-r58]: https://www.datageekery.com/
[data--sql-r59]: https://www.jooq.org/doc/3.21.7/manual-single-page/#jooq-in-7-steps-step3
[data--sql-r60]: https://www.jooq.org/javadoc/3.21.7/org/jooq/DSLContext.html
[data--sql-r61]: https://docs.spring.io/spring-boot/4.1.1/api/java/org/springframework/boot/jooq/autoconfigure/DefaultConfigurationCustomizer.html
[data--sql-r62]: https://www.jooq.org/javadoc/3.21.7/org/jooq/Configuration.html
[data--sql-r63]: https://docs.spring.io/spring-framework/docs/7.0.x/javadoc-api/org/springframework/context/annotation/Bean.html
[data--sql-r64]: https://r2dbc.io
[data--sql-r65]: https://r2dbc.io/spec/1.0.0.RELEASE/api/io/r2dbc/spi/Connection.html
[data--sql-r66]: https://r2dbc.io/spec/1.0.0.RELEASE/api/io/r2dbc/spi/ConnectionFactory.html
[data--sql-r67]: https://docs.spring.io/spring-boot/4.1/how-to/data-initialization.html#howto.data-initialization.using-basic-sql-scripts
[data--sql-r68]: https://docs.spring.io/spring-boot/4.1.1/api/java/org/springframework/boot/r2dbc/autoconfigure/ConnectionFactoryOptionsBuilderCustomizer.html
[data--sql-r69]: https://docs.spring.io/spring-framework/docs/7.0.x/javadoc-api/org/springframework/context/annotation/Configuration.html
[data--sql-r70]: https://docs.spring.io/spring-boot/4.1/reference/data/sql.html#data.sql.datasource.embedded
[data--sql-r71]: https://docs.spring.io/spring-framework/docs/7.0.x/javadoc-api/org/springframework/r2dbc/core/DatabaseClient.html
[data--sql-r72]: https://spring.io/projects/spring-data-r2dbc
[data--sql-r73]: https://docs.spring.io/spring-data/r2dbc/docs/4.1.x/api/org/springframework/data/r2dbc/repository/Query.html
