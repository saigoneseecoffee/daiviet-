"""Ảnh chụp 12 chương: bản đồ có trại + quái, kiểm tra vùng đi được.  python3 chapters_maps.py [chỉ số chương...]"""
import sys, json, os
os.environ.setdefault('DVHK_HTML', '/home/claude/wt_chapters/dist/agent_chapters.html')
from harness import *
idx = [int(a) for a in sys.argv[1:]] or list(range(12))
with sync_playwright() as p:
    b, ctx, pg, errs = open_page(p, PHONE)
    pg.click('#tNew'); pg.click('[data-c="kiem"]'); pg.click('#goBtn'); pg.wait_for_timeout(300); pg.click('#stGo')
    pg.evaluate("G.save.set.sfx=false;G.save.set.music=false;G.save.unlocked=12")
    for mi in idx:
        info = pg.evaluate("""(mi)=>{const M=MAPS[mi];G.save.lvl=M.lv[0];recalc();travel(mi,false);const W=G.W;
          let reach=0;for(let i=0;i<W.reach.length;i++)reach+=W.reach[i];
          const ai=Math.floor(W.arena.y/T)*MW+Math.floor(W.arena.x/T);
          return{name:M.name,reach,spawn:W.spawnTiles.length,arena:!!W.reach[ai],objs:W.objs.length,en:G.enemies.length}}""", mi)
        print(mi, json.dumps(info, ensure_ascii=False), flush=True)
        # cảnh trại (thị trấn) và quái ngoài trại
        pg.evaluate("G.p.x=G.W.camp.x+760;G.p.y=G.W.camp.y-760;G.cam.x=G.p.x;G.cam.y=G.p.y;G.p.ifr=99")
        pg.wait_for_timeout(900); pg.screenshot(path=f'shots/ch/map{mi:02d}_a.png')
        pg.evaluate("(()=>{const q=G.W.pathPts[Math.floor(G.W.pathPts.length*0.55)];G.p.x=q.x;G.p.y=q.y;G.cam.x=q.x;G.cam.y=q.y;for(let k=0;k<4;k++)trySpawnPack(150,420)})()")
        pg.wait_for_timeout(900); pg.screenshot(path=f'shots/ch/map{mi:02d}_b.png')
        ov = pg.evaluate("(()=>{const c=document.createElement('canvas');c.width=256;c.height=256;const g=c.getContext('2d');g.imageSmoothingEnabled=false;g.drawImage(G.W.mini,0,0,256,256);return c.toDataURL()})()")
        import base64; open(f'shots/ch/mini{mi:02d}.png','wb').write(base64.b64decode(ov.split(',')[1]))
    print('errors', errs[:8])
    b.close()
