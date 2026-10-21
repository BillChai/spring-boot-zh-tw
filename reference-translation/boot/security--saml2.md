# SAML 2.0

<!-- source-attribution -->
> **非官方繁體中文翻譯** · Spring Boot 4.1.1 · 翻譯日期：2026-10-21  
> [官方英文網站](https://docs.spring.io/spring-boot/4.1/reference/security/saml2.html) · [固定版本英文來源](https://github.com/spring-projects/spring-boot/blob/v4.1.1/documentation/spring-boot-docs/src/docs/antora/modules/reference/pages/security/saml2.adoc) · [本地原文快照](../sources/spring-boot/documentation/spring-boot-docs/src/docs/antora/modules/reference/pages/security/saml2.adoc)  
> 原始作者與授權見 [來源聲明](../NOTICE.md)。官方範例及設定鍵保留原文，額外圖解另標示為譯者補充。

<!-- translation-status: translated -->

[SAML v2.0][security--saml2-r1] 是廣泛採用的框架，用來在線上業務夥伴之間交換安全資訊。

## 建置設定

SAML 2.0 支援建立在 OpenSAML 函式庫之上，因此[需要額外設定套件儲存庫][security--saml2-r2]。

### 使用 Maven

使用 Maven 時，必須在 POM 增加一個 `repository` 元素：

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

### 使用 Gradle

使用 Gradle 時，應在建置腳本增加儲存庫設定：

```gradle
repositories {
    maven { url "https://build.shibboleth.net/maven/releases" }
}
```

## Relying Party

當 classpath 中有 `spring-security-saml2-service-provider`，即可透過自動設定建立 SAML 2.0 Relying Party。設定使用 [`Saml2RelyingPartyProperties`][security--saml2-r3] 中的屬性。

Relying party registration 表示 Identity Provider（IDP）與 Service Provider（SP）之間的一組配對設定。可以在 `spring.security.saml2.relyingparty` 前綴下註冊多個 relying party：

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

對 SAML2 登出而言，Spring Security 的 [`Saml2LogoutRequestFilter`][security--saml2-r4] 與 [`Saml2LogoutResponseFilter`][security--saml2-r5]，預設只處理符合 `/logout/saml2/slo` 的 URL。

如果要將 AP 主動發起的登出請求所送往的 `url`，或 AP 傳送登出回應的 `response-url`，改成不同模式，也必須提供能處理此模式的設定。例如，Servlet 應用程式可以加入類似以下的 [`SecurityFilterChain`][security--saml2-r6]：

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

> **譯者註：**此處 AP 是原文使用的縮寫，指 asserting party；閱讀時可對照提供身分斷言的對端角色。

[security--saml2-r1]: https://docs.oasis-open.org/security/saml/Post2.0/sstc-saml-tech-overview-2.0.html
[security--saml2-r2]: https://shibboleth.atlassian.net/wiki/spaces/DEV/pages/1123844333/Use+of+Maven+Central#Publishing-to-Maven-Central
[security--saml2-r3]: https://docs.spring.io/spring-boot/4.1.1/api/java/org/springframework/boot/security/saml2/autoconfigure/Saml2RelyingPartyProperties.html
[security--saml2-r4]: https://docs.spring.io/spring-security/reference/7.1/api/java/org/springframework/security/saml2/provider/service/web/authentication/logout/Saml2LogoutRequestFilter.html
[security--saml2-r5]: https://docs.spring.io/spring-security/reference/7.1/api/java/org/springframework/security/saml2/provider/service/web/authentication/logout/Saml2LogoutResponseFilter.html
[security--saml2-r6]: https://docs.spring.io/spring-security/reference/7.1/api/java/org/springframework/security/web/SecurityFilterChain.html
