# WebSockets

<!-- source-attribution -->
> **非官方繁體中文翻譯** · Spring Boot 4.1.1 · 翻譯日期：2026-10-21  
> [官方英文網站](https://docs.spring.io/spring-boot/4.1/reference/messaging/websockets.html) · [固定版本英文來源](https://github.com/spring-projects/spring-boot/blob/v4.1.1/documentation/spring-boot-docs/src/docs/antora/modules/reference/pages/messaging/websockets.adoc) · [本地原文快照](../sources/spring-boot/documentation/spring-boot-docs/src/docs/antora/modules/reference/pages/messaging/websockets.adoc)  
> 原始作者與授權見 [來源聲明](../NOTICE.md)。官方範例及設定鍵保留原文，額外圖解另標示為譯者補充。

<!-- translation-status: translated -->

Spring Boot 為內嵌 Tomcat 與 Jetty 提供 WebSocket 自動設定。如果將 war 部署到獨立容器，Spring Boot 會假設 WebSocket 支援的設定由容器負責。

Spring Framework 為 MVC Web 應用程式提供[豐富的 WebSocket 支援][messaging--websockets-r1]，可透過 `spring-boot-starter-websocket` 模組方便地使用。

[Reactive Web 應用程式][messaging--websockets-r2]也支援 WebSocket，但除了 `spring-boot-starter-webflux`，還需要加入 WebSocket API：

```xml
<dependency>
	<groupId>jakarta.websocket</groupId>
	<artifactId>jakarta.websocket-api</artifactId>
</dependency>
```

[messaging--websockets-r1]: https://docs.spring.io/spring-framework/reference/7.0/web/websocket.html
[messaging--websockets-r2]: https://docs.spring.io/spring-framework/reference/7.0/web/webflux-websocket.html
