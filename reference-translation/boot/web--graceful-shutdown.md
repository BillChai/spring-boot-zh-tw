# 優雅關機

<!-- source-attribution -->
> **非官方繁體中文翻譯** · Spring Boot 4.1.1 · 翻譯日期：2026-10-21  
> [官方英文網站](https://docs.spring.io/spring-boot/4.1/reference/web/graceful-shutdown.html) · [固定版本英文來源](https://github.com/spring-projects/spring-boot/blob/v4.1.1/documentation/spring-boot-docs/src/docs/antora/modules/reference/pages/web/graceful-shutdown.adoc) · [本地原文快照](../sources/spring-boot/documentation/spring-boot-docs/src/docs/antora/modules/reference/pages/web/graceful-shutdown.adoc)  
> 原始作者與授權見 [來源聲明](../NOTICE.md)。官方範例及設定鍵保留原文，額外圖解另標示為譯者補充。

<!-- translation-status: translated -->

三種內嵌 Web 伺服器（Jetty、Reactor Netty 與 Tomcat），以及反應式和 Servlet 型 Web 應用程式，預設都啟用優雅關機。
它會在關閉應用程式上下文時執行，而且位於停止 [`SmartLifecycle`][web--graceful-shutdown-r1] Bean 的最早階段。
這項停止處理使用逾時設定提供寬限期，讓既有請求完成，但不再允許新請求。

若要設定逾時期間，請設定 `spring.lifecycle.timeout-per-shutdown-phase` 屬性，如下例所示：

```properties
spring.lifecycle.timeout-per-shutdown-phase=20s
```

```yaml
spring:
  lifecycle:
    timeout-per-shutdown-phase: "20s"
```

> **重要：**
>
> 如果 IDE 沒有傳送適當的 `SIGTERM` 訊號，在 IDE 中執行關機可能會立即停止，而非優雅關機。
> 詳情請參閱 IDE 的文件。

## 在寬限期內拒絕請求

拒絕新請求的確切方式，取決於所使用的 Web 伺服器。
實作可能在網路層停止接受請求，也可能回傳具有特定 HTTP 狀態碼或 HTTP 標頭的回應。
使用持續連線也可能改變停止接受請求的方式。

> **提示：**
>
> 若想了解你的 Web 伺服器採用的具體方式，請參閱 [`TomcatWebServer.shutDownGracefully(GracefulShutdownCallback)`][web--graceful-shutdown-r2]、[`NettyWebServer.shutDownGracefully(GracefulShutdownCallback)`][web--graceful-shutdown-r3] 或 [`JettyWebServer.shutDownGracefully(GracefulShutdownCallback)`][web--graceful-shutdown-r4] 的 `shutDownGracefully` API 文件。

Jetty、Reactor Netty 與 Tomcat 都會在網路層停止接受新請求。

## 停用優雅關機

若要停用優雅關機，請設定 `server.shutdown` 屬性，如下例所示：

```properties
server.shutdown=immediate
```

```yaml
server:
  shutdown: "immediate"
```

[web--graceful-shutdown-r1]: https://docs.spring.io/spring-framework/docs/7.0.x/javadoc-api/org/springframework/context/SmartLifecycle.html
[web--graceful-shutdown-r2]: https://docs.spring.io/spring-boot/4.1.1/api/java/org/springframework/boot/tomcat/TomcatWebServer.html#shutDownGracefully(org.springframework.boot.web.server.GracefulShutdownCallback)
[web--graceful-shutdown-r3]: https://docs.spring.io/spring-boot/4.1.1/api/java/org/springframework/boot/reactor/netty/NettyWebServer.html#shutDownGracefully(org.springframework.boot.web.server.GracefulShutdownCallback)
[web--graceful-shutdown-r4]: https://docs.spring.io/spring-boot/4.1.1/api/java/org/springframework/boot/jetty/JettyWebServer.html#shutDownGracefully(org.springframework.boot.web.server.GracefulShutdownCallback)
