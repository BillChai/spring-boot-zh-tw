# 官方原文疑點與貢獻追蹤

查核日期：2026-10-21。這裡記錄翻譯時發現的候選問題，**尚未提交官方 Issue 或 PR**。

目前 `main` 的檢查使用當日公開原始檔；`main` 會持續變動。正式 PR 應再固定 commit、核對實作，並查詢是否已有相同修正。

| 候選 | 固定版與目前 main 的觀察 | 建議最小修正 | 狀態 |
| --- | --- | --- | --- |
| Neo4j 測試模組描述 | `spring-boot-data-neo4j-test` 描述仍寫 Spring Data JPA，但同列為 `@DataNeo4jTest` | 將該列 JPA 改為 Neo4j | 已確認 main 文字仍存在；待查重與人工確認 |
| JMS 連線工廠名稱 | 限制說明寫 `CachedConnectionFactory`；同頁前文使用 `CachingConnectionFactory` | 核對解包實作後修正類別名稱 | 已確認 main 文字仍存在；待實作核對及查重 |
| REST Docs 模組名稱 | 段落含未閉合的行內程式碼與 `spring-boot-restdocs- module` | 核對實際 artifact 後補齊名稱與反引號 | 已確認 main 文字仍存在；待模組核對及查重 |

對應上游檔案：

- [Testing modules](https://github.com/spring-projects/spring-boot/blob/main/documentation/spring-boot-docs/src/docs/antora/modules/reference/pages/testing/test-modules.adoc)
- [JMS](https://github.com/spring-projects/spring-boot/blob/main/documentation/spring-boot-docs/src/docs/antora/modules/reference/pages/messaging/jms.adoc)
- [Testing Spring Boot applications](https://github.com/spring-projects/spring-boot/blob/main/documentation/spring-boot-docs/src/docs/antora/modules/reference/pages/testing/spring-boot-applications.adoc)

## 每項問題的完成條件

1. 固定上游 commit，記錄精確檔案與段落。
2. 搜尋現有 Issue／PR，避免重複。
3. 證明預期文字：API、模組名稱或可重現行為。
4. 由提交者閱讀並確認，建立一個範圍清楚的小型 PR。
5. 合併後記錄 PR 網址、版本，更新本專案譯者註；保留舊快照，不竄改歷史原文。

優先候選是 Neo4j 表格描述，變更小、原文內部證據清楚。是否接受仍由官方維護者決定。
