# 測試範圍的依賴

`spring-boot-starter-test` starter（使用 `test` `scope`）包含以下函式庫：

- [JUnit][r1]：Java 應用程式單元測試的事實標準。
- [Spring Test][r2] 與 Spring Boot Test：Spring Boot 應用程式的公用工具與整合測試支援。
- [AssertJ][r3]：提供流暢介面的斷言函式庫。
- [Hamcrest][r4]：提供 matcher 物件（也稱為限制條件或述詞）的函式庫。
- [Mockito][r5]：Java 模擬框架。
- [JSONassert][r6]：JSON 斷言函式庫。
- [JsonPath][r7]：JSON 的 XPath。
- [Awaitility][r8]：用於測試非同步系統的函式庫。

一般而言，這些常用函式庫對撰寫測試很有幫助。
如果它們不符合你的需求，也可以自行加入其他測試依賴。
