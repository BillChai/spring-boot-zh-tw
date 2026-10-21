# 為正式環境封裝應用程式

<!-- source-attribution -->
> **非官方繁體中文翻譯** · boot 4.1.1 · 翻譯日期：2026-10-20  
> [官方英文網站](https://docs.spring.io/spring-boot/reference/using/packaging-for-production.html) · [固定版本英文來源](https://github.com/spring-projects/spring-boot/blob/v4.1.1/documentation/spring-boot-docs/src/docs/antora/modules/reference/pages/using/packaging-for-production.adoc) · [本地原文快照](../sources/spring-boot/documentation/spring-boot-docs/src/docs/antora/modules/reference/pages/using/packaging-for-production.adoc)  
> 原始作者與授權見 [來源聲明](../NOTICE.md)。本文已由英文翻譯為中文；額外圖解與說明均標示為譯者補充。

<!-- translation-status: translated -->

Spring Boot 應用程式準備好部署到正式環境後，有許多封裝與最佳化選項。請參閱文件的[封裝章節](https://docs.spring.io/spring-boot/reference/packaging/index.html)，了解這些能力。

若需要健康檢查、稽核，以及透過 REST 或 JMX 端點提供指標等額外的正式環境功能，可以考慮加入 `spring-boot-actuator`。詳細資訊請參閱 [Actuator How-to](https://docs.spring.io/spring-boot/how-to/actuator.html)。
