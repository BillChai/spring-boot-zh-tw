# Spring HATEOAS

如果你開發的是使用超媒體的 RESTful API，Spring Boot 為 Spring HATEOAS 提供了適合大多數應用程式的自動設定。
自動設定讓你不必使用 [`@EnableHypermediaSupport`][r1]，並註冊多個 Bean，簡化超媒體應用程式的建置；其中包括提供用戶端支援的 [`LinkDiscoverers`][r2]，以及已設定好、能將回應正確編組為所需表示形式的 [`JsonMapper`][r3]。
你可以設定各種 `spring.jackson.*` 屬性，或使用已存在的 [`JsonMapperBuilderCustomizer`][r4] Bean，自訂 [`JsonMapper`][r3]。

你可以使用 [`@EnableHypermediaSupport`][r1] 自行掌控 Spring HATEOAS 的設定。
請注意，這樣會停用前述的 [`JsonMapper`][r3] 自訂功能。

> [WARNING]
>
> `spring-boot-starter-hateoas` 專用於 Spring MVC，不應與 Spring WebFlux 一起使用。
> 若要在 Spring WebFlux 中使用 Spring HATEOAS，可以直接加入 `org.springframework.hateoas:spring-hateoas` 相依項，以及 `spring-boot-starter-webflux`。

預設情況下，接受 `application/json` 的請求會收到 `application/hal+json` 回應。
若要停用此行為，請將 `spring.hateoas.use-hal-as-default-json-media-type` 設為 `false`，並定義 [`HypermediaMappingInformation`][r5] 或 [`HalConfiguration`][r6]，使 Spring HATEOAS 的設定符合應用程式及其用戶端的需求。
