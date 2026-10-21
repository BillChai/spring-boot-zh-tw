# Spring Security

If [Spring Security][r1] is on the classpath, then web applications are secured by default.
This includes securing Spring Boot’s `/error` endpoint.
Spring Boot relies on Spring Security’s content-negotiation strategy to determine whether to use `httpBasic` or `formLogin`.
To add method-level security to a web application, you can also add [`@EnableMethodSecurity`][r2] with your desired settings.
Additional information can be found in the [Spring Security Reference Guide][r3].

The default [`UserDetailsService`][r4] has a single user.
The user name is `user`, and the password is random and is printed at WARN level when the application starts, as shown in the following example:

```text
Using generated security password: 78fa095d-3f4c-48b1-ad50-e24c31d5cf35

This generated password is for development use only. Your security configuration must be updated before running your application in production.
```

> [NOTE]
>
> If you fine-tune your logging configuration, ensure that the `org.springframework.boot.security.autoconfigure` category is set to log `WARN`-level messages.
> Otherwise, the default password is not printed.

You can change the username and password by providing a `spring.security.user.name` and `spring.security.user.password`.

The basic features you get by default in a web application are:

- A [`UserDetailsService`][r4] (or [`ReactiveUserDetailsService`][r5] in case of a WebFlux application) bean with in-memory store and a single user with a generated password (see [`SecurityProperties.User`][r6] for the properties of the user).
- Form-based login or HTTP Basic security (depending on the `Accept` header in the request) for the entire application (including actuator endpoints if actuator is on the classpath).
- A [`DefaultAuthenticationEventPublisher`][r7] for publishing authentication events.

You can provide a different [`AuthenticationEventPublisher`][r8] by adding a bean for it.

## MVC Security

The default security configuration is implemented in [`SecurityAutoConfiguration`][r9] and [`UserDetailsServiceAutoConfiguration`][r10].
[`SecurityAutoConfiguration`][r9] imports `SpringBootWebSecurityConfiguration` for web security and [`UserDetailsServiceAutoConfiguration`][r10] for authentication.

To completely switch off the default web application security configuration, including Actuator security, or to combine multiple Spring Security components such as OAuth2 Client and Resource Server, add a bean of type [`SecurityFilterChain`][r11] (doing so does not disable the [`UserDetailsService`][r4] configuration).
To also switch off the [`UserDetailsService`][r4] configuration, add a bean of type [`UserDetailsService`][r4], [`AuthenticationProvider`][r12], or [`AuthenticationManager`][r13].

The auto-configuration of a [`UserDetailsService`][r4] will also back off when any of the following Spring Security modules is on the classpath:

- `spring-security-oauth2-client`
- `spring-security-oauth2-resource-server`
- `spring-security-saml2-service-provider`

To use [`UserDetailsService`][r4] in addition to one or more of these dependencies, define your own [`InMemoryUserDetailsManager`][r14] bean.

Access rules can be overridden by adding a custom [`SecurityFilterChain`][r11] bean.
Spring Boot provides convenience methods that can be used to override access rules for actuator endpoints and static resources.
[`EndpointRequest`][r15] can be used to create a [`RequestMatcher`][r16] that is based on the `management.endpoints.web.base-path` property.
[`PathRequest`][r17] can be used to create a [`RequestMatcher`][r16] for resources in commonly used locations.

## WebFlux Security

Similar to Spring MVC applications, you can secure your WebFlux applications by adding the `spring-boot-starter-security` dependency.
The default security configuration is implemented in [`ReactiveWebSecurityAutoConfiguration`][r18] and [`ReactiveUserDetailsServiceAutoConfiguration`][r19].
In addition to reactive web applications, the latter is also auto-configured when RSocket is in use.
[`ReactiveWebSecurityAutoConfiguration`][r18] imports `WebFluxSecurityConfiguration` for web security.
[`ReactiveUserDetailsServiceAutoConfiguration`][r19] auto-configures authentication.

To completely switch off the default web application security configuration, including Actuator security, add a bean of type [`WebFilterChainProxy`][r20] (doing so does not disable the [`ReactiveUserDetailsService`][r5] configuration).
To also switch off the [`ReactiveUserDetailsService`][r5] configuration, add a bean of type [`ReactiveUserDetailsService`][r5] or [`ReactiveAuthenticationManager`][r21].

The auto-configuration will also back off when any of the following Spring Security modules is on the classpath:

- `spring-security-oauth2-client`
- `spring-security-oauth2-resource-server`

To use [`ReactiveUserDetailsService`][r5] in addition to one or more of these dependencies, define your own [`MapReactiveUserDetailsService`][r22] bean.

Access rules and the use of multiple Spring Security components such as OAuth 2 Client and Resource Server can be configured by adding a custom [`SecurityWebFilterChain`][r23] bean.
Spring Boot provides convenience methods that can be used to override access rules for actuator endpoints and static resources.
[`EndpointRequest`][r24] can be used to create a [`ServerWebExchangeMatcher`][r25] that is based on the `management.endpoints.web.base-path` property.

[`PathRequest`][r26] can be used to create a [`ServerWebExchangeMatcher`][r25] for resources in commonly used locations.

For example, you can customize your security configuration by adding something like:

```java
import org.springframework.boot.security.autoconfigure.web.reactive.PathRequest;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.web.server.SecurityWebFilterChain;

import static org.springframework.security.config.Customizer.withDefaults;

@Configuration(proxyBeanMethods = false)
public class MyWebFluxSecurityConfiguration {

	@Bean
	public SecurityWebFilterChain springSecurityFilterChain(ServerHttpSecurity http) {
		http.authorizeExchange((exchange) -> {
			exchange.matchers(PathRequest.toStaticResources().atCommonLocations()).permitAll();
			exchange.pathMatchers("/foo", "/bar").authenticated();
		});
		http.formLogin(withDefaults());
		return http.build();
	}

}
```

## OAuth2

[OAuth2][r27] is a widely used authorization framework.
For details of how to configure and use OAuth2 with your web applications, see the [“OAuth2” section][r28] of under “Security”.

## SAML 2.0

[SAML v2.0][r29] is a widely adopted framework for exchanging security information between online business partners.
For details of how to configure and use SAML 2.0 with your web applications, see the [“SAML 2.0” section][r30] under “Security”.
