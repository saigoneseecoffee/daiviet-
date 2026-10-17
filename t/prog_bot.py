"""Bot chạy chiến dịch 12 chương với nhịp kinh nghiệm mới, ghi thời gian/cấp/số lần chết theo từng chương.
   Chưa có dữ liệu chương 7–12 trong nhánh này nên chương c dùng bản đồ c%6 nhưng đặt lại khoảng cấp quái theo kế hoạch 12 chương.
   python3 prog_bot.py <lớp> <số phút mô phỏng tối đa> <số chương>  → in bảng JSON từng chương"""
import sys, json, os
os.environ.setdefault('DVHK_HTML', '/home/claude/wt_prog/dist/agent_prog.html')
from harness import *
cls = sys.argv[1] if len(sys.argv) > 1 else 'kiem'
mins = float(sys.argv[2]) if len(sys.argv) > 2 else 60
nch = int(sys.argv[3]) if len(sys.argv) > 3 else 2
RANGES = [[1,8],[8,16],[16,25],[25,34],[34,44],[44,54],[54,65],[65,76],[76,88],[88,100],[100,113],[113,126]]
INIT = """([R,NCH])=>{window.__R=R;window.__NCH=NCH;window.__ch=0;window.__tr={t:0,ch:[]};
  MAPS[0].lv=R[0];
  window.__nextCh=()=>{const S=G.save,T=__tr;const c=__ch;const C=T.ch[c];C.lvOut=S.lvl;C.done=1;
    __ch++;if(__ch>=__NCH){window.__fin=1;return}
    const mi=__ch%6;MAPS[mi].lv=R[__ch];S.qs[mi]=0;S.qp=0;S.cleared=S.cleared.filter(x=>x!==mi);if(S.prog)S.prog.bsp=S.prog.bsp.filter(x=>x!==mi);if(S.b2qt)S.b2qt[mi]=0;
    travel(mi,false)}}"""
SIM = """(secs)=>{
 const S=G.save;const dt=1/60;const T=__tr;
 for(let i=0;i<secs*60&&!window.__fin;i++){
   const c=__ch;const C=T.ch[c]||(T.ch[c]={t:0,d:0,k0:S.kills,lvIn:S.lvl,cq0:S.cq||0,tq0:S.tq||0,boss:0});
   if(G.state==='dead'){C.d++;while(G.state==='dead'){update(dt)}}
   if(!document.getElementById('clear').hidden){document.getElementById('clear').hidden=true;G.paused=false;__nextCh();continue}
   if(!document.getElementById('story').hidden){document.getElementById('stGo').click()}
   const ov=document.getElementById('rgOv');if(ov&&!ov.hidden)ov.hidden=true;
   G.paused=false;if(UI.panel)UI.close();
   if(G.hitstop>0)G.hitstop-=dt;else update(dt*G.slow);T.t+=dt;C.t+=dt;if(G.boss)C.boss+=dt;
   if(i%300===0){
     for(const it of [...S.bag])if(itemPower(it)>itemPower(S.equip[it.slot]))equipItem(it);
     for(let g=0;g<20;g++){const C2=CLASS_BY_ID[S.cls];let k=-1,lo=99;for(let j=2;j>=0;j--)if(S.lvl>=C2.skills[j].un&&skillUpCost(j).can&&S.skl[j]<lo){lo=S.skl[j];k=j}if(k<0)break;skillUp(k)}
     for(const it of [...S.bag])if(it.rar<=1)salvage(it);
     for(const sl of ['vk','ao','mu','dai','giay','boi']){const it=S.equip[sl];if(!it)continue;let n=0;while(n++<3&&it.enh<12){const c=forgeCost(it);if(S.ore<c.ore||S.gold<c.gold+200)break;doForge(it,S.charm>0)}}
     ensureMountSave();for(const m of [...MOUNTS].reverse()){if(m.frag){if(S.frag>=8&&!S.mounts[m.id]){S.frag-=8;giveMount(m.id);S.riding=m.id;recalc()}continue}if(!S.mounts[m.id]&&S.gold>m.price+500&&S.lvl>=m.lv){S.gold-=m.price;giveMount(m.id);S.riding=m.id;recalc();break}}if(!S.riding&&Object.keys(S.mounts).length){S.riding=Object.keys(S.mounts).pop();recalc()}
     const L=S.lvl;while(S.potHP<10&&S.gold>SHOP[0].price(L)+300){S.gold-=SHOP[0].price(L);S.potHP++}
     while(S.potMP<6&&S.gold>SHOP[1].price(L)+300){S.gold-=SHOP[1].price(L);S.potMP++}
     PROG.autoSpend();
   }
 }
 const p=G.p;const c=__ch,C=T.ch[c]||{};
 return{ch:c+1,lvl:S.lvl,map:S.map,qs:S.qs[S.map],qp:S.qp,deaths:C.d,hp:Math.round(p.hp)+'/'+p.maxhp,pow:p.power,atk:p.atk,kills:S.kills,cq:S.cq,tq:S.tq,realm:S.prog.realm,mer:S.prog.mer.reduce((a,b)=>a+b,0),skl:S.skl.join('/'),sp:S.sp,
   perks:Object.values(S.perks?S.perks.r:{}).reduce((a,b)=>a+b,0),boss:G.boss?Math.round(G.boss.hp/G.boss.max*100):null,fin:!!window.__fin}
}"""
REPORT = """()=>__tr.ch.map((C,i)=>({ch:i+1,min:+(C.t/60).toFixed(1),bossMin:+(C.boss/60).toFixed(1),deaths:C.d,kills:G.save.kills-0,lvIn:C.lvIn,lvOut:C.lvOut||G.save.lvl,cq:(C.done?0:0)}))"""
with sync_playwright() as p:
    b, ctx, pg, errs = open_page(p, DESK)
    pg.click('#tNew'); pg.click(f'[data-c="{cls}"]'); pg.click('#goBtn'); pg.wait_for_timeout(300); pg.click('#stGo')
    pg.evaluate("G.save.set.auto=true;G.save.set.sfx=false;G.save.set.music=false")
    pg.evaluate(INIT, [RANGES, nch])
    t = 0; last = None
    while t < mins:
        r = pg.evaluate(SIM, 60); t += 1
        if t % 5 == 0 or r['fin'] or r['ch'] != last:
            print(f"{t:5.0f}m", json.dumps(r, ensure_ascii=False), flush=True)
        last = r['ch']
        if r['fin']: break
    tr = pg.evaluate("__tr.ch.map((C,i,a)=>({min:+(C.t/60).toFixed(1),boss:+(C.boss/60).toFixed(1),d:C.d,kills:(a[i+1]?a[i+1].k0:G.save.kills)-C.k0,lvIn:C.lvIn,lvOut:C.lvOut||G.save.lvl,kpm:+(((a[i+1]?a[i+1].k0:G.save.kills)-C.k0)/(C.t/60)).toFixed(1)}))")
    kills = pg.evaluate("G.save.kills")
    print('CHAPTERS', json.dumps(tr))
    print('TOTAL', round(pg.evaluate('__tr.t')/60, 1), 'sim-min, kills', kills)
    print('errors', errs[:5])
    pg.screenshot(path=f'shots/progbot_{cls}.png')
    b.close()
