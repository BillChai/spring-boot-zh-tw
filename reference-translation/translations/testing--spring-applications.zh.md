# 測試 Spring 應用程式

依賴注入的主要優點之一，是讓程式碼更容易進行單元測試。
你可以直接使用 `new` 運算子建立物件，完全不必涉及 Spring。
也可以使用「模擬物件」（mock objects）取代真正的依賴。

你往往需要進一步從單元測試走向整合測試，並使用 Spring 的 [`ApplicationContext`][r1]。
如果不必部署應用程式，也不必連接其他基礎設施，就能執行整合測試，會非常實用。

Spring Framework 包含專門用於此類整合測試的測試模組。
你可以直接宣告 `org.springframework:spring-test` 依賴，或使用 `spring-boot-starter-test` starter，透過遞移依賴將它引入。

如果你尚未使用過 `spring-test` 模組，應先閱讀 Spring Framework 參考文件的[相關章節][r2]。
