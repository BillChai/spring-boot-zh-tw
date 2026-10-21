# Spring Session

<!-- source-attribution -->
> **非官方繁體中文翻譯** · Spring Boot 4.1.1 · 翻譯日期：2026-10-21  
> [官方英文網站](https://docs.spring.io/spring-boot/4.1/reference/web/spring-session.html) · [固定版本英文來源](https://github.com/spring-projects/spring-boot/blob/v4.1.1/documentation/spring-boot-docs/src/docs/antora/modules/reference/pages/web/spring-session.adoc) · [本地原文快照](../sources/spring-boot/documentation/spring-boot-docs/src/docs/antora/modules/reference/pages/web/spring-session.adoc)  
> 原始作者與授權見 [來源聲明](../NOTICE.md)。官方範例及設定鍵保留原文，額外圖解另標示為譯者補充。

<!-- translation-status: translated -->

Spring Boot 為多種資料儲存提供 [Spring Session][web--spring-session-r1] 自動設定。
每種資料儲存都有專用的 Spring Boot starter。

建置 Servlet Web 應用程式時，可自動設定下列儲存：

- Redis（`spring-boot-starter-session-data-redis`）
- JDBC（`spring-boot-starter-session-jdbc`）

Servlet 自動設定讓你不必使用 `@Enable*HttpSession`。

建置反應式 Web 應用程式時，加入 `spring-boot-starter-session-data-redis` 相依項即可自動設定 Redis 儲存。
這讓你不必使用 `@EnableRedisWebSession`。

每種儲存都有各自的額外設定。
例如，可自訂 JDBC 儲存的資料表名稱，如下例所示：

```properties
spring.session.jdbc.table-name=SESSIONS
```

```yaml
spring:
  session:
    jdbc:
      table-name: "SESSIONS"
```

你可以使用 `spring.session.timeout` 屬性設定工作階段的逾時時間。
在 Servlet Web 應用程式中，若未設定該屬性，自動設定會改用 `server.servlet.session.timeout` 的值。
若要以程式提供逾時設定，請定義 [`SessionTimeout`][web--spring-session-r2] Bean。

你可以使用 `@Enable*HttpSession`（Servlet）或 `@EnableRedisWebSession`（反應式），自行掌控 Spring Session 設定。
這會讓自動設定退讓。
另一種方式是直接依賴對應的 Spring Session 模組，而不使用 Spring Boot 的 Spring Session starter。
無論採用哪種方式，都可以透過註解的屬性設定 Spring Session，而不是使用前述設定屬性。

[web--spring-session-r1]: https://spring.io/projects/spring-session
[web--spring-session-r2]: https://docs.spring.io/spring-boot/4.1.1/api/java/org/springframework/boot/session/autoconfigure/SessionTimeout.html
