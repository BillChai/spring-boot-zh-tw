# Hazelcast

如果 classpath 上有 [Hazelcast][r1]，且找到適當的設定，Spring Boot 就會自動設定 [`HazelcastInstance`][r2]，供你注入應用程式。

Spring Boot 首先會檢查下列設定選項，嘗試建立用戶端：

- 是否存在 [`ClientConfig`][r3] Bean。
- `spring.hazelcast.config` 屬性所指定的設定檔。
- 是否存在 `hazelcast.client.config` 系統屬性。
- 工作目錄或 classpath 根目錄下的 `hazelcast-client.xml`。
- 工作目錄或 classpath 根目錄下的 `hazelcast-client.yaml`（或 `hazelcast-client.yml`）。

如果無法建立用戶端，Spring Boot 會嘗試設定內嵌伺服器。
如果你定義了 [`Config`][r4] Bean，Spring Boot 就直接使用它。
如果設定中定義了實例名稱，Spring Boot 會嘗試尋找既有實例，而不是建立新的實例。

你也可以透過設定指定要使用的 Hazelcast 設定檔，如下例所示：

{{CODE_0}}

{{CODE_1}}

否則，Spring Boot 會嘗試從預設位置尋找 Hazelcast 設定：工作目錄或 classpath 根目錄下的 `hazelcast.xml`，或相同位置的 YAML 對應檔。
也會檢查是否設定了 `hazelcast.config` 系統屬性。
詳情請參閱 [Hazelcast 文件][r5]。

> [TIP]
>
> 預設支援 Hazelcast 元件上的 [`@SpringAware`][r6]。
> 你可以宣告 [`@Order`][r9] 值大於零的 [`HazelcastConfigCustomizer`][r8] Bean，覆寫 [`ManagedContext`][r7]。

> [NOTE]
>
> Spring Boot 也提供[專門的 Hazelcast 快取支援][r10]。
> 啟用快取時，[`HazelcastInstance`][r2] 會自動包裝在 [`CacheManager`][r11] 實作中。
