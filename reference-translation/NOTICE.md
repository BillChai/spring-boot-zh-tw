# 來源、授權與修改聲明

本資料夾是非官方的繁體中文翻譯與學習補充，不代表 Spring、Broadcom 或各原始作者的審核或背書。

## 原始作品

- Spring Boot，來源為 [spring-projects/spring-boot，v4.1.1](https://github.com/spring-projects/spring-boot/tree/v4.1.1)，授權副本：[Apache License 2.0](licenses/spring-boot-LICENSE.txt)。原始程式碼的著作權聲明包含 `Copyright 2012-present the original author or authors.`，各檔案原有聲明保留於 `sources/`。
- `rendered-sources/boot/` 保存官方文件頁的 HTML 與擷取表格，用於補足 AsciiDoc 建置時才產生的 starter 與 devtools 設定表。HTML 內既有網站聲明未刪除；不把網站其他素材宣告為本翻譯原創。

- `rendered-sources/boot-4.1.1/` 保存本次其餘 78 頁的官方 HTML、英文轉換稿、程式碼與連結資料。HTML 網站聲明保持原樣；GraphQL 未展開的請求範例另從同版本官方原始碼還原，並在譯文中註明。

來源快照、來源檔案與渲染頁雜湊分別記錄於 [sources-lock.json](sources-lock.json)、[manifest.json](manifest.json) 與 [rendered-sources/manifest.json](rendered-sources/manifest.json)。

## 本次修改

修改日期：2026-10-20 至 2026-10-21。

1. 將已完成頁面的英文敘述翻譯為臺灣繁體中文，轉成 Markdown。
2. 主文優先呈現 Kotlin 範例；部分 Java／XML 對照移至頁末可展開區塊，原始完整檔案另有連結。
3. 新增明確標示的譯者說明與 Mermaid 圖解；這些不屬於官方原文。
4. 新增生態系概要、術語決策、目錄、來源清單及進度表。
5. 保留原文中的示意片段與省略符號，不宣稱所有片段可獨立編譯。已辨認到的原文疑點另標註，不靜默改寫為官方內容。

本套翻譯與新增文字／圖解以 Apache License 2.0 提供；原始作品及各自商標仍屬於原權利人。授權內容以附帶英文授權全文為準。Spring Boot Reference 已完成翻譯；本套未經 Spring 官方或獨立專業譯者校訂。

## 文件網站介面

網站使用 Spring Antora UI 的固定 commit `00618195cca8f5e6cae541163dc011650b1973c3` 中未修改的 CSS 子集與參照圖示。此部分遵循 [MPL-2.0](../site/vendor/spring-ui/LICENSE)，來源記錄見 [SOURCE.json](../site/vendor/spring-ui/SOURCE.json)。獨立版面適配不代表 Spring 官方網站或官方中文版本。
