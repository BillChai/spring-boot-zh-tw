import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import MarkdownIt from 'markdown-it';
import hljs from 'highlight.js';
import {load} from 'cheerio';
const here=path.dirname(fileURLToPath(import.meta.url)),root=path.resolve(here,'..'),ref=path.join(root,'reference-translation'),out=path.join(here,'dist');
const repo='BillChai/spring-boot-zh-tw';
const base=process.env.BASE_PATH||'/';
if(!/^\/(?:[\w-]+\/)*$/.test(base))throw Error('BASE_PATH must begin and end with /');
const url=p=>base+p;
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
fs.rmSync(out,{recursive:true,force:true});fs.mkdirSync(out,{recursive:true});
const manifest=JSON.parse(fs.readFileSync(path.join(ref,'manifest.json')));
const labels={using:'使用 Spring Boot 開發',features:'核心功能',web:'Web',data:'資料存取',io:'I/O',messaging:'訊息',security:'安全性',testing:'測試',packaging:'封裝與部署',actuator:'Actuator'};
const pages=manifest.filter(r=>r.book==='boot'&&r.status==='translated').map(r=>({file:path.join(ref,r.translation),title:r.translated_title,url:'reference/'+path.basename(r.translation,'.md').replaceAll('--','/')+'.html',group:labels[path.basename(r.translation).split('--')[0]]||'文件總覽',row:r}));
pages.push(...[['ECOSYSTEM','生態系導讀'],['NOTICE','來源與授權'],['VALIDATION','檢查結果']].map(([n,title])=>({file:path.join(ref,n+'.md'),url:'community/'+n.toLowerCase()+'.html',title,group:'社群與貢獻'})),... [['translation-research','術語與翻譯資源'],['CONTRIBUTING','貢獻指南'],['UPSTREAM-ISSUES','原文問題追蹤']].map(([n,title])=>({file:path.join(root,n+'.md'),url:'community/'+n.toLowerCase()+'.html',title,group:'社群與貢獻'})));
const pageMap=new Map(pages.map(p=>[p.file,p.url])),copied=new Set(),rendered=new Map(),search=[];
function localLink(href,file){
 if(/^(?:[a-z][a-z0-9+.-]*:|#|\/\/)/i.test(href))return href;
 const i=href.indexOf('#'),raw=i<0?href:href.slice(0,i),hash=i<0?'':href.slice(i);
 if(!raw)return href;
 const target=path.resolve(path.dirname(file),decodeURIComponent(raw));
 if(pageMap.has(target))return url(pageMap.get(target))+hash;
 if(!target.startsWith(root+path.sep)||!fs.existsSync(target)||!fs.statSync(target).isFile())throw Error('Missing book link: '+file+' -> '+href);
 const rel='files/'+path.relative(root,target).split(path.sep).join('/');
 if(!copied.has(target)){fs.mkdirSync(path.dirname(path.join(out,rel)),{recursive:true});fs.copyFileSync(target,path.join(out,rel));copied.add(target);}
 return url(rel)+hash;
}
const normalize=s=>s.trim().split('\n').map(l=>l.trim()).join('\n');
function sourceTabGroups(p){
 const slug=path.basename(p.file,'.md'),file=path.join(ref,'rendered-sources/boot-4.1.1',slug+'.html');
 if(!fs.existsSync(file))return [];
 const $=load(fs.readFileSync(file,'utf8')),groups=[];
 $('.tabs').each((_,el)=>{const panels=$(el).find('.tabpanel');const group=[];
 panels.each((_,panel)=>{const codes=$(panel).find('pre code');if(codes.length===1){const c=codes.first();group.push({lang:c.attr('data-lang')||c.attr('class')?.match(/language-(\S+)/)?.[1],text:normalize(c.text())});}});
 if(group.length===panels.length&&group.length>1&&new Set(group.map(g=>g.lang)).size===group.length)groups.push(group);
 });return groups;
}
let tabsets=0,codeCount=0;
for(const p of pages){
 const text=fs.readFileSync(p.file,'utf8').replace(/\u0000/g,'␀').replace(/\*\*(注意|提示|警告|重要|警示)：\*\*(?=\S)/g,'**$1：** ');
 const md=new MarkdownIt({html:true,highlight:(s,lang)=>hljs.getLanguage(lang)?hljs.highlight(s,{language:lang,ignoreIllegals:true}).value:esc(s)});
 md.renderer.rules.fence=(ts,i,opts)=>{const t=ts[i],lang=t.info.trim().split(/\s/)[0];if(lang==='mermaid')return '<div class="diagram"><pre class="mermaid">'+esc(t.content)+'</pre></div>';codeCount++;return '<div class="code-block"><div class="code-tools"><span>'+esc(lang||'text')+'</span><button class="copy" type="button">複製</button></div><pre><code class="hljs language-'+esc(lang)+'">'+opts.highlight(t.content,lang)+'</code></pre></div>';};
 const tokens=md.parse(text,{}),toc=[],ids=new Map();
 function walk(ts){for(let i=0;i<ts.length;i++){const t=ts[i];for(const attr of ['href','src'])if(t.attrGet(attr))t.attrSet(attr,localLink(t.attrGet(attr),p.file));if(t.type==='heading_open'){const title=ts[i+1].content.replace(/`/g,''),stem=title.toLowerCase().replace(/[^\p{L}\p{N}_\s-]/gu,'').replace(/\s/g,'-'),count=ids.get(stem)||0;ids.set(stem,count+1);const id=stem+(count?'-'+count:'');t.attrSet('id',id);if(t.tag==='h1')t.attrSet('class','page');if(['h2','h3'].includes(t.tag))toc.push({title,id,level:t.tag});}if(t.children)walk(t.children);}}
 walk(tokens);
 const groups=sourceTabGroups(p);let body='';
 for(let i=0;i<tokens.length;){const t=tokens[i];let group;
 if(t.type==='fence')group=groups.find(g=>{const next=tokens.slice(i,i+g.length);return next.length===g.length&&next.every(n=>n.type==='fence')&&g.every(c=>next.some(n=>n.info.trim()===c.lang&&normalize(n.content)===c.text));});
 if(group){const code=tokens.slice(i,i+group.length).sort((a,b)=>Number(b.info.trim()==='kotlin')-Number(a.info.trim()==='kotlin'));const id='code-tabs-'+(++tabsets);body+='<div class="code-tabs"><div role="tablist" aria-label="程式語言">'+code.map((c,j)=>`<button role="tab" id="${id}-${j}-tab" aria-controls="${id}-${j}" aria-selected="${j===0}" tabindex="${j===0?0:-1}">${esc(c.info.trim())}</button>`).join('')+'</div>'+code.map((c,j)=>`<div role="tabpanel" id="${id}-${j}" aria-labelledby="${id}-${j}-tab" ${j?'hidden':''}>${md.renderer.render([c],md.options,{})}</div>`).join('')+'</div>';i+=group.length;}
 else{body+=md.renderer.render([t],md.options,{});i++;}}
 const $=load(body,null,false);
 $('a[href],img[src]').each((_,el)=>{const a=el.tagName==='img'?'src':'href',v=$(el).attr(a);if(!v.startsWith(base)&&!/^([a-z]+:|#|\/\/)/i.test(v))$(el).attr(a,localLink(v,p.file));});
 const groupNames=[...new Set(pages.map(x=>x.group))];
 const nav=groupNames.map(g=>'<details '+(p.group===g?'open':'')+'><summary>'+esc(g)+'</summary>'+pages.filter(x=>x.group===g).map(x=>'<a '+(x===p?'aria-current="page" ':'')+'href="'+url(x.url)+'">'+esc(x.title)+'</a>').join('')+'</details>').join('');
 const draft=path.join(ref,'translations',path.basename(p.file,'.md')+'.zh.md');
 const editPath=path.relative(root,fs.existsSync(draft)?draft:p.file).split(path.sep).join('/');
 const idx=pages.indexOf(p),prev=pages[idx-1],next=pages[idx+1];
 const landing=p.url==='reference/index.html'?'<section><h2 id="閱讀章節">閱讀章節</h2><ul>'+Object.keys(labels).map(k=>{const x=pages.find(x=>path.basename(x.file)===k+'--index.md');return x?'<li><a href="'+url(x.url)+'">'+labels[k]+'</a></li>':'';}).join('')+'</ul><p>本版完成 89 個來源頁面翻譯，尚待持續人工校對。<a href="'+url('community/contributing.html')+'">參與貢獻</a>。</p></section>':'';
 const html=`<!doctype html><html lang="zh-Hant-TW"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="description" content="Spring Boot 4.1.1 Reference 非官方繁體中文翻譯，含 Kotlin 範例、Mermaid 圖解及英文來源。"><title>${esc(p.title)} :: Spring Boot 繁體中文文件・非官方</title><script src="${url('assets/theme.js')}"></script><link rel="stylesheet" href="${url('assets/spring-ui/css/vars.css')}"><link rel="stylesheet" href="${url('assets/spring-ui/css/doc.css')}"><link rel="stylesheet" href="${url('assets/spring-ui/css/highlight.css')}"><link rel="stylesheet" href="${url('assets/style.css')}"><script type="module" src="${url('assets/app.js')}"></script></head><body><a class="skip" href="#content">跳至正文</a><header class="site-header"><a class="brand" href="${url('index.html')}">Spring Boot <span>繁體中文文件・非官方</span></a><div><a href="https://github.com/${repo}">GitHub</a><button id="theme" aria-label="切換明暗主題" title="切換明暗主題">◐</button><button id="menu" aria-expanded="false" aria-controls="chapters">目錄</button></div></header><div class="layout"><aside id="chapters" class="sidebar"><div class="component">Spring Boot <span class="version">4.1.1</span></div><label class="sr-only" for="search">搜尋文件</label><input id="search" type="search" placeholder="搜尋文件　⌘ / Ctrl + K"><div id="results" role="status" aria-live="polite"></div><nav aria-label="章節導覽">${nav}</nav><a class="contribute-link" href="${url('community/contributing.html')}">參與校對與貢獻 ↗</a></aside><main id="content"><div class="toolbar"><nav class="breadcrumbs" aria-label="麵包屑"><a href="${url('index.html')}">Spring Boot</a> / ${esc(p.group)} / ${esc(p.title)}</nav><a class="edit" href="https://github.com/${repo}/edit/main/${editPath}">編輯此頁</a></div><article class="doc">${$.html()}${landing}<div class="contribute"><a href="https://github.com/${repo}/issues/new?template=translation.yml">回報翻譯問題</a></div><nav class="pager" aria-label="前後章節">${prev?'<a href="'+url(prev.url)+'">← '+esc(prev.title)+'</a>':'<span></span>'}${next?'<a href="'+url(next.url)+'">'+esc(next.title)+' →</a>':''}</nav><footer>非官方社群翻譯，未經 Spring 官方審核。<a href="${url('community/notice.html')}">來源、授權與修改聲明</a></footer></article></main><aside class="toc"><div>${esc(p.title)}</div>${toc.map(t=>'<a class="'+t.level+'" href="#'+t.id+'">'+esc(t.title)+'</a>').join('')}</aside></div></body></html>`;
 fs.mkdirSync(path.dirname(path.join(out,p.url)),{recursive:true});fs.writeFileSync(path.join(out,p.url),html);rendered.set(p.url,html);
 search.push({title:p.title,url:p.url,group:p.group,text:tokens.filter(t=>t.type==='inline').map(t=>t.content).join(' ')});
}
const home=rendered.get('reference/index.html');fs.writeFileSync(path.join(out,'index.html'),home);rendered.set('index.html',home);
fs.mkdirSync(path.join(out,'assets'),{recursive:true});
for(const n of ['style.css','app.js','theme.js'])fs.copyFileSync(path.join(here,n),path.join(out,'assets',n));
fs.cpSync(path.join(here,'vendor/spring-ui'),path.join(out,'assets/spring-ui'),{recursive:true});
fs.cpSync(path.join(here,'node_modules/mermaid/dist'),path.join(out,'assets/mermaid'),{recursive:true});
fs.copyFileSync(path.join(here,'node_modules/mermaid/LICENSE'),path.join(out,'assets/mermaid/LICENSE'));
fs.writeFileSync(path.join(out,'search.json'),JSON.stringify(search));fs.writeFileSync(path.join(out,'.nojekyll'),'');
const errors=[];
for(const [name,html]of rendered){const $=load(html),ids=new Set();$('[id]').each((_,e)=>{const id=$(e).attr('id');if(ids.has(id))errors.push(name+' duplicate id '+id);ids.add(id);});$('a[href],img[src],script[src],link[href]').each((_,e)=>{const href=$(e).attr('href')||$(e).attr('src');if(/^(?:[a-z]+:|\/\/)/i.test(href))return;const [target,fragment]=href.split('#');const rel=target?target.slice(base.length):name;if(!fs.existsSync(path.join(out,decodeURIComponent(rel))))errors.push(name+' missing '+href);if(fragment&&rendered.has(rel)){const doc=load(rendered.get(rel));const wanted=decodeURIComponent(fragment);if(!doc('[id]').toArray().some(el=>doc(el).attr('id')===wanted)&&!doc('a[name]').toArray().some(el=>doc(el).attr('name')===wanted))errors.push(name+' missing anchor '+href);}});if(html.includes('/Users/chaiyomin/')||html.includes('/tmp/spring-boot-zh-tw-work')||html.includes('/private/tmp/spring-boot-zh-tw-work'))errors.push(name+' local absolute path');}
if(errors.length)throw Error(errors.slice(0,30).join('\n'));
const report={pages:pages.length,bootPages:manifest.filter(r=>r.book==='boot'&&r.status==='translated').length,codeBlocks:codeCount,officialTabGroups:tabsets,attachments:copied.size,basePath:base,errors};
fs.writeFileSync(path.join(out,'build-report.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report));
