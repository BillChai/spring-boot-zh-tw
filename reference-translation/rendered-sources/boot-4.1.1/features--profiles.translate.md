# Profiles

Spring Profiles provide a way to segregate parts of your application configuration and make it be available only in certain environments.
Any [`@Component`][r1], [`@Configuration`][r2] or [`@ConfigurationProperties`][r3] can be marked with [`@Profile`][r4] to limit when it is loaded, as shown in the following example:

{{CODE_0}}

{{CODE_1}}

> [NOTE]
>
> If [`@ConfigurationProperties`][r3] beans are registered through [`@EnableConfigurationProperties`][r5] instead of automatic scanning, the [`@Profile`][r4] annotation needs to be specified on the [`@Configuration`][r2] class that has the [`@EnableConfigurationProperties`][r5] annotation.
> In the case where [`@ConfigurationProperties`][r3] are scanned, [`@Profile`][r4] can be specified on the [`@ConfigurationProperties`][r3] class itself.

You can use a `spring.profiles.active` [`Environment`][r6] property to specify which profiles are active.
You can specify the property in any of the ways described earlier in this chapter.
For example, you could include it in your `application.properties`, as shown in the following example:

{{CODE_2}}

{{CODE_3}}

You could also specify it on the command line by using the following switch: `--spring.profiles.active=dev,hsqldb`.

If no profile is active, a default profile is enabled.
The name of the default profile is `default` and it can be tuned using the `spring.profiles.default` [`Environment`][r6] property, as shown in the following example:

{{CODE_4}}

{{CODE_5}}

`spring.profiles.active` and `spring.profiles.default` can only be used in non-profile-specific documents.
This means they cannot be included in [profile specific files][r7] or [documents activated][r8] by `spring.config.activate.on-profile`.

For example, the second document configuration is invalid:

{{CODE_6}}

{{CODE_7}}

The `spring.profiles.active` property follows the same ordering rules as other properties.
The highest [`PropertySource`][r9] wins.
This means that you can specify active profiles in `application.properties` and then **replace** them by using the command line switch.

> [TIP]
>
> See [the “Externalized Configuration”][r10] for more details on the order in which property sources are considered.

> [NOTE]
>
> By default, profile names in Spring Boot may contain letters, numbers, or permitted characters (`-`, `_`, `.`, `+`, `@`).
> In addition, they can only start and end with a letter or number.
>
> This restriction helps to prevent common parsing issues.
> if, however, you prefer more flexible profile names you can set `spring.profiles.validate` to `false` in your `application.properties` or `application.yaml` file:
>
{{CODE_8}}
>
{{CODE_9}}

## Adding Active Profiles

Sometimes, it is useful to have properties that **add** to the active profiles rather than replace them.
The `spring.profiles.include` property can be used to add active profiles on top of those activated by the `spring.profiles.active` property.
The [`SpringApplication`][r11] entry point also has a Java API for setting additional profiles.
See the `setAdditionalProfiles()` method in [`SpringApplication`][r11].

For example, when an application with the following properties is run, the common and local profiles will be activated even when it runs using the `--spring.profiles.active` switch:

{{CODE_10}}

{{CODE_11}}

> [NOTE]
>
> Included profiles are added before any `spring.profiles.active` profiles.

> [TIP]
>
> The `spring.profiles.include` property is processed for each property source, as such the usual [complex type merging rules][r12] for lists do not apply.

> [WARNING]
>
> Similar to `spring.profiles.active`, `spring.profiles.include` can only be used in non-profile-specific documents.
> This means it cannot be included in [profile specific files][r7] or [documents activated][r8] by `spring.config.activate.on-profile`.

Profile groups, which are described in the [next section][r13] can also be used to add active profiles if a given profile is active.

## Profile Groups

Occasionally the profiles that you define and use in your application are too fine-grained and become cumbersome to use.
For example, you might have `proddb` and `prodmq` profiles that you use to enable database and messaging features independently.

To help with this, Spring Boot lets you define profile groups.
A profile group allows you to define a logical name for a related group of profiles.

For example, we can create a `production` group that consists of our `proddb` and `prodmq` profiles.

{{CODE_12}}

{{CODE_13}}

Our application can now be started using `--spring.profiles.active=production` to activate the `production`, `proddb` and `prodmq` profiles in one hit.

> [WARNING]
>
> Similar to `spring.profiles.active` and `spring.profiles.include`, `spring.profiles.group` can only be used in non-profile-specific documents.
> This means it cannot be included in [profile specific files][r7] or [documents activated][r8] by `spring.config.activate.on-profile`.

## Programmatically Setting Profiles

You can programmatically set active profiles by calling `SpringApplication.setAdditionalProfiles(…​)` before your application runs.
It is also possible to activate profiles by using Spring’s [`ConfigurableEnvironment`][r14] interface.

## Profile-specific Configuration Files

Profile-specific variants of both `application.properties` (or `application.yaml`) and files referenced through [`@ConfigurationProperties`][r3] are considered as files and loaded.
See [Profile Specific Files][r7] for details.
