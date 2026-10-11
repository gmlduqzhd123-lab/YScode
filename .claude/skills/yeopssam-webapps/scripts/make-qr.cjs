// 사용법: node make-qr.cjs <주소> <저장 경로> [이름]
const QR=require('qrcode');const fs=require('fs');
const [url,out,name]=process.argv.slice(2);
QR.toString(url,{type:'svg',errorCorrectionLevel:'M',margin:2,color:{dark:'#000000',light:'#ffffff'}},(e,svg)=>{
 if(e)throw e;
 svg=svg.replace('<svg ','<svg role="img" aria-label="'+(name||'')+' 주소 QR 코드" ').replace(/\n/g,'');
 fs.writeFileSync(out,svg+'\n');console.log(out,svg.length);});
