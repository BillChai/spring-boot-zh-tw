# 測試 Spring 應用程式

<!-- source-attribution -->
> **非官方繁體中文翻譯** · Spring Boot 4.1.1 · 翻譯日期：2026-10-21  
> [官方英文網站](https://docs.spring.io/spring-boot/4.1/reference/testing/spring-applications.html) · [固定版本英文來源](https://github.com/spring-projects/spring-boot/blob/v4.1.1/documentation/spring-boot-docs/src/docs/antora/modules/reference/pages/testing/spring-applications.adoc) · [本地原文快照](../sources/spring-boot/documentation/spring-boot-docs/src/docs/antora/modules/reference/pages/testing/spring-applications.adoc)  
> 原始作者與授權見 [來源聲明](../NOTICE.md)。官方範例及設定鍵保留原文，額外圖解另標示為譯者補充。

<!-- translation-status: translated -->

依賴注入的主要優點之一，是讓程式碼更容易進行單元測試。
你可以直接使用 `new` 運算子建立物件，完全不必涉及 Spring。
也可以使用「模擬物件」（mock objects）取代真正的依賴。

你往往需要進一步從單元測試走向整合測試，並使用 Spring 的 [`ApplicationContext`][testing--spring-applications-r1]。
如果不必部署應用程式，也不必連接其他基礎設施，就能執行整合測試，會非常實用。

Spring Framework 包含專門用於此類整合測試的測試模組。
你可以直接宣告 `org.springframework:spring-test` 依賴，或使用 `spring-boot-starter-test` starter，透過遞移依賴將它引入。

如果你尚未使用過 `spring-test` 模組，應先閱讀 Spring Framework 參考文件的[相關章節][testing--spring-applications-r2]。

[testing--spring-applications-r1]: https://docs.spring.io/spring-framework/docs/7.0.x/javadoc-api/org/springframework/context/ApplicationContext.html
[testing--spring-applications-r2]: https://docs.spring.io/spring-framework/reference/7.0/testing.html
