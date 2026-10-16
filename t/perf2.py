from harness import *
with sync_playwright() as p:
    b,ctx,pg,errs=open_page(p,PHONE)
    pg.click('#tNew');pg.click('[data-c="phap"]');pg.click('#goBtn');pg.wait_for_timeout(300);pg.click('#stGo')
    pg.evaluate("G.save.set.auto=true")
    pg.wait_for_timeout(6000)
    r=pg.evaluate('''()=>new Promise(res=>{const ts=[];let last=performance.now();function f(t){ts.push(t-last);last=t;if(ts.length<240)requestAnimationFrame(f);else{ts.sort((a,b)=>a-b);res({med:ts[120].toFixed(1),p95:ts[228].toFixed(1),cap:G.dprCap,cw:cv.width})}}requestAnimationFrame(f)})''')
    print(r,errs[:2])
