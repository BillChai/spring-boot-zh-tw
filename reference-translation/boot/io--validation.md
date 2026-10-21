# 驗證

<!-- source-attribution -->
> **非官方繁體中文翻譯** · Spring Boot 4.1.1 · 翻譯日期：2026-10-21  
> [官方英文網站](https://docs.spring.io/spring-boot/4.1/reference/io/validation.html) · [固定版本英文來源](https://github.com/spring-projects/spring-boot/blob/v4.1.1/documentation/spring-boot-docs/src/docs/antora/modules/reference/pages/io/validation.adoc) · [本地原文快照](../sources/spring-boot/documentation/spring-boot-docs/src/docs/antora/modules/reference/pages/io/validation.adoc)  
> 原始作者與授權見 [來源聲明](../NOTICE.md)。官方範例及設定鍵保留原文，額外圖解另標示為譯者補充。

<!-- translation-status: translated -->

只要 classpath 上有 JSR-303 實作（例如 Hibernate Validator，通常由 `spring-boot-starter-validation` 提供），就會自動啟用 Bean Validation 1.1 支援的方法驗證功能。
這讓你能在 Bean 方法的參數及／或回傳值上標註 `jakarta.validation` 約束。
含有這類方法的目標類別，必須在型別層級標註 [`@Validated`][io--validation-r1]，才會搜尋其方法中的約束註解。

例如，下列服務會觸發第一個引數的驗證，確保其大小介於 8 到 10：

```kotlin
import jakarta.validation.constraints.Size
import org.springframework.stereotype.Service
import org.springframework.validation.annotation.Validated

@Service
@Validated
class MyBean {

	fun findByCodeAndAuthor(code: @Size(min = 8, max = 10) String?, author: Author?): Archive? {
		return null
	}

}
```

```java
import jakarta.validation.constraints.Size;

import org.springframework.stereotype.Service;
import org.springframework.validation.annotation.Validated;

@Service
@Validated
public class MyBean {

	public Archive findByCodeAndAuthor(@Size(min = 8, max = 10) String code, Author author) {
		return ...
	}

}
```

解析約束訊息中的 `{parameters}` 時，會使用應用程式的 [`MessageSource`][io--validation-r2]。
這讓你可以使用[應用程式的 `messages.properties` 檔案][io--validation-r3]來提供 Bean Validation 訊息。
參數解析完成後，會使用 Bean Validation 的預設插值器完成訊息插值。

若要自訂建立 [`ValidatorFactory`][io--validation-r5] 時所使用的 [`Configuration`][io--validation-r4]，請定義 [`ValidationConfigurationCustomizer`][io--validation-r6] Bean。
定義多個自訂器 Bean 時，會依照它們的 [`@Order`][io--validation-r7] 註解或 [`Ordered`][io--validation-r8] 實作所指定的順序呼叫。

[io--validation-r1]: https://docs.spring.io/spring-framework/docs/7.0.x/javadoc-api/org/springframework/validation/annotation/Validated.html
[io--validation-r2]: https://docs.spring.io/spring-framework/docs/7.0.x/javadoc-api/org/springframework/context/MessageSource.html
[io--validation-r3]: https://docs.spring.io/spring-boot/4.1/reference/features/internationalization.html
[io--validation-r4]: https://jakarta.ee/specifications/bean-validation/3.1/apidocs/jakarta/validation/Configuration.html
[io--validation-r5]: https://jakarta.ee/specifications/bean-validation/3.1/apidocs/jakarta/validation/ValidatorFactory.html
[io--validation-r6]: https://docs.spring.io/spring-boot/4.1.1/api/java/org/springframework/boot/validation/autoconfigure/ValidationConfigurationCustomizer.html
[io--validation-r7]: https://docs.spring.io/spring-framework/docs/7.0.x/javadoc-api/org/springframework/core/annotation/Order.html
[io--validation-r8]: https://docs.spring.io/spring-framework/docs/7.0.x/javadoc-api/org/springframework/core/Ordered.html
