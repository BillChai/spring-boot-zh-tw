# 使用 NoSQL 技術

<!-- source-attribution -->
> **非官方繁體中文翻譯** · Spring Boot 4.1.1 · 翻譯日期：2026-10-21  
> [官方英文網站](https://docs.spring.io/spring-boot/4.1/reference/data/nosql.html) · [固定版本英文來源](https://github.com/spring-projects/spring-boot/blob/v4.1.1/documentation/spring-boot-docs/src/docs/antora/modules/reference/pages/data/nosql.adoc) · [本地原文快照](../sources/spring-boot/documentation/spring-boot-docs/src/docs/antora/modules/reference/pages/data/nosql.adoc)  
> 原始作者與授權見 [來源聲明](../NOTICE.md)。官方範例及設定鍵保留原文，額外圖解另標示為譯者補充。

<!-- translation-status: translated -->

Spring Data 提供額外專案，協助你存取多種 NoSQL 技術，包括：

- [Cassandra][data--nosql-r1]
- [Couchbase][data--nosql-r2]
- [Elasticsearch][data--nosql-r3]
- [Geode][data--nosql-r4]
- [LDAP][data--nosql-r5]
- [MongoDB][data--nosql-r6]
- [Neo4J][data--nosql-r7]
- [Redis][data--nosql-r8]

其中，Spring Boot 為 Cassandra、Couchbase、Elasticsearch、LDAP、MongoDB、Neo4J 與 Redis 提供自動設定。
此外，[Spring Boot for Apache Geode][data--nosql-r9] 提供 [Apache Geode 自動設定][data--nosql-r10]。
其他專案也可以使用，但必須自行設定。
請在 [spring.io/projects/spring-data][data--nosql-r11] 參閱對應參考文件。

## Redis

[Redis][data--nosql-r12] 是快取、訊息代理與功能豐富的鍵值儲存。
Spring Boot 為 [Lettuce][data--nosql-r13] 和 [Jedis][data--nosql-r14] 用戶端程式庫，以及 [Spring Data Redis][data--nosql-r15] 建立在其上的抽象，提供基本自動設定。

`spring-boot-starter-data-redis` starter 讓你方便地取得所需相依項。
它預設使用 [Lettuce][data--nosql-r13]。
這個 starter 同時支援傳統與反應式應用程式。

> **提示：**
>
> 為了與其他支援反應式的儲存保持一致，我們也提供 `spring-boot-starter-data-redis-reactive` starter。

### 連線至 Redis

你可以像使用其他 Spring Bean 一樣，注入自動設定的 [`RedisConnectionFactory`][data--nosql-r16]、[`StringRedisTemplate`][data--nosql-r17] 或一般 [`RedisTemplate`][data--nosql-r18] 實例。
下列清單展示這類 Bean 的範例：

```kotlin
import org.springframework.data.redis.core.StringRedisTemplate
import org.springframework.stereotype.Component

@Component
class MyBean(private val template: StringRedisTemplate) {

	// ...

	fun someMethod(): Boolean {
		return template.hasKey("spring")
	}

}
```

```java
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;

@Component
public class MyBean {

	private final StringRedisTemplate template;

	public MyBean(StringRedisTemplate template) {
		this.template = template;
	}

	// ...

	public Boolean someMethod() {
		return this.template.hasKey("spring");
	}

}
```

預設實例會嘗試連線到 `localhost:6379` 的 Redis 伺服器。
你可以使用 `spring.data.redis.*` 屬性指定自訂連線詳細資料，如下例所示：

```properties
spring.data.redis.host=localhost
spring.data.redis.port=6379
spring.data.redis.database=0
spring.data.redis.username=user
spring.data.redis.password=secret
```

```yaml
spring:
  data:
    redis:
      host: "localhost"
      port: 6379
      database: 0
      username: "user"
      password: "secret"
```

也可以直接指定 Redis 伺服器 URL。
設定 URL 時，會忽略 host、port、username 與 password 屬性。
如下例所示：

```properties
spring.data.redis.url=redis://user:secret@localhost:6379
spring.data.redis.database=0
```

```yaml
spring:
  data:
    redis:
      url: "redis://user:secret@localhost:6379"
      database: 0
```

> **提示：**
>
> 也可以註冊任意數量、實作 [`LettuceClientConfigurationBuilderCustomizer`][data--nosql-r19] 的 Bean，進行更進階自訂。
> [`ClientResources`][data--nosql-r20] 也可透過 [`ClientResourcesBuilderCustomizer`][data--nosql-r21] 自訂。
> 若使用 Jedis，也有 [`JedisClientConfigurationBuilderCustomizer`][data--nosql-r22] 可用。

另一種方式是註冊 [`RedisStandaloneConfiguration`][data--nosql-r23]、[`RedisSentinelConfiguration`][data--nosql-r24]、[`RedisClusterConfiguration`][data--nosql-r25] 或 [`RedisStaticMasterReplicaConfiguration`][data--nosql-r26] 型別的 Bean，完全掌控設定。

> **注意：**
>
> Jedis 不支援 master/replica。

如果加入自己的 [`@Bean`][data--nosql-r27]，型別為任何自動設定型別，就會替換預設值（[`RedisTemplate`][data--nosql-r18] 例外：它依據 Bean 名稱 `redisTemplate` 排除，而不是型別）。

預設情況下，若 classpath 上有 `commons-pool2`，就會自動設定使用連線池的連線工廠。

可以透過下例屬性，將自動設定的 [`RedisConnectionFactory`][data--nosql-r16] 設為使用 SSL 與伺服器通訊：

```properties
spring.data.redis.ssl.enabled=true
```

```yaml
spring:
  data:
    redis:
      ssl:
        enabled: true
```

可以在 [SSL bundle][data--nosql-r28] 中設定自訂 SSL 信任資料，再如下套用到 [`RedisConnectionFactory`][data--nosql-r16]：

```properties
spring.data.redis.ssl.bundle=example
```

```yaml
spring:
  data:
    redis:
      ssl:
        bundle: "example"
```

### 接收訊息

Redis 基礎設施存在時，可以在任何 Bean 上使用 [`@RedisListener`][data--nosql-r29] 註解，建立監聽端點。
若尚未定義 [`RedisMessageListenerContainer`][data--nosql-r30]，就會自動設定預設實例。

下列元件在 `someChannel` 通道上建立監聽端點：

```kotlin
import org.springframework.data.redis.annotation.RedisListener
import org.springframework.stereotype.Component

@Component
class MyBean {

	@RedisListener("someChannel")
	fun processMessage(content: String) {
		// ...
	}

}
```

```java
import org.springframework.data.redis.annotation.RedisListener;
import org.springframework.stereotype.Component;

@Component
public class MyBean {

	@RedisListener("someChannel")
	public void processMessage(String content) {
		// ...
	}

}
```

> **提示：**
>
> 詳情請參閱 [`@EnableRedisListeners`][data--nosql-r31] API 文件。

若需要建立更多 [`RedisMessageListenerContainer`][data--nosql-r30] 實例，或覆寫預設實例，Spring Boot 提供 [`RedisMessageListenerContainerConfigurer`][data--nosql-r32]，讓你以與自動設定容器相同的設定，初始化 [`RedisMessageListenerContainer`][data--nosql-r30]。

例如，下例公開另一個使用特定 [`RedisConnectionFactory`][data--nosql-r16] 的容器：

```kotlin
import org.springframework.boot.data.redis.autoconfigure.RedisMessageListenerContainerConfigurer
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.data.redis.connection.RedisConnectionFactory
import org.springframework.data.redis.listener.RedisMessageListenerContainer

@Configuration(proxyBeanMethods = false)
class MyRedisConfiguration {

	@Bean
	fun myRedisMessageListenerContainer(
		configurer: RedisMessageListenerContainerConfigurer,
		connectionFactory: RedisConnectionFactory
	): RedisMessageListenerContainer {
		val container = RedisMessageListenerContainer()
		configurer.configure(container, connectionFactory)
		// ... custom configuration
		return container
	}

}
```

```java
import org.springframework.boot.data.redis.autoconfigure.RedisMessageListenerContainerConfigurer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.listener.RedisMessageListenerContainer;

@Configuration(proxyBeanMethods = false)
public class MyRedisConfiguration {

	@Bean
	public RedisMessageListenerContainer myRedisMessageListenerContainer(
			RedisMessageListenerContainerConfigurer configurer, RedisConnectionFactory connectionFactory) {
		RedisMessageListenerContainer container = new RedisMessageListenerContainer();
		configurer.configure(container, connectionFactory);
		// ... custom configuration
		return container;
	}

}
```

接著可在任何標註 [`@RedisListener`][data--nosql-r29] 的方法中使用此容器：

```kotlin
import org.springframework.data.redis.annotation.RedisListener
import org.springframework.stereotype.Component

@Component
class MyBean {

	@RedisListener(topic = "someChannel", container = "myRedisMessageListenerContainer")
	fun processMessage(content: String) {
		// ...
	}

}
```

```java
import org.springframework.data.redis.annotation.RedisListener;
import org.springframework.stereotype.Component;

@Component
public class MyBean {

	@RedisListener(topic = "someChannel", container = "myRedisMessageListenerContainer")
	public void processMessage(String content) {
		// ...
	}

}
```

## MongoDB

[MongoDB][data--nosql-r33] 是開源 NoSQL 文件資料庫，使用類似 JSON 的綱要，而不是傳統以資料表為基礎的關聯式資料。
Spring Boot 提供多項便利功能，協助使用 MongoDB，包括 `spring-boot-starter-data-mongodb` 與 `spring-boot-starter-data-mongodb-reactive` starter。

### 連線至 MongoDB 資料庫

若要存取 MongoDB 資料庫，可以注入自動設定的 [`MongoDatabaseFactory`][data--nosql-r34]。
預設實例會嘗試連線到 `mongodb://localhost/test` 的 MongoDB 伺服器。
下例展示如何連線至 MongoDB 資料庫：

```kotlin
import com.mongodb.client.MongoCollection
import org.bson.Document
import org.springframework.data.mongodb.MongoDatabaseFactory
import org.springframework.stereotype.Component

@Component
class MyBean(private val mongo: MongoDatabaseFactory) {

	// ...

	fun someMethod(): MongoCollection<Document> {
		val db = mongo.mongoDatabase
		return db.getCollection("users")
	}

}
```

```java
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;
import org.bson.Document;

import org.springframework.data.mongodb.MongoDatabaseFactory;
import org.springframework.stereotype.Component;

@Component
public class MyBean {

	private final MongoDatabaseFactory mongo;

	public MyBean(MongoDatabaseFactory mongo) {
		this.mongo = mongo;
	}

	// ...

	public MongoCollection<Document> someMethod() {
		MongoDatabase db = this.mongo.getMongoDatabase();
		return db.getCollection("users");
	}

}
```

若已定義自己的 [`MongoClient`][data--nosql-r35]，它會用來自動設定適當的 [`MongoDatabaseFactory`][data--nosql-r34]。

自動設定的 [`MongoClient`][data--nosql-r35] 使用 [`MongoClientSettings`][data--nosql-r36] Bean 建立。
若自行定義了 [`MongoClientSettings`][data--nosql-r36]，就會直接使用而不修改，並忽略 `spring.data.mongodb` 屬性。
否則會自動設定 [`MongoClientSettings`][data--nosql-r36]，並套用 `spring.data.mongodb` 屬性。
無論哪種情況，都可以宣告一個或多個 [`MongoClientSettingsBuilderCustomizer`][data--nosql-r37] Bean，微調 [`MongoClientSettings`][data--nosql-r36]。
它們會依序被呼叫，並取得用來建置 [`MongoClientSettings`][data--nosql-r36] 的 [`MongoClientSettings.Builder`][data--nosql-r38]。

可以設定 `spring.mongodb.uri` 屬性，修改 URL 並設定*副本集*等額外選項，如下例所示：

```properties
spring.mongodb.uri=mongodb://user:[email protected]:27017,mongoserver2.example.com:23456/test
```

```yaml
spring:
  mongodb:
    uri: "mongodb://user:[email protected]:27017,mongoserver2.example.com:23456/test"
```

也可以透過個別屬性指定連線詳細資料。
例如，在 `application.properties` 宣告下列設定：

```properties
spring.mongodb.host=mongoserver1.example.com
spring.mongodb.port=27017
spring.mongodb.additional-hosts[0]=mongoserver2.example.com:23456
spring.mongodb.database=test
spring.mongodb.username=user
spring.mongodb.password=secret
```

```yaml
spring:
  mongodb:
    host: "mongoserver1.example.com"
    port: 27017
    additional-hosts:
    - "mongoserver2.example.com:23456"
    database: "test"
    username: "user"
    password: "secret"
```

可以透過下例屬性，將自動設定的 [`MongoClient`][data--nosql-r35] 設為使用 SSL 與伺服器通訊：

```properties
spring.mongodb.uri=mongodb://user:[email protected]:27017,mongoserver2.example.com:23456/test
spring.mongodb.ssl.enabled=true
```

```yaml
spring:
  mongodb:
    uri: "mongodb://user:[email protected]:27017,mongoserver2.example.com:23456/test"
    ssl:
      enabled: true
```

可以在 [SSL bundle][data--nosql-r28] 中設定自訂 SSL 信任資料，再如下套用到 [`MongoClient`][data--nosql-r35]：

```properties
spring.mongodb.uri=mongodb://user:[email protected]:27017,mongoserver2.example.com:23456/test
spring.mongodb.ssl.bundle=example
```

```yaml
spring:
  mongodb:
    uri: "mongodb://user:[email protected]:27017,mongoserver2.example.com:23456/test"
    ssl:
      bundle: "example"
```

> **提示：**
>
> 若未指定 `spring.mongodb.port`，就使用預設值 `27017`。
> 你可以刪除前例中的這一行。
>
> 也可以使用 `host:port` 語法，將連接埠包含在主機位址中。
> 若要修改 `additional-hosts` 項目的連接埠，應使用此格式。

> **提示：**
>
> 若不使用 Spring Data MongoDB，可以注入 [`MongoClient`][data--nosql-r35] Bean，而不使用 [`MongoDatabaseFactory`][data--nosql-r34]。
> 若要完全掌控 MongoDB 連線的建立，也可以自行宣告 [`MongoDatabaseFactory`][data--nosql-r34] 或 [`MongoClient`][data--nosql-r35] Bean。

> **注意：**
>
> 若使用反應式驅動程式，SSL 需要 Netty。
> 當 Netty 可用，且要使用的工廠尚未被自訂時，自動設定會自動設定此工廠。

### MongoTemplate

[Spring Data MongoDB][data--nosql-r6] 提供 [`MongoTemplate`][data--nosql-r40] 類別，設計與 Spring 的 [`JdbcTemplate`][data--nosql-r41] 非常相似。
如同 [`JdbcTemplate`][data--nosql-r41]，Spring Boot 會自動設定 Bean，供你注入範本，如下所示：

```kotlin
import com.mongodb.client.MongoCollection
import org.bson.Document
import org.springframework.data.mongodb.core.MongoTemplate
import org.springframework.stereotype.Component

@Component
class MyBean(private val mongoTemplate: MongoTemplate) {

	// ...

	fun someMethod(): MongoCollection<Document> {
		return mongoTemplate.getCollection("users")
	}

}
```

```java
import com.mongodb.client.MongoCollection;
import org.bson.Document;

import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.stereotype.Component;

@Component
public class MyBean {

	private final MongoTemplate mongoTemplate;

	public MyBean(MongoTemplate mongoTemplate) {
		this.mongoTemplate = mongoTemplate;
	}

	// ...

	public MongoCollection<Document> someMethod() {
		return this.mongoTemplate.getCollection("users");
	}

}
```

完整細節請參閱 [`MongoOperations`][data--nosql-r42] API 文件。

### Spring Data MongoDB 儲存庫

Spring Data 包含 MongoDB 儲存庫支援。
如同前述 JPA 儲存庫，基本原理是依方法名稱自動建構查詢。

事實上，Spring Data JPA 與 Spring Data MongoDB 共用相同的基礎設施。
你可以沿用前面的 JPA 範例，假設 `City` 現在是 MongoDB 資料類別，而不是 JPA [`@Entity`][data--nosql-r43]，就能以相同方式運作，如下例所示：

```kotlin
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.repository.Repository

interface CityRepository :
	Repository<City, Long> {
	fun findAll(pageable: Pageable?): Page<City>
	fun findByNameAndStateAllIgnoringCase(name: String, state: String): City?
}
```

```java
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.repository.Repository;

public interface CityRepository extends Repository<City, Long> {

	Page<City> findAll(Pageable pageable);

	City findByNameAndStateAllIgnoringCase(String name, String state);

}
```

儲存庫與文件會透過掃描找到。
預設掃描[自動設定套件][data--nosql-r44]。
可以分別使用 [`@EnableMongoRepositories`][data--nosql-r45] 與 [`@EntityScan`][data--nosql-r46]，自訂儲存庫與文件的搜尋位置。

> **提示：**
>
> Spring Data MongoDB 的完整細節，包括豐富的物件對映技術，請參閱其[參考文件][data--nosql-r47]。

## Neo4j

[Neo4j][data--nosql-r48] 是開源 NoSQL 圖形資料庫，採用豐富的資料模型，以具備一級地位的關係連結節點；相較於傳統 RDBMS 方法，更適合高度連結的大數據。
Spring Boot 提供多項便利功能，協助使用 Neo4j，包括 `spring-boot-starter-data-neo4j` starter。

### 連線至 Neo4j 資料庫

若要存取 Neo4j 伺服器，可以注入自動設定的 [`Driver`][data--nosql-r49]。
預設實例會透過 Bolt 協定，嘗試連線到 `localhost:7687` 的 Neo4j 伺服器。
下例展示如何注入 Neo4j [`Driver`][data--nosql-r49]，讓你存取 [`Session`][data--nosql-r50] 等功能：

```kotlin
import org.neo4j.driver.Driver
import org.neo4j.driver.TransactionContext
import org.neo4j.driver.Values
import org.springframework.stereotype.Component

@Component
class MyBean(private val driver: Driver) {
	// ...
	fun someMethod(message: String?): String {
		driver.session().use { session ->
			return@someMethod session.executeWrite { transaction: TransactionContext ->
				transaction
					.run(
						"CREATE (a:Greeting) SET a.message = \$message RETURN a.message + ', from node ' + id(a)",
						Values.parameters("message", message)
					)
					.single()[0].asString()
			}
		}
	}
}
```

```java
import org.neo4j.driver.Driver;
import org.neo4j.driver.Session;
import org.neo4j.driver.Values;

import org.springframework.stereotype.Component;

@Component
public class MyBean {

	private final Driver driver;

	public MyBean(Driver driver) {
		this.driver = driver;
	}

	// ...

	public String someMethod(String message) {
		try (Session session = this.driver.session()) {
			return session.executeWrite(
					(transaction) -> transaction
						.run("CREATE (a:Greeting) SET a.message = $message RETURN a.message + ', from node ' + id(a)",
								Values.parameters("message", message))
						.single()
						.get(0)
						.asString());
		}
	}

}
```

可以使用 `spring.neo4j.*` 屬性設定驅動程式的各個面向。
下例展示如何設定要使用的 URI 與憑證：

```properties
spring.neo4j.uri=bolt://my-server:7687
spring.neo4j.authentication.username=neo4j
spring.neo4j.authentication.password=secret
```

```yaml
spring:
  neo4j:
    uri: "bolt://my-server:7687"
    authentication:
      username: "neo4j"
      password: "secret"
```

自動設定的 [`Driver`][data--nosql-r49] 透過 `org.neo4j.driver.Config$ConfigBuilder` 建立。
若要微調設定，可宣告一個或多個 [`ConfigBuilderCustomizer`][data--nosql-r51] Bean。
它們會依序被呼叫，並取得用來建置 [`Driver`][data--nosql-r49] 的 `org.neo4j.driver.Config$ConfigBuilder`。

### Spring Data Neo4j 儲存庫

Spring Data 包含 Neo4j 儲存庫支援。
Spring Data Neo4j 的完整細節，請參閱[參考文件][data--nosql-r52]。

如同許多其他 Spring Data 模組，Spring Data Neo4j 與 Spring Data JPA 共用基礎設施。
你可以沿用前面的 JPA 範例，將 `City` 定義為 Spring Data Neo4j [`@Node`][data--nosql-r53]，而不是 JPA [`@Entity`][data--nosql-r43]，儲存庫抽象就會以相同方式運作，如下例所示：

```kotlin
import org.springframework.data.neo4j.repository.Neo4jRepository

interface CityRepository : Neo4jRepository<City, Long> {

	fun findOneByNameAndState(name: String?, state: String?): City?

}
```

```java
import org.springframework.data.neo4j.repository.Neo4jRepository;

public interface CityRepository extends Neo4jRepository<City, Long> {

	City findOneByNameAndState(String name, String state);

}
```

`spring-boot-starter-data-neo4j` starter 會啟用儲存庫支援與交易管理。
Spring Boot 透過 [`Neo4jTemplate`][data--nosql-r54] 或 [`ReactiveNeo4jTemplate`][data--nosql-r55] Bean，同時支援傳統與反應式 Neo4j 儲存庫。
當 classpath 上有 Project Reactor，也會自動設定反應式風格。

儲存庫與實體會透過掃描找到。
預設掃描[自動設定套件][data--nosql-r44]。
可以分別使用 [`@EnableNeo4jRepositories`][data--nosql-r56] 與 [`@EntityScan`][data--nosql-r46]，自訂儲存庫與實體的搜尋位置。

> **注意：**
>
> 使用反應式風格的應用程式，不會自動設定 [`ReactiveTransactionManager`][data--nosql-r57]。
> 若要啟用交易管理，必須在設定中定義下列 Bean：
>
> ```kotlin
> import org.neo4j.driver.Driver
> import org.springframework.context.annotation.Bean
> import org.springframework.context.annotation.Configuration
> import org.springframework.data.neo4j.core.ReactiveDatabaseSelectionProvider
> import org.springframework.data.neo4j.core.transaction.ReactiveNeo4jTransactionManager
>
> @Configuration(proxyBeanMethods = false)
> class MyNeo4jConfiguration {
>
> 	@Bean
> 	fun reactiveTransactionManager(driver: Driver,
> 			databaseNameProvider: ReactiveDatabaseSelectionProvider): ReactiveNeo4jTransactionManager {
> 		return ReactiveNeo4jTransactionManager(driver, databaseNameProvider)
> 	}
> }
> ```
>
> ```java
> import org.neo4j.driver.Driver;
>
> import org.springframework.context.annotation.Bean;
> import org.springframework.context.annotation.Configuration;
> import org.springframework.data.neo4j.core.ReactiveDatabaseSelectionProvider;
> import org.springframework.data.neo4j.core.transaction.ReactiveNeo4jTransactionManager;
>
> @Configuration(proxyBeanMethods = false)
> public class MyNeo4jConfiguration {
>
> 	@Bean
> 	public ReactiveNeo4jTransactionManager reactiveTransactionManager(Driver driver,
> 			ReactiveDatabaseSelectionProvider databaseNameProvider) {
> 		return new ReactiveNeo4jTransactionManager(driver, databaseNameProvider);
> 	}
>
> }
> ```

## Elasticsearch

[Elasticsearch][data--nosql-r58] 是開源、分散式、RESTful 搜尋與分析引擎。
Spring Boot 為 Elasticsearch 用戶端提供基本自動設定。

Spring Boot 支援多種用戶端：

- 官方低階 REST 用戶端。
- 官方 Java API 用戶端。
- Spring Data Elasticsearch 提供的 [`ReactiveElasticsearchClient`][data--nosql-r59]。

Spring Boot 提供專用 starter：`spring-boot-starter-data-elasticsearch`。

### 使用 REST 用戶端連線至 Elasticsearch

Elasticsearch 提供兩種 REST 用戶端，供你查詢叢集：[低階用戶端][data--nosql-r60]與 [Java API 用戶端][data--nosql-r61]。
Java API 用戶端由 `co.elastic.clients:elasticsearch-java` 模組提供，低階用戶端由 `co.elastic.clients:elasticsearch-rest5-client` 模組提供。
此外，Spring Boot 支援 `org.springframework.data:spring-data-elasticsearch` 模組提供的反應式用戶端。
預設用戶端以 [localhost:9200][data--nosql-r62] 為目標。
可以使用 `spring.elasticsearch.*` 屬性進一步調整用戶端設定，如下例所示：

```properties
spring.elasticsearch.uris=https://search.example.com:9200
spring.elasticsearch.socket-timeout=10s
spring.elasticsearch.username=user
spring.elasticsearch.password=secret
```

```yaml
spring:
  elasticsearch:
    uris: "https://search.example.com:9200"
    socket-timeout: "10s"
    username: "user"
    password: "secret"
```

#### 使用 Rest5Client 連線至 Elasticsearch

若 classpath 上有 `co.elastic.clients:elasticsearch-rest5-client`，Spring Boot 就會自動設定並註冊 [`Rest5Client`][data--nosql-r63] Bean。
除了前述屬性，若要微調 [`Rest5Client`][data--nosql-r63]，也可以註冊任意數量、實作 [`Rest5ClientBuilderCustomizer`][data--nosql-r64] 的 Bean，進行進階自訂。
若要完全掌控用戶端設定，請定義 [`Rest5ClientBuilder`][data--nosql-r65] Bean。

此外，也可以自動設定 [`Sniffer`][data--nosql-r66]，從執行中的 Elasticsearch 叢集自動探索節點，並設定到 [`Rest5Client`][data--nosql-r63] Bean。
可以如下進一步調整 [`Sniffer`][data--nosql-r66] 設定：

```properties
spring.elasticsearch.restclient.sniffer.enabled=true
spring.elasticsearch.restclient.sniffer.interval=10m
spring.elasticsearch.restclient.sniffer.delay-after-failure=30s
```

```yaml
spring:
  elasticsearch:
    restclient:
      sniffer:
        enabled: true
        interval: "10m"
        delay-after-failure: "30s"
```

#### 使用 ElasticsearchClient 連線至 Elasticsearch

若使用 `spring-boot-starter-elasticsearch`，或在 classpath 加入 `co.elastic.clients:elasticsearch-java`，Spring Boot 就會自動設定並註冊 [`ElasticsearchClient`][data--nosql-r67] Bean。

[`ElasticsearchClient`][data--nosql-r67] 所使用的傳輸依賴前述 [`Rest5Client`][data--nosql-r63]。
因此，可使用前述屬性設定 [`ElasticsearchClient`][data--nosql-r67]。
此外，可以定義 [`Rest5ClientOptions`][data--nosql-r68] Bean，進一步掌控傳輸行為。

#### 使用 ReactiveElasticsearchClient 連線至 Elasticsearch

[Spring Data Elasticsearch][data--nosql-r3] 提供 [`ReactiveElasticsearchClient`][data--nosql-r59]，以反應式方式查詢 Elasticsearch 實例。
若 classpath 上有 Spring Data Elasticsearch 與 Reactor，Spring Boot 就會自動設定並註冊 [`ReactiveElasticsearchClient`][data--nosql-r59]。

[`ReactiveElasticsearchClient`][data--nosql-r59] 所使用的傳輸依賴前述 [`Rest5Client`][data--nosql-r63]。
因此，可使用前述屬性設定 [`ReactiveElasticsearchClient`][data--nosql-r59]。
此外，可以定義 [`Rest5ClientOptions`][data--nosql-r68] Bean，進一步掌控傳輸行為。

### 使用 Spring Data 連線至 Elasticsearch

若要連線至 Elasticsearch，必須定義 [`ElasticsearchClient`][data--nosql-r67] Bean，可以由 Spring Boot 自動設定，或由應用程式手動提供（請參閱前面各節）。
完成這些設定後，就可以像其他 Spring Bean 一樣注入 [`ElasticsearchTemplate`][data--nosql-r69]，如下例所示：

```kotlin
import org.springframework.stereotype.Component

@Component
class MyBean(private val template: org.springframework.data.elasticsearch.client.elc.ElasticsearchTemplate ) {

	// ...

	fun someMethod(id: String): Boolean {
		return template.exists(id, User::class.java)
	}

}
```

```java
import org.springframework.data.elasticsearch.client.elc.ElasticsearchTemplate;
import org.springframework.stereotype.Component;

@Component
public class MyBean {

	private final ElasticsearchTemplate template;

	public MyBean(ElasticsearchTemplate template) {
		this.template = template;
	}

	// ...

	public boolean someMethod(String id) {
		return this.template.exists(id, User.class);
	}

}
```

當存在 `spring-data-elasticsearch` 與 Reactor 時，Spring Boot 也可以將 [`ReactiveElasticsearchClient`][data--nosql-r70] 與 [`ReactiveElasticsearchTemplate`][data--nosql-r71] 自動設定為 Bean。
它們是其他 REST 用戶端的反應式對應版本。

### Spring Data Elasticsearch 儲存庫

Spring Data 包含 Elasticsearch 儲存庫支援。
如同前述 JPA 儲存庫，基本原理是依方法名稱自動為你建構查詢。

事實上，Spring Data JPA 與 Spring Data Elasticsearch 共用相同基礎設施。
你可以沿用前面的 JPA 範例，假設 `City` 現在是 Elasticsearch [`@Document`][data--nosql-r72] 類別，而不是 JPA [`@Entity`][data--nosql-r43]，就能以相同方式運作。

儲存庫與文件會透過掃描找到。
預設掃描[自動設定套件][data--nosql-r44]。
可以分別使用 [`@EnableElasticsearchRepositories`][data--nosql-r73] 與 [`@EntityScan`][data--nosql-r46]，自訂儲存庫與文件的搜尋位置。

> **提示：**
>
> Spring Data Elasticsearch 的完整細節，請參閱[參考文件][data--nosql-r74]。

Spring Boot 透過 [`ElasticsearchTemplate`][data--nosql-r69] 或 [`ReactiveElasticsearchTemplate`][data--nosql-r71] Bean，同時支援傳統與反應式 Elasticsearch 儲存庫。
只要有所需相依項，這些 Bean 通常就會由 Spring Boot 自動設定。

如果想用自己的範本支援 Elasticsearch 儲存庫，可以加入自己的 [`ElasticsearchTemplate`][data--nosql-r69] 或 [`ElasticsearchOperations`][data--nosql-r75] [`@Bean`][data--nosql-r27]，名稱必須為 `"elasticsearchTemplate"`。
[`ReactiveElasticsearchTemplate`][data--nosql-r71] 與 [`ReactiveElasticsearchOperations`][data--nosql-r76] 也同理，Bean 名稱為 `"reactiveElasticsearchTemplate"`。

你可以透過下列屬性停用儲存庫支援：

```properties
spring.data.elasticsearch.repositories.enabled=false
```

```yaml
spring:
  data:
    elasticsearch:
      repositories:
        enabled: false
```

## Cassandra

[Cassandra][data--nosql-r77] 是開源分散式資料庫管理系統，設計用來跨多部一般商用伺服器處理大量資料。
Spring Boot 為 Cassandra，以及 [Spring Data Cassandra][data--nosql-r1] 建立在其上的抽象，提供自動設定。
`spring-boot-starter-data-cassandra` starter 讓你方便地取得所需相依項。

### 連線至 Cassandra

你可以像其他 Spring Bean 一樣，注入自動設定的 [`CqlTemplate`][data--nosql-r78]、[`CassandraTemplate`][data--nosql-r79] 或 Cassandra `CqlSession` 實例。
可使用 `spring.cassandra.*` 屬性自訂連線。
通常會提供 `keyspace-name`、`contact-points` 與本地資料中心名稱，如下例所示：

```properties
spring.cassandra.keyspace-name=mykeyspace
spring.cassandra.contact-points=cassandrahost1:9042,cassandrahost2:9042
spring.cassandra.local-datacenter=datacenter1
```

```yaml
spring:
  cassandra:
    keyspace-name: "mykeyspace"
    contact-points: "cassandrahost1:9042,cassandrahost2:9042"
    local-datacenter: "datacenter1"
```

若所有聯絡節點的連接埠相同，可以使用簡寫，只指定主機名稱，如下例所示：

```properties
spring.cassandra.keyspace-name=mykeyspace
spring.cassandra.contact-points=cassandrahost1,cassandrahost2
spring.cassandra.local-datacenter=datacenter1
```

```yaml
spring:
  cassandra:
    keyspace-name: "mykeyspace"
    contact-points: "cassandrahost1,cassandrahost2"
    local-datacenter: "datacenter1"
```

> **提示：**
>
> 這兩個範例相同，因為預設連接埠為 `9042`。
> 若需要設定連接埠，請使用 `spring.cassandra.port`。

可以透過下例屬性，將自動設定的 `CqlSession` 設為使用 SSL 與伺服器通訊：

```properties
spring.cassandra.keyspace-name=mykeyspace
spring.cassandra.contact-points=cassandrahost1,cassandrahost2
spring.cassandra.local-datacenter=datacenter1
spring.cassandra.ssl.enabled=true
```

```yaml
spring:
  cassandra:
    keyspace-name: "mykeyspace"
    contact-points: "cassandrahost1,cassandrahost2"
    local-datacenter: "datacenter1"
    ssl:
      enabled: true
```

可以在 [SSL bundle][data--nosql-r28] 中設定自訂 SSL 信任資料，再如下套用到 `CqlSession`：

```properties
spring.cassandra.keyspace-name=mykeyspace
spring.cassandra.contact-points=cassandrahost1,cassandrahost2
spring.cassandra.local-datacenter=datacenter1
spring.cassandra.ssl.bundle=example
```

```yaml
spring:
  cassandra:
    keyspace-name: "mykeyspace"
    contact-points: "cassandrahost1,cassandrahost2"
    local-datacenter: "datacenter1"
    ssl:
      bundle: "example"
```

> **注意：**
>
> Cassandra 驅動程式有自己的設定基礎設施，會載入 classpath 根目錄的 `application.conf`。
>
> Spring Boot 預設不會尋找這種檔案，但可使用 `spring.cassandra.config` 載入。
> 若屬性同時出現在 `spring.cassandra.*` 與設定檔，`spring.cassandra.*` 的值優先。
>
> 若要更進階地自訂驅動程式，可以註冊任意數量、實作 [`DriverConfigLoaderBuilderCustomizer`][data--nosql-r80] 的 Bean。
> `CqlSession` 可以透過 [`CqlSessionBuilderCustomizer`][data--nosql-r81] 型別的 Bean 自訂。

> **注意：**
>
> 若使用 `CqlSessionBuilder` 建立多個 `CqlSession` Bean，請記住建構器可變，因此務必為每個 session 注入新的副本。

下列程式碼展示如何注入 Cassandra Bean：

```kotlin
import org.springframework.data.cassandra.core.CassandraTemplate
import org.springframework.stereotype.Component

@Component
class MyBean(private val template: CassandraTemplate) {

	// ...

	fun someMethod(): Long {
		return template.count(User::class.java)
	}

}
```

```java
import org.springframework.data.cassandra.core.CassandraTemplate;
import org.springframework.stereotype.Component;

@Component
public class MyBean {

	private final CassandraTemplate template;

	public MyBean(CassandraTemplate template) {
		this.template = template;
	}

	// ...

	public long someMethod() {
		return this.template.count(User.class);
	}

}
```

如果加入自己的 [`CassandraTemplate`][data--nosql-r79] 型別 [`@Bean`][data--nosql-r27]，就會替換預設實例。

### Spring Data Cassandra 儲存庫

Spring Data 包含 Cassandra 的基本儲存庫支援。
目前它比前述 JPA 儲存庫更受限制，需要使用 [`@Query`][data--nosql-r82] 標註查找方法。

儲存庫與實體會透過掃描找到。
預設掃描[自動設定套件][data--nosql-r44]。
可以分別使用 [`@EnableCassandraRepositories`][data--nosql-r83] 與 [`@EntityScan`][data--nosql-r46]，自訂儲存庫與實體的搜尋位置。

> **提示：**
>
> Spring Data Cassandra 的完整細節，請參閱[參考文件][data--nosql-r84]。

## Couchbase

[Couchbase][data--nosql-r85] 是開源、分散式、多模型、文件導向的 NoSQL 資料庫，針對互動式應用程式最佳化。
Spring Boot 為 Couchbase，以及 [Spring Data Couchbase][data--nosql-r86] 建立在其上的抽象，提供自動設定。
`spring-boot-starter-data-couchbase` 與 `spring-boot-starter-data-couchbase-reactive` starter 讓你方便地取得所需相依項。

### 連線至 Couchbase

加入 Couchbase SDK 與一些設定，即可取得 [`Cluster`][data--nosql-r87]。
可使用 `spring.couchbase.*` 屬性自訂連線。
通常需要提供[連線字串][data--nosql-r88]與身分驗證憑證。使用使用者名稱與密碼的基本驗證，可如下設定：

```properties
spring.couchbase.connection-string=couchbase://192.168.1.123
spring.couchbase.username=user
spring.couchbase.password=secret
```

```yaml
spring:
  couchbase:
    connection-string: "couchbase://192.168.1.123"
    username: "user"
    password: "secret"
```

也可使用[用戶端憑證][data--nosql-r89]進行身分驗證，取代使用者名稱與密碼。
包含用戶端憑證的 Java KeyStore 位置與密碼，可如下設定：

```properties
spring.couchbase.connection-string=couchbase://192.168.1.123
spring.couchbase.env.ssl.enabled=true
spring.couchbase.authentication.jks.location=classpath:client.p12
spring.couchbase.authentication.jks.password=secret
```

```yaml
spring:
  couchbase:
    connection-string: "couchbase://192.168.1.123"
    env:
      ssl:
        enabled: true
    authentication:
      jks:
        location: "classpath:client.p12"
        password: "secret"
```

PEM 編碼憑證與私密金鑰，可如下設定：

```properties
spring.couchbase.connection-string=couchbase://192.168.1.123
spring.couchbase.env.ssl.enabled=true
spring.couchbase.authentication.pem.certificates=classpath:client.crt
spring.couchbase.authentication.pem.private-key=classpath:client.key
```

```yaml
spring:
  couchbase:
    connection-string: "couchbase://192.168.1.123"
    env:
      ssl:
        enabled: true
    authentication:
      pem:
        certificates: "classpath:client.crt"
        private-key: "classpath:client.key"
```

也可以自訂部分 [`ClusterEnvironment`][data--nosql-r90] 設定。
例如，下列設定會修改開啟新 [`Bucket`][data--nosql-r91] 的逾時，並引用已設定的 [SSL bundle][data--nosql-r28] 啟用 SSL 支援：

```properties
spring.couchbase.env.timeouts.connect=3s
spring.couchbase.env.ssl.bundle=example
```

```yaml
spring:
  couchbase:
    env:
      timeouts:
        connect: "3s"
      ssl:
        bundle: "example"
```

> **提示：**
>
> 詳情請查看 `spring.couchbase.env.*` 屬性。
> 若要更完整掌控，可使用一個或多個 [`ClusterEnvironmentBuilderCustomizer`][data--nosql-r92] Bean。

### Spring Data Couchbase 儲存庫

Spring Data 包含 Couchbase 儲存庫支援。

儲存庫與文件會透過掃描找到。
預設掃描[自動設定套件][data--nosql-r44]。
可以分別使用 [`@EnableCouchbaseRepositories`][data--nosql-r93] 與 [`@EntityScan`][data--nosql-r46]，自訂儲存庫與文件的搜尋位置。

Spring Data Couchbase 的完整細節，請參閱[參考文件][data--nosql-r94]。

只要存在 [`CouchbaseClientFactory`][data--nosql-r96] Bean，你就可以像其他 Spring Bean 一樣，注入自動設定的 [`CouchbaseTemplate`][data--nosql-r95] 實例。
當存在前述 [`Cluster`][data--nosql-r87]，且已指定 bucket 名稱時，就會發生這種情況：

```properties
spring.data.couchbase.bucket-name=my-bucket
```

```yaml
spring:
  data:
    couchbase:
      bucket-name: "my-bucket"
```

下例展示如何注入 [`CouchbaseTemplate`][data--nosql-r95] Bean：

```kotlin
import org.springframework.data.couchbase.core.CouchbaseTemplate
import org.springframework.stereotype.Component

@Component
class MyBean(private val template: CouchbaseTemplate) {

	// ...

	fun someMethod(): String {
		return template.bucketName
	}

}
```

```java
import org.springframework.data.couchbase.core.CouchbaseTemplate;
import org.springframework.stereotype.Component;

@Component
public class MyBean {

	private final CouchbaseTemplate template;

	public MyBean(CouchbaseTemplate template) {
		this.template = template;
	}

	// ...

	public String someMethod() {
		return this.template.getBucketName();
	}

}
```

你可以在自己的設定中定義下列幾種 Bean，覆寫自動設定提供的 Bean：

- 名為 `couchbaseMappingContext` 的 [`CouchbaseMappingContext`][data--nosql-r97] [`@Bean`][data--nosql-r27]。
- 名為 `couchbaseCustomConversions` 的 [`CustomConversions`][data--nosql-r98] [`@Bean`][data--nosql-r27]。
- 名為 `couchbaseTemplate` 的 [`CouchbaseTemplate`][data--nosql-r95] [`@Bean`][data--nosql-r27]。

為避免在設定中寫死這些名稱，可以重用 Spring Data Couchbase 提供的 [`BeanNames`][data--nosql-r99]。
例如，可如下自訂要使用的轉換器：

```kotlin
import org.assertj.core.util.Arrays
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.data.couchbase.config.BeanNames
import org.springframework.data.couchbase.core.convert.CouchbaseCustomConversions

@Configuration(proxyBeanMethods = false)
class MyCouchbaseConfiguration {

	@Bean(BeanNames.COUCHBASE_CUSTOM_CONVERSIONS)
	fun myCustomConversions(): CouchbaseCustomConversions {
		return CouchbaseCustomConversions(Arrays.asList(MyConverter()))
	}

}
```

```java
import org.assertj.core.util.Arrays;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.couchbase.config.BeanNames;
import org.springframework.data.couchbase.core.convert.CouchbaseCustomConversions;

@Configuration(proxyBeanMethods = false)
public class MyCouchbaseConfiguration {

	@Bean(BeanNames.COUCHBASE_CUSTOM_CONVERSIONS)
	public CouchbaseCustomConversions myCustomConversions() {
		return new CouchbaseCustomConversions(Arrays.asList(new MyConverter()));
	}

}
```

## LDAP

[LDAP][data--nosql-r100]（Lightweight Directory Access Protocol，輕量型目錄存取協定）是開放、供應商中立的業界標準應用層協定，用於透過 IP 網路存取及維護分散式目錄資訊服務。
Spring Boot 為任何符合標準的 LDAP 伺服器提供自動設定，也支援 [UnboundID][data--nosql-r101] 的記憶體內嵌 LDAP 伺服器。

LDAP 抽象由 [Spring Data LDAP][data--nosql-r102] 提供。
`spring-boot-starter-data-ldap` starter 讓你方便地取得所需相依項。

### 連線至 LDAP 伺服器

若要連線至 LDAP 伺服器，請先宣告對 `spring-boot-starter-data-ldap` starter 或 `spring-ldap-core` 的相依性，再於 `application.properties` 宣告伺服器 URL，如下例所示：

```properties
spring.ldap.urls=ldap://myserver:1235
spring.ldap.username=admin
spring.ldap.password=secret
```

```yaml
spring:
  ldap:
    urls: "ldap://myserver:1235"
    username: "admin"
    password: "secret"
```

若需要自訂連線設定，可以使用 `spring.ldap.base` 與 `spring.ldap.base-environment` 屬性。

系統會依據這些設定，自動設定 [`LdapContextSource`][data--nosql-r103]。
若有 [`DirContextAuthenticationStrategy`][data--nosql-r104] Bean，會將它與自動設定的 [`LdapContextSource`][data--nosql-r103] 關聯。
若需要自訂，例如使用 [`PooledContextSource`][data--nosql-r105]，你仍可以注入自動設定的 [`LdapContextSource`][data--nosql-r103]。
務必將自訂 [`ContextSource`][data--nosql-r106] 標為 [`@Primary`][data--nosql-r107]，讓自動設定的 [`LdapTemplate`][data--nosql-r108] 使用它。

### Spring Data LDAP 儲存庫

Spring Data 包含 LDAP 儲存庫支援。

儲存庫與文件會透過掃描找到。
預設掃描[自動設定套件][data--nosql-r44]。
可以分別使用 [`@EnableLdapRepositories`][data--nosql-r109] 與 [`@EntityScan`][data--nosql-r46]，自訂儲存庫與文件的搜尋位置。

> **提示：**
>
> Spring Data LDAP 的完整細節，請參閱[參考文件][data--nosql-r110]。

你也可以像其他 Spring Bean 一樣，注入自動設定的 [`LdapTemplate`][data--nosql-r108] 實例，如下例所示：

```kotlin
import org.springframework.ldap.core.LdapTemplate
import org.springframework.stereotype.Component

@Component
class MyBean(private val template: LdapTemplate) {

	// ...

	fun someMethod(): List<User> {
		return template.findAll(User::class.java)
	}

}
```

```java
import java.util.List;

import org.springframework.ldap.core.LdapTemplate;
import org.springframework.stereotype.Component;

@Component
public class MyBean {

	private final LdapTemplate template;

	public MyBean(LdapTemplate template) {
		this.template = template;
	}

	// ...

	public List<User> someMethod() {
		return this.template.findAll(User.class);
	}

}
```

### 記憶體內嵌 LDAP 伺服器

為了測試，Spring Boot 支援自動設定 [UnboundID][data--nosql-r101] 的記憶體內 LDAP 伺服器。
若要設定伺服器，請加入 `com.unboundid:unboundid-ldapsdk` 相依項，並宣告 `spring.ldap.embedded.base-dn` 屬性，如下所示：

```properties
spring.ldap.embedded.base-dn=dc=spring,dc=io
```

```yaml
spring:
  ldap:
    embedded:
      base-dn: "dc=spring,dc=io"
```

> **注意：**
>
> 可以定義多個 base-dn 值；但由於識別名稱通常含有逗號，必須使用正確表示法。
>
> YAML 檔可使用 YAML 清單表示法。Properties 檔則必須將索引包含在屬性名稱中：
>
> ```properties
> spring.ldap.embedded.base-dn[0]=dc=spring,dc=io
> spring.ldap.embedded.base-dn[1]=dc=vmware,dc=com
> ```
>
> ```yaml
> spring.ldap.embedded.base-dn:
> - "dc=spring,dc=io"
> - "dc=vmware,dc=com"
> ```

預設伺服器會在隨機連接埠啟動，並觸發一般 LDAP 支援。
不需要指定 `spring.ldap.urls` 屬性。

若 classpath 上有 `schema.ldif`，會使用它初始化伺服器。
若想從其他資源載入初始化指令碼，也可以使用 `spring.ldap.embedded.ldif` 屬性。

預設使用標準綱要驗證 `LDIF` 檔。
可以設定 `spring.ldap.embedded.validation.enabled` 屬性，完全關閉驗證。
若有自訂屬性，可以使用 `spring.ldap.embedded.validation.schema` 定義自訂屬性型別或物件類別。

#### SSL

記憶體內 LDAP 伺服器支援 SSL（LDAPS）。
若要啟用 SSL，請設定 `spring.ldap.embedded.ssl.bundle` 屬性，指定要使用的 [SSL bundle][data--nosql-r28]，如下例所示：

```properties
spring.ldap.embedded.ssl.bundle=example
```

```yaml
spring:
  ldap:
    embedded:
      ssl:
        bundle: "example"
```

## 譯者註：MongoDB 設定前綴

原文的 `MongoClientSettings` 說明仍使用 `spring.data.mongodb`，但本頁連線範例使用 `spring.mongodb.*`。此處保留兩者以利對照；實際設定請以本版本的屬性清單與範例為準。

## 譯者補充：共同模式與資料庫差異

```mermaid
flowchart TD
  P[連線屬性與憑證] --> C[各資料庫用戶端]
  C --> T[Template：操作抽象]
  T --> R[Repository：介面與查詢方法]
  X[Customizer 或自訂 Bean] --> C
  X --> T
```

這些產品共用相似的 Spring 整合層次，但查詢語言、交易能力與資料模型仍由個別資料庫決定。

[data--nosql-r1]: https://spring.io/projects/spring-data-cassandra
[data--nosql-r2]: https://spring.io/projects/spring-data-couchbase
[data--nosql-r3]: https://spring.io/projects/spring-data-elasticsearch
[data--nosql-r4]: https://spring.io/projects/spring-data-geode
[data--nosql-r5]: https://spring.io/projects/spring-data-ldap
[data--nosql-r6]: https://spring.io/projects/spring-data-mongodb
[data--nosql-r7]: https://spring.io/projects/spring-data-neo4j
[data--nosql-r8]: https://spring.io/projects/spring-data-redis
[data--nosql-r9]: https://github.com/spring-projects/spring-boot-data-geode
[data--nosql-r10]: https://docs.spring.io/spring-boot-data-geode-build/2.0.x/reference/html5#geode-repositories
[data--nosql-r11]: https://spring.io/projects/spring-data
[data--nosql-r12]: https://redis.io/
[data--nosql-r13]: https://github.com/redis/lettuce/
[data--nosql-r14]: https://github.com/redis/jedis/
[data--nosql-r15]: https://github.com/spring-projects/spring-data-redis
[data--nosql-r16]: https://docs.spring.io/spring-data/redis/docs/4.1.x/api/org/springframework/data/redis/connection/RedisConnectionFactory.html
[data--nosql-r17]: https://docs.spring.io/spring-data/redis/docs/4.1.x/api/org/springframework/data/redis/core/StringRedisTemplate.html
[data--nosql-r18]: https://docs.spring.io/spring-data/redis/docs/4.1.x/api/org/springframework/data/redis/core/RedisTemplate.html
[data--nosql-r19]: https://docs.spring.io/spring-boot/4.1.1/api/java/org/springframework/boot/data/redis/autoconfigure/LettuceClientConfigurationBuilderCustomizer.html
[data--nosql-r20]: https://javadoc.io/doc/io.lettuce/lettuce-core/7.5.2.RELEASE/io/lettuce/core/resource/ClientResources.html
[data--nosql-r21]: https://docs.spring.io/spring-boot/4.1.1/api/java/org/springframework/boot/data/redis/autoconfigure/ClientResourcesBuilderCustomizer.html
[data--nosql-r22]: https://docs.spring.io/spring-boot/4.1.1/api/java/org/springframework/boot/data/redis/autoconfigure/JedisClientConfigurationBuilderCustomizer.html
[data--nosql-r23]: https://docs.spring.io/spring-data/redis/docs/4.1.x/api/org/springframework/data/redis/connection/RedisStandaloneConfiguration.html
[data--nosql-r24]: https://docs.spring.io/spring-data/redis/docs/4.1.x/api/org/springframework/data/redis/connection/RedisSentinelConfiguration.html
[data--nosql-r25]: https://docs.spring.io/spring-data/redis/docs/4.1.x/api/org/springframework/data/redis/connection/RedisClusterConfiguration.html
[data--nosql-r26]: https://docs.spring.io/spring-data/redis/docs/4.1.x/api/org/springframework/data/redis/connection/RedisStaticMasterReplicaConfiguration.html
[data--nosql-r27]: https://docs.spring.io/spring-framework/docs/7.0.x/javadoc-api/org/springframework/context/annotation/Bean.html
[data--nosql-r28]: https://docs.spring.io/spring-boot/4.1/reference/features/ssl.html
[data--nosql-r29]: https://docs.spring.io/spring-data/redis/docs/4.1.x/api/org/springframework/data/redis/annotation/RedisListener.html
[data--nosql-r30]: https://docs.spring.io/spring-data/redis/docs/4.1.x/api/org/springframework/data/redis/listener/RedisMessageListenerContainer.html
[data--nosql-r31]: https://docs.spring.io/spring-data/redis/docs/4.1.x/api/org/springframework/data/redis/annotation/EnableRedisListeners.html
[data--nosql-r32]: https://docs.spring.io/spring-boot/4.1.1/api/java/org/springframework/boot/data/redis/autoconfigure/RedisMessageListenerContainerConfigurer.html
[data--nosql-r33]: https://www.mongodb.com/
[data--nosql-r34]: https://docs.spring.io/spring-data/mongodb/docs/5.1.x/api/org/springframework/data/mongodb/MongoDatabaseFactory.html
[data--nosql-r35]: https://mongodb.github.io/mongo-java-driver/5.8/apidocs/mongodb-driver-sync/com/mongodb/client/MongoClient.html
[data--nosql-r36]: https://mongodb.github.io/mongo-java-driver/5.8/apidocs/mongodb-driver-core/com/mongodb/MongoClientSettings.html
[data--nosql-r37]: https://docs.spring.io/spring-boot/4.1.1/api/java/org/springframework/boot/mongodb/autoconfigure/MongoClientSettingsBuilderCustomizer.html
[data--nosql-r38]: https://mongodb.github.io/mongo-java-driver/5.8/apidocs/mongodb-driver-core/com/mongodb/MongoClientSettings.Builder.html
[data--nosql-r39]: https://docs.spring.io/cdn-cgi/l/email-protection
[data--nosql-r40]: https://docs.spring.io/spring-data/mongodb/docs/5.1.x/api/org/springframework/data/mongodb/core/MongoTemplate.html
[data--nosql-r41]: https://docs.spring.io/spring-framework/docs/7.0.x/javadoc-api/org/springframework/jdbc/core/JdbcTemplate.html
[data--nosql-r42]: https://docs.spring.io/spring-data/mongodb/docs/5.1.x/api/org/springframework/data/mongodb/core/MongoOperations.html
[data--nosql-r43]: https://jakarta.ee/specifications/persistence/3.2/apidocs/jakarta.persistence/jakarta/persistence/Entity.html
[data--nosql-r44]: https://docs.spring.io/spring-boot/4.1/reference/using/auto-configuration.html#using.auto-configuration.packages
[data--nosql-r45]: https://docs.spring.io/spring-data/mongodb/docs/5.1.x/api/org/springframework/data/mongodb/repository/config/EnableMongoRepositories.html
[data--nosql-r46]: https://docs.spring.io/spring-boot/4.1.1/api/java/org/springframework/boot/persistence/autoconfigure/EntityScan.html
[data--nosql-r47]: https://docs.spring.io/spring-data/mongodb/reference/5.1
[data--nosql-r48]: https://neo4j.com/
[data--nosql-r49]: https://javadoc.io/doc/org.neo4j.driver/neo4j-java-driver/6.1.0/org/neo4j/driver/Driver.html
[data--nosql-r50]: https://javadoc.io/doc/org.neo4j.driver/neo4j-java-driver/6.1.0/org/neo4j/driver/Session.html
[data--nosql-r51]: https://docs.spring.io/spring-boot/4.1.1/api/java/org/springframework/boot/neo4j/autoconfigure/ConfigBuilderCustomizer.html
[data--nosql-r52]: https://docs.spring.io/spring-data/neo4j/reference/8.1
[data--nosql-r53]: https://docs.spring.io/spring-data/neo4j/docs/8.1.x/api/org/springframework/data/neo4j/core/schema/Node.html
[data--nosql-r54]: https://docs.spring.io/spring-data/neo4j/docs/8.1.x/api/org/springframework/data/neo4j/core/Neo4jTemplate.html
[data--nosql-r55]: https://docs.spring.io/spring-data/neo4j/docs/8.1.x/api/org/springframework/data/neo4j/core/ReactiveNeo4jTemplate.html
[data--nosql-r56]: https://docs.spring.io/spring-data/neo4j/docs/8.1.x/api/org/springframework/data/neo4j/repository/config/EnableNeo4jRepositories.html
[data--nosql-r57]: https://docs.spring.io/spring-framework/docs/7.0.x/javadoc-api/org/springframework/transaction/ReactiveTransactionManager.html
[data--nosql-r58]: https://www.elastic.co/products/elasticsearch
[data--nosql-r59]: https://docs.spring.io/spring-data/elasticsearch/docs/6.1.x/api/org/springframework/data/elasticsearch/client/elc/ReactiveElasticsearchClient.html
[data--nosql-r60]: https://www.elastic.co/docs/reference/elasticsearch/clients/java/transport/rest5-client/
[data--nosql-r61]: https://www.elastic.co/docs/reference/elasticsearch/clients/java
[data--nosql-r62]: http://localhost:9200
[data--nosql-r63]: https://javadoc.io/doc/co.elastic.clients/elasticsearch-java/9.4.5/index.html/co/elastic/clients/transport/rest5_client/low_level/Rest5Client.html
[data--nosql-r64]: https://docs.spring.io/spring-boot/4.1.1/api/java/org/springframework/boot/elasticsearch/autoconfigure/Rest5ClientBuilderCustomizer.html
[data--nosql-r65]: https://javadoc.io/doc/co.elastic.clients/elasticsearch-java/9.4.5/index.html/co/elastic/clients/transport/rest5_client/low_level/Rest5ClientBuilder.html
[data--nosql-r66]: https://javadoc.io/doc/co.elastic.clients/elasticsearch-java/9.4.5/index.html/co/elastic/clients/transport/rest5_client/low_level/sniffer/Sniffer.html
[data--nosql-r67]: https://javadoc.io/doc/co.elastic.clients/elasticsearch-java/9.4.5/index.html/co/elastic/clients/elasticsearch/ElasticsearchClient.html
[data--nosql-r68]: https://javadoc.io/doc/co.elastic.clients/elasticsearch-java/9.4.5/index.html/co/elastic/clients/transport/rest5_client/Rest5ClientOptions.html
[data--nosql-r69]: https://docs.spring.io/spring-data/elasticsearch/docs/6.1.x/api/org/springframework/data/elasticsearch/client/elc/ElasticsearchTemplate.html
[data--nosql-r70]: https://docs.spring.io/spring-boot/4.1/reference/data/nosql.html#data.nosql.elasticsearch.connecting-using-rest.reactiveclient
[data--nosql-r71]: https://docs.spring.io/spring-data/elasticsearch/docs/6.1.x/api/org/springframework/data/elasticsearch/client/elc/ReactiveElasticsearchTemplate.html
[data--nosql-r72]: https://docs.spring.io/spring-data/elasticsearch/docs/6.1.x/api/org/springframework/data/elasticsearch/annotations/Document.html
[data--nosql-r73]: https://docs.spring.io/spring-data/elasticsearch/docs/6.1.x/api/org/springframework/data/elasticsearch/repository/config/EnableElasticsearchRepositories.html
[data--nosql-r74]: https://docs.spring.io/spring-data/elasticsearch/reference/6.1
[data--nosql-r75]: https://docs.spring.io/spring-data/elasticsearch/docs/6.1.x/api/org/springframework/data/elasticsearch/core/ElasticsearchOperations.html
[data--nosql-r76]: https://docs.spring.io/spring-data/elasticsearch/docs/6.1.x/api/org/springframework/data/elasticsearch/core/ReactiveElasticsearchOperations.html
[data--nosql-r77]: https://cassandra.apache.org/
[data--nosql-r78]: https://docs.spring.io/spring-data/cassandra/docs/5.1.x/api/org/springframework/data/cassandra/core/cql/CqlTemplate.html
[data--nosql-r79]: https://docs.spring.io/spring-data/cassandra/docs/5.1.x/api/org/springframework/data/cassandra/core/CassandraTemplate.html
[data--nosql-r80]: https://docs.spring.io/spring-boot/4.1.1/api/java/org/springframework/boot/cassandra/autoconfigure/DriverConfigLoaderBuilderCustomizer.html
[data--nosql-r81]: https://docs.spring.io/spring-boot/4.1.1/api/java/org/springframework/boot/cassandra/autoconfigure/CqlSessionBuilderCustomizer.html
[data--nosql-r82]: https://docs.spring.io/spring-data/cassandra/docs/5.1.x/api/org/springframework/data/cassandra/repository/Query.html
[data--nosql-r83]: https://docs.spring.io/spring-data/cassandra/docs/5.1.x/api/org/springframework/data/cassandra/repository/config/EnableCassandraRepositories.html
[data--nosql-r84]: https://docs.spring.io/spring-data/cassandra/reference/5.1
[data--nosql-r85]: https://www.couchbase.com/
[data--nosql-r86]: https://github.com/spring-projects/spring-data-couchbase
[data--nosql-r87]: https://javadoc.io/doc/com.couchbase.client/java-client/3.11.3/com/couchbase/client/java/Cluster.html
[data--nosql-r88]: https://docs.couchbase.com/dotnet-sdk/current/howtos/managing-connections.html
[data--nosql-r89]: https://docs.couchbase.com/server/current/manage/manage-security/configure-client-certificates.html
[data--nosql-r90]: https://javadoc.io/doc/com.couchbase.client/java-client/3.11.3/com/couchbase/client/java/env/ClusterEnvironment.html
[data--nosql-r91]: https://javadoc.io/doc/com.couchbase.client/java-client/3.11.3/com/couchbase/client/java/Bucket.html
[data--nosql-r92]: https://docs.spring.io/spring-boot/4.1.1/api/java/org/springframework/boot/couchbase/autoconfigure/ClusterEnvironmentBuilderCustomizer.html
[data--nosql-r93]: https://docs.spring.io/spring-data/couchbase/docs/6.1.x/api/org/springframework/data/couchbase/repository/config/EnableCouchbaseRepositories.html
[data--nosql-r94]: https://docs.spring.io/spring-data/couchbase/reference/6.1
[data--nosql-r95]: https://docs.spring.io/spring-data/couchbase/docs/6.1.x/api/org/springframework/data/couchbase/core/CouchbaseTemplate.html
[data--nosql-r96]: https://docs.spring.io/spring-data/couchbase/docs/6.1.x/api/org/springframework/data/couchbase/CouchbaseClientFactory.html
[data--nosql-r97]: https://docs.spring.io/spring-data/couchbase/docs/6.1.x/api/org/springframework/data/couchbase/core/mapping/CouchbaseMappingContext.html
[data--nosql-r98]: https://docs.spring.io/spring-data/commons/docs/4.1.x/api/org/springframework/data/convert/CustomConversions.html
[data--nosql-r99]: https://docs.spring.io/spring-data/couchbase/docs/6.1.x/api/org/springframework/data/couchbase/config/BeanNames.html
[data--nosql-r100]: https://en.wikipedia.org/wiki/Lightweight_Directory_Access_Protocol
[data--nosql-r101]: https://ldap.com/unboundid-ldap-sdk-for-java/
[data--nosql-r102]: https://github.com/spring-projects/spring-data-ldap
[data--nosql-r103]: https://docs.spring.io/spring-ldap/docs/4.1.x/api/org/springframework/ldap/core/support/LdapContextSource.html
[data--nosql-r104]: https://docs.spring.io/spring-ldap/docs/4.1.x/api/org/springframework/ldap/core/support/DirContextAuthenticationStrategy.html
[data--nosql-r105]: https://docs.spring.io/spring-ldap/docs/4.1.x/api/org/springframework/ldap/pool2/factory/PooledContextSource.html
[data--nosql-r106]: https://docs.spring.io/spring-ldap/docs/4.1.x/api/org/springframework/ldap/core/ContextSource.html
[data--nosql-r107]: https://docs.spring.io/spring-framework/docs/7.0.x/javadoc-api/org/springframework/context/annotation/Primary.html
[data--nosql-r108]: https://docs.spring.io/spring-ldap/docs/4.1.x/api/org/springframework/ldap/core/LdapTemplate.html
[data--nosql-r109]: https://docs.spring.io/spring-data/ldap/docs/4.1.x/api/org/springframework/data/ldap/repository/config/EnableLdapRepositories.html
[data--nosql-r110]: https://docs.spring.io/spring-data/ldap/reference/4.1
