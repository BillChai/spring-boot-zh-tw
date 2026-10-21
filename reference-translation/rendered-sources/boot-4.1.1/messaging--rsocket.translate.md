# RSocket

[RSocket][r1] is a binary protocol for use on byte stream transports.
It enables symmetric interaction models through async message passing over a single connection.

The `spring-messaging` module of the Spring Framework provides support for RSocket requesters and responders, both on the client and on the server side.
See the [RSocket section][r2] of the Spring Framework reference for more details, including an overview of the RSocket protocol.

## RSocket Strategies Auto-configuration

Spring Boot auto-configures an [`RSocketStrategies`][r3] bean that provides all the required infrastructure for encoding and decoding RSocket payloads.
By default, the auto-configuration will try to configure the following (in order):

1. [CBOR][r4] codecs with Jackson
2. JSON codecs with Jackson

The `spring-boot-starter-rsocket` starter provides both dependencies.
See the [Jackson support section][r5] to know more about customization possibilities.

Developers can customize the [`RSocketStrategies`][r3] component by creating beans that implement the [`RSocketStrategiesCustomizer`][r6] interface.
Note that their [`@Order`][r7] is important, as it determines the order of codecs.

## RSocket Server Auto-configuration

Spring Boot provides RSocket server auto-configuration.
The required dependencies are provided by the `spring-boot-starter-rsocket`.

Spring Boot allows exposing RSocket over WebSocket from a WebFlux server, or standing up an independent RSocket server.
This depends on the type of application and its configuration.

For WebFlux application (that is of type [`WebApplicationType.REACTIVE`][r8]), the RSocket server will be plugged into the Web Server only if the following properties match:

{{CODE_0}}

{{CODE_1}}

> [WARNING]
>
> Plugging RSocket into a web server is only supported with Reactor Netty, as RSocket itself is built with that library.

Alternatively, an RSocket TCP or websocket server is started as an independent, embedded server.
Besides the dependency requirements, the only required configuration is to define a port for that server:

{{CODE_2}}

{{CODE_3}}

## Spring Messaging RSocket Support

Spring Boot will auto-configure the Spring Messaging infrastructure for RSocket.

This means that Spring Boot will create a [`RSocketMessageHandler`][r9] bean that will handle RSocket requests to your application.

> [TIP]
>
> You can use [`@ControllerAdvice`][r10] to handle exceptions.

## Calling RSocket Services with RSocketRequester

Once the [`RSocket`][r11] channel is established between server and client, any party can send or receive requests to the other.

As a server, you can get injected with an [`RSocketRequester`][r12] instance on any handler method of an RSocket [`@Controller`][r13].
As a client, you need to configure and establish an RSocket connection first.
Spring Boot auto-configures an [`RSocketRequester.Builder`][r14] for such cases with the expected codecs and applies any [`RSocketConnectorConfigurer`][r15] bean.

The [`RSocketRequester.Builder`][r14] instance is a prototype bean, meaning each injection point will provide you with a new instance .
This is done on purpose since this builder is stateful and you should not create requesters with different setups using the same instance.

The following code shows a typical example:

{{CODE_4}}

{{CODE_5}}
