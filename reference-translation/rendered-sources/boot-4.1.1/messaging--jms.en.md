# JMS

The [`ConnectionFactory`][r1] interface provides a standard method of creating a [`Connection`][r2] for interacting with a JMS broker.
Although Spring needs a [`ConnectionFactory`][r1] to work with JMS, you generally need not use it directly yourself and can instead rely on higher level messaging abstractions.
(See the [relevant section][r3] of the Spring Framework reference documentation for details.)
Spring Boot also auto-configures the necessary infrastructure to send and receive messages.

## ActiveMQ "Classic" Support

When [ActiveMQ "Classic"][r4] is available on the classpath, Spring Boot can configure a [`ConnectionFactory`][r1].
If the broker is present, an embedded broker is automatically started and configured (provided no broker URL is specified through configuration and the embedded broker is not disabled in the configuration).

> [NOTE]
>
> If you use `spring-boot-starter-activemq`, the necessary dependencies to connect to an ActiveMQ "Classic" instance are provided, as is the Spring infrastructure to integrate with JMS.
> Adding `org.apache.activemq:activemq-broker` to your application lets you use the embedded broker.

ActiveMQ "Classic" configuration is controlled by external configuration properties in `spring.activemq.*`.

If `activemq-broker` is on the classpath, ActiveMQ "Classic" is auto-configured to use the [VM transport][r5], which starts a broker embedded in the same JVM instance.

You can disable the embedded broker by configuring the `spring.activemq.embedded.enabled` property, as shown in the following example:

```properties
spring.activemq.embedded.enabled=false
```

```yaml
spring:
  activemq:
    embedded:
      enabled: false
```

The embedded broker will also be disabled if you configure the broker URL, as shown in the following example:

```properties
spring.activemq.broker-url=tcp://192.168.1.210:9876
spring.activemq.user=admin
spring.activemq.password=secret
```

```yaml
spring:
  activemq:
    broker-url: "tcp://192.168.1.210:9876"
    user: "admin"
    password: "secret"
```

If you want to take full control over the embedded broker, see [the ActiveMQ "Classic" documentation][r6] for further information.

By default, a [`CachingConnectionFactory`][r7] wraps the native [`ConnectionFactory`][r1] with sensible settings that you can control by external configuration properties in `spring.jms.*`:

```properties
spring.jms.cache.session-cache-size=5
```

```yaml
spring:
  jms:
    cache:
      session-cache-size: 5
```

If you’d rather use native pooling, you can do so by adding a dependency to `org.messaginghub:pooled-jms` and configuring the [`JmsPoolConnectionFactory`][r8] accordingly, as shown in the following example:

```properties
spring.activemq.pool.enabled=true
spring.activemq.pool.max-connections=50
```

```yaml
spring:
  activemq:
    pool:
      enabled: true
      max-connections: 50
```

> [TIP]
>
> See [`ActiveMQProperties`][r9] for more of the supported options.
> You can also register an arbitrary number of beans that implement [`ActiveMQConnectionFactoryCustomizer`][r10] for more advanced customizations.

By default, ActiveMQ "Classic" creates a destination if it does not yet exist so that destinations are resolved against their provided names.

## ActiveMQ Artemis Support

Spring Boot can auto-configure a [`ConnectionFactory`][r1] when it detects that [ActiveMQ Artemis][r11] is available on the classpath.
If the broker is present, an embedded broker is automatically started and configured (unless the mode property has been explicitly set).
The supported modes are `embedded` (to make explicit that an embedded broker is required and that an error should occur if the broker is not available on the classpath) and `native` (to connect to a broker using the `netty` transport protocol).
When the latter is configured, Spring Boot configures a [`ConnectionFactory`][r1] that connects to a broker running on the local machine with the default settings.

> [NOTE]
>
> If you use `spring-boot-starter-artemis`, the necessary dependencies to connect to an existing ActiveMQ Artemis instance are provided, as well as the Spring infrastructure to integrate with JMS.
> Adding `org.apache.activemq:artemis-jakarta-server` to your application lets you use embedded mode.

ActiveMQ Artemis configuration is controlled by external configuration properties in `spring.artemis.*`.
For example, you might declare the following section in `application.properties`:

```properties
spring.artemis.mode=native
spring.artemis.broker-url=tcp://192.168.1.210:9876
spring.artemis.user=admin
spring.artemis.password=secret
```

```yaml
spring:
  artemis:
    mode: native
    broker-url: "tcp://192.168.1.210:9876"
    user: "admin"
    password: "secret"
```

When embedding the broker, you can choose if you want to enable persistence and list the destinations that should be made available.
These can be specified as a comma-separated list to create them with the default options, or you can define bean(s) of type [`JMSQueueConfiguration`][r12] or [`TopicConfiguration`][r13], for advanced queue and topic configurations, respectively.

By default, a [`CachingConnectionFactory`][r7] wraps the native [`ConnectionFactory`][r1] with sensible settings that you can control by external configuration properties in `spring.jms.*`:

```properties
spring.jms.cache.session-cache-size=5
```

```yaml
spring:
  jms:
    cache:
      session-cache-size: 5
```

If you’d rather use native pooling, you can do so by adding a dependency on `org.messaginghub:pooled-jms` and configuring the [`JmsPoolConnectionFactory`][r8] accordingly, as shown in the following example:

```properties
spring.artemis.pool.enabled=true
spring.artemis.pool.max-connections=50
```

```yaml
spring:
  artemis:
    pool:
      enabled: true
      max-connections: 50
```

See [`ArtemisProperties`][r14] for more supported options.

No JNDI lookup is involved, and destinations are resolved against their names, using either the `name` attribute in the ActiveMQ Artemis configuration or the names provided through configuration.

## Using a JNDI ConnectionFactory

If you are running your application in an application server, Spring Boot tries to locate a JMS [`ConnectionFactory`][r1] by using JNDI.
By default, the `java:/JmsXA` and `java:/XAConnectionFactory` location are checked.
You can use the `spring.jms.jndi-name` property if you need to specify an alternative location, as shown in the following example:

```properties
spring.jms.jndi-name=java:/MyConnectionFactory
```

```yaml
spring:
  jms:
    jndi-name: "java:/MyConnectionFactory"
```

## Sending a Message

Spring’s [`JmsClient`][r15] is auto-configured, and you can autowire it directly into your own beans, as shown in the following example:

```kotlin
import org.springframework.jms.core.JmsClient
import org.springframework.stereotype.Component

@Component
class MyBean(private val jmsClient: JmsClient) {

	// ...

	fun someMethod() {
		jmsClient.destination("myQueue").send("hello")
	}

}
```

```java
import org.springframework.jms.core.JmsClient;
import org.springframework.stereotype.Component;

@Component
public class MyBean {

	private final JmsClient jmsClient;

	public MyBean(JmsClient jmsClient) {
		this.jmsClient = jmsClient;
	}

	// ...

	public void someMethod() {
		this.jmsClient.destination("myQueue").send("hello");
	}

}
```

> [NOTE]
>
> [`JmsMessagingTemplate`][r16] can be injected in a similar manner, and both use the traditional [`JmsTemplate`][r17] that can be injected as well.
> If a [`DestinationResolver`][r18] or a [`MessageConverter`][r19] bean is defined, it is associated automatically to the auto-configured [`JmsTemplate`][r17].

## Receiving a Message

When the JMS infrastructure is present, any bean can be annotated with [`@JmsListener`][r20] to create a listener endpoint.
If no [`JmsListenerContainerFactory`][r21] has been defined, a default one is configured automatically.
If a [`DestinationResolver`][r18], a [`MessageConverter`][r19], or a [`ExceptionListener`][r22] beans are defined, they are associated automatically with the default factory.

In most scenarios, message listener containers should be configured against the native [`ConnectionFactory`][r1].
This way each listener container has its own connection and this gives full responsibility to it in terms of local recovery.
The auto-configuration uses [`ConnectionFactoryUnwrapper`][r23] to unwrap the native connection factory from the auto-configured one.

> [NOTE]
>
> The auto-configuration only unwraps `CachedConnectionFactory`.

By default, the default factory is transactional.
If you run in an infrastructure where a [`JtaTransactionManager`][r24] is present, it is associated to the listener container by default.
If not, the `sessionTransacted` flag is enabled.
In that latter scenario, you can associate your local data store transaction to the processing of an incoming message by adding [`@Transactional`][r25] on your listener method (or a delegate thereof).
This ensures that the incoming message is acknowledged, once the local transaction has completed.
This also includes sending response messages that have been performed on the same JMS session.

The following component creates a listener endpoint on the `someQueue` destination:

```kotlin
import org.springframework.jms.annotation.JmsListener
import org.springframework.stereotype.Component

@Component
class MyBean {

	@JmsListener(destination = "someQueue")
	fun processMessage(content: String?) {
		// ...
	}

}
```

```java
import org.springframework.jms.annotation.JmsListener;
import org.springframework.stereotype.Component;

@Component
public class MyBean {

	@JmsListener(destination = "someQueue")
	public void processMessage(String content) {
		// ...
	}

}
```

> [TIP]
>
> See the [`@EnableJms`][r26] API documentation for more details.

If you need to create more [`JmsListenerContainerFactory`][r21] instances or if you want to override the default, Spring Boot provides a [`DefaultJmsListenerContainerFactoryConfigurer`][r27] that you can use to initialize a [`DefaultJmsListenerContainerFactory`][r28] with the same settings as the one that is auto-configured.

For instance, the following example exposes another factory that uses a specific [`MessageConverter`][r19]:

```kotlin
import jakarta.jms.ConnectionFactory
import org.springframework.boot.jms.ConnectionFactoryUnwrapper
import org.springframework.boot.jms.autoconfigure.DefaultJmsListenerContainerFactoryConfigurer
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.jms.config.DefaultJmsListenerContainerFactory

@Configuration(proxyBeanMethods = false)
class MyJmsConfiguration {

	@Bean
	fun myFactory(configurer: DefaultJmsListenerContainerFactoryConfigurer,
				  connectionFactory: ConnectionFactory): DefaultJmsListenerContainerFactory {
		val factory = DefaultJmsListenerContainerFactory()
		configurer.configure(factory, ConnectionFactoryUnwrapper.unwrapCaching(connectionFactory))
		factory.setMessageConverter(MyMessageConverter())
		return factory
	}

}
```

```java
import jakarta.jms.ConnectionFactory;

import org.springframework.boot.jms.ConnectionFactoryUnwrapper;
import org.springframework.boot.jms.autoconfigure.DefaultJmsListenerContainerFactoryConfigurer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jms.config.DefaultJmsListenerContainerFactory;

@Configuration(proxyBeanMethods = false)
public class MyJmsConfiguration {

	@Bean
	public DefaultJmsListenerContainerFactory myFactory(DefaultJmsListenerContainerFactoryConfigurer configurer,
			ConnectionFactory connectionFactory) {
		DefaultJmsListenerContainerFactory factory = new DefaultJmsListenerContainerFactory();
		configurer.configure(factory, ConnectionFactoryUnwrapper.unwrapCaching(connectionFactory));
		factory.setMessageConverter(new MyMessageConverter());
		return factory;
	}

}
```

> [NOTE]
>
> In the example above, the customization uses [`ConnectionFactoryUnwrapper`][r23] to associate the native connection factory to the message listener container the same way the auto-configured factory does.

Then you can use the factory in any [`@JmsListener`][r20]-annotated method as follows:

```kotlin
import org.springframework.jms.annotation.JmsListener
import org.springframework.stereotype.Component

@Component
class MyBean {

	@JmsListener(destination = "someQueue", containerFactory = "myFactory")
	fun processMessage(content: String?) {
		// ...
	}

}
```

```java
import org.springframework.jms.annotation.JmsListener;
import org.springframework.stereotype.Component;

@Component
public class MyBean {

	@JmsListener(destination = "someQueue", containerFactory = "myFactory")
	public void processMessage(String content) {
		// ...
	}

}
```

Analogous to `DefaultJmsListenerContainerFactoryConfigurer`, Spring Boot also provides a [`SimpleJmsListenerContainerFactoryConfigurer`][r29] that you can use to initialize a [`SimpleJmsListenerContainerFactory`][r30] and apply the related settings that auto-configuration provides.

> [TIP]
>
> In contrast to [`DefaultMessageListenerContainer`][r31] that uses a pull-based mechanism (polling) to process messages, [`SimpleMessageListenerContainer`][r32] uses a push-based mechanism that’s very close to the spirit of the standalone JMS specification.
> To learn more about the differences between the two listener containers, consult their respective javadocs and [Spring Framework reference documentation][r33].
