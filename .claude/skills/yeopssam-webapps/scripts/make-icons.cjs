// 앱 설치 아이콘 만들기: icon-192.png, icon-512.png, icon-maskable-512.png, apple-touch-icon.png, favicon-32.png
// 사용: node make-icons.cjs --out <폴더> (--emoji "📚" | --img 캐릭터.png | --svg 로고.svg) [--from "#3d82f0" --to "#1d4fae"]
// 둥근 모서리는 기기가 알아서 깎으므로 사각형으로 꽉 채워 만든다. maskable 은 안전영역 때문에 그림을 작게 넣는다.
const {chromium}=require('playwright');const fs=require('fs');
const a={};for(let i=2;i<process.argv.length;i+=2)a[process.argv[i].replace(/^--/,'')]=process.argv[i+1];
const from=a.from||'#3d82f0',to=a.to||'#1d4fae';
const inner=s=>a.img?`<img src="data:image/png;base64,${fs.readFileSync(a.img).toString('base64')}" style="width:${s}px;height:${s}px;object-fit:contain">`
 :a.svg?fs.readFileSync(a.svg,'utf8').replace('<svg',`<svg width="${s}" height="${s}"`):`<span style="font-size:${Math.round(s*.82)}px;line-height:1">${a.emoji||'✨'}</span>`;
(async()=>{const b=await chromium.launch({executablePath:process.env.YS_CHROMIUM||'/opt/pw-browsers/chromium'});fs.mkdirSync(a.out,{recursive:true});
for(const [size,file,pad] of [[192,'icon-192.png',.78],[512,'icon-512.png',.78],[512,'icon-maskable-512.png',.56],[180,'apple-touch-icon.png',.78],[32,'favicon-32.png',.9]]){
 const p=await b.newPage({viewport:{width:size,height:size}});
 await p.setContent(`<body style="margin:0"><div style="width:${size}px;height:${size}px;background:linear-gradient(145deg,${from},${to});display:flex;align-items:center;justify-content:center">${inner(Math.round(size*pad))}</div>`);
 await p.waitForTimeout(150);await p.screenshot({path:`${a.out}/${file}`});await p.close();}
await b.close();console.log('icons saved to',a.out);})();
