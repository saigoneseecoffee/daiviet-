"""Bản lưu cũ (ver 1, chưa có prog/cq/tq, Luân Hồi kiểu cũ) phải nạp được, giữ tiến độ và được bù hợp lý."""
import os, json
os.environ.setdefault('DVHK_HTML', '/home/claude/wt_prog/dist/agent_prog.html')
from harness import *
R = []
def ok(n, c, x=''): R.append(c); print(('PASS ' if c else 'FAIL ') + n, x)
OLD = """()=>{const s=newSave('giao','Trần Cũ');Object.assign(s,{lvl:35,exp:30000,sp:3,skl:[10,10,9],gold:123456,ore:40,kills:2500,map:5,unlocked:6,cleared:[0,1,2,3,4,5],qs:[4,4,4,4,4,1],ng:1,score:999999,best:999999});
  for(const sl of SLOTS)s.equip[sl]={id:s.iid++,slot:sl,ilvl:34,rar:2,st:sl==='vk'?{atk:120}:{hp:200,def:40},aff:[],enh:8,name:'Đồ cũ',cls:sl==='vk'?'giao':undefined};
  s.perks={r:{loi:5,bao:4},pend:0,rr:0,picks:9};
  localStorage.setItem(SAVE_KEY,JSON.stringify(s));return s.ver}"""
with sync_playwright() as p:
    b, ctx, pg, errs = open_page(p, PHONE)
    pg.evaluate(OLD); pg.reload(); pg.wait_for_timeout(1200)
    pg.wait_for_selector('#tCont', timeout=5000); ok('tiêu đề hiện Chơi tiếp', pg.is_visible('#tCont'))
    pg.click('#tCont'); pg.wait_for_timeout(600)
    if pg.is_visible('#stGo'): pg.click('#stGo')
    pg.wait_for_timeout(2500)
    s = pg.evaluate("(()=>{const S=G.save;return{lvl:S.lvl,exp:S.exp,need:need(S.lvl),sp:S.sp,skl:S.skl,gold:S.gold,ng:S.ng,cq:S.cq,tq:S.tq,prog:S.prog,eq:Object.keys(S.equip).length,perks:S.perks.r,off:lvOffset(),map:S.map,hp:G.p.hp,maxhp:G.p.maxhp}})()")
    print(json.dumps(s, ensure_ascii=False))
    ok('giữ cấp 35', s['lvl'] == 35)
    ok('kinh nghiệm quy theo đường cong mới', 0 <= s['exp'] < s['need'])
    ok('giữ kỹ năng và vàng', s['skl'] == [10, 10, 9] and s['gold'] == 123456)
    ok('giữ trang bị và bí kíp', s['eq'] == 6 and s['perks'].get('loi') == 5)
    ok('Luân Hồi cũ thành thưởng, quái về cấp gốc', s['ng'] == 0 and s['prog']['lh'] == 1 and s['off'] == 0)
    ok('được bù Chân Khí và Tàn Quyển', s['cq'] > 3000 and s['tq'] > 0)
    ok('có trường prog', s['prog']['realm'] == 0 and len(s['prog']['mer']) == 8 and s['prog']['bsp'] == [0,1,2,3,4,5])
    ok('nhân vật sống, chỉ số hợp lệ', s['hp'] > 0 and s['maxhp'] > 0)
    pg.screenshot(path='shots/prog_migrate.png')
    # lưu rồi nạp lại không bị bù lần hai
    pg.evaluate('saveGame()'); cq = s['cq']
    pg.reload(); pg.wait_for_timeout(1200); pg.click('#tCont'); pg.wait_for_timeout(600)
    if pg.is_visible('#stGo'): pg.click('#stGo')
    pg.wait_for_timeout(500)
    ok('nạp lại không bù lần hai', abs(pg.evaluate('G.save.cq') - cq) < 50, pg.evaluate('G.save.cq'))
    # bản lưu mới tinh
    pg.evaluate('localStorage.clear()'); pg.reload(); pg.wait_for_timeout(1000)
    pg.click('#tNew'); pg.wait_for_timeout(200)
    if pg.is_visible('#cfYes'): pg.click('#cfYes')
    pg.click('[data-c="cung"]'); pg.click('#goBtn'); pg.wait_for_timeout(400); pg.click('#stGo')
    n = pg.evaluate("({sp:G.save.sp,cq:G.save.cq,prog:!!G.save.prog,ng:G.save.ng})")
    ok('nhân vật mới không được bù', n['sp'] == 0 and n['cq'] == 0 and n['prog'], n)
    # Luân Hồi mới: tăng ng → thưởng một lần, quái +130 cấp
    pg.evaluate("G.save.lvl=126;G.save.ng++;G.save.qs=G.save.qs.map(()=>0);G.save.cleared=[];travel(0,true)");pg.wait_for_timeout(1200)
    l = pg.evaluate("({lh:G.save.prog.lh,cq:G.save.cq,off:lvOffset(),ov:!document.getElementById('rgOv').hidden})")
    ok('Luân Hồi trao thưởng', l['lh'] == 1 and l['cq'] >= 3000 and l['off'] == 130 and l['ov'], l)
    pg.wait_for_timeout(1500)
    ok('không trao thưởng hai lần', pg.evaluate('G.save.prog.lh') == 1)
    print('errors', errs); ok('không lỗi', not errs)
    b.close()
print(sum(R), '/', len(R))
