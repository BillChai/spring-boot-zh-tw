# 訊息傳遞

<!-- source-attribution -->
> **非官方繁體中文翻譯** · Spring Boot 4.1.1 · 翻譯日期：2026-10-21  
> [官方英文網站](https://docs.spring.io/spring-boot/4.1/reference/messaging/index.html) · [固定版本英文來源](https://github.com/spring-projects/spring-boot/blob/v4.1.1/documentation/spring-boot-docs/src/docs/antora/modules/reference/pages/messaging/index.adoc) · [本地原文快照](../sources/spring-boot/documentation/spring-boot-docs/src/docs/antora/modules/reference/pages/messaging/index.adoc)  
> 原始作者與授權見 [來源聲明](../NOTICE.md)。官方範例及設定鍵保留原文，額外圖解另標示為譯者補充。

<!-- translation-status: translated -->

Spring Framework 提供廣泛的訊息系統整合能力，從使用 [`JmsClient`][messaging--index-r1] 簡化 JMS API 操作，到完整的非同步訊息接收基礎設施。Spring AMQP 為 Advanced Message Queuing Protocol 提供類似功能。Spring Boot 也提供 [`RabbitTemplate`][messaging--index-r2] 與 RabbitMQ 的自動設定選項。

Spring WebSocket 原生支援 STOMP 訊息傳遞，Spring Boot 則透過 starter 與少量自動設定加以支援。此外，Spring Boot 也支援 Apache Kafka 與 Apache Pulsar。

[messaging--index-r1]: https://docs.spring.io/spring-framework/docs/7.0.x/javadoc-api/org/springframework/jms/core/JmsClient.html
[messaging--index-r2]: https://docs.spring.io/spring-amqp/docs/4.1.x/api/org/springframework/amqp/rabbit/core/RabbitTemplate.html
