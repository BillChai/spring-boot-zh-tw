# OAuth2

[OAuth2][r1] is a widely used authorization framework.

## Client

If you have `spring-security-oauth2-client` on your classpath, you can take advantage of some auto-configuration to set up OAuth2/Open ID Connect clients.
This configuration makes use of the properties under [`OAuth2ClientProperties`][r2].
The same properties are applicable to both servlet and reactive web applications.

Each registration must specify an OAuth 2 provider.
When set, the value of the `spring.security.oauth2.client.registration.<registration-id>.provider` property is used to specify the registration’s provider.
If the `provider` property is not set, the registration’s ID is used instead.
Both approaches are shown in the following example:

{{CODE_0}}

{{CODE_1}}

The registrations `my-client` and `example` will both use the provider with ID `example`.
The former will do so due to the value of the `spring.security.oauth2.client.registration.my-client.provider` property.
The latter will do so due to its ID being `example` and there being no `provider` property configured for the registration.

The specified provider can either be a reference to a provider configured using `spring.security.oauth2.client.provider.<provider-id>.*` properties or one of the [known common providers][r3].

You can register multiple OAuth2 clients and providers under the `spring.security.oauth2.client` prefix, as shown in the following example:

{{CODE_2}}

{{CODE_3}}

In this example, there are three registrations.
In order of declaration, their IDs are `my-login-client`, `my-client-1`, and `my-client-2`.
There is also a single provider with ID `my-oauth-provider`.

For OpenID Connect providers that support [OpenID Connect discovery][r4], the configuration can be further simplified.
The provider needs to be configured with an `issuer-uri` which is the URI that it asserts as its Issuer Identifier.
For example, if the `issuer-uri` provided is `https://example.com`, then an “OpenID Provider Configuration Request” will be made to `https://example.com/.well-known/openid-configuration`.
The result is expected to be an “OpenID Provider Configuration Response”.
The following example shows how an OpenID Connect Provider can be configured with the `issuer-uri`:

{{CODE_4}}

{{CODE_5}}

By default, Spring Security’s [`OAuth2LoginAuthenticationFilter`][r5] only processes URLs matching `/login/oauth2/code/*`.
If you want to customize the `redirect-uri` to use a different pattern, you need to provide configuration to process that custom pattern.
For example, for servlet applications, you can add your own [`SecurityFilterChain`][r6] that resembles the following:

{{CODE_6}}

{{CODE_7}}

> [TIP]
>
> Spring Boot auto-configures an [`InMemoryOAuth2AuthorizedClientService`][r7] which is used by Spring Security for the management of client registrations.
> The [`InMemoryOAuth2AuthorizedClientService`][r7] has limited capabilities and we recommend using it only for development environments.
> For production environments, consider using a [`JdbcOAuth2AuthorizedClientService`][r8] or creating your own implementation of [`OAuth2AuthorizedClientService`][r9].

### OAuth2 Client Registration for Common Providers

For common OAuth2 and OpenID providers (Google, Github, Facebook, X, and Okta), we provide a set of provider defaults.
The IDs of these common providers are `google`, `github`, `facebook`, `x`, and `okta`, respectively.

If you do not need to customize these providers, set the registration’s `provider` property to the ID of one of the common providers.
Alternatively, you can [use a registration ID that matches the ID of the provider][r10].
The two configurations in the following example use the common `google` provider:

{{CODE_8}}

{{CODE_9}}

## Resource Server

If you have `spring-security-oauth2-resource-server` on your classpath, Spring Boot can set up an OAuth2 Resource Server.
For JWT configuration, a JWK Set URI or OIDC Issuer URI needs to be specified, as shown in the following examples:

{{CODE_10}}

{{CODE_11}}

{{CODE_12}}

{{CODE_13}}

> [NOTE]
>
> If the authorization server does not support a JWK Set URI, you can configure the resource server with the Public Key used for verifying the signature of the JWT.
> This can be done using the `spring.security.oauth2.resourceserver.jwt.public-key-location` property, where the value needs to point to a file containing the public key in the PEM-encoded x509 format.

The `spring.security.oauth2.resourceserver.jwt.audiences` property can be used to specify the expected values of the aud claim in JWTs.
For example, to require JWTs to contain an aud claim with the value `my-audience`:

{{CODE_14}}

{{CODE_15}}

The same properties are applicable for both servlet and reactive applications.
Alternatively, you can define your own [`JwtDecoder`][r11] bean for servlet applications or a [`ReactiveJwtDecoder`][r12] for reactive applications.

In cases where opaque tokens are used instead of JWTs, you can configure the following properties to validate tokens through introspection:

{{CODE_16}}

{{CODE_17}}

Again, the same properties are applicable for both servlet and reactive applications.

The result is an auto-configured introspector. Either a [`SpringOpaqueTokenIntrospector`][r13] or, in a reactive application, a [`SpringReactiveOpaqueTokenIntrospector`][r14].
These auto-configured introspectors can be customized using [`SpringOpaqueTokenIntrospectorBuilderCustomizer`][r15] and [`SpringReactiveOpaqueTokenIntrospectorBuilderCustomizer`][r16] beans respectively.

To take complete control of the introspection, define your own [`OpaqueTokenIntrospector`][r17] or [`ReactiveOpaqueTokenIntrospector`][r18] bean.

## Authorization Server

If you have `spring-security-oauth2-authorization-server` on your classpath, you can take advantage of some auto-configuration to set up a Servlet-based OAuth2 Authorization Server.

You can register multiple OAuth2 clients under the `spring.security.oauth2.authorizationserver.client` prefix, as shown in the following example:

{{CODE_18}}

{{CODE_19}}

> [NOTE]
>
> The `client-secret` property must be in a format that can be matched by the configured [`PasswordEncoder`][r19].
> The default instance of [`PasswordEncoder`][r19] is created via `PasswordEncoderFactories.createDelegatingPasswordEncoder()`.

The auto-configuration Spring Boot provides for Spring Authorization Server is designed for getting started quickly.
Most applications will require customization and will want to define several beans to override auto-configuration.

The following components can be defined as beans to override auto-configuration specific to Spring Authorization Server:

- [`RegisteredClientRepository`][r20]
- [`AuthorizationServerSettings`][r21]
- [`SecurityFilterChain`][r6]
- `com.nimbusds.jose.jwk.source.JWKSource<com.nimbusds.jose.proc.SecurityContext>`
- [`JwtDecoder`][r11]

> [TIP]
>
> Spring Boot auto-configures an [`InMemoryRegisteredClientRepository`][r22] which is used by Spring Authorization Server for the management of registered clients.
> The [`InMemoryRegisteredClientRepository`][r22] has limited capabilities and we recommend using it only for development environments.
> For production environments, consider using a [`JdbcRegisteredClientRepository`][r23] or creating your own implementation of [`RegisteredClientRepository`][r20].

Additional information can be found in the [Getting Started][r24] chapter of Spring Security Reference Documentation.
