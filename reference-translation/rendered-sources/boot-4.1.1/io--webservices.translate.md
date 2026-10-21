# Web Services

Spring Boot provides Web Services auto-configuration so that all you must do is define your [`@Endpoint`][r1] beans.

The [Spring Web Services features][r2] can be easily accessed with the `spring-boot-starter-webservices` module.

[`SimpleWsdl11Definition`][r3] and [`SimpleXsdSchema`][r4] beans can be automatically created for your WSDLs and XSDs respectively.
To do so, configure their location, as shown in the following example:

{{CODE_0}}

{{CODE_1}}

## Calling Web Services with WebServiceTemplate

If you need to call remote Web services from your application, you can use the [`WebServiceTemplate`][r5] class.
Since [`WebServiceTemplate`][r6] instances often need to be customized before being used, Spring Boot does not provide any single auto-configured [`WebServiceTemplate`][r6] bean.
It does, however, auto-configure a [`WebServiceTemplateBuilder`][r7], which can be used to create [`WebServiceTemplate`][r6] instances when needed.

The following code shows a typical example:

{{CODE_2}}

{{CODE_3}}

By default, [`WebServiceTemplateBuilder`][r7] detects a suitable HTTP-based [`WebServiceMessageSender`][r8] using the available HTTP client libraries on the classpath.
You can also customize read and connection timeouts for an individual builder as follows:

{{CODE_4}}

{{CODE_5}}

> [TIP]
>
> You can also change the [global HTTP client configuration][r9] used if not specific template customization code is applied.
