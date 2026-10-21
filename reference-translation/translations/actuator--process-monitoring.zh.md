# 程序監控

`spring-boot` 模組提供兩個類別，可建立對程序監控通常很有用的檔案：

- [`ApplicationPidFileWriter`][r1] 建立包含應用程式 PID 的檔案，預設位於應用程式目錄，檔名為 `application.pid`。
- [`WebServerPortFileWriter`][r2] 建立一個或多個檔案，包含執行中 Web 伺服器的連接埠；預設位於應用程式目錄，檔名為 `application.port`。

這些 writer 預設並未啟用，但可以透過下列方式啟用：

- [擴充設定][r3]
- [以程式方式啟用程序監控][r4]

## 擴充設定

你可以在 `META-INF/spring.factories` 檔案中啟用寫入 PID 檔案的監聽器：

{{CODE_0}}

## 以程式方式啟用程序監控

也可以呼叫 `SpringApplication.addListeners(…​)` 方法，傳入適當的 [`Writer`][r5] 物件，以啟用監聽器。
這個方式也讓你能在 [`Writer`][r5] 建構子中自訂檔名與路徑。
