# 測試模組

Spring Boot 提供數個針對特定功能的專用 `-test` 模組：

| 模組 | 用途 |
| --- | --- |
| `spring-boot-cache-test` | 測試使用 Spring Framework 快取抽象的應用程式。 |
| `spring-boot-data-cassandra-test` | 測試使用 Spring Data Cassandra 的應用程式。提供 `@DataCassandraTest` 測試切片。 |
| `spring-boot-data-couchbase-test` | 測試使用 Spring Data Couchbase 的應用程式。提供 `@DataCouchbaseTest` 測試切片。 |
| `spring-boot-data-elasticsearch-test` | 測試使用 Spring Data Elasticsearch 的應用程式。提供 `@DataElasticsearchTest` 測試切片。 |
| `spring-boot-data-jdbc-test` | 測試使用 Spring Data JDBC 的應用程式。提供 `@DataJdbcTest` 測試切片。 |
| `spring-boot-data-jpa-test` | 測試使用 Spring Data JPA 的應用程式。提供 `@DataJpaTest` 測試切片。 |
| `spring-boot-data-ldap-test` | 測試使用 Spring Data LDAP 的應用程式。提供 `@DataLdapTest` 測試切片。 |
| `spring-boot-mongodb-test` | 測試使用 Spring Data MongoDB 的應用程式。提供 `@DataMongoTest` 測試切片。 |
| `spring-boot-data-neo4j-test` | 測試使用 Spring Data JPA 的應用程式。提供 `@DataNeo4jTest` 測試切片。 |
| `spring-boot-data-r2dbc-test` | 測試使用 Spring Data R2DBC 的應用程式。提供 `@DataR2dbcTest` 測試切片。 |
| `spring-boot-data-redis-test` | 測試使用 Spring Data Redis 的應用程式。提供 `@DataRedisTest` 測試切片。 |
| `spring-boot-graphql-test` | 測試使用 Spring GraphQL 的應用程式。提供 `@GraphQlTest` 測試切片。 |
| `spring-boot-grpc-test` | 測試使用 Spring gRPC 的應用程式。 |
| `spring-boot-jdbc-test` | 測試使用 Spring JDBC 的應用程式。提供 `@JdbcTest` 測試切片。 |
| `spring-boot-jooq-test` | 測試使用 jOOQ 的應用程式。提供 `@JooqTest` 測試切片。 |
| `spring-boot-jpa-test` | 測試使用 JPA 的應用程式。 |
| `spring-boot-micrometer-metrics-test` | 測試使用 Micrometer Metrics 的應用程式。 |
| `spring-boot-micrometer-tracing-test` | 測試使用 Micrometer Tracing 的應用程式。 |
| `spring-boot-restclient-test` | 測試使用 REST 用戶端的應用程式。提供 `@RestClientTest` 測試切片。 |
| `spring-boot-security-test` | 測試使用 Spring Security 的應用程式。 |
| `spring-boot-webserver-test` | 測試使用 `WebServer` 實作的應用程式。提供 `@AutoconfigureWebServer` 註解。 |
| `spring-boot-webclient-test` | 測試使用 `WebClient` 的應用程式。提供 `@WebClientTest` 測試切片。 |
| `spring-boot-webflux-test` | 測試使用 Spring WebFlux 的應用程式。提供 `@WebFluxTest` 測試切片。 |
| `spring-boot-webmvc-test` | 測試使用 Spring Web MVC 的應用程式。提供 `@WebMvcTest` 測試切片。 |
| `spring-boot-webservices-test` | 測試使用 Spring Web Services 的應用程式。提供 `@WebServiceClientTest` 與 `@WebServiceServerTest` 測試切片。 |

## 譯者註

官方表格將 Neo4j 模組的用途寫為 Spring Data JPA，並將 WebServer 註解拼為 `@AutoconfigureWebServer`；上表忠實保留這些原文。使用時請核對該模組的 API 文件，勿將表格文字視為可直接編譯的程式碼。
