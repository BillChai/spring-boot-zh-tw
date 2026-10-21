# 透過 JMX 監控與管理

Java Management Extensions（JMX）提供監控及管理應用程式的標準機制。
預設並未啟用此功能。
你可以將 `spring.jmx.enabled` 設定屬性設為 `true` 來啟用。
Spring Boot 會將最適合的 [`MBeanServer`][r1] 以 ID 為 `mbeanServer` 的 Bean 公開。
任何標註 Spring JMX 註解（`@org.springframework.jmx.export.annotation.ManagedResource`、[`@ManagedAttribute`][r2] 或 [`@ManagedOperation`][r3]）的 Bean，都會公開給它。

如果平台提供標準 [`MBeanServer`][r1]，Spring Boot 就會使用它；必要時則預設使用 VM 的 [`MBeanServer`][r1]。
如果上述方式都不可行，則建立新的 [`MBeanServer`][r1]。

> [NOTE]
>
> `spring.jmx.enabled` 只影響 Spring 提供的管理 Bean。
> 其他函式庫（例如 [Log4j2][r4] 或 [Quartz][r5]）提供的管理 Bean，其啟用方式彼此獨立。

更多細節請參閱 [`JmxAutoConfiguration`][r6] 類別。

預設情況下，Spring Boot 也會在 `org.springframework.boot` domain 下，將管理端點公開為 JMX MBean。
若要完全控制端點在 JMX domain 中的註冊方式，可考慮註冊自己的 [`EndpointObjectNameFactory`][r7] 實作。

## 自訂 MBean 名稱

MBean 名稱通常根據端點的 `id` 產生。
例如 `health` 端點公開為 `org.springframework.boot:type=Endpoint,name=Health`。

如果應用程式包含多個 Spring [`ApplicationContext`][r8]，可能會發生名稱衝突。
若要解決此問題，可將 `spring.jmx.unique-names` 設為 `true`，確保 MBean 名稱永遠唯一。

你也可以自訂端點公開所在的 JMX domain。
以下是在 `application.properties` 中設定的範例：

{{CODE_0}}

{{CODE_1}}

## 停用 JMX 端點

如果不想透過 JMX 公開端點，可將 `management.endpoints.jmx.exposure.exclude` 設為 `*`，如下例所示：

{{CODE_2}}

{{CODE_3}}
