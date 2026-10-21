# JVM 的檢查點與還原

<!-- source-attribution -->
> **非官方繁體中文翻譯** · Spring Boot 4.1.1 · 翻譯日期：2026-10-21  
> [官方英文網站](https://docs.spring.io/spring-boot/4.1/reference/packaging/checkpoint-restore.html) · [固定版本英文來源](https://github.com/spring-projects/spring-boot/blob/v4.1.1/documentation/spring-boot-docs/src/docs/antora/modules/reference/pages/packaging/checkpoint-restore.adoc) · [本地原文快照](../sources/spring-boot/documentation/spring-boot-docs/src/docs/antora/modules/reference/pages/packaging/checkpoint-restore.adoc)  
> 原始作者與授權見 [來源聲明](../NOTICE.md)。官方範例及設定鍵保留原文，額外圖解另標示為譯者補充。

<!-- translation-status: translated -->

[Coordinated Restore at Checkpoint][packaging--checkpoint-restore-r1]（CRaC）是 OpenJDK 專案，定義新的 Java API，讓應用程式能在 HotSpot JVM 上建立檢查點並還原。它以 [CRIU][packaging--checkpoint-restore-r2] 為基礎，後者是在 Linux 上實作檢查點／還原功能的專案。

原理如下：使用支援 CRaC 的 JDK，例如 [BellSoft Liberica JDK with CRaC][packaging--checkpoint-restore-r3] 或 [Azul Zulu JDK with CRaC][packaging--checkpoint-restore-r4]，以幾乎和平常相同的方式啟動應用程式。在某個時間點，可以先執行一些涵蓋常見程式路徑的工作負載，讓 JVM 暖機，再透過 API 呼叫、`jcmd` 指令、HTTP 端點或其他機制觸發檢查點。

執行中 JVM 的記憶體狀態（包含暖機成果）會序列化到磁碟，讓之後能快速還原；也可能在作業系統與 CPU 架構相近的另一台機器上還原。還原後的程序保留 HotSpot JVM 的所有能力，包括執行階段進一步進行 JIT 最佳化。

Spring Boot 以 Spring Framework 提供的能力為基礎，支援應用程式的檢查點與還原，並在[有限範圍內][packaging--checkpoint-restore-r5]內建管理 socket、檔案與執行緒集區等資源的生命週期。其他依賴，以及可能操作這些資源的應用程式碼，仍需要額外的生命週期管理。

關於兩種支援模式——「對執行中應用程式按需建立檢查點／還原」與「啟動時自動建立檢查點／還原」——以及如何啟用與使用準則，請參閱 [Spring Framework 的 JVM Checkpoint Restore 支援文件][packaging--checkpoint-restore-r6]。

[packaging--checkpoint-restore-r1]: https://wiki.openjdk.org/display/crac/Main
[packaging--checkpoint-restore-r2]: https://github.com/checkpoint-restore/criu
[packaging--checkpoint-restore-r3]: https://bell-sw.com/pages/downloads/?package=jdk-crac
[packaging--checkpoint-restore-r4]: https://www.azul.com/downloads/?package=jdk-crac#zulu
[packaging--checkpoint-restore-r5]: https://github.com/spring-projects/spring-lifecycle-smoke-tests/blob/ci/STATUS.adoc
[packaging--checkpoint-restore-r6]: https://docs.spring.io/spring-framework/reference/7.0/integration/checkpoint-restore.html
