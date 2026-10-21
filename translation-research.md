# 繁體中文技術寫作與翻譯資源調查

> **範圍更新（2026-10-21）：**下方「概要導讀」描述的是最初版本。目前另建立 [Reference 逐頁翻譯集](reference-translation/README.md)，沿用本頁用語決策，但逐段保留原文結構、注意事項與範例；補充圖解另行標示。Spring Boot 4.1.1 Reference 的 89 頁為本次完整翻譯範圍；實際完成進度與檢查結果以該資料夾為準。

查核日期：2026-10-20（Asia/Tokyo）

## 本次選擇

採用臺灣繁體中文、概要導讀、少量 Kotlin 範例。Spring 官方文件是技術事實的主要來源；翻譯 skill 與詞彙資源只協助語言一致性，不作為 Spring 行為的證據。

這次閱讀並參考下列社群 skill，沒有安裝第三方程式或執行它的安裝腳本：

| 資源 | 查核內容與適用性 | 本次用途 |
| --- | --- | --- |
| [Taiwanese Mandarin Translate Skill](https://github.com/JamestsaiTW/Taiwanese-Mandarin-translate-Skill) | README 說明支援 Codex 等工具；已讀主 skill 與軟體詞彙表。強調臺灣用語、保留程式識別字、按語意翻譯與校對 | 主要語言工作流程參考 |
| [主 SKILL.md](https://github.com/JamestsaiTW/Taiwanese-Mandarin-translate-Skill/blob/main/.agents/skills/taiwanese-mandarin-translate/SKILL.md) | 譯前理解、翻譯、校對、潤飾；既有專案用語優先 | 保持段落自然、避免逐字硬譯 |
| [Software vocabulary](https://github.com/JamestsaiTW/Taiwanese-Mandarin-translate-Skill/blob/main/.agents/skills/taiwanese-mandarin-translate/references/vocabulary.md) | 包含 software、interface、component、settings 等，以及依情境決定的 service、session、token | 統一一般 IT 詞彙 |
| [Microsoft Localization Style Guides](https://learn.microsoft.com/en-us/globalization/reference/microsoft-style-guides) | 官方提供各語言的在地化指南，列表包含 Chinese (Traditional) | 可持續查閱的技術文件寫作資源；並未逐條套用 Microsoft 產品專用規範 |
| [Microsoft 繁體中文指南 PDF](https://download.microsoft.com/download/2/9/3/293e6d41-ba40-451b-a41e-94bdb6242ae3/zho-twn-StyleGuide.pdf) | 搜尋確認的官方 PDF 入口 | 延伸參考；本次未逐頁審閱 |
| [國家教育研究院樂詞網](https://terms.naer.edu.tw/) | 已確認提供雙語詞彙、學術名詞，以及資訊與通訊術語大辭典入口 | 遇到譯名歧義時的查詢入口；本書詞表不宣稱逐詞取得國教院背書 |

另找到 [Qmo37/localization-tw](https://github.com/Qmo37/localization-tw)，專案介紹包含詞彙建檔、來源比對與人工覆核流程。對長期維護大型詞庫可能有用；本次只查閱專案介紹，沒有審核其完整程式或安裝。社群 skill 的存在與內容適用性，不代表已完成品質評測。

## 本書用語決策

一般 IT 詞彙採「軟體、程式碼、資料、資料庫、伺服器、介面、元件、設定、預設、執行、記憶體、專案」。

Spring 領域詞彙另定義如下，屬於本書編輯選擇，不宣稱是 Spring 官方繁體中文譯名：

| 英文 | 本書用語 | 決策理由 |
| --- | --- | --- |
| Framework | 框架 | 搭配 Spring Framework 專案名稱 |
| Dependency Injection | 依賴注入（DI） | 首次出現保留英文；描述物件合作關係 |
| Inversion of Control | 控制反轉（IoC） | 以「誰建立與組裝物件」解釋 |
| Bean | Bean | 避免直譯妨礙與原文、API 對照 |
| ApplicationContext | ApplicationContext | 保留類別／介面名稱 |
| Auto-configuration | 自動設定 | 與臺灣常用「設定」一致 |
| Binding | 繫結 | 搭配具體說明「把設定值轉成物件」 |
| Proxy | 代理物件 | 第一次補英文，避免與網路代理混淆 |
| Transaction | 交易 | 指資料庫交易，不限於金錢交易 |
| Rollback | 回滾 | 與 commit／提交成對說明 |
| Authentication / Authorization | 身分驗證／授權 | 明確分開「是誰」與「可以做什麼」 |
| Annotation | 註解標記（annotation） | 與一般文字註解（comment）區分 |
| Repository | Repository／資料存取介面 | 區分 Spring Data 概念與 Git 儲存庫 |
| Cache | 快取 | 避免與 buffer／緩衝區混用 |
| Reactive | 反應式 | 與非阻塞、事件驅動等特性分別描述，不視為同義詞 |
| Observability | 可觀測性 | 包含 metrics、tracing 與相關觀測工具 |
| Scope | 作用域 | 指 Bean 生命週期與共用範圍 |

## 編輯與校對方式

1. 依官方文件確認功能與限制，再用繁體中文重組為主題式導讀。
2. 全書統一同一套術語；品牌、API、設定鍵與程式識別字保留英文。
3. 各章附直接指向對應主題的官方英文連結。
4. 將教學案例、閱讀順序與理解題標為本書編排，與官方事實區分。
5. 檢查容易過度簡化的說法：Bean 不等於執行緒安全、自動設定不等於掃描所有類別、交易不自動涵蓋外部寄信、排程不自帶跨節點去重。
6. Kotlin 程式為概念片段，不假裝是已完成建置測試的完整專案。

本次產出是重新編排的中文概要導讀，並非官方 Reference 的逐段全譯；章節與原文章節不採一對一對照。閱讀每章末尾的原文指引，可以追到相關英文段落。
