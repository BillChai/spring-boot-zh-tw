# Distributed Transactions With JTA

Spring Boot supports distributed JTA transactions across multiple XA resources by using a transaction manager retrieved from JNDI.

When a JTA environment is detected, Spring’s [`JtaTransactionManager`][r1] is used to manage transactions.
Auto-configured JMS, DataSource, and JPA beans are upgraded to support XA transactions.
You can use standard Spring idioms, such as [`@Transactional`][r2], to participate in a distributed transaction.
If you are within a JTA environment and still want to use local transactions, you can set the `spring.jta.enabled` property to `false` to disable the JTA auto-configuration.

## Using a Jakarta EE Managed Transaction Manager

If you package your Spring Boot application as a `war` or `ear` file and deploy it to a Jakarta EE application server, you can use your application server’s built-in transaction manager.
Spring Boot tries to auto-configure a transaction manager by looking at common JNDI locations (`java:comp/UserTransaction`, `java:comp/TransactionManager`, and so on).
When using a transaction service provided by your application server, you generally also want to ensure that all resources are managed by the server and exposed over JNDI.
Spring Boot tries to auto-configure JMS by looking for a [`ConnectionFactory`][r3] at the JNDI path (`java:/JmsXA` or `java:/XAConnectionFactory`), and you can use the [`spring.datasource.jndi-name` property][r4] to configure your [`DataSource`][r5].

## Mixing XA and Non-XA JMS Connections

When using JTA, the primary JMS [`ConnectionFactory`][r3] bean is XA-aware and participates in distributed transactions.
You can inject into your bean without needing to use any [`@Qualifier`][r6]:

```kotlin
import jakarta.jms.ConnectionFactory

class MyBean(connectionFactory: ConnectionFactory?)
```

```java
import jakarta.jms.ConnectionFactory;

public class MyBean {

	public MyBean(ConnectionFactory connectionFactory) {
		// ...
	}

}
```

In some situations, you might want to process certain JMS messages by using a non-XA [`ConnectionFactory`][r3].
For example, your JMS processing logic might take longer than the XA timeout.

If you want to use a non-XA [`ConnectionFactory`][r3], you can the `nonXaJmsConnectionFactory` bean:

```kotlin
import jakarta.jms.ConnectionFactory
import org.springframework.beans.factory.annotation.Qualifier

class MyBean(@Qualifier("nonXaJmsConnectionFactory") connectionFactory: ConnectionFactory?)
```

```java
import jakarta.jms.ConnectionFactory;

import org.springframework.beans.factory.annotation.Qualifier;

public class MyBean {

	public MyBean(@Qualifier("nonXaJmsConnectionFactory") ConnectionFactory connectionFactory) {
		// ...
	}

}
```

For consistency, the `jmsConnectionFactory` bean is also provided by using the bean alias `xaJmsConnectionFactory`:

```kotlin
import jakarta.jms.ConnectionFactory
import org.springframework.beans.factory.annotation.Qualifier

class MyBean(@Qualifier("xaJmsConnectionFactory") connectionFactory: ConnectionFactory?)
```

```java
import jakarta.jms.ConnectionFactory;

import org.springframework.beans.factory.annotation.Qualifier;

public class MyBean {

	public MyBean(@Qualifier("xaJmsConnectionFactory") ConnectionFactory connectionFactory) {
		// ...
	}

}
```

## Supporting an Embedded Transaction Manager

The [`XAConnectionFactoryWrapper`][r7] and [`XADataSourceWrapper`][r8] interfaces can be used to support embedded transaction managers.
The interfaces are responsible for wrapping [`XAConnectionFactory`][r9] and [`XADataSource`][r10] beans and exposing them as regular [`ConnectionFactory`][r3] and [`DataSource`][r5] beans, which transparently enroll in the distributed transaction.
DataSource and JMS auto-configuration use JTA variants, provided you have a [`JtaTransactionManager`][r1] bean and appropriate XA wrapper beans registered within your [`ApplicationContext`][r11].
