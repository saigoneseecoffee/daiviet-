from harness import *
import sys
harness_html=sys.argv[1]
import harness as H
H.HTML=harness_html
with sync_playwright() as p:
    b,ctx,pg,errs=H.open_page(p,dict(viewport={'width':400,'height':400}),clear=False)
    print(pg.evaluate("""()=>{const c=document.createElement('canvas');c.width=800;c.height=800;const g=c.getContext('2d');const L=factionLook('han','spear');
      let t0=performance.now();for(let i=0;i<2000;i++)drawHuman(g,{x:200+i%300,y:300,f:1,look:L,t:i*0.01,walk:i*0.1,moving:true,atk:-1,sc:1.1});g.getImageData(0,0,1,1);return (performance.now()-t0)/2000}"""))
    b.close()
