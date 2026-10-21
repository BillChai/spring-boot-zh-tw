# Advanced Native Images Topics

## Nested Configuration Properties

Reflection hints are automatically created for configuration properties by the Spring ahead-of-time engine.
Nested configuration properties which are not inner classes, however, **must** be annotated with [`@NestedConfigurationProperty`][r1], otherwise they won’t be detected and will not be bindable.

```java
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.NestedConfigurationProperty;

@ConfigurationProperties("my.properties")
public class MyProperties {

	private String name;

	@NestedConfigurationProperty
	private final Nested nested = new Nested();

	// getters / setters...

	public String getName() {
		return this.name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public Nested getNested() {
		return this.nested;
	}

}
```

where `Nested` is:

```kotlin
class Nested {
}
```

```java
public class Nested {

	private int number;

	// getters / setters...

	public int getNumber() {
		return this.number;
	}

	public void setNumber(int number) {
		this.number = number;
	}

}
```

The example above produces configuration properties for `my.properties.name` and `my.properties.nested.number`.
Without the [`@NestedConfigurationProperty`][r1] annotation on the `nested` field, the `my.properties.nested.number` property would not be bindable in a native image.
You can also annotate the getter method.

When using constructor binding, you have to annotate the field with [`@NestedConfigurationProperty`][r1]:

```java
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.NestedConfigurationProperty;

@ConfigurationProperties("my.properties")
public class MyPropertiesCtor {

	private final String name;

	@NestedConfigurationProperty
	private final Nested nested;

	public MyPropertiesCtor(String name, Nested nested) {
		this.name = name;
		this.nested = nested;
	}

	// getters / setters...

	public String getName() {
		return this.name;
	}

	public Nested getNested() {
		return this.nested;
	}

}
```

When using records, you have to annotate the parameter with [`@NestedConfigurationProperty`][r1]:

```java
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.NestedConfigurationProperty;

@ConfigurationProperties("my.properties")
public record MyPropertiesRecord(String name, @NestedConfigurationProperty Nested nested) {

}
```

When using Kotlin, you need to annotate the parameter of a data class with [`@NestedConfigurationProperty`][r1]:

```kotlin
import org.springframework.boot.context.properties.ConfigurationProperties
import org.springframework.boot.context.properties.NestedConfigurationProperty

@ConfigurationProperties("my.properties")
data class MyPropertiesKotlin(
	val name: String,
	@NestedConfigurationProperty val nested: Nested
)
```

> [NOTE]
>
> Please use public getters and setters in all cases, otherwise the properties will not be bindable.

## Converting a Spring Boot Executable Jar

It is possible to convert a Spring Boot [executable jar][r2] into a native image as long as the jar contains the AOT generated assets.
This can be useful for a number of reasons, including:

- You can keep your regular JVM pipeline and turn the JVM application into a native image on your CI/CD platform.
- As `native-image` [does not support cross-compilation][r3], you can keep an OS neutral deployment artifact which you convert later to different OS architectures.

You can convert a Spring Boot executable jar into a native image using Cloud Native Buildpacks, or using the `native-image` tool that is shipped with GraalVM.

> [NOTE]
>
> Your executable jar must include AOT generated assets such as generated classes and JSON hint files.

### Using Buildpacks

Spring Boot applications usually use Cloud Native Buildpacks through the Maven (`mvn spring-boot:build-image`) or Gradle (`gradle bootBuildImage`) integrations.
You can, however, also use [`pack`][r4] to turn an AOT processed Spring Boot executable jar into a native container image.

> [NOTE]
>
> You have to build your application with at least JDK 25, because Buildpacks use the same GraalVM native-image version as the Java version used for compilation.

First, make sure that a Docker daemon is available (see [Get Docker][r5] for more details).
[Configure it to allow non-root user][r6] if you are on Linux.

You also need to install `pack` by following [the installation guide on buildpacks.io][r7].

Assuming an AOT processed Spring Boot executable jar built as `myproject-0.0.1-SNAPSHOT.jar` is in the `target` directory, run:

```shell
$ pack build --builder paketobuildpacks/builder-noble-java-tiny \
    --path target/myproject-0.0.1-SNAPSHOT.jar \
    --env 'BP_NATIVE_IMAGE=true' \
    my-application:0.0.1-SNAPSHOT
```

> [NOTE]
>
> You do not need to have a local GraalVM installation to generate an image in this way.

Once `pack` has finished, you can launch the application using `docker run`:

```shell
$ docker run --rm -p 8080:8080 docker.io/library/myproject:0.0.1-SNAPSHOT
```

### Using GraalVM native-image

Another option to turn an AOT processed Spring Boot executable jar into a native executable is to use the GraalVM `native-image` tool.
For this to work, you’ll need a GraalVM distribution on your machine.
You can either download it manually on the [Liberica Native Image Kit page][r8] or you can use a download manager like SDKMAN!.

Assuming an AOT processed Spring Boot executable jar built as `myproject-0.0.1-SNAPSHOT.jar` is in the `target` directory, run:

```shell
$ rm -rf target/native
$ mkdir -p target/native
$ cd target/native
$ jar -xvf ../myproject-0.0.1-SNAPSHOT.jar
$ native-image -H:Name=myproject @META-INF/native-image/argfile -cp .:BOOT-INF/classes:`find BOOT-INF/lib | tr '\n' ':'`
$ mv myproject ../
```

> [NOTE]
>
> These commands work on Linux or macOS machines, but you will need to adapt them for Windows.

> [TIP]
>
> The `@META-INF/native-image/argfile` might not be packaged in your jar.
> It is only included when reachability metadata overrides are needed.

> [WARNING]
>
> The `native-image` `-cp` flag does not accept wildcards.
> You need to ensure that all jars are listed (the command above uses `find` and `tr` to do this).

## Using the Tracing Agent

The GraalVM native image [tracing agent][r9] allows you to intercept reflection, resources or proxy usage on the JVM in order to generate the related hints.
Spring should generate most of these hints automatically, but the tracing agent can be used to quickly identify the missing entries.

When using the agent to generate hints for a native image, there are a couple of approaches:

- Launch the application directly and exercise it.
- Run application tests to exercise the application.

The first option is interesting for identifying the missing hints when a library or a pattern is not recognized by Spring.

The second option sounds more appealing for a repeatable setup, but by default the generated hints will include anything required by the test infrastructure.
Some of these will be unnecessary when the application runs for real.
To address this problem the agent supports an access-filter file that will cause certain data to be excluded from the generated output.

### Launch the Application Directly

Use the following command to launch the application with the native image tracing agent attached:

```shell
$ java -Dspring.aot.enabled=true \
    -agentlib:native-image-agent=config-output-dir=/path/to/config-dir/ \
    -jar target/myproject-0.0.1-SNAPSHOT.jar
```

Now you can exercise the code paths you want to have hints for and then stop the application with `ctrl-c`.

On application shutdown the native image tracing agent will write the hint files to the given config output directory.
You can either manually inspect these files, or use them as input to the native image build process.
To use them as input, copy them into the `src/main/resources/META-INF/native-image/` directory.
The next time you build the native image, GraalVM will take these files into consideration.

There are more advanced options which can be set on the native image tracing agent, for example filtering the recorded hints by caller classes, etc.
For further reading, please see [the official documentation][r9].

## Custom Hints

If you need to provide your own hints for reflection, resources, serialization, proxy usage and so on, you can use the [`RuntimeHintsRegistrar`][r10] API.
Create a class that implements the [`RuntimeHintsRegistrar`][r10] interface, and then make appropriate calls to the provided [`RuntimeHints`][r11] instance:

```java
import java.lang.reflect.Method;

import org.springframework.aot.hint.ExecutableMode;
import org.springframework.aot.hint.RuntimeHints;
import org.springframework.aot.hint.RuntimeHintsRegistrar;
import org.springframework.util.ReflectionUtils;

public class MyRuntimeHints implements RuntimeHintsRegistrar {

	@Override
	public void registerHints(RuntimeHints hints, ClassLoader classLoader) {
		// Register method for reflection
		Method method = ReflectionUtils.findMethod(MyClass.class, "sayHello", String.class);
		hints.reflection().registerMethod(method, ExecutableMode.INVOKE);

		// Register type for java serialization
		hints.reflection().registerJavaSerialization(MySerializableClass.class);

		// Register resources
		hints.resources().registerPattern("my-resource.txt");

		// Register proxy
		hints.proxies().registerJdkProxy(MyInterface.class);
	}

}
```

You can then use [`@ImportRuntimeHints`][r12] on any [`@Configuration`][r13] class (for example your [`@SpringBootApplication`][r14] annotated application class) to activate those hints.

If you have classes which need binding (mostly needed when serializing or deserializing JSON), you can use [`@RegisterReflectionForBinding`][r15] on any bean.
Most of the hints are automatically inferred, for example when accepting or returning data from a [`@RestController`][r16] method.
But when you work with [`WebClient`][r17], [`RestClient`][r18] or [`RestTemplate`][r19] directly, you might need to use [`@RegisterReflectionForBinding`][r20].

### Testing Custom Hints

The [`RuntimeHintsPredicates`][r21] API can be used to test your hints.
The API provides methods that build a [`Predicate`][r22] that can be used to test a [`RuntimeHints`][r11] instance.

If you’re using AssertJ, your test would look like this:

```java
import org.junit.jupiter.api.Test;

import org.springframework.aot.hint.RuntimeHints;
import org.springframework.aot.hint.predicate.RuntimeHintsPredicates;
import org.springframework.boot.docs.packaging.nativeimage.advanced.customhints.MyRuntimeHints;

import static org.assertj.core.api.Assertions.assertThat;

class MyRuntimeHintsTests {

	@Test
	void shouldRegisterHints() {
		RuntimeHints hints = new RuntimeHints();
		new MyRuntimeHints().registerHints(hints, getClass().getClassLoader());
		assertThat(RuntimeHintsPredicates.resource().forResource("my-resource.txt")).accepts(hints);
	}

}
```

### Providing Hints Statically

If you prefer, custom hints can be provided statically in one or more GraalVM JSON hint files.
Such files should be placed in `src/main/resources/` within a `META-INF/native-image/*/*/` directory.
The [hints generated during AOT processing][r23] are written to a directory named `META-INF/native-image/{groupId}/{artifactId}/`.
Place your static hint files in a directory that does not clash with this location, such as `META-INF/native-image/{groupId}/{artifactId}-additional-hints/`.

## Known Limitations

GraalVM native images are an evolving technology and not all libraries provide support.
The GraalVM community is helping by providing [reachability metadata][r24] for projects that don’t yet ship their own.
Spring itself doesn’t contain hints for 3rd party libraries and instead relies on the reachability metadata project.

If you encounter problems when generating native images for Spring Boot applications, please check the [Spring Boot with GraalVM][r25] page of the Spring Boot wiki.
You can also contribute issues to the [spring-aot-smoke-tests][r26] project on GitHub which is used to confirm that common application types are working as expected.

If you find a library which doesn’t work with GraalVM, please raise an issue on the [reachability metadata project][r24].
