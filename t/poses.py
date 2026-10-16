import sys
sys.path.insert(0,'/home/claude/dvhk/t')
import harness
from playwright.sync_api import sync_playwright
harness.HTML='/home/claude/dvhk/dist/styles_test.html'
JS=r'''
(args)=>{const [mode,S]=args;document.body.innerHTML='';const c=document.createElement('canvas');const W=1500,H=mode==='enemy'?520:1180;c.width=W;c.height=H;document.body.appendChild(c);document.body.style.background='#6f8a52';
const g=c.getContext('2d');g.fillStyle='#7d9a5c';g.fillRect(0,0,W,H);
let rows;
if(mode==='enemy'){rows=[['phi','sword'],['han','spear'],['minh','shield'],['nguyen','bow'],['thanh','sword'],['trieu','bomb']].map(([f,w])=>factionLook(f,w));
  rows.forEach((L,i)=>{const x=130+i*240,y=230;drawHuman(g,{x,y,f:1,look:L,t:0.5,atk:-1,sc:S});drawHuman(g,{x,y:480,f:-1,look:L,t:1,atk:0.4,sc:S,walk:0,moving:false})});return}
const ids=['kiem','cung','giao','dao','con','phap'];
ids.forEach((id,i)=>{const L=LOOKS[id];const y=170+i*0;});
const cols=[{atk:-1,mv:0,w:0},{atk:-1,mv:1,w:0},{atk:-1,mv:1,w:1.57},{atk:-1,mv:1,w:3.14},{atk:0.12,mv:0},{atk:0.35,mv:0},{atk:0.6,mv:0}];
ids.forEach((id,r)=>{cols.forEach((cc,ci)=>{const x=110+ci*205,y=r<3?0:0;});});
// 6 classes x 7 poses at scale S
ids.forEach((id,r)=>{const L=LOOKS[id];cols.forEach((cc,ci)=>{const x=90+ci*210,y=180+r*190;drawHuman(g,{x,y,f:1,look:L,t:0.7,atk:cc.atk,moving:!!cc.mv,walk:cc.w||0,sc:S,glow:0})})});
}
'''
mode=sys.argv[1] if len(sys.argv)>1 else 'all'
S=float(sys.argv[2]) if len(sys.argv)>2 else 2.6
with sync_playwright() as p:
    b,ctx,pg,errs=harness.open_page(p,dict(viewport={'width':1500,'height':1180}),clear=False)
    pg.evaluate(JS,[mode,S])
    pg.screenshot(path=f'/home/claude/dvhk/t/shots/poses_{mode}.png')
    print([e for e in errs if 'WebGL' not in e[1] and 'GPU' not in e[1]][:5])
    b.close()
