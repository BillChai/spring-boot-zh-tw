# Hazelcast

<!-- source-attribution -->
> **非官方繁體中文翻譯** · Spring Boot 4.1.1 · 翻譯日期：2026-10-21  
> [官方英文網站](https://docs.spring.io/spring-boot/4.1/reference/io/hazelcast.html) · [固定版本英文來源](https://github.com/spring-projects/spring-boot/blob/v4.1.1/documentation/spring-boot-docs/src/docs/antora/modules/reference/pages/io/hazelcast.adoc) · [本地原文快照](../sources/spring-boot/documentation/spring-boot-docs/src/docs/antora/modules/reference/pages/io/hazelcast.adoc)  
> 原始作者與授權見 [來源聲明](../NOTICE.md)。官方範例及設定鍵保留原文，額外圖解另標示為譯者補充。

<!-- translation-status: translated -->

如果 classpath 上有 [Hazelcast][io--hazelcast-r1]，且找到適當的設定，Spring Boot 就會自動設定 [`HazelcastInstance`][io--hazelcast-r2]，供你注入應用程式。

Spring Boot 首先會檢查下列設定選項，嘗試建立用戶端：

- 是否存在 [`ClientConfig`][io--hazelcast-r3] Bean。
- `spring.hazelcast.config` 屬性所指定的設定檔。
- 是否存在 `hazelcast.client.config` 系統屬性。
- 工作目錄或 classpath 根目錄下的 `hazelcast-client.xml`。
- 工作目錄或 classpath 根目錄下的 `hazelcast-client.yaml`（或 `hazelcast-client.yml`）。

如果無法建立用戶端，Spring Boot 會嘗試設定內嵌伺服器。
如果你定義了 [`Config`][io--hazelcast-r4] Bean，Spring Boot 就直接使用它。
如果設定中定義了實例名稱，Spring Boot 會嘗試尋找既有實例，而不是建立新的實例。

你也可以透過設定指定要使用的 Hazelcast 設定檔，如下例所示：

```properties
spring.hazelcast.config=classpath:config/my-hazelcast.xml
```

```yaml
spring:
  hazelcast:
    config: "classpath:config/my-hazelcast.xml"
```

否則，Spring Boot 會嘗試從預設位置尋找 Hazelcast 設定：工作目錄或 classpath 根目錄下的 `hazelcast.xml`，或相同位置的 YAML 對應檔。
也會檢查是否設定了 `hazelcast.config` 系統屬性。
詳情請參閱 [Hazelcast 文件][io--hazelcast-r5]。

> **提示：**
>
> 預設支援 Hazelcast 元件上的 [`@SpringAware`][io--hazelcast-r6]。
> 你可以宣告 [`@Order`][io--hazelcast-r9] 值大於零的 [`HazelcastConfigCustomizer`][io--hazelcast-r8] Bean，覆寫 [`ManagedContext`][io--hazelcast-r7]。

> **注意：**
>
> Spring Boot 也提供[專門的 Hazelcast 快取支援][io--hazelcast-r10]。
> 啟用快取時，[`HazelcastInstance`][io--hazelcast-r2] 會自動包裝在 [`CacheManager`][io--hazelcast-r11] 實作中。

[io--hazelcast-r1]: https://hazelcast.com/
[io--hazelcast-r2]: https://docs.hazelcast.org/docs/5.5.0/javadoc/com/hazelcast/core/HazelcastInstance.html
[io--hazelcast-r3]: https://docs.hazelcast.org/docs/5.5.0/javadoc/com/hazelcast/client/config/ClientConfig.html
[io--hazelcast-r4]: https://docs.hazelcast.org/docs/5.5.0/javadoc/com/hazelcast/config/Config.html
[io--hazelcast-r5]: https://docs.hazelcast.org/docs/latest/manual/html-single/
[io--hazelcast-r6]: https://docs.hazelcast.org/docs/5.5.0/javadoc/com/hazelcast/spring/context/SpringAware.html
[io--hazelcast-r7]: https://docs.hazelcast.org/docs/5.5.0/javadoc/com/hazelcast/core/ManagedContext.html
[io--hazelcast-r8]: https://docs.spring.io/spring-boot/4.1.1/api/java/org/springframework/boot/hazelcast/autoconfigure/HazelcastConfigCustomizer.html
[io--hazelcast-r9]: https://docs.spring.io/spring-framework/docs/7.0.x/javadoc-api/org/springframework/core/annotation/Order.html
[io--hazelcast-r10]: https://docs.spring.io/spring-boot/4.1/reference/io/caching.html#io.caching.provider.hazelcast
[io--hazelcast-r11]: https://docs.spring.io/spring-framework/docs/7.0.x/javadoc-api/org/springframework/cache/CacheManager.html
