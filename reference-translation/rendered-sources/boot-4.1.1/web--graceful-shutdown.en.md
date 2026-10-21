# Graceful Shutdown

Graceful shutdown is enabled by default with all three embedded web servers (Jetty, Reactor Netty, and Tomcat) and with both reactive and servlet-based web applications.
It occurs as part of closing the application context and is performed in the earliest phase of stopping [`SmartLifecycle`][r1] beans.
This stop processing uses a timeout which provides a grace period during which existing requests will be allowed to complete but no new requests will be permitted.

To configure the timeout period, configure the `spring.lifecycle.timeout-per-shutdown-phase` property, as shown in the following example:

```properties
spring.lifecycle.timeout-per-shutdown-phase=20s
```

```yaml
spring:
  lifecycle:
    timeout-per-shutdown-phase: "20s"
```

> [IMPORTANT]
>
> Shutdown in your IDE may be immediate rather than graceful if it does not send a proper `SIGTERM` signal.
> See the documentation of your IDE for more details.

## Rejecting Requests During the Grace Period

The exact way in which new requests are not permitted varies depending on the web server that is being used.
Implementations may stop accepting requests at the network layer, or they may return a response with a specific HTTP status code or HTTP header.
The use of persistent connections can also change the way that requests stop being accepted.

> [TIP]
>
> To learn more about the specific method used with your web server, see the `shutDownGracefully` API documentation for [`TomcatWebServer.shutDownGracefully(GracefulShutdownCallback)`][r2], [`NettyWebServer.shutDownGracefully(GracefulShutdownCallback)`][r3], or [`JettyWebServer.shutDownGracefully(GracefulShutdownCallback)`][r4].

Jetty, Reactor Netty, and Tomcat will stop accepting new requests at the network layer.

## Disabling Graceful Shutdown

To disable graceful shutdown, configure the `server.shutdown` property, as shown in the following example:

```properties
server.shutdown=immediate
```

```yaml
server:
  shutdown: "immediate"
```
