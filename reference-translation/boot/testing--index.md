# 測試

<!-- source-attribution -->
> **非官方繁體中文翻譯** · Spring Boot 4.1.1 · 翻譯日期：2026-10-21  
> [官方英文網站](https://docs.spring.io/spring-boot/4.1/reference/testing/index.html) · [固定版本英文來源](https://github.com/spring-projects/spring-boot/blob/v4.1.1/documentation/spring-boot-docs/src/docs/antora/modules/reference/pages/testing/index.adoc) · [本地原文快照](../sources/spring-boot/documentation/spring-boot-docs/src/docs/antora/modules/reference/pages/testing/index.adoc)  
> 原始作者與授權見 [來源聲明](../NOTICE.md)。官方範例及設定鍵保留原文，額外圖解另標示為譯者補充。

<!-- translation-status: translated -->

Spring Boot 提供多種公用工具與註解，協助你測試應用程式。

測試支援由兩個通用模組與數個針對特定功能的 `-test` 模組提供：`spring-boot-test` 包含核心項目，`spring-boot-test-autoconfigure` 支援測試的自動設定，而各個專用 `-test` 模組則提供特定功能的測試支援。

多數開發者會使用 `spring-boot-starter-test` starter，匯入上述兩個通用 Spring Boot 測試模組，以及 JUnit Jupiter、AssertJ、Hamcrest 和其他實用函式庫，並搭配適用於其應用程式的專用 `-test` 模組。

> **提示：**
>
> 如果你有使用 JUnit 4 的測試，可以透過 JUnit 6 的 vintage engine 執行。
> 若要使用 vintage engine，請加入 `junit-vintage-engine` 依賴，如下例所示：
>
> ```xml
> <dependency>
> 	<groupId>org.junit.vintage</groupId>
> 	<artifactId>junit-vintage-engine</artifactId>
> 	<scope>test</scope>
> 	<exclusions>
> 		<exclusion>
> 			<groupId>org.hamcrest</groupId>
> 			<artifactId>hamcrest-core</artifactId>
> 		</exclusion>
> 	</exclusions>
> </dependency>
> ```

這裡排除了 `hamcrest-core`，改用 `spring-boot-starter-test` 已包含的 `org.hamcrest:hamcrest`。


