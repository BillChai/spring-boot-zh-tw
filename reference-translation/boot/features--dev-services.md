# 開發期間的服務

<!-- source-attribution -->
> **非官方繁體中文翻譯** · Spring Boot 4.1.1 · 翻譯日期：2026-10-21  
> [官方英文網站](https://docs.spring.io/spring-boot/4.1/reference/features/dev-services.html) · [固定版本英文來源](https://github.com/spring-projects/spring-boot/blob/v4.1.1/documentation/spring-boot-docs/src/docs/antora/modules/reference/pages/features/dev-services.adoc) · [本地原文快照](../sources/spring-boot/documentation/spring-boot-docs/src/docs/antora/modules/reference/pages/features/dev-services.adoc)  
> 原始作者與授權見 [來源聲明](../NOTICE.md)。官方範例及設定鍵保留原文，額外圖解另標示為譯者補充。

<!-- translation-status: translated -->

開發期間的服務提供開發應用程式時執行所需的外部依賴。它們只應用於開發期間，部署應用程式後便會停用。

Spring Boot 支援 Docker Compose 與 Testcontainers 這兩種開發期間服務。以下各節將詳細介紹。

## Docker Compose 支援

Docker Compose 是廣泛使用的技術，可定義及管理應用程式所需服務的多個容器。通常會在應用程式旁建立 `compose.yml`，定義並設定服務容器。

典型的 Docker Compose 工作流程是執行 `docker compose up`，讓應用程式連線至已啟動的服務並進行開發，完成後執行 `docker compose down`。

專案可加入 `spring-boot-docker-compose` 模組，取得使用 Docker Compose 容器的支援。將模組依賴加入建置設定，如下列 Maven 與 Gradle 範例所示：

Maven

```xml
<dependencies>
	<dependency>
		<groupId>org.springframework.boot</groupId>
		<artifactId>spring-boot-docker-compose</artifactId>
		<optional>true</optional>
	</dependency>
</dependencies>
```

Gradle

```gradle
dependencies {
	developmentOnly("org.springframework.boot:spring-boot-docker-compose")
}
```

加入此模組依賴後，Spring Boot 會：

- 在工作目錄搜尋 `compose.yml` 與其他常見的 Compose 檔名。
- 使用找到的 `compose.yml` 呼叫 `docker compose up`。
- 為每個支援的容器建立服務連線 Bean。
- 在應用程式關閉時呼叫 `docker compose stop`。

若啟動應用程式時 Docker Compose 服務已在執行，Spring Boot 只會為支援的容器建立服務連線 Bean，不會再次呼叫 `docker compose up`，也不會在應用程式關閉時呼叫 `docker compose stop`。

> **提示：**
>
> 重新封裝的封存檔預設不包含 Spring Boot 的 Docker Compose 支援。若要使用，必須將它納入。使用 Maven 外掛時，將 `excludeDockerCompose` 設為 `false`；使用 Gradle 外掛時，[設定工作的 classpath，使其包含 `developmentOnly` 設定][features--dev-services-r1]。

### 先決條件

你的 PATH 必須能找到 `docker` 與 `docker compose`（或 `docker-compose`）命令列程式。最低支援的 Docker Compose 版本為 2.2.0。

### 服務連線

服務連線是連往任何遠端服務的連線。Spring Boot 自動設定可以使用服務連線的詳細資訊，建立遠端服務連線。此時，連線詳細資訊的優先順序高於任何與連線有關的設定屬性。

使用 Spring Boot 的 Docker Compose 支援時，服務連線會連往容器映射的連接埠。

> **注意：**
>
> Docker Compose 的常見用法，是將容器內部的連接埠映射到電腦上的暫時連接埠。例如 Postgres 伺服器可能在容器中使用 5432，但在本機映射為完全不同的連接埠。服務連線一律會探索並使用本機映射的連接埠。

服務連線根據容器的映像名稱建立。目前支援下列服務連線：

| 連線詳細資訊 | 比對條件 |
| --- | --- |
| [`ActiveMQConnectionDetails`][features--dev-services-r2] | 映像名稱為 "symptoma/activemq"、"apache/activemq-classic" 或 "apache/activemq" 的容器 |
| [`ArtemisConnectionDetails`][features--dev-services-r3] | 映像名稱為 "apache/activemq-artemis" 或 "apache/artemis" 的容器 |
| [`CassandraConnectionDetails`][features--dev-services-r4] | 映像名稱為 "cassandra" 的容器 |
| [`ElasticsearchConnectionDetails`][features--dev-services-r5] | 映像名稱為 "elasticsearch" 或 "elasticsearch/elasticsearch" 的容器 |
| [`HazelcastConnectionDetails`][features--dev-services-r6] | 映像名稱為 "hazelcast/hazelcast" 的容器 |
| [`JdbcConnectionDetails`][features--dev-services-r7] | 映像名稱為 "clickhouse/clickhouse-server"、"gvenzl/oracle-free"、"gvenzl/oracle-xe"、"mariadb"、"mssql/server"、"mysql" 或 "postgres" 的容器 |
| [`LdapConnectionDetails`][features--dev-services-r8] | 映像名稱為 "osixia/openldap" 或 "lldap/lldap" 的容器 |
| [`MongoConnectionDetails`][features--dev-services-r9] | 映像名稱為 "mongo" 的容器 |
| [`Neo4jConnectionDetails`][features--dev-services-r10] | 映像名稱為 "neo4j" 的容器 |
| [`OtlpLoggingConnectionDetails`][features--dev-services-r11] | 映像名稱為 "otel/opentelemetry-collector-contrib" 或 "grafana/otel-lgtm" 的容器 |
| [`OtlpMetricsConnectionDetails`][features--dev-services-r12] | 映像名稱為 "otel/opentelemetry-collector-contrib" 或 "grafana/otel-lgtm" 的容器 |
| [`OtlpTracingConnectionDetails`][features--dev-services-r13] | 映像名稱為 "otel/opentelemetry-collector-contrib" 或 "grafana/otel-lgtm" 的容器 |
| [`PulsarConnectionDetails`][features--dev-services-r14] | 映像名稱為 "apachepulsar/pulsar" 的容器 |
| [`R2dbcConnectionDetails`][features--dev-services-r15] | 映像名稱為 "clickhouse/clickhouse-server"、"gvenzl/oracle-free"、"gvenzl/oracle-xe"、"mariadb"、"mssql/server"、"mysql" 或 "postgres" 的容器 |
| [`RabbitConnectionDetails`][features--dev-services-r16] | 映像名稱為 "rabbitmq" 且映射容器連接埠 5672 的容器 |
| [`RabbitStreamConnectionDetails`][features--dev-services-r17] | 映像名稱為 "rabbitmq" 且映射容器連接埠 5552 的容器；設定 SSL 時則為 5551 |
| [`DataRedisConnectionDetails`][features--dev-services-r18] | 映像名稱為 "redis"、"redis/redis-stack" 或 "redis/redis-stack-server" 的容器 |
| [`ZipkinConnectionDetails`][features--dev-services-r19] | 映像名稱為 "openzipkin/zipkin" 的容器 |

### SSL 支援

某些映像預設啟用 SSL；你也可能想為容器啟用 SSL，以對應正式環境設定。Spring Boot 支援為受支援的服務連線設定 SSL。請注意，你仍須自行在容器內執行的服務啟用 SSL；這項功能只設定應用程式用戶端的 SSL。

下列服務連線支援 SSL：

- Cassandra
- Elasticsearch
- MongoDB
- OpenTelemetry（OTLP 日誌、指標與追蹤）
- RabbitMQ
- RabbitMQ Streams
- Redis

若要啟用服務的 SSL 支援，可以使用[服務標籤][features--dev-services-r20]。

使用 JKS 金鑰儲存庫與信任儲存庫時，可以使用下列容器標籤：

- `org.springframework.boot.sslbundle.jks.key.alias`
- `org.springframework.boot.sslbundle.jks.key.password`
- `org.springframework.boot.sslbundle.jks.options.ciphers`
- `org.springframework.boot.sslbundle.jks.options.enabled-protocols`
- `org.springframework.boot.sslbundle.jks.protocol`
- `org.springframework.boot.sslbundle.jks.keystore.type`
- `org.springframework.boot.sslbundle.jks.keystore.provider`
- `org.springframework.boot.sslbundle.jks.keystore.location`
- `org.springframework.boot.sslbundle.jks.keystore.password`
- `org.springframework.boot.sslbundle.jks.truststore.type`
- `org.springframework.boot.sslbundle.jks.truststore.provider`
- `org.springframework.boot.sslbundle.jks.truststore.location`
- `org.springframework.boot.sslbundle.jks.truststore.password`

這些標籤對應 [SSL bundle][features--dev-services-r21] 提供的屬性。

使用 PEM 金鑰儲存庫與信任儲存庫時，可以使用下列容器標籤：

- `org.springframework.boot.sslbundle.pem.key.alias`
- `org.springframework.boot.sslbundle.pem.key.password`
- `org.springframework.boot.sslbundle.pem.options.ciphers`
- `org.springframework.boot.sslbundle.pem.options.enabled-protocols`
- `org.springframework.boot.sslbundle.pem.protocol`
- `org.springframework.boot.sslbundle.pem.keystore.type`
- `org.springframework.boot.sslbundle.pem.keystore.certificate`
- `org.springframework.boot.sslbundle.pem.keystore.private-key`
- `org.springframework.boot.sslbundle.pem.keystore.private-key-password`
- `org.springframework.boot.sslbundle.pem.truststore.type`
- `org.springframework.boot.sslbundle.pem.truststore.certificate`
- `org.springframework.boot.sslbundle.pem.truststore.private-key`
- `org.springframework.boot.sslbundle.pem.truststore.private-key-password`

這些標籤對應 [SSL bundle][features--dev-services-r22] 提供的屬性。

下例為 Redis 容器啟用 SSL：

```yaml
services:
  redis:
    image: 'redis:latest'
    ports:
      - '6379'
    secrets:
      - ssl-ca
      - ssl-key
      - ssl-cert
    command: 'redis-server --tls-port 6379 --port 0 --tls-cert-file /run/secrets/ssl-cert --tls-key-file /run/secrets/ssl-key --tls-ca-cert-file /run/secrets/ssl-ca'
    labels:
      - 'org.springframework.boot.sslbundle.pem.keystore.certificate=client.crt'
      - 'org.springframework.boot.sslbundle.pem.keystore.private-key=client.key'
      - 'org.springframework.boot.sslbundle.pem.truststore.certificate=ca.crt'
secrets:
  ssl-ca:
    file: 'ca.crt'
  ssl-key:
    file: 'server.key'
  ssl-cert:
    file: 'server.crt'
```

### 自訂映像

有時你需要使用自己的映像版本提供服務。只要行為與標準映像相同，就可以使用任何自訂映像。具體而言，自訂映像必須使用標準映像支援的相同環境變數。

若映像名稱不同，可以在 `compose.yml` 使用標籤，讓 Spring Boot 提供服務連線。使用名稱為 `org.springframework.boot.service-connection` 的標籤指定服務名稱。

例如：

```yaml
services:
  redis:
    image: 'mycompany/mycustomredis:7.0'
    ports:
      - '6379'
    labels:
      org.springframework.boot.service-connection: redis
```

### 略過特定容器

如果 `compose.yml` 定義了不希望連接至應用程式的容器映像，可以用標籤忽略它。Spring Boot 會忽略所有標註 `org.springframework.boot.ignore` 的容器。

例如：

```yaml
services:
  redis:
    image: 'redis:7.0'
    ports:
      - '6379'
    labels:
      org.springframework.boot.ignore: true
```

### 使用特定 Compose 檔案

如果 Compose 檔案不在應用程式的同一目錄，或使用不同名稱，可以在 `application.properties` 或 `application.yaml` 使用 `spring.docker.compose.file` 指向其他檔案。屬性可以指定完整路徑，或相對於應用程式的路徑。

例如：

```properties
spring.docker.compose.file=../my-compose.yml
```

```yaml
spring:
  docker:
    compose:
      file: "../my-compose.yml"
```

### 等待容器就緒

由 Docker Compose 啟動的容器可能需要一些時間才能完全就緒。建議在 `compose.yml` 的服務定義下加入 `healthcheck` 區段，檢查是否就緒。

由於 `compose.yml` 常常省略 `healthcheck` 設定，Spring Boot 也會直接檢查服務是否就緒。預設只要能對映射的連接埠建立 TCP/IP 連線，就視為容器已就緒。

你可以在 `compose.yml` 加入 `org.springframework.boot.readiness-check.tcp.disable` 標籤，針對個別容器停用此檢查。

例如：

```yaml
services:
  redis:
    image: 'redis:7.0'
    ports:
      - '6379'
    labels:
      org.springframework.boot.readiness-check.tcp.disable: true
```

也可以在 `application.properties` 或 `application.yaml` 變更逾時值：

```properties
spring.docker.compose.readiness.tcp.connect-timeout=10s
spring.docker.compose.readiness.tcp.read-timeout=5s
```

```yaml
spring:
  docker:
    compose:
      readiness:
        tcp:
          connect-timeout: 10s
          read-timeout: 5s
```

整體逾時可使用 `spring.docker.compose.readiness.timeout` 設定。

### 控制 Docker Compose 生命週期

Spring Boot 預設在應用程式啟動時呼叫 `docker compose up`，關閉時呼叫 `docker compose stop`。如果偏好不同的生命週期管理方式，可使用 `spring.docker.compose.lifecycle-management`。

支援以下值：

- `none`：不啟動或停止 Docker Compose。
- `start-only`：應用程式啟動時啟動 Docker Compose，之後讓它持續執行。
- `start-and-stop`：應用程式啟動時啟動 Docker Compose，JVM 結束時停止它。

此外，可以使用 `spring.docker.compose.start.command` 選擇呼叫 `docker compose up` 或 `docker compose start`；使用 `spring.docker.compose.stop.command` 選擇呼叫 `docker compose down` 或 `docker compose stop`。

也可以傳入額外的 Docker Compose 命令引數。`spring.docker.compose.arguments` 指定傳給所有 Docker Compose 命令的引數；`spring.docker.compose.start.arguments` 只傳給 up（或 start）命令；`spring.docker.compose.stop.arguments` 只傳給 down（或 stop）命令。

以下範例示範生命週期管理的設定方式：

```properties
spring.docker.compose.lifecycle-management=start-and-stop
spring.docker.compose.arguments[0]=--project-name=myapp
spring.docker.compose.arguments[1]=--progress=auto
spring.docker.compose.start.command=up
spring.docker.compose.start.arguments[0]=--build
spring.docker.compose.start.arguments[1]=--force-recreate
spring.docker.compose.stop.command=down
spring.docker.compose.stop.timeout=1m
spring.docker.compose.stop.arguments[0]=--volumes
spring.docker.compose.stop.arguments[1]=--remove-orphans
```

```yaml
spring:
  docker:
    compose:
      lifecycle-management: start-and-stop
      arguments:
        - "--project-name=myapp"
        - "--progress=auto"
      start:
        command: up
        arguments:
          - "--build"
          - "--force-recreate"
      stop:
        command: down
        timeout: 1m
        arguments:
          - "--volumes"
          - "--remove-orphans"
```

### 啟用 Docker Compose Profile

Docker Compose Profile 與 Spring Profile 類似，可以針對特定環境調整 Docker Compose 設定。若要啟用特定 Docker Compose Profile，可在 `application.properties` 或 `application.yaml` 使用 `spring.docker.compose.profiles.active`：

```properties
spring.docker.compose.profiles.active=myprofile
```

```yaml
spring:
  docker:
    compose:
      profiles:
        active: "myprofile"
```

### 在測試中使用 Docker Compose

Spring Boot 的 Docker Compose 支援預設在測試時停用。

若要啟用，將 `spring.docker.compose.skip.in-tests` 設為 `false`。

使用 Gradle 時，也必須將 `spring-boot-docker-compose` 依賴的設定從 `developmentOnly` 改為 `testAndDevelopmentOnly`：

Gradle

```gradle
dependencies {
	testAndDevelopmentOnly("org.springframework.boot:spring-boot-docker-compose")
}
```

## Testcontainers 支援

除了[使用 Testcontainers 進行整合測試][features--dev-services-r23]，也能在開發期間使用。以下各節將詳細介紹。

### 在開發期間使用 Testcontainers

這種方式讓開發者快速啟動應用程式依賴的服務容器，不必手動佈建資料庫伺服器等服務。以此方式使用 Testcontainers 的功能類似 Docker Compose，但容器設定使用 Java，而非 YAML。

若要在開發期間使用 Testcontainers，必須以「test」而非「main」classpath 啟動應用程式。如此即可存取所有宣告的測試依賴，也有自然合適的位置撰寫測試設定。

若要建立可供測試啟動的應用程式版本，應在 `src/test` 建立「Application」類別。例如主程式位於 `src/main/java/com/example/MyApplication.java`，就建立 `src/test/java/com/example/TestMyApplication.java`。

`TestMyApplication` 可使用 `SpringApplication.from(…)` 啟動真正的應用程式：

```kotlin
import org.springframework.boot.fromApplication

fun main(args: Array<String>) {
	fromApplication<MyApplication>().run(*args)
}
```

```java
import org.springframework.boot.SpringApplication;

public class TestMyApplication {

	public static void main(String[] args) {
		SpringApplication.from(MyApplication::main).run(args);
	}

}
```

你也必須定義要與應用程式一起啟動的 [`Container`][features--dev-services-r24] 實例。為此，先確保已將 `spring-boot-testcontainers` 模組加入 `test` 依賴，接著建立 [`@TestConfiguration`][features--dev-services-r25] 類別，以 [`@Bean`][features--dev-services-r26] 方法宣告要啟動的容器。

你也可在 [`@Bean`][features--dev-services-r26] 方法標註 [`@ServiceConnection`][features--dev-services-r27]，建立 [`ConnectionDetails`][features--dev-services-r28] Bean。支援的技術詳見[服務連線][features--dev-services-r29]一節。

典型的 Testcontainers 設定如下：

```kotlin
import org.springframework.boot.test.context.TestConfiguration
import org.springframework.boot.testcontainers.service.connection.ServiceConnection
import org.springframework.context.annotation.Bean
import org.testcontainers.neo4j.Neo4jContainer

@TestConfiguration(proxyBeanMethods = false)
class MyContainersConfiguration {

	@Bean
	@ServiceConnection
	fun neo4jContainer(): Neo4jContainer {
		return Neo4jContainer("neo4j:5")
	}

}
```

```java
import org.testcontainers.neo4j.Neo4jContainer;

import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.context.annotation.Bean;

@TestConfiguration(proxyBeanMethods = false)
public class MyContainersConfiguration {

	@Bean
	@ServiceConnection
	public Neo4jContainer neo4jContainer() {
		return new Neo4jContainer("neo4j:5");
	}

}
```

> **注意：**
>
> Spring Boot 會自動管理 [`Container`][features--dev-services-r24] Bean 的生命週期，自動啟動與停止容器。

> **提示：**
>
> 可使用 `spring.testcontainers.beans.startup` 變更容器啟動方式。預設為 `sequential` 依序啟動；若希望同時啟動多個容器，也可以選擇 `parallel`。

定義測試設定後，可使用 `with(…)` 將其附加到測試啟動器：

```kotlin
import org.springframework.boot.fromApplication
import org.springframework.boot.with

fun main(args: Array<String>) {
	fromApplication<MyApplication>().with(MyContainersConfiguration::class).run(*args)
}
```

```java
import org.springframework.boot.SpringApplication;

public class TestMyApplication {

	public static void main(String[] args) {
		SpringApplication.from(MyApplication::main).with(MyContainersConfiguration.class).run(args);
	}

}
```

現在可以像一般 Java `main` 方法應用程式一樣啟動 `TestMyApplication`，同時啟動應用程式及其所需容器。

> **提示：**
>
> 命令列可使用 Maven goal `spring-boot:test-run` 或 Gradle 工作 `bootTestRun`。

#### 在開發期間提供動態屬性

若要在開發期間從 [`Container`][features--dev-services-r24] 的 [`@Bean`][features--dev-services-r26] 方法提供動態屬性，請額外定義 [`DynamicPropertyRegistrar`][features--dev-services-r30] Bean。使用 [`@Bean`][features--dev-services-r26] 方法定義 registrar，並以參數注入要讀取屬性的容器。這樣可確保使用屬性之前，容器已啟動。

典型設定如下：

```kotlin
import org.springframework.boot.test.context.TestConfiguration
import org.springframework.context.annotation.Bean
import org.springframework.test.context.DynamicPropertyRegistrar;
import org.testcontainers.mongodb.MongoDBContainer

@TestConfiguration(proxyBeanMethods = false)
class MyContainersConfiguration {

	@Bean
	fun mongoDbContainer(): MongoDBContainer {
		return MongoDBContainer("mongo:5.0")
	}
	
	@Bean
	fun mongoDbProperties(container: MongoDBContainer): DynamicPropertyRegistrar {
		return DynamicPropertyRegistrar { properties ->
			properties.add("spring.mongodb.host") { container.host }
			properties.add("spring.mongodb.port") { container.firstMappedPort }
		}
	}

}
```

```java
import org.testcontainers.mongodb.MongoDBContainer;

import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.test.context.DynamicPropertyRegistrar;

@TestConfiguration(proxyBeanMethods = false)
public class MyContainersConfiguration {

	@Bean
	public MongoDBContainer mongoDbContainer() {
		return new MongoDBContainer("mongo:5.0");
	}

	@Bean
	public DynamicPropertyRegistrar mongoDbProperties(MongoDBContainer container) {
		return (properties) -> {
			properties.add("spring.mongodb.host", container::getHost);
			properties.add("spring.mongodb.port", container::getFirstMappedPort);
		};
	}

}
```

> **注意：**
>
> 建議盡可能使用 [`@ServiceConnection`][features--dev-services-r27]；不過對於尚未支援 [`@ServiceConnection`][features--dev-services-r27] 的技術，動態屬性是有用的替代方式。

#### 匯入 Testcontainers 宣告類別

使用 Testcontainers 時，常見模式是將 [`Container`][features--dev-services-r24] 實例宣告為靜態欄位。這些欄位通常直接定義在測試類別，也可以宣告在父類別，或測試類別實作的介面。

例如，以下 `MyContainers` 介面宣告 `mongo` 與 `neo4j` 容器：

```kotlin
import org.springframework.boot.testcontainers.service.connection.ServiceConnection
import org.testcontainers.junit.jupiter.Container
import org.testcontainers.mongodb.MongoDBContainer
import org.testcontainers.neo4j.Neo4jContainer

interface MyContainers {

	companion object {

		@Container
		@ServiceConnection
		@JvmField
		val mongoContainer = MongoDBContainer("mongo:5.0")

		@Container
		@ServiceConnection
		@JvmField
		val neo4jContainer = Neo4jContainer("neo4j:5")

	}

}
```

```java
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.mongodb.MongoDBContainer;
import org.testcontainers.neo4j.Neo4jContainer;

import org.springframework.boot.testcontainers.service.connection.ServiceConnection;

public interface MyContainers {

	@Container
	@ServiceConnection
	MongoDBContainer mongoContainer = new MongoDBContainer("mongo:5.0");

	@Container
	@ServiceConnection
	Neo4jContainer neo4jContainer = new Neo4jContainer("neo4j:5");

}
```

如果已用這種方式定義容器，或只是偏好此風格，可以匯入這些宣告類別，而不必以 [`@Bean`][features--dev-services-r26] 方法定義容器。做法是在測試設定類別加入 [`@ImportTestcontainers`][features--dev-services-r31]：

```kotlin
import org.springframework.boot.test.context.TestConfiguration
import org.springframework.boot.testcontainers.context.ImportTestcontainers

@TestConfiguration(proxyBeanMethods = false)
@ImportTestcontainers(MyContainers::class)
class MyContainersConfiguration
```

```java
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.testcontainers.context.ImportTestcontainers;

@TestConfiguration(proxyBeanMethods = false)
@ImportTestcontainers(MyContainers.class)
public class MyContainersConfiguration {

}
```

> **提示：**
>
> 如果不打算使用[服務連線功能][features--dev-services-r29]，而想改用 [`@DynamicPropertySource`][features--dev-services-r32]，請移除 [`Container`][features--dev-services-r24] 欄位上的 [`@ServiceConnection`][features--dev-services-r27]。也可以在宣告類別加入標註 [`@DynamicPropertySource`][features--dev-services-r33] 的方法。

#### 開發期間同時使用 DevTools 與 Testcontainers

使用 Devtools 時，可在 Bean 與 Bean 方法標註 [`@RestartScope`][features--dev-services-r34]。Devtools 重新啟動應用程式時，不會重新建立這些 Bean。這對 [`Container`][features--dev-services-r24] Bean 特別有用，因為應用程式重新啟動後，容器仍能保留狀態。

```kotlin
import org.springframework.boot.devtools.restart.RestartScope
import org.springframework.boot.test.context.TestConfiguration
import org.springframework.boot.testcontainers.service.connection.ServiceConnection
import org.springframework.context.annotation.Bean
import org.testcontainers.mongodb.MongoDBContainer

@TestConfiguration(proxyBeanMethods = false)
class MyContainersConfiguration {

	@Bean
	@RestartScope
	@ServiceConnection
	fun mongoDbContainer(): MongoDBContainer {
		return MongoDBContainer("mongo:5.0")
	}

}
```

```java
import org.testcontainers.mongodb.MongoDBContainer;

import org.springframework.boot.devtools.restart.RestartScope;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.context.annotation.Bean;

@TestConfiguration(proxyBeanMethods = false)
public class MyContainersConfiguration {

	@Bean
	@RestartScope
	@ServiceConnection
	public MongoDBContainer mongoDbContainer() {
		return new MongoDBContainer("mongo:5.0");
	}

}
```

> **警告：**
>
> 若使用 Gradle 且想使用此功能，必須將 `spring-boot-devtools` 依賴的設定從 `developmentOnly` 改為 `testAndDevelopmentOnly`。使用預設的 `developmentOnly` 作用域時，由於 Devtools 未啟用，`bootTestRun` 工作不會偵測程式碼變更。

## 譯者補充：服務就緒與連線設定的銜接

```mermaid
flowchart TD
    A[開發時啟動應用程式] --> B{容器設定方式}
    B --> C[Docker Compose 檔案]
    B --> D[Testcontainers 測試設定]
    C --> E[啟動或辨識既有容器]
    D --> E
    E --> F[取得主機與映射連接埠]
    F --> G[建立 ConnectionDetails Bean]
    G --> H[自動設定用戶端連線]
```

這裡省去的是開發者手動同步容器連接埠與應用程式設定的工作。服務連線資訊的優先順序高於一般連線屬性；正式環境仍應採用自己的服務部署與連線設定方式。

[features--dev-services-r1]: https://docs.spring.io/spring-boot/4.1/gradle-plugin/packaging.html#packaging-executable.configuring.including-development-only-dependencies
[features--dev-services-r2]: https://docs.spring.io/spring-boot/4.1.1/api/java/org/springframework/boot/activemq/autoconfigure/ActiveMQConnectionDetails.html
[features--dev-services-r3]: https://docs.spring.io/spring-boot/4.1.1/api/java/org/springframework/boot/artemis/autoconfigure/ArtemisConnectionDetails.html
[features--dev-services-r4]: https://docs.spring.io/spring-boot/4.1.1/api/java/org/springframework/boot/cassandra/autoconfigure/CassandraConnectionDetails.html
[features--dev-services-r5]: https://docs.spring.io/spring-boot/4.1.1/api/java/org/springframework/boot/elasticsearch/autoconfigure/ElasticsearchConnectionDetails.html
[features--dev-services-r6]: https://docs.spring.io/spring-boot/4.1.1/api/java/org/springframework/boot/hazelcast/autoconfigure/HazelcastConnectionDetails.html
[features--dev-services-r7]: https://docs.spring.io/spring-boot/4.1.1/api/java/org/springframework/boot/jdbc/autoconfigure/JdbcConnectionDetails.html
[features--dev-services-r8]: https://docs.spring.io/spring-boot/4.1.1/api/java/org/springframework/boot/ldap/autoconfigure/LdapConnectionDetails.html
[features--dev-services-r9]: https://docs.spring.io/spring-boot/4.1.1/api/java/org/springframework/boot/mongodb/autoconfigure/MongoConnectionDetails.html
[features--dev-services-r10]: https://docs.spring.io/spring-boot/4.1.1/api/java/org/springframework/boot/neo4j/autoconfigure/Neo4jConnectionDetails.html
[features--dev-services-r11]: https://docs.spring.io/spring-boot/4.1.1/api/java/org/springframework/boot/opentelemetry/autoconfigure/logging/otlp/OtlpLoggingConnectionDetails.html
[features--dev-services-r12]: https://docs.spring.io/spring-boot/4.1.1/api/java/org/springframework/boot/micrometer/metrics/autoconfigure/export/otlp/OtlpMetricsConnectionDetails.html
[features--dev-services-r13]: https://docs.spring.io/spring-boot/4.1.1/api/java/org/springframework/boot/micrometer/tracing/opentelemetry/autoconfigure/otlp/OtlpTracingConnectionDetails.html
[features--dev-services-r14]: https://docs.spring.io/spring-boot/4.1.1/api/java/org/springframework/boot/pulsar/autoconfigure/PulsarConnectionDetails.html
[features--dev-services-r15]: https://docs.spring.io/spring-boot/4.1.1/api/java/org/springframework/boot/r2dbc/autoconfigure/R2dbcConnectionDetails.html
[features--dev-services-r16]: https://docs.spring.io/spring-boot/4.1.1/api/java/org/springframework/boot/amqp/autoconfigure/RabbitConnectionDetails.html
[features--dev-services-r17]: https://docs.spring.io/spring-boot/4.1.1/api/java/org/springframework/boot/amqp/autoconfigure/RabbitStreamConnectionDetails.html
[features--dev-services-r18]: https://docs.spring.io/spring-boot/4.1.1/api/java/org/springframework/boot/data/redis/autoconfigure/DataRedisConnectionDetails.html
[features--dev-services-r19]: https://docs.spring.io/spring-boot/4.1.1/api/java/org/springframework/boot/zipkin/autoconfigure/ZipkinConnectionDetails.html
[features--dev-services-r20]: https://docs.docker.com/reference/compose-file/services/#labels
[features--dev-services-r21]: https://docs.spring.io/spring-boot/4.1/reference/features/ssl.html#features.ssl.jks
[features--dev-services-r22]: https://docs.spring.io/spring-boot/4.1/reference/features/ssl.html#features.ssl.pem
[features--dev-services-r23]: https://docs.spring.io/spring-boot/4.1/reference/testing/testcontainers.html#testing.testcontainers
[features--dev-services-r24]: https://javadoc.io/doc/org.testcontainers/testcontainers/2.0.5/org/testcontainers/containers/Container.html
[features--dev-services-r25]: https://docs.spring.io/spring-boot/4.1.1/api/java/org/springframework/boot/test/context/TestConfiguration.html
[features--dev-services-r26]: https://docs.spring.io/spring-framework/docs/7.0.x/javadoc-api/org/springframework/context/annotation/Bean.html
[features--dev-services-r27]: https://docs.spring.io/spring-boot/4.1.1/api/java/org/springframework/boot/testcontainers/service/connection/ServiceConnection.html
[features--dev-services-r28]: https://docs.spring.io/spring-boot/4.1.1/api/java/org/springframework/boot/autoconfigure/service/connection/ConnectionDetails.html
[features--dev-services-r29]: https://docs.spring.io/spring-boot/4.1/reference/testing/testcontainers.html#testing.testcontainers.service-connections
[features--dev-services-r30]: https://docs.spring.io/spring-framework/docs/7.0.x/javadoc-api/org/springframework/test/context/DynamicPropertyRegistrar.html
[features--dev-services-r31]: https://docs.spring.io/spring-boot/4.1.1/api/java/org/springframework/boot/testcontainers/context/ImportTestcontainers.html
[features--dev-services-r32]: https://docs.spring.io/spring-boot/4.1/reference/testing/testcontainers.html#testing.testcontainers.dynamic-properties
[features--dev-services-r33]: https://docs.spring.io/spring-framework/docs/7.0.x/javadoc-api/org/springframework/test/context/DynamicPropertySource.html
[features--dev-services-r34]: https://docs.spring.io/spring-boot/4.1.1/api/java/org/springframework/boot/devtools/restart/RestartScope.html
