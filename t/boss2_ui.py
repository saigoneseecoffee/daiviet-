"""Ảnh giao diện boss2 trên các cỡ màn hình: thanh boss, băng giai đoạn, màn chết có nút Thử lại, thẻ chương, bảng Nhiệm vụ.
   python3 boss2_ui.py [phone|se|land|desk ...]"""
import sys, os, json
os.environ.setdefault('DVHK_HTML', '/home/claude/dvhk/dist/agent_boss2.html')
from harness import *
modes = sys.argv[1:] or ['phone', 'se', 'land', 'desk']
SETUP = '''([mi,cls])=>{const S=G.save;S.cls=cls;G.p=null;S.lvl=MAPS[mi].lv[1]+1;S.unlocked=6;travel(mi,false);G.p=null;makePlayer(G.W.camp.x,G.W.camp.y);
  S.skl=[3,3,3];recalc();updateLook();G.p.hp=G.p.maxhp;G.p.ifr=1e9;S.tut={move:1,atk:1,equip:1,skill:1,forge:1,b2k:1,b2b:1};S.set.auto=false;
  S.qs[mi]=3;S.qp=0;const a=G.W.arena;G.p.x=a.x+40;G.p.y=a.y+60;G.cam.x=G.p.x;G.cam.y=G.p.y-20;document.getElementById('story').hidden=true;G.paused=false;return true}'''
with sync_playwright() as p:
    for mode in modes:
        O = {'phone': PHONE, 'se': SE, 'land': LAND, 'desk': DESK}[mode]
        b, ctx, pg, errs = open_page(p, O)
        W = O['viewport']['width']
        pg.evaluate("()=>{document.getElementById('tNew').click()}"); pg.wait_for_timeout(200)
        pg.evaluate("()=>{document.querySelector('[data-c=giao]').click();document.getElementById('goBtn').click()}"); pg.wait_for_timeout(500)
        pg.screenshot(path=f'shots/boss2ui_{mode}_story.png')
        pg.evaluate("document.getElementById('stGo').click()")
        ev = pg.evaluate
        ev(SETUP, [4, 'giao']); pg.wait_for_timeout(2600)
        ev("B2.pause(true)")
        ev("B2.setPhase(2)"); pg.wait_for_timeout(500)
        pg.screenshot(path=f'shots/boss2ui_{mode}_phase.png')
        pg.wait_for_timeout(2600)
        ev("B2.force('rain')"); pg.wait_for_timeout(1200)
        pg.screenshot(path=f'shots/boss2ui_{mode}_rain.png')
        pg.wait_for_timeout(1500)
        ev("G.p.ifr=0;hurtPlayer(1e9,1,G.boss)"); pg.wait_for_timeout(700)
        pg.screenshot(path=f'shots/boss2ui_{mode}_dead.png')
        vis = ev("!document.getElementById('b2Dead').hidden")
        pg.click('#b2Retry'); pg.wait_for_timeout(700)
        st = ev("({st:G.state,eng:G.boss&&G.boss.b2.engaged,d:Math.round(dist(G.p.x,G.p.y,G.W.arena.x,G.W.arena.y)),qt:G.save.b2qt})")
        print(mode, 'retry visible', vis, json.dumps(st), flush=True)
        pg.screenshot(path=f'shots/boss2ui_{mode}_retry.png')
        ev("UI.open('quest')"); pg.wait_for_timeout(500); ev("document.querySelector('#shBody').scrollTop=9999"); pg.wait_for_timeout(200)
        pg.screenshot(path=f'shots/boss2ui_{mode}_quest.png')
        print(mode, 'overflow', overflow(pg)['sw'] <= W, 'ERR', errs[:4], flush=True)
        b.close()
