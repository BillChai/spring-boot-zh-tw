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

```properties
spring.security.oauth2.client.registration.my-client.client-id=abcd
spring.security.oauth2.client.registration.my-client.client-secret=password
spring.security.oauth2.client.registration.my-client.provider=example
spring.security.oauth2.client.registration.example.client-id=abcd
spring.security.oauth2.client.registration.example.client-secret=password
```

```yaml
spring:
  security:
    oauth2:
      client:
        registration:
          my-client:
            client-id: "abcd"
            client-secret: "password"
            provider: "example"
          example:
            client-id: "abcd"
            client-secret: "password"
```

The registrations `my-client` and `example` will both use the provider with ID `example`.
The former will do so due to the value of the `spring.security.oauth2.client.registration.my-client.provider` property.
The latter will do so due to its ID being `example` and there being no `provider` property configured for the registration.

The specified provider can either be a reference to a provider configured using `spring.security.oauth2.client.provider.<provider-id>.*` properties or one of the [known common providers][r3].

You can register multiple OAuth2 clients and providers under the `spring.security.oauth2.client` prefix, as shown in the following example:

```properties
spring.security.oauth2.client.registration.my-login-client.client-id=abcd
spring.security.oauth2.client.registration.my-login-client.client-secret=password
spring.security.oauth2.client.registration.my-login-client.client-name=Client for OpenID Connect
spring.security.oauth2.client.registration.my-login-client.provider=my-oauth-provider
spring.security.oauth2.client.registration.my-login-client.scope=openid,profile,email,phone,address
spring.security.oauth2.client.registration.my-login-client.redirect-uri={baseUrl}/login/oauth2/code/{registrationId}
spring.security.oauth2.client.registration.my-login-client.client-authentication-method=client_secret_basic
spring.security.oauth2.client.registration.my-login-client.authorization-grant-type=authorization_code
spring.security.oauth2.client.registration.my-client-1.client-id=abcd
spring.security.oauth2.client.registration.my-client-1.client-secret=password
spring.security.oauth2.client.registration.my-client-1.client-name=Client for user scope
spring.security.oauth2.client.registration.my-client-1.provider=my-oauth-provider
spring.security.oauth2.client.registration.my-client-1.scope=user
spring.security.oauth2.client.registration.my-client-1.redirect-uri={baseUrl}/authorized/user
spring.security.oauth2.client.registration.my-client-1.client-authentication-method=client_secret_basic
spring.security.oauth2.client.registration.my-client-1.authorization-grant-type=authorization_code
spring.security.oauth2.client.registration.my-client-2.client-id=abcd
spring.security.oauth2.client.registration.my-client-2.client-secret=password
spring.security.oauth2.client.registration.my-client-2.client-name=Client for email scope
spring.security.oauth2.client.registration.my-client-2.provider=my-oauth-provider
spring.security.oauth2.client.registration.my-client-2.scope=email
spring.security.oauth2.client.registration.my-client-2.redirect-uri={baseUrl}/authorized/email
spring.security.oauth2.client.registration.my-client-2.client-authentication-method=client_secret_basic
spring.security.oauth2.client.registration.my-client-2.authorization-grant-type=authorization_code
spring.security.oauth2.client.provider.my-oauth-provider.authorization-uri=https://my-auth-server.com/oauth2/authorize
spring.security.oauth2.client.provider.my-oauth-provider.token-uri=https://my-auth-server.com/oauth2/token
spring.security.oauth2.client.provider.my-oauth-provider.user-info-uri=https://my-auth-server.com/userinfo
spring.security.oauth2.client.provider.my-oauth-provider.user-info-authentication-method=header
spring.security.oauth2.client.provider.my-oauth-provider.jwk-set-uri=https://my-auth-server.com/oauth2/jwks
spring.security.oauth2.client.provider.my-oauth-provider.user-name-attribute=name
```

```yaml
spring:
  security:
    oauth2:
      client:
        registration:
          my-login-client:
            client-id: "abcd"
            client-secret: "password"
            client-name: "Client for OpenID Connect"
            provider: "my-oauth-provider"
            scope: "openid,profile,email,phone,address"
            redirect-uri: "{baseUrl}/login/oauth2/code/{registrationId}"
            client-authentication-method: "client_secret_basic"
            authorization-grant-type: "authorization_code"

          my-client-1:
            client-id: "abcd"
            client-secret: "password"
            client-name: "Client for user scope"
            provider: "my-oauth-provider"
            scope: "user"
            redirect-uri: "{baseUrl}/authorized/user"
            client-authentication-method: "client_secret_basic"
            authorization-grant-type: "authorization_code"

          my-client-2:
            client-id: "abcd"
            client-secret: "password"
            client-name: "Client for email scope"
            provider: "my-oauth-provider"
            scope: "email"
            redirect-uri: "{baseUrl}/authorized/email"
            client-authentication-method: "client_secret_basic"
            authorization-grant-type: "authorization_code"

        provider:
          my-oauth-provider:
            authorization-uri: "https://my-auth-server.com/oauth2/authorize"
            token-uri: "https://my-auth-server.com/oauth2/token"
            user-info-uri: "https://my-auth-server.com/userinfo"
            user-info-authentication-method: "header"
            jwk-set-uri: "https://my-auth-server.com/oauth2/jwks"
            user-name-attribute: "name"
```

In this example, there are three registrations.
In order of declaration, their IDs are `my-login-client`, `my-client-1`, and `my-client-2`.
There is also a single provider with ID `my-oauth-provider`.

For OpenID Connect providers that support [OpenID Connect discovery][r4], the configuration can be further simplified.
The provider needs to be configured with an `issuer-uri` which is the URI that it asserts as its Issuer Identifier.
For example, if the `issuer-uri` provided is `https://example.com`, then an “OpenID Provider Configuration Request” will be made to `https://example.com/.well-known/openid-configuration`.
The result is expected to be an “OpenID Provider Configuration Response”.
The following example shows how an OpenID Connect Provider can be configured with the `issuer-uri`:

```properties
spring.security.oauth2.client.provider.oidc-provider.issuer-uri=https://dev-123456.oktapreview.com/oauth2/default/
```

```yaml
spring:
  security:
    oauth2:
      client:
        provider:
          oidc-provider:
            issuer-uri: "https://dev-123456.oktapreview.com/oauth2/default/"
```

By default, Spring Security’s [`OAuth2LoginAuthenticationFilter`][r5] only processes URLs matching `/login/oauth2/code/*`.
If you want to customize the `redirect-uri` to use a different pattern, you need to provide configuration to process that custom pattern.
For example, for servlet applications, you can add your own [`SecurityFilterChain`][r6] that resembles the following:

```kotlin
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.security.config.annotation.web.builders.HttpSecurity
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity
import org.springframework.security.config.annotation.web.invoke
import org.springframework.security.web.SecurityFilterChain

@Configuration(proxyBeanMethods = false)
@EnableWebSecurity
open class MyOAuthClientConfiguration {

	@Bean
	open fun securityFilterChain(http: HttpSecurity): SecurityFilterChain {
		http {
			authorizeHttpRequests {
				authorize(anyRequest, authenticated)
			}
			oauth2Login {
				redirectionEndpoint {
					baseUri = "/login/oauth2/callback/*"
				}
			}
		}
		return http.build()
	}

}
```

```java
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration(proxyBeanMethods = false)
@EnableWebSecurity
public class MyOAuthClientConfiguration {

	@Bean
	public SecurityFilterChain securityFilterChain(HttpSecurity http) {
		http.authorizeHttpRequests((requests) ->
			requests.anyRequest().authenticated()
		);
		http.oauth2Login((login) ->
			login.redirectionEndpoint((endpoint) ->
				endpoint.baseUri("/login/oauth2/callback/*")
			)
		);
		return http.build();
	}

}
```

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

```properties
spring.security.oauth2.client.registration.my-client.client-id=abcd
spring.security.oauth2.client.registration.my-client.client-secret=password
spring.security.oauth2.client.registration.my-client.provider=google
spring.security.oauth2.client.registration.google.client-id=abcd
spring.security.oauth2.client.registration.google.client-secret=password
```

```yaml
spring:
  security:
    oauth2:
      client:
        registration:
          my-client:
            client-id: "abcd"
            client-secret: "password"
            provider: "google"
          google:
            client-id: "abcd"
            client-secret: "password"
```

## Resource Server

If you have `spring-security-oauth2-resource-server` on your classpath, Spring Boot can set up an OAuth2 Resource Server.
For JWT configuration, a JWK Set URI or OIDC Issuer URI needs to be specified, as shown in the following examples:

```properties
spring.security.oauth2.resourceserver.jwt.jwk-set-uri=https://example.com/oauth2/default/v1/keys
```

```yaml
spring:
  security:
    oauth2:
      resourceserver:
        jwt:
          jwk-set-uri: "https://example.com/oauth2/default/v1/keys"
```

```properties
spring.security.oauth2.resourceserver.jwt.issuer-uri=https://dev-123456.oktapreview.com/oauth2/default/
```

```yaml
spring:
  security:
    oauth2:
      resourceserver:
        jwt:
          issuer-uri: "https://dev-123456.oktapreview.com/oauth2/default/"
```

> [NOTE]
>
> If the authorization server does not support a JWK Set URI, you can configure the resource server with the Public Key used for verifying the signature of the JWT.
> This can be done using the `spring.security.oauth2.resourceserver.jwt.public-key-location` property, where the value needs to point to a file containing the public key in the PEM-encoded x509 format.

The `spring.security.oauth2.resourceserver.jwt.audiences` property can be used to specify the expected values of the aud claim in JWTs.
For example, to require JWTs to contain an aud claim with the value `my-audience`:

```properties
spring.security.oauth2.resourceserver.jwt.audiences[0]=my-audience
```

```yaml
spring:
  security:
    oauth2:
      resourceserver:
        jwt:
          audiences:
            - "my-audience"
```

The same properties are applicable for both servlet and reactive applications.
Alternatively, you can define your own [`JwtDecoder`][r11] bean for servlet applications or a [`ReactiveJwtDecoder`][r12] for reactive applications.

In cases where opaque tokens are used instead of JWTs, you can configure the following properties to validate tokens through introspection:

```properties
spring.security.oauth2.resourceserver.opaquetoken.introspection-uri=https://example.com/check-token
spring.security.oauth2.resourceserver.opaquetoken.client-id=my-client-id
spring.security.oauth2.resourceserver.opaquetoken.client-secret=my-client-secret
```

```yaml
spring:
  security:
    oauth2:
      resourceserver:
        opaquetoken:
          introspection-uri: "https://example.com/check-token"
          client-id: "my-client-id"
          client-secret: "my-client-secret"
```

Again, the same properties are applicable for both servlet and reactive applications.

The result is an auto-configured introspector. Either a [`SpringOpaqueTokenIntrospector`][r13] or, in a reactive application, a [`SpringReactiveOpaqueTokenIntrospector`][r14].
These auto-configured introspectors can be customized using [`SpringOpaqueTokenIntrospectorBuilderCustomizer`][r15] and [`SpringReactiveOpaqueTokenIntrospectorBuilderCustomizer`][r16] beans respectively.

To take complete control of the introspection, define your own [`OpaqueTokenIntrospector`][r17] or [`ReactiveOpaqueTokenIntrospector`][r18] bean.

## Authorization Server

If you have `spring-security-oauth2-authorization-server` on your classpath, you can take advantage of some auto-configuration to set up a Servlet-based OAuth2 Authorization Server.

You can register multiple OAuth2 clients under the `spring.security.oauth2.authorizationserver.client` prefix, as shown in the following example:

```properties
spring.security.oauth2.authorizationserver.client.my-client-1.registration.client-id=abcd
spring.security.oauth2.authorizationserver.client.my-client-1.registration.client-secret={noop}secret1
spring.security.oauth2.authorizationserver.client.my-client-1.registration.client-authentication-methods[0]=client_secret_basic
spring.security.oauth2.authorizationserver.client.my-client-1.registration.authorization-grant-types[0]=authorization_code
spring.security.oauth2.authorizationserver.client.my-client-1.registration.authorization-grant-types[1]=refresh_token
spring.security.oauth2.authorizationserver.client.my-client-1.registration.redirect-uris[0]=https://my-client-1.com/login/oauth2/code/abcd
spring.security.oauth2.authorizationserver.client.my-client-1.registration.redirect-uris[1]=https://my-client-1.com/authorized
spring.security.oauth2.authorizationserver.client.my-client-1.registration.scopes[0]=openid
spring.security.oauth2.authorizationserver.client.my-client-1.registration.scopes[1]=profile
spring.security.oauth2.authorizationserver.client.my-client-1.registration.scopes[2]=email
spring.security.oauth2.authorizationserver.client.my-client-1.registration.scopes[3]=phone
spring.security.oauth2.authorizationserver.client.my-client-1.registration.scopes[4]=address
spring.security.oauth2.authorizationserver.client.my-client-1.require-authorization-consent=true
spring.security.oauth2.authorizationserver.client.my-client-1.token.authorization-code-time-to-live=5m
spring.security.oauth2.authorizationserver.client.my-client-1.token.access-token-time-to-live=10m
spring.security.oauth2.authorizationserver.client.my-client-1.token.access-token-format=reference
spring.security.oauth2.authorizationserver.client.my-client-1.token.reuse-refresh-tokens=false
spring.security.oauth2.authorizationserver.client.my-client-1.token.refresh-token-time-to-live=30m
spring.security.oauth2.authorizationserver.client.my-client-2.registration.client-id=efgh
spring.security.oauth2.authorizationserver.client.my-client-2.registration.client-secret={noop}secret2
spring.security.oauth2.authorizationserver.client.my-client-2.registration.client-authentication-methods[0]=client_secret_jwt
spring.security.oauth2.authorizationserver.client.my-client-2.registration.authorization-grant-types[0]=client_credentials
spring.security.oauth2.authorizationserver.client.my-client-2.registration.scopes[0]=user.read
spring.security.oauth2.authorizationserver.client.my-client-2.registration.scopes[1]=user.write
spring.security.oauth2.authorizationserver.client.my-client-2.jwk-set-uri=https://my-client-2.com/jwks
spring.security.oauth2.authorizationserver.client.my-client-2.token-endpoint-authentication-signing-algorithm=RS256
```

```yaml
spring:
  security:
    oauth2:
      authorizationserver:
        client:
          my-client-1:
            registration:
              client-id: "abcd"
              client-secret: "{noop}secret1"
              client-authentication-methods:
                - "client_secret_basic"
              authorization-grant-types:
                - "authorization_code"
                - "refresh_token"
              redirect-uris:
                - "https://my-client-1.com/login/oauth2/code/abcd"
                - "https://my-client-1.com/authorized"
              scopes:
                - "openid"
                - "profile"
                - "email"
                - "phone"
                - "address"
            require-authorization-consent: true
            token:
              authorization-code-time-to-live: 5m
              access-token-time-to-live: 10m
              access-token-format: "reference"
              reuse-refresh-tokens: false
              refresh-token-time-to-live: 30m
          my-client-2:
            registration:
              client-id: "efgh"
              client-secret: "{noop}secret2"
              client-authentication-methods:
                - "client_secret_jwt"
              authorization-grant-types:
                - "client_credentials"
              scopes:
                - "user.read"
                - "user.write"
            jwk-set-uri: "https://my-client-2.com/jwks"
            token-endpoint-authentication-signing-algorithm: "RS256"
```

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
