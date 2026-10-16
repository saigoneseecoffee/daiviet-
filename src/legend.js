/* ============ ĐỒ HUYỀN THOẠI & ÉP ĐỒ (legend.js) ============
   - Phẩm chất mới RARITY[5] "Huyền Thoại" (cam vàng), 14 món có hiệu ứng riêng.
   - Rơi: boss 25% (boss đầu tiên chắc chắn nếu chưa có món nào), tinh anh 2%, thường 0,1%, có bảo hiểm (pity).
   - Đồ Huyền Thoại (đang mặc hoặc trong túi) lớn dần theo cấp nhân vật.
   - Ép đồ kiểu MU: từ +7 thất bại tụt cấp, từ +10 thất bại có thể VỠ đồ (Bùa Bảo Hộ giữ cấp và chống vỡ).
   - Mốc vũ khí +7/+10/+13/+15 phát sáng khác nhau. */
(function(){
const LEG_RAR=5,LEG_COL='#ff9d2e';
if(!RARITY[LEG_RAR])RARITY.push({name:'Huyền Thoại',color:LEG_COL,mult:1.85,aff:4});
const CH={boss:0.25,elite:0.02,normal:0.001},PITY=550,PITY_W={normal:1,elite:8};

const LEGENDS={
 thuanthien:{slot:'vk',cls:'kiem',name:'Gươm Thần Thuận Thiên',fx:'Kiếm Khí Hồ Gươm',col:'#5fe8c0',
  d:'Mỗi đòn đánh thường thứ 3 phóng một vệt kiếm khí ngọc bích xuyên thấu (130% công).',
  fl:'Rùa Vàng trao gươm cho Lê Lợi đánh giặc Minh. Mười năm sau gươm trở về hồ Tả Vọng, hồ mang tên Hoàn Kiếm.'},
 linhquang:{slot:'vk',cls:'cung',name:'Nỏ Thần Linh Quang',fx:'Liên Châu Tiễn',col:'#ffd23a',
  d:'Mỗi phát bắn tỏa thêm 2 mũi tên vàng (50% công). Phát thứ 6 là Thần Tiễn xuyên mọi kẻ địch (260% công).',
  fl:'Lẫy nỏ làm từ vuốt thần Kim Quy, một phát bắn ra trăm mũi tên. Nhờ nó An Dương Vương giữ được Âu Lạc.'},
 ngovuong:{slot:'vk',cls:'giao',name:'Thần Thương Ngô Vương',fx:'Trận Cọc Bạch Đằng',col:'#d8a868',
  d:'Mỗi đòn đâm thứ 4 làm trồi một hàng cọc nhọn theo hướng đâm, gây 90% công và choáng 0,8 giây.',
  fl:'Năm 938, cọc gỗ đầu bịt sắt dưới lòng sông Bạch Đằng nhấn chìm chiến thuyền Nam Hán.'},
 phuonghoang:{slot:'vk',cls:'dao',name:'Song Đao Phượng Hoàng',fx:'Phượng Ảnh',col:'#ff6aa0',
  d:'Đòn chí mạng có 40% gọi ảnh phượng chém thêm một nhát (80% công) vào kẻ địch gần đó.',
  fl:'Đôi đao của nữ tướng Bùi Thị Xuân, người luyện voi chiến và xông pha trận mạc thời Tây Sơn.'},
 thanhgiong:{slot:'vk',cls:'con',name:'Roi Sắt Thánh Gióng',fx:'Lửa Ngựa Sắt',col:'#ff7a2a',
  d:'Kẻ địch bị hạ nổ tung thành lửa, gây 90% công cho kẻ địch xung quanh. Vụ nổ có thể dây chuyền.',
  fl:'Cậu bé làng Phù Đổng vươn vai thành tráng sĩ, cưỡi ngựa sắt phun lửa, vung roi sắt đánh tan giặc Ân.'},
 thienthu:{slot:'vk',cls:'phap',name:'Thiên Thư Nam Quốc',fx:'Thiên Lôi Lan',col:'#9fc4ff',
  d:'Đòn chí mạng phóng tia sét nhảy qua 4 kẻ địch (60% công mỗi lần).',
  fl:'"Nam quốc sơn hà Nam đế cư, tiệt nhiên định phận tại thiên thư." Lời thơ thần vang trên sông Như Nguyệt.'},
 hungdao:{slot:'ao',name:'Chiến Bào Hưng Đạo',fx:'Hịch Tướng Sĩ',col:'#ffd23a',
  d:'Khi sinh lực dưới 30%, nhận khiên vàng chặn sát thương bằng 35% sinh lực tối đa trong 6 giây và đẩy lùi kẻ địch. Hồi 25 giây.',
  fl:'"Dẫu cho trăm thân này phơi ngoài nội cỏ, nghìn xác này gói trong da ngựa, ta cũng vui lòng."'},
 kimquy:{slot:'ao',name:'Giáp Mai Rùa Kim Quy',fx:'Mai Rùa Thần',col:'#7dd8a0',
  d:'Cứ 7 giây tích một Mai Rùa: chặn trọn đòn đánh kế tiếp và phản lại 200% công vào kẻ tấn công.',
  fl:'Thần Kim Quy giúp An Dương Vương xây xong thành Cổ Loa và trừ Bạch Kê Tinh.'},
 quangtrung:{slot:'mu',name:'Kim Khôi Quang Trung',fx:'Thần Tốc',col:'#ff8a3a',
  d:'Mỗi lần dùng kỹ năng có 30% cơ hội hồi chiêu ngay lập tức và tăng 25% tốc chạy trong 2 giây.',
  fl:'Tết Kỷ Dậu 1789, quân Tây Sơn hành quân thần tốc, năm ngày đánh tan hai mươi chín vạn quân Thanh.'},
 lamson:{slot:'dai',name:'Đai Ngọc Lam Sơn',fx:'Ngọc Lam Hội Tụ',col:'#4fd8c5',
  d:'Mỗi kẻ địch bị hạ cho một viên Ngọc Lam (tối đa 10), mỗi viên +4% sát thương. Trúng đòn mất 3 viên.',
  fl:'Từ Hội thề Lũng Nhai, nghĩa sĩ Lam Sơn nếm mật nằm gai mười năm đuổi giặc Minh.'},
 batrieu:{slot:'dai',name:'Đai Voi Bà Triệu',fx:'Voi Gầm',col:'#e8c070',
  d:'Khi bị 5 kẻ địch trở lên vây quanh, voi chiến gầm vang: choáng và hất văng kẻ địch xung quanh (100% công). Hồi 8 giây.',
  fl:'"Tôi muốn cưỡi cơn gió mạnh, đạp luồng sóng dữ, chém cá kình ở biển Đông." Bà Triệu, năm 248.'},
 phudong:{slot:'giay',name:'Hài Lửa Phù Đổng',fx:'Vết Lửa Ngựa Sắt',col:'#ff6a1a',
  d:'Khi di chuyển để lại vệt lửa thiêu kẻ địch (30% công mỗi nhịp). Tốc chạy +10%.',
  fl:'Ngựa sắt phun lửa cháy cả rặng tre, nay vẫn còn tre đằng ngà vàng óng ở làng Phù Đổng.'},
 longquan:{slot:'boi',name:'Ngọc Bội Long Quân',fx:'Thủy Long Hộ Thể',col:'#5fd0ff',
  d:'Cứ 12 giây, một con rồng nước bay vòng quanh bạn trong 5 giây, quật mọi kẻ địch nó lướt qua (60% công).',
  fl:'Lạc Long Quân, giống rồng nơi biển cả, trừ Ngư Tinh, Hồ Tinh, Mộc Tinh cho dân Lạc Việt.'},
 auco:{slot:'boi',name:'Ngọc Bội Âu Cơ',fx:'Tiên Hộ Mệnh',col:'#ffb0d0',
  d:'Khi nhận đòn chí tử, hồi sinh tại chỗ với 50% sinh lực và bất tử 2 giây. Hồi 120 giây.',
  fl:'Mẹ Âu Cơ sinh bọc trăm trứng, nở trăm người con: tổ tiên của đồng bào Việt.'},
};

/* ---------- lưu ---------- */
function LSave(){const S=G.save;if(!S)return{p:0,n:0,got:[]};if(!S.leg||typeof S.leg!=='object')S.leg={p:0,n:0,got:[]};if(!Array.isArray(S.leg.got))S.leg.got=[];return S.leg}

/* ---------- tạo đồ ---------- */
function legBase(slot,L){const m=RARITY[LEG_RAR].mult,st={};
  if(slot==='vk')st.atk=(6+3.3*L)*m;
  if(slot==='mu'){st.def=(2+1.0*L)*m;st.hp=(8+5*L)*m}
  if(slot==='ao'){st.def=(4+1.8*L)*m;st.hp=(16+8*L)*m}
  if(slot==='dai'){st.hp=(14+8*L)*m;st.atk=(1+0.6*L)*m}
  if(slot==='giay'){st.def=(1+0.7*L)*m;st.spd=Math.round((4+L*0.08)*m)}
  if(slot==='boi'){st.mp=(10+3*L)*m;st.crit=Math.round((2+L*0.08)*m*10)/10}
  for(const k in st)if(k!=='crit'&&k!=='spd')st[k]=Math.round(st[k]);return st}
function legMake(key,ilvl){const D=LEGENDS[key];const it=genItem(Math.max(1,ilvl),LEG_RAR,D.slot);
  it.rar=LEG_RAR;it.leg=key;it.name=D.name;if(D.slot==='vk')it.cls=D.cls;return it}
/* đồ Huyền Thoại lớn dần theo cấp người mang */
function legGrow(it){const S=G.save;if(!it||!it.leg||!S)return false;const L=S.lvl,o=it.ilvl;if(o>=L)return false;
  it.st=legBase(it.slot,L);
  it.aff=it.aff.map(([k,v])=>{const A=AFFIX[k];if(!A)return[k,v];let nv=v*A.roll(L)/Math.max(0.01,A.roll(o));if(AFFIX_CAP[k])nv=Math.min(nv,AFFIX_CAP[k]);return[k,A.u==='%'?Math.round(nv*10)/10:Math.round(nv)]});
  it.ilvl=L;return true}
function legPick(){const S=G.save,own=new Set(),L=LSave();
  for(const sl of SLOTS){const it=S.equip[sl];if(it&&it.leg)own.add(it.leg)}for(const it of S.bag)if(it.leg)own.add(it.leg);
  const elig=Object.keys(LEGENDS).filter(k=>LEGENDS[k].slot!=='vk'||LEGENDS[k].cls===S.cls);
  const wk=elig.find(k=>LEGENDS[k].slot==='vk');
  if(L.n===0&&wk&&!own.has(wk))return wk; // món đầu tiên: vũ khí của phái mình
  let pool=elig.filter(k=>!own.has(k));if(!pool.length)pool=elig;
  const w=pool.map(k=>LEGENDS[k].slot==='vk'?2.5:1);let tot=0;w.forEach(v=>tot+=v);let r=Math.random()*tot;
  for(let i=0;i<pool.length;i++){r-=w[i];if(r<=0)return pool[i]}return pool[0]}
function legDrop(x,y,lv,key,direct){const L=LSave();key=key||legPick();const it=legMake(key,lv);
  if(direct){addToBag(it,true);G.drops.push({x,y,vx:rand(-40,40),vy:rand(-20,20),z:0,vz:220,kind:'legvis',val:it,t:0,id:Math.random()});UI.loot(it.name,LEG_COL)}
  else dropAt(x,y,'item',it);L.n++;L.p=0;if(!L.got.includes(key))L.got.push(key);
  // hiệu ứng rơi đồ
  G.fx.push({k:'pillar',x,y,w:46,h:520,col:LEG_COL,life:1.6,max:1.6},{k:'ring',x,y,r:12,r2:150,life:0.7,max:0.7,col:'#ffb347'},{k:'flash',x,y:y-20,r:160,col:LEG_COL,life:0.5,max:0.5});
  G.floats.push({x,y:y-80,txt:'Huyền Thoại!',col:'#ffc069',size:28,life:1.3,vy:-30,skill:1});
  G.flash={t:0.45,d:0.45,col:LEG_COL};G.shake=Math.max(G.shake,7);G.hitstop=Math.max(G.hitstop,0.07);
  for(let i=0;i<30;i++){const a=Math.random()*TAU,v=rand(80,260);addPart(x,y-20,Math.cos(a)*v,Math.sin(a)*v*0.6-120,rand(0.6,1.1),i%3?'#ffb347':'#fff4d0',rand(2,3.5),300,'c',1)}
  Audio_.play('legend');UI.toast((direct?'Đồ Huyền Thoại vào túi: ':'Đồ Huyền Thoại rơi ra: ')+it.name+'!','legend');
  return it}

/* ---------- rơi đồ khi hạ địch ---------- */
HK.on('kill',e=>{const S=G.save;if(!S||!G.p)return;const L=LSave();
  if(!e.boss)L.p+=e.elite?PITY_W.elite:PITY_W.normal;
  const ch=e.boss?CH.boss:e.elite?CH.elite:CH.normal;
  const force=(e.boss&&L.n===0)||L.p>=PITY;
  if(force||Math.random()<ch)legDrop(e.x,e.y,e.lv+(e.boss?2:0),null,e.boss); // boss: vào thẳng túi (màn qua chương có thể đưa người chơi đi trước khi kịp nhặt)
});

/* ================= HIỆU ỨNG CHIẾN ĐẤU ================= */
const LS={k:{},n3:0,shots:0,th:0,phT:0,ttT:0,boomW:0,boomN:0,shield:0,shieldMax:1,shieldT:0,hdCd:0,shell:0,shellT:0,stacks:0,stackT:0,btCd:0,btChk:0,fire:[],fireT:0,lqT:4,drag:0,dragA:0,dragTk:0,aucoCd:0,qtT:0};
const later=(t,fn)=>G.timers.push({t,fn});
const call=(txt,col,x,y)=>G.floats.push({x,y,txt,col,size:22,life:1.15,vy:-24,skill:1});

HK.on('stats',st=>{const S=G.save;const k={};
  for(const sl of SLOTS){const it=S.equip[sl];if(!it||!it.leg)continue;const D=LEGENDS[it.leg];if(D&&(D.slot!=='vk'||D.cls===S.cls))k[it.leg]=1}
  LS.k=k;if(k.phudong)st.spd+=10;if(k.quangtrung&&LS.qtT>0)st.spd+=25;
  if(!k.lamson)LS.stacks=0;if(!k.kimquy)LS.shell=0;if(!k.hungdao)LS.shield=0;if(!k.longquan)LS.drag=0;if(!k.phudong)LS.fire.length=0});

HK.on('attack',t=>{const p=G.p,k=LS.k;if(!p)return;const a=p.aim;
  if(k.thuanthien){LS.n3=(LS.n3+1)%3;if(LS.n3===0){
    G.projs.push({x:p.x+Math.cos(a)*20,y:p.y-18,vx:Math.cos(a)*720,vy:Math.sin(a)*720,r:30,dmg:p.atk*1.3,from:'p',pierce:99,life:0.5,kind:'wave',ang:a,hit:new Set(),col:'#5fe8c0'});
    G.fx.push({k:'flash',x:p.x+Math.cos(a)*30,y:p.y-20,r:50,col:'#5fe8c0',life:0.2,max:0.2});Audio_.play('magic')}}
  if(k.linhquang){LS.shots++;const sx=p.x+Math.cos(a)*14,sy=p.y-24;
    for(const s of[-1,1]){const b=a+s*0.2;G.projs.push({x:sx,y:sy,vx:Math.cos(b)*640,vy:Math.sin(b)*640,r:9,dmg:p.atk*0.5,from:'p',pierce:0,life:0.7,kind:'arrow',hit:new Set(),col:'#ffd23a'})}
    if(LS.shots%6===0){G.projs.push({x:sx,y:sy,vx:Math.cos(a)*900,vy:Math.sin(a)*900,r:16,dmg:p.atk*2.6,from:'p',pierce:99,life:0.6,kind:'arrow',hit:new Set(),col:'#fff3a0',lq:1});
      G.fx.push({k:'flash',x:sx,y:sy,r:60,col:'#ffd23a',life:0.25,max:0.25},{k:'ring',x:p.x,y:p.y,r:8,r2:46,life:0.25,max:0.25,col:'#ffd23a'});call('Thần Tiễn!','#ffe08a',p.x,p.y-80);Audio_.play('zap')}}
  if(k.ngovuong){LS.th=(LS.th+1)%4;if(LS.th===0){const ox=p.x,oy=p.y,atk=p.atk;
    for(let i=0;i<6;i++)later(i*0.05,()=>{const d=48+i*36,x=ox+Math.cos(a)*d,y=oy+Math.sin(a)*d;
      for(let j=-1;j<=1;j++)G.fx.push({k:'stake',x:x+Math.cos(a+Math.PI/2)*j*14,y:y+Math.sin(a+Math.PI/2)*j*12,life:0.7,max:0.7});
      enemiesIn(x,y,34).forEach(e=>hurtEnemy(e,atk*0.9,{stun:0.8,proc:1,noStagger:1}));pushDust(x,y,3,24);if(i%2===0)Audio_.play('slam')});
    G.shake=Math.max(G.shake,4)}}
});

HK.on('hit',(e,dmg,o)=>{if(!o||o.proc||!o.crit)return;const k=LS.k,p=G.p;if(!p)return;
  if(k.phuonghoang&&G.t>LS.phT&&Math.random()<0.4){LS.phT=G.t+0.12;const atk=p.atk;
    later(0.1,()=>{let tg=nearestEnemy(e.x,e.y,160,x=>x!==e)||(!e.dead?e:null);if(!tg)return;
      hurtEnemy(tg,atk*0.8,{proc:1,noStagger:1});G.fx.push({k:'xslash',x:tg.x,y:tg.y-20,life:0.3,max:0.3,col:'#ff6aa0'},{k:'streak',x1:e.x,y1:e.y-24,x2:tg.x,y2:tg.y-20,w:6,col:'#ff9ac0',life:0.2,max:0.2});
      for(let i=0;i<6;i++)addPart(tg.x,tg.y-20,rand(-120,120),rand(-140,-30),rand(0.4,0.7),i%2?'#ff6aa0':'#ffd0e0',rand(2,3.4),200,'c',1)})}
  if(k.thienthu&&G.t>LS.ttT){LS.ttT=G.t+0.25;const hit=new Set([e]);let cur=e,px=e.x,py=e.y-18;
    for(let j=0;j<4;j++){const nx=nearestEnemy(cur.x,cur.y,200,x=>!hit.has(x));if(!nx)break;hit.add(nx);
      G.fx.push({k:'bolt',x1:px,y1:py,x2:nx.x,y2:nx.y-18,life:0.22,max:0.22,col:'#bcd8ff',w:2.4});hurtEnemy(nx,p.atk*0.6,{proc:1,stun:0.2});px=nx.x;py=nx.y-18;cur=nx}
    if(hit.size>1)Audio_.play('zap')}
});

HK.on('kill',e=>{const k=LS.k,p=G.p;if(!p)return;
  if(k.lamson){if(LS.stacks<10){LS.stacks++;if(LS.stacks===10)call('Ngọc Lam viên mãn!','#4fd8c5',p.x,p.y-90)}LS.stackT=0}
  if(k.thanhgiong){if(G.t-LS.boomW>0.5){LS.boomW=G.t;LS.boomN=0}
    if(LS.boomN++<8){const x=e.x,y=e.y,atk=p.atk;later(0.09,()=>{enemiesIn(x,y,92).forEach(en=>hurtEnemy(en,atk*0.9,{proc:1,kb:140,ang:Math.atan2(en.y-y,en.x-x)}));
      G.fx.push({k:'flash',x,y:y-10,r:100,col:'#ff7a2a',life:0.3,max:0.3},{k:'ring',x,y,r:10,r2:96,life:0.35,max:0.35,col:'#ffb347'});pushCrack(x,y,60,5);
      for(let i=0;i<10;i++){const a=Math.random()*TAU,v=rand(80,220);addPart(x,y-10,Math.cos(a)*v,Math.sin(a)*v*0.6-80,rand(0.35,0.6),i%2?'#ff7a2a':'#ffd23a',rand(2.5,4.5),300,'c',1)}
      G.shake=Math.max(G.shake,4);Audio_.play('boom')})}}
});

HK.on('cast',(i,sk)=>{const k=LS.k,p=G.p;if(!p||!k.quangtrung)return;
  if(Math.random()<0.3){p.skCd[i]=0;LS.qtT=2;recalc();call('Thần Tốc!','#ff9a4a',p.x,p.y-92);
    G.fx.push({k:'ring',x:p.x,y:p.y,r:10,r2:70,life:0.35,max:0.35,col:'#ff8a3a'});pushGhost(p.x,p.y,p.f,'#ff8a3a',0.35);UI.flashSkill&&UI.flashSkill(i)}});

HK.on('dmgOut',(dmg)=>LS.k.lamson&&LS.stacks?dmg*(1+0.04*LS.stacks):undefined);

HK.on('dmgIn',(dmg,src)=>{const k=LS.k,p=G.p;if(!p)return;
  if(k.kimquy&&LS.shell){LS.shell=0;LS.shellT=0;call('Mai Rùa!','#7dd8a0',p.x,p.y-86);Audio_.play('clang');
    G.fx.push({k:'ring',x:p.x,y:p.y-10,r:50,r2:14,life:0.3,max:0.3,col:'#7dd8a0'},{k:'flash',x:p.x,y:p.y-24,r:70,col:'#7dd8a0',life:0.25,max:0.25});
    if(src&&!src.dead&&src.hp!=null){hurtEnemy(src,p.atk*2,{proc:1});G.fx.push({k:'streak',x1:p.x,y1:p.y-24,x2:src.x,y2:src.y-20,w:8,col:'#7dd8a0',life:0.22,max:0.22})}
    return 0}
  if(k.hungdao&&LS.shield>0){const a=Math.min(LS.shield,dmg);LS.shield-=a;dmg-=a;if(LS.shield<=0){LS.shield=0;sparks(p.x,p.y-24,10,'#ffd23a',220)}}
  if(k.lamson&&dmg>1&&LS.stacks)LS.stacks=Math.max(0,LS.stacks-3);
  if(k.auco&&dmg>=p.hp&&G.t>=LS.aucoCd){LS.aucoCd=G.t+120;p.hp=Math.max(p.hp,Math.round(p.maxhp*0.5));p.ifr=2;
    G.fx.push({k:'pillar',x:p.x,y:p.y,w:40,h:420,col:'#ffb0d0',life:1.2,max:1.2},{k:'ring',x:p.x,y:p.y,r:12,r2:130,life:0.6,max:0.6,col:'#ffb0d0'});
    for(let i=0;i<24;i++){const a=i/24*TAU;addPart(p.x+Math.cos(a)*16,p.y-20,Math.cos(a)*150,Math.sin(a)*80-70,0.9,i%2?'#ffb0d0':'#fff4f8',3,0,'c',1)}
    call('Tiên Hộ Mệnh!','#ffc8e0',p.x,p.y-96);G.flash={t:0.5,d:0.5,col:'#ffb0d0'};Audio_.play('quest');return 0}
  return dmg});

HK.on('tick',dt=>{const k=LS.k,p=G.p;if(!p)return;
  if(LS.qtT>0){LS.qtT-=dt;if(LS.qtT<=0)recalc()}
  if(k.hungdao){if(LS.shieldT>0){LS.shieldT-=dt;if(LS.shieldT<=0)LS.shield=0}
    if(p.hp>0&&p.hp<p.maxhp*0.3&&G.t>=LS.hdCd&&!p.inCamp){LS.hdCd=G.t+25;LS.shield=LS.shieldMax=p.maxhp*0.35;LS.shieldT=6;
      for(const e of enemiesIn(p.x,p.y,170)){if(e.boss)continue;const a=Math.atan2(e.y-p.y,e.x-p.x);e.kbx+=Math.cos(a)*300;e.kby+=Math.sin(a)*300}
      G.fx.push({k:'ring',x:p.x,y:p.y,r:20,r2:170,life:0.45,max:0.45,col:'#ffd23a'},{k:'pillar',x:p.x,y:p.y,w:30,h:300,col:'#ffd23a',life:0.8,max:0.8});
      call('Hịch Tướng Sĩ!','#ffe08a',p.x,p.y-96);G.shake=Math.max(G.shake,6);Audio_.play('clang')}}
  if(k.kimquy&&!LS.shell){LS.shellT+=dt;if(LS.shellT>=7){LS.shell=1;G.fx.push({k:'ring',x:p.x,y:p.y,r:44,r2:20,life:0.3,max:0.3,col:'#7dd8a0'})}}
  if(k.lamson&&LS.stacks){LS.stackT+=dt;if(LS.stackT>4){LS.stackT=0;LS.stacks--}}
  if(k.batrieu){LS.btChk-=dt;if(LS.btChk<=0){LS.btChk=0.25;if(G.t>=LS.btCd){const near=enemiesIn(p.x,p.y,130);if(near.length>=5){LS.btCd=G.t+8;
    enemiesIn(p.x,p.y,180).forEach(e=>hurtEnemy(e,p.atk,{proc:1,stun:1.2,kb:240,ang:Math.atan2(e.y-p.y,e.x-p.x)}));
    G.fx.push({k:'ring',x:p.x,y:p.y,r:20,r2:190,life:0.5,max:0.5,col:'#e8c070'},{k:'ring',x:p.x,y:p.y,r:10,r2:120,life:0.4,max:0.4,col:'#fff0c8'},{k:'flash',x:p.x,y:p.y,r:120,col:'#e8c070',life:0.3,max:0.3});
    pushCrack(p.x,p.y,130,8);pushDust(p.x,p.y,10,120);call('Voi Gầm!','#f0d090',p.x,p.y-96);G.shake=Math.max(G.shake,8);Audio_.play('roar')}}}}
  if(k.phudong){LS.fireT-=dt;if(p.moving&&!p.inCamp&&LS.fireT<=0){LS.fireT=0.13;if(LS.fire.length>=14)LS.fire.shift();LS.fire.push({x:p.x+rand(-4,4),y:p.y+rand(-3,3),t:1.4,tk:0.15,s:Math.random()})}
    for(let i=LS.fire.length-1;i>=0;i--){const f=LS.fire[i];f.t-=dt;f.tk-=dt;if(f.t<=0){LS.fire.splice(i,1);continue}
      if(f.tk<=0){f.tk=0.4;for(const e of enemiesIn(f.x,f.y,26))hurtEnemy(e,p.atk*0.3,{proc:1,noStagger:1})}}}
  if(k.longquan){if(LS.drag>0){LS.drag-=dt;LS.dragA+=dt*4.4;LS.dragTk-=dt;
      if(LS.dragTk<=0){LS.dragTk=0.1;const hx=p.x+Math.cos(LS.dragA)*96,hy=p.y-6+Math.sin(LS.dragA)*72;
        for(const e of enemiesIn(hx,hy,40)){if((e._lq||0)>G.t)continue;e._lq=G.t+0.45;hurtEnemy(e,p.atk*0.6,{proc:1,kb:110,ang:LS.dragA+Math.PI/2});
          G.fx.push({k:'flash',x:e.x,y:e.y-16,r:40,col:'#5fd0ff',life:0.2,max:0.2})}}}
    else{LS.lqT-=dt;if(LS.lqT<=0){if(nearestEnemy(p.x,p.y,320)){LS.lqT=12;LS.drag=5;LS.dragA=p.aim;Audio_.play('magic');
      G.fx.push({k:'ring',x:p.x,y:p.y,r:20,r2:100,life:0.4,max:0.4,col:'#5fd0ff'});call('Thủy Long!','#a8e4ff',p.x,p.y-96)}else LS.lqT=0.5}}}
});

/* ---------- vẽ hiệu ứng (rẻ: chỉ dùng chấm sáng đệm sẵn) ---------- */
function drawWeaponFx(p){const g=p.glow||0;if(g<3)return;const tp=p.tip;if(!tp||!tp.x)return;
  const x0=tp.mx||p.x,y0=tp.my||p.y-30,x1=tp.x,y1=tp.y;
  additive(()=>{for(let i=0;i<2;i++){const u=(G.t*1.6+i*0.5)%1;glow(lerp(x0,x1,u),lerp(y0,y1,u)-6*Math.sin(u*Math.PI),9+3*Math.sin(G.t*20+i),'#ff7a2a',0.75)}
    if(g>=4){glow(x1,y1,24,'#fff4c0',0.75+Math.sin(G.t*9)*0.2);glow(p.x,p.y-38,58,'#ffe08a',0.16+Math.sin(G.t*3)*0.05);
      if(((G.t*14)|0)%3===0){cx.strokeStyle='#eaf6ff';cx.lineWidth=1.6;cx.globalAlpha=0.9;cx.beginPath();cx.moveTo(x0,y0);for(let j=1;j<=4;j++){const u=j/4;cx.lineTo(lerp(x0,x1,u)+rand(-6,6),lerp(y0,y1,u)+rand(-6,6))}cx.stroke()}}},'lighter')}
HK.on('drawWorld',()=>{const p=G.p;if(!p||G.state==='title'||G.state==='select')return;const k=LS.k,t=G.t;
  if(k.phudong&&LS.fire.length){cx.fillStyle='rgba(70,20,5,0.28)';for(const f of LS.fire){cx.beginPath();cx.ellipse(f.x,f.y,14,5,0,0,TAU);cx.fill()}
    additive(()=>{for(const f of LS.fire){const a=Math.min(1,f.t*1.5),h=10+Math.sin(t*14+f.s*9)*3;glow(f.x,f.y-6,20+h*0.4,'#ff5a10',0.75*a);glow(f.x,f.y-h,9,'#ffd060',0.9*a);glow(f.x+4*Math.sin(t*9+f.s*5),f.y-h-8,5,'#fff0b0',0.7*a)}},'lighter')}
  if(k.lamson&&LS.stacks)additive(()=>{for(let i=0;i<LS.stacks;i++){const a=t*2.2+i*TAU/10;const x=p.x+Math.cos(a)*24,y=p.y-30+Math.sin(a)*8;glow(x,y,7,'#4fd8c5',Math.sin(a)>0?0.95:0.5)}},'lighter');
  if(k.kimquy&&LS.shell){cx.save();cx.translate(p.x,p.y);cx.scale(1,0.4);cx.rotate(t*0.8);cx.globalAlpha=0.75;cx.strokeStyle='#7dd8a0';cx.lineWidth=2.5;cx.beginPath();
    for(let i=0;i<=6;i++){const a=i/6*TAU;i?cx.lineTo(Math.cos(a)*30,Math.sin(a)*30):cx.moveTo(Math.cos(a)*30,Math.sin(a)*30)}cx.stroke();cx.restore()}
  if(k.hungdao&&LS.shield>0){const a=0.35+0.65*LS.shield/LS.shieldMax;additive(()=>{cx.globalAlpha=0.8*a;cx.strokeStyle='#ffd23a';cx.lineWidth=2.5;cx.beginPath();cx.ellipse(p.x,p.y-26,34,46,0,0,TAU);cx.stroke();
    cx.globalAlpha=0.18*a;cx.fillStyle='#ffc53d';cx.fill();glow(p.x,p.y-26,50,'#ffd23a',0.25*a)},'lighter')}
  if(k.longquan&&LS.drag>0){const fade=Math.min(1,LS.drag*2),N=14,P=[];for(let i=0;i<N;i++){const a=LS.dragA-i*0.15;P.push([p.x+Math.cos(a)*96,p.y-6+Math.sin(a)*72-Math.sin(t*8-i*0.7)*7])}
    cx.save();cx.globalAlpha=0.85*fade;cx.lineCap='round';cx.lineJoin='round';
    for(let i=N-1;i>0;i--){cx.strokeStyle=i%3===0?'#1f6fa8':'#2f8fd0';cx.lineWidth=3+(1-i/N)*11;cx.beginPath();cx.moveTo(P[i][0],P[i][1]);cx.lineTo(P[i-1][0],P[i-1][1]);cx.stroke()}
    cx.strokeStyle='#bfefff';cx.lineWidth=2;cx.beginPath();cx.moveTo(P[N-1][0],P[N-1][1]-2);for(let i=N-2;i>=0;i--)cx.lineTo(P[i][0],P[i][1]-3);cx.stroke();
    const hd=P[0],ang=LS.dragA+Math.PI/2;cx.translate(hd[0],hd[1]);cx.rotate(ang);cx.fillStyle='#2f8fd0';cx.strokeStyle='#0d3a5a';cx.lineWidth=1.5;cx.beginPath();cx.moveTo(14,0);cx.lineTo(-6,-9);cx.lineTo(-10,0);cx.lineTo(-6,9);cx.closePath();cx.fill();cx.stroke();
    cx.strokeStyle='#ffe08a';cx.lineWidth=1.6;cx.beginPath();cx.moveTo(-6,-6);cx.lineTo(-16,-12);cx.moveTo(-6,6);cx.lineTo(-16,12);cx.stroke();cx.fillStyle='#fff';cx.beginPath();cx.arc(4,-4,1.8,0,TAU);cx.arc(4,4,1.8,0,TAU);cx.fill();cx.restore();
    additive(()=>{for(let i=0;i<N;i+=2)glow(P[i][0],P[i][1],i?12:26,i?'#3fb8e8':'#c8f0ff',fade*(i?0.6:0.9))},'lighter');
    if(Math.random()<0.5)addPart(P[N-1][0],P[N-1][1],rand(-20,20),rand(-40,0),0.45,'#a8e4ff',2.4,60,'c',1)}
  if(k.linhquang)for(const b of G.projs)if(b.lq)additive(()=>{glow(b.x,b.y,30,'#ffd23a',0.8);glow(b.x-b.vx*0.03,b.y-b.vy*0.03,20,'#ffb347',0.5)},'lighter');
  drawWeaponFx(p);
});

/* ================= RƠI ĐỒ & HÌNH ẢNH ================= */
function drawLegBeam(d){const D=LEGENDS[d.val.leg]||{col:LEG_COL},x=d.x,y=d.y,t=G.t,k=0.8+Math.sin(t*4+d.id*7)*0.2;
  additive(()=>{let gr=cx.createLinearGradient(0,y-280,0,y);gr.addColorStop(0,'rgba(255,140,30,0)');gr.addColorStop(0.65,'rgba(255,150,40,0.5)');gr.addColorStop(1,'rgba(255,200,90,0.95)');
    cx.globalAlpha=0.6*k;cx.fillStyle=gr;cx.fillRect(x-20,y-280,40,280);
    gr=cx.createLinearGradient(0,y-250,0,y);gr.addColorStop(0,'rgba(255,255,255,0)');gr.addColorStop(1,'rgba(255,250,225,1)');cx.globalAlpha=0.85*k;cx.fillStyle=gr;cx.fillRect(x-3,y-250,6,250);
    glow(x,y-14,46,LEG_COL,0.7*k);glow(x,y-14,20,D.col,0.6);
    cx.translate(x,y);cx.scale(1,0.38);cx.rotate(t*1.4);cx.globalAlpha=0.85;cx.strokeStyle='#ffb347';cx.lineWidth=3;cx.beginPath();cx.arc(0,0,32+Math.sin(t*3)*3,0,TAU);cx.stroke();
    cx.fillStyle='#fff0c8';for(let i=0;i<6;i++){cx.rotate(TAU/6);cx.beginPath();cx.moveTo(38,0);cx.lineTo(44,-4);cx.lineTo(50,0);cx.lineTo(44,4);cx.closePath();cx.fill()}},'lighter');
  if(Math.random()<0.35)addPart(x+rand(-14,14),y-rand(0,16),rand(-6,6),rand(-170,-90),rand(0.6,1),Math.random()<0.5?'#ffd23a':D.col,rand(1.5,3),-20,'c',1)}
const _drawDrop=drawDrop;
/* vẽ Huyền Thoại sau lớp cây cối để cột sáng luôn nhìn thấy */
drawDrop=function(d){if(d.kind==='legvis'||(d.kind==='item'&&d.val&&d.val.leg))return;_drawDrop(d)};
HK.on('drawWorld',()=>{for(const d of G.drops)if(d.kind==='legvis'||(d.kind==='item'&&d.val&&d.val.leg)){drawLegBeam(d);_drawDrop(d.kind==='legvis'?{x:d.x,y:d.y,z:d.z,t:d.t,id:d.id,kind:'item',val:d.val}:d)}});

/* tranh vật phẩm: nền hào quang + sắc riêng từng món */
const _iak=itemArtKey,_iac=itemArtCanvas;
itemArtKey=function(it){return it&&it.leg?'L|'+it.leg+'|'+(it.enh>=15?4:it.enh>=13?3:it.enh>=10?2:it.enh>=7?1:0):_iak(it)};
itemArtCanvas=function(it){if(!it||!it.leg)return _iac(it);const key=itemArtKey(it);const e=ITEM_ART[key];if(e)return e.c;
  const D=LEGENDS[it.leg]||{col:LEG_COL};const base=_iac({slot:it.slot,cls:it.cls,ilvl:31,rar:4,enh:it.enh,st:{},aff:[]});
  const S=base.width,c=document.createElement('canvas');c.width=c.height=S;const o=c.getContext('2d');
  o.fillStyle=_rg(o,S/2,S/2,S*0.05,S*0.5,[[0,'rgba(255,200,110,0.55)'],[0.5,'rgba(255,140,40,0.22)'],[1,'rgba(255,120,20,0)']]);o.fillRect(0,0,S,S);
  o.save();o.translate(S/2,S/2);o.globalCompositeOperation='lighter';for(let i=0;i<12;i++){o.rotate(TAU/12);o.fillStyle=i%2?'rgba(255,170,60,0.13)':'rgba(255,220,140,0.1)';o.beginPath();o.moveTo(0,0);o.lineTo(S*0.5,-S*0.035);o.lineTo(S*0.5,S*0.035);o.closePath();o.fill()}o.restore();
  const tc=document.createElement('canvas');tc.width=tc.height=S;const tg=tc.getContext('2d');tg.drawImage(base,0,0);tg.globalCompositeOperation='source-atop';tg.globalAlpha=0.28;tg.fillStyle=D.col;tg.fillRect(0,0,S,S);
  o.shadowColor=LEG_COL;o.shadowBlur=S*0.07;o.drawImage(tc,0,0);o.shadowColor='transparent';
  sparkle(o,S*0.76,S*0.22,S*0.08);sparkle(o,S*0.24,S*0.74,S*0.06);sparkle(o,S*0.82,S*0.7,S*0.04);
  ITEM_ART[key]={c,url:null};return c};

/* rời bản đồ (qua chương, Xa Phu): tự gom đồ Hiếm trở lên còn nằm đất để không mất đồ boss */
const _travel=travel;travel=function(mi,st){try{if(G.save&&G.drops)for(const d of G.drops)if(d.kind==='item'&&d.val&&d.val.rar>=2&&addToBag(d.val,true))UI.loot(itemName(d.val),RARITY[d.val.rar].color)}catch(e){console.error(e)}return _travel(mi,st)};
/* sức mạnh: ưu tiên đồ Huyền Thoại (hiệu ứng có giá trị) */
/* Truyền Công: đồ Huyền Thoại khi mặc vào nhận cấp cường hóa của món bị thay (nếu cao hơn), món cũ về +0. Tổng cấp rèn được bảo toàn. */
function inheritEnh(it){const S=G.save;if(!it||!it.leg||!S)return 0;const cur=S.equip[it.slot];return cur&&cur!==it&&cur.enh>it.enh?cur.enh:0}
const _ip=itemPower;itemPower=function(it){if(!it||!it.leg)return _ip(it);const e=inheritEnh(it);const v=e?_ip(Object.assign({},it,{enh:e})):_ip(it);return Math.round(v*1.2)};
const _eq=equipItem;equipItem=function(it){if(it&&it.leg){legGrow(it);const e=inheritEnh(it),old=G.save.equip[it.slot];
  if(e&&G.save.bag.includes(it)){it.enh=e;old.enh=0;UI.toast(`Truyền Công: ${it.name} nhận cấp +${e} từ ${old.name}`,'legend')}}return _eq(it)};
HK.on('lvl',()=>{const S=G.save;if(!S)return;for(const sl of SLOTS){const it=S.equip[sl];if(it&&it.leg)legGrow(it)}for(const it of S.bag)if(it.leg)legGrow(it)});

/* ================= GIAO DIỆN ================= */
const _cell=UI.cellHtml;UI.cellHtml=function(it,opt){const h=_cell.call(this,it,opt);return it&&it.leg?h.replace('class="cell','class="cell leg'):h};
const _card=UI.itemCard;UI.itemCard=function(it,cmp){let h=_card.call(this,it,cmp);if(!it||!it.leg)return h;const D=LEGENDS[it.leg];if(!D)return h;
  const wrong=D.slot==='vk'&&D.cls!==G.save.cls;
  h=h.replace('class="iframe"','class="iframe leg"');
  return h.slice(0,-6)+`<div class="legfx" style="--lc:${D.col}"><div class="lh">◆ ${esc(D.fx)}</div><p>${esc(D.d)}</p><i>${esc(D.fl)}</i><small>${wrong?'Chỉ phái '+esc(CLASS_BY_ID[D.cls].name)+' dùng được hiệu ứng này.':'Cấp đồ lớn dần theo cấp nhân vật. Khi mặc vào, nhận cấp cường hóa của món bị thay nếu cao hơn.'}</small></div></div>`};
const _offer=UI.offerEquip;UI.offerEquip=function(it){_offer.call(this,it);const el=document.getElementById('offer');if(!el)return;el.classList.toggle('leg',!!(it&&it.leg));
  if(it&&it.leg){const oh=el.querySelector('.oh');if(oh)oh.textContent='HUYỀN THOẠI · '+LEGENDS[it.leg].fx.toUpperCase()}};
const _pbag=UI.p_bag;UI.p_bag=function(){let h=_pbag.call(this);const S=G.save,L=LSave();
  const elig=Object.keys(LEGENDS).filter(k=>LEGENDS[k].slot!=='vk'||LEGENDS[k].cls===S.cls);const n=elig.filter(k=>L.got.includes(k)).length;
  const sec=`<div class="sec"><h4>SỬ HUYỀN THOẠI · ${n}/${elig.length}</h4><div class="lgcodex">${elig.map(k=>L.got.includes(k)?`<span class="on" style="--lc:${LEGENDS[k].col}">${esc(LEGENDS[k].name)}</span>`:`<span>${esc(SLOT_NAME[LEGENDS[k].slot])} ???</span>`).join('')}</div>
    <p class="hist lgnote">Boss ${Math.round(CH.boss*100)}%, tinh anh ${(CH.elite*100).toLocaleString("vi-VN")}%, quái thường hiếm hoi. Lâu không gặp thì trời sẽ thương.</p></div>`;
  const i=h.indexOf('<div class="detail">');return i<0?h+sec:h.slice(0,i)+sec+h.slice(i)};
const _bbag=UI.b_bag;UI.b_bag=function(body){_bbag.call(this,body);const it=this.findItem(this.sel);if(!it||!it.leg)return;const b=body.querySelector('#dSv');if(!b)return;
  b.onclick=()=>this.confirm(`Phân giải ${it.name}? Đồ Huyền Thoại sẽ mất vĩnh viễn.`,()=>{const v=salvage(it);this.sel=null;this.toast(`+${v.ore} Huyền Thiết, +${fmt(v.gold)} vàng`);Audio_.play('clang');this.render()})};

/* ================= ÂM THANH ================= */
const _play=Audio_.play;Audio_.play=function(n,x){if(!this.on)return;
  switch(n){
    case'legend':this.tone(98,1.8,'sine',0.32,92);this.tone(147,1.4,'triangle',0.1,0,0.02);[523,587,698,784,880,1047,1175,1397].forEach((f,i)=>this.tone(f,0.6,'sine',0.08,0,0.12+i*0.06));this.noise(0.8,7000,0.8,0.07,0.1,10000);return;
    case'shatter':this.noise(0.55,5200,0.6,0.38,0,1400);[2400,1900,1500,1100,760].forEach((f,i)=>this.tone(f,0.25,'square',0.045,f*0.7,i*0.05));this.tone(82,0.6,'sine',0.32,38);return;
    case'forgeok':[523,659,784,1047,1319].forEach((f,i)=>this.tone(f,0.55,'triangle',0.1,0,i*0.05));this.tone(196,0.8,'sine',0.14);return;
    case'strike':this.tone(260+Math.random()*60,0.35,'square',0.05,250);this.tone(720,0.3,'triangle',0.05,700);this.noise(0.08,5000,1,0.25);this.tone(70,0.15,'sine',0.3,40);return;
  }
  return _play.call(this,n,x)};

/* ================= ÉP ĐỒ KIỂU MU ================= */
const BREAK_SHARE=[30,35,40,45,50]; // % trong số lần thất bại sẽ làm vỡ đồ, cho cấp hiện tại +10..+14
const MS=[[7,'Lam Quang','#62b4ff'],[10,'Kim Quang','#ffc53d'],[13,'Hỏa Quang','#ff5b3d'],[15,'Thần Quang','#fff0b0']];
function legForgeOdds(it){const e=it.enh;if(e>=15)return{ok:0,keep:0,drop:0,brk:0,max:1};const ok=FORGE_RATE[e],fail=100-ok;
  if(e<7)return{ok,keep:fail,drop:0,brk:0};if(e<10)return{ok,keep:0,drop:fail,brk:0};
  const brk=Math.round(fail*BREAK_SHARE[e-10]/10)/10;return{ok,keep:0,drop:Math.round((fail-brk)*10)/10,brk,share:BREAK_SHARE[e-10]}}
doForge=function(it,useCharm){
  const S=G.save,c=forgeCost(it);if(it.enh>=15)return{err:'Đã đạt cấp tối đa +15'};
  if(S.ore<c.ore)return{err:`Thiếu Huyền Thiết (cần ${c.ore})`};if(S.gold<c.gold)return{err:`Thiếu vàng (cần ${fmt(c.gold)})`};
  S.ore-=c.ore;S.gold-=c.gold;const O=legForgeOdds(it),from=it.enh;const R=window.LEGEND&&LEGEND.rng||Math.random;const ok=R()*100<O.ok;let prot=false,broke=false,crack=false,comp=0;
  if(ok)it.enh++;
  else if(from>=7){if(useCharm&&S.charm>0){S.charm--;prot=true}
    else if(from>=10&&R()*100<O.share){if(it.leg){it.enh=7;crack=true}
      else{broke=true;for(const sl of SLOTS)if(S.equip[sl]===it)delete S.equip[sl];const bi=S.bag.indexOf(it);if(bi>=0)S.bag.splice(bi,1);
        comp=Math.max(1,Math.ceil(salvageValue(it).ore/2));S.ore+=comp;S.lforge=S.lforge||{};S.lforge.broke=(S.lforge.broke||0)+1}}
    else it.enh--}
  sideEvent('forge',1);S.tut.forge=true;if(ok)S.score+=50*it.enh;recalc();updateLook();G.dirty.bag=1;saveGame();
  if(ok&&S.equip.vk===it){const m=MS.find(q=>q[0]===it.enh);if(m){const p=G.p;G.fx.push({k:'pillar',x:p.x,y:p.y,w:30,h:360,col:m[2],life:1.1,max:1.1});UI.toast(`Vũ khí thức tỉnh: ${m[1]} (+${m[0]})`,'legend')}}
  return{ok,from,to:it.enh,prot,broke,crack,comp,name:it.name};
};
/* mốc +15: vũ khí sáng Thần Quang */
const _look=updateLook;updateLook=function(){_look();const p=G.p,S=G.save;if(!p||!S)return;const w=S.equip.vk;if(w&&w.enh>=15)p.glow=4};

UI.p_forge=function(){const S=G.save;const list=[...SLOTS.map(s=>S.equip[s]).filter(Boolean),...S.bag.filter(i=>i.rar>=1).sort((a,b)=>itemPower(b)-itemPower(a))];
  if(!list.length)return`<p class="hist">Chưa có trang bị để rèn. Hãy đánh quái để nhặt đồ.</p>`;
  let it=this.findItem(this.forgeSel);if(!it||!list.includes(it)){it=list[0];this.forgeSel=it.id}
  const c=forgeCost(it),O=legForgeOdds(it),max=it.enh>=15,rate=O.ok,risk=it.enh>=7;
  const charmOn=risk&&!!this.useCharm&&S.charm>0;
  const nx=Object.assign({},it,{enh:Math.min(15,it.enh+1)});const s0=itemStats(it),s1=itemStats(nx);
  const rc=rate>=80?'#7dff8a':rate>=45?'#ffd23a':'#ff8a6a';const pc=v=>(Math.round(v*10)/10).toLocaleString('vi-VN')+'%';
  const fail=100-rate;let seg,leg;
  if(max){seg='';leg='<span style="--c:#ffd98a">Đã đạt cấp tối đa</span>'}
  else if(charmOn||it.enh<7){seg=`<i style="width:${rate}%;background:#5fcf6a"></i><i style="width:${fail}%;background:#6a7a8a"></i>`;leg=`<span style="--c:#5fcf6a">Thành công ${pc(rate)}</span>${fail?`<span style="--c:#8a9aaa">Giữ cấp ${pc(fail)}${charmOn?' (dùng 1 bùa)':''}</span>`:''}`}
  else{seg=`<i style="width:${rate}%;background:#5fcf6a"></i><i style="width:${O.drop}%;background:#e0a030"></i><i style="width:${O.brk}%;background:#e0321e"></i>`;
    leg=`<span style="--c:#5fcf6a">Thành công ${pc(rate)}</span><span style="--c:#e0a030">Tụt về +${it.enh-1} ${pc(O.drop)}</span>${O.brk?`<span style="--c:#e0321e">${it.leg?'Rơi về +7':'Vỡ đồ'} ${pc(O.brk)}</span>`:''}`}
  let note;if(max)note='Món đồ đã đạt +15, cấp cao nhất.';else if(it.enh<7)note='Dưới +7: thất bại không mất cấp.';else if(charmOn)note='Bùa Bảo Hộ đang bật: thất bại giữ nguyên cấp và không vỡ (mất 1 bùa).';
  else if(it.enh<10)note='Từ +7: thất bại tụt 1 cấp.';else note=it.leg?'Từ +10: thất bại tụt cấp, xui hơn thì rơi về +7. Đồ Huyền Thoại không vỡ.':`Từ +10: thất bại tụt cấp, ${O.share}% số lần thất bại làm VỠ NÁT món đồ.`;
  const danger=!max&&O.brk>0&&!charmOn&&!it.leg;
  const msRow=MS.map(([lv,nm,col])=>`<div class="lgms${it.enh>=lv?' on':''}" style="--mc:${col}"><b>+${lv}</b><span>${nm}</span></div>`).join('');
  return`<div class="chips">${list.map(x=>this.cellHtml(x,{eq:S.equip[x.slot]===x}).replace(`aria-pressed="${this.sel===x.id}"`,`aria-pressed="${x.id===it.id}"`)).join('')}</div>
    <div class="forge lgf"><div><div class="anvil lganv${it.enh>=15?' ms4':it.enh>=13?' ms3':it.enh>=10?' ms2':it.enh>=7?' ms1':''}" id="anv"><div class="lgheat" id="fHeat"></div><div class="lgflash" id="fFlash"></div>
      <div class="lgitem${it.leg?' leg':''}" id="fItem">${itemImg(it)}<span class="lgenh">+${it.enh}</span></div>
      <svg viewBox="0 0 170 120"><g id="hammer" style="transform-origin:140px 20px"><rect x="96" y="14" width="56" height="7" rx="3" fill="#6a4426"/><rect x="84" y="4" width="20" height="26" rx="3" fill="#5a5d66"/><rect x="84" y="4" width="20" height="6" fill="#8a8e98"/></g>
      <path d="M30 70h92c0 10-8 16-26 16v14h12v8H52v-8h12V86C44 86 32 80 30 70z" fill="#3a3d44"/><rect x="40" y="66" width="76" height="6" fill="#6a6e78"/></svg>
      <div class="fres" id="fRes"></div><div class="fres2" id="fRes2"></div></div>
      <div class="lgmsrow" aria-label="Mốc cường hóa">${msRow}</div></div>
    <div>${this.itemCard(it)}${max?'':`<div class="ln" style="font:700 13px var(--f-ui);margin-top:8px;display:block">Lên +${nx.enh}: ${Object.keys(s1).map(k=>`${STAT_NAME[k]} <span class="dlt up">+${Math.round((s1[k]-s0[k])*10)/10}</span>`).join(', ')}</div>`}
      <div class="rate" style="margin-top:10px"><div class="ring" style="--v:${rate};--rc:${rc}"><b>${max?'MAX':rate+'%'}</b></div>
        <div style="min-width:0;flex:1"><div class="cost"><span class="${S.ore<c.ore?'bad':''}">${ICO_ORE} ${c.ore} (có ${S.ore})</span><span class="${S.gold<c.gold?'bad':''}">${ICO_GOLD} ${fmt(c.gold)} (có ${fmt(S.gold)})</span></div>
        <div class="lgbar" role="img" aria-label="Tỉ lệ kết quả">${seg}</div><div class="lgleg">${leg}</div></div></div>
      <div class="lgnote2${danger?' bad':charmOn?' safe':''}">${note}</div>
      ${risk&&!max?`<button class="tog" role="switch" id="fCharm" aria-checked="${charmOn}"><span>Dùng Bùa Bảo Hộ<small>Còn ${S.charm} lá. Thất bại giữ cấp${it.enh>=10?', không vỡ':''}.</small></span><span class="sw"></span></button>`:''}
      <div class="row"><button class="btn gold${danger?' lgdanger':''}" id="fGo" ${max?'disabled':''}>Cường hóa +${nx.enh}</button><button class="btn sec" id="fShop">Mua Huyền Thiết</button></div></div></div>`};

UI.b_forge=function(body){const S=G.save,self=this;
  body.querySelectorAll('.cell[data-id]').forEach(b=>b.onclick=()=>{self.forgeSel=+b.dataset.id;self._armed=null;self.render()});
  const ch=body.querySelector('#fCharm');if(ch)ch.onclick=()=>{if(S.charm<=0){self.toast('Không còn Bùa Bảo Hộ. Mua ở Chợ.');return}self.useCharm=!self.useCharm;self._armed=null;self.render()};
  const sh=body.querySelector('#fShop');if(sh)sh.onclick=()=>self.open('shop');
  const go=body.querySelector('#fGo');if(!go)return;
  go.onclick=()=>{const it=self.findItem(self.forgeSel);if(!it||self.forging)return;const c=forgeCost(it);
    if(S.ore<c.ore||S.gold<c.gold){self.toast(S.ore<c.ore?`Thiếu Huyền Thiết (cần ${c.ore}). Phân giải đồ hoặc mua ở Chợ.`:`Thiếu vàng (cần ${fmt(c.gold)})`,'warn');return}
    const O=legForgeOdds(it),charmOn=it.enh>=7&&self.useCharm&&S.charm>0;
    if(O.brk>0&&!charmOn&&!it.leg&&self._armed!==it.id){self._armed=it.id;go.textContent='Nhấn lần nữa: có thể vỡ!';go.classList.add('lgarm');Audio_.play('ui');
      setTimeout(()=>{if(self._armed===it.id){self._armed=null;if(go.isConnected){go.textContent='Cường hóa +'+(it.enh+1);go.classList.remove('lgarm')}}},3000);return}
    self._armed=null;self.forging=true;go.disabled=true;const img=body.querySelector('#fItem img'),src=img?img.src:'';
    const finish=()=>{const r=doForge(it,self.useCharm);self.forging=false;
      if(r.err){self.toast(r.err,'warn');self.render();return}
      if(r.broke)self.forgeSel=null;self.render();forgeResult(self,r,src)};
    if(anim&&!REDUCED){const tl=anim.timeline({onComplete:finish});anim.to('#fHeat',{autoAlpha:1,duration:0.9,ease:'power1.in'});
      for(let k=0;k<3;k++){tl.to('#hammer',{rotation:-42,duration:0.11,ease:'power2.in'}).to('#hammer',{rotation:0,duration:0.09,ease:'power3.in',onComplete:()=>{Audio_.play('strike');strikeFx(k)}})}
      tl.to({},{duration:0.12})}
    else{Audio_.play('strike');finish()}};
};
function spk(box,n,col,dist,x,y){if(!anim)return;for(let i=0;i<n;i++){const s=document.createElement('i');s.className='spk';if(col)s.style.background=col;if(x!=null){s.style.left=x;s.style.top=y}box.appendChild(s);
  const a=Math.random()*TAU,d=dist*(0.4+Math.random()*0.8);anim.fromTo(s,{x:0,y:0,autoAlpha:1},{x:Math.cos(a)*d,y:Math.sin(a)*d*0.8-20,autoAlpha:0,duration:0.45+Math.random()*0.4,ease:'power2.out',onComplete:()=>s.remove()})}}
function strikeFx(k){const a=document.getElementById('anv');if(!a)return;spk(a,6+k*3,null,50+k*20,'50%','52%');
  anim.fromTo(a,{x:k%2?4:-4},{x:0,duration:0.18,ease:'elastic.out(1,0.3)'});anim.fromTo('#fItem',{y:-4,filter:'brightness(1.8)'},{y:0,filter:'brightness(1)',duration:0.25});
  anim.fromTo('#fFlash',{autoAlpha:0.35+k*0.12},{autoAlpha:0,duration:0.2})}
function forgeResult(self,r,src){const res=document.getElementById('fRes'),r2=document.getElementById('fRes2'),a=document.getElementById('anv');
  let txt,col,sub='';
  if(r.ok){txt=`Thành công! +${r.to}`;col='#ffd98a';const m=MS.find(q=>q[0]===r.to);if(m){sub=`Đạt mốc ${m[1]}`;col=m[2]}Audio_.play('forgeok')}
  else if(r.broke){txt='Vỡ nát!';col='#ff5a3a';sub=`${r.name} +${r.from} đã vỡ. Thu hồi ${r.comp} Huyền Thiết.`;Audio_.play('shatter')}
  else if(r.prot){txt='Thất bại, bùa giữ cấp';col='#9fd0ff';sub='Bùa Bảo Hộ cháy thành tro';Audio_.play('fail')}
  else if(r.crack){txt=`Thất bại, rơi về +${r.to}`;col='#ff9a5a';sub='Linh khí Huyền Thoại hộ chủ, đồ không vỡ';Audio_.play('fail')}
  else if(r.to<r.from){txt=`Thất bại, tụt về +${r.to}`;col='#ff8a6a';Audio_.play('fail')}
  else{txt='Thất bại, giữ cấp';col='#ffb08a';Audio_.play('fail')}
  self.toast(r.ok?`${itemName(Object.assign({},{name:r.name,enh:r.to}))} cường hóa thành công`:r.broke?`${r.name} đã vỡ nát!`:'Rèn thất bại',r.ok?'quest':'warn');
  if(!res){return}
  res.textContent=txt;res.style.color=col;if(r2){r2.textContent=sub;r2.style.color=col}
  if(!anim||REDUCED){res.style.opacity=1;if(r2)r2.style.opacity=1;return}
  anim.fromTo(res,{scale:0.4,autoAlpha:0},{scale:1,autoAlpha:1,duration:0.45,ease:'back.out(2.2)'});if(r2)anim.fromTo(r2,{autoAlpha:0,y:6},{autoAlpha:1,y:0,duration:0.35,delay:0.15});
  const fl=document.getElementById('fFlash');
  if(r.ok){if(fl){fl.style.background='radial-gradient(circle at 50% 55%,#fff8e0,rgba(255,200,90,.6) 40%,transparent 70%)';anim.fromTo(fl,{autoAlpha:1},{autoAlpha:0,duration:0.6})}
    spk(a,26,null,120,'50%','45%');spk(a,10,col,90,'50%','45%');anim.fromTo('#fItem',{scale:1.35},{scale:1,duration:0.6,ease:'elastic.out(1,0.4)'})}
  else{if(fl){fl.style.background='radial-gradient(circle at 50% 55%,rgba(255,60,30,.7),transparent 70%)';anim.fromTo(fl,{autoAlpha:0.9},{autoAlpha:0,duration:0.5})}
    anim.fromTo(a,{x:-9},{x:0,duration:0.5,ease:'elastic.out(1.2,0.2)'})}
  if(r.broke&&a&&src){const it=document.getElementById('fItem');if(it)anim.fromTo(it,{autoAlpha:0},{autoAlpha:1,delay:0.9,duration:0.4});
    const P=[[0,0,55,0,40,45,0,60],[55,0,100,0,100,40,40,45],[0,60,40,45,50,100,0,100],[40,45,100,40,100,100,50,100]];
    P.forEach((q,i)=>{const d=document.createElement('div');d.className='lgshard';d.style.backgroundImage=`url(${src})`;d.style.clipPath=`polygon(${q[0]}% ${q[1]}%,${q[2]}% ${q[3]}%,${q[4]}% ${q[5]}%,${q[6]}% ${q[7]}%)`;a.appendChild(d);
      const sx=i%2?1:-1,sy=i<2?-1:1;anim.fromTo(d,{x:0,y:0,rotation:0,autoAlpha:1},{x:sx*rand(50,90),y:sy*rand(20,50)+30,rotation:sx*rand(30,90),autoAlpha:0,duration:1.0,ease:'power2.out',onComplete:()=>d.remove()})});
    spk(a,20,'#ff7a4a',110,'50%','40%')}}

/* ================= CSS ================= */
const css=`
.cell.leg,.iframe.leg{border-color:${LEG_COL};box-shadow:inset 0 0 12px rgba(0,0,0,.6),0 0 0 1px rgba(255,214,140,.35),0 0 12px rgba(255,140,30,.5);animation:lgPulse 2.4s ease-in-out infinite}
@keyframes lgPulse{50%{box-shadow:inset 0 0 12px rgba(0,0,0,.6),0 0 0 1px rgba(255,232,170,.7),0 0 20px rgba(255,150,40,.85)}}
.cell.leg::before{content:"";position:absolute;inset:0;border-radius:8px;background:linear-gradient(115deg,transparent 38%,rgba(255,232,180,.38) 50%,transparent 62%);background-size:260% 100%;animation:lgShine 3.2s linear infinite;pointer-events:none}
@keyframes lgShine{from{background-position:130% 0}to{background-position:-130% 0}}
.legfx{margin-top:6px;padding:9px 11px;border-radius:10px;border:1px solid rgba(255,157,46,.65);background:linear-gradient(135deg,rgba(255,140,30,.2),rgba(80,30,5,.4));box-shadow:inset 3px 0 0 var(--lc,${LEG_COL})}
.legfx .lh{font:400 15px/1.25 var(--f-display);color:#ffc069;letter-spacing:.02em}
.legfx p{margin:4px 0 0;font:600 13px/1.45 var(--f-ui);color:#fff0d8}
.legfx i{display:block;margin-top:6px;font:italic 500 12px/1.45 var(--f-ui);color:#d9b98a}
.legfx small{display:block;margin-top:5px;font:600 11px/1.3 var(--f-ui);color:#ffb35a}
.toast.legend{border-color:${LEG_COL};color:#ffe0b0;background:linear-gradient(90deg,rgba(70,28,4,.95),rgba(32,14,4,.95));font-size:15px;box-shadow:0 0 18px rgba(255,140,40,.45)}
#offer.leg{border-color:${LEG_COL}!important;box-shadow:0 0 18px rgba(255,140,40,.5)}#offer.leg .oh{color:#ffb347}
.lgcodex{display:flex;flex-wrap:wrap;gap:6px}
.lgcodex span{padding:5px 9px;border-radius:8px;border:1px dashed rgba(255,255,255,.15);font:600 12px/1.2 var(--f-ui);color:var(--dim)}
.lgcodex span.on{border:1px solid ${LEG_COL};color:#ffd8a0;background:rgba(255,140,30,.12);box-shadow:inset 3px 0 0 var(--lc)}
.lgnote{font-size:12px;color:var(--dim);margin-top:6px}
.lganv{height:176px}
.lganv svg{position:relative;top:22px}
.lgheat{position:absolute;inset:0;background:radial-gradient(ellipse at 50% 62%,rgba(255,110,30,.55),transparent 55%);opacity:0;visibility:hidden;pointer-events:none}
.lgflash{position:absolute;inset:0;opacity:0;visibility:hidden;pointer-events:none;z-index:3}
.lgitem{position:absolute;left:calc(50% - 17px);top:78px;width:54px;height:54px;z-index:2;filter:drop-shadow(0 4px 6px rgba(0,0,0,.6))}
.lgitem .iart{width:100%;height:100%}
.lgitem.leg{filter:drop-shadow(0 0 8px rgba(255,150,40,.8))}
.lgenh{position:absolute;left:-30px;top:14px;font:800 13px var(--f-ui);color:var(--vang2);text-shadow:0 1px 3px #000}
.ms1 .lgitem{filter:drop-shadow(0 0 8px #62b4ff)}.ms2 .lgitem{filter:drop-shadow(0 0 10px #ffc53d)}.ms3 .lgitem{filter:drop-shadow(0 0 12px #ff5b3d)}.ms4 .lgitem{filter:drop-shadow(0 0 14px #fff0b0) drop-shadow(0 0 6px #ffc53d)}
.lganv .fres{z-index:4;top:8px;text-shadow:0 2px 6px #000;padding:0 8px}
.lganv .fres2{position:absolute;left:0;right:0;bottom:8px;z-index:4;text-align:center;font:700 12px/1.3 var(--f-ui);opacity:0;padding:0 8px;text-shadow:0 1px 3px #000}
.lgshard{position:absolute;left:calc(50% - 17px);top:78px;width:54px;height:54px;background-size:cover;z-index:5;pointer-events:none}
.lgmsrow{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:6px;margin-top:8px}
.lgms{display:flex;flex-direction:column;align-items:center;gap:1px;padding:6px 2px;border-radius:9px;border:1px solid rgba(255,255,255,.12);font:600 11px/1.2 var(--f-ui);color:var(--dim);background:rgba(0,0,0,.2)}
.lgms b{font:800 13px var(--f-ui);color:var(--dim)}
.lgms.on{border-color:var(--mc);color:var(--ink);background:color-mix(in srgb,var(--mc) 16%,transparent);box-shadow:0 0 10px color-mix(in srgb,var(--mc) 40%,transparent)}.lgms.on b{color:var(--mc)}
.lgbar{display:flex;height:12px;margin-top:7px;border-radius:6px;overflow:hidden;background:#0e0a08;border:1px solid var(--line)}
.lgbar i{display:block;height:100%}
.lgleg{display:flex;flex-wrap:wrap;gap:3px 12px;margin-top:6px;font:700 12px/1.3 var(--f-ui)}
.lgleg span{white-space:nowrap}
.lgleg span::before{content:"";display:inline-block;width:9px;height:9px;border-radius:2px;background:var(--c);margin-right:5px;vertical-align:-1px}
.lgnote2{margin-top:8px;padding:8px 10px;border-radius:9px;border:1px solid rgba(255,255,255,.12);background:rgba(0,0,0,.22);font:600 12.5px/1.4 var(--f-ui);color:var(--dim)}
.lgnote2.bad{border-color:#ff6a4a;background:rgba(120,20,10,.35);color:#ffc0b0}
.lgnote2.safe{border-color:#62b4ff;background:rgba(20,50,100,.3);color:#cfe4ff}
.btn.lgdanger{background:linear-gradient(#ffb070,#c8501a);border-color:#ffe0c0;color:#2a0e04}
.btn.lgarm{background:linear-gradient(#ff5a3a,#a01a0a);color:#fff;animation:lgArm .5s ease-in-out infinite alternate}
@keyframes lgArm{to{box-shadow:0 0 16px rgba(255,80,40,.9)}}
@media (prefers-reduced-motion:reduce){.cell.leg,.iframe.leg,.cell.leg::before,.btn.lgarm{animation:none}}
`;
const st=document.createElement('style');st.id='legendCss';st.textContent=css;document.head.appendChild(st);

window.LEGEND={LEGENDS,LS,make:legMake,drop:legDrop,odds:legForgeOdds,grow:legGrow,pick:legPick,save:LSave,CH,PITY};
})();
