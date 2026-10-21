# 測試

Spring Boot 提供多種公用工具與註解，協助你測試應用程式。

測試支援由兩個通用模組與數個針對特定功能的 `-test` 模組提供：`spring-boot-test` 包含核心項目，`spring-boot-test-autoconfigure` 支援測試的自動設定，而各個專用 `-test` 模組則提供特定功能的測試支援。

多數開發者會使用 `spring-boot-starter-test` starter，匯入上述兩個通用 Spring Boot 測試模組，以及 JUnit Jupiter、AssertJ、Hamcrest 和其他實用函式庫，並搭配適用於其應用程式的專用 `-test` 模組。

> [TIP]
>
> 如果你有使用 JUnit 4 的測試，可以透過 JUnit 6 的 vintage engine 執行。
> 若要使用 vintage engine，請加入 `junit-vintage-engine` 依賴，如下例所示：
>
{{CODE_0}}

這裡排除了 `hamcrest-core`，改用 `spring-boot-starter-test` 已包含的 `org.hamcrest:hamcrest`。
