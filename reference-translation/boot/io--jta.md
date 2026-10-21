# 使用 JTA 的分散式交易

<!-- source-attribution -->
> **非官方繁體中文翻譯** · Spring Boot 4.1.1 · 翻譯日期：2026-10-21  
> [官方英文網站](https://docs.spring.io/spring-boot/4.1/reference/io/jta.html) · [固定版本英文來源](https://github.com/spring-projects/spring-boot/blob/v4.1.1/documentation/spring-boot-docs/src/docs/antora/modules/reference/pages/io/jta.adoc) · [本地原文快照](../sources/spring-boot/documentation/spring-boot-docs/src/docs/antora/modules/reference/pages/io/jta.adoc)  
> 原始作者與授權見 [來源聲明](../NOTICE.md)。官方範例及設定鍵保留原文，額外圖解另標示為譯者補充。

<!-- translation-status: translated -->

Spring Boot 使用從 JNDI 取得的交易管理器，支援跨多個 XA 資源的分散式 JTA 交易。

偵測到 JTA 環境時，會使用 Spring 的 [`JtaTransactionManager`][io--jta-r1] 管理交易。
自動設定的 JMS、DataSource 與 JPA Bean 會升級為支援 XA 交易。
你可以使用標準 Spring 寫法，例如 [`@Transactional`][io--jta-r2]，參與分散式交易。
如果處於 JTA 環境但仍想使用本機交易，可將 `spring.jta.enabled` 設為 `false`，停用 JTA 自動設定。

## 使用 Jakarta EE 管理的交易管理器

如果將 Spring Boot 應用程式封裝為 `war` 或 `ear` 檔，並部署到 Jakarta EE 應用程式伺服器，就可以使用該伺服器內建的交易管理器。
Spring Boot 會查看常見的 JNDI 位置（`java:comp/UserTransaction`、`java:comp/TransactionManager` 等），嘗試自動設定交易管理器。
使用應用程式伺服器提供的交易服務時，通常也要確保所有資源都由伺服器管理，並透過 JNDI 公開。
Spring Boot 會在 JNDI 路徑（`java:/JmsXA` 或 `java:/XAConnectionFactory`）尋找 [`ConnectionFactory`][io--jta-r3]，嘗試自動設定 JMS；你也可以使用 [`spring.datasource.jndi-name` 屬性][io--jta-r4]設定 [`DataSource`][io--jta-r5]。

## 混用 XA 與非 XA 的 JMS 連線

使用 JTA 時，主要 JMS [`ConnectionFactory`][io--jta-r3] Bean 支援 XA，並參與分散式交易。
你可以將它注入 Bean，而不需要任何 [`@Qualifier`][io--jta-r6]：

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

某些情況下，你可能想使用非 XA 的 [`ConnectionFactory`][io--jta-r3] 處理特定 JMS 訊息。
例如，JMS 處理邏輯所需時間可能超過 XA 的逾時限制。

若要使用非 XA 的 [`ConnectionFactory`][io--jta-r3]，可以使用 `nonXaJmsConnectionFactory` Bean：

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

為保持一致性，`jmsConnectionFactory` Bean 也以 `xaJmsConnectionFactory` 這個 Bean 別名提供：

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

## 支援內嵌交易管理器

[`XAConnectionFactoryWrapper`][io--jta-r7] 與 [`XADataSourceWrapper`][io--jta-r8] 介面可用來支援內嵌交易管理器。
這些介面負責包裝 [`XAConnectionFactory`][io--jta-r9] 與 [`XADataSource`][io--jta-r10] Bean，並將它們公開為一般的 [`ConnectionFactory`][io--jta-r3] 與 [`DataSource`][io--jta-r5] Bean，使它們能透明地加入分散式交易。
只要你在 [`ApplicationContext`][io--jta-r11] 中註冊了 [`JtaTransactionManager`][io--jta-r1] Bean 與適當的 XA 包裝器 Bean，DataSource 和 JMS 自動設定就會使用 JTA 變體。

[io--jta-r1]: https://docs.spring.io/spring-framework/docs/7.0.x/javadoc-api/org/springframework/transaction/jta/JtaTransactionManager.html
[io--jta-r2]: https://docs.spring.io/spring-framework/docs/7.0.x/javadoc-api/org/springframework/transaction/annotation/Transactional.html
[io--jta-r3]: https://jakarta.ee/specifications/messaging/3.1/apidocs/jakarta.messaging/jakarta/jms/ConnectionFactory.html
[io--jta-r4]: https://docs.spring.io/spring-boot/4.1/reference/data/sql.html#data.sql.datasource.jndi
[io--jta-r5]: https://docs.oracle.com/en/java/javase/17/docs/api/java.sql/javax/sql/DataSource.html
[io--jta-r6]: https://docs.spring.io/spring-framework/docs/7.0.x/javadoc-api/org/springframework/beans/factory/annotation/Qualifier.html
[io--jta-r7]: https://docs.spring.io/spring-boot/4.1.1/api/java/org/springframework/boot/jms/XAConnectionFactoryWrapper.html
[io--jta-r8]: https://docs.spring.io/spring-boot/4.1.1/api/java/org/springframework/boot/jdbc/XADataSourceWrapper.html
[io--jta-r9]: https://jakarta.ee/specifications/messaging/3.1/apidocs/jakarta.messaging/jakarta/jms/XAConnectionFactory.html
[io--jta-r10]: https://docs.oracle.com/en/java/javase/17/docs/api/java.sql/javax/sql/XADataSource.html
[io--jta-r11]: https://docs.spring.io/spring-framework/docs/7.0.x/javadoc-api/org/springframework/context/ApplicationContext.html
