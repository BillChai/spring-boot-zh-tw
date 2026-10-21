# 檢查結果與限制

檢查日期：2026-10-21。

## 完成範圍

- **Spring Boot 4.1.1 Reference：89／89 個來源頁面已翻譯**，本次新增 78 頁。
- 頁數包含簡短入口頁，不能視為相同比重。此範圍不包含獨立的 How-to、Tutorials、建置 plugin 手冊、API Javadoc 或其他 Spring 專案。

## 已完成的檢查

- 來源清單的 89 個 AsciiDoc 檔案 SHA-256 與 `manifest.json` 相符。本次 78 份官方渲染頁均確認版本為 4.1.1，HTML 雜湊亦相符。
- 89 個已翻譯頁面均附固定版本英文來源；各章保留官方英文網站與本地原文連結。
- 新增 78 頁的 **1,111 個原始程式碼區塊逐一比對完全一致**；Kotlin 對照優先呈現，其他官方語言版本保留。GraphQL 網頁未展開的兩個請求範例另從同版本 Kotlin／Java 原始碼補回。
- 新增頁面的原文章節標題數與表格列數無短缺；譯者圖解另標示。Markdown 程式區塊閉合、參照連結定義、本地連結與合訂本參照 ID 檢查通過。
- 行內程式碼比對的提醒已逐項檢視：差異為省略符格式、URL 連結排版，以及 `Lax` 納入 `SameSite=Lax`；無內容遺漏。保留原始提醒與處理記錄，見 [內容檢查](validation/content-check.json) 與 [提醒處理](validation/review-resolutions.json)。
- 各章由撰寫代理自查；另一代理額外複核主代理撰寫的 30 篇實質章節及 Testing／Actuator 全 20 頁。主代理另外對照核心設定長章與 Web／資料章節的重點內容。Actuator 補充圖對 `read-only` 的過度概括已修正。這是 AI 代理間交叉檢查，不是獨立人工審稿。
- 先前建置章節的 170 筆 starter 資料列及 Devtools 的 18 筆預設屬性仍保留。
- 整套資料 **49 張 Mermaid 圖全部使用 Mermaid 12.2.0 在本機 Chromium 成功解析並產生 SVG**；合訂本重複圖不另計。結果見 [Mermaid 檢查](validation/mermaid-results.json)。本次另查看 SSL 與 OAuth2 圖的畫面，確認繁體中文可讀；先前已查看生態系前兩張圖。

## 檢查限制

- 未逐一建立專案編譯／執行 Kotlin、Java 與設定範例。原文片段可能含省略符號；已知原文疑點以譯者註標出。
- 未逐一測試全部外部連結。官方版本網站仍可能更新，精確對照請使用固定 Git tag、本地來源及渲染快照。
- 未逐張人工審查圖的版面；成功渲染不保證每個 Markdown 閱讀器都支援該版本。
- 未經 Spring 官方或獨立專業譯者審核。結構完整性檢查不能證明每句翻譯都沒有語意誤差。

重建：`python3 tools/catalog.py`。完整性檢查：`python3 tools/validate.py --require-boot-complete`。
