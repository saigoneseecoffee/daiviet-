"""Ảnh đại chiêu (vòng ấn trống đồng / Bát Quái) cho vài phái: python3 outfit_vfx.py <tag>"""
import sys
from harness import *
from tower_lib import new_game
TAG = sys.argv[1] if len(sys.argv) > 1 else 'x'
with sync_playwright() as p:
    for cls in ['kiem', 'phap', 'con', 'cung']:
        b, ctx, pg, errs = open_page(p, PHONE)
        new_game(pg, cls)
        pg.evaluate('''()=>{const S=G.save;S.lvl=126;progEnsure(S);S.prog.realm=8;S.skl=[15,15,15];recalc();updateLook();
          const q=G.W.pathPts[Math.floor(G.W.pathPts.length*0.35)];G.p.x=q.x;G.p.y=q.y;G.cam.x=q.x;G.cam.y=q.y-20;G.enemies.length=0;
          for(let k=0;k<5;k++)spawnEnemy(Object.keys(ET).find(t=>ET[t].ai!=='boss'),q.x+Math.cos(k)*120,q.y+Math.sin(k)*90,20);
          G.p.mp=G.p.maxmp=9999;G.p.skCd=[0,0,0];castSkill(2);for(let i=0;i<24;i++)update(1/60);G.paused=true}''')
        pg.wait_for_timeout(400)
        pg.screenshot(path=f'shots/outfit_vfx_{TAG}_{cls}.png')
        print(cls, errs[:3]); b.close()
