# 傳送電子郵件

Spring Framework 透過 [`JavaMailSender`][r1] 介面提供傳送電子郵件的抽象；Spring Boot 則為它提供自動設定與 starter 模組。

> [TIP]
>
> 如何使用 [`JavaMailSender`][r1] 的詳細說明，請參閱[參考文件][r2]。

若已提供 `spring.mail.host` 與相關程式庫（由 `spring-boot-starter-mail` 定義），而且尚無 [`JavaMailSender`][r1]，就會建立預設實例。
你可以透過 `spring.mail` 命名空間下的設定項目，進一步自訂傳送器。
詳情請參閱 [`MailProperties`][r3]。

特別是，某些預設逾時值為無限，你可能需要修改它們，以免郵件伺服器沒有回應時阻塞執行緒，如下例所示：

{{CODE_0}}

{{CODE_1}}

也可以使用 JNDI 中既有的 [`Session`][r4] 設定 [`JavaMailSender`][r1]：

{{CODE_2}}

{{CODE_3}}

設定 `jndi-name` 時，它的優先順序高於所有其他與 Session 有關的設定。
