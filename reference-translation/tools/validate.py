"""Check document structure, original examples, references and translation coverage."""
from pathlib import Path
from collections import Counter
from urllib.parse import unquote
import hashlib,json,re,sys
ROOT=Path(__file__).resolve().parents[1]
CODE=re.compile(r'^((?:> )*)```[^\n]*\n.*?^\1```[ \t]*$',re.M|re.S)
rows=json.loads((ROOT/'manifest.json').read_text())
errors=[];warnings=[];diagrams=[];coverage=[]
paths=[*ROOT.glob('*.md'),*(ROOT/'boot').glob('*.md'),*(ROOT/'framework').glob('*.md')]
for p in sorted(paths):
 if p.name=='TRANSLATION-WORKFLOW.md':continue
 s=p.read_text();body=CODE.sub('',s)
 if len(re.findall(r'^(?:> )*```',s,re.M))!=2*len(list(CODE.finditer(s))):errors.append(f'fence structure: {p.relative_to(ROOT)}')
 if re.search(r'\{\{CODE_\d+\}\}|<!-- (?:devtools-properties|remote-output)',body):errors.append(f'unexpanded placeholder: {p.name}')
 definitions=dict(re.findall(r'^\[([^\]]+)\]:\s*(\S+)',body,re.M))
 used=set(re.findall(r'\]\[([^\]]+)\]',body))
 if used-set(definitions):errors.append(f'undefined references {p.name}: {sorted(used-set(definitions))}')
 ids=re.findall(r'^\[([^\]]+)\]:',body,re.M)
 if len(ids)!=len(set(ids)):errors.append(f'duplicate reference IDs: {p.name}')
 targets=re.findall(r'\]\(([^)]+)\)',body)+list(definitions.values())
 for target in targets:
  if re.match(r'(https?://|#|mailto:)',target):continue
  rel=unquote(target.split('#')[0])
  if rel and not (p.parent/rel).exists():errors.append(f'broken local link {p.relative_to(ROOT)} -> {target}')
 if p.name not in ['BOOK.md','CONTENTS.md']:
  for i,m in enumerate(re.finditer(r'^```mermaid\n(.*?)^```',s,re.M|re.S),1):
   diagrams.append({'file':str(p.relative_to(ROOT)),'index':i,'code':m.group(1)})
for r in rows:
 source=ROOT/r['source']
 if hashlib.sha256(source.read_bytes()).hexdigest()!=r['source_sha256']:errors.append('source hash mismatch: '+r['source'])
 if r['status']!='translated':continue
 target=ROOT/r['translation'];s=target.read_text()
 if r['source_url'] not in s:errors.append('missing source URL: '+r['translation'])
 if r['book']!='boot':continue
 slug=target.stem;folder=ROOT/'rendered-sources/boot-4.1.1'
 codepath=folder/(slug+'.codes.json')
 if not codepath.exists():continue
 expected=Counter(json.loads(codepath.read_text()))
 actual=Counter(m.group() for m in CODE.finditer(s))
 missing=expected-actual
 if missing:errors.append(f'modified or missing original code blocks: {slug} ({sum(missing.values())})')
 original=(folder/(slug+'.translate.md')).read_text()
 draft=ROOT/'translations'/(slug+'.zh.md')
 zh=draft.read_text() if draft.exists() else CODE.sub('',s)
 zhmain=zh.split('## 譯者')[0]
 enhead=re.findall(r'^#{1,6} ',original,re.M);zhhead=re.findall(r'^#{1,6} ',zhmain,re.M)
 entable=[line for line in original.splitlines() if line.startswith('|')]
 zhtable=[line for line in zhmain.splitlines() if line.startswith('|')]
 if len(zhhead)<len(enhead):errors.append(f'missing headings: {slug} {len(zhhead)}/{len(enhead)}')
 if len(zhtable)<len(entable):warnings.append(f'table rows: {slug} {len(zhtable)}/{len(entable)}')
 eninline=set(re.findall(r'`([^`\n]+)`',original))
 zhinline=set(re.findall(r'`([^`\n]+)`',zh))
 missing_inline=sorted(eninline-zhinline)
 if missing_inline:warnings.append({'page':slug,'inline_code_needing_review':missing_inline})
 metapath=folder/(slug+'.json');meta=json.loads(metapath.read_text())
 htmlpath=folder/(slug+'.html')
 if hashlib.sha256(htmlpath.read_bytes()).hexdigest()!=meta['html_sha256']:errors.append('rendered source hash mismatch: '+slug)
 coverage.append({'page':slug,'original_code_blocks':sum(expected.values()),'source_headings':len(enhead),'translated_headings':len(zhhead),'source_table_lines':len(entable),'translated_table_lines':len(zhtable)})
boot=[r for r in rows if r['book']=='boot']
bootdone=sum(r['status']=='translated' for r in boot)
if '--require-boot-complete' in sys.argv and bootdone!=len(boot):errors.append(f'Boot incomplete: {bootdone}/{len(boot)}')
report={'errors':errors,'review_notes':warnings,'diagrams':len(diagrams),'boot_translated_pages':bootdone,'boot_source_pages':len(boot),'translated_pages':sum(r['status']=='translated' for r in rows),'source_pages':len(rows),'rendered_source_coverage':coverage}
(ROOT/'validation').mkdir(exist_ok=True)
(ROOT/'validation/content-check.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
(ROOT/'validation/diagrams.json').write_text(json.dumps(diagrams,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({k:v for k,v in report.items() if k!='rendered_source_coverage'},ensure_ascii=False,indent=2))
raise SystemExit(1 if errors else 0)
