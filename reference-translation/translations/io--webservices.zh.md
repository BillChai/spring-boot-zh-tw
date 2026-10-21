# Web Services

Spring Boot 提供 Web Services 自動設定，因此你只需要定義 [`@Endpoint`][r1] Bean。

透過 `spring-boot-starter-webservices` 模組，就能輕鬆使用 [Spring Web Services 功能][r2]。

可以分別為 WSDL 與 XSD 自動建立 [`SimpleWsdl11Definition`][r3] 和 [`SimpleXsdSchema`][r4] Bean。
若要這麼做，請設定其位置，如下例所示：

{{CODE_0}}

{{CODE_1}}

## 使用 WebServiceTemplate 呼叫 Web Services

如果需要從應用程式呼叫遠端 Web 服務，可以使用 [`WebServiceTemplate`][r5] 類別。
由於 [`WebServiceTemplate`][r6] 實例通常需要先自訂再使用，Spring Boot 不會提供單一、自動設定的 [`WebServiceTemplate`][r6] Bean。
不過，它會自動設定 [`WebServiceTemplateBuilder`][r7]，供你在需要時建立 [`WebServiceTemplate`][r6] 實例。

下列程式碼展示典型範例：

{{CODE_2}}

{{CODE_3}}

預設情況下，[`WebServiceTemplateBuilder`][r7] 會依據 classpath 上可用的 HTTP 用戶端程式庫，偵測合適、以 HTTP 為基礎的 [`WebServiceMessageSender`][r8]。
你也可以為個別建構器自訂讀取與連線逾時，如下所示：

{{CODE_4}}

{{CODE_5}}

> [TIP]
>
> 你也可以調整[全域 HTTP 用戶端設定][r9]；當未套用範本專用的自訂程式碼時，就會使用這些設定。
