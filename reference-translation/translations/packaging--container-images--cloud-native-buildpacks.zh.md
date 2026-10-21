# Cloud Native Buildpacks

可以直接透過 Maven 或 Gradle 外掛，使用 [Cloud Native Buildpacks][r1] 建立 Docker 映像。如果使用過 Cloud Foundry 或 Heroku 等應用程式平台，可能已接觸過 buildpack：它是平台中負責將應用程式轉成可執行形式的部分。例如，Cloud Foundry 的 Java buildpack 會辨識推送的是 `.jar`，並自動加入合適的 JRE。

Cloud Native Buildpacks 可以建立相容 Docker、能在各處執行的映像。Spring Boot 直接在 Maven 與 Gradle 提供 buildpack 支援，因此只需輸入一個指令，就能快速在本機執行中的 Docker daemon 取得具有合理配置的映像。

使用方式請分別參閱 [Maven][r2] 與 [Gradle][r3] 外掛文件。

> **注意：**[Paketo Spring Boot buildpack][r4] 支援 `layers.idx`，因此對該檔案套用的[分層客製設定][r5]也會反映在 buildpack 建立的映像中。

> **注意：**為了達成可重現建置與容器映像快取，buildpack 可能修改應用程式資源的中繼資料，例如檔案「最後修改時間」。請確保應用程式在執行階段不依賴這些資訊。Spring Boot 提供靜態資源時可能使用它們，但可以透過 `spring.web.resources.cache.use-last-modified` 停用此行為。
