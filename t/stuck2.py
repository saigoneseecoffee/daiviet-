from harness import *
with sync_playwright() as p:
    b,ctx,pg,errs=open_page(p,DESK)
    r=pg.evaluate('''()=>{const W=makeWorld(1);const tx=54,ty=38,i=ty*MW+tx;return {reach:W.reach[i],walk:W.walk[i],obj:W.ogrid[i]&&W.ogrid[i].map(o=>[o.k,o.cr,o.x,o.y]),solid:W.solid[i]}}''')
    print(r)
