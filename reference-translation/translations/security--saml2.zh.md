# SAML 2.0

[SAML v2.0][r1] 是廣泛採用的框架，用來在線上業務夥伴之間交換安全資訊。

## 建置設定

SAML 2.0 支援建立在 OpenSAML 函式庫之上，因此[需要額外設定套件儲存庫][r2]。

### 使用 Maven

使用 Maven 時，必須在 POM 增加一個 `repository` 元素：

{{CODE_0}}

### 使用 Gradle

使用 Gradle 時，應在建置腳本增加儲存庫設定：

{{CODE_1}}

## Relying Party

當 classpath 中有 `spring-security-saml2-service-provider`，即可透過自動設定建立 SAML 2.0 Relying Party。設定使用 [`Saml2RelyingPartyProperties`][r3] 中的屬性。

Relying party registration 表示 Identity Provider（IDP）與 Service Provider（SP）之間的一組配對設定。可以在 `spring.security.saml2.relyingparty` 前綴下註冊多個 relying party：

{{CODE_2}}

{{CODE_3}}

對 SAML2 登出而言，Spring Security 的 [`Saml2LogoutRequestFilter`][r4] 與 [`Saml2LogoutResponseFilter`][r5]，預設只處理符合 `/logout/saml2/slo` 的 URL。

如果要將 AP 主動發起的登出請求所送往的 `url`，或 AP 傳送登出回應的 `response-url`，改成不同模式，也必須提供能處理此模式的設定。例如，Servlet 應用程式可以加入類似以下的 [`SecurityFilterChain`][r6]：

{{CODE_4}}

> **譯者註：**此處 AP 是原文使用的縮寫，指 asserting party；閱讀時可對照提供身分斷言的對端角色。
