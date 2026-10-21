# 有效率的部署

<!-- source-attribution -->
> **非官方繁體中文翻譯** · Spring Boot 4.1.1 · 翻譯日期：2026-10-21  
> [官方英文網站](https://docs.spring.io/spring-boot/4.1/reference/packaging/efficient.html) · [固定版本英文來源](https://github.com/spring-projects/spring-boot/blob/v4.1.1/documentation/spring-boot-docs/src/docs/antora/modules/reference/pages/packaging/efficient.adoc) · [本地原文快照](../sources/spring-boot/documentation/spring-boot-docs/src/docs/antora/modules/reference/pages/packaging/efficient.adoc)  
> 原始作者與授權見 [來源聲明](../NOTICE.md)。官方範例及設定鍵保留原文，額外圖解另標示為譯者補充。

<!-- translation-status: translated -->

## 解開可執行 jar

可以直接使用可執行 jar 執行應用程式，不過從巢狀 jar 載入類別會增加少量啟動成本。依 jar 大小而定，從解開後的目錄結構執行會比較快，因此建議正式環境採用此方式。某些 PaaS 實作也會在執行前先解開封存檔，例如 Cloud Foundry。

Spring Boot 支援以不同配置將應用程式解開至目錄。預設配置最有效率，也適合使用 [AOT 快取][packaging--efficient-r1]及 [CDS][packaging--efficient-r2]。

在這個配置中，函式庫會解開到 `lib/` 資料夾；應用程式 jar 則包含應用程式類別，以及參照 `lib/` 函式庫的 manifest。

執行以下指令解開可執行 jar：

```shell
$ java -Djarmode=tools -jar my-app.jar extract
```

接著，正式環境可以執行解開後的 jar：

```shell
$ java -jar my-app/my-app.jar
```

啟動完成後，不應預期直接執行可執行 jar 與執行解開後的 jar，在執行時間上有任何差異。

> **提示：**執行 `java -Djarmode=tools -jar my-app.jar help extract`，可查看所有可用選項。

[packaging--efficient-r1]: https://docs.spring.io/spring-boot/4.1/reference/packaging/aot-cache.html#packaging.aot-cache.aot-cache
[packaging--efficient-r2]: https://docs.spring.io/spring-boot/4.1/reference/packaging/aot-cache.html#packaging.aot-cache.cds
