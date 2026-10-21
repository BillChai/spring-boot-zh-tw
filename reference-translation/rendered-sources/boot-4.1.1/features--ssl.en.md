# SSL

Spring Boot provides the ability to configure SSL trust material that can be applied to several types of connections in order to support secure communications.
Configuration properties with the prefix `spring.ssl.bundle` can be used to specify named sets of trust material and associated information.

## Configuring SSL With Java KeyStore Files

Configuration properties with the prefix `spring.ssl.bundle.jks` can be used to configure bundles of trust material created with the Java `keytool` utility and stored in Java KeyStore files in the JKS or PKCS12 format.
Each bundle has a user-provided name that can be used to reference the bundle.

When used to secure an embedded web server, a `keystore` is typically configured with a Java KeyStore containing a certificate and private key as shown in this example:

```properties
spring.ssl.bundle.jks.mybundle.key.alias=application
spring.ssl.bundle.jks.mybundle.keystore.location=classpath:application.p12
spring.ssl.bundle.jks.mybundle.keystore.password=secret
spring.ssl.bundle.jks.mybundle.keystore.type=PKCS12
```

```yaml
spring:
  ssl:
    bundle:
      jks:
        mybundle:
          key:
            alias: "application"
          keystore:
            location: "classpath:application.p12"
            password: "secret"
            type: "PKCS12"
```

When used to secure a client-side connection, a `truststore` is typically configured with a Java KeyStore containing the server certificate as shown in this example:

```properties
spring.ssl.bundle.jks.mybundle.truststore.location=classpath:server.p12
spring.ssl.bundle.jks.mybundle.truststore.password=secret
```

```yaml
spring:
  ssl:
    bundle:
      jks:
        mybundle:
          truststore:
            location: "classpath:server.p12"
            password: "secret"
```

> [TIP]
>
> Rather than the location to a file, its [Base64 encoded content][r1] can be provided.
> If you chose this option, the value of the property should start with `base64:`.

See [`JksSslBundleProperties`][r2] for the full set of supported properties.

> [NOTE]
>
> If you’re using environment variables to configure the bundle, the name of the bundle is [always converted to lowercase][r3].

## Configuring SSL With PEM-encoded Certificates

Configuration properties with the prefix `spring.ssl.bundle.pem` can be used to configure bundles of trust material in the form of PEM-encoded text.
Each bundle has a user-provided name that can be used to reference the bundle.

When used to secure an embedded web server, a `keystore` is typically configured with a certificate and private key as shown in this example:

```properties
spring.ssl.bundle.pem.mybundle.keystore.certificate=classpath:application.crt
spring.ssl.bundle.pem.mybundle.keystore.private-key=classpath:application.key
```

```yaml
spring:
  ssl:
    bundle:
      pem:
        mybundle:
          keystore:
            certificate: "classpath:application.crt"
            private-key: "classpath:application.key"
```

When used to secure a client-side connection, a `truststore` is typically configured with the server certificate as shown in this example:

```properties
spring.ssl.bundle.pem.mybundle.truststore.certificate=classpath:server.crt
```

```yaml
spring:
  ssl:
    bundle:
      pem:
        mybundle:
          truststore:
            certificate: "classpath:server.crt"
```

> [TIP]
>
> Rather than the location to a file, its [Base64 encoded content][r1] can be provided.
> If you chose this option, the value of the property should start with `base64:`.
>
> PEM content can also be used directly for both the `certificate` and `private-key` properties.
> If the property values contain `BEGIN` and `END` markers then they will be treated as PEM content rather than a resource location.
>
> The following example shows how a truststore certificate can be defined:
>
> ```properties
> spring.ssl.bundle.pem.mybundle.truststore.certificate=\
> -----BEGIN CERTIFICATE-----\n\
> MIID1zCCAr+gAwIBAgIUNM5QQv8IzVQsgSmmdPQNaqyzWs4wDQYJKoZIhvcNAQEL\n\
> BQAwezELMAkGA1UEBhMCWFgxEjAQBgNVBAgMCVN0YXRlTmFtZTERMA8GA1UEBwwI\n\
> ...\n\
> V0IJjcmYjEZbTvpjFKznvaFiOUv+8L7jHQ1/Yf+9c3C8gSjdUfv88m17pqYXd+Ds\n\
> HEmfmNNjht130UyjNCITmLVXyy5p35vWmdf95U3uEbJSnNVtXH8qRmN9oK9mUpDb\n\
> ngX6JBJI7fw7tXoqWSLHNiBODM88fUlQSho8\n\
> -----END CERTIFICATE-----
> ```
>
> ```yaml
> spring:
>   ssl:
>     bundle:
>       pem:
>         mybundle:
>           truststore:
>             certificate: |
>               -----BEGIN CERTIFICATE-----
>               MIID1zCCAr+gAwIBAgIUNM5QQv8IzVQsgSmmdPQNaqyzWs4wDQYJKoZIhvcNAQEL
>               BQAwezELMAkGA1UEBhMCWFgxEjAQBgNVBAgMCVN0YXRlTmFtZTERMA8GA1UEBwwI
>               ...
>               V0IJjcmYjEZbTvpjFKznvaFiOUv+8L7jHQ1/Yf+9c3C8gSjdUfv88m17pqYXd+Ds
>               HEmfmNNjht130UyjNCITmLVXyy5p35vWmdf95U3uEbJSnNVtXH8qRmN9oK9mUpDb
>               ngX6JBJI7fw7tXoqWSLHNiBODM88fUlQSho8
>               -----END CERTIFICATE-----
> ```

See [`PemSslBundleProperties`][r4] for the full set of supported properties.

> [NOTE]
>
> If you’re using environment variables to configure the bundle, the name of the bundle is [always converted to lowercase][r3].

## Applying SSL Bundles

Once configured using properties, SSL bundles can be referred to by name in configuration properties for various types of connections that are auto-configured by Spring Boot.
See the sections on [embedded web servers][r5], [data technologies][r6], and [REST clients][r7] for further information.

## Using SSL Bundles

Spring Boot auto-configures a bean of type [`SslBundles`][r8] that provides access to each of the named bundles configured using the `spring.ssl.bundle` properties.

An [`SslBundle`][r9] can be retrieved from the auto-configured [`SslBundles`][r8] bean and used to create objects that are used to configure SSL connectivity in client libraries.
The [`SslBundle`][r9] provides a layered approach of obtaining these SSL objects:

- `getStores()` provides access to the key store and trust store [`KeyStore`][r10] instances as well as any required key store password.
- `getManagers()` provides access to the [`KeyManagerFactory`][r11] and [`TrustManagerFactory`][r12] instances as well as the [`KeyManager`][r13] and [`TrustManager`][r14] arrays that they create.
- `createSslContext()` provides a convenient way to obtain a new [`SSLContext`][r15] instance.

In addition, the [`SslBundle`][r9] provides details about the key being used, the protocol to use and any option that should be applied to the SSL engine.

The following example shows retrieving an [`SslBundle`][r9] and using it to create an [`SSLContext`][r15]:

```kotlin
import org.springframework.boot.ssl.SslBundles
import org.springframework.stereotype.Component

@Component
class MyComponent(sslBundles: SslBundles) {

    init {
        val sslBundle = sslBundles.getBundle("mybundle")
        val sslContext = sslBundle.createSslContext()
        // do something with the created sslContext
    }

}
```

```java
import javax.net.ssl.SSLContext;

import org.springframework.boot.ssl.SslBundle;
import org.springframework.boot.ssl.SslBundles;
import org.springframework.stereotype.Component;

@Component
public class MyComponent {

	public MyComponent(SslBundles sslBundles) {
		SslBundle sslBundle = sslBundles.getBundle("mybundle");
		SSLContext sslContext = sslBundle.createSslContext();
		// do something with the created sslContext
	}

}
```

## Reloading SSL bundles

SSL bundles can be reloaded when the key material changes.
The component consuming the bundle has to be compatible with reloadable SSL bundles.
Currently the following components are compatible:

- Tomcat web server
- Netty web server

To enable reloading, you need to opt-in via a configuration property as shown in this example:

```properties
spring.ssl.bundle.pem.mybundle.reload-on-update=true
spring.ssl.bundle.pem.mybundle.keystore.certificate=file:/some/directory/application.crt
spring.ssl.bundle.pem.mybundle.keystore.private-key=file:/some/directory/application.key
```

```yaml
spring:
  ssl:
    bundle:
      pem:
        mybundle:
          reload-on-update: true
          keystore:
            certificate: "file:/some/directory/application.crt"
            private-key: "file:/some/directory/application.key"
```

A file watcher is then watching the files and if they change, the SSL bundle will be reloaded.
This in turn triggers a reload in the consuming component, e.g. Tomcat rotates the certificates in the SSL enabled connectors.

You can configure the quiet period (to make sure that there are no more changes) of the file watcher with the `spring.ssl.bundle.watch.file.quiet-period` property.

### Reloading SSL Bundles With Let’s Encrypt

If you use certificates issued by [Let’s Encrypt][r16] and renewed by an external tool, such as [Certbot][r17], you can configure a PEM bundle to use the generated files and enable reloading.
Certbot typically stores these in `/etc/letsencrypt/live/` under a directory named after your domain.
The following example shows how to configure a PEM bundle for `example.com`:

```properties
spring.ssl.bundle.pem.webserver.reload-on-update=true
spring.ssl.bundle.pem.webserver.keystore.certificate=file:/etc/letsencrypt/live/example.com/fullchain.pem
spring.ssl.bundle.pem.webserver.keystore.private-key=file:/etc/letsencrypt/live/example.com/privkey.pem
server.ssl.bundle=webserver
```

```yaml
spring:
  ssl:
    bundle:
      pem:
        webserver:
          reload-on-update: true
          keystore:
            certificate: "file:/etc/letsencrypt/live/example.com/fullchain.pem"
            private-key: "file:/etc/letsencrypt/live/example.com/privkey.pem"
server:
  ssl:
    bundle: "webserver"
```

Spring Boot does not request or renew Let’s Encrypt certificates.
When Certbot or another ACME client updates the configured files, the SSL bundle is reloaded.
Compatible consumers, such as Tomcat and Netty web servers, can then use the updated certificate without restarting the application.

The files in `/etc/letsencrypt/live` are typically symbolic links to files in `/etc/letsencrypt/archive`.
The file watcher follows symbolic links so that updates to the target files can trigger a reload.
