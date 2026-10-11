// 모음집 카드 커버(1200x630 JPG) 만들기 — 다른 앱 커버와 같은 형식:
// 어두운 바탕 + 색 번짐, 왼쪽 큰 제목(둘째 줄은 강조색), 오른쪽 둥근 큰 타일 + 작은 타일 4개.
// 사용: node make-cover.cjs --out covers/xxx.jpg --line1 "지도안" --line2 "대백과" [--line3 "Remake"]
//        --color "#10b981" (강조색) --main "📚" 또는 --main-img path.png --minis "📝,🔍,🏫,📄" 또는 --mini-imgs a.png,b.png,c.png,d.png
// 같은 그림을 og-image.jpg(공유 미리보기)로도 쓴다.
const {chromium}=require('playwright');const fs=require('fs');const path=require('path');
const a={};for(let i=2;i<process.argv.length;i+=2)a[process.argv[i].replace(/^--/,'')]=process.argv[i+1];
const uri=p=>'data:image/png;base64,'+fs.readFileSync(p).toString('base64');
const hex=a.color||'#f97316';const rgb=[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16)).join(',');
const font=process.env.YS_FONT&&fs.existsSync(process.env.YS_FONT)?`@font-face{font-family:PV;src:url(data:font/woff2;base64,${fs.readFileSync(process.env.YS_FONT).toString('base64')}) format('woff2');font-weight:100 900}`:'';
const lines=[a.line1,a.line2,a.line3].filter(Boolean);
const big=lines.length>2?104:118;
const title=lines.map((t,i)=>i===0?t:`<span>${t}</span>`).join('<br>');
const main=a['main-img']?`<img src="${uri(a['main-img'])}" style="width:250px;height:250px;object-fit:contain">`:(a.main||'✨');
const minis=(a['mini-imgs']?a['mini-imgs'].split(',').map(p=>`<img src="${uri(p)}" style="width:72px;height:72px;object-fit:contain">`):(a.minis||'⭐,✏️,📌,💡').split(','));
const pos=[['700px','95px',-8],['1060px','80px',8],['1075px','400px',-6],['715px','440px',7]];
const html=`<!doctype html><meta charset="utf-8"><style>${font}
body{margin:0;width:1200px;height:630px;overflow:hidden;background:#111218;font-family:PV,'Pretendard',sans-serif}
.bg{position:absolute;inset:0;background:radial-gradient(520px 420px at 80% 30%,rgba(${rgb},.5),transparent 70%),radial-gradient(480px 380px at 22% 95%,rgba(59,130,246,.32),transparent 70%),radial-gradient(500px 400px at 62% 110%,rgba(250,204,21,.22),transparent 70%)}
h1{position:absolute;left:84px;top:50%;transform:translateY(-50%);margin:0;color:#fff;font-size:${big}px;line-height:1.08;font-weight:900;letter-spacing:-4px}h1 span{color:${hex};filter:brightness(1.35)}
.tile{position:absolute;left:770px;top:150px;width:300px;height:300px;border-radius:56px;background:rgba(255,255,255,.12);border:2px solid rgba(255,255,255,.18);box-shadow:0 30px 60px rgba(0,0,0,.45);display:flex;align-items:center;justify-content:center;transform:rotate(-4deg);font-size:170px}
.mini{position:absolute;width:96px;height:96px;border-radius:24px;background:rgba(20,22,30,.85);border:2px solid rgba(255,255,255,.14);display:flex;align-items:center;justify-content:center;box-shadow:0 14px 30px rgba(0,0,0,.4);font-size:54px}
</style><div class="bg"></div><h1>${title}</h1><div class="tile">${main}</div>${minis.slice(0,4).map((m,i)=>`<div class="mini" style="left:${pos[i][0]};top:${pos[i][1]};transform:rotate(${pos[i][2]}deg)">${m}</div>`).join('')}`;
(async()=>{const b=await chromium.launch({executablePath:process.env.YS_CHROMIUM||'/opt/pw-browsers/chromium'});const p=await b.newPage({viewport:{width:1200,height:630}});
await p.setContent(html);await p.waitForTimeout(600);fs.mkdirSync(path.dirname(path.resolve(a.out)),{recursive:true});
await p.screenshot({path:a.out,type:'jpeg',quality:85});await b.close();console.log('cover saved:',a.out);})();
