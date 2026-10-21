# Hazelcast

If [Hazelcast][r1] is on the classpath and a suitable configuration is found, Spring Boot auto-configures a [`HazelcastInstance`][r2] that you can inject in your application.

Spring Boot first attempts to create a client by checking the following configuration options:

- The presence of a [`ClientConfig`][r3] bean.
- A configuration file defined by the `spring.hazelcast.config` property.
- The presence of the `hazelcast.client.config` system property.
- A `hazelcast-client.xml` in the working directory or at the root of the classpath.
- A `hazelcast-client.yaml` (or `hazelcast-client.yml`) in the working directory or at the root of the classpath.

If a client can not be created, Spring Boot attempts to configure an embedded server.
If you define a [`Config`][r4] bean, Spring Boot uses it at is.
If your configuration defines an instance name, Spring Boot tries to locate an existing instance rather than creating a new one.

You could also specify the Hazelcast configuration file to use through configuration, as shown in the following example:

{{CODE_0}}

{{CODE_1}}

Otherwise, Spring Boot tries to find the Hazelcast configuration from the default locations: `hazelcast.xml` in the working directory or at the root of the classpath, or a YAML counterpart in the same locations.
We also check if the `hazelcast.config` system property is set.
See the [Hazelcast documentation][r5] for more details.

> [TIP]
>
> By default, [`@SpringAware`][r6] on Hazelcast components is supported.
> The [`ManagedContext`][r7] can be overridden by declaring a [`HazelcastConfigCustomizer`][r8] bean with an [`@Order`][r9] higher than zero.

> [NOTE]
>
> Spring Boot also has [explicit caching support for Hazelcast][r10].
> If caching is enabled, the [`HazelcastInstance`][r2] is automatically wrapped in a [`CacheManager`][r11] implementation.
