# 傳送電子郵件

<!-- source-attribution -->
> **非官方繁體中文翻譯** · Spring Boot 4.1.1 · 翻譯日期：2026-10-21  
> [官方英文網站](https://docs.spring.io/spring-boot/4.1/reference/io/email.html) · [固定版本英文來源](https://github.com/spring-projects/spring-boot/blob/v4.1.1/documentation/spring-boot-docs/src/docs/antora/modules/reference/pages/io/email.adoc) · [本地原文快照](../sources/spring-boot/documentation/spring-boot-docs/src/docs/antora/modules/reference/pages/io/email.adoc)  
> 原始作者與授權見 [來源聲明](../NOTICE.md)。官方範例及設定鍵保留原文，額外圖解另標示為譯者補充。

<!-- translation-status: translated -->

Spring Framework 透過 [`JavaMailSender`][io--email-r1] 介面提供傳送電子郵件的抽象；Spring Boot 則為它提供自動設定與 starter 模組。

> **提示：**
>
> 如何使用 [`JavaMailSender`][io--email-r1] 的詳細說明，請參閱[參考文件][io--email-r2]。

若已提供 `spring.mail.host` 與相關程式庫（由 `spring-boot-starter-mail` 定義），而且尚無 [`JavaMailSender`][io--email-r1]，就會建立預設實例。
你可以透過 `spring.mail` 命名空間下的設定項目，進一步自訂傳送器。
詳情請參閱 [`MailProperties`][io--email-r3]。

特別是，某些預設逾時值為無限，你可能需要修改它們，以免郵件伺服器沒有回應時阻塞執行緒，如下例所示：

```properties
spring.mail.properties[mail.smtp.connectiontimeout]=5000
spring.mail.properties[mail.smtp.timeout]=3000
spring.mail.properties[mail.smtp.writetimeout]=5000
```

```yaml
spring:
  mail:
    properties:
      "[mail.smtp.connectiontimeout]": 5000
      "[mail.smtp.timeout]": 3000
      "[mail.smtp.writetimeout]": 5000
```

也可以使用 JNDI 中既有的 [`Session`][io--email-r4] 設定 [`JavaMailSender`][io--email-r1]：

```properties
spring.mail.jndi-name=mail/Session
```

```yaml
spring:
  mail:
    jndi-name: "mail/Session"
```

設定 `jndi-name` 時，它的優先順序高於所有其他與 Session 有關的設定。

[io--email-r1]: https://docs.spring.io/spring-framework/docs/7.0.x/javadoc-api/org/springframework/mail/javamail/JavaMailSender.html
[io--email-r2]: https://docs.spring.io/spring-framework/reference/7.0/integration/email.html
[io--email-r3]: https://docs.spring.io/spring-boot/4.1.1/api/java/org/springframework/boot/mail/autoconfigure/MailProperties.html
[io--email-r4]: https://jakarta.ee/specifications/mail/2.1/apidocs/jakarta/mail/Session.html
