/* ============ GIA TƯỚNG (giatuong.js) ============
   Bạn đồng hành theo hầu và chiến đấu cùng người chơi. Tám gia tướng mang dáng lịch sử Đại Việt, mỗi người một lối đánh:
     Chiến Tượng (chắn đòn, giẫm đất hất văng) · Hổ Xám (lao vồ) · Nghĩa Binh Lam Sơn (giáo thủ) · Nỏ Thủ Âu Lạc (bắn xa)
     Nữ Tướng Tây Sơn (song đao) · Đại Bàng (quấy từ trên không) · Thầy Lang (chữa thương) · Kim Quy (vầng giáp giảm sát thương, cuối game)
   - Chiêu mộ / nâng sao (1–5) ở Mã Trường trong thành (NPC Đội Trưởng Gia Tướng hoặc thẻ "Gia Tướng" trong bảng Võ Đạo).
     Tốn vàng + Quân Lương (quái thường) + Ấn Tín (tinh anh, boss) + Hổ Phù (boss) cho bậc cao.
   - Xuất trận 1 gia tướng, từ Cảnh Giới Viên Mãn (realmIdx ≥ 4) được 2. Chỉ số theo công/sinh lực của người chơi × bậc sao × Thân Mật.
   - Bị hạ thì trọng thương 20 giây rồi tự hồi bên cạnh người chơi. Không tốn phí duy trì.
   - Thân Mật (0–10) tăng khi cùng hạ quái; mốc 3/6/10 mở thưởng vĩnh viễn cho người chơi.
   - Sát thương gia tướng đi qua hurtEnemy với o.proc=1, o.gt=<id> nên bí kíp/truyền thuyết không kích hoạt lặp.
   Lưu: G.save.gt = {v, own:{id:{t,b}}, act:[id], ql, an, hf, hint}  (tạo khi cần, bản lưu cũ vẫn chạy).
   Móc: tick, kill, hit, stats, dmgIn, ysort (render.js), drawWorld. Bọc: townNpcs, UI.open, UI.npcPrompt, UI.p_mount/b_mount.
   API: window.GT */
(function(){
const NAME={ql:'Quân Lương',an:'Ấn Tín',hf:'Hổ Phù'};
const RCOL={ql:'#e8c88a',an:'#ff8a6a',hf:'#ffd23a'};
const ICO={
  ql:'<svg viewBox="0 0 16 16" width="15" height="15"><path d="M5 3h6l-1 2c3 1 4 4 4 6 0 3-3 4-6 4S2 14 2 11c0-2 1-5 4-6z" fill="#b8925a"/><path d="M6 3h4l-.8 2H6.8z" fill="#7a5a30"/><path d="M5 10h6" stroke="#7a5a30" stroke-width="1.2"/></svg>',
  an:'<svg viewBox="0 0 16 16" width="15" height="15"><rect x="2.5" y="5" width="11" height="9" rx="1.5" fill="#c8361f"/><rect x="6" y="1.5" width="4" height="4" rx="1" fill="#e2b24a"/><path d="M5 8h6M8 8v4M5.5 12h5" stroke="#ffd98a" stroke-width="1.2" fill="none"/></svg>',
  hf:'<svg viewBox="0 0 16 16" width="15" height="15"><path d="M2 9c0-3 3-5 6-5h5v4l-2 1 2 1v3H6c-2 0-4-2-4-4z" fill="#e2b24a"/><path d="M5 8l2-1M5 10.5h5" stroke="#7a4a10" stroke-width="1.2"/><circle cx="11" cy="6.3" r=".9" fill="#7a4a10"/></svg>',
  gold:'<svg viewBox="0 0 16 16" width="15" height="15"><circle cx="8" cy="8" r="6.5" fill="#c08a2a"/><circle cx="7.4" cy="7.4" r="4.8" fill="#ffd23a"/></svg>'};
const BON_LBL={hpp:'% sinh lực',crit:'% chí mạng',atkp:'% công',aspd:'% tốc đánh',cdmg:'% ST chí mạng',spd:'% tốc chạy',ls:'% hút máu',def:'% thủ'};
const MS=[3,6,10];// mốc Thân Mật

/* ---------------- dáng vẽ ---------------- */
const LK={
  nghia:{skin:'#d9a878',hair:'#1a1410',robe:'#6a5434',robe2:'#3a2e1e',pants:'#3a3024',boots:'#2a1d14',sash:'#c8361f',armor:'leather',hat:'scarf',hatC:'#c8361f',wp:'spear',wc:'#cfd5da'},
  no:{skin:'#d8a878',hair:'#1a1410',robe:'#7a5a2a',robe2:'#4a3416',pants:'#4a3a24',boots:'#2a1d14',sash:'#2f8a6a',armor:'leather',hat:'topknot',hatC:'#1a1410',band:'#2f8a6a',tails:'#2f8a6a',quiver:1,wp:'bow',wc:'#6a4426'},
  nutuong:{skin:'#efc9a0',hair:'#141010',robe:'#b8261a',robe2:'#f0c040',pants:'#3a1a14',boots:'#2a140c',sash:'#f0c040',armor:'lamellar',plate:'#e0b850',hat:'topknot',hatC:'#141010',band:'#f0c040',tails:'#ff5a3a',cape:'#7a1410',wp:'dual',wc:'#f2f4f6'},
  thaylang:{skin:'#e3c2a0',hair:'#d8d2c4',robe:'#4f6e4a',robe2:'#c9b48a',pants:'#3a4a3a',boots:'#2a2018',sash:'#c9a24e',armor:'mage',hat:'conical',hatC:'#d8c48a',wp:'staffs',wc:'#6a4a2a',beard:'white'},
  nai:{skin:'#c99a6e',hair:'#1a1410',robe:'#8a2a1e',robe2:'#e0b030',pants:'#3a2418',boots:'#2a1810',sash:'#e0b030',armor:'robe',hat:'scarf',hatC:'#e0b030',wp:'spear',wc:'#d8dde0'},
  gtcap:{skin:'#dcae84',hair:'#1a1410',robe:'#7a2a1e',robe2:'#e2b24a',pants:'#2a1a14',boots:'#1a120c',sash:'#e2b24a',armor:'lamellar',plate:'#c9a24e',hat:'plume',hatC:'#c9a24e',cape:'#8f1f14',wp:'spear',wc:'#dfe6ea',beard:'stache'}};
LOOKS.gtcap=LK.gtcap;// NPC trong thành
const MT_HO={id:'gt_ho',body:'tiger',c:{coat:'#9a9aa2',dark:'#26262e',belly:'#ecebe6',tack:'#7a1f14',trim:'#e0b030'}};
const MT_VOI={id:'gt_voi',body:'elephant',c:{coat:'#8a868c',dark:'#46444c',tack:'#2f4a6b',trim:'#f0c040'}};

/* ---------------- danh sách gia tướng ----------------
   ai: lối đánh · hp/atk/def: hệ số so với người chơi · spd px/giây · range tầm đánh · cd hồi đòn · r bán kính va chạm */
const ROSTER=[
 {id:'nghia',name:'Nghĩa Binh Lam Sơn',sh:'Nghĩa Binh',role:'Giáo thủ',kind:'human',ai:'melee',hp:1.15,atk:1.0,def:1,spd:180,range:58,cd:1.05,r:13,lv:5,
  cost:{gold:200,ql:0,an:0},bond:{k:'atkp',v:[2,2,3]},sk:'Phóng Giáo',skd:'Cứ 8 giây phóng một mũi giáo xuyên 4 kẻ địch.',
  d:'Nghĩa quân áo vải chít khăn đỏ, theo Lê Lợi dựng cờ ở Lam Sơn năm 1418. Đâm giáo xuyên hàng, bền bỉ, rẻ để chiêu mộ.'},
 {id:'no',name:'Nỏ Thủ Âu Lạc',sh:'Nỏ Thủ',role:'Bắn xa',kind:'human',ai:'ranged',hp:0.8,atk:1.05,def:0.8,spd:185,range:300,cd:1.25,r:13,lv:8,
  cost:{gold:700,ql:5,an:1},bond:{k:'aspd',v:[2,2,3]},sk:'Nỏ Liên Châu',skd:'Cứ 7 giây bắn năm mũi tên tỏa quạt.',
  d:'Xạ thủ dùng nỏ Liên Châu thời An Dương Vương, giữ thành Cổ Loa. Đứng xa bắn tỉa, giữ khoảng cách với kẻ địch.'},
 {id:'ho',name:'Hổ Xám Tam Điệp',sh:'Hổ Xám',role:'Lao vồ',kind:'tiger',ai:'pounce',hp:1.05,atk:1.15,def:0.9,spd:260,range:34,cd:0.85,r:17,lv:12,
  cost:{gold:1500,ql:8,an:2},bond:{k:'crit',v:[1,1,2]},sk:'Mãnh Hổ Vồ Mồi',skd:'Lao vồ kẻ địch ở xa, gây sát thương lớn và làm choáng.',
  d:'Mãnh hổ lông xám ở đèo Tam Điệp, được thuần từ khi còn nhỏ. Nhanh nhất trong các gia tướng, vồ từ xa rồi cào xé.'},
 {id:'thaylang',name:'Thầy Lang Nam Dược',sh:'Thầy Lang',role:'Chữa thương',kind:'human',ai:'heal',hp:0.85,atk:0.55,def:0.8,spd:185,range:240,cd:1.5,r:13,lv:16,
  cost:{gold:3000,ql:10,an:3},bond:{k:'ls',v:[0.3,0.3,0.4]},sk:'Nam Dược Hồi Xuân',skd:'Cứ 5 giây chữa thương cho bạn hoặc gia tướng còn lại.',
  d:'Lương y theo phép "thuốc Nam chữa người Nam" của Tuệ Tĩnh. Đứng sau lưng bạn, rắc thuốc cầm máu, ném bùa ngải khi rảnh tay.'},
 {id:'daibang',name:'Đại Bàng Tản Viên',sh:'Đại Bàng',role:'Trên không',kind:'eagle',ai:'air',hp:0.75,atk:1.1,def:0.7,spd:300,range:30,cd:1.6,r:12,lv:20,fly:1,
  cost:{gold:5000,ql:12,an:5},bond:{k:'spd',v:[2,2,3]},sk:'Bổ Nhào',skd:'Lượn trên đầu quân địch, bổ nhào mổ rồi vút lên. Khó bị đánh trúng.',
  d:'Chim đại bàng trên đỉnh Tản Viên, nơi Sơn Tinh ngự. Bay vòng quanh trận, chỉ hạ thấp khi bổ nhào nên ít khi bị thương.'},
 {id:'nutuong',name:'Nữ Tướng Tây Sơn',sh:'Nữ Tướng',role:'Song đao',kind:'human',ai:'melee',hp:1.05,atk:1.25,def:1,spd:205,range:36,cd:0.7,r:13,lv:28,
  cost:{gold:10000,ql:16,an:8},bond:{k:'cdmg',v:[5,5,8]},sk:'Phong Đao',skd:'Cứ 7 giây múa song đao quét ba vòng quanh mình.',
  d:'Nữ tướng song đao theo dáng Bùi Thị Xuân, đô đốc nhà Tây Sơn từng cưỡi voi ra trận. Ra đòn nhanh nhất, mỗi đòn hai nhát.'},
 {id:'tuong',name:'Chiến Tượng',sh:'Chiến Tượng',role:'Chắn đòn',kind:'elephant',ai:'tank',hp:3.0,atk:0.9,def:1.6,spd:150,range:50,cd:1.6,r:26,lv:36,
  cost:{gold:20000,ql:20,an:12},bond:{k:'hpp',v:[3,3,4]},sk:'Voi Giẫm Đất',skd:'Cứ 6 giây giẫm đất: sát thương diện rộng, hất văng và làm choáng.',
  d:'Voi trận theo Hai Bà Trưng, Bà Triệu và nghĩa quân Tây Sơn, có quản tượng cầm giáo ngồi trên bành. Chậm nhưng cực trâu, chắn đường quân địch.'},
 {id:'kimquy',name:'Kim Quy',sh:'Kim Quy',role:'Hộ thể',kind:'turtle',ai:'tank',hp:2.4,atk:0.8,def:1.8,spd:150,range:44,cd:1.8,r:22,lv:60,
  cost:{gold:60000,ql:30,an:20,hf:3},bond:{k:'def',v:[3,3,4]},sk:'Kim Giáp Hộ Thể',skd:'Vầng Kim Giáp giảm sát thương bạn nhận; cứ 12 giây phủ khiên vàng lên bạn.',
  d:'Rùa Vàng trao móng làm lẫy nỏ thần cho An Dương Vương, nổi lên hồ Lục Thủy đòi lại gươm Thuận Thiên của Lê Lợi. Gia tướng cuối cùng, chở che chủ nhân.'},
];
const BY={};ROSTER.forEach(D=>BY[D.id]=D);

/* ---------------- lưu ---------------- */
function gs(){const S=G.save;if(!S)return null;if(!S.gt||typeof S.gt!=='object')S.gt={};const g=S.gt;
  if(!g.v)g.v=1;if(!g.own||typeof g.own!=='object')g.own={};if(!Array.isArray(g.act))g.act=[];for(const k of['ql','an','hf'])if(typeof g[k]!=='number')g[k]=0;
  g.act=g.act.filter((id,i,a)=>g.own[id]&&BY[id]&&a.indexOf(id)===i);return g}
const maxAct=()=>{let r=0;try{r=typeof realmIdx==='function'?realmIdx():0}catch(e){}return r>=4?2:1};
const needB=l=>Math.round(25*Math.pow(l+1,1.55));
function bondLv(o){return Math.min(10,o.bl||0)}
function bondBonus(D,bl){let v=0;MS.forEach((m,i)=>{if(bl>=m)v+=D.bond.v[i]});return Math.round(v*10)/10}
const tierK=t=>[0,1,1.32,1.72,2.2,2.8][t]||1;
function upCost(D,t){if(t>=5)return null;const base=Math.max(400,D.cost.gold*0.8);
  return{gold:Math.round(base*[1,2.2,4.5,9][t-1]/50)*50,ql:[6,12,20,32][t-1],an:[2,5,10,18][t-1]+Math.floor(D.cost.an/3),hf:t===3?1:t===4?2:0}}
function have(c){const g=gs(),S=G.save;return S.gold>=(c.gold||0)&&g.ql>=(c.ql||0)&&g.an>=(c.an||0)&&g.hf>=(c.hf||0)}
function pay(c){const g=gs(),S=G.save;S.gold-=c.gold||0;g.ql-=c.ql||0;g.an-=c.an||0;g.hf-=c.hf||0}
function gain(k,n,why){const g=gs();if(!g||!n)return;g[k]+=n;HK.ev('res','gt_'+k,n,why);try{UI.loot(`+${n} ${NAME[k]}`,RCOL[k])}catch(e){}}
function inTown(){const p=G.p;return !!p&&!!p.inCamp&&!(window.VT&&VT.on)}

/* ---------------- trạng thái chạy ---------------- */
const R={list:[],save:null,W:null,pj:[],statT:0,hudT:0,ys:-1,frame:0,hud:null,layT:0};
window.GT_R=R;
function reset(){R.list=[];R.pj=[];R.save=G.save;R.W=null;if(G.p){G.p.gtSh=0}}
function makeC(id){const D=BY[id];return{id,D,x:G.p.x,y:G.p.y,r:D.r,f:1,walk:0,moving:false,hp:0,max:0,atk:1,def:1,cd:0.5,skT:3+Math.random()*2,atkAnim:-1,animDur:0.35,hitAt:null,hitFn:null,
  down:0,flash:0,hurtT:-9,stuckT:0,side:Math.random()<0.5?1:-1,z:D.fly?50:0,jz:0,orb:Math.random()*TAU,dash:null,seed:Math.random()*10,fly:D.fly?1:0,tgt:null,tgtT:0,rot:0,ph:Math.random()*6,healT:2.5,shT:6}}
function sync(){const g=gs();if(!g)return;while(g.act.length>maxAct())g.act.pop();
  const want=g.act;R.list=R.list.filter(c=>want.includes(c.id));
  for(const id of want)if(!R.list.find(c=>c.id===id)){const c=makeC(id);calcStats(c);c.hp=c.max;R.list.push(c);snap(c,true)}
  R.list.sort((a,b)=>want.indexOf(a.id)-want.indexOf(b.id));hudSync(true)}
function calcStats(c){const p=G.p,g=gs();if(!p||!g)return;const o=g.own[c.id];if(!o)return;const D=c.D,t=o.t||1,bl=bondLv(o);
  c.tier=t;c.bl=bl;c.atk=Math.max(1,p.atk*D.atk*0.2*tierK(t)*(1+0.02*bl));
  const max=Math.max(20,Math.round(p.maxhp*D.hp*0.42*tierK(t)*(1+0.03*bl)));
  if(c.max>0&&c.down<=0)c.hp=Math.min(max,c.hp/c.max*max);c.max=max;c.def=Math.max(1,p.def*D.def*(0.7+0.1*t))}
function slotOf(c){const p=G.p,i=R.list.indexOf(c),d=34+c.r*1.25;const f=p.f||1;
  return i<=0?{x:p.x-f*d,y:p.y+12}:{x:p.x-f*(d*1.1+16),y:p.y-24}}
function snap(c,quiet){const p=G.p,W=G.W;if(!p||!W)return;const s=slotOf(c);let x=s.x,y=s.y;
  if(!c.fly&&(isSolidPt(W,x,y)||isSolidPt(W,x+c.r*0.7,y)||isSolidPt(W,x-c.r*0.7,y))){x=p.x;y=p.y}
  c.x=x;c.y=y;c.dash=null;c.jz=0;c.stuckT=0;c.tgt=null;if(!c.fly)resolve(W,c);
  if(!quiet&&G.state==='play'){G.fx.push({k:'flash',x:c.x,y:c.y-20,r:46,col:'#ffe7a8',life:0.3,max:0.3});for(let k=0;k<8;k++)addPart(c.x+rand(-14,14),c.y-rand(0,30),rand(-30,30),rand(-80,-30),0.5,'#ffe7a8',2.5,0,'c',1)}}

/* ---------------- di chuyển ---------------- */
function moveTo(c,tx,ty,spd,dt){const W=G.W,dx=tx-c.x,dy=ty-c.y,d=Math.hypot(dx,dy);if(d<3){c.moving=false;return 0}
  let ux=dx/d,uy=dy/d;
  if(!c.fly&&d>56&&!losClear(W,c.x,c.y,tx,ty)){const fd=fieldDir(W,playerField(),c.x,c.y);if(fd){ux=fd[0];uy=fd[1]}}
  const st=Math.min(d,spd*dt),ox=c.x,oy=c.y;
  if(c.fly){c.x+=ux*st;c.y+=uy*st;c.x=clamp(c.x,T,(MW-1)*T);c.y=clamp(c.y,T,(MH-1)*T)}else moveEnt(W,c,ux*st,uy*st);
  let mv=Math.hypot(c.x-ox,c.y-oy);
  if(!c.fly&&mv<st*0.3&&st>0.5){const a=Math.atan2(uy,ux)+c.side*1.15;moveEnt(W,c,Math.cos(a)*st,Math.sin(a)*st);mv=Math.hypot(c.x-ox,c.y-oy);c.stuckT+=dt;if(c.stuckT>0.8)c.side=-c.side}
  else c.stuckT=Math.max(0,c.stuckT-dt);
  c.moving=mv>0.15;c.walk+=mv*(c.D.kind==='elephant'?0.042:c.D.kind==='tiger'?0.05:c.D.kind==='turtle'?0.09:0.068);
  if(Math.abs(c.x-ox)>0.2)c.f=c.x>ox?1:-1;return mv}
function follow(c,dt){const p=G.p,s=slotOf(c),d=dist(c.x,c.y,s.x,s.y);
  if(d<10){c.moving=false;if(!c.dash)c.f=p.f||c.f;return}
  let sp=d>140?Math.max(c.D.spd,p.spd*1.25):Math.max(c.D.spd*0.85,p.spd*1.02);sp*=Math.min(1,0.35+d/70);moveTo(c,s.x,s.y,sp,dt)}

/* ---------------- chiến đấu ---------------- */
function okTarget(e){const p=G.p;return e&&!e.dead&&!e.def.b2obj&&dist(e.x,e.y,p.x,p.y)<430}
function pickTarget(c){const p=G.p;if(G.state!=='play'||p.inCamp)return null;
  if(c.tgt&&okTarget(c.tgt)&&G.t<c.tgtT)return c.tgt;
  let t=G.lastTarget;if(!okTarget(t)||dist(c.x,c.y,t.x,t.y)>380)t=null;
  if(!t)t=nearestEnemy(c.x,c.y,c.D.ai==='heal'?260:360,e=>!e.def.b2obj&&dist(e.x,e.y,p.x,p.y)<400);
  c.tgt=t;c.tgtT=G.t+0.6;return t}
function hit(c,e,mult,o){if(!e||e.dead||!G.p)return 0;o=Object.assign({proc:1,gt:c.id},o||{});const p=G.p,ls=p.ls,hs=G.hitstop,sh=G.shake;p.ls=0;let d=0;
  try{d=hurtEnemy(e,c.atk*mult,o)}finally{p.ls=ls;G.hitstop=hs;if(G.shake>sh)G.shake=Math.max(sh,Math.min(G.shake,2))}// chí mạng của gia tướng không làm khựng/rung màn
  const f=G.floats[G.floats.length-1];if(f&&!f.skill&&(f.col==='#fff4e0'))f.col='#c8f0a0';
  return d}
function swing(c,dur,at,fn){c.atkAnim=0;c.animDur=dur;c.hitAt=at;c.hitFn=fn}
function shoot(c,e,mult,kind,a,o){const sp=kind==='orb'?420:kind==='spear'?640:700;const sx=c.x+Math.cos(a)*12,sy=c.y-24;
  R.pj.push(Object.assign({x:sx,y:sy,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,life:0.75,mult,c,kind,r:kind==='spear'?16:9,pierce:0,hit:new Set(),home:kind==='orb'?e:null},o||{}))}
function attack(c,e){const D=c.D,id=c.id,a=Math.atan2(e.y-c.y,e.x-c.x);c.f=Math.cos(a)>=0?1:-1;
  const near=enemiesIn(c.x,c.y,130).filter(x=>!x.def.b2obj);
  switch(id){
    case'nghia':
      if(c.skT<=0){c.skT=8;swing(c,0.4,0.4,()=>{shoot(c,e,1.6,'spear',a,{pierce:4,life:0.6});Audio_.play('swing')});c.cd=D.cd;return}
      swing(c,0.38,0.32,()=>{const ca=Math.cos(a),sa=Math.sin(a);for(const x of G.enemies){if(x.dead||x.def.b2obj)continue;const dx=x.x-c.x,dy=x.y-c.y,along=dx*ca+dy*sa,side=Math.abs(-dx*sa+dy*ca);
          if(along>-6&&along<D.range+30+x.r&&side<20+x.r)hit(c,x,1,{kb:70,ang:a})}
        G.fx.push({k:'slash',x:c.x,y:c.y-18,a,arc:0.5,r:D.range+14,life:0.16,max:0.16,col:'#ffd0a0',thrust:1});Audio_.play('swing')});c.cd=D.cd;break;
    case'no':
      if(c.skT<=0){c.skT=7;swing(c,0.45,0.4,()=>{for(let k=-2;k<=2;k++)shoot(c,e,0.75,'bolt',a+k*0.14,{pierce:1});Audio_.play('bow')});c.cd=D.cd;return}
      swing(c,0.4,0.38,()=>{shoot(c,e,1,'bolt',Math.atan2(e.y-c.y,e.x-c.x));Audio_.play('bow')});c.cd=D.cd;break;
    case'nutuong':
      if(c.skT<=0&&near.length){c.skT=7;c.spin=0.55;for(let k=0;k<3;k++)G.timers.push({t:k*0.18,fn:()=>{if(c.down>0)return;enemiesIn(c.x,c.y,96).forEach(x=>{if(!x.def.b2obj)hit(c,x,0.75,{kb:90,ang:Math.atan2(x.y-c.y,x.x-c.x)})});
          G.fx.push({k:'spin',x:c.x,y:c.y-16,r:96,life:0.22,max:0.22,col:'#ff7a4a',a:k*2});Audio_.play('swing')}});c.atkAnim=0;c.animDur=0.55;c.cd=0.6;return}
      swing(c,0.3,0.22,()=>{hit(c,e,0.6,{kb:30,ang:a});G.fx.push({k:'slash',x:c.x,y:c.y-18,a,arc:1.6,r:D.range+20,life:0.14,max:0.14,col:'#ff9a6a',flip:0});Audio_.play('swing');
        G.timers.push({t:0.12,fn:()=>{if(c.down>0||e.dead)return;hit(c,e,0.6,{kb:30,ang:a});G.fx.push({k:'slash',x:c.x,y:c.y-18,a,arc:1.6,r:D.range+20,life:0.14,max:0.14,col:'#ffd27a',flip:1})}})});c.cd=D.cd;break;
    case'ho':
      swing(c,0.3,0.2,()=>{hit(c,e,1,{kb:40,ang:a});G.fx.push({k:'slash',x:c.x+c.f*10,y:c.y-14,a,arc:1.4,r:30,life:0.14,max:0.14,col:'#e8e8f0',flip:(c.ph=(c.ph||0)+1)%2});Audio_.play('swing')});c.cd=D.cd;break;
    case'thaylang':
      swing(c,0.45,0.4,()=>{shoot(c,e,1,'orb',Math.atan2(e.y-c.y,e.x-c.x));Audio_.play('magic')});c.cd=D.cd;break;
    case'tuong':
      if(c.skT<=0&&(near.length>=2||e.elite||e.boss)){c.skT=6;c.stomp=1;swing(c,0.75,0.58,()=>{const es=enemiesIn(c.x,c.y,132);
          es.forEach(x=>{if(!x.def.b2obj)hit(c,x,1.6,{kb:230,stun:0.6,ang:Math.atan2(x.y-c.y,x.x-c.x),noStagger:1})});
          G.fx.push({k:'ring',x:c.x,y:c.y,r:20,r2:140,life:0.45,max:0.45,col:'#c9a24e'});pushCrack(c.x,c.y,110,8);pushDust(c.x,c.y,14,110);G.shake=Math.max(G.shake,6);Audio_.play('slam');c.stomp=0});c.cd=D.cd;return}
      swing(c,0.5,0.4,()=>{for(const x of near){const xa=Math.atan2(x.y-c.y,x.x-c.x);if(dist(c.x,c.y,x.x,x.y)>D.range+x.r+c.r)continue;if(Math.abs(angDiff(a,xa))>1)continue;hit(c,x,1,{kb:140,ang:xa})}
        G.fx.push({k:'slash',x:c.x+c.f*20,y:c.y-26,a,arc:1.8,r:D.range+30,life:0.18,max:0.18,col:'#e8dcc0',wide:1});Audio_.play('swing')});c.cd=D.cd;break;
    case'kimquy':
      swing(c,0.45,0.3,()=>{hit(c,e,1.1,{kb:60,ang:a});G.fx.push({k:'slash',x:c.x+c.f*16,y:c.y-12,a,arc:1.2,r:40,life:0.15,max:0.15,col:'#ffd23a'});Audio_.play('hit')});c.cd=D.cd;break;
  }
}
function engage(c,e,dt){const D=c.D,d=dist(c.x,c.y,e.x,e.y);
  if(D.ai==='ranged'||D.ai==='heal'){const p=G.p;
    if(D.ai==='heal'){follow(c,dt)}
    else if(d>D.range)moveTo(c,e.x,e.y,D.spd,dt);
    else if(d<D.range*0.45){const a=Math.atan2(c.y-e.y,c.x-e.x);moveTo(c,c.x+Math.cos(a)*60,c.y+Math.sin(a)*60,D.spd*0.9,dt)}
    else c.moving=false;
    if(d<=D.range+20&&c.cd<=0&&c.atkAnim<0){c.f=e.x>=c.x?1:-1;attack(c,e)}
    else if(!c.moving&&c.atkAnim<0)c.f=e.x>=c.x?1:-1;return}
  if(D.ai==='pounce'&&c.skT<=0&&d>80&&d<250){c.skT=5;c.cd=0.5;const a=Math.atan2(e.y-c.y,e.x-c.x),L=d-e.r-c.r*0.6;
    c.dash={k:'pounce',e,t:0,dur:0.4,sx:c.x,sy:c.y,tx:c.x+Math.cos(a)*L,ty:c.y+Math.sin(a)*L};c.f=Math.cos(a)>=0?1:-1;Audio_.play('roar');return}
  const reach=D.range+e.r*0.8+c.r*0.5;
  if(d>reach){moveTo(c,e.x,e.y,D.spd*(c.atkAnim>=0?0.5:1),dt)}
  else{c.moving=false;c.f=e.x>=c.x?1:-1;if(c.cd<=0&&c.atkAnim<0)attack(c,e)}}
function airAI(c,dt,e){const p=G.p;
  if(c.dash){const k=Math.min(1,(c.dash.t+=dt)/c.dash.dur),q=c.dash;
    if(q.k==='dive'){const tx=q.e.dead?q.tx:q.e.x,ty=q.e.dead?q.ty:q.e.y;c.x=lerp(q.sx,tx,k);c.y=lerp(q.sy,ty,k);c.z=lerp(q.sz,6,k*k);c.f=tx>=q.sx?1:-1;
      if(k>=1){if(!q.e.dead){hit(c,q.e,1.5,{kb:50,ang:Math.atan2(q.e.y-q.sy,q.e.x-q.sx)});sparks(c.x,c.y-10,6,'#ffe7a8',200)}Audio_.play('swing');c.dash={k:'rise',t:0,dur:0.45,sz:c.z}}}
    else{c.z=lerp(q.sz,52,k);if(k>=1)c.dash=null}
    c.moving=true;return}
  let tx,ty,sp=c.D.spd;
  if(e){c.orb+=dt*2;tx=e.x+Math.cos(c.orb)*72;ty=e.y+Math.sin(c.orb)*42;c.z=lerp(c.z,48,Math.min(1,dt*3));
    if(c.cd<=0&&dist(c.x,c.y,e.x,e.y)<170){c.cd=c.D.cd;c.dash={k:'dive',e,t:0,dur:0.3,sx:c.x,sy:c.y,sz:c.z,tx:e.x,ty:e.y};return}}
  else{c.orb+=dt*1.1;tx=p.x+Math.cos(c.orb)*58;ty=p.y-6+Math.sin(c.orb)*30;c.z=lerp(c.z,58+Math.sin(G.t*2)*4,Math.min(1,dt*2));const d=dist(c.x,c.y,tx,ty);sp=d>160?Math.max(sp,p.spd*1.3):Math.max(140,p.spd)}
  moveTo(c,tx,ty,sp,dt);c.moving=true}
function heal(c){const p=G.p;if(G.state!=='play')return false;const g=gs(),t=g.own[c.id].t||1,k=0.035+0.012*t;
  const other=R.list.find(o=>o!==c&&o.down<=0&&o.hp<o.max*0.7);
  let who=null;if(p.hp<p.maxhp*0.92)who='p';else if(other)who=other;if(!who)return false;
  if(who==='p'){const v=Math.round(p.maxhp*k);p.hp=Math.min(p.maxhp,p.hp+v);addFloat(p.x,p.y-74,'+'+fmt(v),'#7dff8a',16);healFx(p.x,p.y)}
  else{const v=Math.round(who.max*k*1.6);who.hp=Math.min(who.max,who.hp+v);addFloat(who.x,who.y-50,'+'+fmt(v),'#7dff8a',14);healFx(who.x,who.y)}
  c.atkAnim=0;c.animDur=0.5;Audio_.play('magic');return true}
function healFx(x,y){G.fx.push({k:'ring',x,y,r:8,r2:46,life:0.4,max:0.4,col:'#7dff8a'});for(let i=0;i<10;i++)addPart(x+rand(-14,14),y-rand(0,36),rand(-10,10),rand(-90,-40),0.7,i%2?'#7dff8a':'#e8ffb0',2.6,0,'c',1)}
function kimAura(){for(const c of R.list)if(c.id==='kimquy'&&c.down<=0&&dist(c.x,c.y,G.p.x,G.p.y)<320)return c;return null}

function updC(c,dt){const p=G.p,D=c.D;
  if(c.down>0){c.down-=dt;if(c.down<=0)revive(c);return}
  c.flash-=dt;if(c.spin>0)c.spin-=dt;
  if(c.atkAnim>=0){c.atkAnim+=dt/c.animDur;if(c.hitAt!=null&&c.atkAnim>=c.hitAt){const f=c.hitFn;c.hitAt=null;c.hitFn=null;if(f)f()}if(c.atkAnim>=1)c.atkAnim=-1}
  c.cd-=dt;c.skT-=dt;
  if(G.t-c.hurtT>4)c.hp=Math.min(c.max,c.hp+c.max*(p.inCamp?0.2:0.025)*dt);
  const dP=dist(c.x,c.y,p.x,p.y);
  if(dP>600||(c.stuckT>2.2&&dP>140)){snap(c);return}
  if(D.ai==='heal'){c.healT-=dt;if(c.healT<=0){c.healT=heal(c)?5:0.5}}
  if(c.id==='kimquy'){c.shT-=dt;if(c.shT<=0&&G.state==='play'&&!p.inCamp&&dP<320){const g=gs(),t=g.own.kimquy.t||1;c.shT=12;p.gtSh=Math.round(p.maxhp*(0.05+0.02*t));p.gtShT=6;
    G.fx.push({k:'ring',x:p.x,y:p.y,r:70,r2:20,life:0.4,max:0.4,col:'#ffd23a'});Audio_.play('clang');addFloat(p.x,p.y-92,'Kim Giáp','#ffd98a',16)}}
  const e=pickTarget(c);
  if(D.ai==='air'){airAI(c,dt,e);return}
  if(c.dash){const q=c.dash,k=Math.min(1,(q.t+=dt)/q.dur);c.x=lerp(q.sx,q.tx,k);c.y=lerp(q.sy,q.ty,k);c.jz=Math.sin(k*Math.PI)*30;c.moving=true;c.walk+=dt*6;
    if(k>=1){c.dash=null;c.jz=0;resolve(G.W,c);if(!q.e.dead){hit(c,q.e,1.8,{kb:90,stun:0.6,ang:Math.atan2(q.ty-q.sy,q.tx-q.sx)})}pushDust(c.x,c.y,8,50);G.shake=Math.max(G.shake,3)}return}
  if(e&&dP<420)engage(c,e,dt);else follow(c,dt);
  // không chồng lên nhau
  for(const o of R.list){if(o===c||o.down>0||o.fly||c.fly)continue;const dx=c.x-o.x,dy=c.y-o.y,rr=(c.r+o.r)*0.8,d2=dx*dx+dy*dy;if(d2<rr*rr&&d2>0.01){const d=Math.sqrt(d2);c.x+=dx/d*(rr-d)*0.3;c.y+=dy/d*(rr-d)*0.3}}}

/* quái đánh trả gia tướng ở cạnh nó; gia tướng to chặn đường quái */
function pressure(dt){const W=G.W;
  for(const c of R.list){if(c.down>0)continue;const air=c.fly&&c.z>16;
    for(const e of G.enemies){if(e.dead||e.def.b2obj)continue;const dx=e.x-c.x,dy=e.y-c.y,d=Math.hypot(dx,dy);
      if(!air&&!e.boss&&d<e.r+c.r*0.85&&d>0.01){const ov=e.r+c.r*0.85-d,kE=c.r>20?0.9:0.5;moveEnt(W,e,dx/d*ov*kE,dy/d*ov*kE);if(c.r<=20){c.x-=dx/d*ov*0.3;c.y-=dy/d*ov*0.3}}
      if(air||e.stun>0)continue;const reach=e.r+c.r+(e.boss?40:14);if(d>reach)continue;
      if(e.state!=='chase'&&e.state!=='recover'&&e.state!=='wind'&&!e.boss)continue;
      if(e._gtT==null)e._gtT=rand(0.3,0.9);e._gtT-=dt;if(e._gtT>0)continue;
      e._gtT=(e.boss?1.5:(e.def.cd||1.2)*1.5)*rand(0.85,1.2);hurtC(c,e.atk*(e.boss?0.9:0.7),e.lv,e);
      if(!e.boss){e.f=c.x>=e.x?1:-1;e.atkAnim=0}
      G.fx.push({k:'slash',x:e.x,y:e.y-14,a:Math.atan2(c.y-e.y,c.x-e.x),arc:1.4,r:Math.max(30,d),life:0.13,max:0.13,col:'#ff8a6a',enemy:1})}}
  // đạn của quái trúng gia tướng chắn đòn
  for(let i=G.projs.length-1;i>=0;i--){const b=G.projs[i];if(b.from!=='e'||b.kind==='shell')continue;
    for(const c of R.list){if(c.down>0||c.D.ai!=='tank')continue;if(dist(b.x,b.y,c.x,c.y-20)<b.r+c.r){hurtC(c,b.dmg,b.lv||G.save.lvl,null);b.life=0;break}}}}
function hurtC(c,raw,elv,src){if(c.down>0)return;const lv=G.save.lvl;let d=raw*(1-c.def/(c.def+40+8*(elv||lv)))*rand(0.9,1.1);d=Math.max(1,Math.round(d));
  c.hp-=d;c.hurtT=G.t;c.flash=0.12;if(G.floats.length<70)addFloat(c.x+rand(-6,6),c.y-(c.D.kind==='elephant'?96:c.fly?c.z+20:56),'-'+fmt(d),'#ff9a7a',13);
  if(c.hp<=0)knock(c)}
function knock(c){c.hp=0;c.down=20;c.dash=null;c.atkAnim=-1;c.hitFn=null;c.hitAt=null;c.jz=0;
  for(let i=0;i<16;i++){const a=Math.random()*TAU;addPart(c.x+Math.cos(a)*10,c.y-16,Math.cos(a)*rand(40,120),Math.sin(a)*rand(20,60)-60,rand(0.5,0.9),i%2?'#bba98a':'#5a4a3a',rand(3,6),120)}
  G.fx.push({k:'ring',x:c.x,y:c.y,r:10,r2:60,life:0.4,max:0.4,col:'#bba98a'});
  if(G.state==='play')UI.toast(`${c.D.sh} trọng thương, sẽ hồi lại sau 20 giây`,'warn');hudSync(true)}
function revive(c){c.down=0;calcStats(c);c.hp=Math.round(c.max*0.6);c.cd=0.5;snap(c);
  if(G.state==='play')UI.toast(`${c.D.sh} đã hồi phục`);hudSync(true)}

/* đạn của gia tướng (không đi qua G.projs để không bị coi là đòn người chơi) */
function updPj(dt){for(let i=R.pj.length-1;i>=0;i--){const b=R.pj[i];b.life-=dt;
    if(b.home&&!b.home.dead){const a=Math.atan2(b.home.y-18-b.y,b.home.x-b.x),sp=Math.hypot(b.vx,b.vy),cur=Math.atan2(b.vy,b.vx),na=cur+clamp(angDiff(cur,a),-7*dt,7*dt);b.vx=Math.cos(na)*sp;b.vy=Math.sin(na)*sp}
    b.x+=b.vx*dt;b.y+=b.vy*dt;
    for(const e of G.enemies){if(e.dead||e.def.b2obj||b.hit.has(e))continue;if(dist(b.x,b.y,e.x,e.y-14*e.sc)<b.r+e.r){b.hit.add(e);hit(b.c,e,b.mult,{kb:b.kind==='spear'?110:40,ang:Math.atan2(b.vy,b.vx)});
        if(b.kind==='orb')G.fx.push({k:'ring',x:b.x,y:b.y,r:5,r2:34,life:0.25,max:0.25,col:'#9fe8a0'});if(b.pierce--<=0){b.life=0;break}}}
    if(b.kind==='orb'&&Math.random()<0.5)addPart(b.x,b.y,rand(-15,15),rand(-15,15),0.3,'#9fe8a0',2.2,0);
    if(b.life<=0||isSolidPt(G.W,b.x,b.y+14))R.pj.splice(i,1)}}

/* ---------------- móc vòng lặp ---------------- */
HK.on('tick',dt=>{const S=G.save,p=G.p;if(!S||!p)return;
  if(R.save!==S)reset();
  if(p.gtShT>0){p.gtShT-=dt;if(p.gtShT<=0)p.gtSh=0}
  const g=S.gt;if(!g||!g.act||!g.act.length){if(R.list.length){R.list=[];R.pj=[]}hudTick(dt);hint();return}
  if(R.list.length!==g.act.length||R.list.some((c,i)=>c.id!==g.act[i]))sync();
  if(G.W!==R.W){R.W=G.W;R.pj=[];for(const c of R.list)snap(c,true)}
  R.statT-=dt;if(R.statT<=0){R.statT=1;for(const c of R.list)calcStats(c)}
  for(const c of R.list)updC(c,dt);
  updPj(dt);pressure(dt);hudTick(dt);
});
function hint(){const S=G.save;if(S.lvl<5||(S.gt&&S.gt.hint))return;const g=gs();g.hint=1;
  setTimeout(()=>{if(G.save===S&&G.state==='play')UI.toast('Mã Trường trong thành đã mở chiêu mộ Gia Tướng: bạn đồng hành theo hầu và đánh cùng bạn.','quest')},1500)}
/* thưởng vật liệu + Thân Mật */
HK.on('kill',e=>{const S=G.save,p=G.p;if(!S||!p||(G.state!=='play'&&G.state!=='dead'))return;if(e.clone||e.def.b2obj)return;
  if(S.lvl>=3){if(e.boss){gain('an',3+randi(0,2),'boss');gain('hf',1,'boss')}
    else if(e.elite){if(Math.random()<0.5)gain('an',1,'elite');if(Math.random()<0.04)gain('hf',1,'elite')}
    else if(Math.random()<0.06)gain('ql',1,'kill')}
  const g=S.gt;if(!g||!g.act||!g.act.length)return;
  for(const c of R.list){if(c.down>0)continue;if(dist(c.x,c.y,e.x,e.y)>460)continue;const o=g.own[c.id];if(!o||bondLv(o)>=10)continue;
    let v=(e.boss?25:e.elite?4:1)*(e._gtBy===c.id?1.5:1);o.b=(o.b||0)+v;
    while(bondLv(o)<10&&o.b>=needB(bondLv(o))){o.b-=needB(bondLv(o));o.bl=bondLv(o)+1;const L=o.bl,ms=MS.indexOf(L);
      UI.toast(`${c.D.sh}: Thân Mật cấp ${L}`+(ms>=0?` · mở thưởng +${c.D.bond.v[ms]}${BON_LBL[c.D.bond.k]}`:''),ms>=0?'quest':'skill');if(ms>=0){recalc();Audio_.play('quest')}calcStats(c)}
    if(bondLv(o)>=10)o.b=0}});
HK.on('hit',(e,d,o)=>{if(o&&o.gt)e._gtBy=o.gt});
HK.on('stats',st=>{const S=G.save;if(!S||!S.gt||!S.gt.own)return;
  for(const id in S.gt.own){const D=BY[id];if(!D)continue;const v=bondBonus(D,bondLv(S.gt.own[id]));if(!v)continue;const k=D.bond.k;if(k==='def')st.def*=1+v/100;else st[k]=(st[k]||0)+v}});
HK.on('dmgIn',(d,src)=>{const p=G.p;if(!p||!R.list.length)return;const k=kimAura();if(!k)return;const t=k.tier||1;d*=1-(0.06+0.02*t);
  if(p.gtSh>0){const a=Math.min(p.gtSh,d);p.gtSh-=a;d-=a;if(p.gtSh<=0){p.gtSh=0;G.fx.push({k:'ring',x:p.x,y:p.y,r:20,r2:60,life:0.3,max:0.3,col:'#ffd23a'})}}return d});

/* ---------------- vẽ ---------------- */
function drawEagle(g,c,t,s){const z=c.z,f=c.f,dv=c.dash&&c.dash.k==='dive';const fl=dv?0.25:Math.sin(t*9+c.ph)*0.95;
  if(s==null){s=1;g.fillStyle='rgba(0,0,0,0.22)';g.beginPath();g.ellipse(c.x,c.y,Math.max(6,15-z*0.1),Math.max(2,4.5-z*0.03),0,0,TAU);g.fill()}
  g.save();g.translate(c.x,c.y-z);g.scale(f*s*1.15,s*1.15);if(dv)g.rotate(0.45);
  const wing=(col,sc,dx)=>{g.save();g.translate(dx,-2);g.scale(1,sc);g.fillStyle=col;g.strokeStyle=OL;g.lineWidth=1;
    g.beginPath();g.moveTo(-5,0);g.quadraticCurveTo(-1,-15,9,-27);g.lineTo(5,-21);g.lineTo(3,-25);g.lineTo(-1,-19);g.lineTo(-4,-22);g.lineTo(-7,-15);g.lineTo(-11,-16);g.quadraticCurveTo(-10,-6,-7,0);g.closePath();g.fill();g.stroke();
    g.strokeStyle='rgba(255,240,210,0.25)';g.lineWidth=0.8;g.beginPath();g.moveTo(-4,-3);g.quadraticCurveTo(-1,-12,6,-21);g.stroke();g.restore()};
  wing('#4a2e16',fl*0.85,2);
  g.strokeStyle=OL;g.lineWidth=1;g.fillStyle='#efe6d0';g.beginPath();g.moveTo(-9,-1);g.lineTo(-22,-5);g.lineTo(-24,0);g.lineTo(-21,3);g.lineTo(-9,3);g.closePath();g.fill();g.stroke();
  g.fillStyle='#6a4220';g.beginPath();g.ellipse(0,0,13,6.5,-0.08,0,TAU);g.fill();g.stroke();
  g.fillStyle='#8a5a2c';g.beginPath();g.ellipse(2,2,8,3,0,0,TAU);g.fill();
  g.strokeStyle='#e8a830';g.lineWidth=1.8;g.beginPath();g.moveTo(1,5);g.lineTo(dv?7:2,10);g.moveTo(-3,5);g.lineTo(dv?3:-2,10);g.stroke();
  g.strokeStyle=OL;g.lineWidth=1;g.fillStyle='#ece2c4';g.beginPath();g.arc(12,-4,5.4,0,TAU);g.fill();g.stroke();
  g.fillStyle='#f0b030';g.beginPath();g.moveTo(16,-6);g.quadraticCurveTo(22.5,-5.4,20.5,-0.8);g.lineTo(16.5,-2.6);g.closePath();g.fill();g.stroke();
  g.fillStyle='#1a1008';g.beginPath();g.arc(13.8,-5,1.05,0,TAU);g.fill();g.fillStyle='#c98a20';g.fillRect(12,-7.2,3.6,0.9);
  wing('#7a4c24',fl,-1);
  g.restore()}
function drawTurtle(g,c,t,s){const f=c.f,mv=c.moving?1:0,w=c.walk,lg=Math.sin(w)*3.5*mv;const at=c.atkAnim>=0?Math.sin(Math.min(1,c.atkAnim)*Math.PI):0;
  g.save();g.translate(c.x,c.y);g.scale(s,s);g.fillStyle='rgba(0,0,0,0.3)';g.beginPath();g.ellipse(0,0,30,7,0,0,TAU);g.fill();g.scale(f,1);
  const skin='#8f9a46',skD='#5e6a2a';g.strokeStyle=OL;g.lineWidth=1.2;
  const leg=(x,o,col)=>{g.fillStyle=col;g.beginPath();g.ellipse(x+o,-4,5.5,6.5,0,0,TAU);g.fill();g.stroke();g.fillStyle='#d8d0a8';g.beginPath();g.arc(x+o+3,-0.5,1.2,0,TAU);g.fill()};
  leg(-12,lg,skD);leg(11,-lg,skD);
  // đuôi
  g.fillStyle=skD;g.beginPath();g.moveTo(-22,-10);g.lineTo(-31,-6);g.lineTo(-22,-6);g.closePath();g.fill();g.stroke();
  // cổ + đầu
  const hx=27+at*9,hy=-17+Math.sin(t*2)*1.2-at*2;g.fillStyle=skin;g.beginPath();g.moveTo(14,-20);g.quadraticCurveTo(22,-22,hx-3,hy-3);g.lineTo(hx-2,hy+4);g.quadraticCurveTo(20,-10,14,-11);g.closePath();g.fill();g.stroke();
  g.beginPath();g.ellipse(hx,hy,7.5,5.6,0.1,0,TAU);g.fill();g.stroke();
  g.fillStyle='#fff6d8';g.beginPath();g.arc(hx+2,hy-1.6,1.8,0,TAU);g.fill();g.fillStyle='#1a1008';g.beginPath();g.arc(hx+2.6,hy-1.6,1,0,TAU);g.fill();
  g.strokeStyle='rgba(30,20,8,0.7)';g.lineWidth=0.8;g.beginPath();g.moveTo(hx+3,hy+2.4);g.lineTo(hx+7,hy+1.6);g.stroke();
  // mai rùa
  g.strokeStyle=OL;g.lineWidth=1.5;g.fillStyle='#8a5a1a';g.beginPath();g.ellipse(0,-11,25,6.5,0,0,TAU);g.fill();g.stroke();
  g.fillStyle='#d6a43a';g.beginPath();g.moveTo(-24,-11);g.bezierCurveTo(-24,-36,24,-36,24,-11);g.closePath();g.fill();g.stroke();
  g.fillStyle='rgba(255,236,160,0.35)';g.beginPath();g.ellipse(-4,-25,11,4.5,-0.2,0,TAU);g.fill();
  g.strokeStyle='rgba(110,64,10,0.85)';g.lineWidth=1.1;
  const hex=(x,y,r)=>{g.beginPath();for(let i=0;i<6;i++){const a=i/6*TAU+Math.PI/6;const px=x+Math.cos(a)*r,py=y+Math.sin(a)*r*0.62;i?g.lineTo(px,py):g.moveTo(px,py)}g.closePath();g.stroke()};
  hex(0,-22,6.2);hex(-12,-18,5.4);hex(12,-18,5.4);
  g.beginPath();for(let x=-22;x<=22;x+=5.5){g.moveTo(x,-12.5);g.lineTo(x*1.05,-15.5)}g.stroke();
  // gươm Thuận Thiên trên mai
  g.save();g.translate(-2,-29);g.rotate(-0.12);g.fillStyle='#e8eef2';g.strokeStyle=OL;g.lineWidth=0.8;g.beginPath();g.moveTo(-14,0);g.lineTo(9,-1.2);g.lineTo(11,0);g.lineTo(9,1.2);g.closePath();g.fill();g.stroke();
  g.fillStyle='#e2b24a';g.fillRect(-15.5,-2.4,2,4.8);g.fillStyle='#7a2a1e';g.fillRect(-21,-0.9,5.6,1.8);g.restore();
  if(c.tier>=3){g.save();g.globalCompositeOperation='lighter';g.globalAlpha=0.35+Math.sin(t*3)*0.15;g.fillStyle='#ffe8a0';g.beginPath();g.arc(9,-30,2.2,0,TAU);g.fill();g.restore()}
  leg(-8,-lg,skin);leg(16,lg,skin);
  g.restore()}
function lookOf(c){return LK[c.id]}
/* vẽ một gia tướng tại (c.x,c.y) lên g; s = tỉ lệ (mặc định theo loại) */
function drawC(g,c,t){const D=c.D,K=D.kind;
  if(K==='human'){const at=c.atkAnim>=0?Math.min(0.999,c.atkAnim):-1;let L=lookOf(c);
    drawHuman(g,{x:c.x,y:c.y,f:c.f,look:L,walk:c.walk,moving:c.moving,atk:at,t:t+c.seed,sc:1});
    if(c.spin>0){g.save();g.globalAlpha=0.5;g.strokeStyle='#ffb38a';g.lineWidth=2;g.beginPath();g.ellipse(c.x,c.y-16,40,18,0,0,TAU);g.stroke();g.restore()}
    return}
  if(K==='tiger'){g.save();g.translate(c.x,c.y-c.jz);let rot=0,dx=0;if(c.dash)rot=-0.28+(c.dash.t/c.dash.dur)*0.5;else if(c.atkAnim>=0){const k=Math.sin(Math.min(1,c.atkAnim)*Math.PI);rot=0.12*k;dx=7*k}
    if(c.jz>0){g.save();g.translate(0,c.jz);g.fillStyle='rgba(0,0,0,0.22)';g.beginPath();g.ellipse(0,0,26,6,0,0,TAU);g.fill();g.restore()}
    g.scale(c.f*0.82,0.82);g.translate(dx,0);g.rotate(rot);drawMount(g,MT_HO,{x:0,y:0,f:1,t:t+c.seed,walk:c.walk,moving:c.moving||!!c.dash});g.restore();return}
  if(K==='elephant'){g.save();g.translate(c.x,c.y);let rot=0,dx=0;
    if(c.atkAnim>=0){const k=c.atkAnim;if(c.stomp){rot=k<0.55?-0.2*Math.sin(k/0.55*Math.PI/2):-0.2*(1-(k-0.55)/0.45);if(k>0.55)rot=-0.2*Math.max(0,1-(k-0.55)/0.12)}else{const s=Math.sin(Math.min(1,k)*Math.PI);dx=8*s;rot=0.05*s}}
    g.scale(c.f*0.7,0.7);g.translate(dx-24,0);g.rotate(rot);g.translate(24,0);
    const seat=drawMount(g,MT_VOI,{x:0,y:0,f:1,t:t+c.seed,walk:c.walk,moving:c.moving});
    drawHuman(g,{x:seat.x,y:seat.y+17,f:1,look:LK.nai,ride:1,t:t+c.seed,atk:c.atkAnim>=0&&!c.stomp?Math.min(0.999,c.atkAnim):-1,sc:0.95});g.restore();return}
  if(K==='eagle'){drawEagle(g,c,t);return}
  if(K==='turtle'){drawTurtle(g,c,t,0.95);return}}
const TCOL=['#8fd08a','#8fd08a','#8fd08a','#62b4ff','#c58bff','#ffc53d'];
function drawWorldC(c){if(c.down>0)return;const t=G.t;const big=c.D.kind==='elephant';
  // vòng dưới chân: màu theo bậc sao, đánh dấu phe ta
  const rr=c.r*1.35;cx.save();cx.globalAlpha=0.55;cx.strokeStyle=TCOL[c.tier||1];cx.lineWidth=c.tier>=4?2.4:1.6;cx.beginPath();cx.ellipse(c.x,c.y,rr,rr*0.36,0,0,TAU);cx.stroke();
  if(c.tier>=5){cx.globalAlpha=0.3+Math.sin(t*4)*0.12;cx.beginPath();cx.ellipse(c.x,c.y,rr+5,(rr+5)*0.36,0,0,TAU);cx.stroke()}cx.restore();
  const p=G.p,big2=c.r>20,cover=big2&&p&&c.y>p.y&&c.y-p.y<70&&Math.abs(c.x-p.x)<c.r*2.2;if(cover)cx.globalAlpha=0.55;
  drawC(cx,c,t);cx.globalAlpha=1;
  if(c.flash>0){cx.save();cx.globalCompositeOperation='lighter';cx.globalAlpha=Math.min(1,c.flash*8)*0.5;drawC(cx,c,t);cx.restore()}
  // thanh máu
  if(c.hp<c.max-0.5||G.t-c.hurtT<3){const w=big?44:30,y=c.y-(big?96:c.fly?c.z+22:c.D.kind==='turtle'?44:c.D.kind==='tiger'?58:70);
    cx.fillStyle='rgba(20,10,5,0.75)';cx.fillRect(c.x-w/2-1,y-1,w+2,5);cx.fillStyle='#6ad05a';cx.fillRect(c.x-w/2,y,w*Math.max(0,c.hp/c.max),3)}}
function drawPj(b){const a=Math.atan2(b.vy,b.vx);cx.save();cx.translate(b.x,b.y);cx.rotate(a);
  if(b.kind==='orb'){additive(()=>glow(0,0,14,'#9fe8a0',0.8),'lighter');cx.fillStyle='#e8ffd8';cx.beginPath();cx.arc(0,0,3.5,0,TAU);cx.fill()}
  else if(b.kind==='spear'){cx.strokeStyle='#6a4426';cx.lineWidth=2.4;cx.beginPath();cx.moveTo(-26,0);cx.lineTo(10,0);cx.stroke();cx.fillStyle='#dfe6ea';cx.strokeStyle=OL;cx.lineWidth=0.8;cx.beginPath();cx.moveTo(10,-3);cx.lineTo(20,0);cx.lineTo(10,3);cx.closePath();cx.fill();cx.stroke()}
  else{cx.strokeStyle='rgba(255,240,200,0.35)';cx.lineWidth=3;cx.beginPath();cx.moveTo(-22,0);cx.lineTo(0,0);cx.stroke();cx.strokeStyle='#7a4826';cx.lineWidth=1.6;cx.beginPath();cx.moveTo(-12,0);cx.lineTo(6,0);cx.stroke();
    cx.fillStyle='#cfd5da';cx.beginPath();cx.moveTo(6,-2.2);cx.lineTo(11,0);cx.lineTo(6,2.2);cx.closePath();cx.fill();cx.fillStyle='#2f8a6a';cx.fillRect(-13,-2,3,4)}
  cx.restore()}
function inView(c,left,top,vw,vh){return c.x>left-120&&c.x<left+vw+120&&c.y>top-80&&c.y<top+vh+200}
function view(){const z=G.cam.z,vw=VW/z,vh=VH/z;return[G.cam.x-vw/2,G.cam.y-vh/2,vw,vh]}
HK.on('ysort',list=>{R.ys=R.frame;if(G.state!=='play'&&G.state!=='dead')return;const[left,top,vw,vh]=view();
  for(const c of R.list)if(c.down<=0&&inView(c,left,top,vw,vh))list.push({y:c.fly?c.y+30:c.y,fn:()=>drawWorldC(c)})});
HK.on('drawWorld',()=>{const fr=R.frame++;if(G.state!=='play'&&G.state!=='dead')return;const p=G.p;if(!p)return;const[left,top,vw,vh]=view();
  if(R.ys!==fr)for(const c of R.list)if(c.down<=0&&inView(c,left,top,vw,vh))drawWorldC(c);// dự phòng khi render.js chưa có móc ysort
  for(const b of R.pj)drawPj(b);
  if(p.gtSh>0&&G.state==='play'){const k=Math.min(1,p.gtShT/0.5);cx.save();cx.globalAlpha=0.5*k;cx.strokeStyle='#ffd23a';cx.lineWidth=2;cx.translate(p.x,p.y-30);
    cx.beginPath();for(let i=0;i<6;i++){const a=i/6*TAU+G.t*0.8;const px=Math.cos(a)*34,py=Math.sin(a)*40;i?cx.lineTo(px,py):cx.moveTo(px,py)}cx.closePath();cx.stroke();
    cx.globalAlpha=0.1*k;cx.fillStyle='#ffd23a';cx.fill();cx.restore()}
  const k=kimAura();if(k){cx.save();cx.globalAlpha=0.18+Math.sin(G.t*2)*0.05;cx.strokeStyle='#ffd23a';cx.lineWidth=2;cx.setLineDash([6,8]);cx.beginPath();cx.ellipse(p.x,p.y,46,16,0,0,TAU);cx.stroke();cx.setLineDash([]);cx.restore()}});

/* chân dung trên canvas nhỏ: mode 'full' (cả người) hoặc 'face' (cận mặt cho HUD) */
function portrait(cv,id,t,atk,mode){const D=BY[id];if(!cv||!D)return;const g=cv.getContext('2d'),d=Math.min(2,window.devicePixelRatio||1);
  const w=cv.clientWidth||cv.width/d,h=cv.clientHeight||cv.height/d;if(cv.width!==Math.round(w*d)){cv.width=Math.round(w*d);cv.height=Math.round(h*d)}
  g.setTransform(d,0,0,d,0,0);g.clearRect(0,0,w,h);
  const c={id,D,x:0,y:0,f:1,walk:0,moving:false,atkAnim:atk==null?-1:atk,z:0,jz:0,seed:0,ph:1,tier:(gs()&&gs().own[id]&&gs().own[id].t)||1,dash:null,r:D.r};
  const face=mode==='face';g.save();
  const K=D.kind;let s,ox,oy;
  if(K==='human'){s=face?h/30:h/74;ox=w*(face?0.42:0.5);oy=face?h*1.62:h*0.95}
  else if(K==='tiger'){s=face?h/36:h/68;ox=face?w*0.02:w*0.45;oy=face?h*1.08:h*0.86}
  else if(K==='elephant'){s=face?h/58:h/118;ox=face?w*0.12:w*0.44;oy=face?h*1.25:h*0.97}
  else if(K==='eagle'){s=face?h/30:h/52;ox=face?w*0.18:w*0.5;oy=face?h*0.75:h*0.62}
  else{s=face?h/34:h/62;ox=face?w*0.0:w*0.4;oy=face?h*0.95:h*0.8}
  g.translate(ox,oy);g.scale(s,s);
  if(K==='eagle'){c.z=0;drawEagle(g,c,t,1)}else drawC(g,c,t);
  g.restore()}

/* ---------------- HUD: chân dung nhỏ + máu cạnh khung nhân vật ---------------- */
function hudEl(){if(R.hud&&R.hud.isConnected)return R.hud;const hud=document.getElementById('hud');if(!hud)return null;css();
  const d=document.createElement('div');d.id='gtHud';d.hidden=true;hud.appendChild(d);R.hud=d;
  d.addEventListener('click',e=>{const b=e.target.closest('[data-gt]');if(!b||G.state!=='play')return;Audio_.play('ui');HUB.show('giatuong')});
  window.addEventListener('resize',()=>setTimeout(()=>layout(true),120));return d}
function hudSync(force){const d=hudEl();if(!d)return;const key=R.list.map(c=>c.id).join(',');
  if(d.dataset.k!==key){d.dataset.k=key;d.innerHTML=R.list.map(c=>`<button class="gtChip" data-gt="${c.id}" aria-label="Gia tướng ${esc(c.D.name)}"><canvas></canvas><span class="gtc"><span class="gtn">${esc(c.D.sh)}</span><span class="hp"><i></i></span></span><b class="dn" hidden></b></button>`).join('');
    d.querySelectorAll('[data-gt] canvas').forEach(cv=>portrait(cv,cv.parentNode.dataset.gt,0.6,-1,'face'));d.hidden=!R.list.length;layout(true)}
  if(force)hudUpd()}
function hudUpd(){const d=R.hud;if(!d||d.hidden)return;
  for(const c of R.list){const b=d.querySelector(`[data-gt="${c.id}"]`);if(!b)continue;const i=b.querySelector('.hp i');i.style.transform=`scaleX(${c.down>0?0:Math.max(0,c.hp/c.max)})`;
    const dn=b.querySelector('.dn');const txt=c.down>0?Math.ceil(c.down)+'s':'';if(dn.textContent!==txt){dn.textContent=txt;dn.hidden=!txt;b.classList.toggle('down',!!txt)}}}
function hudTick(dt){R.hudT-=dt;if(R.hudT>0)return;R.hudT=0.15;const d=hudEl();if(!d)return;const want=!!R.list.length;
  if(d.hidden===want||d.dataset.k!==R.list.map(c=>c.id).join(','))hudSync();hudUpd();R.layT-=0.15;if(R.layT<=0)layout()}
/* điện thoại dọc / máy tính: hàng chip dưới khung nhân vật, đẩy bảng nhiệm vụ xuống; điện thoại ngang: bên phải khung */
function layout(force){R.layT=2;const d=R.hud;if(!d)return;const qt=document.getElementById('qt'),fd=document.getElementById('feed'),pl=document.getElementById('plate');if(!pl||!qt)return;
  const on=!d.hidden&&R.list.length>0;const land=window.innerHeight<=500;
  const key=[on,land,window.innerWidth,window.innerHeight,R.list.length].join('|');if(!force&&key===R.layK)return;R.layK=key;
  qt.style.marginTop='';if(fd)fd.style.marginTop='';if(!on)return;
  const pr=pl.getBoundingClientRect();
  if(land){d.style.left=Math.round(pr.right+8)+'px';d.style.top=Math.round(pr.top+4)+'px';d.classList.add('row');return}
  d.classList.remove('row');d.style.left=Math.round(pr.left)+'px';d.style.top=Math.round(pr.bottom+5)+'px';
  const qr=qt.getBoundingClientRect(),need=Math.round(pr.bottom+5+34+5-qr.top);if(need>0){qt.style.marginTop=need+'px';if(fd)fd.style.marginTop=need+'px'}}

/* ---------------- bảng "Gia Tướng" trong Võ Đạo ---------------- */
let selId=null,bigRaf=null;
const stars=t=>'★'.repeat(t)+'<span class="off">'+'★'.repeat(5-t)+'</span>';
function costHtml(c){const g=gs(),S=G.save;const part=(k,v,lbl,ico)=>v?`<span class="gtCost${(k==='gold'?S.gold:g[k])>=v?'':' no'}">${ico}${k==='gold'?fmt(v):v}<small>${lbl}</small></span>`:'';
  return part('gold',c.gold,'',ICO.gold)+part('ql',c.ql,NAME.ql,ICO.ql)+part('an',c.an,NAME.an,ICO.an)+part('hf',c.hf,NAME.hf,ICO.hf)}
function statPreview(D,t,bl){const p=G.p;return{hp:Math.round(p.maxhp*D.hp*0.42*tierK(t)*(1+0.03*bl)),atk:Math.round(p.atk*D.atk*0.2*tierK(t)*(1+0.02*bl))}}
function tabHtml(){const g=gs(),S=G.save;if(!g)return'';const mx=maxAct();if(!selId||!BY[selId])selId=g.act[0]||Object.keys(g.own)[0]||'nghia';
  let h=`<div class="gtTop"><span class="gtRes">${ICO.gold}<b>${fmt(S.gold)}</b></span><span class="gtRes" title="${NAME.ql}: rơi từ quái thường">${ICO.ql}<b>${g.ql}</b><small>${NAME.ql}</small></span><span class="gtRes" title="${NAME.an}: rơi từ tinh anh và boss">${ICO.an}<b>${g.an}</b><small>${NAME.an}</small></span><span class="gtRes" title="${NAME.hf}: rơi từ boss">${ICO.hf}<b>${g.hf}</b><small>${NAME.hf}</small></span></div>
   <p class="hist gtNote">Xuất trận <b>${g.act.length}/${mx}</b>${mx<2?' · ô thứ hai mở ở Cảnh Giới <b>'+esc((typeof REALMS!=='undefined'&&REALMS[4]?REALMS[4].n:'Viên Mãn'))+'</b>':''}. Quân Lương rơi từ quái thường, Ấn Tín từ tinh anh và boss, Hổ Phù từ boss. ${inTown()?'':'<b class="warnT">Chiêu mộ và nâng sao phải ở Mã Trường trong thành.</b>'}</p>
   <div class="gtGrid" role="list">`;
  for(const D of ROSTER){const o=g.own[D.id],on=g.act.includes(D.id),lock=!o&&S.lvl<D.lv;
    h+=`<button class="gtCard${lock?' lock':''}${o?' own':''}" role="listitem" data-sel="${D.id}" aria-pressed="${selId===D.id}" aria-label="${esc(D.name)}"><canvas></canvas>
      <span class="nm">${esc(D.sh)}</span><span class="st">${o?stars(o.t):lock?'Cấp '+D.lv:'Chưa có'}</span>${on?'<span class="tg">Theo</span>':''}</button>`}
  h+=`</div>`;
  const D=BY[selId],o=g.own[selId],on=g.act.includes(selId),t=o?o.t:1,bl=o?bondLv(o):0,st=statPreview(D,t,bl);
  h+=`<div class="gtDet"><div class="gtBig"><canvas id="gtBigCv"></canvas></div><div class="gtInfo">
    <h5>${esc(D.name)} <span>· ${esc(D.role)}</span></h5><div class="gtStars">${stars(t)}${o?'':' <em>(chưa chiêu mộ)</em>'}</div>
    <p class="gtD">${esc(D.d)}</p>
    <div class="gtStat"><span>Sinh lực <b>${fmtFull(st.hp)}</b></span><span>Công <b>${fmtFull(st.atk)}</b></span><span>Chiêu <b>${esc(D.sk)}</b></span></div>
    <p class="gtSk">${esc(D.skd)}</p>`;
  // Thân Mật
  const nb=bl<10?needB(bl):1,cur=bl<10?Math.floor(o?o.b||0:0):1;
  h+=`<div class="gtBond"><div class="bh"><span>Thân Mật <b>${bl}/10</b></span><span>${bl<10?cur+'/'+nb:'Tối đa'}</span></div><div class="bar"><i style="transform:scaleX(${bl<10?Math.min(1,cur/nb):1})"></i></div>
    <div class="ms">${MS.map((m,i)=>`<span class="${bl>=m?'ok':''}">${bl>=m?'✓':'Cấp '+m}: +${D.bond.v[i]}${BON_LBL[D.bond.k]}</span>`).join('')}</div><p class="hist">Tăng khi gia tướng đang theo bạn hạ quái. Thưởng mốc là vĩnh viễn, tính cả khi gia tướng nghỉ.</p></div>`;
  // hành động
  let act='';
  if(!o){const ok=S.lvl>=D.lv&&have(D.cost)&&inTown();
    act=`<div class="gtCostRow">${costHtml(D.cost)||'<span class="gtCost">Miễn phí</span>'}</div><div class="row"><button class="btn" id="gtRec" ${ok?'':'disabled'}>Chiêu mộ</button></div>${S.lvl<D.lv?`<p class="hist warnT">Cần cấp ${D.lv}.</p>`:''}`}
  else{const uc=upCost(D,t);
    act=`<div class="row"><button class="btn ${on?'sec':''}" id="gtAct">${on?'Cho nghỉ':'Xuất trận'}</button>${uc?`<button class="btn gold" id="gtUp" ${have(uc)&&inTown()?'':'disabled'}>Nâng lên ${t+1} sao</button>`:'<span class="gtMax">Đã đạt 5 sao</span>'}</div>
      ${uc?`<div class="gtCostRow"><em>Nâng sao:</em>${costHtml(uc)}</div><p class="hist">Mỗi sao tăng khoảng 30% công và sinh lực.</p>`:''}`}
  h+=`<div class="gtAct">${act}</div></div></div>
   <div class="sec gtEx"><h4>ĐỔI VẬT LIỆU</h4><div class="row"><button class="btn sec" id="gtEx" ${g.ql>=12&&inTown()?'':'disabled'}>12 ${NAME.ql} → 1 ${NAME.an}</button></div></div>`;
  return h}
function tabBind(body){const g=gs();if(!g)return;
  body.querySelectorAll('.gtCard canvas').forEach(cv=>portrait(cv,cv.parentNode.dataset.sel,0.4,-1,'full'));
  body.querySelectorAll('[data-sel]').forEach(b=>b.onclick=()=>{selId=b.dataset.sel;Audio_.play('ui');HUB.refresh()});
  const on=(id,fn)=>{const b=body.querySelector(id);if(b)b.onclick=fn};
  on('#gtRec',()=>{const e=recruit(selId);if(e){UI.toast(e,'warn');return}HUB.refresh()});
  on('#gtUp',()=>{const e=upgrade(selId);if(e){UI.toast(e,'warn');return}HUB.refresh()});
  on('#gtAct',()=>{const g=gs();if(g.act.includes(selId))rest(selId);else deploy(selId);HUB.refresh()});
  on('#gtEx',()=>{const g=gs();if(g.ql<12||!inTown())return;g.ql-=12;g.an+=1;Audio_.play('coin');HUB.refresh()});
  // xem trước động: vòng đánh lặp lại
  const cv=body.querySelector('#gtBigCv');if(bigRaf)cancelAnimationFrame(bigRaf);const id=selId;let t0=performance.now();
  const loop=now=>{if(!cv.isConnected||UI.panel!=='vodao'){bigRaf=null;return}const t=(now-t0)/1000;const ph=(t*0.7)%1.6;portrait(cv,id,t,ph<1?ph:-1,'full');bigRaf=requestAnimationFrame(loop)};bigRaf=requestAnimationFrame(loop)}
function dotOn(){const S=G.save,g=S&&S.gt;if(!S||S.lvl<5)return false;if(!g||!g.own||!Object.keys(g.own).length)return S.gold>=BY.nghia.cost.gold;
  if(!g.act.length)return true;for(const id in g.own){const u=upCost(BY[id],g.own[id].t);if(u&&have(u))return true}return false}
HUB.add({id:'giatuong',name:'Gia Tướng',order:60,html:tabHtml,bind:tabBind,dot:dotOn});

/* ---------------- hành động ---------------- */
function recruit(id,free){const D=BY[id],g=gs(),S=G.save;if(!D||!g)return'Không rõ gia tướng';if(g.own[id])return'Đã có '+D.name;
  if(!free){if(S.lvl<D.lv)return`Cần cấp ${D.lv}`;if(!inTown())return'Đến Mã Trường trong thành để chiêu mộ';if(!have(D.cost))return'Chưa đủ vật liệu';pay(D.cost)}
  g.own[id]={t:1,b:0,bl:0};Audio_.play('win');UI.toast(`Chiêu mộ ${D.name}!`,'quest');
  if(g.act.length<maxAct())g.act.push(id);sync();recalc();saveGame();return null}
function upgrade(id,free){const D=BY[id],g=gs();const o=g&&g.own[id];if(!o)return'Chưa chiêu mộ';const c=upCost(D,o.t);if(!c)return'Đã đạt 5 sao';
  if(!free){if(!inTown())return'Đến Mã Trường trong thành để nâng sao';if(!have(c))return'Chưa đủ vật liệu';pay(c)}
  o.t++;Audio_.play('level');UI.toast(`${D.sh} lên ${o.t} sao`,'quest');const c2=R.list.find(x=>x.id===id);if(c2){calcStats(c2);c2.hp=c2.max;G.fx.push({k:'pillar',x:c2.x,y:c2.y,w:22,h:160,col:'#ffd23a',life:0.7,max:0.7})}saveGame();return null}
function deploy(id){const g=gs();if(!g.own[id])return'Chưa chiêu mộ';if(g.act.includes(id))return null;const mx=maxAct();
  if(g.act.length>=mx){const out=g.act.shift();UI.toast(`${BY[out].sh} về nghỉ, ${BY[id].sh} xuất trận`)}else UI.toast(`${BY[id].sh} xuất trận`);
  g.act.push(id);sync();saveGame();return null}
function rest(id){const g=gs();g.act=g.act.filter(x=>x!==id);sync();UI.toast(`${BY[id].sh} về nghỉ`);saveGame();return null}

/* ---------------- NPC ở Mã Trường + lối vào từ bảng Thú cưỡi ---------------- */
const _tn=townNpcs;townNpcs=function(W){const l=_tn.apply(this,arguments);if(Array.isArray(l))l.push({id:'gt',name:'Đội Trưởng Gia Tướng',x:6.3*T,y:52.0*T,look:'gtcap',act:'giatuong'});return l};
const _open=UI.open;UI.open=function(k){if(k==='giatuong'){HUB.show('giatuong');return}return _open.apply(this,arguments)};
const _np=UI.npcPrompt;UI.npcPrompt=function(n){const r=_np.apply(this,arguments);if(n&&n.act==='giatuong'){const b=document.getElementById('npcBtn');if(b)b.textContent=`${n.name}: Gia Tướng${FINE?' (E)':''}`}return r};
const _pm=UI.p_mount;UI.p_mount=function(){const h=_pm.apply(this,arguments);const S=G.save;
  return`<div class="gtLink"><div><b>Gia Tướng</b><span>${S.lvl>=5?'Chiêu mộ nghĩa binh, hổ xám, chiến tượng theo hầu và đánh cùng bạn.':'Mở ở cấp 5: bạn đồng hành theo hầu và đánh cùng bạn.'}</span></div><button class="btn sm" id="gtGo">Mở</button></div>`+h};
const _bm=UI.b_mount;UI.b_mount=function(body){const r=_bm.apply(this,arguments);const b=body.querySelector('#gtGo');if(b)b.onclick=()=>{Audio_.play('ui');HUB.show('giatuong')};return r};

/* ---------------- CSS ---------------- */
function css(){if(document.getElementById('gtCss'))return;const s=document.createElement('style');s.id='gtCss';s.textContent=`
#gtHud{position:absolute;display:flex;flex-direction:row;gap:6px;z-index:2}
.gtChip{position:relative;display:flex;align-items:center;gap:5px;height:34px;padding:2px 8px 2px 2px;border-radius:17px;background:rgba(20,12,8,.82);border:1px solid var(--line);color:var(--ink)}
.gtChip canvas{width:28px;height:28px;border-radius:50%;background:radial-gradient(circle at 50% 40%,#5a3a26,#1d1410);border:1.5px solid #8fd08a;flex:none}
.gtChip .gtc{display:flex;flex-direction:column;gap:3px;min-width:44px}
.gtChip .gtn{font:700 10px/1 var(--f-ui);color:var(--diep2);white-space:nowrap}
.gtChip .hp{display:block;width:46px;height:5px;border-radius:3px;background:rgba(0,0,0,.6);overflow:hidden}
.gtChip .hp i{display:block;height:100%;background:linear-gradient(#8fe07a,#3a9a3a);transform-origin:left}
.gtChip .dn{position:absolute;left:2px;top:2px;width:28px;height:28px;border-radius:50%;display:grid;place-items:center;background:rgba(10,6,4,.65);font:800 10px var(--f-ui);color:#ffcbb8}
.gtChip.down canvas{filter:grayscale(1);border-color:#ff8a6a}
@media (max-width:420px){.gtChip .gtn{display:none}.gtChip .gtc{min-width:0}.gtChip .hp{width:34px}.gtChip{padding-right:6px}}
.gtLink{display:flex;align-items:center;gap:10px;padding:10px 12px;margin-bottom:10px;border-radius:12px;background:rgba(226,178,74,.1);border:1px solid rgba(226,178,74,.35)}
.gtLink>div{flex:1;min-width:0;display:flex;flex-direction:column;gap:2px}.gtLink b{font:700 14px var(--f-ui);color:var(--vang2)}.gtLink span{font:500 12px/1.4 var(--f-ui);color:var(--dim)}
.gtLink .btn{min-height:44px;min-width:64px}
.gtTop{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:8px}
.gtRes{display:inline-flex;align-items:center;gap:5px;padding:5px 10px;border-radius:999px;background:rgba(0,0,0,.3);border:1px solid var(--line);font:700 12.5px/1 var(--f-ui);font-variant-numeric:tabular-nums}
.gtRes small{font-weight:600;color:var(--dim);font-size:11px}
.gtNote{margin:0 0 10px;font-size:12.5px}.warnT{color:#ffb89a}
.gtGrid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px;margin-bottom:12px}
@media (min-width:640px){.gtGrid{grid-template-columns:repeat(8,minmax(0,1fr))}}
.gtCard{position:relative;display:flex;flex-direction:column;align-items:center;gap:3px;padding:6px 3px 7px;min-height:44px;border-radius:12px;background:rgba(0,0,0,.25);border:1px solid rgba(226,178,74,.18);color:var(--ink)}
.gtCard[aria-pressed="true"]{border-color:var(--vang2);background:rgba(226,178,74,.14);box-shadow:0 0 0 1px rgba(255,217,138,.3) inset}
.gtCard canvas{width:100%;max-width:76px;aspect-ratio:1/1;border-radius:50%;background:radial-gradient(circle at 50% 62%,#4a3222,#1d1410 72%);display:block}
.gtCard.own canvas{box-shadow:0 0 0 1.5px rgba(143,208,138,.6)}
.gtCard.lock canvas{filter:grayscale(1) brightness(.45)}
.gtCard .nm{font:700 11.5px/1.15 var(--f-ui);text-align:center;max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.gtCard .st{font:700 10.5px/1 var(--f-ui);color:var(--vang2);letter-spacing:.5px;white-space:nowrap}
.gtCard .st .off,.gtStars .off{color:rgba(255,255,255,.18)}
.gtCard.lock .st{color:var(--dim);letter-spacing:0}
.gtCard .tg{position:absolute;top:3px;right:3px;padding:2px 5px;border-radius:6px;background:#3a7a3a;border:1px solid #8fd08a;font:800 9px/1.1 var(--f-ui);color:#eaffdf}
.gtDet{display:grid;grid-template-columns:170px minmax(0,1fr);gap:14px;padding:12px;border-radius:14px;background:rgba(0,0,0,.22);border:1px solid rgba(226,178,74,.2);margin-bottom:14px}
@media (max-width:560px){.gtDet{grid-template-columns:minmax(0,1fr)}.gtBig{max-width:220px;margin:0 auto;width:100%}}
.gtBig canvas{width:100%;aspect-ratio:4/3;display:block;border-radius:12px;background:radial-gradient(ellipse at 50% 88%,rgba(226,178,74,.22),transparent 65%),linear-gradient(#2a1d16,#1d1410)}
.gtInfo{min-width:0}
.gtInfo h5{margin:0 0 2px;font:700 16px/1.25 var(--f-ui)}.gtInfo h5 span{color:var(--dim);font-weight:600;font-size:12.5px}
.gtStars{font:700 15px/1 var(--f-ui);color:var(--vang2);letter-spacing:1px;margin-bottom:6px}.gtStars em{font:500 12px var(--f-ui);color:var(--dim);letter-spacing:0}
.gtD{margin:0 0 8px;font:500 13px/1.5 var(--f-ui);color:var(--diep2)}
.gtStat{display:flex;flex-wrap:wrap;gap:6px 14px;font:600 12.5px var(--f-ui);color:var(--dim)}.gtStat b{color:var(--ink)}
.gtSk{margin:4px 0 10px;font:500 12px/1.45 var(--f-ui);color:#cfe8b0}
.gtBond{padding:8px 10px;border-radius:10px;background:rgba(0,0,0,.25);margin-bottom:10px}
.gtBond .bh{display:flex;justify-content:space-between;font:600 12px var(--f-ui);color:var(--dim);margin-bottom:4px}.gtBond .bh b{color:#ffb8d0}
.gtBond .bar{height:8px}.gtBond .bar>i{background:linear-gradient(90deg,#d0607a,#ffb8d0)}
.gtBond .ms{display:flex;flex-wrap:wrap;gap:4px 10px;margin:6px 0 2px;font:600 11.5px var(--f-ui);color:var(--dim)}.gtBond .ms .ok{color:#ffb8d0}
.gtBond .hist{margin:4px 0 0;font-size:11.5px}
.gtCostRow{display:flex;flex-wrap:wrap;gap:6px;align-items:center;margin:6px 0}.gtCostRow em{font:600 12px var(--f-ui);color:var(--dim);font-style:normal}
.gtCost{display:inline-flex;align-items:center;gap:4px;padding:4px 9px;border-radius:999px;background:rgba(0,0,0,.3);border:1px solid var(--line);font:700 12px/1 var(--f-ui)}
.gtCost small{font-weight:600;color:var(--dim);font-size:10.5px}.gtCost.no{border-color:#ff8a6a;color:#ffb89a}
.gtAct .row{display:flex;flex-wrap:wrap;gap:8px;align-items:center}.gtAct .btn{min-height:44px;height:auto;padding-top:10px;padding-bottom:10px}
.gtMax{font:700 13px var(--f-ui);color:var(--vang2);align-self:center}
.gtEx .row{display:flex;flex-wrap:wrap;gap:8px}
`;document.head.appendChild(s)}

/* ---------------- API cho kiểm thử / mô-đun khác ---------------- */
window.GT={ROSTER,BY,R,gs,maxAct,recruit,upgrade,deploy,rest,sync,calcStats,upCost,needB,bondBonus,
  list:()=>R.list,give(k,n){const g=gs();g[k]=(g[k]||0)+n;return g[k]},knock(id){const c=R.list.find(c=>c.id===id);if(c)knock(c);return!!c},
  portrait,drawC,refresh:()=>HUB.refresh(),layout:()=>layout(true)};
})();
