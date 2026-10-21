# 透過 JMX 監控與管理

<!-- source-attribution -->
> **非官方繁體中文翻譯** · Spring Boot 4.1.1 · 翻譯日期：2026-10-21  
> [官方英文網站](https://docs.spring.io/spring-boot/4.1/reference/actuator/jmx.html) · [固定版本英文來源](https://github.com/spring-projects/spring-boot/blob/v4.1.1/documentation/spring-boot-docs/src/docs/antora/modules/reference/pages/actuator/jmx.adoc) · [本地原文快照](../sources/spring-boot/documentation/spring-boot-docs/src/docs/antora/modules/reference/pages/actuator/jmx.adoc)  
> 原始作者與授權見 [來源聲明](../NOTICE.md)。官方範例及設定鍵保留原文，額外圖解另標示為譯者補充。

<!-- translation-status: translated -->

Java Management Extensions（JMX）提供監控及管理應用程式的標準機制。
預設並未啟用此功能。
你可以將 `spring.jmx.enabled` 設定屬性設為 `true` 來啟用。
Spring Boot 會將最適合的 [`MBeanServer`][actuator--jmx-r1] 以 ID 為 `mbeanServer` 的 Bean 公開。
任何標註 Spring JMX 註解（`@org.springframework.jmx.export.annotation.ManagedResource`、[`@ManagedAttribute`][actuator--jmx-r2] 或 [`@ManagedOperation`][actuator--jmx-r3]）的 Bean，都會公開給它。

如果平台提供標準 [`MBeanServer`][actuator--jmx-r1]，Spring Boot 就會使用它；必要時則預設使用 VM 的 [`MBeanServer`][actuator--jmx-r1]。
如果上述方式都不可行，則建立新的 [`MBeanServer`][actuator--jmx-r1]。

> **注意：**
>
> `spring.jmx.enabled` 只影響 Spring 提供的管理 Bean。
> 其他函式庫（例如 [Log4j2][actuator--jmx-r4] 或 [Quartz][actuator--jmx-r5]）提供的管理 Bean，其啟用方式彼此獨立。

更多細節請參閱 [`JmxAutoConfiguration`][actuator--jmx-r6] 類別。

預設情況下，Spring Boot 也會在 `org.springframework.boot` domain 下，將管理端點公開為 JMX MBean。
若要完全控制端點在 JMX domain 中的註冊方式，可考慮註冊自己的 [`EndpointObjectNameFactory`][actuator--jmx-r7] 實作。

## 自訂 MBean 名稱

MBean 名稱通常根據端點的 `id` 產生。
例如 `health` 端點公開為 `org.springframework.boot:type=Endpoint,name=Health`。

如果應用程式包含多個 Spring [`ApplicationContext`][actuator--jmx-r8]，可能會發生名稱衝突。
若要解決此問題，可將 `spring.jmx.unique-names` 設為 `true`，確保 MBean 名稱永遠唯一。

你也可以自訂端點公開所在的 JMX domain。
以下是在 `application.properties` 中設定的範例：

```properties
spring.jmx.unique-names=true
management.endpoints.jmx.domain=com.example.myapp
```

```yaml
spring:
  jmx:
    unique-names: true
management:
  endpoints:
    jmx:
      domain: "com.example.myapp"
```

## 停用 JMX 端點

如果不想透過 JMX 公開端點，可將 `management.endpoints.jmx.exposure.exclude` 設為 `*`，如下例所示：

```properties
management.endpoints.jmx.exposure.exclude=*
```

```yaml
management:
  endpoints:
    jmx:
      exposure:
        exclude: "*"
```

[actuator--jmx-r1]: https://docs.oracle.com/en/java/javase/17/docs/api/java.management/javax/management/MBeanServer.html
[actuator--jmx-r2]: https://docs.spring.io/spring-framework/docs/7.0.x/javadoc-api/org/springframework/jmx/export/annotation/ManagedAttribute.html
[actuator--jmx-r3]: https://docs.spring.io/spring-framework/docs/7.0.x/javadoc-api/org/springframework/jmx/export/annotation/ManagedOperation.html
[actuator--jmx-r4]: https://logging.apache.org/log4j/2.x/manual/jmx.html
[actuator--jmx-r5]: https://javadoc.io/doc/org.quartz-scheduler/quartz/2.5.2/constant-values.html#org.quartz.impl.StdSchedulerFactory.PROP_SCHED_JMX_EXPORT
[actuator--jmx-r6]: https://github.com/spring-projects/spring-boot/tree/v4.1.1/core/spring-boot-autoconfigure/src/main/java/org/springframework/boot/autoconfigure/jmx/JmxAutoConfiguration.java
[actuator--jmx-r7]: https://docs.spring.io/spring-boot/4.1.1/api/java/org/springframework/boot/actuate/endpoint/jmx/EndpointObjectNameFactory.html
[actuator--jmx-r8]: https://docs.spring.io/spring-framework/docs/7.0.x/javadoc-api/org/springframework/context/ApplicationContext.html
