"""Đo thời gian CPU mỗi khung (update + render) trong trận boss giai đoạn 2/3 ở các chương; so chương cũ với chương mới.
   Đo trực tiếp bằng performance.now quanh update+render nên ít phụ thuộc tải máy.  python3 chapters_perf.py"""
import os, json
os.environ.setdefault('DVHK_HTML', '/home/claude/wt_chapters/dist/agent_chapters.html')
from harness import *
JS='''([mi,ph])=>{const S=G.save,M=MAPS[mi];S.lvl=M.lv[1];S.unlocked=12;S.qs[mi]=M.quest.length-1;S.set.auto=true;
 for(const sl of SLOTS){const it=genItem(S.lvl,2,sl);it.enh=6;S.equip[sl]=it}recalc();travel(mi,false);
 const a=G.W.arena;G.p.x=a.x;G.p.y=a.y+100;G.p.hp=G.p.maxhp=1e9;
 for(let i=0;i<120;i++)update(1/60);if(G.boss&&G.boss.b2&&ph>1){B2.setPhase(ph);for(let i=0;i<200;i++)update(1/60)}
 for(let i=0;i<240;i++){update(1/60);render(1/60);G.p.hp=G.p.maxhp}
 const ts=[];for(let i=0;i<300;i++){const t0=performance.now();update(1/60);render(1/60);ts.push(performance.now()-t0);G.p.hp=G.p.maxhp}
 ts.sort((x,y)=>x-y);return{map:M.name,ph,med:+ts[150].toFixed(2),p95:+ts[285].toFixed(2),hz:B2.hz.length,en:G.enemies.length,parts:G.parts.length}}'''
with sync_playwright() as p:
    b,ctx,pg,errs=open_page(p,PHONE)
    pg.click('#tNew');pg.click('[data-c="phap"]');pg.click('#goBtn');pg.wait_for_timeout(300);pg.click('#stGo')
    pg.evaluate("G.save.set.sfx=false;G.save.set.music=false;G.paused=true")
    for mi,ph in [(9,3),(11,3),(2,2),(2,3),(3,3),(5,2),(5,3),(6,3),(8,2),(8,3),(10,2),(10,3)]:
        print(json.dumps(pg.evaluate(JS,[mi,ph]),ensure_ascii=False),flush=True)
    print('errors',errs[:5]);b.close()
