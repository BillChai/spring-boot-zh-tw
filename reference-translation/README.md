# Spring 官方文件繁體中文翻譯集

**Spring Boot Reference 4.1.1 已完成全部 89 個來源頁面的翻譯。** 本次補完原先待翻譯的 78 頁，保留官方章節、表格、提示與程式碼範例；各頁附官方英文網站及固定版本原始碼連結。

## 閱讀入口

- **[Spring Boot Reference 繁體中文全譯：單一 Markdown 合訂本](boot/BOOK.md)**：含可點選目錄與章節返回連結。
- [Spring Boot 逐頁目錄](boot/CONTENTS.md)：適合分章閱讀，並對照英文原文。
- [Spring 生態系導讀](ECOSYSTEM.md)：依功能介紹各專案，以及它們各自減少哪些手作工作。
- [進度](PROGRESS.md) · [檢查結果與限制](VALIDATION.md) · [術語與翻譯資源調查](../translation-research.md) · [授權聲明](NOTICE.md)

## Spring Boot 全書範圍

| 部分 | 內容 |
| --- | --- |
| 使用 Spring Boot 開發 | 建置、程式結構、組態、自動設定、DI、啟動、Devtools、封裝 |
| 核心功能 | SpringApplication、外部化設定、Profiles、日誌、國際化、AOP、JSON、排程、開發服務、自訂自動設定、Kotlin、SSL |
| Web | Servlet、Reactive、平順關閉、安全、Session、GraphQL、HATEOAS |
| 資料存取 | SQL 與各類 NoSQL 整合 |
| I/O | 快取、Batch、gRPC、Hazelcast、Quartz、電子郵件、驗證、REST 用戶端、Web Services、JTA |
| 訊息 | JMS、AMQP、Kafka、Pulsar、RSocket、Integration、WebSocket |
| 安全性 | OAuth2 用戶端／資源伺服器／授權伺服器、SAML 2.0 |
| 測試 | 測試模組、Spring／Boot 測試、測試切片、Testcontainers、測試工具 |
| 封裝部署 | 解開式部署、AOT 快取、Spring AOT、GraalVM 原生映像、CRaC、容器映像 |
| Actuator | 端點、HTTP／JMX 管理、可觀測性、日誌、指標、追蹤、稽核、HTTP 交換、程序監控、Cloud Foundry |

「全部」指固定版本的 **Reference 文件模組**。獨立的 How-to、Tutorials、Maven／Gradle plugin 文件、Specification、API Javadoc、其他 Spring 專案手冊與歷史版本，不計入這 89 頁；正文中的相關英文連結仍保留。

## 版本與閱讀方式

Spring Boot 使用 **4.1.1** 文件快照。實際專案以所選 Boot 的依賴管理為準。

- **Kotlin 優先**：官方有 Kotlin 對照時優先排列，Java、Properties、YAML 等原始對照也保留。只有 Java 的原文不冒稱已有官方 Kotlin 範例。
- **圖解分開標示**：Mermaid 與教學補充明確標示為譯者內容。需要支援 Mermaid 的 Markdown 閱讀器才能顯示圖形。
- **原文可追溯**：官方網站可能更新；對照精確版本時，優先看各章的固定版本 GitHub 來源、本地 AsciiDoc 與渲染 HTML 快照。
- **保留原文疑點**：已發現的名稱、版本或範例差異另加譯者註。GraphQL 頁未展開的請求範例，已從同版本官方程式碼補回並附連結。
- **範例用途**：程式碼是文件範例，不是全部可獨立執行的專案；未逐一編譯及執行。

本套是非官方、AI 輔助產生並校對的翻譯，未經 Spring 官方或獨立專業譯者審核。[先前概要版](../spring-boot-overview-zh-tw.md) 仍保留，方便快速導讀。

## 維護與檢查

`manifest.json` 記錄每頁版本、來源雜湊、連結與翻譯狀態。`rendered-sources/boot-4.1.1/` 保存本次 78 頁的完整 HTML、轉換後英文、程式碼與參照資料，供完整性核對。

- `python3 tools/catalog.py`：重建目錄、進度與合訂本。
- `python3 tools/validate.py --require-boot-complete`：檢查 Boot 完成頁數、來源雜湊、原始程式碼保留、標題、連結與 Markdown 結構。
- `translations/` 是保留程式碼佔位符的翻譯工作檔；閱讀請使用 `boot/` 的已組裝成品。
