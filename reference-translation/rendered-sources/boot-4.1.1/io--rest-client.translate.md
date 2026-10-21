# Calling REST Services

Spring Boot provides various convenient ways to call remote REST services.
If you are developing a non-blocking reactive application and you’re using Spring WebFlux, then you can use [`WebClient`][r1].
If you prefer imperative APIs then you can use [`RestClient`][r2] or [`RestTemplate`][r3].

## WebClient

If you have Spring WebFlux on your classpath we recommend that you use [`WebClient`][r1] to call remote REST services.
The [`WebClient`][r1] interface provides a functional style API and is fully reactive.
You can learn more about the [`WebClient`][r1] in the dedicated [section in the Spring Framework docs][r4].

> [TIP]
>
> If you are not writing a reactive Spring WebFlux application you can use the [`RestClient`][r5] instead of a [`WebClient`][r1].
> This provides a similar functional API, but is imperative rather than reactive.

Spring Boot creates and pre-configures a prototype [`WebClient.Builder`][r6] bean for you.
It is strongly advised to inject it in your components and use it to create [`WebClient`][r1] instances.
Spring Boot is configuring that builder to share HTTP resources and reflect codecs setup in the same fashion as the server ones (see [WebFlux HTTP codecs auto-configuration][r7]), and more.

The following code shows a typical example:

{{CODE_0}}

{{CODE_1}}

### WebClient Runtime

Spring Boot will auto-detect which [`ClientHttpConnector`][r8] to use to drive [`WebClient`][r1] depending on the libraries available on the application classpath.
In order of preference, the following clients are supported:

1. Reactor Netty
2. Jetty RS client
3. Apache HttpClient
4. JDK HttpClient

If multiple clients are available on the classpath, the most preferred client will be used.

The `spring-boot-starter-webflux` starter depends on `io.projectreactor.netty:reactor-netty` by default, which brings both server and client implementations.
If you choose to use Jetty as a reactive server instead, you should add a dependency on the Jetty Reactive HTTP client library, `org.eclipse.jetty:jetty-reactive-httpclient`.
Using the same technology for server and client has its advantages, as it will automatically share HTTP resources between client and server.

Developers can override the resource configuration for Jetty and Reactor Netty by providing a custom [`ReactorResourceFactory`][r9] or [`JettyResourceFactory`][r10] bean - this will be applied to both clients and servers.

If you wish to override that choice for the client, you can define your own [`ClientHttpConnector`][r8] bean and have full control over the client configuration.

You can learn more about the [`WebClient` configuration options in the Spring Framework reference documentation][r11].

### Global HTTP Connector Configuration

If the auto-detected [`ClientHttpConnector`][r8] does not meet your needs, you can use the `spring.http.clients.reactive.connector` property to pick a specific connector.
For example, if you have Reactor Netty on your classpath, but you prefer Jetty’s [`HttpClient`][r12] you can add the following:

{{CODE_2}}

{{CODE_3}}

> [TIP]
>
> You can also use [global configuration properties][r13] which apply to all HTTP clients.

For more complex customizations, you can use [`ClientHttpConnectorBuilderCustomizer`][r14] or declare your own [`ClientHttpConnectorBuilder`][r15] bean which will cause auto-configuration to back off.
This can be useful when you need to customize some of the internals of the underlying HTTP library.

For example, the following will use a JDK client configured with a specific [`ProxySelector`][r16]:

{{CODE_4}}

{{CODE_5}}

### WebClient Customization

There are three main approaches to [`WebClient`][r1] customization, depending on how broadly you want the customizations to apply.

To make the scope of any customizations as narrow as possible, inject the auto-configured [`WebClient.Builder`][r6] and then call its methods as required.
[`WebClient.Builder`][r6] instances are stateful: Any change on the builder is reflected in all clients subsequently created with it.
If you want to create several clients with the same builder, you can also consider cloning the builder with `WebClient.Builder other = builder.clone();`.

To make an application-wide, additive customization to all [`WebClient.Builder`][r6] instances, you can declare [`WebClientCustomizer`][r17] beans and change the [`WebClient.Builder`][r6] locally at the point of injection.

Finally, you can fall back to the original API and use `WebClient.create()`.
In that case, no auto-configuration or [`WebClientCustomizer`][r17] is applied.

### WebClient SSL Support

If you need custom SSL configuration on the [`ClientHttpConnector`][r8] used by the [`WebClient`][r1], you can inject a [`WebClientSsl`][r18] instance that can be used with the builder’s `apply` method.

The [`WebClientSsl`][r18] interface provides access to any [SSL bundles][r19] that you have defined in your `application.properties` or `application.yaml` file.

The following code shows a typical example:

{{CODE_6}}

{{CODE_7}}

## RestClient

If you are not using Spring WebFlux or Project Reactor in your application we recommend that you use [`RestClient`][r2] to call remote REST services.

The [`RestClient`][r2] interface provides a functional style imperative API.

Spring Boot creates and pre-configures a prototype [`RestClient.Builder`][r20] bean for you.
It is strongly advised to inject it in your components and use it to create [`RestClient`][r2] instances.
Spring Boot is configuring that builder with [`HttpMessageConverters`][r21] and an appropriate [`ClientHttpRequestFactory`][r22].

The following code shows a typical example:

{{CODE_8}}

{{CODE_9}}

### RestClient Customization

There are three main approaches to [`RestClient`][r2] customization, depending on how broadly you want the customizations to apply.

To make the scope of any customizations as narrow as possible, inject the auto-configured [`RestClient.Builder`][r20] and then call its methods as required.
[`RestClient.Builder`][r20] instances are stateful: Any change on the builder is reflected in all clients subsequently created with it.
If you want to create several clients with the same builder, you can also consider cloning the builder with `RestClient.Builder other = builder.clone();`.

To make an application-wide, additive customization to all [`RestClient.Builder`][r20] instances, you can declare [`RestClientCustomizer`][r23] beans and change the [`RestClient.Builder`][r20] locally at the point of injection.

Finally, you can fall back to the original API and use `RestClient.create()`.
In that case, no auto-configuration or [`RestClientCustomizer`][r23] is applied.

> [TIP]
>
> You can also change the [global HTTP client configuration][r24].

### RestClient SSL Support

If you need custom SSL configuration on the [`ClientHttpRequestFactory`][r22] used by the [`RestClient`][r2], you can inject a [`RestClientSsl`][r25] instance that can be used with the builder’s `apply` method.

The [`RestClientSsl`][r25] interface provides access to any [SSL bundles][r19] that you have defined in your `application.properties` or `application.yaml` file.

The following code shows a typical example:

{{CODE_10}}

{{CODE_11}}

If you need to apply other customization in addition to an SSL bundle, you can use the [`HttpClientSettings`][r26] class with [`ClientHttpRequestFactoryBuilder`][r27]:

{{CODE_12}}

{{CODE_13}}

## RestTemplate

Spring Framework’s [`RestTemplate`][r3] class predates [`RestClient`][r2] and is the classic way that many applications use to call remote REST services.
You might choose to use [`RestTemplate`][r3] when you have existing code that you don’t want to migrate to [`RestClient`][r2], or because you’re already familiar with the [`RestTemplate`][r3] API.

Since [`RestTemplate`][r3] instances often need to be customized before being used, Spring Boot does not provide any single auto-configured [`RestTemplate`][r3] bean.
It does, however, auto-configure a [`RestTemplateBuilder`][r28], which can be used to create [`RestTemplate`][r3] instances when needed.
The auto-configured [`RestTemplateBuilder`][r28] ensures that sensible [`HttpMessageConverters`][r29] and an appropriate [`ClientHttpRequestFactory`][r22] are applied to [`RestTemplate`][r3] instances.

The following code shows a typical example:

{{CODE_14}}

{{CODE_15}}

[`RestTemplateBuilder`][r28] includes a number of useful methods that can be used to quickly configure a [`RestTemplate`][r3].
For example, to add BASIC authentication support, you can use `builder.basicAuthentication("user", "password").build()`.

### RestTemplate Customization

There are three main approaches to [`RestTemplate`][r3] customization, depending on how broadly you want the customizations to apply.

To make the scope of any customizations as narrow as possible, inject the auto-configured [`RestTemplateBuilder`][r28] and then call its methods as required.
Each method call returns a new [`RestTemplateBuilder`][r28] instance, so the customizations only affect this use of the builder.

To make an application-wide, additive customization, use a [`RestTemplateCustomizer`][r30] bean.
All such beans are automatically registered with the auto-configured [`RestTemplateBuilder`][r28] and are applied to any templates that are built with it.

The following example shows a customizer that configures the use of a proxy for all hosts except `192.168.0.5`:

{{CODE_16}}

{{CODE_17}}

Finally, you can define your own [`RestTemplateBuilder`][r28] bean.
Doing so will replace the auto-configured builder.
If you want any [`RestTemplateCustomizer`][r30] beans to be applied to your custom builder, as the auto-configuration would have done, configure it using a [`RestTemplateBuilderConfigurer`][r31].
The following example exposes a [`RestTemplateBuilder`][r28] that matches what Spring Boot’s auto-configuration would have done, except that custom connect and read timeouts are also specified:

{{CODE_18}}

{{CODE_19}}

The most extreme (and rarely used) option is to create your own [`RestTemplateBuilder`][r28] bean without using a configurer.
In addition to replacing the auto-configured builder, this also prevents any [`RestTemplateCustomizer`][r30] beans from being used.

> [TIP]
>
> You can also change the [global HTTP client configuration][r24].

### RestTemplate SSL Support

If you need custom SSL configuration on the [`RestTemplate`][r3], you can apply an [SSL bundle][r19] to the [`RestTemplateBuilder`][r28] as shown in this example:

{{CODE_20}}

{{CODE_21}}

## HTTP Client Detection for RestClient and RestTemplate

Spring Boot will auto-detect which HTTP client to use with [`RestClient`][r2] and [`RestTemplate`][r3] depending on the libraries available on the application classpath.
In order of preference, the following clients are supported:

1. Apache HttpClient
2. Jetty HttpClient
3. Reactor Netty HttpClient
4. JDK client (`java.net.http.HttpClient`)
5. Simple JDK client (`java.net.HttpURLConnection`)

If multiple clients are available on the classpath, and no global configuration is provided, the most preferred client will be used.

### Global HTTP Client Configuration

If the auto-detected HTTP client does not meet your needs, you can use the `spring.http.clients.imperative.factory` property to pick a specific factory.
For example, if you have Apache HttpClient on your classpath, but you prefer Jetty’s [`HttpClient`][r12] you can add the following:

{{CODE_22}}

{{CODE_23}}

> [TIP]
>
> You can also use [global configuration properties][r13] which apply to all HTTP clients.

For more complex customizations, you can use [`ClientHttpRequestFactoryBuilderCustomizer`][r32] or declare your own [`ClientHttpRequestFactoryBuilder`][r27] bean which will cause auto-configuration to back off.
This can be useful when you need to customize some of the internals of the underlying HTTP library.

For example, the following will use a JDK client configured with a specific [`ProxySelector`][r16]:

{{CODE_24}}

{{CODE_25}}

## API Versioning

Both `WebClient` and `RestClient` support making versioned remote HTTP calls so that APIs can be evolved over time.
Commonly this involves sending an HTTP header, a query parameter or URL path segment that indicates the version of the API that should be used.

You can configure API versioning using methods on `WebClient.Builder` or `RestClient.Builder`.

> [TIP]
>
> API versioning is also supported on the server-side.
> See the [Spring MVC][r33] and [Spring WebFlux][r34] sections for details.

> [NOTE]
>
> The server-side API versioning configuration is not taken into account to auto-configure the client.
> Clients that should use an API versioning strategy, typically for testing, need to configure it explicitly.

## HTTP Service Interface Clients

Instead of directly using a [`RestClient`][r2] or [`WebClient`][r1] to call an HTTP service, it’s also possible to call them using annotated Java interfaces.

HTTP Service interfaces defines a service contract by using methods that are annotated with [`@HttpExchange`][r35], or more typically the method specific variants ([`@GetExchange`][r36], [`@PostExchange`][r37], [`@DeleteExchange`][r38], etc).

For example, the following code defines an HTTP Service for an “echo” API that will return a JSON object containing an echo of the request.

{{CODE_26}}

{{CODE_27}}

More details about how to develop HTTP Service interface clients can be found in the [Spring Framework reference documentation][r39].

### Importing HTTP Services

In order to use an HTTP Service interface as client you need to import it.
One way to achieve this is to use the [`@ImportHttpServices`][r40] annotation, typically on your main application class.
You can use the annotation to import specific classes, or scan for classes to import from specific packages.

For example, the following configuration will scan for HTTP Service interfaces in the `com.example.myclients` package:

{{CODE_28}}

{{CODE_29}}

### Service Client Groups

Hard-coding absolute URLs in [`@HttpExchange`][r35] annotations is often not ideal in production applications.
Instead, you will typically want to give the HTTP Service client a logical name in your code, and then lookup a URL from a property based on that name.

HTTP Service clients allow you to do this by registering them into named groups.
An HTTP Service group is a collection of HTTP Service interfaces that all share common features.

For example, we may want to define an “echo” group to use for HTTP Service clients that call `https://echo.zuplo.io`.

> [NOTE]
>
> HTTP Service groups can be used to define more than just URLs.
> For example, your group could define connection timeouts and SSL settings.
> You can also associate client customization logic to a group, such as adding code to insert required authorization headers.

To associate an HTTP Service interface with a group when using [`@ImportHttpServices`][r40] you can use the `group` attribute.

For example, if we assume our example above is organized in such a way that all HTTP Service interfaces in the `com.example.myclients` package belong to the `echo` group.
We first remove the hardcoded URL from the service interface:

{{CODE_30}}

{{CODE_31}}

We can then write:

{{CODE_32}}

{{CODE_33}}

And finally we can then use a `base-url` property to link the `echo` group to an actual URL:

{{CODE_34}}

{{CODE_35}}

> [TIP]
>
> HTTP Service clients will be associated with a group named “default” if you don’t specify a group.

> [NOTE]
>
> If you have multiple HTTP Service interfaces in the same package that need to be associated with different groups you can list them individually.
> The [`@ImportHttpServices`][r40] is repeatable and the `types` attributes allows you to import individual classes.
>
> For example:
>
{{CODE_36}}
>
{{CODE_37}}

### Configuration Properties

Configuration properties for HTTP Services can be specified under `spring.http.serviceclient.<group-name>`:

You can use properties to configure aspects such as:

- The base URL.
- Any default headers that should be sent.
- API versioning configuration.
- Redirect settings.
- Connection and read timeouts.
- SSL bundles to use.

> [TIP]
>
> You can also use [global configuration properties][r13] which apply to all HTTP clients.

For example, the properties below will:

- Configure all HTTP clients to use a one second connect timeout (unless otherwise overridden).
- Configure HTTP Service clients in the “echo” group to:

  - Use a specific base URL.
  - Have a one-second connect timeout.
  - Have a two-second read timeout.

{{CODE_38}}

{{CODE_39}}

### Customization

If you need to customize HTTP Service clients beyond basic properties, you can use an HTTP Service group configurer.
For `RestClient` backed HTTP Service clients, you can declare a bean that implements [`RestClientHttpServiceGroupConfigurer`][r41].
For `WebClient` backed HTTP Service clients you can declare a bean that implements [`WebClientHttpServiceGroupConfigurer`][r42].

Both work in the same way and will be automatically applied by Spring Boot’s auto-configuration.

For example, the following configuration would add a group customizer that adds an HTTP header to each outgoing request containing the group name:

{{CODE_40}}

{{CODE_41}}

### Advanced Configuration

As well as the [`@ImportHttpServices`][r40] annotation, Spring Framework also offers an [`AbstractHttpServiceRegistrar`][r43] class.
You can [`@Import`][r44] your own extension of this class to perform programmatic configuration.
For more details, see [Spring Framework reference documentation][r45].

Regardless of which method you use to register HTTP Service clients, Spring Boot’s support remains the same.

## Applying Global Configuration to All HTTP Clients

Regardless of the underlying technology being used, all HTTP clients have common settings that can be configured.

These include:

- Connection Timeouts.
- Read Timeouts.
- How HTTP redirects should be handled.
- Which SSL bundle should be used when connecting.

These common settings are represented by the [`HttpClientSettings`][r26] class which can be passed into the `build(…​)` methods of [`ClientHttpConnectorBuilder`][r15] and [`ClientHttpRequestFactoryBuilder`][r27].

If you want to apply the same configuration to all auto-configured clients, you can use `spring.http.clients` properties to do so:

{{CODE_42}}

{{CODE_43}}

### InetAddress Filtering and SSRF Protection

It’s sometimes useful to limit the remote addresses that an HTTP client is permitted to call.
This technique can be especially useful when hardening your application against Server-Side Request Forgery (SSRF) attacks.

To limit the address that a client can call, you can use an [`InetAddressFilter`][r46] which will only allow outgoing calls to addresses that match the filter.
The filter is a functional interface and you can either create your own implementation, or use one of the convenient factory methods.

Filters may be applied to the [`HttpClientSettings`][r26] you used when building a client:

{{CODE_44}}

{{CODE_45}}

Or you can also define one as a [`@Bean`][r47] if you want to apply it to all auto-configured HTTP client builders:

{{CODE_46}}

{{CODE_47}}
