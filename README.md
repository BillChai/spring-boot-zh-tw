# Spring Boot 繁體中文文件

Spring Boot **4.1.1 Reference** 的非官方繁體中文翻譯，共 89 個來源頁面。官方有 Kotlin 範例時優先呈現 Kotlin，保留其他語言、設定片段、英文來源與譯者 Mermaid 圖解。

這是 AI 輔助翻譯，尚待持續人工審校，未經 Spring 官方背書。頁數包含入口頁，不代表相同工作量。

目標儲存庫：[BillChai/spring-boot-zh-tw](https://github.com/BillChai/spring-boot-zh-tw)。預定網站：[GitHub Pages](https://billchai.github.io/spring-boot-zh-tw/)（首次發布前不保證網址可用）。

## 帶著問題閱讀

- 框架省掉哪些手作？從[自動設定](reference-translation/boot/using--auto-configuration.md)與[外部化設定](reference-translation/boot/features--external-config.md)開始。
- 預設值不適合時怎麼擴充？閱讀[開發自動設定](reference-translation/boot/features--developing-auto-configuration.md)。
- 怎麼知道程式真的照預期運作？閱讀[測試](reference-translation/boot/testing--spring-boot-applications.md)與 [Actuator](reference-translation/boot/actuator--endpoints.md)。
- 想先建立全貌？閱讀[概要導讀](spring-boot-overview-zh-tw.md)及[生態系](reference-translation/ECOSYSTEM.md)。

[逐頁目錄](reference-translation/boot/CONTENTS.md) · [Markdown 全書](reference-translation/boot/BOOK.md) · [術語](translation-research.md) · [貢獻指南](CONTRIBUTING.md) · [上游原文問題](UPSTREAM-ISSUES.md)

## 本機預覽

需要 Node.js 24 與 Python 3。只在 `site/` 安裝 npm 相依項，不需要 Java 或 Antora 建置環境。

```bash
npm --prefix site ci
npm --prefix site run build
npm --prefix site run preview
```

開啟 `http://127.0.0.1:4173/`。首頁直接進入文件，沒有獨立行銷首頁。若 4173 已被其他預覽占用，可執行 `python3 -m http.server 4174 --bind 127.0.0.1 --directory site/dist`。

完整檢查：

```bash
python3 reference-translation/tools/catalog.py
python3 reference-translation/tools/validate.py --require-boot-complete
BASE_PATH=/spring-boot-zh-tw/ npm --prefix site run build
```

最後一項驗證部署用子路徑。之後若回到根路徑本機預覽，請重新執行不含 `BASE_PATH` 的 build。

## 自己發布到 GitHub Pages

本專案已準備 workflow，但**不會在 push 時自動部署**。Push 與 PR 只執行檢查，正式發布由你手動觸發。

1. 使用對 `BillChai/spring-boot-zh-tw` 有寫入權限的 GitHub 帳號，在此獨立資料夾提交並推送 `main`。首次建立 Git 儲存庫的指令如下；已有 `.git` 時先確認分支與 remote，不重複初始化。

   ```bash
   git init -b main
   git remote add origin git@github.com:BillChai/spring-boot-zh-tw.git
   git add .
   git diff --cached --stat
   git commit -m "Add Traditional Chinese Spring Boot documentation site"
   git push -u origin main
   ```

2. 在 GitHub 儲存庫開啟 **Settings → Pages → Build and deployment → Source → GitHub Actions**。
3. 等待 **Check documentation** 通過，再至 **Actions → Publish GitHub Pages manually → Run workflow**，選 `main`。
4. 完成後開啟 `https://billchai.github.io/spring-boot-zh-tw/`，再檢查深層網址 `/reference/features/external-config.html`。
5. 更新譯文後照常 push、等待檢查、手動 Run workflow。若要回復舊版，在 Git 中還原對應內容再重新發布。

需具備設定 Pages 的儲存庫管理權限。本站不包含自訂網域或帳號登入服務。

## 維護與授權

中文書稿是維護來源，網站由 `site/build.mjs` 產生；不手動修改 `site/dist`。搜尋與圖解在瀏覽器本機執行，不加入分析追蹤或第三方 CDN。

- 原始文件與翻譯修改：[NOTICE](reference-translation/NOTICE.md)、[Apache License 2.0](LICENSE)。
- UI 使用官方 [antora-ui-spring](https://github.com/spring-io/antora-ui-spring) 的未修改 CSS 子集與參照圖示，固定 commit `00618195cca8f5e6cae541163dc011650b1973c3`；該部分遵循 [MPL-2.0](site/vendor/spring-ui/LICENSE)。版面適配放在獨立樣式，不覆蓋官方來源檔。
- JavaScript 套件維持各自授權；部署包含 Mermaid 套件的授權副本。
- [翻譯驗證結果](reference-translation/VALIDATION.md) 與網站驗證記錄分別記載內容及介面檢查範圍。
