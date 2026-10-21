# WebSockets

Spring Boot 為內嵌 Tomcat 與 Jetty 提供 WebSocket 自動設定。如果將 war 部署到獨立容器，Spring Boot 會假設 WebSocket 支援的設定由容器負責。

Spring Framework 為 MVC Web 應用程式提供[豐富的 WebSocket 支援][r1]，可透過 `spring-boot-starter-websocket` 模組方便地使用。

[Reactive Web 應用程式][r2]也支援 WebSocket，但除了 `spring-boot-starter-webflux`，還需要加入 WebSocket API：

{{CODE_0}}
