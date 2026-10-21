"""Rebuild source inventory and translated-volume indexes; never translate content."""
from pathlib import Path
import hashlib
import json
import re

ROOT = Path(__file__).resolve().parents[1]
BOOKS = {
    "boot": ("spring-boot", "4.1.1",
             "documentation/spring-boot-docs/src/docs/antora/modules/reference",
             "partials/nav-reference.adoc"),
}


def rebuild():
    records = []
    for key, (repo, version, module, navigation) in BOOKS.items():
        base = ROOT / "sources" / repo / module
        pages = {str(p.relative_to(base / "pages")): p
                 for p in (base / "pages").rglob("*.adoc")}
        nav = (base / navigation).read_text()
        order = re.findall(r"xref:(?:reference:)?([^:\[\n]+\.adoc)\[", nav)
        order = list(dict.fromkeys(["index.adoc", *order, *sorted(pages)]))
        lines = [f"# {repo} {version}：逐頁翻譯目錄", "",
                 "「已翻譯」表示該頁正文已逐段翻譯；全書完成狀態見進度表，範例未逐一編譯測試。",
                 "來源是官方版本標籤的文件快照。頁數包含入口頁。", ""]
        translated = []
        for rel in order:
            if rel not in pages:
                continue
            path = pages[rel]
            content = path.read_text()
            title_match = re.search(r"^= (.+)$", content, re.M)
            title = title_match.group(1) if title_match else rel
            slug = rel[:-5].replace("/", "--") + ".md"
            target = ROOT / key / slug
            status = "pending"
            translated_title = None
            if target.exists():
                text = target.read_text()
                heading = re.search(r"^# (.+)$", text, re.M)
                translated_title = heading.group(1) if heading else None
                if "<!-- translation-status: translated -->" in text:
                    status = "translated"
                    translated.append(target)
                else:
                    status = "draft"
            source_url = f"https://github.com/spring-projects/{repo}/blob/v{version}/{module}/pages/{rel}"
            web_path = rel[:-5] + ".html"
            version_path = "4.1/" if key == "boot" else ""
            web_url = f"https://docs.spring.io/{repo}/{version_path}reference/{web_path}"
            row = {
                "book": key, "version": version, "source": str(path.relative_to(ROOT)),
                "source_sha256": hashlib.sha256(path.read_bytes()).hexdigest(),
                "title": title, "translated_title": translated_title,
                "source_url": source_url, "web_url": web_url,
                "translation": str(target.relative_to(ROOT)),
                "status": status, "source_whitespace_tokens": len(content.split()),
            }
            records.append(row)
            label = {"pending": "待翻譯", "draft": "草稿", "translated": "已翻譯"}[status]
            destination = slug if target.exists() else source_url
            display = f"{translated_title} / {title}" if translated_title else title
            lines.append(f"- **{label}** · [{display}]({destination}) · [版本固定原文]({source_url})")
        directory = ROOT / key
        directory.mkdir(exist_ok=True)
        (directory / "CONTENTS.md").write_text("\n".join(lines) + "\n")
        if translated:
            complete = len(translated) == len(pages)
            edition = "Reference 繁體中文全譯" if complete else "目前已翻譯章節合訂本"
            status_note = (f"> 本冊包含全部 {len(pages)} 個 Reference 來源頁面的翻譯。"
                           if complete else "> 尚非完整 Reference。")
            merged = [f"# {repo} {version}：{edition}", "", status_note,
                      "> 非官方翻譯；圖解另標示為譯者補充。各章附英文來源，完整清單見 [逐頁目錄](CONTENTS.md)。",
                      "", '<a id="contents"></a>', "", "## 目錄", ""]
            for page in translated:
                chapter_title = re.search(r"^# (.+)$", page.read_text(), re.M).group(1)
                merged.append(f"- [{chapter_title}](#chapter-{page.stem})")
            merged.append("\n---\n")
            for page in translated:
                merged.extend([f'<a id="chapter-{page.stem}"></a>\n',
                               page.read_text(), "\n[回到目錄](#contents)\n\n---\n"])
            (directory / "BOOK.md").write_text("\n".join(merged))
    (ROOT / "manifest.json").write_text(json.dumps(records, ensure_ascii=False, indent=2) + "\n")
    lines = ["# 翻譯進度", "", "更新日期：2026-10-21。原文詞項數以空白切分估算，包含 AsciiDoc 指令與部分程式碼；不是精確的自然語言字數。", "",
             "| 文件 | 已翻譯頁 | 原文頁數 | 待翻譯頁 | 原文詞項數 |",
             "| --- | ---: | ---: | ---: | ---: |"]
    for key in BOOKS:
        rows = [r for r in records if r["book"] == key]
        done = sum(r["status"] == "translated" for r in rows)
        lines.append(f"| {key} | {done} | {len(rows)} | {len(rows)-done} | {sum(r['source_whitespace_tokens'] for r in rows):,} |")
    lines += ["", "頁數不能代表相同工作量：有些是短入口，有些包含數千字。英文來源已下載不等於中文已翻譯。",
              "", "本進度表由 `python3 tools/catalog.py` 產生；不使用空白章節或英文副本冒充中文完成頁。"]
    (ROOT / "PROGRESS.md").write_text("\n".join(lines) + "\n")
    print("\n".join(lines[:9]))


if __name__ == "__main__":
    rebuild()
