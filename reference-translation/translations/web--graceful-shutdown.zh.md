# 優雅關機

三種內嵌 Web 伺服器（Jetty、Reactor Netty 與 Tomcat），以及反應式和 Servlet 型 Web 應用程式，預設都啟用優雅關機。
它會在關閉應用程式上下文時執行，而且位於停止 [`SmartLifecycle`][r1] Bean 的最早階段。
這項停止處理使用逾時設定提供寬限期，讓既有請求完成，但不再允許新請求。

若要設定逾時期間，請設定 `spring.lifecycle.timeout-per-shutdown-phase` 屬性，如下例所示：

{{CODE_0}}

{{CODE_1}}

> [IMPORTANT]
>
> 如果 IDE 沒有傳送適當的 `SIGTERM` 訊號，在 IDE 中執行關機可能會立即停止，而非優雅關機。
> 詳情請參閱 IDE 的文件。

## 在寬限期內拒絕請求

拒絕新請求的確切方式，取決於所使用的 Web 伺服器。
實作可能在網路層停止接受請求，也可能回傳具有特定 HTTP 狀態碼或 HTTP 標頭的回應。
使用持續連線也可能改變停止接受請求的方式。

> [TIP]
>
> 若想了解你的 Web 伺服器採用的具體方式，請參閱 [`TomcatWebServer.shutDownGracefully(GracefulShutdownCallback)`][r2]、[`NettyWebServer.shutDownGracefully(GracefulShutdownCallback)`][r3] 或 [`JettyWebServer.shutDownGracefully(GracefulShutdownCallback)`][r4] 的 `shutDownGracefully` API 文件。

Jetty、Reactor Netty 與 Tomcat 都會在網路層停止接受新請求。

## 停用優雅關機

若要停用優雅關機，請設定 `server.shutdown` 屬性，如下例所示：

{{CODE_2}}

{{CODE_3}}
