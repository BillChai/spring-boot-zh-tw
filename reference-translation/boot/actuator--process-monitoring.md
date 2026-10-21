# 程序監控

<!-- source-attribution -->
> **非官方繁體中文翻譯** · Spring Boot 4.1.1 · 翻譯日期：2026-10-21  
> [官方英文網站](https://docs.spring.io/spring-boot/4.1/reference/actuator/process-monitoring.html) · [固定版本英文來源](https://github.com/spring-projects/spring-boot/blob/v4.1.1/documentation/spring-boot-docs/src/docs/antora/modules/reference/pages/actuator/process-monitoring.adoc) · [本地原文快照](../sources/spring-boot/documentation/spring-boot-docs/src/docs/antora/modules/reference/pages/actuator/process-monitoring.adoc)  
> 原始作者與授權見 [來源聲明](../NOTICE.md)。官方範例及設定鍵保留原文，額外圖解另標示為譯者補充。

<!-- translation-status: translated -->

`spring-boot` 模組提供兩個類別，可建立對程序監控通常很有用的檔案：

- [`ApplicationPidFileWriter`][actuator--process-monitoring-r1] 建立包含應用程式 PID 的檔案，預設位於應用程式目錄，檔名為 `application.pid`。
- [`WebServerPortFileWriter`][actuator--process-monitoring-r2] 建立一個或多個檔案，包含執行中 Web 伺服器的連接埠；預設位於應用程式目錄，檔名為 `application.port`。

這些 writer 預設並未啟用，但可以透過下列方式啟用：

- [擴充設定][actuator--process-monitoring-r3]
- [以程式方式啟用程序監控][actuator--process-monitoring-r4]

## 擴充設定

你可以在 `META-INF/spring.factories` 檔案中啟用寫入 PID 檔案的監聽器：

```text
org.springframework.context.ApplicationListener=\
org.springframework.boot.context.ApplicationPidFileWriter,\
org.springframework.boot.web.server.context.WebServerPortFileWriter
```

## 以程式方式啟用程序監控

也可以呼叫 `SpringApplication.addListeners(…​)` 方法，傳入適當的 [`Writer`][actuator--process-monitoring-r5] 物件，以啟用監聽器。
這個方式也讓你能在 [`Writer`][actuator--process-monitoring-r5] 建構子中自訂檔名與路徑。

[actuator--process-monitoring-r1]: https://docs.spring.io/spring-boot/4.1.1/api/java/org/springframework/boot/context/ApplicationPidFileWriter.html
[actuator--process-monitoring-r2]: https://docs.spring.io/spring-boot/4.1.1/api/java/org/springframework/boot/web/server/context/WebServerPortFileWriter.html
[actuator--process-monitoring-r3]: https://docs.spring.io/spring-boot/4.1/reference/actuator/process-monitoring.html#actuator.process-monitoring.configuration
[actuator--process-monitoring-r4]: https://docs.spring.io/spring-boot/4.1/reference/actuator/process-monitoring.html#actuator.process-monitoring.programmatically
[actuator--process-monitoring-r5]: https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/io/Writer.html
