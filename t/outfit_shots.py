"""Ảnh cận cảnh nhân vật theo Cảnh Giới / Y Phục, dùng so sánh trước-sau.
python3 outfit_shots.py <tag> [outfitIds,...]"""
import sys, os
from harness import *
from tower_lib import new_game
TAG = sys.argv[1] if len(sys.argv) > 1 else 'x'
OFS = (sys.argv[2].split(',') if len(sys.argv) > 2 else [''])
os.makedirs(T.replace('/home/claude/dvhk', os.path.dirname(os.path.abspath(__file__)) + '/..') if False else 'shots', exist_ok=True)
with sync_playwright() as p:
    for cls in ['kiem', 'phap', 'giao']:
        b, ctx, pg, errs = open_page(p, PHONE)
        new_game(pg, cls)
        pg.evaluate('HK.on("tick",()=>{G.cam.z=2.2;G.floats.length=0})');pg.wait_for_timeout(300)
        for ri in [0, 4, 8]:
            for of in OFS:
                pg.evaluate('''([ri,of])=>{const S=G.save;S.lvl=Math.max(S.lvl,[1,10,20,32,45,60,80,100,126][ri]);progEnsure(S);S.prog.realm=ri;
                  if(of&&window.OF){OF.dev.unlockAll();OF.wear(of)}
                  recalc();updateLook();G.cam.z=2.2;G.p.moving=false;G.enemies.length=0;G.floats.length=0;
                  const q=G.W.pathPts[Math.floor(G.W.pathPts.length*0.35)];G.p.x=q.x;G.p.y=q.y;const h=document.getElementById('hud');if(h)h.style.visibility='hidden';G.cam.x=G.p.x;G.cam.y=G.p.y-30;UI.close&&UI.close()}''', [ri, of])
                pg.wait_for_timeout(700)
                pg.screenshot(path=f'shots/outfit_{TAG}_{cls}_r{ri}{"_"+of if of else ""}.png', clip={'x': 95, 'y': 170, 'width': 200, 'height': 300})
        print(cls, 'errs', errs[:3])
        b.close()
