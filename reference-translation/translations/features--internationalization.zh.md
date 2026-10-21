# 國際化

Spring Boot 支援在地化訊息，讓應用程式能服務具有不同語言偏好的使用者。預設會在 classpath 根目錄尋找名為 `messages` 的資源套件（resource bundle）。

> **注意：**只有在設定的資源套件具備預設 properties 檔案時（預設為 `messages.properties`），這項自動設定才會生效。如果只有特定語言的 properties 檔案，就必須補上預設檔案。若找不到符合任何已設定基本名稱的 properties 檔案，就不會自動設定 [`MessageSource`][r1]。

資源套件的基本名稱與其他數個屬性，可透過 `spring.messages` 命名空間設定：

{{CODE_0}}

{{CODE_1}}

> **提示：**`spring.messages.basename` 支援位置清單，可使用套件限定名稱，或從 classpath 根目錄解析的資源。`spring.messages.common-messages` 支援 properties 檔案資源的清單。

其他支援選項請參閱 [`MessageSourceProperties`][r2]。
