# 사용: subset.py <앱폴더> <원본 woff2> <출력 woff2>
# 앱이 쓰는 글자 + 자주 쓰는 한글 2,350자(KS X 1001) + 영문·숫자·문장부호만 남긴다.
import os,sys
from fontTools import subset
root,src,dst=sys.argv[1:4]
chars=set()
for dp,dn,fn in os.walk(root):
  dn[:]=[d for d in dn if d not in('.git','node_modules','dist','fonts')]
  for f in fn:
    if f.endswith(('.html','.js','.mjs','.css','.json','.svg','.txt','.md')):
      try: chars|=set(open(os.path.join(dp,f),encoding='utf-8').read())
      except Exception: pass
for hi in range(0xB0,0xC9):
  for lo in range(0xA1,0xFF):
    try: chars|=set(bytes([hi,lo]).decode('euc-kr'))
    except Exception: pass
chars|=set(chr(c) for c in range(0x20,0x7F))|set('·…‘’“”–—→←↑↓•※○●□■△▲▽▼☆★♡♥①②③④⑤⑥⑦⑧⑨⑩')
chars={c for c in chars if ord(c)>=0x20}
opt=subset.Options(); opt.flavor='woff2'; opt.layout_features=['*']; opt.name_IDs=['*']; opt.notdef_outline=True
f=subset.load_font(src,opt); s=subset.Subsetter(opt); s.populate(unicodes=[ord(c) for c in chars]); s.subset(f); subset.save_font(f,dst,opt)
print(os.path.basename(dst), f'{os.path.getsize(src)/1048576:.2f}MB -> {os.path.getsize(dst)/1048576:.2f}MB', len(chars),'chars')
