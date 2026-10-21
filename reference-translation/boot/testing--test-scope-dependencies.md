# 測試範圍的依賴

<!-- source-attribution -->
> **非官方繁體中文翻譯** · Spring Boot 4.1.1 · 翻譯日期：2026-10-21  
> [官方英文網站](https://docs.spring.io/spring-boot/4.1/reference/testing/test-scope-dependencies.html) · [固定版本英文來源](https://github.com/spring-projects/spring-boot/blob/v4.1.1/documentation/spring-boot-docs/src/docs/antora/modules/reference/pages/testing/test-scope-dependencies.adoc) · [本地原文快照](../sources/spring-boot/documentation/spring-boot-docs/src/docs/antora/modules/reference/pages/testing/test-scope-dependencies.adoc)  
> 原始作者與授權見 [來源聲明](../NOTICE.md)。官方範例及設定鍵保留原文，額外圖解另標示為譯者補充。

<!-- translation-status: translated -->

`spring-boot-starter-test` starter（使用 `test` `scope`）包含以下函式庫：

- [JUnit][testing--test-scope-dependencies-r1]：Java 應用程式單元測試的事實標準。
- [Spring Test][testing--test-scope-dependencies-r2] 與 Spring Boot Test：Spring Boot 應用程式的公用工具與整合測試支援。
- [AssertJ][testing--test-scope-dependencies-r3]：提供流暢介面的斷言函式庫。
- [Hamcrest][testing--test-scope-dependencies-r4]：提供 matcher 物件（也稱為限制條件或述詞）的函式庫。
- [Mockito][testing--test-scope-dependencies-r5]：Java 模擬框架。
- [JSONassert][testing--test-scope-dependencies-r6]：JSON 斷言函式庫。
- [JsonPath][testing--test-scope-dependencies-r7]：JSON 的 XPath。
- [Awaitility][testing--test-scope-dependencies-r8]：用於測試非同步系統的函式庫。

一般而言，這些常用函式庫對撰寫測試很有幫助。
如果它們不符合你的需求，也可以自行加入其他測試依賴。

[testing--test-scope-dependencies-r1]: https://junit.org
[testing--test-scope-dependencies-r2]: https://docs.spring.io/spring-framework/reference/7.0/testing/integration.html
[testing--test-scope-dependencies-r3]: https://assertj.github.io/doc/
[testing--test-scope-dependencies-r4]: https://github.com/hamcrest/JavaHamcrest
[testing--test-scope-dependencies-r5]: https://site.mockito.org/
[testing--test-scope-dependencies-r6]: https://github.com/skyscreamer/JSONassert
[testing--test-scope-dependencies-r7]: https://github.com/jayway/JsonPath
[testing--test-scope-dependencies-r8]: https://github.com/awaitility/awaitility
