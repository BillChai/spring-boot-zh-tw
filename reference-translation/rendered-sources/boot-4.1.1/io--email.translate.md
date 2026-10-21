# Sending Email

The Spring Framework provides an abstraction for sending email by using the [`JavaMailSender`][r1] interface, and Spring Boot provides auto-configuration for it as well as a starter module.

> [TIP]
>
> See the [reference documentation][r2] for a detailed explanation of how you can use [`JavaMailSender`][r1].

If `spring.mail.host` and the relevant libraries (as defined by `spring-boot-starter-mail`) are available, a default [`JavaMailSender`][r1] is created if none exists.
The sender can be further customized by configuration items from the `spring.mail` namespace.
See [`MailProperties`][r3] for more details.

In particular, certain default timeout values are infinite, and you may want to change that to avoid having a thread blocked by an unresponsive mail server, as shown in the following example:

{{CODE_0}}

{{CODE_1}}

It is also possible to configure a [`JavaMailSender`][r1] with an existing [`Session`][r4] from JNDI:

{{CODE_2}}

{{CODE_3}}

When a `jndi-name` is set, it takes precedence over all other Session-related settings.
