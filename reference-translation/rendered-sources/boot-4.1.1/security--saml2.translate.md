# SAML 2.0

[SAML v2.0][r1] is a widely adopted framework for exchanging security information between online business partners.

## Build Configuration

SAML 2.0 support builds off of the OpenSAML library that [requires an extra repository][r2] configuration.

### Using Maven

With Maven, you need to add an extra `repository` element to your POM as follows:

{{CODE_0}}

### Using Gradle

With Gradle, a repository element should be added to your build script:

{{CODE_1}}

## Relying Party

If you have `spring-security-saml2-service-provider` on your classpath, you can take advantage of some auto-configuration to set up a SAML 2.0 Relying Party.
This configuration makes use of the properties under [`Saml2RelyingPartyProperties`][r3].

A relying party registration represents a paired configuration between an Identity Provider, IDP, and a Service Provider, SP.
You can register multiple relying parties under the `spring.security.saml2.relyingparty` prefix, as shown in the following example:

{{CODE_2}}

{{CODE_3}}

For SAML2 logout, by default, Spring Security’s [`Saml2LogoutRequestFilter`][r4] and [`Saml2LogoutResponseFilter`][r5] only process URLs matching `/logout/saml2/slo`.
If you want to customize the `url` to which AP-initiated logout requests get sent to or the `response-url` to which an AP sends logout responses to, to use a different pattern, you need to provide configuration to process that custom pattern.
For example, for servlet applications, you can add your own [`SecurityFilterChain`][r6] that resembles the following:

{{CODE_4}}
