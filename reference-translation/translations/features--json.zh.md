# JSON

Spring Boot 整合下列 JSON 對映函式庫：

- Jackson 3
- Jackson 2
- Gson
- JSON-B
- Kotlin Serialization

Jackson 3 是優先採用、也是預設使用的函式庫。

Jackson 2 支援已棄用，將在未來某個 Spring Boot 4.x 版本移除。保留這項支援只是為了協助從 Jackson 2 遷移至 Jackson 3，不應長期依賴。

## Jackson 3

Spring Boot 提供 Jackson 3 的自動設定，且 Jackson 包含在 `spring-boot-starter-json` 中。當 classpath 中存在 Jackson 時，會自動設定 [`JsonMapper`][r1] Bean，並提供多個設定屬性，以便[客製 `JsonMapper` 的設定][r2]。

### 自訂序列化器與反序列化器

如果使用 Jackson 序列化與反序列化 JSON 資料，可能會需要自行撰寫 [`ValueSerializer`][r3] 與 [`ValueDeserializer`][r4] 類別。自訂序列化器通常[透過 module 向 Jackson 註冊][r5]，不過 Spring Boot 另外提供 [`@JacksonComponent`][r6]，讓直接註冊 Spring Bean 更方便。

可以直接在 [`ValueSerializer`][r3]、[`ValueDeserializer`][r4] 或 [`KeyDeserializer`][r7] 實作上使用 [`@JacksonComponent`][r6]。也可以將它加在以內部類別包含序列化器／反序列化器的類別上，如下例：

{{CODE_0}}

{{CODE_1}}

[`ApplicationContext`][r8] 內所有 [`@JacksonComponent`][r6] Bean 都會自動向 Jackson 註冊。由於 [`@JacksonComponent`][r6] 本身帶有 [`@Component`][r9] 中繼註解，因此適用一般元件掃描規則。

Spring Boot 也提供 [`ObjectValueSerializer`][r10] 與 [`ObjectValueDeserializer`][r11] 基底類別，在序列化物件時，可作為 Jackson 標準版本的實用替代方案。詳情請參閱這兩個類別的 API 文件。

前面的範例可改寫為使用 [`ObjectValueSerializer`][r10] 與 [`ObjectValueDeserializer`][r11]：

{{CODE_2}}

{{CODE_3}}

### Mixins

Jackson 支援 mixin，可在目標類別已宣告的註解之外混入額外註解。Spring Boot 的 Jackson 自動設定會掃描應用程式套件，找出帶有 [`@JacksonMixin`][r12] 的類別，再向自動設定的 [`JsonMapper`][r1] 註冊。註冊工作由 Spring Boot 的 [`JacksonMixinModule`][r13] 執行。

## Jackson 2

`spring-boot-jackson2` 模組提供已棄用的 Jackson 2 自動設定。當 classpath 中包含此模組時，會自動設定 [`ObjectMapper`][r14] Bean。可以透過 `spring.jackson2.*` 設定屬性進行客製；若需要更精細的控制，可以定義一個或多個 [`Jackson2ObjectMapperBuilderCustomizer`][r15] Bean。

當 Jackson 3 與 Jackson 2 同時存在時，可以使用下列設定屬性指定優先採用 Jackson 2：

- `spring.graphql.rsocket.preferred-json-mapper`
- `spring.http.codecs.preferred-json-mapper`：供 Spring WebFlux 與 Reactive HTTP 用戶端使用。
- `spring.http.converters.preferred-json-mapper`：供 Spring MVC 與命令式 HTTP 用戶端使用。
- `spring.rsocket.preferred-mapper`
- `spring.websocket.messaging.preferred-json-mapper`

將對應屬性設為 `jackson2`，即可指定優先採用 Jackson 2。

## Gson

Spring Boot 提供 Gson 的自動設定。當 classpath 中存在 Gson 時，會自動設定 [`Gson`][r16] Bean，並提供數個 `spring.gson.*` 屬性供客製設定。若需要更精細的控制，可以使用一個或多個 [`GsonBuilderCustomizer`][r17] Bean。

## JSON-B

Spring Boot 提供 JSON-B 的自動設定。當 classpath 中同時具有 JSON-B API 與其實作時，會自動設定 [`Jsonb`][r18] Bean。優先採用的 JSON-B 實作是 Eclipse Yasson，Spring Boot 也為其提供依賴管理。

## Kotlin Serialization

Spring Boot 提供 Kotlin Serialization 的自動設定。當 classpath 中具有 `kotlinx-serialization-json` 時，會自動設定 [Json][r19] Bean，並提供數個 `spring.kotlinx.serialization.json.*` 屬性供客製設定。
