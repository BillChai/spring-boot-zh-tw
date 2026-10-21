# 搭配 JVM 使用預先處理（AOT）

<!-- source-attribution -->
> **非官方繁體中文翻譯** · Spring Boot 4.1.1 · 翻譯日期：2026-10-21  
> [官方英文網站](https://docs.spring.io/spring-boot/4.1/reference/packaging/aot.html) · [固定版本英文來源](https://github.com/spring-projects/spring-boot/blob/v4.1.1/documentation/spring-boot-docs/src/docs/antora/modules/reference/pages/packaging/aot.adoc) · [本地原文快照](../sources/spring-boot/documentation/spring-boot-docs/src/docs/antora/modules/reference/pages/packaging/aot.adoc)  
> 原始作者與授權見 [來源聲明](../NOTICE.md)。官方範例及設定鍵保留原文，額外圖解另標示為譯者補充。

<!-- translation-status: translated -->

使用 AOT 產生的初始化程式碼執行應用程式，有助於改善啟動時間。首先，必須確保建置的 jar 包含 AOT 產生的程式碼。

> **注意：**AOT 快取可與 Spring AOT 結合，進一步改善啟動時間。

使用 Maven 時，應加上 `-Pnative`，以啟用 `native` profile：

```shell
$ mvn -Pnative package
```

使用 Gradle 時，必須確保建置包含 `org.springframework.boot.aot` 外掛。

JAR 建置完成後，將系統屬性 `spring.aot.enabled` 設為 `true` 再執行，例如：

```shell
$ java -Dspring.aot.enabled=true -jar myapplication.jar

........ Starting AOT-processed MyApplication ...
```

使用預先處理也有代價，必須遵守以下限制：

- classpath 在建置階段就已固定且完整定義。
- 應用程式中定義的 Bean 不能在執行階段改變，因此：
  - Spring 的 [`@Profile`][packaging--aot-r1] 與 profile 專用設定[有其限制][packaging--aot-r2]。
  - 不支援會改變是否建立 Bean 的屬性，例如 [`@ConditionalOnProperty`][packaging--aot-r3] 與 `.enabled` 屬性。

預先處理的詳細說明，請參閱[理解 Spring 預先處理][packaging--aot-r4]。

[packaging--aot-r1]: https://docs.spring.io/spring-framework/docs/7.0.x/javadoc-api/org/springframework/context/annotation/Profile.html
[packaging--aot-r2]: https://docs.spring.io/spring-boot/4.1/how-to/aot.html#howto.aot.conditions
[packaging--aot-r3]: https://docs.spring.io/spring-boot/4.1.1/api/java/org/springframework/boot/autoconfigure/condition/ConditionalOnProperty.html
[packaging--aot-r4]: https://docs.spring.io/spring-boot/4.1/reference/packaging/native-image/introducing-graalvm-native-images.html#packaging.native-image.introducing-graalvm-native-images.understanding-aot-processing
