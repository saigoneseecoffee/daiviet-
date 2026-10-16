import harness as H
from playwright.sync_api import sync_playwright
H.HTML='/home/claude/dvhk/dist/styles_test.html'
with sync_playwright() as p:
    b,ctx,pg,errs=H.open_page(p,dict(viewport={'width':400,'height':400}),clear=False)
    print(pg.evaluate("""()=>{const c=document.createElement('canvas');c.width=800;c.height=800;const g=c.getContext('2d');const L=factionLook('han','spear');
     const cnt={};const P=CanvasRenderingContext2D.prototype;for(const k of ['stroke','fill','fillRect','arc','ellipse','quadraticCurveTo','save','restore','clip','createLinearGradient','bezierCurveTo','beginPath']){const o=P[k];g[k]=function(){cnt[k]=(cnt[k]||0)+1;return o.apply(this,arguments)}}
     drawHuman(g,{x:200,y:300,f:1,look:L,t:1,walk:1,moving:true,atk:-1,sc:1.1});return cnt}"""))
    b.close()
