# AMQP

The Advanced Message Queuing Protocol (AMQP) is a platform-neutral, wire-level protocol for message-oriented middleware.
The Spring AMQP project applies core Spring concepts to the development of AMQP-based messaging solutions.
Spring Boot offers several conveniences for working with AMQP through RabbitMQ, including the `spring-boot-starter-amqp` starter.

## RabbitMQ Support

[RabbitMQ][r1] is a lightweight, reliable, scalable, and portable message broker based on the AMQP protocol.
Spring uses RabbitMQ to communicate through the AMQP protocol.

RabbitMQ configuration is controlled by external configuration properties in `spring.rabbitmq.*`.
For example, you might declare the following section in `application.properties`:

{{CODE_0}}

{{CODE_1}}

Alternatively, you could configure the same connection using the `addresses` attribute:

{{CODE_2}}

{{CODE_3}}

> [NOTE]
>
> When specifying addresses that way, the `host` and `port` properties are ignored.
> If the address uses the `amqps` protocol, SSL support is enabled automatically.

See [`RabbitProperties`][r2] for more of the supported property-based configuration options.
To configure lower-level details of the RabbitMQ [`ConnectionFactory`][r3] that is used by Spring AMQP, define a [`ConnectionFactoryCustomizer`][r4] bean.

If a [`ConnectionNameStrategy`][r5] bean exists in the context, it will be automatically used to name connections created by the auto-configured [`CachingConnectionFactory`][r6].

To make an application-wide, additive customization to the [`RabbitTemplate`][r7], use a [`RabbitTemplateCustomizer`][r8] bean.

> [TIP]
>
> See [Understanding AMQP, the protocol used by RabbitMQ][r9] for more details.

## Sending a Message

Spring’s [`AmqpTemplate`][r10] and [`AmqpAdmin`][r11] are auto-configured, and you can autowire them directly into your own beans, as shown in the following example:

{{CODE_4}}

{{CODE_5}}

> [NOTE]
>
> [`RabbitMessagingTemplate`][r12] can be injected in a similar manner.
> If a [`MessageConverter`][r13] bean is defined, it is associated automatically to the auto-configured [`AmqpTemplate`][r10].

If necessary, any [`Queue`][r14] that is defined as a bean is automatically used to declare a corresponding queue on the RabbitMQ instance.

To retry operations, you can enable retries on the [`AmqpTemplate`][r10] (for example, in the event that the broker connection is lost):

{{CODE_6}}

{{CODE_7}}

Retries are disabled by default.
You can also customize the [`RetryTemplate`][r15] programmatically by declaring a [`RabbitTemplateRetrySettingsCustomizer`][r16] bean.

If you need to create more [`RabbitTemplate`][r7] instances or if you want to override the default, Spring Boot provides a [`RabbitTemplateConfigurer`][r17] bean that you can use to initialize a [`RabbitTemplate`][r7] with the same settings as the factories used by the auto-configuration.

If there’s a bean of type [`RabbitTemplateObservationConvention`][r18] in the context, it will automatically be configured on the [`RabbitTemplate`][r7].

## Sending a Message To A Stream

To send a message to a particular stream, specify the name of the stream, as shown in the following example:

{{CODE_8}}

{{CODE_9}}

If a [`MessageConverter`][r13], [`StreamMessageConverter`][r19], [`ProducerCustomizer`][r20] or [`RabbitStreamTemplateObservationConvention`][r21] bean is defined, it is associated automatically to the auto-configured [`RabbitStreamTemplate`][r22].

If you need to create more [`RabbitStreamTemplate`][r22] instances or if you want to override the default, Spring Boot provides a [`RabbitStreamTemplateConfigurer`][r23] bean that you can use to initialize a [`RabbitStreamTemplate`][r22] with the same settings as the factories used by the auto-configuration.

### SSL

To use SSL with RabbitMQ Streams, set `spring.rabbitmq.stream.ssl.enabled` to `true` or set `spring.rabbitmq.stream.ssl.bundle` to configure the [SSL bundle][r24] to use.

## Receiving a Message

When the Rabbit infrastructure is present, any bean can be annotated with [`@RabbitListener`][r25] to create a listener endpoint.
If no [`RabbitListenerContainerFactory`][r26] has been defined, a default [`SimpleRabbitListenerContainerFactory`][r27] is automatically configured and you can switch to a direct container using the `spring.rabbitmq.listener.type` property.
If a [`MessageConverter`][r13], a [`MessageRecoverer`][r28] or a [`RabbitListenerObservationConvention`][r29] bean is defined, it is automatically associated with the default factory.

The following sample component creates a listener endpoint on the `someQueue` queue:

{{CODE_10}}

{{CODE_11}}

> [TIP]
>
> See [`@EnableRabbit`][r30] for more details.

If you need to create more [`RabbitListenerContainerFactory`][r26] instances or if you want to override the default, Spring Boot provides a [`SimpleRabbitListenerContainerFactoryConfigurer`][r31] and a [`DirectRabbitListenerContainerFactoryConfigurer`][r32] that you can use to initialize a [`SimpleRabbitListenerContainerFactory`][r27] and a [`DirectRabbitListenerContainerFactory`][r33] with the same settings as the factories used by the auto-configuration.

> [TIP]
>
> It does not matter which container type you chose.
> Those two beans are exposed by the auto-configuration.

For instance, the following configuration class exposes another factory that uses a specific [`MessageConverter`][r13]:

{{CODE_12}}

{{CODE_13}}

Then you can use the factory in any [`@RabbitListener`][r25]-annotated method, as follows:

{{CODE_14}}

{{CODE_15}}

You can enable retries to handle situations where your listener throws an exception.
By default, [`RejectAndDontRequeueRecoverer`][r34] is used, but you can define a [`MessageRecoverer`][r28] of your own.
When retries are exhausted, the message is rejected and either dropped or routed to a dead-letter exchange if the broker is configured to do so.
By default, retries are disabled.
You can also customize the [`RetryPolicy`][r35] programmatically by declaring a [`RabbitListenerRetrySettingsCustomizer`][r36] bean.

> [IMPORTANT]
>
> By default, if retries are disabled and the listener throws an exception, the delivery is retried indefinitely.
> You can modify this behavior in two ways: Set the `defaultRequeueRejected` property to `false` so that zero re-deliveries are attempted or throw an [`AmqpRejectAndDontRequeueException`][r37] to signal the message should be rejected.
> The latter is the mechanism used when retries are enabled and the maximum number of delivery attempts is reached.
