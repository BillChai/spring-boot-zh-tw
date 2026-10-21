# 稽核

當 Spring Security 啟用後，Spring Boot Actuator 提供彈性的稽核框架，可發布事件；預設事件包括「身分驗證成功」、「失敗」與「拒絕存取」例外。
此功能對報表，以及實作依身分驗證失敗情況鎖定帳號的策略，非常實用。

在應用程式設定中提供 [`AuditEventRepository`][r1] 型別的 Bean，即可啟用稽核。
為方便使用，Spring Boot 提供 [`InMemoryAuditEventRepository`][r2]。
[`InMemoryAuditEventRepository`][r2] 能力有限，建議只用於開發環境。
正式環境應考慮建立自己的 [`AuditEventRepository`][r1] 替代實作。

## 自訂稽核

若要自訂發布的安全性事件，可以提供自己的 [`AbstractAuthenticationAuditListener`][r3] 與 [`AbstractAuthorizationAuditListener`][r4] 實作。

你也能將稽核服務用於自己的業務事件。
做法是將 [`AuditEventRepository`][r1] Bean 注入自己的元件並直接使用，或透過 Spring [`ApplicationEventPublisher`][r6] 發布 [`AuditApplicationEvent`][r5]；可藉由實作 [`ApplicationEventPublisherAware`][r7] 取得發布器。
