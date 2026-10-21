# 測試公用工具

<!-- source-attribution -->
> **非官方繁體中文翻譯** · Spring Boot 4.1.1 · 翻譯日期：2026-10-21  
> [官方英文網站](https://docs.spring.io/spring-boot/4.1/reference/testing/test-utilities.html) · [固定版本英文來源](https://github.com/spring-projects/spring-boot/blob/v4.1.1/documentation/spring-boot-docs/src/docs/antora/modules/reference/pages/testing/test-utilities.adoc) · [本地原文快照](../sources/spring-boot/documentation/spring-boot-docs/src/docs/antora/modules/reference/pages/testing/test-utilities.adoc)  
> 原始作者與授權見 [來源聲明](../NOTICE.md)。官方範例及設定鍵保留原文，額外圖解另標示為譯者補充。

<!-- translation-status: translated -->

`spring-boot` 封裝了一些在測試應用程式時普遍實用的測試工具類別。

## ConfigDataApplicationContextInitializer

[`ConfigDataApplicationContextInitializer`][testing--test-utilities-r1] 是一種 [`ApplicationContextInitializer`][testing--test-utilities-r2]，可套用到測試，載入 Spring Boot 的 `application.properties` 檔案。
當你不需要 [`@SpringBootTest`][testing--test-utilities-r3] 提供的全部功能時，可以使用它，如下例所示：

```kotlin
import org.springframework.boot.test.context.ConfigDataApplicationContextInitializer
import org.springframework.test.context.ContextConfiguration

@ContextConfiguration(classes = [Config::class], initializers = [ConfigDataApplicationContextInitializer::class])
class MyConfigFileTests {

	// ...

}
```

```java
import org.springframework.boot.test.context.ConfigDataApplicationContextInitializer;
import org.springframework.test.context.ContextConfiguration;

@ContextConfiguration(classes = Config.class, initializers = ConfigDataApplicationContextInitializer.class)
class MyConfigFileTests {

	// ...

}
```

> **注意：**
>
> 單獨使用 [`ConfigDataApplicationContextInitializer`][testing--test-utilities-r1]，不會提供 `@Value("${…​}")` 注入支援。
> 它唯一的工作是確保 `application.properties` 檔案被載入 Spring 的 [`Environment`][testing--test-utilities-r4]。
> 若需要 [`@Value`][testing--test-utilities-r5] 支援，必須另外設定 [`PropertySourcesPlaceholderConfigurer`][testing--test-utilities-r6]，或使用會自動替你設定它的 [`@SpringBootTest`][testing--test-utilities-r3]。

## TestPropertyValues

[`TestPropertyValues`][testing--test-utilities-r7] 可讓你快速將屬性加入 [`ConfigurableEnvironment`][testing--test-utilities-r8] 或 [`ConfigurableApplicationContext`][testing--test-utilities-r9]。
呼叫時可以傳入 `key=value` 字串，如下所示：

```kotlin
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.springframework.boot.test.util.TestPropertyValues
import org.springframework.mock.env.MockEnvironment

class MyEnvironmentTests {

	@Test
	fun testPropertySources() {
		val environment = MockEnvironment()
		TestPropertyValues.of("org=Spring", "name=Boot").applyTo(environment)
		assertThat(environment.getProperty("name")).isEqualTo("Boot")
	}

}
```

```java
import org.junit.jupiter.api.Test;

import org.springframework.boot.test.util.TestPropertyValues;
import org.springframework.mock.env.MockEnvironment;

import static org.assertj.core.api.Assertions.assertThat;

class MyEnvironmentTests {

	@Test
	void testPropertySources() {
		MockEnvironment environment = new MockEnvironment();
		TestPropertyValues.of("org=Spring", "name=Boot").applyTo(environment);
		assertThat(environment.getProperty("name")).isEqualTo("Boot");
	}

}
```

## OutputCaptureExtension

[`OutputCaptureExtension`][testing--test-utilities-r10] 是 JUnit 的 [`Extension`][testing--test-utilities-r11]，可用來擷取 [`System.out`][testing--test-utilities-r12] 與 [`System.err`][testing--test-utilities-r13] 的輸出。
使用時加入 `@ExtendWith(OutputCaptureExtension.class)`，並將 [`CapturedOutput`][testing--test-utilities-r14] 作為參數，注入測試類別的建構子或測試方法，如下所示：

```kotlin
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.springframework.boot.test.system.CapturedOutput
import org.springframework.boot.test.system.OutputCaptureExtension

@ExtendWith(OutputCaptureExtension::class)
class MyOutputCaptureTests {

	@Test
	fun testName(output: CapturedOutput?) {
		println("Hello World!")
		assertThat(output).contains("World")
	}

}
```

```java
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;

import org.springframework.boot.test.system.CapturedOutput;
import org.springframework.boot.test.system.OutputCaptureExtension;

import static org.assertj.core.api.Assertions.assertThat;

@ExtendWith(OutputCaptureExtension.class)
class MyOutputCaptureTests {

	@Test
	void testName(CapturedOutput output) {
		System.out.println("Hello World!");
		assertThat(output).contains("World");
	}

}
```

## TestRestTemplate

[`TestRestTemplate`][testing--test-utilities-r15] 是 Spring [`RestTemplate`][testing--test-utilities-r16] 的便利替代方案，適用於整合測試。
它由 `spring-boot-resttestclient` 模組提供。
此外也需要 `spring-boot-restclient` 依賴。
加入此依賴時請留意，它會啟用 `RestClient.Builder` 的自動設定。
若正式程式碼使用 `RestClient.Builder`，應將 `spring-boot-restclient` 宣告於應用程式的主要 classpath，而不只是測試 classpath。

你可以取得一般的 template，或會傳送 HTTP Basic 身分驗證資訊（使用者名稱與密碼）的 template。
兩者都具備容錯行為。
也就是說，遇到 4xx 與 5xx 錯誤時不會擲出例外，讓測試更容易撰寫。
你可以透過回傳的 [`ResponseEntity`][testing--test-utilities-r17] 及其狀態碼偵測這些錯誤。

若需要流暢的斷言 API，可考慮使用 [`RestTestClient`][testing--test-utilities-r18]，它支援[模擬環境][testing--test-utilities-r19]與[端對端測試][testing--test-utilities-r20]。

若使用 Spring WebFlux，可考慮 [`WebTestClient`][testing--test-utilities-r21]；它提供類似 API，支援[模擬環境][testing--test-utilities-r19]、[WebFlux 整合測試][testing--test-utilities-r22]及[端對端測試][testing--test-utilities-r20]。

建議使用 Apache HTTP Client 5.1 或更新版本，但不是強制要求。
若它位於 classpath，則 [`TestRestTemplate`][testing--test-utilities-r15] 會據此適當設定用戶端。

你可以在整合測試中直接建立 [`TestRestTemplate`][testing--test-utilities-r15] 實例，如下例所示：

```kotlin
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.springframework.boot.resttestclient.TestRestTemplate
import org.springframework.http.HttpStatus

class MyTests {

	private val template = TestRestTemplate()

	@Test
	fun testRequest() {
		val response = template.getForEntity("https://myhost.example.com/example", String::class.java)
		assertThat(response.statusCode).isEqualTo(HttpStatus.OK)
		// Other assertions to verify the response
	}

}
```

```java
import org.junit.jupiter.api.Test;

import org.springframework.boot.resttestclient.TestRestTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import static org.assertj.core.api.Assertions.assertThat;

class MyTests {

	private final TestRestTemplate template = new TestRestTemplate();

	@Test
	void testRequest() {
		ResponseEntity<String> response = this.template.getForEntity("https://myhost.example.com/example",
				String.class);
		assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
		// Other assertions to verify the response
	}

}
```

另一種方式是使用 [`@SpringBootTest`][testing--test-utilities-r3] 搭配 `WebEnvironment.RANDOM_PORT` 或 `WebEnvironment.DEFINED_PORT`，並在測試類別標註 [`@AutoConfigureTestRestTemplate`][testing--test-utilities-r23]，即可注入已完整設定的 [`TestRestTemplate`][testing--test-utilities-r15]。
必要時可透過 [`RestTemplateBuilder`][testing--test-utilities-r24] Bean 進一步自訂。

未指定主機與連接埠的 URL，會自動連到嵌入式伺服器，如下例所示：

```kotlin
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.boot.test.context.SpringBootTest.WebEnvironment
import org.springframework.boot.test.context.TestConfiguration
import org.springframework.boot.restclient.RestTemplateBuilder
import org.springframework.boot.resttestclient.TestRestTemplate
import org.springframework.boot.resttestclient.autoconfigure.AutoConfigureTestRestTemplate
import org.springframework.context.annotation.Bean
import org.springframework.http.HttpStatus
import java.time.Duration

@SpringBootTest(webEnvironment = WebEnvironment.RANDOM_PORT)
@AutoConfigureTestRestTemplate
class MySpringBootTests(@Autowired val template: TestRestTemplate) {

	@Test
	fun testRequest() {
		val response = template.getForEntity("/example", String::class.java)
		assertThat(response.statusCode).isEqualTo(HttpStatus.OK)
		// Other assertions to verify the response
	}

	@TestConfiguration(proxyBeanMethods = false)
	internal class RestTemplateBuilderConfiguration {

		@Bean
		fun restTemplateBuilder(): RestTemplateBuilder {
			return RestTemplateBuilder().connectTimeout(Duration.ofSeconds(1))
				.readTimeout(Duration.ofSeconds(1))
		}

	}

}
```

```java
import java.time.Duration;

import org.junit.jupiter.api.Test;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.restclient.RestTemplateBuilder;
import org.springframework.boot.resttestclient.TestRestTemplate;
import org.springframework.boot.resttestclient.autoconfigure.AutoConfigureTestRestTemplate;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.SpringBootTest.WebEnvironment;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(webEnvironment = WebEnvironment.RANDOM_PORT)
@AutoConfigureTestRestTemplate
class MySpringBootTests {

	@Autowired
	private TestRestTemplate template;

	@Test
	void testRequest() {
		ResponseEntity<String> response = this.template.getForEntity("/example", String.class);
		assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
		// Other assertions to verify the response
	}

	@TestConfiguration(proxyBeanMethods = false)
	static class RestTemplateBuilderConfiguration {

		@Bean
		RestTemplateBuilder restTemplateBuilder() {
			return new RestTemplateBuilder().connectTimeout(Duration.ofSeconds(1)).readTimeout(Duration.ofSeconds(1));
		}

	}

}
```

[testing--test-utilities-r1]: https://docs.spring.io/spring-boot/4.1.1/api/java/org/springframework/boot/test/context/ConfigDataApplicationContextInitializer.html
[testing--test-utilities-r2]: https://docs.spring.io/spring-framework/docs/7.0.x/javadoc-api/org/springframework/context/ApplicationContextInitializer.html
[testing--test-utilities-r3]: https://docs.spring.io/spring-boot/4.1.1/api/java/org/springframework/boot/test/context/SpringBootTest.html
[testing--test-utilities-r4]: https://docs.spring.io/spring-framework/docs/7.0.x/javadoc-api/org/springframework/core/env/Environment.html
[testing--test-utilities-r5]: https://docs.spring.io/spring-framework/docs/7.0.x/javadoc-api/org/springframework/beans/factory/annotation/Value.html
[testing--test-utilities-r6]: https://docs.spring.io/spring-framework/docs/7.0.x/javadoc-api/org/springframework/context/support/PropertySourcesPlaceholderConfigurer.html
[testing--test-utilities-r7]: https://docs.spring.io/spring-boot/4.1.1/api/java/org/springframework/boot/test/util/TestPropertyValues.html
[testing--test-utilities-r8]: https://docs.spring.io/spring-framework/docs/7.0.x/javadoc-api/org/springframework/core/env/ConfigurableEnvironment.html
[testing--test-utilities-r9]: https://docs.spring.io/spring-framework/docs/7.0.x/javadoc-api/org/springframework/context/ConfigurableApplicationContext.html
[testing--test-utilities-r10]: https://docs.spring.io/spring-boot/4.1.1/api/java/org/springframework/boot/test/system/OutputCaptureExtension.html
[testing--test-utilities-r11]: https://junit.org/junit5/docs/6.0.3/api/org.junit.jupiter.api/org/junit/jupiter/api/extension/Extension.html
[testing--test-utilities-r12]: https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/lang/System.html#out
[testing--test-utilities-r13]: https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/lang/System.html#err
[testing--test-utilities-r14]: https://docs.spring.io/spring-boot/4.1.1/api/java/org/springframework/boot/test/system/CapturedOutput.html
[testing--test-utilities-r15]: https://docs.spring.io/spring-boot/4.1.1/api/java/org/springframework/boot/resttestclient/TestRestTemplate.html
[testing--test-utilities-r16]: https://docs.spring.io/spring-framework/docs/7.0.x/javadoc-api/org/springframework/web/client/RestTemplate.html
[testing--test-utilities-r17]: https://docs.spring.io/spring-framework/docs/7.0.x/javadoc-api/org/springframework/http/ResponseEntity.html
[testing--test-utilities-r18]: https://docs.spring.io/spring-framework/docs/7.0.x/javadoc-api/org/springframework/test/web/servlet/client/RestTestClient.html
[testing--test-utilities-r19]: https://docs.spring.io/spring-boot/4.1/reference/testing/spring-boot-applications.html#testing.spring-boot-applications.with-mock-environment
[testing--test-utilities-r20]: https://docs.spring.io/spring-boot/4.1/reference/testing/spring-boot-applications.html#testing.spring-boot-applications.with-running-server
[testing--test-utilities-r21]: https://docs.spring.io/spring-framework/docs/7.0.x/javadoc-api/org/springframework/test/web/reactive/server/WebTestClient.html
[testing--test-utilities-r22]: https://docs.spring.io/spring-boot/4.1/reference/testing/spring-boot-applications.html#testing.spring-boot-applications.spring-webflux-tests
[testing--test-utilities-r23]: https://docs.spring.io/spring-boot/4.1.1/api/java/org/springframework/boot/resttestclient/autoconfigure/AutoConfigureTestRestTemplate.html
[testing--test-utilities-r24]: https://docs.spring.io/spring-boot/4.1.1/api/java/org/springframework/boot/restclient/RestTemplateBuilder.html
