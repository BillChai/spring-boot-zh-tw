# Spring HATEOAS

If you develop a RESTful API that makes use of hypermedia, Spring Boot provides auto-configuration for Spring HATEOAS that works well with most applications.
The auto-configuration replaces the need to use [`@EnableHypermediaSupport`][r1] and registers a number of beans to ease building hypermedia-based applications, including a [`LinkDiscoverers`][r2] (for client side support) and an [`JsonMapper`][r3] configured to correctly marshal responses into the desired representation.
The [`JsonMapper`][r3] is customized by setting the various `spring.jackson.*` properties or, if any exist, the [`JsonMapperBuilderCustomizer`][r4] beans.

You can take control of Spring HATEOAS’s configuration by using [`@EnableHypermediaSupport`][r1].
Note that doing so disables the [`JsonMapper`][r3] customization described earlier.

> [WARNING]
>
> `spring-boot-starter-hateoas` is specific to Spring MVC and should not be combined with Spring WebFlux.
> In order to use Spring HATEOAS with Spring WebFlux, you can add a direct dependency on `org.springframework.hateoas:spring-hateoas` along with `spring-boot-starter-webflux`.

By default, requests that accept `application/json` will receive an `application/hal+json` response.
To disable this behavior set `spring.hateoas.use-hal-as-default-json-media-type` to `false` and define a [`HypermediaMappingInformation`][r5] or [`HalConfiguration`][r6] to configure Spring HATEOAS to meet the needs of your application and its clients.
