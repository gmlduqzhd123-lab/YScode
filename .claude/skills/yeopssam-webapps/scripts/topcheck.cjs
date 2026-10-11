// 전체 앱 "📲 앱 설치 · 📱 QR" 상단 배치 측정기
// 각 앱을 휴대폰(360·390)·PC(1280) 폭으로 열어 두 버튼의 위치, 맨 윗줄 여부, 가로 넘침, QR 창 동작을 잰다.
// 사용: node scripts/topcheck.cjs [--only Hwp,padlet] [--widths 360,390,1280] [--shots /tmp/ys-shots] [--json out.json]
// 전제: scripts/prepare-local.sh 로 http://localhost:8810/<serve>/ (엽쌤스쿨은 :3100) 가 떠 있어야 한다.
const {chromium}=require('playwright');const fs=require('fs');const path=require('path');
const arg=k=>{const i=process.argv.indexOf('--'+k);return i>0?process.argv[i+1]:null};
const reg=JSON.parse(fs.readFileSync(path.join(__dirname,'..','apps.json'),'utf8')).apps;
const only=arg('only')?arg('only').split(','):null;
const widths=(arg('widths')||'360,390,1280').split(',').map(Number);
const shots=arg('shots')||'/tmp/ys-shots';fs.mkdirSync(shots,{recursive:true});
const UA='Mozilla/5.0 (Linux; Android 14; SM-S921N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0 Mobile Safari/537.36';
const TW=process.env.YS_TAILWIND;
(async()=>{const b=await chromium.launch({executablePath:process.env.YS_CHROMIUM||'/opt/pw-browsers/chromium'});const rows=[];
for(const app of reg){ if(only&&!only.includes(app.repo))continue;
 if(app.mode==='login'){rows.push({name:app.name,note:app.note||'로그인 필요'});continue;}
 const url=app.mode==='next'?`http://localhost:${app.port}/`:`http://localhost:8810/${app.serve}/${app.page||''}`;
 const res={name:app.name,url,w:{}};
 for(const w of widths){const mobile=w<900;const ctx=await b.newContext({viewport:{width:w,height:mobile?780:800},userAgent:mobile?UA:undefined});const p=await ctx.newPage();
  const errs=[];p.on('pageerror',e=>errs.push(e.message.slice(0,90)));
  // For-Teacher 등 Tailwind CDN(cdn.tailwindcss.com)은 이 환경에서 막혀 있어 로컬 사본으로 대신한다
  if(app.tailwindCdn&&TW&&fs.existsSync(TW))await p.route(/cdn\.tailwindcss\.com/,r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync(TW)}));
  try{await p.goto(url,{waitUntil:'load',timeout:30000});}catch(e){errs.push('열기 실패: '+e.message.slice(0,60));}
  await p.waitForTimeout(2500);
  // 첫 방문 안내 창(사용법 등)이 가리면 닫고 잰다
  await p.keyboard.press('Escape').catch(()=>{});
  await p.evaluate(()=>document.querySelectorAll('dialog[open]').forEach(d=>d.close())).catch(()=>{});
  const r=await p.evaluate(()=>{
   const vis=e=>{const s=getComputedStyle(e),q=e.getBoundingClientRect();return q.width>0&&q.height>0&&s.visibility!=='hidden'&&s.display!=='none'&&q.top<innerHeight};
   const box=e=>{const q=e.getBoundingClientRect();return {x:Math.round(q.x),y:Math.round(q.y+scrollY),w:Math.round(q.width),h:Math.round(q.height),r:Math.round(q.right),t:e.textContent.trim().replace(/\s+/g,' ').slice(0,14)}};
   const all=[...document.querySelectorAll('button,a,[role=button]')].filter(vis);
   const pick=(sel,re)=>all.filter(e=>e.matches(sel)||re.test(e.textContent+' '+(e.getAttribute('aria-label')||''))).filter(e=>!/설치 없이/.test(e.textContent)).map(box).sort((a,b)=>a.y-b.y)[0]||null;
   const install=pick('[data-ys-install],.install-btn button,#installApp,.install-button:not(.qr-button)',/앱\s?설치|📲/);
   const qr=pick('[data-qr],#qrApp,.qr-button',/\bQR\b/i);
   // 맨 윗줄 판정: 화면 위쪽 200px 안에서 보이는 글자·버튼 중 가장 위에 있는 것과 높이가 겹치면 "맨 윗줄"
   const tops=[...document.querySelectorAll('body *')].filter(e=>vis(e)&&e.childElementCount===0&&(e.textContent.trim()||e.tagName==='IMG'||e.tagName==='svg')).map(e=>e.getBoundingClientRect()).filter(q=>q.top>=0&&q.top<200&&q.height<120);
   const first=tops.length?Math.min(...tops.map(q=>q.top)):0;
   const firstRow=b=>b?(b.y-first<34):false;
   return {install,qr,first:Math.round(first),installTop:firstRow(install),qrTop:firstRow(qr),sameRow:install&&qr?Math.abs(install.y-qr.y)<12:false,
     overflow:document.documentElement.scrollWidth>innerWidth+1,clipped:[install,qr].some(b=>b&&b.r>innerWidth+1)};});
  // QR 창이 실제로 열리는지(390 폭에서만)
  if(w===390&&r.qr){try{const q=p.locator('[data-qr],#qrApp,.qr-button').filter({visible:true}).first();await q.click({timeout:3000});await p.waitForTimeout(500);
    r.qrOpens=await p.evaluate(()=>{const m=document.querySelector('.yq-back, dialog[open]');const img=m&&m.querySelector('img');return !!(m&&(!img||img.naturalWidth>0||!img.complete))});}catch(e){r.qrOpens=false;}}
  r.errors=errs;res.w[w]=r;
  await p.screenshot({path:path.join(shots,`${app.repo}${app.page?'-'+app.page.replace(/\W/g,'_'):''}-${w}.png`),clip:{x:0,y:0,width:w,height:180}}).catch(()=>{});
  await ctx.close();}
 rows.push(res);}
await b.close();
// 표 출력
const cell=r=>!r?'-':!r.install||!r.qr?`❌ ${!r.install?'설치':''}${!r.qr?' QR':''} 없음`:
 `${r.installTop&&r.qrTop?'✅ 맨 윗줄':(r.sameRow?'⚠️ 둘째 줄':'⚠️ 줄 나뉨')}${r.overflow?' ·가로넘침':''}${r.clipped?' ·잘림':''}${r.errors.length?' ·오류':''}`;
console.log(`| 앱 | ${widths.map(w=>w+'px').join(' | ')} | QR 창 |`);console.log(`|---|${widths.map(()=>'---').join('|')}|---|`);
for(const r of rows){if(r.note){console.log(`| ${r.name} | ${widths.map(()=>'(측정 불가)').join(' | ')} | ${r.note} |`);continue;}
 console.log(`| ${r.name} | ${widths.map(w=>cell(r.w[w])).join(' | ')} | ${r.w[390]?(r.w[390].qrOpens?'✅':'❌'):'-'} |`);}
if(arg('json'))fs.writeFileSync(arg('json'),JSON.stringify(rows,null,1));
console.log(`\n스크린샷: ${shots}`);})();
