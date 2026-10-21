# SAML 2.0

[SAML v2.0][r1] is a widely adopted framework for exchanging security information between online business partners.

## Build Configuration

SAML 2.0 support builds off of the OpenSAML library that [requires an extra repository][r2] configuration.

### Using Maven

With Maven, you need to add an extra `repository` element to your POM as follows:

```xml
<repositories>
	<repository>
		<id>shibboleth-releases</id>
		<name>Shibboleth Releases Repository</name>
		<url>https://build.shibboleth.net/maven/releases</url>
		<snapshots>
			<enabled>false</enabled>
		</snapshots>
	</repository>
</repositories>
```

### Using Gradle

With Gradle, a repository element should be added to your build script:

```gradle
repositories {
    maven { url "https://build.shibboleth.net/maven/releases" }
}
```

## Relying Party

If you have `spring-security-saml2-service-provider` on your classpath, you can take advantage of some auto-configuration to set up a SAML 2.0 Relying Party.
This configuration makes use of the properties under [`Saml2RelyingPartyProperties`][r3].

A relying party registration represents a paired configuration between an Identity Provider, IDP, and a Service Provider, SP.
You can register multiple relying parties under the `spring.security.saml2.relyingparty` prefix, as shown in the following example:

```properties
spring.security.saml2.relyingparty.registration.my-relying-party1.signing.credentials[0].private-key-location=path-to-private-key
spring.security.saml2.relyingparty.registration.my-relying-party1.signing.credentials[0].certificate-location=path-to-certificate
spring.security.saml2.relyingparty.registration.my-relying-party1.decryption.credentials[0].private-key-location=path-to-private-key
spring.security.saml2.relyingparty.registration.my-relying-party1.decryption.credentials[0].certificate-location=path-to-certificate
spring.security.saml2.relyingparty.registration.my-relying-party1.singlelogout.url=https://myapp/logout/saml2/slo
spring.security.saml2.relyingparty.registration.my-relying-party1.singlelogout.response-url=https://remoteidp2.slo.url
spring.security.saml2.relyingparty.registration.my-relying-party1.singlelogout.binding=POST
spring.security.saml2.relyingparty.registration.my-relying-party1.assertingparty.verification.credentials[0].certificate-location=path-to-verification-cert
spring.security.saml2.relyingparty.registration.my-relying-party1.assertingparty.entity-id=remote-idp-entity-id1
spring.security.saml2.relyingparty.registration.my-relying-party1.assertingparty.sso-url=https://remoteidp1.sso.url
spring.security.saml2.relyingparty.registration.my-relying-party2.signing.credentials[0].private-key-location=path-to-private-key
spring.security.saml2.relyingparty.registration.my-relying-party2.signing.credentials[0].certificate-location=path-to-certificate
spring.security.saml2.relyingparty.registration.my-relying-party2.decryption.credentials[0].private-key-location=path-to-private-key
spring.security.saml2.relyingparty.registration.my-relying-party2.decryption.credentials[0].certificate-location=path-to-certificate
spring.security.saml2.relyingparty.registration.my-relying-party2.assertingparty.verification.credentials[0].certificate-location=path-to-other-verification-cert
spring.security.saml2.relyingparty.registration.my-relying-party2.assertingparty.entity-id=remote-idp-entity-id2
spring.security.saml2.relyingparty.registration.my-relying-party2.assertingparty.sso-url=https://remoteidp2.sso.url
spring.security.saml2.relyingparty.registration.my-relying-party2.assertingparty.singlelogout.url=https://remoteidp2.slo.url
spring.security.saml2.relyingparty.registration.my-relying-party2.assertingparty.singlelogout.response-url=https://myapp/logout/saml2/slo
spring.security.saml2.relyingparty.registration.my-relying-party2.assertingparty.singlelogout.binding=POST
```

```yaml
spring:
  security:
    saml2:
      relyingparty:
        registration:
          my-relying-party1:
            signing:
              credentials:
              - private-key-location: "path-to-private-key"
                certificate-location: "path-to-certificate"
            decryption:
              credentials:
              - private-key-location: "path-to-private-key"
                certificate-location: "path-to-certificate"
            singlelogout:
               url: "https://myapp/logout/saml2/slo"
               response-url: "https://remoteidp2.slo.url"
               binding: "POST"
            assertingparty:
              verification:
                credentials:
                - certificate-location: "path-to-verification-cert"
              entity-id: "remote-idp-entity-id1"
              sso-url: "https://remoteidp1.sso.url"

          my-relying-party2:
            signing:
              credentials:
              - private-key-location: "path-to-private-key"
                certificate-location: "path-to-certificate"
            decryption:
              credentials:
              - private-key-location: "path-to-private-key"
                certificate-location: "path-to-certificate"
            assertingparty:
              verification:
                credentials:
                - certificate-location: "path-to-other-verification-cert"
              entity-id: "remote-idp-entity-id2"
              sso-url: "https://remoteidp2.sso.url"
              singlelogout:
                url: "https://remoteidp2.slo.url"
                response-url: "https://myapp/logout/saml2/slo"
                binding: "POST"
```

For SAML2 logout, by default, Spring Security’s [`Saml2LogoutRequestFilter`][r4] and [`Saml2LogoutResponseFilter`][r5] only process URLs matching `/logout/saml2/slo`.
If you want to customize the `url` to which AP-initiated logout requests get sent to or the `response-url` to which an AP sends logout responses to, to use a different pattern, you need to provide configuration to process that custom pattern.
For example, for servlet applications, you can add your own [`SecurityFilterChain`][r6] that resembles the following:

```java
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;

import static org.springframework.security.config.Customizer.withDefaults;

@Configuration(proxyBeanMethods = false)
public class MySamlRelyingPartyConfiguration {

	@Bean
	public SecurityFilterChain securityFilterChain(HttpSecurity http) {
		http.authorizeHttpRequests((requests) -> requests.anyRequest().authenticated());
		http.saml2Login(withDefaults());
		http.saml2Logout((saml2) -> {
			saml2.logoutRequest((request) -> request.logoutUrl("/SLOService.saml2"));
			saml2.logoutResponse((response) -> response.logoutUrl("/SLOService.saml2"));
		});
		return http.build();
	}

}
```
