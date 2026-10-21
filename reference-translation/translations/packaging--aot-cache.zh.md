# AOT 快取

AOT 快取是 [JVM 功能][r1]，有助於縮短 Java 應用程式的啟動時間，並減少記憶體用量。

如果尚未使用 Java 25 以上版本，請閱讀 CDS 相關章節。CDS 是 AOT 快取的前身，運作方式相近。

> **注意：**Spring Boot 同時支援 CDS 與 AOT 快取，但建議在可行情況下使用 AOT 快取。

## AOT 快取

> **注意：**Spring Boot 對 AOT 快取的支援適用於 Java 25 以上版本；更早的 Java 版本必須改用 CDS。

使用 AOT 快取前，先對已解開的應用程式進行一次訓練執行：

{{CODE_0}}

這會建立 `app.aot` 快取檔案。只要應用程式沒有更新，而且仍使用相同 Java 版本，就能重複使用。

若要使用快取檔案，啟動應用程式時需要增加一個參數：

{{CODE_1}}

> **注意：**快取檔案必須搭配已解開形式的應用程式使用，否則不會生效。

若要了解如何搭配 Buildpacks 使用 AOT 快取，請參閱 [AOT Cache How-to 指南][r2]。

## CDS

> **注意：**若使用 Java 25 以上版本，請以 AOT 快取取代 CDS。

使用 CDS 前，先對已解開的應用程式進行一次訓練執行：

{{CODE_2}}

這會建立 `application.jsa` 封存檔。只要應用程式未更新，就能重複使用。

若要使用封存檔，啟動應用程式時需要增加一個參數：

{{CODE_3}}

> **注意：**快取檔案必須搭配已解開形式的應用程式使用，否則不會生效。

> **注意：**CDS 的詳細資訊，請參閱 [JDK 的 Class Data Sharing 文件][r3]。

## 譯者圖解：先訓練，再使用快取啟動

```mermaid
flowchart LR
    Jar["解開後的應用程式"] --> Train["訓練執行"]
    Train --> Cache["產生 AOT 快取"]
    Cache --> Launch["啟動時指定快取檔案"]
    Jar --> Launch
    Change["應用程式或 Java 版本更新"] --> Retrain["重新評估並產生快取"]
    Retrain --> Train
```
