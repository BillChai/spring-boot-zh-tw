# 搭配 JVM 使用預先處理（AOT）

使用 AOT 產生的初始化程式碼執行應用程式，有助於改善啟動時間。首先，必須確保建置的 jar 包含 AOT 產生的程式碼。

> **注意：**AOT 快取可與 Spring AOT 結合，進一步改善啟動時間。

使用 Maven 時，應加上 `-Pnative`，以啟用 `native` profile：

{{CODE_0}}

使用 Gradle 時，必須確保建置包含 `org.springframework.boot.aot` 外掛。

JAR 建置完成後，將系統屬性 `spring.aot.enabled` 設為 `true` 再執行，例如：

{{CODE_1}}

使用預先處理也有代價，必須遵守以下限制：

- classpath 在建置階段就已固定且完整定義。
- 應用程式中定義的 Bean 不能在執行階段改變，因此：
  - Spring 的 [`@Profile`][r1] 與 profile 專用設定[有其限制][r2]。
  - 不支援會改變是否建立 Bean 的屬性，例如 [`@ConditionalOnProperty`][r3] 與 `.enabled` 屬性。

預先處理的詳細說明，請參閱[理解 Spring 預先處理][r4]。
