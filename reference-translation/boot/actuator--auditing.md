# 稽核

<!-- source-attribution -->
> **非官方繁體中文翻譯** · Spring Boot 4.1.1 · 翻譯日期：2026-10-21  
> [官方英文網站](https://docs.spring.io/spring-boot/4.1/reference/actuator/auditing.html) · [固定版本英文來源](https://github.com/spring-projects/spring-boot/blob/v4.1.1/documentation/spring-boot-docs/src/docs/antora/modules/reference/pages/actuator/auditing.adoc) · [本地原文快照](../sources/spring-boot/documentation/spring-boot-docs/src/docs/antora/modules/reference/pages/actuator/auditing.adoc)  
> 原始作者與授權見 [來源聲明](../NOTICE.md)。官方範例及設定鍵保留原文，額外圖解另標示為譯者補充。

<!-- translation-status: translated -->

當 Spring Security 啟用後，Spring Boot Actuator 提供彈性的稽核框架，可發布事件；預設事件包括「身分驗證成功」、「失敗」與「拒絕存取」例外。
此功能對報表，以及實作依身分驗證失敗情況鎖定帳號的策略，非常實用。

在應用程式設定中提供 [`AuditEventRepository`][actuator--auditing-r1] 型別的 Bean，即可啟用稽核。
為方便使用，Spring Boot 提供 [`InMemoryAuditEventRepository`][actuator--auditing-r2]。
[`InMemoryAuditEventRepository`][actuator--auditing-r2] 能力有限，建議只用於開發環境。
正式環境應考慮建立自己的 [`AuditEventRepository`][actuator--auditing-r1] 替代實作。

## 自訂稽核

若要自訂發布的安全性事件，可以提供自己的 [`AbstractAuthenticationAuditListener`][actuator--auditing-r3] 與 [`AbstractAuthorizationAuditListener`][actuator--auditing-r4] 實作。

你也能將稽核服務用於自己的業務事件。
做法是將 [`AuditEventRepository`][actuator--auditing-r1] Bean 注入自己的元件並直接使用，或透過 Spring [`ApplicationEventPublisher`][actuator--auditing-r6] 發布 [`AuditApplicationEvent`][actuator--auditing-r5]；可藉由實作 [`ApplicationEventPublisherAware`][actuator--auditing-r7] 取得發布器。

[actuator--auditing-r1]: https://docs.spring.io/spring-boot/4.1.1/api/java/org/springframework/boot/actuate/audit/AuditEventRepository.html
[actuator--auditing-r2]: https://docs.spring.io/spring-boot/4.1.1/api/java/org/springframework/boot/actuate/audit/InMemoryAuditEventRepository.html
[actuator--auditing-r3]: https://docs.spring.io/spring-boot/4.1.1/api/java/org/springframework/boot/actuate/security/AbstractAuthenticationAuditListener.html
[actuator--auditing-r4]: https://docs.spring.io/spring-boot/4.1.1/api/java/org/springframework/boot/actuate/security/AbstractAuthorizationAuditListener.html
[actuator--auditing-r5]: https://docs.spring.io/spring-boot/4.1.1/api/java/org/springframework/boot/actuate/audit/listener/AuditApplicationEvent.html
[actuator--auditing-r6]: https://docs.spring.io/spring-framework/docs/7.0.x/javadoc-api/org/springframework/context/ApplicationEventPublisher.html
[actuator--auditing-r7]: https://docs.spring.io/spring-framework/docs/7.0.x/javadoc-api/org/springframework/context/ApplicationEventPublisherAware.html
