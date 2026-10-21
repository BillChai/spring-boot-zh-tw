# Cloud Foundry 支援

<!-- source-attribution -->
> **非官方繁體中文翻譯** · Spring Boot 4.1.1 · 翻譯日期：2026-10-21  
> [官方英文網站](https://docs.spring.io/spring-boot/4.1/reference/actuator/cloud-foundry.html) · [固定版本英文來源](https://github.com/spring-projects/spring-boot/blob/v4.1.1/documentation/spring-boot-docs/src/docs/antora/modules/reference/pages/actuator/cloud-foundry.adoc) · [本地原文快照](../sources/spring-boot/documentation/spring-boot-docs/src/docs/antora/modules/reference/pages/actuator/cloud-foundry.adoc)  
> 原始作者與授權見 [來源聲明](../NOTICE.md)。官方範例及設定鍵保留原文，額外圖解另標示為譯者補充。

<!-- translation-status: translated -->

Spring Boot 的 `spring-boot-cloudfoundry` 模組（包含在 `spring-boot-starter-cloudfoundry` 中）提供額外支援，在部署到相容的 Cloud Foundry 實例時啟用。
`/cloudfoundryapplication` 路徑為所有 [`@Endpoint`][actuator--cloud-foundry-r1] Bean 提供另一條受到保護的存取路徑。

這項擴充支援可將 Spring Boot actuator 資訊加入 Cloud Foundry 管理介面，例如用來檢視已部署應用程式的 Web 應用程式。
舉例來說，應用程式狀態頁可以顯示完整健康資訊，而不只是一般的「執行中」或「已停止」狀態。

> **注意：**
>
> 一般使用者無法直接存取 `/cloudfoundryapplication` 路徑。
> 若要使用此端點，請求必須攜帶有效的 UAA token。

## 停用 Cloud Foundry 擴充 Actuator 支援

若要完全停用 `/cloudfoundryapplication` 端點，可在 `application.properties` 加入以下設定：

```properties
management.cloudfoundry.enabled=false
```

```yaml
management:
  cloudfoundry:
    enabled: false
```

## Cloud Foundry 自簽憑證

預設情況下，`/cloudfoundryapplication` 端點的安全驗證會透過 SSL 呼叫多個 Cloud Foundry 服務。
如果 Cloud Foundry UAA 或 Cloud Controller 服務使用自簽憑證，必須設定以下屬性：

```properties
management.cloudfoundry.skip-ssl-validation=true
```

```yaml
management:
  cloudfoundry:
    skip-ssl-validation: true
```

## 自訂上下文路徑

若伺服器的 context-path 設定為 `/` 以外的路徑，Cloud Foundry 端點就不會位於應用程式根路徑。
例如 `server.servlet.context-path=/app` 時，Cloud Foundry 端點位於 `/app/cloudfoundryapplication/*`。

如果希望不論伺服器 context-path 為何，Cloud Foundry 端點都位於 `/cloudfoundryapplication/*`，就必須在應用程式中明確設定。
設定方式依使用的 Web 伺服器而異。
Tomcat 可加入以下設定：

```kotlin
import jakarta.servlet.GenericServlet
import jakarta.servlet.Servlet
import jakarta.servlet.ServletContainerInitializer
import jakarta.servlet.ServletContext
import jakarta.servlet.ServletException
import jakarta.servlet.ServletRequest
import jakarta.servlet.ServletResponse
import org.apache.catalina.Host
import org.apache.catalina.core.StandardContext
import org.apache.catalina.startup.Tomcat.FixContextListener
import org.springframework.boot.tomcat.servlet.TomcatServletWebServerFactory
import org.springframework.boot.web.servlet.ServletContextInitializer
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import java.io.IOException
import java.util.Collections.emptySet

@Configuration(proxyBeanMethods = false)
class MyCloudFoundryConfiguration {

	@Bean
	fun servletWebServerFactory(): TomcatServletWebServerFactory {
		return object : TomcatServletWebServerFactory() {

			override fun prepareContext(host: Host, initializers: Array<ServletContextInitializer>, tempDirs: TempDirs) {
				super.prepareContext(host, initializers, tempDirs)
				val child = StandardContext()
				child.addLifecycleListener(FixContextListener())
				child.path = "/cloudfoundryapplication"
				val initializer = getServletContextInitializer(contextPath)
				child.addServletContainerInitializer(initializer, emptySet())
				child.crossContext = true
				host.addChild(child)
			}

		}
	}

	private fun getServletContextInitializer(contextPath: String): ServletContainerInitializer {
		return ServletContainerInitializer { classes: Set<Class<*>?>?, context: ServletContext ->
			val servlet: Servlet = object : GenericServlet() {

				@Throws(ServletException::class, IOException::class)
				override fun service(req: ServletRequest, res: ServletResponse) {
					val servletContext = req.servletContext.getContext(contextPath)
					servletContext.getRequestDispatcher("/cloudfoundryapplication").forward(req, res)
				}

			}
			context.addServlet("cloudfoundry", servlet).addMapping("/*")
		}
	}
}
```

```java
import java.io.IOException;
import java.util.Collections;

import jakarta.servlet.GenericServlet;
import jakarta.servlet.Servlet;
import jakarta.servlet.ServletContainerInitializer;
import jakarta.servlet.ServletContext;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import org.apache.catalina.Host;
import org.apache.catalina.core.StandardContext;
import org.apache.catalina.startup.Tomcat;

import org.springframework.boot.tomcat.servlet.TomcatServletWebServerFactory;
import org.springframework.boot.web.servlet.ServletContextInitializer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration(proxyBeanMethods = false)
public class MyCloudFoundryConfiguration {

	@Bean
	public TomcatServletWebServerFactory servletWebServerFactory() {
		return new TomcatServletWebServerFactory() {

			@Override
			protected void prepareContext(Host host, ServletContextInitializer[] initializers, TempDirs tempDirs) {
				super.prepareContext(host, initializers, tempDirs);
				StandardContext child = new StandardContext();
				child.addLifecycleListener(new Tomcat.FixContextListener());
				child.setPath("/cloudfoundryapplication");
				ServletContainerInitializer initializer = getServletContextInitializer(getContextPath());
				child.addServletContainerInitializer(initializer, Collections.emptySet());
				child.setCrossContext(true);
				host.addChild(child);
			}

		};
	}

	private ServletContainerInitializer getServletContextInitializer(String contextPath) {
		return (classes, context) -> {
			Servlet servlet = new GenericServlet() {

				@Override
				public void service(ServletRequest req, ServletResponse res) throws ServletException, IOException {
					ServletContext context = req.getServletContext().getContext(contextPath);
					context.getRequestDispatcher("/cloudfoundryapplication").forward(req, res);
				}

			};
			context.addServlet("cloudfoundry", servlet).addMapping("/*");
		};
	}

}
```

如果使用以 WebFlux 為基礎的應用程式，可採用以下設定：

```kotlin
import org.springframework.boot.context.properties.EnableConfigurationProperties
import org.springframework.boot.webflux.autoconfigure.WebFluxProperties
import org.springframework.context.ApplicationContext
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.http.server.reactive.ContextPathCompositeHandler
import org.springframework.http.server.reactive.HttpHandler
import org.springframework.http.server.reactive.ServerHttpRequest
import org.springframework.http.server.reactive.ServerHttpResponse
import org.springframework.web.server.adapter.WebHttpHandlerBuilder
import reactor.core.publisher.Mono

@Configuration(proxyBeanMethods = false)
@EnableConfigurationProperties(WebFluxProperties::class)
class MyReactiveCloudFoundryConfiguration {

	@Bean
	fun httpHandler(applicationContext: ApplicationContext, properties: WebFluxProperties): HttpHandler {
		val httpHandler = WebHttpHandlerBuilder.applicationContext(applicationContext).build()
		return CloudFoundryHttpHandler(properties.basePath ?: "/", httpHandler)
	}

	private class CloudFoundryHttpHandler(basePath: String, private val delegate: HttpHandler) : HttpHandler {
		private val contextPathDelegate = ContextPathCompositeHandler(mapOf(basePath to delegate))

		override fun handle(request: ServerHttpRequest, response: ServerHttpResponse): Mono<Void> {
			// Remove underlying context path first (e.g. Servlet container)
			val path = request.path.pathWithinApplication().value()
			return if (path.startsWith("/cloudfoundryapplication")) {
				delegate.handle(request, response)
			} else {
				contextPathDelegate.handle(request, response)
			}
		}
	}
}
```

```java
import java.util.Map;

import reactor.core.publisher.Mono;

import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.boot.webflux.autoconfigure.WebFluxProperties;
import org.springframework.context.ApplicationContext;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.server.reactive.ContextPathCompositeHandler;
import org.springframework.http.server.reactive.HttpHandler;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.web.server.adapter.WebHttpHandlerBuilder;

@Configuration(proxyBeanMethods = false)
@EnableConfigurationProperties(WebFluxProperties.class)
public class MyReactiveCloudFoundryConfiguration {

	@Bean
	public HttpHandler httpHandler(ApplicationContext applicationContext, WebFluxProperties properties) {
		HttpHandler httpHandler = WebHttpHandlerBuilder.applicationContext(applicationContext).build();
		return new CloudFoundryHttpHandler(properties.getBasePath(), httpHandler);
	}

	private static final class CloudFoundryHttpHandler implements HttpHandler {

		private final HttpHandler delegate;

		private final ContextPathCompositeHandler contextPathDelegate;

		private CloudFoundryHttpHandler(String basePath, HttpHandler delegate) {
			this.delegate = delegate;
			this.contextPathDelegate = new ContextPathCompositeHandler(Map.of(basePath, delegate));
		}

		@Override
		public Mono<Void> handle(ServerHttpRequest request, ServerHttpResponse response) {
			// Remove underlying context path first (e.g. Servlet container)
			String path = request.getPath().pathWithinApplication().value();
			if (path.startsWith("/cloudfoundryapplication")) {
				return this.delegate.handle(request, response);
			}
			else {
				return this.contextPathDelegate.handle(request, response);
			}
		}

	}

}
```

[actuator--cloud-foundry-r1]: https://docs.spring.io/spring-boot/4.1.1/api/java/org/springframework/boot/actuate/endpoint/annotation/Endpoint.html
