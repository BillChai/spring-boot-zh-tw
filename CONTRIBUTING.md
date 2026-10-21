# 參與翻譯與校對

這是社群維護的非官方繁體中文翻譯。可以從一個段落、一張圖或一個可重現的範例開始。

## 翻譯勘誤

1. 找到對應章節，閱讀頁首的固定版本英文來源。
2. 在 Issue 記錄章節、原文、目前譯文、建議修改與理由。
3. 一個 PR 聚焦一項問題或一小組相關段落，避免順手重排整本書。
4. API、設定鍵、類別名稱與官方程式碼保持原樣。若要補 Kotlin 範例或圖解，明確標示為譯者補充。
5. 按 [術語表](translation-research.md) 統一用語；新增譯名時記錄理由。

## 編輯哪個檔案

- 本次新增的 Boot 78 頁：修改 `reference-translation/translations/<slug>.zh.md`，保留所有 `{{CODE_n}}` 與連結參照 ID，然後執行 `python3 reference-translation/tools/translation_blocks.py <slug>`。
- 其餘已翻譯頁：修改 `reference-translation/boot/` 中的對應單頁。
- `BOOK.md`、`CONTENTS.md` 與進度表是產生檔，不直接修改。
- `sources/` 與 `rendered-sources/` 是對照快照，不用改寫快照來讓檢查通過。

修改後執行：

```bash
python3 reference-translation/tools/catalog.py
python3 reference-translation/tools/validate.py --require-boot-complete
npm --prefix site ci
npm --prefix site run build
```

## 校對重點

- 條件與例外：only、unless、by default、not 等是否完整保留。
- 預設值、覆寫優先順序、測試交易與生命週期是否正確。
- 圖解是否把有條件的行為畫成無條件成立。
- 原文版本與範例版本是否一致。

AI 可以協助草擬，但提交者必須親自閱讀、核對並能解釋修改理由。結構檢查通過不等於技術語意必定正確。

## 官方原文問題

先查 [上游問題清單](UPSTREAM-ISSUES.md)。確認最新上游仍有問題，搜尋既有 Issue／PR，並核對 API 或可重現範例，再準備最小修正。

翻譯專案與官方專案的 PR 分開。官方提交遵循各自 CONTRIBUTING 與 DCO 要求；不要把整本中文翻譯送進沒有翻譯接收流程的英文文件目錄。

## 授權與來源

保留 [來源與授權聲明](reference-translation/NOTICE.md)。貢獻文字必須有權以本專案授權提供；不要直接抄入其他翻譯網站的內容。
