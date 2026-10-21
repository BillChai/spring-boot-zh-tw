# Cloud Foundry Support

Spring Boot’s `spring-boot-cloudfoundry` module (part of `spring-boot-starter-cloudfoundry`) includes additional support that is activated when you deploy to a compatible Cloud Foundry instance.
The `/cloudfoundryapplication` path provides an alternative secured route to all [`@Endpoint`][r1] beans.

The extended support lets Cloud Foundry management UIs (such as the web application that you can use to view deployed applications) be augmented with Spring Boot actuator information.
For example, an application status page can include full health information instead of the typical “running” or “stopped” status.

> [NOTE]
>
> The `/cloudfoundryapplication` path is not directly accessible to regular users.
> To use the endpoint, you must pass a valid UAA token with the request.

## Disabling Extended Cloud Foundry Actuator Support

If you want to fully disable the `/cloudfoundryapplication` endpoints, you can add the following setting to your `application.properties` file:

```properties
management.cloudfoundry.enabled=false
```

```yaml
management:
  cloudfoundry:
    enabled: false
```

## Cloud Foundry Self-signed Certificates

By default, the security verification for `/cloudfoundryapplication` endpoints makes SSL calls to various Cloud Foundry services.
If your Cloud Foundry UAA or Cloud Controller services use self-signed certificates, you need to set the following property:

```properties
management.cloudfoundry.skip-ssl-validation=true
```

```yaml
management:
  cloudfoundry:
    skip-ssl-validation: true
```

## Custom Context Path

If the server’s context-path has been configured to anything other than `/`, the Cloud Foundry endpoints are not available at the root of the application.
For example, if `server.servlet.context-path=/app`, Cloud Foundry endpoints are available at `/app/cloudfoundryapplication/*`.

If you expect the Cloud Foundry endpoints to always be available at `/cloudfoundryapplication/*`, regardless of the server’s context-path, you need to explicitly configure that in your application.
The configuration differs, depending on the web server in use.
For Tomcat, you can add the following configuration:

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

If you’re using a Webflux based application, you can use the following configuration:

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
