# Spring HATEOAS

<!-- source-attribution -->
> **非官方繁體中文翻譯** · Spring Boot 4.1.1 · 翻譯日期：2026-10-21  
> [官方英文網站](https://docs.spring.io/spring-boot/4.1/reference/web/spring-hateoas.html) · [固定版本英文來源](https://github.com/spring-projects/spring-boot/blob/v4.1.1/documentation/spring-boot-docs/src/docs/antora/modules/reference/pages/web/spring-hateoas.adoc) · [本地原文快照](../sources/spring-boot/documentation/spring-boot-docs/src/docs/antora/modules/reference/pages/web/spring-hateoas.adoc)  
> 原始作者與授權見 [來源聲明](../NOTICE.md)。官方範例及設定鍵保留原文，額外圖解另標示為譯者補充。

<!-- translation-status: translated -->

如果你開發的是使用超媒體的 RESTful API，Spring Boot 為 Spring HATEOAS 提供了適合大多數應用程式的自動設定。
自動設定讓你不必使用 [`@EnableHypermediaSupport`][web--spring-hateoas-r1]，並註冊多個 Bean，簡化超媒體應用程式的建置；其中包括提供用戶端支援的 [`LinkDiscoverers`][web--spring-hateoas-r2]，以及已設定好、能將回應正確編組為所需表示形式的 [`JsonMapper`][web--spring-hateoas-r3]。
你可以設定各種 `spring.jackson.*` 屬性，或使用已存在的 [`JsonMapperBuilderCustomizer`][web--spring-hateoas-r4] Bean，自訂 [`JsonMapper`][web--spring-hateoas-r3]。

你可以使用 [`@EnableHypermediaSupport`][web--spring-hateoas-r1] 自行掌控 Spring HATEOAS 的設定。
請注意，這樣會停用前述的 [`JsonMapper`][web--spring-hateoas-r3] 自訂功能。

> **警告：**
>
> `spring-boot-starter-hateoas` 專用於 Spring MVC，不應與 Spring WebFlux 一起使用。
> 若要在 Spring WebFlux 中使用 Spring HATEOAS，可以直接加入 `org.springframework.hateoas:spring-hateoas` 相依項，以及 `spring-boot-starter-webflux`。

預設情況下，接受 `application/json` 的請求會收到 `application/hal+json` 回應。
若要停用此行為，請將 `spring.hateoas.use-hal-as-default-json-media-type` 設為 `false`，並定義 [`HypermediaMappingInformation`][web--spring-hateoas-r5] 或 [`HalConfiguration`][web--spring-hateoas-r6]，使 Spring HATEOAS 的設定符合應用程式及其用戶端的需求。

[web--spring-hateoas-r1]: https://docs.spring.io/spring-hateoas/docs/3.1.x/api/org/springframework/hateoas/config/EnableHypermediaSupport.html
[web--spring-hateoas-r2]: https://docs.spring.io/spring-hateoas/docs/3.1.x/api/org/springframework/hateoas/client/LinkDiscoverers.html
[web--spring-hateoas-r3]: https://javadoc.io/doc/tools.jackson.core/jackson-databind/3.1.5/tools/jackson/databind/json/JsonMapper.html
[web--spring-hateoas-r4]: https://docs.spring.io/spring-boot/4.1.1/api/java/org/springframework/boot/jackson/autoconfigure/JsonMapperBuilderCustomizer.html
[web--spring-hateoas-r5]: https://docs.spring.io/spring-hateoas/docs/3.1.x/api/org/springframework/hateoas/config/HypermediaMappingInformation.html
[web--spring-hateoas-r6]: https://docs.spring.io/spring-hateoas/docs/3.1.x/api/org/springframework/hateoas/mediatype/hal/HalConfiguration.html
