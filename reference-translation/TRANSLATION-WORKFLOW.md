# 本次完整翻譯作業規範

目標：完成 Spring Boot 4.1.1 Reference 剩餘全部頁面，不能用摘要代替逐段翻譯。

## 來源與輸出

- 工作根目錄：本檔案所在的 `reference-translation`。
- `rendered-sources/boot-4.1.1/<slug>.translate.md`：官方 4.1.1 網頁正文已轉成 Markdown，完整保留文字、表格與提醒。程式碼被可追蹤的 `{{CODE_n}}` 佔位符取代；不是請你省略程式碼。
- `<slug>.codes.json`：各原始程式碼區塊。`<slug>.refs.md`：原文連結。`<slug>.html`：完整原始官方 HTML，方便必要時核對。
- 固定版本 AsciiDoc 位於 `sources/spring-boot/documentation/spring-boot-docs/src/docs/antora/modules/reference/pages/`。
- 翻譯寫入 `translations/<slug>.zh.md`，保留全部 `{{CODE_n}}` 各一次、所有連結的 `[rN]` 編號不變。將所有正文、標題、表格說明、清單、提示、警告逐段譯為臺灣繁體中文；不翻程式識別字與範例中的註解。
- 完成後執行 `python3 tools/translation_blocks.py <slug> ...`，會恢復所有官方程式碼、附原文來源與授權說明、輸出 `boot/<slug>.md`。只對真正完成的頁面執行。

## 譯法與完整性

- 採「軟體、資料、伺服器、設定、自動設定、依賴注入、繫結、執行緒、佇列、快取、回呼、交易、身分驗證、授權」。Profile、Bean、classpath、starter、API 名稱可保留英文。
- Kotlin 範例已優先排列，Java 及其他語言也完整保留。若原文沒有 Kotlin，不捏造官方 Kotlin 範例。
- 保留每個條件、預設值、限制、例外與版本，不把數段壓成概要。可以調整中文句序，但不可刪減內容。
- 若 Markdown 原文出現巢狀連結（例如 `[...]` 內還有 `[...][rN]`），改成單層連結，保留最外層有效連結。
- 譯者補充應置於原文後，明確標記。可添加有教學價值的 Mermaid 圖，不要求每頁都有。
- 原文疑點不默默更正；保留並以譯者註說明。
- 不使用外部翻譯服務或略過內容的批次替換來冒充完整中文。
- 不修改其他代理負責的檔案，不重建共用目錄／合訂本；由主代理最後統一處理。
- 不 commit，不接觸其他專案檔案。

## 交付前自查

逐頁對照原文所有小節、表格列、條列項目與提醒均有對應。assemble 指令會檢查原始程式碼區塊完整性。確認沒有英文正文殘留、未完成的 TODO 或翻譯佔位符。回報完成頁面及發現的原文疑點即可。
