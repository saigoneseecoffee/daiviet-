"""Kiểm tra chuyển lưu cũ (6 chương) sang 12 chương và lưu mới.  python3 chapters_migrate.py"""
import os, json
os.environ.setdefault('DVHK_HTML', '/home/claude/wt_chapters/dist/agent_chapters.html')
from harness import *
R=[]
def ok(n,c,x=''):R.append(bool(c));print(('PASS ' if c else 'FAIL ')+n,x,flush=True)
def item(slot,ilvl,st,aff):return dict(id=ilvl*10+len(slot),slot=slot,ilvl=ilvl,rar=2,st=st,aff=aff,enh=5,name='Đồ cũ',cls='kiem' if slot=='vk' else None)
OLD=dict(ver=1,cls='kiem',name='Lão Thủ',lvl=22,exp=5000,gold=12345,ore=30,charm=1,potHP=5,potMP=3,sp=0,skl=[8,6,4],
  equip={'vk':item('vk',20,{'atk':95},[['atkp',10.1],['crit',3.2]]),'ao':item('ao',21,{'def':56,'hp':240},[['hpp',12.0]])},
  bag=[item('mu',18,{'def':28,'hp':130},[['def',18]])],map=3,unlocked=4,cleared=[0,1,2],qs=[4,4,4,2,0,0],qp=3,ng=0,side=None,sideChain=4,
  score=99999,best=99999,kills=777,iid=500,firstItem=True,set={'music':False,'sfx':False,'autoPot':True,'autoSalvage':False,'auto':False},
  tut={'move':True,'atk':True,'skill':True,'equip':True,'forge':True},b2qt={'3':2,'2':0},perks={'r':{},'pend':0,'rr':0,'picks':21})
OLD2=dict(OLD,map=5,unlocked=6,cleared=[0,1,2,3,4,5],qs=[4,4,4,4,4,4],qp=0,lvl=37,ng=1,b2qt={},perks=None)
with sync_playwright() as p:
    for tag,sv in [('tayket',OLD),('done',OLD2)]:
        b,ctx,pg,errs=open_page(p,PHONE)
        pg.evaluate("s=>localStorage.setItem('dvhk_save_v1',JSON.stringify(s))",sv);pg.reload();pg.wait_for_timeout(1200)
        pg.wait_for_selector('#tCont small');pg.wait_for_timeout(600);t=pg.text_content('#tCont');print(' title:',t.replace('\n',' | '))
        pg.click('#tCont');pg.wait_for_timeout(1500)
        if pg.is_visible('#story'):pg.click('#stGo')
        S=pg.evaluate("(()=>{const S=G.save;return{map:S.map,qs:S.qs,qp:S.qp,unl:S.unlocked,cl:S.cleared,lvl:S.lvl,exp:S.exp,need:need(S.lvl),sp:S.sp,b2qt:S.b2qt,chv:S.chv,pend:S.perks&&S.perks.pend,vk:S.equip.vk&&[S.equip.vk.ilvl,S.equip.vk.st,S.equip.vk.aff],bag:S.bag[0]&&[S.bag[0].ilvl,S.bag[0].st],mig:S.chMig,name:MAPS[S.map].name,qt:document.getElementById('qt').innerText}})()")
        print(json.dumps(S,ensure_ascii=False))
        if tag=='tayket':
            ok('tiêu đề hiện tên chương mới (Tây Kết)','tây kết' in t.lower(),t)
            ok('S.map 3 -> 7 (Tây Kết)',S['map']==7)
            ok('qs đổi chỉ số + số bước',S['qs']==[10,10,0,0,10,0,0,3,0,0,0,0],S['qs'])
            ok('bước tinh anh giữ tiến độ (qp<n)',S['qp']==2)
            ok('mở tới Tây Kết, gồm Mê Linh/Vạn Xuân/Hoa Lư/Như Nguyệt',S['unl']==8)
            ok('chương đã qua đổi chỉ số',S['cl']==[0,1,4])
            ok('cấp 22 -> dải Tây Kết mới',65<=S['lvl']<=76,S['lvl'])
            ok('đồ đổi cấp và chỉ số tăng',S['vk'][0]>=60 and S['vk'][1]['atk']>95,S['vk'])
            ok('Quyết Tâm đổi chỉ số chương',S['b2qt']=={'7':2,'4':0},S['b2qt'])
            ok('bảng theo dõi x/10','4/10' in S['qt'],S['qt'][:60])
            ok('thêm lượt bí kíp',S['pend'] and S['pend']>0)
            r=pg.evaluate("""(()=>{let n=0;G.save.set.auto=true;for(let i=0;i<60*40;i++){G.paused=false;if(UI.panel)UI.close();if(G.state==='dead')while(G.state==='dead')update(1/60);update(1/60)}
              return{kills:G.save.kills,lv:G.enemies.filter(e=>!e.dead).map(e=>e.lv).slice(0,4),st:G.state}})()""")
            ok('chơi tiếp 40 giây không lỗi, quái cấp Tây Kết',r['kills']>777 and all(l>=65 for l in r['lv']),r)
        else:
            ok('lưu đã phá đảo: map 5 -> 11',S['map']==11)
            ok('mở đủ 12 chương',S['unl']==12)
            ok('đã qua 6 chương cũ',S['cl']==[0,1,4,7,9,11])
            ok('qs đủ 12, chương mới chưa làm',S['qs']==[10,10,0,0,10,0,0,10,0,10,0,10])
            ok('cấp 37 -> 126',S['lvl']==126)
            pg.evaluate("travel(2,false)");pg.wait_for_timeout(500)
            ok('đi được chương mới Mê Linh',pg.evaluate("G.save.map===2&&MAPS[2].name==='Mê Linh'"))
        ok('không lỗi JS ('+tag+')',not errs,errs[:3]);b.close()
    # lưu mới
    b,ctx,pg,errs=open_page(p,PHONE)
    pg.click('#tNew');pg.click('[data-c="dao"]');pg.click('#goBtn');pg.wait_for_timeout(400);pg.click('#stGo')
    S=pg.evaluate("({qs:G.save.qs,chv:G.save.chv,map:G.save.map,unl:G.save.unlocked})")
    ok('lưu mới: 12 chương, chv=2',len(S['qs'])==12 and S['chv']==2 and S['map']==0 and S['unl']==1,S)
    pg.evaluate("saveGame()");pg.reload();pg.wait_for_timeout(1000);pg.click('#tCont');pg.wait_for_timeout(800)
    ok('tải lại lưu mới không bị chuyển đổi lần hai',pg.evaluate("G.save.lvl===1&&G.save.qs.length===12&&!G.save.chMig"))
    ok('không lỗi JS (mới)',not errs,errs[:3]);b.close()
print('SUMMARY',sum(R),'/',len(R))
