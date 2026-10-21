# JSON

<!-- source-attribution -->
> **非官方繁體中文翻譯** · Spring Boot 4.1.1 · 翻譯日期：2026-10-21  
> [官方英文網站](https://docs.spring.io/spring-boot/4.1/reference/features/json.html) · [固定版本英文來源](https://github.com/spring-projects/spring-boot/blob/v4.1.1/documentation/spring-boot-docs/src/docs/antora/modules/reference/pages/features/json.adoc) · [本地原文快照](../sources/spring-boot/documentation/spring-boot-docs/src/docs/antora/modules/reference/pages/features/json.adoc)  
> 原始作者與授權見 [來源聲明](../NOTICE.md)。官方範例及設定鍵保留原文，額外圖解另標示為譯者補充。

<!-- translation-status: translated -->

Spring Boot 整合下列 JSON 對映函式庫：

- Jackson 3
- Jackson 2
- Gson
- JSON-B
- Kotlin Serialization

Jackson 3 是優先採用、也是預設使用的函式庫。

Jackson 2 支援已棄用，將在未來某個 Spring Boot 4.x 版本移除。保留這項支援只是為了協助從 Jackson 2 遷移至 Jackson 3，不應長期依賴。

## Jackson 3

Spring Boot 提供 Jackson 3 的自動設定，且 Jackson 包含在 `spring-boot-starter-json` 中。當 classpath 中存在 Jackson 時，會自動設定 [`JsonMapper`][features--json-r1] Bean，並提供多個設定屬性，以便[客製 `JsonMapper` 的設定][features--json-r2]。

### 自訂序列化器與反序列化器

如果使用 Jackson 序列化與反序列化 JSON 資料，可能會需要自行撰寫 [`ValueSerializer`][features--json-r3] 與 [`ValueDeserializer`][features--json-r4] 類別。自訂序列化器通常[透過 module 向 Jackson 註冊][features--json-r5]，不過 Spring Boot 另外提供 [`@JacksonComponent`][features--json-r6]，讓直接註冊 Spring Bean 更方便。

可以直接在 [`ValueSerializer`][features--json-r3]、[`ValueDeserializer`][features--json-r4] 或 [`KeyDeserializer`][features--json-r7] 實作上使用 [`@JacksonComponent`][features--json-r6]。也可以將它加在以內部類別包含序列化器／反序列化器的類別上，如下例：

```kotlin
import tools.jackson.core.JsonGenerator
import tools.jackson.core.JsonParser
import tools.jackson.databind.DeserializationContext
import tools.jackson.databind.JsonNode
import tools.jackson.databind.SerializationContext
import tools.jackson.databind.ValueDeserializer
import tools.jackson.databind.ValueSerializer

import org.springframework.boot.jackson.JacksonComponent

@JacksonComponent
class MyJacksonComponent {

	class Serializer : ValueSerializer<MyObject>() {
		override fun serialize(value: MyObject, jgen: JsonGenerator, serializers: SerializationContext) {
			jgen.writeStartObject()
			jgen.writeStringProperty("name", value.name)
			jgen.writeNumberProperty("age", value.age)
			jgen.writeEndObject()
		}
	}

	class Deserializer : ValueDeserializer<MyObject>() {
		override fun deserialize(jsonParser: JsonParser, ctxt: DeserializationContext): MyObject {
			val tree = jsonParser.readValueAsTree<JsonNode>()
			val name = tree["name"].stringValue()
			val age = tree["age"].intValue()
			return MyObject(name, age)
		}
	}

}
```

```java
import tools.jackson.core.JsonGenerator;
import tools.jackson.core.JsonParser;
import tools.jackson.databind.DeserializationContext;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.SerializationContext;
import tools.jackson.databind.ValueDeserializer;
import tools.jackson.databind.ValueSerializer;

import org.springframework.boot.jackson.JacksonComponent;

@JacksonComponent
public class MyJacksonComponent {

	public static class Serializer extends ValueSerializer<MyObject> {

		@Override
		public void serialize(MyObject value, JsonGenerator jgen, SerializationContext context) {
			jgen.writeStartObject();
			jgen.writeStringProperty("name", value.getName());
			jgen.writeNumberProperty("age", value.getAge());
			jgen.writeEndObject();
		}

	}

	public static class Deserializer extends ValueDeserializer<MyObject> {

		@Override
		public MyObject deserialize(JsonParser jsonParser, DeserializationContext ctxt) {
			JsonNode tree = jsonParser.readValueAsTree();
			String name = tree.get("name").stringValue();
			int age = tree.get("age").intValue();
			return new MyObject(name, age);
		}

	}

}
```

[`ApplicationContext`][features--json-r8] 內所有 [`@JacksonComponent`][features--json-r6] Bean 都會自動向 Jackson 註冊。由於 [`@JacksonComponent`][features--json-r6] 本身帶有 [`@Component`][features--json-r9] 中繼註解，因此適用一般元件掃描規則。

Spring Boot 也提供 [`ObjectValueSerializer`][features--json-r10] 與 [`ObjectValueDeserializer`][features--json-r11] 基底類別，在序列化物件時，可作為 Jackson 標準版本的實用替代方案。詳情請參閱這兩個類別的 API 文件。

前面的範例可改寫為使用 [`ObjectValueSerializer`][features--json-r10] 與 [`ObjectValueDeserializer`][features--json-r11]：

```kotlin
import tools.jackson.core.JsonGenerator
import tools.jackson.core.JsonParser
import tools.jackson.databind.DeserializationContext
import tools.jackson.databind.JsonNode
import tools.jackson.databind.SerializationContext

import org.springframework.boot.jackson.JacksonComponent;
import org.springframework.boot.jackson.ObjectValueDeserializer
import org.springframework.boot.jackson.ObjectValueSerializer

@JacksonComponent
class MyJacksonComponent {

	class Serializer : ObjectValueSerializer<MyObject>() {
		override fun serializeObject(value: MyObject, jgen: JsonGenerator, context: SerializationContext) {
			jgen.writeStringProperty("name", value.name)
			jgen.writeNumberProperty("age", value.age)
		}
	}

	class Deserializer : ObjectValueDeserializer<MyObject>() {
		override fun deserializeObject(jsonParser: JsonParser, context: DeserializationContext,
				tree: JsonNode): MyObject {
			val name = nullSafeValue(tree["name"], String::class.java) ?: throw IllegalStateException("name is null")
			val age = nullSafeValue(tree["age"], Int::class.java) ?: throw IllegalStateException("age is null")
			return MyObject(name, age)
		}
	}

}
```

```java
import tools.jackson.core.JsonGenerator;
import tools.jackson.core.JsonParser;
import tools.jackson.databind.DeserializationContext;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.SerializationContext;

import org.springframework.boot.jackson.JacksonComponent;
import org.springframework.boot.jackson.ObjectValueDeserializer;
import org.springframework.boot.jackson.ObjectValueSerializer;

@JacksonComponent
public class MyJacksonComponent {

	public static class Serializer extends ObjectValueSerializer<MyObject> {

		@Override
		protected void serializeObject(MyObject value, JsonGenerator jgen, SerializationContext context) {
			jgen.writeStringProperty("name", value.getName());
			jgen.writeNumberProperty("age", value.getAge());
		}

	}

	public static class Deserializer extends ObjectValueDeserializer<MyObject> {

		@Override
		protected MyObject deserializeObject(JsonParser jsonParser, DeserializationContext context, JsonNode tree) {
			String name = nullSafeValue(tree.get("name"), String.class);
			int age = nullSafeValue(tree.get("age"), Integer.class);
			return new MyObject(name, age);
		}

	}

}
```

### Mixins

Jackson 支援 mixin，可在目標類別已宣告的註解之外混入額外註解。Spring Boot 的 Jackson 自動設定會掃描應用程式套件，找出帶有 [`@JacksonMixin`][features--json-r12] 的類別，再向自動設定的 [`JsonMapper`][features--json-r1] 註冊。註冊工作由 Spring Boot 的 [`JacksonMixinModule`][features--json-r13] 執行。

## Jackson 2

`spring-boot-jackson2` 模組提供已棄用的 Jackson 2 自動設定。當 classpath 中包含此模組時，會自動設定 [`ObjectMapper`][features--json-r14] Bean。可以透過 `spring.jackson2.*` 設定屬性進行客製；若需要更精細的控制，可以定義一個或多個 [`Jackson2ObjectMapperBuilderCustomizer`][features--json-r15] Bean。

當 Jackson 3 與 Jackson 2 同時存在時，可以使用下列設定屬性指定優先採用 Jackson 2：

- `spring.graphql.rsocket.preferred-json-mapper`
- `spring.http.codecs.preferred-json-mapper`：供 Spring WebFlux 與 Reactive HTTP 用戶端使用。
- `spring.http.converters.preferred-json-mapper`：供 Spring MVC 與命令式 HTTP 用戶端使用。
- `spring.rsocket.preferred-mapper`
- `spring.websocket.messaging.preferred-json-mapper`

將對應屬性設為 `jackson2`，即可指定優先採用 Jackson 2。

## Gson

Spring Boot 提供 Gson 的自動設定。當 classpath 中存在 Gson 時，會自動設定 [`Gson`][features--json-r16] Bean，並提供數個 `spring.gson.*` 屬性供客製設定。若需要更精細的控制，可以使用一個或多個 [`GsonBuilderCustomizer`][features--json-r17] Bean。

## JSON-B

Spring Boot 提供 JSON-B 的自動設定。當 classpath 中同時具有 JSON-B API 與其實作時，會自動設定 [`Jsonb`][features--json-r18] Bean。優先採用的 JSON-B 實作是 Eclipse Yasson，Spring Boot 也為其提供依賴管理。

## Kotlin Serialization

Spring Boot 提供 Kotlin Serialization 的自動設定。當 classpath 中具有 `kotlinx-serialization-json` 時，會自動設定 [Json][features--json-r19] Bean，並提供數個 `spring.kotlinx.serialization.json.*` 屬性供客製設定。

[features--json-r1]: https://javadoc.io/doc/tools.jackson.core/jackson-databind/3.1.5/tools/jackson/databind/json/JsonMapper.html
[features--json-r2]: https://docs.spring.io/spring-boot/4.1/how-to/spring-mvc.html#howto.spring-mvc.customize-jackson-jsonmapper
[features--json-r3]: https://javadoc.io/doc/tools.jackson.core/jackson-databind/3.1.5/tools/jackson/databind/ValueSerializer.html
[features--json-r4]: https://javadoc.io/doc/tools.jackson.core/jackson-databind/3.1.5/tools/jackson/databind/ValueDeserializer.html
[features--json-r5]: https://github.com/FasterXML/jackson-docs/wiki/JacksonHowToCustomSerializers
[features--json-r6]: https://docs.spring.io/spring-boot/4.1.1/api/java/org/springframework/boot/jackson/JacksonComponent.html
[features--json-r7]: https://javadoc.io/doc/tools.jackson.core/jackson-databind/3.1.5/tools/jackson/databind/KeyDeserializer.html
[features--json-r8]: https://docs.spring.io/spring-framework/docs/7.0.x/javadoc-api/org/springframework/context/ApplicationContext.html
[features--json-r9]: https://docs.spring.io/spring-framework/docs/7.0.x/javadoc-api/org/springframework/stereotype/Component.html
[features--json-r10]: https://docs.spring.io/spring-boot/4.1.1/api/java/org/springframework/boot/jackson/ObjectValueSerializer.html
[features--json-r11]: https://docs.spring.io/spring-boot/4.1.1/api/java/org/springframework/boot/jackson/ObjectValueDeserializer.html
[features--json-r12]: https://docs.spring.io/spring-boot/4.1.1/api/java/org/springframework/boot/jackson/JacksonMixin.html
[features--json-r13]: https://docs.spring.io/spring-boot/4.1.1/api/java/org/springframework/boot/jackson/JacksonMixinModule.html
[features--json-r14]: https://javadoc.io/doc/com.fasterxml.jackson.core/jackson-databind/2.21.5/com/fasterxml/jackson/databind/ObjectMapper.html
[features--json-r15]: https://docs.spring.io/spring-boot/4.1.1/api/java/org/springframework/boot/jackson2/autoconfigure/Jackson2ObjectMapperBuilderCustomizer.html
[features--json-r16]: https://javadoc.io/doc/com.google.code.gson/gson/2.13.2/com/google/gson/Gson.html
[features--json-r17]: https://docs.spring.io/spring-boot/4.1.1/api/java/org/springframework/boot/gson/autoconfigure/GsonBuilderCustomizer.html
[features--json-r18]: https://jakarta.ee/specifications/jsonb/3.0/apidocs/jakarta/json/bind/Jsonb.html
[features--json-r19]: https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/-json/
