# Web Services

<!-- source-attribution -->
> **非官方繁體中文翻譯** · Spring Boot 4.1.1 · 翻譯日期：2026-10-21  
> [官方英文網站](https://docs.spring.io/spring-boot/4.1/reference/io/webservices.html) · [固定版本英文來源](https://github.com/spring-projects/spring-boot/blob/v4.1.1/documentation/spring-boot-docs/src/docs/antora/modules/reference/pages/io/webservices.adoc) · [本地原文快照](../sources/spring-boot/documentation/spring-boot-docs/src/docs/antora/modules/reference/pages/io/webservices.adoc)  
> 原始作者與授權見 [來源聲明](../NOTICE.md)。官方範例及設定鍵保留原文，額外圖解另標示為譯者補充。

<!-- translation-status: translated -->

Spring Boot 提供 Web Services 自動設定，因此你只需要定義 [`@Endpoint`][io--webservices-r1] Bean。

透過 `spring-boot-starter-webservices` 模組，就能輕鬆使用 [Spring Web Services 功能][io--webservices-r2]。

可以分別為 WSDL 與 XSD 自動建立 [`SimpleWsdl11Definition`][io--webservices-r3] 和 [`SimpleXsdSchema`][io--webservices-r4] Bean。
若要這麼做，請設定其位置，如下例所示：

```properties
spring.webservices.wsdl-locations=classpath:/wsdl
```

```yaml
spring:
  webservices:
    wsdl-locations: "classpath:/wsdl"
```

## 使用 WebServiceTemplate 呼叫 Web Services

如果需要從應用程式呼叫遠端 Web 服務，可以使用 [`WebServiceTemplate`][io--webservices-r5] 類別。
由於 [`WebServiceTemplate`][io--webservices-r6] 實例通常需要先自訂再使用，Spring Boot 不會提供單一、自動設定的 [`WebServiceTemplate`][io--webservices-r6] Bean。
不過，它會自動設定 [`WebServiceTemplateBuilder`][io--webservices-r7]，供你在需要時建立 [`WebServiceTemplate`][io--webservices-r6] 實例。

下列程式碼展示典型範例：

```kotlin
import org.springframework.boot.webservices.client.WebServiceTemplateBuilder
import org.springframework.stereotype.Service
import org.springframework.ws.client.core.WebServiceTemplate
import org.springframework.ws.soap.client.core.SoapActionCallback

@Service
class MyService(webServiceTemplateBuilder: WebServiceTemplateBuilder) {

	private val webServiceTemplate: WebServiceTemplate

	init {
		webServiceTemplate = webServiceTemplateBuilder.build()
	}

	fun someWsCall(detailsReq: SomeRequest): SomeResponse {
		return webServiceTemplate.marshalSendAndReceive(
			detailsReq,
			SoapActionCallback("https://ws.example.com/action")
		) as SomeResponse
	}

}
```

```java
import org.springframework.boot.webservices.client.WebServiceTemplateBuilder;
import org.springframework.stereotype.Service;
import org.springframework.ws.client.core.WebServiceTemplate;
import org.springframework.ws.soap.client.core.SoapActionCallback;

@Service
public class MyService {

	private final WebServiceTemplate webServiceTemplate;

	public MyService(WebServiceTemplateBuilder webServiceTemplateBuilder) {
		this.webServiceTemplate = webServiceTemplateBuilder.build();
	}

	public SomeResponse someWsCall(SomeRequest detailsReq) {
		return (SomeResponse) this.webServiceTemplate.marshalSendAndReceive(detailsReq,
				new SoapActionCallback("https://ws.example.com/action"));
	}

}
```

預設情況下，[`WebServiceTemplateBuilder`][io--webservices-r7] 會依據 classpath 上可用的 HTTP 用戶端程式庫，偵測合適、以 HTTP 為基礎的 [`WebServiceMessageSender`][io--webservices-r8]。
你也可以為個別建構器自訂讀取與連線逾時，如下所示：

```kotlin
import org.springframework.boot.http.client.HttpClientSettings
import org.springframework.boot.webservices.client.WebServiceMessageSenderFactory
import org.springframework.boot.webservices.client.WebServiceTemplateBuilder
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.ws.client.core.WebServiceTemplate
import java.time.Duration

@Configuration(proxyBeanMethods = false)
class MyWebServiceTemplateConfiguration {

	@Bean
	fun webServiceTemplate(builder: WebServiceTemplateBuilder): WebServiceTemplate {
		val settings = HttpClientSettings.defaults()
				.withConnectTimeout(Duration.ofSeconds(2))
				.withReadTimeout(Duration.ofSeconds(2))
		builder.httpMessageSenderFactory(WebServiceMessageSenderFactory.http(settings))
		return builder.build()
	}

}
```

```java
import java.time.Duration;

import org.springframework.boot.http.client.HttpClientSettings;
import org.springframework.boot.webservices.client.WebServiceMessageSenderFactory;
import org.springframework.boot.webservices.client.WebServiceTemplateBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.ws.client.core.WebServiceTemplate;

@Configuration(proxyBeanMethods = false)
public class MyWebServiceTemplateConfiguration {

	@Bean
	public WebServiceTemplate webServiceTemplate(WebServiceTemplateBuilder builder) {
		HttpClientSettings settings = HttpClientSettings.defaults()
			.withConnectTimeout(Duration.ofSeconds(2))
			.withReadTimeout(Duration.ofSeconds(2));
		builder.httpMessageSenderFactory(WebServiceMessageSenderFactory.http(settings));
		return builder.build();
	}

}
```

> **提示：**
>
> 你也可以調整[全域 HTTP 用戶端設定][io--webservices-r9]；當未套用範本專用的自訂程式碼時，就會使用這些設定。

[io--webservices-r1]: https://docs.spring.io/spring-ws/docs/5.0.x/api/org/springframework/ws/server/endpoint/annotation/Endpoint.html
[io--webservices-r2]: https://docs.spring.io/spring-ws/docs/5.0.x/reference/html
[io--webservices-r3]: https://docs.spring.io/spring-ws/docs/5.0.x/api/org/springframework/ws/wsdl/wsdl11/SimpleWsdl11Definition.html
[io--webservices-r4]: https://docs.spring.io/spring-ws/docs/5.0.x/api/org/springframework/xml/xsd/SimpleXsdSchema.html
[io--webservices-r5]: https://docs.spring.io/spring-ws/docs/5.0.x/reference/html#client-web-service-template
[io--webservices-r6]: https://docs.spring.io/spring-ws/docs/5.0.x/api/org/springframework/ws/client/core/WebServiceTemplate.html
[io--webservices-r7]: https://docs.spring.io/spring-boot/4.1.1/api/java/org/springframework/boot/webservices/client/WebServiceTemplateBuilder.html
[io--webservices-r8]: https://docs.spring.io/spring-ws/docs/5.0.x/api/org/springframework/ws/transport/WebServiceMessageSender.html
[io--webservices-r9]: https://docs.spring.io/spring-boot/4.1/reference/io/rest-client.html#io.rest-client.clienthttprequestfactory.configuration
