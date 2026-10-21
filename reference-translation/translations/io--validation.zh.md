# 驗證

只要 classpath 上有 JSR-303 實作（例如 Hibernate Validator，通常由 `spring-boot-starter-validation` 提供），就會自動啟用 Bean Validation 1.1 支援的方法驗證功能。
這讓你能在 Bean 方法的參數及／或回傳值上標註 `jakarta.validation` 約束。
含有這類方法的目標類別，必須在型別層級標註 [`@Validated`][r1]，才會搜尋其方法中的約束註解。

例如，下列服務會觸發第一個引數的驗證，確保其大小介於 8 到 10：

{{CODE_0}}

{{CODE_1}}

解析約束訊息中的 `{parameters}` 時，會使用應用程式的 [`MessageSource`][r2]。
這讓你可以使用[應用程式的 `messages.properties` 檔案][r3]來提供 Bean Validation 訊息。
參數解析完成後，會使用 Bean Validation 的預設插值器完成訊息插值。

若要自訂建立 [`ValidatorFactory`][r5] 時所使用的 [`Configuration`][r4]，請定義 [`ValidationConfigurationCustomizer`][r6] Bean。
定義多個自訂器 Bean 時，會依照它們的 [`@Order`][r7] 註解或 [`Ordered`][r8] 實作所指定的順序呼叫。
