from harness import *
with sync_playwright() as p:
    for name,opts,thr in [('phone1x',dict(PHONE,device_scale_factor=1),1)]:
        b,ctx,pg,errs=open_page(p,opts)
        cdp=ctx.new_cdp_session(pg)
        pg.click('#tNew');pg.click('[data-c="phap"]');pg.click('#goBtn');pg.wait_for_timeout(300);pg.click('#stGo')
        pg.evaluate("G.save.set.auto=true;G.save.lvl=12;G.save.skl=[3,3,3];recalc();G.p.hp=G.p.maxhp;for(let k=0;k<25;k++){const a=k/25*TAU;spawnEnemy(pick(['soi','khi','lon','ran']),G.p.x+Math.cos(a)*220,G.p.y+Math.sin(a)*220,3,k%8==0)}")
        cdp.send('Emulation.setCPUThrottlingRate',{'rate':thr})
        r=pg.evaluate('''()=>new Promise(res=>{const ts=[];let last=performance.now();function f(t){ts.push(t-last);last=t;if(ts.length<240)requestAnimationFrame(f);else{ts.sort((a,b)=>a-b);res({med:ts[120].toFixed(1),p95:ts[228].toFixed(1),max:ts[239].toFixed(1),parts:G.parts.length,en:G.enemies.length})}}requestAnimationFrame(f)})''')
        print(name,'throttle',thr,r,errs[:2])
        b.close()
