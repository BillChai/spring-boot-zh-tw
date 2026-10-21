# Dockerfiles

雖然只需在 `Dockerfile` 寫幾行，就能把 Spring Boot uber jar 轉成 Docker 映像，但使用[分層功能][r1]能得到更佳的映像。建立包含分層索引的 jar 時，`spring-boot-jarmode-tools` jar 會作為依賴加入。classpath 中有此 jar 後，便能以特殊模式啟動，讓啟動程式執行與應用程式完全不同的工作，例如解開各個層。

以下是以 `tools` jar 模式啟動的方式：

{{CODE_0}}

輸出如下：

{{CODE_1}}

使用 `extract` 指令，可以方便地將應用程式拆成供 `Dockerfile` 加入的各層。以下是使用 `jarmode` 的 `Dockerfile` 範例：

{{CODE_2}}

假設上述 `Dockerfile` 位於目前目錄，可以使用 `docker build .` 建置映像；也可以另外指定應用程式 jar 的路徑：

{{CODE_3}}

這是一個多階段 `Dockerfile`。builder 階段會解開後續所需的目錄；每個 `COPY` 指令都對應到 jarmode 解開的層。

當然，也可以不使用 `jarmode`，自行組合 `unzip` 與 `mv`，把內容移到正確的層。不過 `jarmode` 能簡化工作，且產生的配置原本就適合 AOT 快取與 CDS。

## AOT 快取

如果使用 Java 25 以上版本，而且想額外啟用 [AOT 快取][r2]，可以使用下列 `Dockerfile`：

{{CODE_4}}

大致上與前例相同；最後幾個步驟會執行一次訓練，建立 AOT 快取檔，再把 AOT 快取參數傳給 `java -jar`。

## CDS

> **注意（原文）：**如果使用 Java 24 或更新版本，請以 AOT 快取取代 CDS。

若要額外啟用 [CDS][r3]，可以使用下列 `Dockerfile`：

{{CODE_5}}

大致上與前例相同；最後幾個步驟會執行一次訓練，建立 CDS 封存檔，再把 CDS 參數傳給 `java -jar`。

> **注意：**如果使用 Java 25 以上版本，建議使用 AOT 快取取代 CDS。

> **譯者校對註：**此固定版本原文在本節的一則提醒寫「Java 24」，但本頁 AOT 快取段落及 AOT Cache 專章寫的是 Spring Boot 支援「Java 25 以上」。本譯文保留這項原文差異；實作時請以所選 JDK 與 Spring Boot 的具體支援條件核對。
