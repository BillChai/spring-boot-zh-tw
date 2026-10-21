# Monitoring and Management Over HTTP

If you are developing a web application, Spring Boot Actuator auto-configures all enabled endpoints to be exposed over HTTP.
The default convention is to use the `id` of the endpoint with a prefix of `/actuator` as the URL path.
For example, `health` is exposed as `/actuator/health`.

> [TIP]
>
> Actuator is supported natively with Spring MVC, Spring WebFlux, and Jersey.
> If both Jersey and Spring MVC are available, Spring MVC is used.

> [NOTE]
>
> Jackson is a required dependency in order to get the correct JSON responses as documented in the [API documentation][r1].
> Jackson 3 should be used for Spring MVC and Spring WebFlux.
> Jersey does not yet have a Jackson 3 module, so you will need to use Jackson 2.

## Customizing the Management Endpoint Paths

Sometimes, it is useful to customize the prefix for the management endpoints.
For example, your application might already use `/actuator` for another purpose.
You can use the `management.endpoints.web.base-path` property to change the prefix for your management endpoint, as the following example shows:

```properties
management.endpoints.web.base-path=/manage
```

```yaml
management:
  endpoints:
    web:
      base-path: "/manage"
```

The preceding `application.properties` example changes the endpoint from `/actuator/{id}` to `/manage/{id}` (for example, `/manage/info`).

> [NOTE]
>
> Unless the management port has been configured to [expose endpoints by using a different HTTP port][r2], `management.endpoints.web.base-path` is relative to `server.servlet.context-path` (for servlet web applications) or `spring.webflux.base-path` (for reactive web applications).
> If `management.server.port` is configured, `management.endpoints.web.base-path` is relative to `management.server.base-path`.

If you want to map endpoints to a different path, you can use the `management.endpoints.web.path-mapping` property.

The following example remaps `/actuator/health` to `/healthcheck`:

```properties
management.endpoints.web.base-path=/
management.endpoints.web.path-mapping.health=healthcheck
```

```yaml
management:
  endpoints:
    web:
      base-path: "/"
      path-mapping:
        health: "healthcheck"
```

## Customizing the Management Server Port

Exposing management endpoints by using the default HTTP port is a sensible choice for cloud-based deployments.
If, however, your application runs inside your own data center, you may prefer to expose endpoints by using a different HTTP port.

You can set the `management.server.port` property to change the HTTP port, as the following example shows:

```properties
management.server.port=8081
```

```yaml
management:
  server:
    port: 8081
```

> [NOTE]
>
> On Cloud Foundry, by default, applications receive requests only on port 8080 for both HTTP and TCP routing.
> If you want to use a custom management port on Cloud Foundry, you need to explicitly set up the application’s routes to forward traffic to the custom port.

## Configuring Management-specific SSL

When configured to use a custom port, you can also configure the management server with its own SSL by using the various `management.server.ssl.*` properties.
For example, doing so lets a management server be available over HTTP while the main application uses HTTPS, as the following property settings show:

```properties
server.port=8443
server.ssl.enabled=true
server.ssl.key-store=classpath:store.jks
server.ssl.key-password=secret
management.server.port=8080
management.server.ssl.enabled=false
```

```yaml
server:
  port: 8443
  ssl:
    enabled: true
    key-store: "classpath:store.jks"
    key-password: "secret"
management:
  server:
    port: 8080
    ssl:
      enabled: false
```

Alternatively, both the main server and the management server can use SSL but with different key stores, as follows:

```properties
server.port=8443
server.ssl.enabled=true
server.ssl.key-store=classpath:main.jks
server.ssl.key-password=secret
management.server.port=8080
management.server.ssl.enabled=true
management.server.ssl.key-store=classpath:management.jks
management.server.ssl.key-password=secret
```

```yaml
server:
  port: 8443
  ssl:
    enabled: true
    key-store: "classpath:main.jks"
    key-password: "secret"
management:
  server:
    port: 8080
    ssl:
      enabled: true
      key-store: "classpath:management.jks"
      key-password: "secret"
```

## Customizing the Management Server Address

You can customize the address on which the management endpoints are available by setting the `management.server.address` property.
Doing so can be useful if you want to listen only on an internal or ops-facing network or to listen only for connections from `localhost`.

> [NOTE]
>
> You can listen on a different address only when the port differs from the main server port.

The following example `application.properties` does not allow remote management connections:

```properties
management.server.port=8081
management.server.address=127.0.0.1
```

```yaml
management:
  server:
    port: 8081
    address: "127.0.0.1"
```

## Disabling HTTP Endpoints

If you do not want to expose endpoints over HTTP, you can set the management port to `-1`, as the following example shows:

```properties
management.server.port=-1
```

```yaml
management:
  server:
    port: -1
```

You can also achieve this by using the `management.endpoints.web.exposure.exclude` property, as the following example shows:

```properties
management.endpoints.web.exposure.exclude=*
```

```yaml
management:
  endpoints:
    web:
      exposure:
        exclude: "*"
```
