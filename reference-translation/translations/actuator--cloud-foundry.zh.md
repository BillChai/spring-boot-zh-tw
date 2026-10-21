# Cloud Foundry 支援

Spring Boot 的 `spring-boot-cloudfoundry` 模組（包含在 `spring-boot-starter-cloudfoundry` 中）提供額外支援，在部署到相容的 Cloud Foundry 實例時啟用。
`/cloudfoundryapplication` 路徑為所有 [`@Endpoint`][r1] Bean 提供另一條受到保護的存取路徑。

這項擴充支援可將 Spring Boot actuator 資訊加入 Cloud Foundry 管理介面，例如用來檢視已部署應用程式的 Web 應用程式。
舉例來說，應用程式狀態頁可以顯示完整健康資訊，而不只是一般的「執行中」或「已停止」狀態。

> [NOTE]
>
> 一般使用者無法直接存取 `/cloudfoundryapplication` 路徑。
> 若要使用此端點，請求必須攜帶有效的 UAA token。

## 停用 Cloud Foundry 擴充 Actuator 支援

若要完全停用 `/cloudfoundryapplication` 端點，可在 `application.properties` 加入以下設定：

{{CODE_0}}

{{CODE_1}}

## Cloud Foundry 自簽憑證

預設情況下，`/cloudfoundryapplication` 端點的安全驗證會透過 SSL 呼叫多個 Cloud Foundry 服務。
如果 Cloud Foundry UAA 或 Cloud Controller 服務使用自簽憑證，必須設定以下屬性：

{{CODE_2}}

{{CODE_3}}

## 自訂上下文路徑

若伺服器的 context-path 設定為 `/` 以外的路徑，Cloud Foundry 端點就不會位於應用程式根路徑。
例如 `server.servlet.context-path=/app` 時，Cloud Foundry 端點位於 `/app/cloudfoundryapplication/*`。

如果希望不論伺服器 context-path 為何，Cloud Foundry 端點都位於 `/cloudfoundryapplication/*`，就必須在應用程式中明確設定。
設定方式依使用的 Web 伺服器而異。
Tomcat 可加入以下設定：

{{CODE_4}}

{{CODE_5}}

如果使用以 WebFlux 為基礎的應用程式，可採用以下設定：

{{CODE_6}}

{{CODE_7}}
