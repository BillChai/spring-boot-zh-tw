# 國際化

<!-- source-attribution -->
> **非官方繁體中文翻譯** · Spring Boot 4.1.1 · 翻譯日期：2026-10-21  
> [官方英文網站](https://docs.spring.io/spring-boot/4.1/reference/features/internationalization.html) · [固定版本英文來源](https://github.com/spring-projects/spring-boot/blob/v4.1.1/documentation/spring-boot-docs/src/docs/antora/modules/reference/pages/features/internationalization.adoc) · [本地原文快照](../sources/spring-boot/documentation/spring-boot-docs/src/docs/antora/modules/reference/pages/features/internationalization.adoc)  
> 原始作者與授權見 [來源聲明](../NOTICE.md)。官方範例及設定鍵保留原文，額外圖解另標示為譯者補充。

<!-- translation-status: translated -->

Spring Boot 支援在地化訊息，讓應用程式能服務具有不同語言偏好的使用者。預設會在 classpath 根目錄尋找名為 `messages` 的資源套件（resource bundle）。

> **注意：**只有在設定的資源套件具備預設 properties 檔案時（預設為 `messages.properties`），這項自動設定才會生效。如果只有特定語言的 properties 檔案，就必須補上預設檔案。若找不到符合任何已設定基本名稱的 properties 檔案，就不會自動設定 [`MessageSource`][features--internationalization-r1]。

資源套件的基本名稱與其他數個屬性，可透過 `spring.messages` 命名空間設定：

```properties
spring.messages.basename=messages, config.i18n.messages
spring.messages.common-messages=classpath:my-common-messages.properties
spring.messages.fallback-to-system-locale=false
```

```yaml
spring:
  messages:
    basename: "messages, config.i18n.messages"
    common-messages: "classpath:my-common-messages.properties"
    fallback-to-system-locale: false
```

> **提示：**`spring.messages.basename` 支援位置清單，可使用套件限定名稱，或從 classpath 根目錄解析的資源。`spring.messages.common-messages` 支援 properties 檔案資源的清單。

其他支援選項請參閱 [`MessageSourceProperties`][features--internationalization-r2]。

[features--internationalization-r1]: https://docs.spring.io/spring-framework/docs/7.0.x/javadoc-api/org/springframework/context/MessageSource.html
[features--internationalization-r2]: https://docs.spring.io/spring-boot/4.1.1/api/java/org/springframework/boot/autoconfigure/context/MessageSourceProperties.html
