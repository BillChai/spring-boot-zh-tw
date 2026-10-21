# Working with NoSQL Technologies

Spring Data provides additional projects that help you access a variety of NoSQL technologies, including:

- [Cassandra][r1]
- [Couchbase][r2]
- [Elasticsearch][r3]
- [Geode][r4]
- [LDAP][r5]
- [MongoDB][r6]
- [Neo4J][r7]
- [Redis][r8]

Of these, Spring Boot provides auto-configuration for Cassandra, Couchbase, Elasticsearch, LDAP, MongoDB, Neo4J and Redis.
Additionally, [Spring Boot for Apache Geode][r9] provides [auto-configuration for Apache Geode][r10].
You can make use of the other projects, but you must configure them yourself.
See the appropriate reference documentation at [spring.io/projects/spring-data][r11].

## Redis

[Redis][r12] is a cache, message broker, and richly-featured key-value store.
Spring Boot offers basic auto-configuration for the [Lettuce][r13] and [Jedis][r14] client libraries and the abstractions on top of them provided by [Spring Data Redis][r15].

There is a `spring-boot-starter-data-redis` starter for collecting the dependencies in a convenient way.
By default, it uses [Lettuce][r13].
That starter handles both traditional and reactive applications.

> [TIP]
>
> We also provide a `spring-boot-starter-data-redis-reactive` starter for consistency with the other stores with reactive support.

### Connecting to Redis

You can inject an auto-configured [`RedisConnectionFactory`][r16], [`StringRedisTemplate`][r17], or vanilla [`RedisTemplate`][r18] instance as you would any other Spring Bean.
The following listing shows an example of such a bean:

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

By default, the instance tries to connect to a Redis server at `localhost:6379`.
You can specify custom connection details using `spring.data.redis.*` properties, as shown in the following example:

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

You can also specify the url of the Redis server directly.
When setting the url, the host, port, username and password properties are ignored.
This is shown in the following example:

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

> [TIP]
>
> You can also register an arbitrary number of beans that implement [`LettuceClientConfigurationBuilderCustomizer`][r19] for more advanced customizations.
> [`ClientResources`][r20] can also be customized using [`ClientResourcesBuilderCustomizer`][r21].
> If you use Jedis, [`JedisClientConfigurationBuilderCustomizer`][r22] is also available.

Alternatively, you can register a bean of type [`RedisStandaloneConfiguration`][r23], [`RedisSentinelConfiguration`][r24], [`RedisClusterConfiguration`][r25], or [`RedisStaticMasterReplicaConfiguration`][r26] to take full control over the configuration.

> [NOTE]
>
> master/replica is not supported by Jedis.

If you add your own [`@Bean`][r27] of any of the auto-configured types, it replaces the default (except in the case of [`RedisTemplate`][r18], when the exclusion is based on the bean name, `redisTemplate`, not its type).

By default, a pooled connection factory is auto-configured if `commons-pool2` is on the classpath.

The auto-configured [`RedisConnectionFactory`][r16] can be configured to use SSL for communication with the server by setting the properties as shown in this example:

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

Custom SSL trust material can be configured in an [SSL bundle][r28] and applied to the [`RedisConnectionFactory`][r16] as shown in this example:

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

### Receiving a Message

When the Redis infrastructure is present, any bean can be annotated with [`@RedisListener`][r29] to create a listener endpoint.
If no [`RedisMessageListenerContainer`][r30] has been defined, a default one is configured automatically.

The following component creates a listener endpoint on the `someChannel` channel:

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

> [TIP]
>
> See the [`@EnableRedisListeners`][r31] API documentation for more details.

If you need to create more [`RedisMessageListenerContainer`][r30] instances or if you want to override the default, Spring Boot provides a [`RedisMessageListenerContainerConfigurer`][r32] that you can use to initialize a [`RedisMessageListenerContainer`][r30] with the same settings as the one that is auto-configured.

For instance, the following example exposes another container that uses a specific [`RedisConnectionFactory`][r16]:

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

Then you can use the container in any [`@RedisListener`][r29]-annotated method as follows:

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

[MongoDB][r33] is an open-source NoSQL document database that uses a JSON-like schema instead of traditional table-based relational data.
Spring Boot offers several conveniences for working with MongoDB, including the `spring-boot-starter-data-mongodb` and `spring-boot-starter-data-mongodb-reactive` starters.

### Connecting to a MongoDB Database

To access MongoDB databases, you can inject an auto-configured [`MongoDatabaseFactory`][r34].
By default, the instance tries to connect to a MongoDB server at `mongodb://localhost/test`.
The following example shows how to connect to a MongoDB database:

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

If you have defined your own [`MongoClient`][r35], it will be used to auto-configure a suitable [`MongoDatabaseFactory`][r34].

The auto-configured [`MongoClient`][r35] is created using a [`MongoClientSettings`][r36] bean.
If you have defined your own [`MongoClientSettings`][r36], it will be used without modification and the `spring.data.mongodb` properties will be ignored.
Otherwise a [`MongoClientSettings`][r36] will be auto-configured and will have the `spring.data.mongodb` properties applied to it.
In either case, you can declare one or more [`MongoClientSettingsBuilderCustomizer`][r37] beans to fine-tune the [`MongoClientSettings`][r36] configuration.
Each will be called in order with the [`MongoClientSettings.Builder`][r38] that is used to build the [`MongoClientSettings`][r36].

You can set the `spring.mongodb.uri` property to change the URL and configure additional settings such as the *replica set*, as shown in the following example:

```properties
spring.mongodb.uri=mongodb://user:[email protected]:27017,mongoserver2.example.com:23456/test
```

```yaml
spring:
  mongodb:
    uri: "mongodb://user:[email protected]:27017,mongoserver2.example.com:23456/test"
```

Alternatively, you can specify connection details using discrete properties.
For example, you might declare the following settings in your `application.properties`:

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

The auto-configured [`MongoClient`][r35] can be configured to use SSL for communication with the server by setting the properties as shown in this example:

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

Custom SSL trust material can be configured in an [SSL bundle][r28] and applied to the [`MongoClient`][r35] as shown in this example:

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

> [TIP]
>
> If `spring.mongodb.port` is not specified, the default of `27017` is used.
> You could delete this line from the example shown earlier.
>
> You can also specify the port as part of the host address by using the `host:port` syntax.
> This format should be used if you need to change the port of an `additional-hosts` entry.

> [TIP]
>
> If you do not use Spring Data MongoDB, you can inject a [`MongoClient`][r35] bean instead of using [`MongoDatabaseFactory`][r34].
> If you want to take complete control of establishing the MongoDB connection, you can also declare your own [`MongoDatabaseFactory`][r34] or [`MongoClient`][r35] bean.

> [NOTE]
>
> If you are using the reactive driver, Netty is required for SSL.
> The auto-configuration configures this factory automatically if Netty is available and the factory to use has not been customized already.

### MongoTemplate

[Spring Data MongoDB][r6] provides a [`MongoTemplate`][r40] class that is very similar in its design to Spring’s [`JdbcTemplate`][r41].
As with [`JdbcTemplate`][r41], Spring Boot auto-configures a bean for you to inject the template, as follows:

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

See the [`MongoOperations`][r42] API documentation for complete details.

### Spring Data MongoDB Repositories

Spring Data includes repository support for MongoDB.
As with the JPA repositories discussed earlier, the basic principle is that queries are constructed automatically, based on method names.

In fact, both Spring Data JPA and Spring Data MongoDB share the same common infrastructure.
You could take the JPA example from earlier and, assuming that `City` is now a MongoDB data class rather than a JPA [`@Entity`][r43], it works in the same way, as shown in the following example:

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

Repositories and documents are found through scanning.
By default, the [auto-configuration packages][r44] are scanned.
You can customize the locations to look for repositories and documents by using [`@EnableMongoRepositories`][r45] and [`@EntityScan`][r46] respectively.

> [TIP]
>
> For complete details of Spring Data MongoDB, including its rich object mapping technologies, see its [reference documentation][r47].

## Neo4j

[Neo4j][r48] is an open-source NoSQL graph database that uses a rich data model of nodes connected by first class relationships, which is better suited for connected big data than traditional RDBMS approaches.
Spring Boot offers several conveniences for working with Neo4j, including the `spring-boot-starter-data-neo4j` starter.

### Connecting to a Neo4j Database

To access a Neo4j server, you can inject an auto-configured [`Driver`][r49].
By default, the instance tries to connect to a Neo4j server at `localhost:7687` using the Bolt protocol.
The following example shows how to inject a Neo4j [`Driver`][r49] that gives you access, amongst other things, to a [`Session`][r50]:

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

You can configure various aspects of the driver using `spring.neo4j.*` properties.
The following example shows how to configure the uri and credentials to use:

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

The auto-configured [`Driver`][r49] is created using `org.neo4j.driver.Config$ConfigBuilder`.
To fine-tune its configuration, declare one or more [`ConfigBuilderCustomizer`][r51] beans.
Each will be called in order with the `org.neo4j.driver.Config$ConfigBuilder` that is used to build the [`Driver`][r49].

### Spring Data Neo4j Repositories

Spring Data includes repository support for Neo4j.
For complete details of Spring Data Neo4j, see the [reference documentation][r52].

Spring Data Neo4j shares the common infrastructure with Spring Data JPA as many other Spring Data modules do.
You could take the JPA example from earlier and define `City` as Spring Data Neo4j [`@Node`][r53] rather than JPA [`@Entity`][r43] and the repository abstraction works in the same way, as shown in the following example:

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

The `spring-boot-starter-data-neo4j` starter enables the repository support as well as transaction management.
Spring Boot supports both classic and reactive Neo4j repositories, using the [`Neo4jTemplate`][r54] or [`ReactiveNeo4jTemplate`][r55] beans.
When Project Reactor is available on the classpath, the reactive style is also auto-configured.

Repositories and entities are found through scanning.
By default, the [auto-configuration packages][r44] are scanned.
You can customize the locations to look for repositories and entities by using [`@EnableNeo4jRepositories`][r56] and [`@EntityScan`][r46] respectively.

> [NOTE]
>
> In an application using the reactive style, a [`ReactiveTransactionManager`][r57] is not auto-configured.
> To enable transaction management, the following bean must be defined in your configuration:
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

[Elasticsearch][r58] is an open source, distributed, RESTful search and analytics engine.
Spring Boot offers basic auto-configuration for Elasticsearch clients.

Spring Boot supports several clients:

- The official low-level REST client
- The official Java API client
- The [`ReactiveElasticsearchClient`][r59] provided by Spring Data Elasticsearch

Spring Boot provides a dedicated starter, `spring-boot-starter-data-elasticsearch`.

### Connecting to Elasticsearch Using REST clients

Elasticsearch ships two different REST clients that you can use to query a cluster: the [low-level client][r60] and the [Java API client][r61].
The Java API client is provided by the `co.elastic.clients:elasticsearch-java` module and
the low-level client is provided by the `co.elastic.clients:elasticsearch-rest5-client` module.
Additionally, Spring Boot provides support for a reactive client from the `org.springframework.data:spring-data-elasticsearch` module.
By default, the clients will target `[localhost:9200][r62]`.
You can use `spring.elasticsearch.*` properties to further tune how the clients are configured, as shown in the following example:

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

#### Connecting to Elasticsearch Using Rest5Client

If you have `co.elastic.clients:elasticsearch-rest5-client` on the classpath, Spring Boot will auto-configure and register a [`Rest5Client`][r63] bean.
In addition to the properties described previously, to fine-tune the [`Rest5Client`][r63] you can register an arbitrary number of beans that implement [`Rest5ClientBuilderCustomizer`][r64] for more advanced customizations.
To take full control over the client’s configuration, define a [`Rest5ClientBuilder`][r65] bean.

Additionally, a [`Sniffer`][r66] can be auto-configured to automatically discover nodes from a running Elasticsearch cluster and set them on the [`Rest5Client`][r63] bean.
You can further tune how [`Sniffer`][r66] is configured, as shown in the following example:

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

#### Connecting to Elasticsearch Using ElasticsearchClient

If you use the `spring-boot-starter-elasticsearch` or have added `co.elastic.clients:elasticsearch-java` to the classpath, Spring Boot will auto-configure and register an [`ElasticsearchClient`][r67] bean.

The [`ElasticsearchClient`][r67] uses a transport that depends upon the previously described [`Rest5Client`][r63].
Therefore, the properties described previously can be used to configure the [`ElasticsearchClient`][r67].
Furthermore, you can define a [`Rest5ClientOptions`][r68] bean to take further control of the behavior of the transport.

#### Connecting to Elasticsearch using ReactiveElasticsearchClient

[Spring Data Elasticsearch][r3] ships [`ReactiveElasticsearchClient`][r59] for querying Elasticsearch instances in a reactive fashion.
If you have Spring Data Elasticsearch and Reactor on the classpath, Spring Boot will auto-configure and register a [`ReactiveElasticsearchClient`][r59].

The [`ReactiveElasticsearchClient`][r59] uses a transport that depends upon the previously described [`Rest5Client`][r63].
Therefore, the properties described previously can be used to configure the [`ReactiveElasticsearchClient`][r59].
Furthermore, you can define a [`Rest5ClientOptions`][r68] bean to take further control of the behavior of the transport.

### Connecting to Elasticsearch by Using Spring Data

To connect to Elasticsearch, an [`ElasticsearchClient`][r67] bean must be defined,
auto-configured by Spring Boot or manually provided by the application (see previous sections).
With this configuration in place, an
[`ElasticsearchTemplate`][r69] can be injected like any other Spring bean,
as shown in the following example:

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

In the presence of `spring-data-elasticsearch` and Reactor, Spring Boot can also auto-configure a [`ReactiveElasticsearchClient`][r70] and a [`ReactiveElasticsearchTemplate`][r71] as beans.
They are the reactive equivalent of the other REST clients.

### Spring Data Elasticsearch Repositories

Spring Data includes repository support for Elasticsearch.
As with the JPA repositories discussed earlier, the basic principle is that queries are constructed for you automatically based on method names.

In fact, both Spring Data JPA and Spring Data Elasticsearch share the same common infrastructure.
You could take the JPA example from earlier and, assuming that `City` is now an Elasticsearch [`@Document`][r72] class rather than a JPA [`@Entity`][r43], it works in the same way.

Repositories and documents are found through scanning.
By default, the [auto-configuration packages][r44] are scanned.
You can customize the locations to look for repositories and documents by using [`@EnableElasticsearchRepositories`][r73] and [`@EntityScan`][r46] respectively.

> [TIP]
>
> For complete details of Spring Data Elasticsearch, see the [reference documentation][r74].

Spring Boot supports both classic and reactive Elasticsearch repositories, using the [`ElasticsearchTemplate`][r69] or [`ReactiveElasticsearchTemplate`][r71] beans.
Most likely those beans are auto-configured by Spring Boot given the required dependencies are present.

If you wish to use your own template for backing the Elasticsearch repositories, you can add your own [`ElasticsearchTemplate`][r69] or [`ElasticsearchOperations`][r75] [`@Bean`][r27], as long as it is named `"elasticsearchTemplate"`.
Same applies to [`ReactiveElasticsearchTemplate`][r71] and [`ReactiveElasticsearchOperations`][r76], with the bean name `"reactiveElasticsearchTemplate"`.

You can choose to disable the repositories support with the following property:

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

[Cassandra][r77] is an open source, distributed database management system designed to handle large amounts of data across many commodity servers.
Spring Boot offers auto-configuration for Cassandra and the abstractions on top of it provided by [Spring Data Cassandra][r1].
There is a `spring-boot-starter-data-cassandra` starter for collecting the dependencies in a convenient way.

### Connecting to Cassandra

You can inject an auto-configured [`CqlTemplate`][r78], [`CassandraTemplate`][r79], or a Cassandra `CqlSession` instance as you would with any other Spring Bean.
The `spring.cassandra.*` properties can be used to customize the connection.
Generally, you provide `keyspace-name` and `contact-points` as well the local datacenter name, as shown in the following example:

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

If the port is the same for all your contact points you can use a shortcut and only specify the host names, as shown in the following example:

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

> [TIP]
>
> Those two examples are identical as the port default to `9042`.
> If you need to configure the port, use `spring.cassandra.port`.

The auto-configured `CqlSession` can be configured to use SSL for communication with the server by setting the properties as shown in this example:

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

Custom SSL trust material can be configured in an [SSL bundle][r28] and applied to the `CqlSession` as shown in this example:

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

> [NOTE]
>
> The Cassandra driver has its own configuration infrastructure that loads an `application.conf` at the root of the classpath.
>
> Spring Boot does not look for such a file by default but can load one using `spring.cassandra.config`.
> If a property is both present in `spring.cassandra.*` and the configuration file, the value in `spring.cassandra.*` takes precedence.
>
> For more advanced driver customizations, you can register an arbitrary number of beans that implement [`DriverConfigLoaderBuilderCustomizer`][r80].
> The `CqlSession` can be customized with a bean of type [`CqlSessionBuilderCustomizer`][r81].

> [NOTE]
>
> If you use `CqlSessionBuilder` to create multiple `CqlSession` beans, keep in mind the builder is mutable so make sure to inject a fresh copy for each session.

The following code listing shows how to inject a Cassandra bean:

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

If you add your own [`@Bean`][r27] of type [`CassandraTemplate`][r79], it replaces the default.

### Spring Data Cassandra Repositories

Spring Data includes basic repository support for Cassandra.
Currently, this is more limited than the JPA repositories discussed earlier and needs [`@Query`][r82] annotated finder methods.

Repositories and entities are found through scanning.
By default, the [auto-configuration packages][r44] are scanned.
You can customize the locations to look for repositories and entities by using [`@EnableCassandraRepositories`][r83] and [`@EntityScan`][r46] respectively.

> [TIP]
>
> For complete details of Spring Data Cassandra, see the [reference documentation][r84].

## Couchbase

[Couchbase][r85] is an open-source, distributed, multi-model NoSQL document-oriented database that is optimized for interactive applications.
Spring Boot offers auto-configuration for Couchbase and the abstractions on top of it provided by [Spring Data Couchbase][r86].
There are `spring-boot-starter-data-couchbase` and `spring-boot-starter-data-couchbase-reactive` starters for collecting the dependencies in a convenient way.

### Connecting to Couchbase

You can get a [`Cluster`][r87] by adding the Couchbase SDK and some configuration.
The `spring.couchbase.*` properties can be used to customize the connection.
Generally, you provide the [connection string][r88] and credentials for authentication. Basic authentication with username and password can be configured as shown in the following example:

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

[Client certificates][r89] can be used for authentication instead of username and password.
The location and password for a Java KeyStore containing client certificates can be configured as shown in the following example:

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

PEM-encoded certificates and a private key can be configured as shown in the following example:

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

It is also possible to customize some of the [`ClusterEnvironment`][r90] settings.
For instance, the following configuration changes the timeout to open a new [`Bucket`][r91] and enables SSL support with a reference to a configured [SSL bundle][r28]:

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

> [TIP]
>
> Check the `spring.couchbase.env.*` properties for more details.
> To take more control, one or more [`ClusterEnvironmentBuilderCustomizer`][r92] beans can be used.

### Spring Data Couchbase Repositories

Spring Data includes repository support for Couchbase.

Repositories and documents are found through scanning.
By default, the [auto-configuration packages][r44] are scanned.
You can customize the locations to look for repositories and documents by using [`@EnableCouchbaseRepositories`][r93] and [`@EntityScan`][r46] respectively.

For complete details of Spring Data Couchbase, see the [reference documentation][r94].

You can inject an auto-configured [`CouchbaseTemplate`][r95] instance as you would with any other Spring Bean, provided a [`CouchbaseClientFactory`][r96] bean is available.
This happens when a [`Cluster`][r87] is available, as described above, and a bucket name has been specified:

```properties
spring.data.couchbase.bucket-name=my-bucket
```

```yaml
spring:
  data:
    couchbase:
      bucket-name: "my-bucket"
```

The following examples shows how to inject a [`CouchbaseTemplate`][r95] bean:

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

There are a few beans that you can define in your own configuration to override those provided by the auto-configuration:

- A [`CouchbaseMappingContext`][r97] [`@Bean`][r27] with a name of `couchbaseMappingContext`.
- A [`CustomConversions`][r98] [`@Bean`][r27] with a name of `couchbaseCustomConversions`.
- A [`CouchbaseTemplate`][r95] [`@Bean`][r27] with a name of `couchbaseTemplate`.

To avoid hard-coding those names in your own config, you can reuse [`BeanNames`][r99] provided by Spring Data Couchbase.
For instance, you can customize the converters to use, as follows:

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

[LDAP][r100] (Lightweight Directory Access Protocol) is an open, vendor-neutral, industry standard application protocol for accessing and maintaining distributed directory information services over an IP network.
Spring Boot offers auto-configuration for any compliant LDAP server as well as support for the embedded in-memory LDAP server from [UnboundID][r101].

LDAP abstractions are provided by [Spring Data LDAP][r102].
There is a `spring-boot-starter-data-ldap` starter for collecting the dependencies in a convenient way.

### Connecting to an LDAP Server

To connect to an LDAP server, make sure you declare a dependency on the `spring-boot-starter-data-ldap` starter or `spring-ldap-core` and then declare the URLs of your server in your application.properties, as shown in the following example:

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

If you need to customize connection settings, you can use the `spring.ldap.base` and `spring.ldap.base-environment` properties.

An [`LdapContextSource`][r103] is auto-configured based on these settings.
If a [`DirContextAuthenticationStrategy`][r104] bean is available, it is associated to the auto-configured [`LdapContextSource`][r103].
If you need to customize it, for instance to use a [`PooledContextSource`][r105], you can still inject the auto-configured [`LdapContextSource`][r103].
Make sure to flag your customized [`ContextSource`][r106] as [`@Primary`][r107] so that the auto-configured [`LdapTemplate`][r108] uses it.

### Spring Data LDAP Repositories

Spring Data includes repository support for LDAP.

Repositories and documents are found through scanning.
By default, the [auto-configuration packages][r44] are scanned.
You can customize the locations to look for repositories and documents by using [`@EnableLdapRepositories`][r109] and [`@EntityScan`][r46] respectively.

> [TIP]
>
> For complete details of Spring Data LDAP, see the [reference documentation][r110].

You can also inject an auto-configured [`LdapTemplate`][r108] instance as you would with any other Spring Bean, as shown in the following example:

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

### Embedded In-memory LDAP Server

For testing purposes, Spring Boot supports auto-configuration of an in-memory LDAP server from [UnboundID][r101].
To configure the server, add a dependency to `com.unboundid:unboundid-ldapsdk` and declare a `spring.ldap.embedded.base-dn` property, as follows:

```properties
spring.ldap.embedded.base-dn=dc=spring,dc=io
```

```yaml
spring:
  ldap:
    embedded:
      base-dn: "dc=spring,dc=io"
```

> [NOTE]
>
> It is possible to define multiple base-dn values, however, since distinguished names usually contain commas, they must be defined using the correct notation.
>
> In yaml files, you can use the yaml list notation. In properties files, you must include the index as part of the property name:
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

By default, the server starts on a random port and triggers the regular LDAP support.
There is no need to specify a `spring.ldap.urls` property.

If there is a `schema.ldif` file on your classpath, it is used to initialize the server.
If you want to load the initialization script from a different resource, you can also use the `spring.ldap.embedded.ldif` property.

By default, a standard schema is used to validate `LDIF` files.
You can turn off validation altogether by setting the `spring.ldap.embedded.validation.enabled` property.
If you have custom attributes, you can use `spring.ldap.embedded.validation.schema` to define your custom attribute types or object classes.

#### SSL

The in-memory LDAP server supports SSL (LDAPS).
To enable SSL, configure the [SSL bundle][r28] to use by setting the `spring.ldap.embedded.ssl.bundle` property, as shown in the following example:

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
