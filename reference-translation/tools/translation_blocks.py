"""Prepare code-preserving translation inputs and assemble explicitly translated pages."""
from pathlib import Path
import json,re,sys
ROOT=Path(__file__).resolve().parents[1]
SNAP=ROOT/'rendered-sources/boot-4.1.1'
CODE=re.compile(r'^((?:> )*)```[^\n]*\n.*?^\1```[ \t]*$',re.M|re.S)
def prepare():
 for p in SNAP.glob('*.en.md'):
  blocks=[]
  def replace(m):
   blocks.append(m.group());return f'{{{{CODE_{len(blocks)-1}}}}}'
  text=CODE.sub(replace,p.read_text())
  stem=p.name[:-6]
  (SNAP/(stem+'.translate.md')).write_text(text)
  (SNAP/(stem+'.codes.json')).write_text(json.dumps(blocks,ensure_ascii=False,indent=2)+'\n')
def assemble(slug):
 draft=ROOT/'translations'/f'{slug}.zh.md'
 text=draft.read_text()
 codes=json.loads((SNAP/f'{slug}.codes.json').read_text())
 used=re.findall(r'\{\{CODE_(\d+)\}\}',text)
 if sorted(map(int,used))!=list(range(len(codes))):raise ValueError(f'{slug}: code coverage mismatch')
 refs=(SNAP/f'{slug}.refs.md').read_text()
 ids=set(re.findall(r'\]\[(r\d+)\]',text));defined=set(re.findall(r'^\[(r\d+)\]:',refs,re.M))
 if ids-defined:raise ValueError(f'Undefined references: {ids-defined}')
 labels={'NOTE':'注意','TIP':'提示','WARNING':'警告','IMPORTANT':'重要','CAUTION':'警示'}
 text=re.sub(r'(?m)^(>\s*)\[(NOTE|TIP|WARNING|IMPORTANT|CAUTION)\][ \t]*$',
             lambda m:m.group(1)+'**'+labels[m.group(2)]+'：**',text)
 text=re.sub(r'\[(r\d+)\]',lambda m:'['+slug+'-'+m.group(1)+']',text)
 refs=re.sub(r'^\[(r\d+)\]:',lambda m:'['+slug+'-'+m.group(1)+']:',refs,flags=re.M)
 for i,code in enumerate(codes):text=text.replace('{{CODE_'+str(i)+'}}',code)
 meta=json.loads((SNAP/f'{slug}.json').read_text())
 rel=slug.replace('--','/')+'.adoc'
 source=f'sources/spring-boot/documentation/spring-boot-docs/src/docs/antora/modules/reference/pages/{rel}'
 url='https://github.com/spring-projects/spring-boot/blob/v4.1.1/'+source.split('sources/spring-boot/',1)[1]
 title,body=text.split('\n',1)
 header=f'''\n\n<!-- source-attribution -->
> **非官方繁體中文翻譯** · Spring Boot 4.1.1 · 翻譯日期：2026-10-21  
> [官方英文網站]({meta['url']}) · [固定版本英文來源]({url}) · [本地原文快照](../{source})  
> 原始作者與授權見 [來源聲明](../NOTICE.md)。官方範例及設定鍵保留原文，額外圖解另標示為譯者補充。

<!-- translation-status: translated -->\n\n'''
 (ROOT/'boot'/f'{slug}.md').write_text(title+header+body.strip()+'\n\n'+refs)
 print('assembled',slug,'code blocks',len(codes))
if __name__=='__main__':
 if len(sys.argv)==1:prepare()
 else:
  for slug in sys.argv[1:]:assemble(slug)
