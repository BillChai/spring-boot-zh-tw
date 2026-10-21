# JMS

[`ConnectionFactory`][r1] 提供標準方式，建立與 JMS broker 互動的 [`Connection`][r2]。雖然 Spring 使用 JMS 時需要 `ConnectionFactory`，但一般不必由應用程式直接操作，而能使用較高階的訊息抽象。詳見 Spring Framework 參考文件的[相關章節][r3]。Spring Boot 也會自動設定傳送與接收訊息所需的基礎設施。

## ActiveMQ Classic 支援

當 classpath 中有 [ActiveMQ Classic][r4] 時，Spring Boot 可以設定 [`ConnectionFactory`][r1]。如果 broker 也存在，且設定未指定 broker URL、也未停用內嵌 broker，則會自動啟動並設定內嵌 broker。

> **注意：**`spring-boot-starter-activemq` 提供連接 ActiveMQ Classic 所需的依賴，以及整合 JMS 的 Spring 基礎設施。再加入 `org.apache.activemq:activemq-broker`，即可使用內嵌 broker。

ActiveMQ Classic 的設定由 `spring.activemq.*` 外部化屬性控制。

如果 classpath 中有 `activemq-broker`，自動設定會使用 [VM transport][r5]，在同一個 JVM 實例內啟動 broker。

可透過 `spring.activemq.embedded.enabled` 停用內嵌 broker：

{{CODE_0}}

{{CODE_1}}

設定 broker URL 也會停用內嵌 broker：

{{CODE_2}}

{{CODE_3}}

若要完整控制內嵌 broker，請參閱 [ActiveMQ Classic 文件][r6]。

預設會以 [`CachingConnectionFactory`][r7] 包裝原生 [`ConnectionFactory`][r1]，並採用合理設定；可透過 `spring.jms.*` 調整：

{{CODE_4}}

{{CODE_5}}

如果偏好原生的連線集區，可加入 `org.messaginghub:pooled-jms`，並設定 [`JmsPoolConnectionFactory`][r8]：

{{CODE_6}}

{{CODE_7}}

> **提示：**其他選項請參閱 [`ActiveMQProperties`][r9]。也可以註冊任意數量的 [`ActiveMQConnectionFactoryCustomizer`][r10] Bean，進行進階客製。

預設情況下，ActiveMQ Classic 會建立尚不存在的 destination，因此會依提供的名稱解析目的地。

## ActiveMQ Artemis 支援

當偵測到 classpath 中有 [ActiveMQ Artemis][r11] 時，Spring Boot 能自動設定 [`ConnectionFactory`][r1]。如果 broker 存在，會自動啟動並設定內嵌 broker，除非已明確設定 mode 屬性。

支援的模式為 `embedded` 與 `native`：前者明確要求內嵌 broker，若 classpath 找不到就應報錯；後者使用 `netty` 傳輸協定連接 broker。使用 `native` 時，Spring Boot 會設定一個以預設值連接本機 broker 的 `ConnectionFactory`。

> **注意：**`spring-boot-starter-artemis` 提供連接既有 Artemis 實例所需的依賴，以及整合 JMS 的 Spring 基礎設施。加入 `org.apache.activemq:artemis-jakarta-server` 後，可使用內嵌模式。

Artemis 設定由 `spring.artemis.*` 外部化屬性控制。例如，可在 `application.properties` 宣告：

{{CODE_8}}

{{CODE_9}}

內嵌 broker 時，可以選擇是否啟用持久化，並列出應提供的目的地。可用逗號分隔清單，以預設選項建立；若要進階設定 queue 或 topic，則分別定義 [`JMSQueueConfiguration`][r12] 或 [`TopicConfiguration`][r13] Bean。

預設會以 [`CachingConnectionFactory`][r7] 包裝原生 [`ConnectionFactory`][r1]，並採用可透過 `spring.jms.*` 調整的合理設定：

{{CODE_10}}

{{CODE_11}}

若偏好原生連線集區，可加入 `org.messaginghub:pooled-jms`，並設定 [`JmsPoolConnectionFactory`][r8]：

{{CODE_12}}

{{CODE_13}}

其他選項請參閱 [`ArtemisProperties`][r14]。

此流程不涉及 JNDI 查詢；目的地依名稱解析，名稱來自 Artemis 設定的 `name` 屬性，或由設定提供。

## 使用 JNDI ConnectionFactory

如果應用程式執行於應用伺服器，Spring Boot 會嘗試透過 JNDI 尋找 JMS [`ConnectionFactory`][r1]，預設檢查 `java:/JmsXA` 與 `java:/XAConnectionFactory`。如需指定其他位置，請使用 `spring.jms.jndi-name`：

{{CODE_14}}

{{CODE_15}}

## 傳送訊息

Spring 的 [`JmsClient`][r15] 會自動設定，可直接注入自己的 Bean：

{{CODE_16}}

{{CODE_17}}

> **注意：**[`JmsMessagingTemplate`][r16] 也可用類似方式注入。兩者都使用傳統的 [`JmsTemplate`][r17]，後者也可直接注入。若定義 [`DestinationResolver`][r18] 或 [`MessageConverter`][r19] Bean，會自動與自動設定的 `JmsTemplate` 關聯。

## 接收訊息

當 JMS 基礎設施存在時，可以在 Bean 使用 [`@JmsListener`][r20] 建立監聽端點。若未定義 [`JmsListenerContainerFactory`][r21]，會自動設定預設工廠。若定義 [`DestinationResolver`][r18]、[`MessageConverter`][r19] 或 [`ExceptionListener`][r22] Bean，會自動與預設工廠關聯。

大多數情況下，訊息監聽器容器應使用原生 [`ConnectionFactory`][r1]。如此每個容器有自己的連線，也完整負責本身的復原工作。自動設定透過 [`ConnectionFactoryUnwrapper`][r23]，從自動設定的工廠解開原生連線工廠。

> **注意（原文）：**自動設定只會解開 `CachedConnectionFactory`。

> **譯者校對註：**這則原文提醒使用 `CachedConnectionFactory`，與前文連結類別 `CachingConnectionFactory` 的名稱不同；此處保留原文名稱供對照。

預設工廠具有交易能力。如果執行環境中有 [`JtaTransactionManager`][r24]，預設會將其關聯至監聽器容器；否則，會啟用 `sessionTransacted`。

在後者的情況，可在監聽方法或其委派的方法加上 [`@Transactional`][r25]，將本地資料儲存交易與接收訊息的處理關聯。這可確保本地交易完成後，才確認收到的訊息；也包含在相同 JMS session 上執行的回應訊息傳送。

下例在 `someQueue` 目的地建立監聽端點：

{{CODE_18}}

{{CODE_19}}

> **提示：**更多資訊請參閱 [`@EnableJms`][r26] API 文件。

若需要建立更多 [`JmsListenerContainerFactory`][r21] 實例，或覆寫預設工廠，Spring Boot 提供 [`DefaultJmsListenerContainerFactoryConfigurer`][r27]，可使用與自動設定相同的設定，初始化 [`DefaultJmsListenerContainerFactory`][r28]。

例如，下列設定提供另一個使用特定 [`MessageConverter`][r19] 的工廠：

{{CODE_20}}

{{CODE_21}}

> **注意：**此例使用 [`ConnectionFactoryUnwrapper`][r23]，以與自動設定工廠相同的方式，將原生連線工廠關聯至訊息監聽器容器。

接著可在任何帶有 [`@JmsListener`][r20] 的方法使用它：

{{CODE_22}}

{{CODE_23}}

類似 `DefaultJmsListenerContainerFactoryConfigurer`，Spring Boot 也提供 [`SimpleJmsListenerContainerFactoryConfigurer`][r29]，可初始化 [`SimpleJmsListenerContainerFactory`][r30]，並套用自動設定提供的相關設定。

> **提示：**[`DefaultMessageListenerContainer`][r31] 使用拉取式機制（輪詢）處理訊息；相較之下，[`SimpleMessageListenerContainer`][r32] 使用推送式機制，更接近獨立 JMS 規範的設計精神。兩者差異請參閱各自的 Javadoc 與 [Spring Framework 參考文件][r33]。
