# Apache Pulsar 支援

Spring Boot 透過 [Spring for Apache Pulsar][r2] 專案的自動設定，支援 [Apache Pulsar][r1]。

當 classpath 中包含 `org.springframework.pulsar:spring-pulsar` 時，Spring Boot 會自動設定並註冊 Spring for Apache Pulsar 元件。

可使用 `spring-boot-starter-pulsar`，方便地取得所需依賴。

## 連接 Pulsar

使用 Pulsar starter 時，Spring Boot 會自動設定並註冊 [`PulsarClient`][r3] Bean。

應用程式預設會連接 `pulsar://localhost:6650` 的本機 Pulsar；可透過 `spring.pulsar.client.service-url` 調整。

> **注意：**值必須是有效的 [Pulsar Protocol URL][r4]。

可使用任何 `spring.pulsar.client.*` 前綴的應用程式屬性設定用戶端。若需要更精細的控制，可註冊一個或多個 [`PulsarClientBuilderCustomizer`][r5] Bean。

### 身分驗證

連接需要身分驗證的 Pulsar 叢集時，必須設定 `pluginClassName`，指定要使用的驗證外掛，並提供外掛所需參數。參數可用「參數名稱到參數值」的 map 設定。以下是 `AuthenticationOAuth2` 範例：

{{CODE_0}}

{{CODE_1}}

> **注意：**`spring.pulsar.client.authentication.param.*` 下的名稱，必須與驗證外掛預期的名稱完全一致，通常採 camelCase。Spring Boot 不會對這些項目進行寬鬆繫結。
>
> 例如，設定 `AuthenticationOAuth2` 的 issuer URL 時，必須使用 `spring.pulsar.client.authentication.param.issuerUrl`。如果使用 `issuerurl` 或 `issuer-url`，設定不會套用到外掛。
>
> 因為沒有寬鬆繫結，透過環境變數設定驗證參數也會遇到問題：轉換過程會失去大小寫區別。如果使用環境變數，必須依照 Spring for Apache Pulsar 文件的[這些步驟][r6]處理，才能正確運作。

### SSL

Pulsar 用戶端預設以明文與 Pulsar 服務通訊。若要啟用 TLS 加密，請依照 Spring for Apache Pulsar 文件的[這些步驟][r7]。

用戶端與驗證的完整說明，請參閱 [Spring for Apache Pulsar 參考文件][r8]。

## 連接 Pulsar Administration

Spring for Apache Pulsar 的 [`PulsarAdministration`][r9] 用戶端也會自動設定。

應用程式預設連接 `http://localhost:8080` 的本機 Pulsar。可將 `spring.pulsar.admin.service-url` 改成其他 `(http|https)://<host>:<port>` 格式的值。

若需要更精細的控制，可註冊一個或多個 [`PulsarAdminBuilderCustomizer`][r10] Bean。

### 身分驗證

存取需要驗證的 Pulsar 叢集時，admin 用戶端需要與一般 Pulsar 用戶端相同的安全設定。可以沿用前述[驗證設定][r11]，將 `spring.pulsar.client.authentication` 改成 `spring.pulsar.admin.authentication`。

> **提示：**若要在啟動時建立 topic，請加入 [`PulsarTopic`][r12] Bean。如果 topic 已存在，就會忽略該 Bean。

## 傳送訊息

Spring 的 [`PulsarTemplate`][r13] 會自動設定，可用來傳送訊息：

{{CODE_2}}

{{CODE_3}}

`PulsarTemplate` 依靠 [`PulsarProducerFactory`][r14] 建立底層 Pulsar producer。Spring Boot 自動設定也會提供此工廠，且預設會快取建立的 producer。可透過 `spring.pulsar.producer.*` 與 `spring.pulsar.producer.cache.*` 設定工廠及快取。

若需要更精細地控制 producer 工廠，可註冊一個或多個 [`ProducerBuilderCustomizer`][r15] Bean；它們會套用至所有建立的 producer。也可以在傳送訊息時傳入 `ProducerBuilderCustomizer`，只影響當前 producer。

若要更精細地控制要傳送的訊息，可在傳送時傳入 [`TypedMessageBuilderCustomizer`][r16]。

## 接收訊息

當 Apache Pulsar 基礎設施存在時，可在 Bean 使用 [`@PulsarListener`][r17] 建立監聽端點。下例在 `someTopic` 建立監聽端點：

{{CODE_4}}

{{CODE_5}}

Spring Boot 自動設定提供 `PulsarListener` 所需的全部元件，例如 [`PulsarListenerContainerFactory`][r18]，以及它用來建立底層 consumer 的 consumer 工廠。可透過 `spring.pulsar.listener.*` 與 `spring.pulsar.consumer.*` 設定。

若要更精細地控制 consumer 工廠，可註冊一個或多個 [`ConsumerBuilderCustomizer`][r19] Bean。它們會套用至工廠建立的所有 consumer，因此影響所有 `@PulsarListener`。也可以設定 `@PulsarListener` 的 `consumerCustomizer` 屬性，只客製單一監聽器。

若要更精細地控制容器工廠本身，可註冊一個或多個 `PulsarContainerFactoryCustomizer<ConcurrentPulsarListenerContainerFactory<?>>` Bean。

## 讀取訊息

Pulsar reader 介面讓應用程式自行管理游標。使用 reader 連接 topic 時，必須指定連線後從哪一則訊息開始讀取。

當 Pulsar 基礎設施存在時，可在 Bean 使用 [`@PulsarReader`][r20]，透過 reader 消費訊息。下例建立 reader 端點，從 `someTopic` 的開頭開始讀取：

{{CODE_6}}

{{CODE_7}}

`@PulsarReader` 依靠 [`PulsarReaderFactory`][r21] 建立底層 reader。Spring Boot 會自動提供此工廠，可透過 `spring.pulsar.reader.*` 客製。

若需要更精細的控制，可註冊一個或多個 [`ReaderBuilderCustomizer`][r22] Bean。它們會套用至工廠建立的所有 reader，因此影響所有 `@PulsarReader`。也可以設定 `@PulsarReader` 的 `readerCustomizer`，只客製單一監聽器。

若要更精細地控制容器工廠本身，可註冊一個或多個 `PulsarContainerFactoryCustomizer<DefaultPulsarReaderContainerFactory<?>>` Bean。

> **提示：**上述元件的詳細資訊，以及其他可用功能，請參閱 [Spring for Apache Pulsar 參考文件][r23]。

## 交易支援

Spring for Apache Pulsar 在使用 [`PulsarTemplate`][r13] 與 [`@PulsarListener`][r17] 時支援交易。

將 `spring.pulsar.transaction.enabled` 設為 `true`，會：

- 設定 [`PulsarTransactionManager`][r24] Bean。
- 為 `PulsarTemplate` 啟用交易支援。
- 為 `@PulsarListener` 方法啟用交易支援。

可使用 `@PulsarListener` 的 `transactional` 屬性，微調何時使用交易。

若需要更精細地控制交易功能，應自行定義 `PulsarTemplate` 與／或 [`ConcurrentPulsarListenerContainerFactory`][r25] Bean。若預設自動設定的 `PulsarTransactionManager` 不適合，也可定義 [`PulsarAwareTransactionManager`][r26] Bean。

## 其他 Pulsar 屬性

自動設定支援的屬性列於附錄的[整合屬性][r27]。大部分屬性無論採連字號或 camelCase，都直接對應 Apache Pulsar 的設定屬性；詳情請參閱 Pulsar 文件。

只有 Pulsar 支援屬性的一部分，能直接透過 [`PulsarProperties`][r28] 設定。若要使用未直接支援的其他屬性調整自動設定元件，可使用前述各元件支援的 customizer。
