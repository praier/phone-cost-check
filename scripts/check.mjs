import {readdir,readFile,stat} from 'node:fs/promises';
import {resolve} from 'node:path';
import {config} from '../src/config.mjs';
async function walk(dir){let out=[];for(const f of await readdir(dir,{withFileTypes:true})){const p=dir+'/'+f.name;if(f.isDirectory())out.push(...await walk(p));else out.push(p);}return out;}
const files=await walk('dist'),html=files.filter(f=>f.endsWith('.html')),errors=[];
let links=0;
for(const f of html){const text=await readFile(f,'utf8');for(const pattern of [/<html lang="ko">/,/<title>.+<\/title>/,/name="description"/,/rel="canonical"/,/property="og:title"/,/name="twitter:card"/,/<h1[ >]/])if(!pattern.test(text))errors.push(`${f}: missing ${pattern}`);if((text.match(/<h1[ >]/g)||[]).length!==1)errors.push(f+': H1 count');for(const m of text.matchAll(/(?:href|src)="([^"]+)"/g)){let p=m[1].split(/[?#]/)[0];if(!p.startsWith('/'))continue;links++;if(config.basePath)p=p.slice(config.basePath.length);const path=resolve('dist','.'+p+(p.endsWith('/')?'index.html':''));try{await stat(path);}catch{errors.push(`${f}: missing local link ${m[1]}`);}}if(/Lorem ipsum|undefined|NaN/.test(text))errors.push(f+': invalid rendered content');}
const bytes=(await Promise.all(files.map(f=>stat(f)))).reduce((s,x)=>s+x.size,0);
if(errors.length){console.error(errors.join('\n'));process.exitCode=1;}else console.log(`PASS: ${html.length} HTML pages; ${links} internal links/assets; metadata/H1 checks. Static total ${(bytes/1024).toFixed(1)} KiB.`);
