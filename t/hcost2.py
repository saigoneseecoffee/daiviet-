import harness as H
from playwright.sync_api import sync_playwright
H.HTML='/home/claude/dvhk/dist/styles_test.html'
JS="""()=>{const c=document.createElement('canvas');c.width=800;c.height=800;const g=c.getContext('2d');const L=factionLook('han','spear');
 let t0=performance.now();for(let i=0;i<2000;i++)drawHuman(g,{x:200+i%300,y:300,f:1,look:L,t:i*0.01,walk:i*0.1,moving:true,atk:-1,sc:1.1});g.getImageData(0,0,1,1);return (performance.now()-t0)/2000}"""
with sync_playwright() as p:
    b,ctx,pg,errs=H.open_page(p,dict(viewport={'width':400,'height':400}),clear=False)
    print('new',pg.evaluate(JS),pg.evaluate(JS))
    old=open('/tmp/claude-0/-home-claude/9eb09136-f731-5430-842c-13875ec3acbe/scratchpad/human.old.js').read().replace('const ','var ')
    a=old.index('var easeOutC');a=old.index('function _lgH');bb=old.index('var WLEN');old=old[a:bb].replace('function _lgH','var _x=function(){};function _lgH')
    pg.evaluate("s=>{(0,eval)(s)}",old)
    print('old',pg.evaluate(JS),pg.evaluate(JS))
    b.close()
