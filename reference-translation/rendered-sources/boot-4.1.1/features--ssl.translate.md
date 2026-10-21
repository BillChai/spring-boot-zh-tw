# SSL

Spring Boot provides the ability to configure SSL trust material that can be applied to several types of connections in order to support secure communications.
Configuration properties with the prefix `spring.ssl.bundle` can be used to specify named sets of trust material and associated information.

## Configuring SSL With Java KeyStore Files

Configuration properties with the prefix `spring.ssl.bundle.jks` can be used to configure bundles of trust material created with the Java `keytool` utility and stored in Java KeyStore files in the JKS or PKCS12 format.
Each bundle has a user-provided name that can be used to reference the bundle.

When used to secure an embedded web server, a `keystore` is typically configured with a Java KeyStore containing a certificate and private key as shown in this example:

{{CODE_0}}

{{CODE_1}}

When used to secure a client-side connection, a `truststore` is typically configured with a Java KeyStore containing the server certificate as shown in this example:

{{CODE_2}}

{{CODE_3}}

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

{{CODE_4}}

{{CODE_5}}

When used to secure a client-side connection, a `truststore` is typically configured with the server certificate as shown in this example:

{{CODE_6}}

{{CODE_7}}

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
{{CODE_8}}
>
{{CODE_9}}

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

{{CODE_10}}

{{CODE_11}}

## Reloading SSL bundles

SSL bundles can be reloaded when the key material changes.
The component consuming the bundle has to be compatible with reloadable SSL bundles.
Currently the following components are compatible:

- Tomcat web server
- Netty web server

To enable reloading, you need to opt-in via a configuration property as shown in this example:

{{CODE_12}}

{{CODE_13}}

A file watcher is then watching the files and if they change, the SSL bundle will be reloaded.
This in turn triggers a reload in the consuming component, e.g. Tomcat rotates the certificates in the SSL enabled connectors.

You can configure the quiet period (to make sure that there are no more changes) of the file watcher with the `spring.ssl.bundle.watch.file.quiet-period` property.

### Reloading SSL Bundles With Let’s Encrypt

If you use certificates issued by [Let’s Encrypt][r16] and renewed by an external tool, such as [Certbot][r17], you can configure a PEM bundle to use the generated files and enable reloading.
Certbot typically stores these in `/etc/letsencrypt/live/` under a directory named after your domain.
The following example shows how to configure a PEM bundle for `example.com`:

{{CODE_14}}

{{CODE_15}}

Spring Boot does not request or renew Let’s Encrypt certificates.
When Certbot or another ACME client updates the configured files, the SSL bundle is reloaded.
Compatible consumers, such as Tomcat and Netty web servers, can then use the updated certificate without restarting the application.

The files in `/etc/letsencrypt/live` are typically symbolic links to files in `/etc/letsencrypt/archive`.
The file watcher follows symbolic links so that updates to the target files can trigger a reload.
