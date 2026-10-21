# 透過 HTTP 監控與管理

若你正在開發 Web 應用程式，Spring Boot Actuator 會自動設定所有已啟用的端點，透過 HTTP 公開。
預設慣例是將端點的 `id` 加上 `/actuator` 前綴作為 URL 路徑。
例如 `health` 公開為 `/actuator/health`。

> [TIP]
>
> Actuator 原生支援 Spring MVC、Spring WebFlux 與 Jersey。
> 如果 Jersey 與 Spring MVC 都可用，則使用 Spring MVC。

> [NOTE]
>
> 若要取得 [API 文件][r1]所描述的正確 JSON 回應，Jackson 是必要依賴。
> Spring MVC 與 Spring WebFlux 應使用 Jackson 3。
> Jersey 尚未提供 Jackson 3 模組，因此必須使用 Jackson 2。

## 自訂管理端點路徑

有時自訂管理端點前綴會很實用。
例如應用程式可能已將 `/actuator` 用於其他用途。
可使用 `management.endpoints.web.base-path` 屬性修改管理端點前綴，如下例所示：

{{CODE_0}}

{{CODE_1}}

上述 `application.properties` 範例將端點從 `/actuator/{id}` 改為 `/manage/{id}`，例如 `/manage/info`。

> [NOTE]
>
> 除非管理連接埠已設定為[透過不同 HTTP 連接埠公開端點][r2]，否則 `management.endpoints.web.base-path` 是相對於 `server.servlet.context-path`（Servlet Web 應用程式）或 `spring.webflux.base-path`（反應式 Web 應用程式）。
> 如果已設定 `management.server.port`，則 `management.endpoints.web.base-path` 是相對於 `management.server.base-path`。

若要將端點對應到其他路徑，可使用 `management.endpoints.web.path-mapping` 屬性。

下例將 `/actuator/health` 重新對應到 `/healthcheck`：

{{CODE_2}}

{{CODE_3}}

## 自訂管理伺服器連接埠

對雲端部署來說，透過預設 HTTP 連接埠公開管理端點是合理的選擇。
但如果應用程式在自己的資料中心執行，你可能偏好使用不同的 HTTP 連接埠公開端點。

可設定 `management.server.port` 屬性修改 HTTP 連接埠，如下例所示：

{{CODE_4}}

{{CODE_5}}

> [NOTE]
>
> 在 Cloud Foundry 上，HTTP 與 TCP 路由預設都只會讓應用程式在 8080 連接埠接收請求。
> 如果想在 Cloud Foundry 使用自訂管理連接埠，必須明確設定應用程式路由，將流量轉送到該連接埠。

## 設定管理專用 SSL

設定為使用自訂連接埠後，也可以透過各種 `management.server.ssl.*` 屬性，為管理伺服器設定自己的 SSL。
例如，這能讓主應用程式使用 HTTPS，而管理伺服器透過 HTTP 提供服務，如以下屬性設定：

{{CODE_6}}

{{CODE_7}}

也可以讓主伺服器與管理伺服器都使用 SSL，但採用不同的 keystore，如下所示：

{{CODE_8}}

{{CODE_9}}

## 自訂管理伺服器位址

你可以設定 `management.server.address` 屬性，自訂管理端點的監聽位址。
如果只想監聽內部或維運網路，或只接受來自 `localhost` 的連線，這項設定很實用。

> [NOTE]
>
> 只有在連接埠與主伺服器不同時，才能監聽不同的位址。

以下 `application.properties` 範例不允許遠端管理連線：

{{CODE_10}}

{{CODE_11}}

## 停用 HTTP 端點

如果不想透過 HTTP 公開端點，可將管理連接埠設為 `-1`，如下例所示：

{{CODE_12}}

{{CODE_13}}

也可以透過 `management.endpoints.web.exposure.exclude` 屬性達成，如下例所示：

{{CODE_14}}

{{CODE_15}}
