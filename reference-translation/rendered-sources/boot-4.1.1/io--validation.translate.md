# Validation

The method validation feature supported by Bean Validation 1.1 is automatically enabled as long as a JSR-303 implementation (such as Hibernate Validator, typically provided by `spring-boot-starter-validation`) is on the classpath.
This lets bean methods be annotated with `jakarta.validation` constraints on their parameters and/or on their return value.
Target classes with such annotated methods need to be annotated with the [`@Validated`][r1] annotation at the type level for their methods to be searched for inline constraint annotations.

For instance, the following service triggers the validation of the first argument, making sure its size is between 8 and 10:

{{CODE_0}}

{{CODE_1}}

The application’s [`MessageSource`][r2] is used when resolving `{parameters}` in constraint messages.
This allows you to use [your application’s `messages.properties` files][r3] for Bean Validation messages.
Once the parameters have been resolved, message interpolation is completed using Bean Validation’s default interpolator.

To customize the [`Configuration`][r4] used to build the [`ValidatorFactory`][r5], define a [`ValidationConfigurationCustomizer`][r6] bean.
When multiple customizer beans are defined, they are called in order based on their [`@Order`][r7] annotation or [`Ordered`][r8] implementation.
