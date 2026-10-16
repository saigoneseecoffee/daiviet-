/* ============ TRẠNG THÁI GAME ============ */
const G={save:null,W:null,p:null,enemies:[],projs:[],fx:[],parts:[],floats:[],drops:[],tele:[],zones:[],timers:[],amb:[],
  t:0,cam:{x:0,y:0,z:1},shake:0,hitstop:0,state:'title',slow:1,boss:null,eid:1,spawnT:0,saveT:0,input:{mx:0,my:0,atk:false},
  lootFull:0,lastTarget:null,questArrow:null,eliteTimer:0,campR:520,dirty:{}};
const need=L=>Math.floor(40+30*Math.pow(L,1.7));
const curMap=()=>MAPS[G.save.map];
const lvOffset=()=>G.save.ng*30;

/* ---------- chỉ số người chơi ---------- */
function itemMult(it){return 1+0.1*it.enh+(it.enh>10?0.06*(it.enh-10):0)}
function itemStats(it){const m=itemMult(it),o={};for(const k in it.st)o[k]=(k==='crit'||k==='spd')?it.st[k]:Math.round(it.st[k]*m);return o}
function itemPower(it){if(!it)return 0;const s=itemStats(it);let p=(s.atk||0)*4+(s.def||0)*3+(s.hp||0)*0.5+(s.mp||0)*0.2+(s.crit||0)*15+(s.spd||0)*4;
  for(const[k,v]of it.aff){p+=({atkp:12,hpp:9,def:3,crit:15,cdmg:2.5,aspd:7,spd:4,ls:30,mp:0.2,exp:3,gold:1.5})[k]*v*(k==='atkp'||k==='hpp'?(1+it.ilvl/12):1)}
  return Math.round(p)}
function recalc(){
  const S=G.save,C=CLASS_BY_ID[S.cls],b=C.base,L=S.lvl;
  const st={hp:b.hp[0]+b.hp[1]*(L-1),mp:b.mp[0]+b.mp[1]*(L-1),atk:b.atk[0]+b.atk[1]*(L-1),def:b.def[0]+b.def[1]*(L-1),crit:b.crit,cdmg:b.cdmg,spd:0,aspd:0,ls:0,exp:0,gold:0,atkp:0,hpp:0};
  for(const sl of SLOTS){const it=S.equip[sl];if(!it)continue;const s=itemStats(it);for(const k in s)st[k]=(st[k]||0)+s[k];for(const[k,v]of it.aff)st[k]=(st[k]||0)+v}
  if(G.p)applyExtra(st);
  const p=G.p||{};
  p.maxhp=Math.round(st.hp*(1+st.hpp/100));p.maxmp=Math.round(st.mp);p.atk=Math.round(st.atk*(1+st.atkp/100));p.def=Math.round(st.def);
  p.crit=Math.min(75,st.crit);p.cdmg=st.cdmg;p.spdP=st.spd;p.spd=b.spd*(1+st.spd/100);p.aspd=st.aspd;p.interval=C.atk.interval/(1+st.aspd/100);
  p.ls=st.ls;p.expB=st.exp;p.goldB=st.gold;
  p.power=Math.round(p.atk*4+p.def*3+p.maxhp*0.5+p.maxmp*0.2+p.crit*15+(p.cdmg-150)*2+p.aspd*6+p.spdP*4+p.ls*30);
  if(p.hp==null){p.hp=p.maxhp;p.mp=p.maxmp}p.hp=Math.min(p.hp,p.maxhp);p.mp=Math.min(p.mp,p.maxmp);
  G.dirty.stats=1;return p;
}
function makePlayer(x,y){
  const C=CLASS_BY_ID[G.save.cls];
  G.p={x,y,r:14,f:1,walk:0,moving:false,aim:-Math.PI/4,atkCd:0,atkAnim:-1,skCd:[0,0,0],ifr:0,buff:{},dash:null,deadT:0,hurtT:0,regenT:0,look:Object.assign({},LOOKS[C.id]),cls:C,hp:null,mp:null};
  ensureMountSave();recalc();G.p.hp=G.p.maxhp;G.p.mp=G.p.maxmp;updateLook();
}

/* ---------- vật phẩm ---------- */
function rollRarity(bonus){const r=Math.random(),b=bonus||0;
  if(r<0.004+b*0.012)return 4;if(r<0.035+b*0.05)return 3;if(r<0.13+b*0.12)return 2;if(r<0.42+b*0.15)return 1;return 0}
function genItem(ilvl,rar,slot){
  const S=G.save;slot=slot||pick(SLOTS);ilvl=Math.max(1,ilvl);const R=RARITY[rar],m=R.mult;const L=ilvl;
  const st={};
  if(slot==='vk')st.atk=(6+3.3*L)*m;
  if(slot==='mu'){st.def=(2+1.0*L)*m;st.hp=(8+5*L)*m}
  if(slot==='ao'){st.def=(4+1.8*L)*m;st.hp=(16+8*L)*m}
  if(slot==='dai'){st.hp=(14+8*L)*m;st.atk=(1+0.6*L)*m}
  if(slot==='giay'){st.def=(1+0.7*L)*m;st.spd=Math.round((4+L*0.08)*m)}
  if(slot==='boi'){st.mp=(10+3*L)*m;st.crit=Math.round((2+L*0.08)*m*10)/10}
  for(const k in st)if(k!=='crit'&&k!=='spd')st[k]=Math.round(st[k]);
  const pool=slot==='vk'?['atkp','crit','cdmg','aspd','ls','exp']:slot==='boi'?['crit','cdmg','atkp','mp','exp','gold','ls']:slot==='giay'?['spd','def','hpp','gold','aspd']:['hpp','def','atkp','gold','exp','spd'];
  const aff=[];const used={};
  for(let i=0;i<R.aff;i++){const avail=pool.filter(k=>!used[k]);if(!avail.length)break;const k=pick(avail);used[k]=1;
    let v=AFFIX[k].roll(L)*rand(0.75,1.15)*(1+rar*0.05);if(AFFIX_CAP[k])v=Math.min(v,AFFIX_CAP[k]);
    v=AFFIX[k].u==='%'?Math.round(v*10)/10:Math.round(v);aff.push([k,v])}
  const tier=clamp(Math.floor((L-1)/6),0,5);const tn=slot==='vk'?TIER_NAMES[S.cls][tier]:TIER_NAMES[slot][tier];
  return{id:S.iid++,slot,ilvl:L,rar,st,aff,enh:0,name:tn,cls:slot==='vk'?S.cls:undefined};
}
function itemName(it){return it.name+(it.enh?' +'+it.enh:'')}
function salvageValue(it){return{ore:1+it.rar*2+Math.floor(it.ilvl/10)+Math.floor(it.enh/2),gold:Math.round(it.ilvl*3*(it.rar+1))}}
function forgeCost(it){const e=it.enh;return{ore:Math.ceil((e+1)*1.4*(1+it.ilvl/14)),gold:Math.round((e+1)*(e+1)*18*(1+it.ilvl/8))}}

/* ---------- quái ---------- */
function enemyLevelAt(x,y){const M=curMap(),W=G.W;const d=clamp(dist(x,y,W.camp.x,W.camp.y)/W.campToArena,0,1);return Math.round(M.lv[0]+(M.lv[1]-M.lv[0])*d)+lvOffset()}
function spawnEnemy(type,x,y,lv,elite){
  const D=ET[type];const boss=D.ai==='boss';
  const hpB=(26+12*lv)*Math.pow(1.06,lv),atkB=(7+3.9*lv)*Math.pow(1.05,lv);
  const e={id:G.eid++,type,def:D,x,y,hx:x,hy:y,r:D.r*(elite?1.2:1),sc:elite?1.25:1,lv,elite:!!elite,boss,
    max:Math.round(hpB*D.hp*(elite?3.5:1)*(boss?1+G.save.ng*0.25:1)),atk:atkB*D.atk*(elite?1.4:1),edef:lv*1.2*(boss?1.5:1),
    spd:D.spd*rand(0.92,1.08),state:'idle',st:rand(0.5,2),f:Math.random()<0.5?1:-1,walk:Math.random()*6,moving:false,cd:rand(0.3,1.2),
    wx:x,wy:y,flash:0,kbx:0,kby:0,stun:0,slow:0,atkAnim:-1,tele:null,lock:0,dashT:0,hitP:false,enraged:false,patT:2,patI:0,summons:0,dead:false,hpShown:0};
  e.hp=e.max;e.name=(elite?'Tinh Anh ':'')+D.name;G.enemies.push(e);return e;
}
function pickType(){
  const M=curMap(),S=G.save,step=M.quest[S.qs[S.map]];
  const list=M.enemies.map(([k,w])=>[k,w*(step&&step.e===k?3:1)]);
  let tot=0;list.forEach(a=>tot+=a[1]);let r=Math.random()*tot;for(const[k,w]of list){r-=w;if(r<=0)return k}return list[0][0];
}
function trySpawnPack(minD,maxD,force){
  const W=G.W,p=G.p;
  for(let tries=0;tries<40;tries++){
    const i=pick(W.spawnTiles),x=(i%MW+0.5)*T,y=(((i/MW)|0)+0.5)*T,d=dist(x,y,p.x,p.y);
    if(d<minD||d>maxD)continue;
    const type=pickType(),D=ET[type];const lv=enemyLevelAt(x,y);
    const S=G.save,step=curMap().quest[S.qs[S.map]];
    let eliteC=0.05;if(step&&step.t==='elite')eliteC=0.2;if(S.lvl<3&&S.map===0&&!S.ng)eliteC=0;
    const n=D.body==='cav'?randi(2,3):randi(3,6);
    for(let k=0;k<n;k++){const a=Math.random()*TAU,rr=k?rand(30,70):0;let ex=x+Math.cos(a)*rr,ey=y+Math.sin(a)*rr;if(isSolidPt(W,ex,ey)){ex=x;ey=y}
      spawnEnemy(k===0&&Math.random()<0.3?type:pickType(),ex,ey,lv,k===0&&Math.random()<eliteC)}
    return true;
  }
  return false;
}
function spawnElite(){const W=G.W,p=G.p;for(let t=0;t<40;t++){const i=pick(W.spawnTiles),x=(i%MW+0.5)*T,y=(((i/MW)|0)+0.5)*T,d=dist(x,y,p.x,p.y);
  if(d<420||d>800)continue;return spawnEnemy(pickType(),x,y,enemyLevelAt(x,y),true)}}

/* ---------- sát thương ---------- */
function hurtEnemy(e,raw,o){
  if(e.dead)return 0;o=o||{};const p=G.p;
  const plv=G.save.lvl;let dmg=raw*(1-e.edef/(e.edef+40+8*plv))*rand(0.92,1.08);
  let crit=Math.random()*100<p.crit+(o.critB||0);if(crit)dmg*=p.cdmg/100;dmg=Math.max(1,Math.round(dmg));
  e.hp-=dmg;e.flash=0.1;
  if(o.kb&&!e.boss){const a=o.ang!=null?o.ang:Math.atan2(e.y-p.y,e.x-p.x);const k=o.kb*(e.elite?0.5:1);e.kbx+=Math.cos(a)*k;e.kby+=Math.sin(a)*k}
  if(o.stun&&!e.boss)e.stun=Math.max(e.stun,o.stun*(e.elite?0.6:1));
  if(!e.boss&&!o.noStagger&&e.state!=='dash'){e.hitstun=0.12}
  if(e.state==='idle'){e.state='chase'}
  const col=crit?'#ffd23a':'#fff4e0';
  addFloat(e.x+rand(-8,8),e.y-30*e.sc-10,crit?fmt(dmg)+'!':fmt(dmg),col,crit?22:16);
  sparks(e.x,e.y-14*e.sc,crit?10:5,crit?'#ffd23a':'#fff0c8',crit?260:180);if(G.fx.length<140)G.fx.push({k:'glint',x:e.x+rand(-6,6),y:e.y-16*e.sc+rand(-6,6),s:crit?34:18,a:rand(-0.4,0.4),col:crit?'#ffd23a':p.cls.color,life:crit?0.22:0.14,max:crit?0.22:0.14});
  if(crit){G.hitstop=Math.max(G.hitstop,0.045);G.shake=Math.max(G.shake,4);Audio_.play('crit')}else Audio_.play('hit');
  if(p.ls>0)p.hp=Math.min(p.maxhp,p.hp+dmg*p.ls/100);
  if(e.hp<=0)killEnemy(e);
  return dmg;
}
function hurtPlayer(raw,elv,src){
  const p=G.p;if(p.ifr>0||G.state!=='play'||p.hp<=0)return;
  let dmg=raw*(1-p.def/(p.def+40+8*elv))*rand(0.9,1.1);
  if(p.buff.guard>0){dmg*=0.5;if(src&&!src.dead&&!src.boss)hurtEnemy(src,dmg*0.8,{noStagger:1})}
  dmg=Math.max(1,Math.round(dmg));p.hp-=dmg;p.hurtT=0.25;
  addFloat(p.x,p.y-68,'-'+fmt(dmg),'#ff5a4a',17);G.shake=Math.max(G.shake,5);Audio_.play('hurt');
  if(p.hp<=0){p.hp=0;die()}
}
function addFloat(x,y,txt,col,size){if(G.floats.length>80)G.floats.shift();G.floats.push({x,y,txt,col,size,life:0.9,vy:-60})}
function sparks(x,y,n,col,sp){for(let i=0;i<n;i++){const a=Math.random()*TAU,v=rand(sp*0.3,sp);addPart(x,y,Math.cos(a)*v,Math.sin(a)*v-60,rand(0.25,0.5),col,rand(1.5,3),400,'s',1)}}
function addPart(x,y,vx,vy,life,col,size,g,shape,add){if(G.parts.length>520)G.parts.splice(0,40);G.parts.push({x,y,vx,vy,life,max:life,col,size,g:g||0,sh:shape||'c',add})}

function killEnemy(e){
  e.dead=true;const S=G.save,p=G.p,M=curMap();
  // nổ hạt
  const col=e.def.c?e.def.c[0]:FACTION[e.def.fac].a;
  for(let i=0;i<14;i++){const a=Math.random()*TAU,v=rand(60,220);addPart(e.x,e.y-14,Math.cos(a)*v,Math.sin(a)*v-80,rand(0.4,0.8),i%3?col:'#fff4d0',rand(2,4.5),500)}
  for(let i=0;i<4;i++)addPart(e.x+rand(-10,10),e.y-10,rand(-10,10),rand(-60,-30),1.2,'#fff0c8',rand(2,4),-20,'c',1);G.fx.push({k:'flash',x:e.x,y:e.y-14,r:e.elite||e.boss?90:44,col:e.elite?'#ffc53d':'#fff0c8',life:0.22,max:0.22});
  // kinh nghiệm
  const diff=e.lv-lvOffset()-S.lvl+lvOffset();const xm=clamp(1+(e.lv-S.lvl)*0.08,0.3,1.6);
  let xp=(4.2+2.3*e.lv)*(e.elite?4:1)*(e.boss?25:1)*xm*(1+p.expB/100);gainExp(xp);mountGainExp(1+e.lv*0.15*(e.elite?3:1));
  if(e.camp!=null)campMemberDied(e);if(e.horde&&G.horde)G.horde.kill++;
  if(e.boss)dropAt(e.x,e.y,'frag',2);else if(e.elite&&Math.random()<0.05)dropAt(e.x,e.y,'frag',1);
  S.kills++;G.combo=(G.t-(G.comboT||-9)<2.6?(G.combo||0):0)+1;G.comboT=G.t;
  S.score+=Math.round(10*e.lv*(e.elite?5:1)*(e.boss?40:1)*(1+S.ng*0.5)*(1+Math.min(G.combo,50)*0.02));UI.combo(G.combo);
  // rơi đồ
  const gb=1+p.goldB/100;const lv=e.lv;
  const coins=e.boss?8:e.elite?4:Math.random()<0.75?1:0;
  for(let i=0;i<coins;i++)dropAt(e.x,e.y,'gold',Math.round((lv*2+randi(1,6))*gb));
  if(Math.random()<(e.boss?1:e.elite?1:0.12))dropAt(e.x,e.y,'ore',e.boss?8:e.elite?randi(2,3):1);
  if(Math.random()<(e.elite?0.5:0.04))dropAt(e.x,e.y,'pot',Math.random()<0.6?'potHP':'potMP');
  if(!S.firstItem){S.firstItem=true;dropAt(e.x,e.y,'item',genItem(Math.max(2,lv),1,'vk'))}
  else if(e.boss){for(let i=0;i<3;i++)dropAt(e.x,e.y,'item',genItem(lv+1,Math.max(2,rollRarity(2))))}
  else if(e.elite||Math.random()<0.17){dropAt(e.x,e.y,'item',genItem(lv+randi(-1,1),rollRarity(e.elite?1:0)))}
  // nhiệm vụ
  questEvent('kill',e);sideEvent('any',1);if(e.elite)sideEvent('elite',1);
  const step=M.quest[S.qs[S.map]];
  if(step&&step.t==='collect'&&step.e===e.type&&Math.random()<0.5)dropAt(e.x,e.y,'qitem',step.item);
  if(e.boss)bossDefeated(e);
  Audio_.play(e.elite||e.boss?'crit':'hit');
  if(e.elite)G.hitstop=Math.max(G.hitstop,0.08);
}
function dropAt(x,y,kind,val){const a=Math.random()*TAU,v=rand(40,110);
  G.drops.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v*0.6,z:0,vz:rand(160,260),kind,val,t:0,id:Math.random()});
  if(kind==='item'&&val.rar>=2)Audio_.play('loot',val.rar);}
function gainExp(x){const S=G.save,p=G.p;S.exp+=Math.round(x);let up=false;
  while(S.exp>=need(S.lvl)){S.exp-=need(S.lvl);S.lvl++;S.sp++;up=true;S.score+=200;
    const C=CLASS_BY_ID[S.cls];C.skills.forEach((sk,i)=>{if(S.lvl>=sk.un&&S.skl[i]===0){S.skl[i]=1;S.sp--;UI.toast('Mở khóa kỹ năng: '+sk.name,'skill');UI.flashSkill(i)}})}
  if(up){recalc();p.hp=p.maxhp;p.mp=p.maxmp;Audio_.play('level');UI.levelUp(S.lvl);
    for(let i=0;i<40;i++){const a=i/40*TAU;addPart(p.x+Math.cos(a)*20,p.y-20,Math.cos(a)*180,Math.sin(a)*90-40,0.9,i%2?'#ffd23a':'#fff4d0',3,0)}
    G.fx.push({k:'ring',x:p.x,y:p.y,r:10,r2:160,life:0.7,max:0.7,col:'#ffd23a'},{k:'pillar',x:p.x,y:p.y,w:34,h:420,col:'#ffd23a',life:1.1,max:1.1})}
  G.dirty.exp=1;
}

/* ---------- nhiệm vụ ---------- */
function questEvent(ev,e){
  const S=G.save,M=curMap(),si=S.qs[S.map],step=M.quest[si];if(!step)return;
  if(ev==='kill'&&step.t==='kill'&&e.type===step.e)S.qp++;
  else if(ev==='kill'&&step.t==='elite'&&e.elite)S.qp++;
  else if(ev==='collect'&&step.t==='collect')S.qp++;
  else return;
  G.dirty.quest=1;
  if(S.qp>=step.n)completeStep();
}
function completeStep(){
  const S=G.save,M=curMap(),mi=S.map,si=S.qs[mi];
  const gold=60*(mi+1)*(si+1)*(1+S.ng),ore=2+mi;S.gold+=gold;S.ore+=ore;gainExp(need(S.lvl)*0.35);S.score+=500*(mi+1)*(1+S.ng);
  let extra='';if(si===1){const it=genItem(enemyLevelAt(G.p.x,G.p.y)+1,2);addToBag(it,true);extra=', '+itemName(it)}
  UI.questDone(M.quest[si].txt,`+${fmt(gold)} vàng, +${ore} Huyền Thiết${extra}`);
  S.qs[mi]++;S.qp=0;G.dirty.quest=1;G.eliteTimer=0;Audio_.play('quest');
  const nx=M.quest[S.qs[mi]];if(nx&&nx.t==='boss')UI.toast('Phong ấn đấu trường đã mở. Theo mũi tên vàng.','quest');
  saveGame();
}
function newSide(){const S=G.save,q=pick(SIDE_Q);let n=randi(q.n[0],q.n[1]);if(q.t==='gold')n=50*S.lvl+150;S.side={t:q.t,n,p:0,txt:q.txt(n)};G.dirty.quest=1}
function sideEvent(t,v){const S=G.save;if(!S.side)newSide();if(S.side.t!==t)return;S.side.p+=v;G.dirty.quest=1;
  if(S.side.p>=S.side.n){S.sideChain++;const c=S.sideChain;const gold=Math.round(30*S.lvl*(1+c*0.05)),ore=1+(c%3===0?1:0);
    S.gold+=gold;S.ore+=ore;gainExp(need(S.lvl)*0.12);S.score+=150*(1+S.ng);let ex='';
    if(c%5===0){S.charm++;ex=', +1 Bùa Bảo Hộ'}if(c%10===0){const it=genItem(S.lvl+1,3);addToBag(it,true);ex+=', '+itemName(it)}
    UI.toast(`Dã Tẩu chuỗi ${c}: +${fmt(gold)} vàng, +${ore} Huyền Thiết${ex}`,'quest');Audio_.play('quest');newSide()}}

/* ---------- túi đồ ---------- */
const BAG_MAX=40;
function addToBag(it,force){const S=G.save;
  if(S.set.autoSalvage&&it.rar===0&&!force){const v=salvageValue(it);S.ore+=v.ore;S.gold+=v.gold;return true}
  if(S.bag.length>=BAG_MAX&&!force)return false;S.bag.push(it);G.dirty.bag=1;
  if(it.rar>=1)sideEvent('loot',1);
  const cur=S.equip[it.slot];if(itemPower(it)>itemPower(cur))UI.offerEquip(it);
  return true}
function equipItem(it){const S=G.save;const i=S.bag.indexOf(it);if(i<0)return;S.bag.splice(i,1);{const p=G.p,col=RARITY[it.rar].color;G.fx.push({k:'pillar',x:p.x,y:p.y,w:22,h:180,col,life:0.7,max:0.7},{k:'ring',x:p.x,y:p.y,r:8,r2:60,life:0.4,max:0.4,col});}
  const old=S.equip[it.slot];if(old)S.bag.push(old);S.equip[it.slot]=it;const hpR=G.p.hp/G.p.maxhp;recalc();G.p.hp=Math.round(G.p.maxhp*hpR);
  G.dirty.bag=1;S.tut.equip=true;updateLook();Audio_.play('ui');saveGame()}
function unequip(slot){const S=G.save;if(S.bag.length>=BAG_MAX)return false;const it=S.equip[slot];if(!it)return false;delete S.equip[slot];S.bag.push(it);recalc();updateLook();G.dirty.bag=1;return true}
function salvage(it){const S=G.save;const i=S.bag.indexOf(it);if(i<0)return;S.bag.splice(i,1);const v=salvageValue(it);S.ore+=v.ore;S.gold+=v.gold;G.dirty.bag=1;return v}

/* ---------- lò rèn ---------- */
function doForge(it,useCharm){
  const S=G.save,c=forgeCost(it);if(it.enh>=15)return{err:'Đã đạt cấp tối đa +15'};
  if(S.ore<c.ore)return{err:`Thiếu Huyền Thiết (cần ${c.ore})`};if(S.gold<c.gold)return{err:`Thiếu vàng (cần ${fmt(c.gold)})`};
  S.ore-=c.ore;S.gold-=c.gold;const rate=FORGE_RATE[it.enh];const ok=Math.random()*100<rate;const from=it.enh;let prot=false;
  if(ok)it.enh++;else if(it.enh>=7){if(useCharm&&S.charm>0){S.charm--;prot=true}else it.enh--}
  sideEvent('forge',1);S.tut.forge=true;if(ok)S.score+=50*it.enh;recalc();updateLook();G.dirty.bag=1;saveGame();
  return{ok,from,to:it.enh,prot};
}

/* ---------- boss ---------- */
function bossDefeated(e){if(G.save.map===0)setTimeout(()=>giveMount('o','Phần thưởng hạ Ngư Tinh: '),1800);
  const S=G.save,mi=S.map,M=curMap();G.boss=null;
  S.qs[mi]=4;S.qp=0;if(!S.cleared.includes(mi))S.cleared.push(mi);
  S.unlocked=Math.max(S.unlocked,Math.min(6,mi+2));
  const gold=500*(mi+1)*(1+S.ng),ore=8+mi*2;S.gold+=gold;S.ore+=ore;S.charm+=1;
  const it=genItem(e.lv+2,3);addToBag(it,true);gainExp(need(S.lvl)*0.8);S.score+=5000*(mi+1)*(1+S.ng);
  G.slow=0.25;G.timers.push({t:0.32,fn:()=>{G.slow=1;UI.chapterClear(mi,{gold,ore,item:it})}});
  G.shake=14;Audio_.play('win');saveGame();
}

/* ---------- lưu ---------- */
function saveGame(){const S=G.save;if(!S)return;S.best=Math.max(S.best,S.score);store.set(SAVE_KEY,JSON.stringify(S))}

/* ============ KỸ NĂNG & ĐÁNH THƯỜNG ============ */
function nearestEnemy(x,y,maxD,filter){let best=null,bd=maxD*maxD;for(const e of G.enemies){if(e.dead||(filter&&!filter(e)))continue;const d=dist2(x,y,e.x,e.y);if(d<bd){bd=d;best=e}}return best}
function enemiesIn(x,y,r){const out=[];for(const e of G.enemies){if(e.dead)continue;const rr=r+e.r;if(dist2(x,y,e.x,e.y)<rr*rr)out.push(e)}return out}
function aimTarget(range){const p=G.p;let t=G.lastTarget;if(t&&(t.dead||dist(p.x,p.y,t.x,t.y)>range+60))t=null;
  if(!t)t=nearestEnemy(p.x,p.y,range);G.lastTarget=t;return t}
function basicAttack(){
  const p=G.p,C=p.cls,A=C.atk;if(p.atkCd>0||p.dash)return false;
  const t=aimTarget(A.range+160);
  if(t){p.aim=Math.atan2(t.y-p.y,t.x-p.x);p.f=Math.cos(p.aim)>=0?1:-1}
  // tự tiến lại gần nếu xa
  if(t&&A.type!=='shot'){const d=dist(p.x,p.y,t.x,t.y)-t.r;if(d>A.range){p.approach=t;return false}}
  if(t&&A.type==='shot'&&dist(p.x,p.y,t.x,t.y)>A.range+t.r){p.approach=t;return false}
  p.approach=null;p.atkCd=p.interval;p.atkAnim=0;G.save.tut.atk=true;
  const dmg=p.atk;
  if(A.type==='shot'){
    const sx=p.x+Math.cos(p.aim)*14,sy=p.y-24+Math.sin(p.aim)*8;
    G.projs.push({x:sx,y:sy,vx:Math.cos(p.aim)*A.speed,vy:Math.sin(p.aim)*A.speed,r:8,dmg,from:'p',pierce:0,life:0.75,kind:A.proj,hit:new Set(),home:A.proj==='orb'?t:null});
    Audio_.play(A.proj==='orb'?'magic':'bow');
  }else{
    const range=A.range,arc=A.arc;let hit=0;
    for(const e of G.enemies){if(e.dead)continue;const d=dist(p.x,p.y,e.x,e.y);if(d>range+e.r)continue;
      const a=Math.atan2(e.y-p.y,e.x-p.x);if(Math.abs(angDiff(p.aim,a))>arc/2+0.25&&d>e.r+10)continue;
      hurtEnemy(e,dmg,{kb:C.id==='con'?160:90,ang:a});hit++}
    G.fx.push({k:'slash',x:p.x,y:p.y-18,a:p.aim,arc:A.type==='thrust'?0.5:arc,r:range,life:0.18,max:0.18,col:C.color,thrust:A.type==='thrust',flip:(p.combo=(p.combo||0)+1)%2});
    Audio_.play('swing');
  }
  return true;
}
function skillLv(i){return G.save.skl[i]}
function canCast(i){const S=G.save,p=G.p,sk=p.cls.skills[i];return S.lvl>=sk.un&&S.skl[i]>0&&p.skCd[i]<=0&&p.mp>=sk.mp&&!p.dash&&G.state==='play'}
function castSkill(i){
  const S=G.save,p=G.p,sk=p.cls.skills[i];
  if(S.lvl<sk.un||S.skl[i]<=0){UI.toast(`${sk.name} mở ở cấp ${sk.un}`);return false}
  if(p.skCd[i]>0)return false;if(p.mp<sk.mp){UI.toast('Không đủ nội lực');UI.pulse('#btnMP');return false}if(p.dash)return false;
  const lv=S.skl[i],m=sk.mult*(1+0.13*(lv-1)),dmg=p.atk*m;
  p.mp-=sk.mp;p.skCd[i]=sk.cd*(1-0.02*(lv-1));S.tut.skill=true;sideEvent('skill',1);
  const t=aimTarget(420);let aim=t?Math.atan2(t.y-p.y,t.x-p.x):p.aim;p.aim=aim;p.f=Math.cos(aim)>=0?1:-1;p.atkAnim=0;
  const C=p.cls.color,tx=t?t.x:p.x+Math.cos(aim)*160,ty=t?t.y:p.y+Math.sin(aim)*160;
  const later=(dt,fn)=>G.timers.push({t:dt,fn});
  switch(sk.id){
    case'wave':G.projs.push({x:p.x,y:p.y-18,vx:Math.cos(aim)*700,vy:Math.sin(aim)*700,r:28,dmg,from:'p',pierce:99,life:0.55,kind:'wave',ang:aim,hit:new Set(),col:C});Audio_.play('swing');Audio_.play('magic');break;
    case'spin':for(let k=0;k<3;k++)later(k*0.18,()=>{enemiesIn(p.x,p.y,118).forEach(e=>hurtEnemy(e,dmg,{kb:120}));G.fx.push({k:'spin',x:p.x,y:p.y-16,r:118,life:0.22,max:0.22,col:C,a:k*2});Audio_.play('swing')});p.spinT=0.55;break;
    case'swordrain':{const ts=G.enemies.filter(e=>!e.dead&&dist(p.x,p.y,e.x,e.y)<360);for(let k=0;k<12;k++){const e=ts.length?ts[k%ts.length]:null;const x=e?e.x+rand(-20,20):p.x+rand(-200,200),y=e?e.y+rand(-15,15):p.y+rand(-200,200);
      G.fx.push({k:'fallsword',x,y,life:0.32,max:0.32,delay:k*0.07,col:C});later(k*0.07+0.32,()=>{enemiesIn(x,y,52).forEach(en=>hurtEnemy(en,dmg,{kb:60}));sparks(x,y,8,C,220);G.fx.push({k:'flash',x,y,r:44,col:C,life:0.25,max:0.25},{k:'ring',x,y,r:8,r2:50,life:0.3,max:0.3,col:C});if(k%3===0)pushCrack(x,y,40,5);G.shake=Math.max(G.shake,3)})}Audio_.play('magic');break}
    case'tri':for(let k=-1;k<=1;k++){const a=aim+k*0.22;G.projs.push({x:p.x,y:p.y-24,vx:Math.cos(a)*680,vy:Math.sin(a)*680,r:10,dmg,from:'p',pierce:2,life:0.6,kind:'arrow',hit:new Set(),col:C})}Audio_.play('bow');break;
    case'leap':{const ne=nearestEnemy(p.x,p.y,300);const away=ne?Math.atan2(p.y-ne.y,p.x-ne.x):aim+Math.PI;
      p.dash={vx:Math.cos(away)*760,vy:Math.sin(away)*760,t:0.22,dmg:0,hit:new Set()};p.ifr=0.35;Audio_.play('dash');
      later(0.22,()=>{const t2=nearestEnemy(p.x,p.y,420);const a2=t2?Math.atan2(t2.y-p.y,t2.x-p.x):aim;p.aim=a2;p.f=Math.cos(a2)>=0?1:-1;
        for(let k=-2;k<=2;k++){const a=a2+k*0.16;G.projs.push({x:p.x,y:p.y-24,vx:Math.cos(a)*700,vy:Math.sin(a)*700,r:10,dmg,from:'p',pierce:1,life:0.6,kind:'arrow',hit:new Set(),col:C})}Audio_.play('bow')});break}
    case'arrowrain':G.zones.push({x:tx,y:ty,r:135,t:2,tick:0.2,tt:0,dmg,kind:'arrows',col:C});Audio_.play('bow');break;
    case'lunge':p.dash={vx:Math.cos(aim)*900,vy:Math.sin(aim)*900,t:0.21,dmg,hit:new Set(),kb:160,r:46};p.ifr=0.22;Audio_.play('dash');break;
    case'sweep':enemiesIn(p.x,p.y,140).forEach(e=>{const a=Math.atan2(e.y-p.y,e.x-p.x);if(Math.abs(angDiff(aim,a))<2.2)hurtEnemy(e,dmg,{kb:260,ang:a})});
      G.fx.push({k:'slash',x:p.x,y:p.y-18,a:aim,arc:4.3,r:140,life:0.28,max:0.28,col:C,wide:1});Audio_.play('swing');G.shake=4;break;
    case'stakes':[80,150,220].forEach((rr,k)=>later(k*0.16,()=>{for(const e of G.enemies){if(e.dead)continue;const d=dist(p.x,p.y,e.x,e.y);if(d<rr+e.r&&d>rr-80-e.r)hurtEnemy(e,dmg,{stun:1.1})}
      const n=10+k*6;for(let j=0;j<n;j++){const a=j/n*TAU;G.fx.push({k:'stake',x:p.x+Math.cos(a)*rr,y:p.y+Math.sin(a)*rr*0.9,life:0.6,max:0.6})}pushCrack(p.x,p.y,rr,6);pushDust(p.x,p.y,8,rr);G.shake=6;Audio_.play('slam')}));break;
    case'shadow':p.dash={vx:Math.cos(aim)*1100,vy:Math.sin(aim)*1100,t:0.17,dmg,hit:new Set(),critB:20,r:42,ghost:1};p.ifr=0.3;Audio_.play('dash');break;
    case'flurry':for(let k=0;k<6;k++)later(k*0.08,()=>{const a0=p.aim;enemiesIn(p.x,p.y,100).forEach(e=>{const a=Math.atan2(e.y-p.y,e.x-p.x);if(Math.abs(angDiff(a0,a))<0.85)hurtEnemy(e,dmg,{kb:30})});
      G.fx.push({k:'slash',x:p.x,y:p.y-18,a:a0+rand(-0.3,0.3),arc:1.6,r:100,life:0.14,max:0.14,col:C,flip:k%2});p.atkAnim=0;Audio_.play('swing')});break;
    case'blink':{const ts=G.enemies.filter(e=>!e.dead&&dist(p.x,p.y,e.x,e.y)<340).sort((a,b)=>dist2(p.x,p.y,a.x,a.y)-dist2(p.x,p.y,b.x,b.y)).slice(0,8);
      if(!ts.length){p.mp+=sk.mp;p.skCd[i]=0;UI.toast('Không có kẻ địch gần');return false}
      p.ifr=ts.length*0.1+0.3;ts.forEach((e,k)=>later(k*0.1,()=>{if(e.dead)return;const a=Math.random()*TAU;pushGhost(p.x,p.y,p.f,'#ff3a5a',0.4);
        p.x=e.x+Math.cos(a)*30;p.y=e.y+Math.sin(a)*30;resolve(G.W,p);p.aim=Math.atan2(e.y-p.y,e.x-p.x);p.f=Math.cos(p.aim)>=0?1:-1;p.atkAnim=0;
        hurtEnemy(e,dmg,{critB:25});G.fx.push({k:'xslash',x:e.x,y:e.y-20,life:0.3,max:0.3,col:'#ff3a5a'});Audio_.play('dash')}));break}
    case'slam':enemiesIn(p.x,p.y,128).forEach(e=>hurtEnemy(e,dmg,{stun:1.0,kb:80}));G.fx.push({k:'ring',x:p.x,y:p.y,r:20,r2:135,life:0.4,max:0.4,col:C},{k:'flash',x:p.x,y:p.y,r:90,col:C,life:0.3,max:0.3});pushCrack(p.x,p.y,110,9);
      for(let j=0;j<16;j++){const a=j/16*TAU;addPart(p.x+Math.cos(a)*40,p.y+Math.sin(a)*30,Math.cos(a)*200,Math.sin(a)*120-60,0.5,'#a08060',4,500)}G.shake=9;G.hitstop=0.06;Audio_.play('slam');break;
    case'guard':p.buff.guard=5;enemiesIn(p.x,p.y,260).forEach(e=>{if(e.boss)return;const a=Math.atan2(p.y-e.y,p.x-e.x);e.kbx+=Math.cos(a)*260;e.kby+=Math.sin(a)*260;e.state='chase'});
      G.fx.push({k:'ring',x:p.x,y:p.y,r:260,r2:30,life:0.4,max:0.4,col:'#ffd23a'});Audio_.play('clang');break;
    case'wheel':p.buff.wheel=4;p.buff.wheelDmg=dmg;p.buff.wheelT=0;Audio_.play('magic');break;
    case'chain':{let cur=t||nearestEnemy(p.x,p.y,380);if(!cur){p.mp+=sk.mp;p.skCd[i]=0;UI.toast('Không có kẻ địch gần');return false}
      const hit=new Set();let px=p.x,py=p.y-30;for(let k=0;k<5&&cur;k++){hit.add(cur);G.fx.push({k:'bolt',x1:px,y1:py,x2:cur.x,y2:cur.y-18,life:0.22,max:0.22,col:'#bcd8ff'});hurtEnemy(cur,dmg*(1-k*0.1),{stun:0.25});px=cur.x;py=cur.y-18;
        const c0=cur;cur=nearestEnemy(c0.x,c0.y,220,e=>!hit.has(e))}Audio_.play('zap');break}
    case'firering':G.zones.push({x:tx,y:ty,r:118,t:3,tick:0.3,tt:0,dmg,kind:'fire',col:'#ff7a2a'});enemiesIn(tx,ty,118).forEach(e=>hurtEnemy(e,dmg*2.5,{}));G.fx.push({k:'flash',x:tx,y:ty,r:130,col:'#ff7a2a',life:0.35,max:0.35},{k:'ring',x:tx,y:ty,r:20,r2:125,life:0.4,max:0.4,col:'#ffb347'});pushCrack(tx,ty,90,7);Audio_.play('boom');G.shake=5;break;
    case'thunder':{const ts=G.enemies.filter(e=>!e.dead&&dist(p.x,p.y,e.x,e.y)<360);for(let k=0;k<8;k++){later(k*0.09,()=>{const e=ts.length?ts[k%ts.length]:null;const x=e&&!e.dead?e.x:p.x+rand(-220,220),y=e&&!e.dead?e.y:p.y+rand(-220,220);
      G.fx.push({k:'bolt',x1:x+rand(-30,30),y1:y-420,x2:x,y2:y,life:0.25,max:0.25,col:'#d8e8ff',w:4});enemiesIn(x,y,60).forEach(en=>hurtEnemy(en,dmg,{stun:0.4}));G.fx.push({k:'ring',x,y,r:10,r2:64,life:0.3,max:0.3,col:'#bcd8ff'},{k:'flash',x,y,r:70,col:'#9fc4ff',life:0.22,max:0.22});pushCrack(x,y,46,5);G.shake=Math.max(G.shake,4);Audio_.play('zap')})}break}
  }
  skillVfx(sk,i,aim,tx,ty);UI.castFx(i);return true;
}
function usePot(k){const S=G.save,p=G.p;if(S[k]<=0){UI.toast(k==='potHP'?'Hết Bình Kim Sang. Mua ở Chợ.':'Hết Bình Nội Lực. Mua ở Chợ.');return false}
  if(k==='potHP'&&p.hp>=p.maxhp)return false;if(k==='potMP'&&p.mp>=p.maxmp)return false;
  if(p.potCd>0)return false;S[k]--;p.potCd=0.8;
  if(k==='potHP'){const v=Math.round(p.maxhp*0.45);p.hp=Math.min(p.maxhp,p.hp+v);addFloat(p.x,p.y-56,'+'+fmt(v),'#7dff8a',17)}
  else{const v=Math.round(p.maxmp*0.6);p.mp=Math.min(p.maxmp,p.mp+v);addFloat(p.x,p.y-56,'+'+fmt(v),'#7fb2ff',17)}
  for(let i=0;i<10;i++)addPart(p.x+rand(-12,12),p.y-rand(0,30),0,rand(-90,-40),0.7,k==='potHP'?'#7dff8a':'#7fb2ff',3,0);Audio_.play('magic');G.dirty.pot=1;return true}

/* ============ CẬP NHẬT ============ */
function die(){const p=G.p;G.state='dead';p.deadT=3.5;Audio_.play('fail');G.shake=10;UI.dead()}
function respawn(){const S=G.save,p=G.p,W=G.W;const lost=Math.floor(S.gold*0.1);S.gold-=lost;
  p.x=W.camp.x+60;p.y=W.camp.y+40;p.hp=p.maxhp;p.mp=p.maxmp;p.ifr=2;G.enemies=G.enemies.filter(e=>e.boss||dist(e.x,e.y,p.x,p.y)>700);
  if(G.boss&&!G.boss.dead){G.boss.hp=G.boss.max;G.boss.x=W.arena.x;G.boss.y=W.arena.y;G.boss.state='idle'}
  G.state='play';UI.respawned(lost);saveGame()}

function update(dt){
  G.t+=dt;
  for(let i=G.timers.length-1;i>=0;i--){const tm=G.timers[i];tm.t-=dt;if(tm.t<=0){G.timers.splice(i,1);tm.fn()}}
  const p=G.p,S=G.save,W=G.W;
  if(G.state==='dead'){p.deadT-=dt;if(p.deadT<=0)respawn();updateFx(dt);return}
  // hồi phục
  const inCamp=inTownPt(p.x,p.y);p.inCamp=inCamp;
  p.regenT+=dt;if(p.regenT>=0.5){p.regenT=0;const k=inCamp?0.08:0.006;p.hp=Math.min(p.maxhp,p.hp+p.maxhp*k);p.mp=Math.min(p.maxmp,p.mp+p.maxmp*(inCamp?0.08:0.012))}
  p.potCd=Math.max(0,(p.potCd||0)-dt);
  if(S.set.autoPot&&p.hp<p.maxhp*0.3&&S.potHP>0&&!inCamp)usePot('potHP');
  if(S.set.autoPot&&p.mp<p.maxmp*0.15&&S.potMP>0&&!inCamp&&S.set.auto)usePot('potMP');
  // timer
  p.atkCd-=dt;p.ifr-=dt;p.hurtT-=dt;for(let i=0;i<3;i++)p.skCd[i]=Math.max(0,p.skCd[i]-dt);
  if(p.atkAnim>=0){p.atkAnim+=dt/Math.max(0.2,Math.min(0.35,p.interval*0.7));if(p.atkAnim>1)p.atkAnim=-1}
  if(p.spinT>0)p.spinT-=dt;
  for(const k of['guard','wheel'])if(p.buff[k]>0)p.buff[k]-=dt;
  if(p.buff.wheel>0){p.buff.wheelT-=dt;if(p.buff.wheelT<=0){p.buff.wheelT=0.25;enemiesIn(p.x,p.y,108).forEach(e=>hurtEnemy(e,p.buff.wheelDmg,{kb:40,noStagger:1}));
    for(let j=0;j<6;j++){const a=G.t*8+j/6*TAU;addPart(p.x+Math.cos(a)*100,p.y-12+Math.sin(a)*70,0,-30,0.35,j%2?'#ff7a2a':'#ffd23a',4,0)}}}
  // di chuyển
  let {mx,my}=G.input;if(S.set.auto&&!(mx||my)){const ai=autoPlay(dt);mx=ai.mx;my=ai.my}
  if(p.dash){const d=p.dash;moveEnt(W,p,d.vx*dt,d.vy*dt);d.t-=dt;
    if(d.dmg)for(const e of G.enemies){if(e.dead||d.hit.has(e))continue;if(dist(p.x,p.y,e.x,e.y)<(d.r||40)+e.r){d.hit.add(e);hurtEnemy(e,d.dmg,{kb:d.kb||60,critB:d.critB})}}
    if(G.t%0.03<dt)pushGhost(p.x,p.y,p.f,p.dash.ghost?'#a066e0':p.cls.color,0.32);
    if(d.t<=0)p.dash=null;p.moving=true;p.walk+=dt*14}
  else{
    let ml=Math.hypot(mx,my);if(ml>1){mx/=ml;my/=ml;ml=1}
    if(ml<0.1&&p.approach&&(G.input.atk||G.autoAtk)&&!p.approach.dead){const d=navTo(p.approach.x,p.approach.y);mx=d[0];my=d[1];ml=1}
    if(ml>0.1){const sp=p.spd*(p.buff.wheel>0?1.2:1)*(p.atkAnim>=0&&p.cls.atk.type!=='shot'?0.7:1);moveEnt(W,p,mx*sp*dt,my*sp*dt);p.moving=true;p.walk+=dt*11*ml;
      if(!(p.atkAnim>=0)){p.aim=Math.atan2(my,mx);p.f=mx>=0.05?1:mx<=-0.05?-1:p.f}if(G.input.mx||G.input.my)S.tut.move=true}
    else p.moving=false;
  }
  // khóa đấu trường
  const step=curMap().quest[S.qs[S.map]];const ad=dist(p.x,p.y,W.arena.x,W.arena.y);
  if((!step||step.t!=='boss')&&!G.boss&&ad<W.arena.r+20){const a=Math.atan2(p.y-W.arena.y,p.x-W.arena.x);p.x=W.arena.x+Math.cos(a)*(W.arena.r+22);p.y=W.arena.y+Math.sin(a)*(W.arena.r+22);
    if(!G.arenaMsgT||G.t-G.arenaMsgT>3){G.arenaMsgT=G.t;UI.toast(step?'Đấu trường bị phong ấn. Hoàn thành nhiệm vụ chính trước.':'Boss đã bị đánh bại. Hãy đi tiếp chương sau qua Xa Phu.')}}
  if(step&&step.t==='boss'&&!G.boss&&ad<W.arena.r-30)startBoss();
  // đánh
  if(G.input.atk||(S.set.auto&&G.autoAtk))basicAttack();else p.approach=null;
  // NPC gần
  let nn=null;for(const n of W.npcs){if(dist(p.x,p.y,n.x,n.y)<80){nn=n;break}}if(nn!==G.nearNpc){G.nearNpc=nn;UI.npcPrompt(nn)}
  updateEnemies(dt);updateProjs(dt);updateZones(dt);updateDrops(dt);updateFx(dt);
  // sinh quái
  G.spawnT-=dt;if(G.spawnT<=0){G.spawnT=0.7;let near=0;for(const e of G.enemies)if(!e.boss&&dist2(e.x,e.y,p.x,p.y)<1000*1000)near++;
    const target=22+Math.min(10,S.map*2);if(near<target&&(!G.boss||dist(p.x,p.y,G.W.arena.x,G.W.arena.y)>G.W.arena.r+500))trySpawnPack(560,950);
    G.enemies=G.enemies.filter(e=>!e.dead&&(e.boss||e.camp!=null||dist2(e.x,e.y,p.x,p.y)<1700*1700));}
  updateSystems(dt);
  if(step&&step.t==='elite'){G.eliteTimer+=dt;if(G.eliteTimer>18&&!G.enemies.some(e=>e.elite&&!e.dead)){G.eliteTimer=0;spawnElite()}}
  // lưu định kỳ
  G.saveT+=dt;if(G.saveT>8){G.saveT=0;saveGame()}
}

function updateEnemies(dt){
  const p=G.p,W=G.W;
  for(const e of G.enemies){
    if(e.dead)continue;
    e.flash-=dt;if(e.atkAnim>=0){e.atkAnim+=dt*3;if(e.atkAnim>1)e.atkAnim=-1}
    // hất lùi
    if(e.kbx||e.kby){moveEnt(W,e,e.kbx*dt,e.kby*dt);e.kbx*=Math.pow(0.002,dt);e.kby*=Math.pow(0.002,dt);if(Math.abs(e.kbx)<5)e.kbx=0;if(Math.abs(e.kby)<5)e.kby=0}
    if(e.stun>0){e.stun-=dt;e.moving=false;if(e.tele){e.tele=null;e.state='chase'}continue}
    if(e.hitstun>0){e.hitstun-=dt;continue}
    if(e.boss){updateBoss(e,dt);continue}
    const D=e.def,dp=dist(e.x,e.y,p.x,p.y),ang=Math.atan2(p.y-e.y,p.x-e.x);
    const pInCamp=p.inCamp||G.state!=='play';
    e.cd-=dt;e.st-=dt;e.moving=false;
    switch(e.state){
      case'idle':
        if(e.st<=0){e.st=rand(1.5,3.5);const a=Math.random()*TAU;e.wx=e.hx+Math.cos(a)*90;e.wy=e.hy+Math.sin(a)*90}
        if(dist(e.x,e.y,e.wx,e.wy)>10){const a=Math.atan2(e.wy-e.y,e.wx-e.x);stepEnemy(e,Math.cos(a),Math.sin(a),0.4,dt)}
        if(!pInCamp&&dp<(e.elite?340:280))e.state='chase';break;
      case'chase':{
        if(pInCamp||dp>900||(e.camp!=null&&dist(e.x,e.y,e.hx,e.hy)>520&&dp>200)){e.state='idle';if(e.camp==null){e.hx=e.x;e.hy=e.y}break}
        e.f=Math.cos(ang)>=0?1:-1;
        let want=1;if(D.ai==='ranged'||D.ai==='bomber'){if(dp<D.range*0.55)want=-0.8;else if(dp<D.range*0.85)want=0}
        const reach=D.ai==='melee'?D.range+e.r+p.r*0.5:D.range;
        if(D.ai==='melee'&&dp<reach)want=0;
        if(want>0&&dp>90&&!losClear(W,e.x,e.y,p.x,p.y)){const pf=playerField();const fd=fieldDir(W,pf,e.x,e.y);if(fd)stepEnemy(e,fd[0],fd[1],1,dt);else stepEnemy(e,Math.cos(ang),Math.sin(ang),1,dt)}
        else if(want)stepEnemy(e,Math.cos(ang)*want,Math.sin(ang)*want,1,dt);
        // tránh dồn cục
        for(const o of G.enemies){if(o===e||o.dead)continue;const dx=e.x-o.x,dy=e.y-o.y,rr=e.r+o.r;const d2=dx*dx+dy*dy;if(d2<rr*rr&&d2>0.01){const d=Math.sqrt(d2);e.x+=dx/d*(rr-d)*0.3;e.y+=dy/d*(rr-d)*0.3}}
        if(e.cd<=0&&dp<reach+(D.ai==='charge'?0:6)){e.state='wind';e.st=D.wind*(e.elite?0.85:1);e.lock=ang;e.atkAnim=0;
          if(D.ai==='melee')e.tele={k:'arc',r:reach+10,a:ang,arc:2.0};
          if(D.ai==='charge')e.tele={k:'line',len:Math.min(dp+80,D.range+60),w:e.r*2,a:ang};
          if(D.ai==='ranged')e.tele={k:'aim',len:dp,a:ang};
          if(D.ai==='bomber'){e.tx=p.x;e.ty=p.y;e.tele=null;G.tele.push({k:'circle',x:p.x,y:p.y,r:64,t:0,dur:D.wind+0.75,col:'#ff5b3d'})}}
        break}
      case'wind':
        if(e.st>D.wind*0.4&&D.ai!=='charge'){e.lock=ang;if(e.tele)e.tele.a=ang}
        e.f=Math.cos(e.lock)>=0?1:-1;
        if(e.st<=0)enemyAct(e,dp);break;
      case'dash':{const sp=e.spd*3.6;stepEnemy(e,Math.cos(e.lock),Math.sin(e.lock),3.6,dt);e.moving=true;e.dashT-=dt;
        if(!e.hitP&&dist(e.x,e.y,p.x,p.y)<e.r+p.r+6){e.hitP=true;hurtPlayer(e.atk*1.3,e.lv,e)}
        if(e.dashT<=0||e.blocked){e.state='recover';e.st=0.5}
        if(G.t%0.05<dt)addPart(e.x,e.y-4,rand(-20,20),rand(-30,-10),0.4,'rgba(200,180,140,0.6)',4,0);break}
      case'recover':if(e.st<=0)e.state='chase';break;
    }
    e.walk+=e.moving?dt*10:0;
  }
}
function stepEnemy(e,dx,dy,mult,dt){
  const sp=e.spd*mult*(e.slow>0?0.6:1);const ox=e.x,oy=e.y;
  const nx=e.x+dx*sp*dt,ny=e.y+dy*sp*dt;
  if(!G.p.inCamp||true){if(inTownPt(nx,ny)||inTownPt(nx+(dx>0?40:-40),ny+(dy>0?40:-40))){e.state='idle';e.hx=e.x;e.hy=e.y;return}}
  moveEnt(G.W,e,dx*sp*dt,dy*sp*dt);e.moving=true;
  const moved=Math.hypot(e.x-ox,e.y-oy);e.blocked=moved<sp*dt*0.3;
  if(e.blocked&&e.state==='chase'){const s=(e.id%2?1:-1);const a=Math.atan2(dy,dx)+s*1.1;moveEnt(G.W,e,Math.cos(a)*sp*dt,Math.sin(a)*sp*dt)}
}
function enemyAct(e,dp){
  const D=e.def,p=G.p;e.tele=null;e.atkAnim=0;
  if(D.ai==='melee'){const reach=D.range+e.r+p.r*0.5+12;const a=Math.atan2(p.y-e.y,p.x-e.x);
    if(dp<reach&&Math.abs(angDiff(e.lock,a))<1.15)hurtPlayer(e.atk,e.lv,e);
    G.fx.push({k:'slash',x:e.x,y:e.y-14,a:e.lock,arc:1.6,r:reach-6,life:0.15,max:0.15,col:'#ff8a6a',enemy:1});e.state='recover';e.st=0.35}
  else if(D.ai==='charge'){e.state='dash';e.dashT=Math.min(0.55,(D.range+60)/(e.spd*3.6));e.hitP=false;Audio_.play('dash')}
  else if(D.ai==='ranged'){const sp=D.proj==='rock'?300:380;G.projs.push({x:e.x,y:e.y-22,vx:Math.cos(e.lock)*sp,vy:Math.sin(e.lock)*sp,r:7,dmg:e.atk,lv:e.lv,from:'e',life:1.3,kind:D.proj,hit:new Set()});e.state='recover';e.st=0.4}
  else if(D.ai==='bomber'){G.projs.push({x:e.x,y:e.y-20,sx:e.x,sy:e.y-20,tx:e.tx,ty:e.ty,t:0,dur:0.7,r:64,dmg:e.atk,lv:e.lv,from:'e',kind:'shell',life:2,hit:new Set()});e.state='recover';e.st=0.5}
  e.cd=D.cd*rand(0.85,1.2)*(e.elite?0.8:1);
}

/* ---------- boss ---------- */
function startBoss(){
  const W=G.W,M=curMap();if(G.boss)return;
  const lv=M.lv[1]+lvOffset();const e=spawnEnemy(M.boss,W.arena.x,W.arena.y-40,lv,false);e.state='intro';e.st=1.6;G.boss=e;
  G.enemies=G.enemies.filter(x=>x===e||dist(x.x,x.y,W.arena.x,W.arena.y)>W.arena.r+200);
  UI.bossIntro(e);Audio_.play('roar');G.shake=10;
}
function updateBoss(e,dt){
  const p=G.p,W=G.W,D=e.def,dp=dist(e.x,e.y,p.x,p.y),ang=Math.atan2(p.y-e.y,p.x-e.x);
  e.st-=dt;e.moving=false;const enr=e.enraged?1:0;
  if(!e.enraged&&e.hp<e.max*0.35){e.enraged=true;UI.toast(e.name+' nổi giận!','boss');Audio_.play('roar');G.shake=12;G.fx.push({k:'ring',x:e.x,y:e.y,r:20,r2:240,life:0.6,max:0.6,col:'#ff3a2a'})}
  const outside=dist(p.x,p.y,W.arena.x,W.arena.y)>W.arena.r+260||G.state!=='play';
  if(outside&&e.state!=='intro'){e.tele=null;const a=Math.atan2(W.arena.y-e.y,W.arena.x-e.x);if(dist(e.x,e.y,W.arena.x,W.arena.y)>20){moveEnt(W,e,Math.cos(a)*e.spd*dt,Math.sin(a)*e.spd*dt);e.moving=true}
    e.hp=Math.min(e.max,e.hp+e.max*0.02*dt);e.state='chase';G.tele=G.tele.filter(t=>!t.boss);return}
  switch(e.state){
    case'intro':if(e.st<=0){e.state='chase';e.patT=1}break;
    case'chase':{e.f=Math.cos(ang)>=0?1:-1;e.patT-=dt*(enr?1.4:1);
      if(dp>e.r+40){moveEnt(W,e,Math.cos(ang)*e.spd*(enr?1.25:1)*dt,Math.sin(ang)*e.spd*(enr?1.25:1)*dt);e.moving=true}
      // giữ trong đấu trường
      const da=dist(e.x,e.y,W.arena.x,W.arena.y);if(da>W.arena.r+120){const a=Math.atan2(e.y-W.arena.y,e.x-W.arena.x);e.x=W.arena.x+Math.cos(a)*(W.arena.r+120);e.y=W.arena.y+Math.sin(a)*(W.arena.r+120)}
      e.cd-=dt;
      if(e.patT<=0){let pat=D.pat[e.patI%D.pat.length];e.patI++;
        if(pat==='summon'&&(e.hp>e.max*0.75||e.summons>=3))pat='volley';
        bossPattern(e,pat,ang);e.patT=enr?1.6:2.3}
      else if(dp<e.r+70&&e.cd<=0){e.state='wind';e.cur='melee';e.st=0.5;e.lock=ang;e.tele={k:'arc',r:e.r+80,a:ang,arc:2.2};e.atkAnim=0}
      break}
    case'wind':if(e.cur==='melee'&&e.st>0.2){e.lock=ang;e.tele.a=ang}if(e.st<=0)bossExec(e);break;
    case'dash':{moveEnt(W,e,Math.cos(e.lock)*720*dt,Math.sin(e.lock)*720*dt);e.moving=true;e.dashT-=dt;if(G.t%0.03<dt)G.fx.push({k:'ghostB',x:e.x,y:e.y,life:0.3,max:0.3,e});
      if(!e.hitP&&dist(e.x,e.y,p.x,p.y)<e.r+p.r+8){e.hitP=true;hurtPlayer(e.atk*1.5,e.lv,e);G.shake=10}
      if(e.dashT<=0){e.state='recover';e.st=0.6}break}
    case'recover':if(e.st<=0)e.state='chase';break;
  }
  e.walk+=e.moving?dt*8:0;
}
function bossPattern(e,pat,ang){
  const p=G.p,wind=e.enraged?0.75:1.0;e.cur=pat;e.state='wind';e.lock=ang;e.atkAnim=0;
  if(pat==='slam'){e.st=wind;G.tele.push({k:'circle',x:e.x,y:e.y,r:165,t:0,dur:wind,col:'#ff3a2a',boss:1})}
  if(pat==='charge'){e.st=wind*0.85;const len=420;e.tele={k:'line',len,w:e.r*2+10,a:ang};e.dashLen=len}
  if(pat==='volley'){e.st=wind*0.7;e.tele=null;G.tele.push({k:'circle',x:e.x,y:e.y,r:60,t:0,dur:wind*0.7,col:'#ffb347',boss:1})}
  if(pat==='meteor'){e.st=wind*0.6;const n=e.enraged?6:4;for(let k=0;k<n;k++){const x=k===0?p.x:p.x+rand(-170,170),y=k===0?p.y:p.y+rand(-150,150);
    G.tele.push({k:'circle',x,y,r:72,t:0,dur:1.15+k*0.12,col:'#ff5b3d',boss:1,boom:{dmg:e.atk*1.2,lv:e.lv}})}}
  if(pat==='summon'){e.st=0.8;e.summons++;G.fx.push({k:'ring',x:e.x,y:e.y,r:200,r2:20,life:0.8,max:0.8,col:'#c58bff'})}
}
function bossExec(e){
  const p=G.p,D=e.def,dp=dist(e.x,e.y,p.x,p.y);e.tele=null;
  switch(e.cur){
    case'melee':{const a=Math.atan2(p.y-e.y,p.x-e.x);if(dp<e.r+90&&Math.abs(angDiff(e.lock,a))<1.2)hurtPlayer(e.atk,e.lv,e);
      G.fx.push({k:'slash',x:e.x,y:e.y-30,a:e.lock,arc:2.2,r:e.r+80,life:0.2,max:0.2,col:'#ff6a4a',enemy:1});e.cd=1.2;e.state='recover';e.st=0.4;break}
    case'slam':if(dp<165+p.r)hurtPlayer(e.atk*1.4,e.lv,e);G.fx.push({k:'ring',x:e.x,y:e.y,r:30,r2:175,life:0.45,max:0.45,col:'#ffb347'});G.shake=12;Audio_.play('slam');
      for(let j=0;j<24;j++){const a=j/24*TAU;addPart(e.x+Math.cos(a)*60,e.y+Math.sin(a)*40,Math.cos(a)*260,Math.sin(a)*160-80,0.6,'#a08060',5,500)}e.state='recover';e.st=0.5;break;
    case'charge':e.state='dash';e.dashT=e.dashLen/720;e.hitP=false;Audio_.play('roar');break;
    case'volley':{const n=e.enraged?20:14;for(let k=0;k<n;k++){const a=k/n*TAU+G.t;G.projs.push({x:e.x,y:e.y-30,vx:Math.cos(a)*260,vy:Math.sin(a)*260,r:10,dmg:e.atk*0.8,lv:e.lv,from:'e',life:2.2,kind:D.proj,hit:new Set()})}
      const a0=Math.atan2(p.y-e.y,p.x-e.x);for(let k=-2;k<=2;k++){const a=a0+k*0.15;G.projs.push({x:e.x,y:e.y-30,vx:Math.cos(a)*400,vy:Math.sin(a)*400,r:10,dmg:e.atk*0.8,lv:e.lv,from:'e',life:2,kind:D.proj,hit:new Set()})}
      Audio_.play('magic');e.state='recover';e.st=0.5;break}
    case'meteor':e.state='recover';e.st=0.6;break;
    case'summon':for(let k=0;k<3;k++){const a=k/3*TAU;const m=spawnEnemy(D.minion,e.x+Math.cos(a)*90,e.y+Math.sin(a)*90,e.lv-2,false);m.state='chase';resolve(G.W,m);
      for(let j=0;j<10;j++)addPart(m.x,m.y-14,rand(-80,80),rand(-120,-20),0.6,'#c58bff',3,200)}
      e.state='recover';e.st=0.5;Audio_.play('roar');break;
  }
}

/* ---------- đạn, vùng, đồ rơi, hiệu ứng ---------- */
function updateProjs(dt){
  const p=G.p;
  for(let i=G.projs.length-1;i>=0;i--){const b=G.projs[i];b.life-=dt;
    if(b.kind==='shell'){b.t+=dt;const k=Math.min(1,b.t/b.dur);b.x=lerp(b.sx,b.tx,k);b.y=lerp(b.sy,b.ty,k);b.z=Math.sin(k*Math.PI)*120;
      if(k>=1){if(dist(b.tx,b.ty,p.x,p.y)<b.r+p.r*0.5)hurtPlayer(b.dmg,b.lv,null);boomFx(b.tx,b.ty,b.r);G.projs.splice(i,1)}continue}
    if(b.home&&!b.home.dead){const a=Math.atan2(b.home.y-18-b.y,b.home.x-b.x),sp=Math.hypot(b.vx,b.vy);const cur=Math.atan2(b.vy,b.vx);const na=cur+clamp(angDiff(cur,a),-8*dt,8*dt);b.vx=Math.cos(na)*sp;b.vy=Math.sin(na)*sp}
    b.x+=b.vx*dt;b.y+=b.vy*dt;
    if(b.from==='p'){for(const e of G.enemies){if(e.dead||b.hit.has(e))continue;if(dist(b.x,b.y,e.x,e.y-14*e.sc)<b.r+e.r){b.hit.add(e);hurtEnemy(e,b.dmg,{kb:b.kind==='wave'?120:50,ang:Math.atan2(b.vy,b.vx)});
        if(b.kind==='orb'){G.fx.push({k:'ring',x:b.x,y:b.y,r:5,r2:40,life:0.25,max:0.25,col:'#9fc4ff'});}
        if(b.pierce--<=0){b.life=0;break}}}}
    else if(p.hp>0&&dist(b.x,b.y,p.x,p.y-18)<b.r+p.r){hurtPlayer(b.dmg,b.lv,null);b.life=0}
    if(b.kind==='orb'&&Math.random()<0.6)addPart(b.x,b.y,rand(-20,20),rand(-20,20),0.3,'#9fc4ff',2.5,0);
    if(b.kind==='fire'&&Math.random()<0.5)addPart(b.x,b.y,rand(-20,20),rand(-30,0),0.3,'#ff9a3a',3,0);
    if(b.life<=0)G.projs.splice(i,1)}
}
function boomFx(x,y,r){G.fx.push({k:'ring',x,y,r:10,r2:r+10,life:0.35,max:0.35,col:'#ff8a3a'});for(let j=0;j<18;j++){const a=Math.random()*TAU,v=rand(60,240);addPart(x,y,Math.cos(a)*v,Math.sin(a)*v*0.6-80,rand(0.3,0.7),j%2?'#ff8a3a':'#5a4a3a',rand(3,6),300)}
  G.shake=Math.max(G.shake,6);Audio_.play('boom')}
function updateZones(dt){
  for(let i=G.zones.length-1;i>=0;i--){const z=G.zones[i];z.t-=dt;z.tt-=dt;
    if(z.tt<=0){z.tt=z.tick;enemiesIn(z.x,z.y,z.r).forEach(e=>hurtEnemy(e,z.dmg,{noStagger:1}));
      if(z.kind==='arrows'){for(let k=0;k<5;k++){const a=Math.random()*TAU,r=Math.random()*z.r;G.fx.push({k:'arrowfall',x:z.x+Math.cos(a)*r,y:z.y+Math.sin(a)*r*0.8,life:0.2,max:0.2})}}}
    if(z.kind==='fire'&&Math.random()<0.9){const a=Math.random()*TAU,r=Math.sqrt(Math.random())*z.r;addPart(z.x+Math.cos(a)*r,z.y+Math.sin(a)*r*0.8,0,rand(-80,-30),0.5,Math.random()<0.5?'#ff7a2a':'#ffd23a',rand(3,6),-40)}
    if(z.t<=0)G.zones.splice(i,1)}
  for(let i=G.tele.length-1;i>=0;i--){const t=G.tele[i];t.t+=dt;if(t.t>=t.dur){if(t.boom){const p=G.p;if(dist(t.x,t.y,p.x,p.y)<t.r+p.r*0.5)hurtPlayer(t.boom.dmg,t.boom.lv,null);boomFx(t.x,t.y,t.r)}G.tele.splice(i,1)}}
}
function updateDrops(dt){
  const p=G.p,S=G.save;
  for(let i=G.drops.length-1;i>=0;i--){const d=G.drops[i];d.t+=dt;
    if(d.z>0||d.vz>0){d.vz-=700*dt;d.z+=d.vz*dt;d.x+=d.vx*dt;d.y+=d.vy*dt;if(d.z<=0){d.z=0;d.vz=d.vz<-120?-d.vz*0.35:0;d.vx*=0.5;d.vy*=0.5}}
    if(d.t<0.45)continue;
    const dd=dist(d.x,d.y,p.x,p.y);const mag=d.kind==='item'?120:150;
    if(dd<mag&&G.state==='play'&&!(d.kind==='item'&&S.bag.length>=BAG_MAX&&!(S.set.autoSalvage&&d.val.rar===0))){const a=Math.atan2(p.y-d.y,p.x-d.x),sp=lerp(500,180,dd/mag);d.x+=Math.cos(a)*sp*dt;d.y+=Math.sin(a)*sp*dt}
    if(dd<24){
      if(d.kind==='gold'){S.gold+=d.val;sideEvent('gold',d.val);Audio_.play('coin');UI.loot(`+${fmt(d.val)} vàng`,'#ffd23a',1)}
      else if(d.kind==='ore'){S.ore+=d.val;UI.loot(`+${d.val} Huyền Thiết`,'#9fd8ff');Audio_.play('coin')}
      else if(d.kind==='pot'){S[d.val]++;UI.loot('+1 '+(d.val==='potHP'?'Bình Kim Sang':'Bình Nội Lực'),'#ff8a8a');G.dirty.pot=1;Audio_.play('coin')}
      else if(d.kind==='qitem'){UI.loot('+1 '+d.val,'#ffd23a');questEvent('collect');Audio_.play('quest')}
      else if(d.kind==='chest'){openChest(d)}
      else if(d.kind==='frag'){ensureMountSave();S.frag+=d.val;UI.loot(`+${d.val} Mảnh Ngựa Sắt (${S.frag}/8)`,'#ff9a5a');Audio_.play('loot',2);if(S.frag>=8&&!S.mounts.giong)UI.toast('Đủ 8 Mảnh Ngựa Sắt! Gặp Mã Phu để ghép Ngựa Sắt Thánh Gióng.','quest')}
      else if(d.kind==='item'){if(!addToBag(d.val)){if(G.t-G.lootFull>5){G.lootFull=G.t;UI.toast('Túi đầy. Mở Túi đồ để phân giải bớt.','warn')}continue}
        UI.loot(itemName(d.val),RARITY[d.val.rar].color);if(d.val.rar<2)Audio_.play('coin')}
      G.dirty.res=1;G.drops.splice(i,1)}
    else if(d.t>90)G.drops.splice(i,1)}
}
function updateFx(dt){
  for(let i=G.parts.length-1;i>=0;i--){const q=G.parts[i];q.life-=dt;q.vy+=q.g*dt;q.x+=q.vx*dt;q.y+=q.vy*dt;q.vx*=0.98;if(q.life<=0)G.parts.splice(i,1)}
  for(let i=G.fx.length-1;i>=0;i--){const f=G.fx[i];if(f.delay>0){f.delay-=dt;continue}f.life-=dt;if(f.life<=0)G.fx.splice(i,1)}
  for(let i=G.floats.length-1;i>=0;i--){const f=G.floats[i];f.life-=dt;f.y+=f.vy*dt;f.vy*=0.92;if(f.life<=0)G.floats.splice(i,1)}
}

/* ---------- điều hướng ---------- */
function navTo(x,y){ // hướng di chuyển của người chơi tới (x,y), tránh vật cản
  const p=G.p,W=G.W,S=G.save;const step=curMap().quest[S.qs[S.map]];const WK=(step&&step.t==='boss')||G.boss?W.walk:W.walkLocked;
  // phát hiện kẹt
  const nv=G.navS||(G.navS={x:p.x,y:p.y,t:G.t,stuck:0});
  if(G.t-nv.t>0.5){if(dist(nv.x,nv.y,p.x,p.y)<6)nv.stuck=G.t+1.6;nv.x=p.x;nv.y=p.y;nv.t=G.t}
  if(G.t>nv.stuck&&losClear(W,p.x,p.y,x,y,WK)){const a=Math.atan2(y-p.y,x-p.x);return[Math.cos(a),Math.sin(a)]}
  const gx=Math.floor(x/T),gy=Math.floor(y/T),key=gx+','+gy+(WK===W.walk?'o':'l');
  if(!G.nav||G.nav.key!==key||G.t-G.nav.t>3){G.nav={key,t:G.t,f:bfsField(W,gx,gy,WK)}}
  const d=fieldDir(W,G.nav.f,p.x,p.y);if(d)return d;
  // đang ở ô không nối được: đi thẳng tới ô gần nhất có đường
  const tx=Math.floor(p.x/T),ty=Math.floor(p.y/T);let bx=-1,by=-1,bd=1e9;
  for(let yy=-4;yy<=4;yy++)for(let xx=-4;xx<=4;xx++){const nx=tx+xx,ny=ty+yy;if(nx<0||ny<0||nx>=MW||ny>=MH)continue;if(G.nav.f[ny*MW+nx]<0)continue;const dd=xx*xx+yy*yy;if(dd<bd){bd=dd;bx=nx;by=ny}}
  if(bx>=0){const a=Math.atan2((by+.5)*T-p.y,(bx+.5)*T-p.x);return[Math.cos(a),Math.sin(a)]}
  const a=Math.atan2(y-p.y,x-p.x)+(G.t*0.7%2>1?1:-1)*(G.t>nv.stuck?0:1.2);return[Math.cos(a),Math.sin(a)];
}
function playerField(){const p=G.p,k=Math.floor(p.x/T)+','+Math.floor(p.y/T);if(!G.pf||G.pf.key!==k){G.pf={key:k,f:bfsField(G.W,Math.floor(p.x/T),Math.floor(p.y/T))}}return G.pf.f}
/* ---------- tự đánh (AI người chơi) ---------- */
function autoPlay(dt){
  const p=G.p,S=G.save,W=G.W;G.autoAtk=false;
  // né vùng nguy hiểm
  const stuck=G.navS&&G.t<G.navS.stuck;
  if(!stuck&&!G.noDodge)for(const t of G.tele){if(t.t/t.dur>0.25&&dist(t.x,t.y,p.x,p.y)<t.r+p.r+6){let a=Math.atan2(p.y-t.y,p.x-t.x);if(dist(t.x,t.y,p.x,p.y)<6)a=(t.x*7+t.y)%TAU;
    const tryA=[a,a+0.8,a-0.8,a+1.6,a-1.6];for(const b of tryA){if(!isSolidPt(W,p.x+Math.cos(b)*40,p.y+Math.sin(b)*40)){a=b;break}}
    if(G.navS){const nv=G.navS;if(G.t-nv.t>0.5){if(dist(nv.x,nv.y,p.x,p.y)<6)nv.stuck=G.t+1.6;nv.x=p.x;nv.y=p.y;nv.t=G.t}}
    return{mx:Math.cos(a),my:Math.sin(a)}}}
  if(!G.noDodge)for(const e of G.enemies){if(e.state==="wind"&&e.tele&&e.tele.k==="line"){const a=Math.atan2(p.y-e.y,p.x-e.x);if(Math.abs(angDiff(e.lock,a))<0.4&&dist(p.x,p.y,e.x,e.y)<e.tele.len){return{mx:Math.cos(e.lock+Math.PI/2),my:Math.sin(e.lock+Math.PI/2)}}}}
  if(p.hp<p.maxhp*0.25&&S.potHP<=0){const a=Math.atan2(W.camp.y-p.y,W.camp.x-p.x);return{mx:Math.cos(a),my:Math.sin(a)}}
  const step=curMap().quest[S.qs[S.map]];
  const pref=step&&(step.t==='kill'||step.t==='collect')?step.e:null;
  const pf=playerField();const pd=e=>{const v=pf[Math.floor(e.y/T)*MW+Math.floor(e.x/T)];return v<0?(dist(e.x,e.y,p.x,p.y)<90?0:99):v};
  let t=null;if(pref)t=nearestEnemy(p.x,p.y,560,e=>e.type===pref&&!e.boss&&pd(e)<=16);if(!t)t=nearestEnemy(p.x,p.y,440,e=>(!G.boss||e.boss||dist(e.x,e.y,p.x,p.y)<200)&&pd(e)<=12);if(G.boss&&!G.boss.dead)t=G.boss;
  if(t){G.autoAtk=true;G.lastTarget=t;
    const near=enemiesIn(p.x,p.y,150).length;
    for(let i=2;i>=0;i--){if(!canCast(i))continue;const sk=p.cls.skills[i];if(sk.id==='guard'&&p.hp>p.maxhp*0.7)continue;if(i>0&&near<2&&!t.boss&&!t.elite)continue;castSkill(i);break}
    const C=p.cls.atk;const d=dist(p.x,p.y,t.x,t.y);
    if(C.type==='shot'&&d<130&&!t.boss){const a=Math.atan2(p.y-t.y,p.x-t.x);return{mx:Math.cos(a)*0.7,my:Math.sin(a)*0.7}}
    if(d>C.range+t.r-4||(C.type==='shot'&&!losClear(W,p.x,p.y,t.x,t.y))){const nd=navTo(t.x,t.y);return{mx:nd[0],my:nd[1]}}
    return{mx:0,my:0}}
  const q=questTarget();if(q){if(dist(p.x,p.y,q.x,q.y)>90){const d=navTo(q.x,q.y);return{mx:d[0],my:d[1]}}
    // tới nơi: đi lang thang quanh đó tìm quái
    if(!G.wander||G.t-G.wander.t>7||dist(p.x,p.y,G.wander.x,G.wander.y)<60){for(let k=0;k<20;k++){const i=pick(W.spawnTiles),x=(i%MW+.5)*T,y=(((i/MW)|0)+.5)*T;if(dist(x,y,q.x,q.y)<450){G.wander={x,y,t:G.t};break}}}
    if(G.wander){const d=navTo(G.wander.x,G.wander.y);return{mx:d[0],my:d[1]}}}
  return{mx:0,my:0}
}
function questTarget(){
  const S=G.save,W=G.W,M=curMap(),step=M.quest[S.qs[S.map]],p=G.p;
  if(!step)return{x:W.npcs[3].x,y:W.npcs[3].y,label:'Xa Phu'};
  if(step.t==='boss')return{x:W.arena.x,y:W.arena.y,label:M.quest[3].txt};
  const want=step.t==='elite'?(e=>e.elite):(e=>e.type===step.e);
  const e=nearestEnemy(p.x,p.y,1100,want);if(e)return{x:e.x,y:e.y,label:e.name,e};
  const lv=M.lv,f=clamp((S.lvl-lv[0]-lvOffset()+lvOffset())/(lv[1]-lv[0]),0.18,0.85);const pts=W.pathPts;const best=pts[Math.floor(pts.length*f)];
  return{x:best.x,y:best.y,label:'Khám phá'};
}

/* lớp trang trí khi tung chiêu: tên chiêu, chớp màn hình, bụi, vệt */
function skillVfx(sk,i,aim,tx,ty){
  const p=G.p,C=p.cls.color;
  G.floats.push({x:p.x,y:p.y-98,txt:sk.name,col:i===2?'#ffd98a':'#fff1d0',size:i===2?26:18,life:1.15,vy:-26,skill:1});
  if(i===2){G.flash={col:C,t:0.4,d:0.4};G.shake=Math.max(G.shake,6);G.fx.push({k:'flash',x:p.x,y:p.y-20,r:150,col:C,life:0.4,max:0.4},{k:'pillar',x:p.x,y:p.y,w:28,h:360,col:C,life:0.7,max:0.7})}
  const hx=p.x+Math.cos(aim)*18,hy=p.y-24+Math.sin(aim)*10;
  switch(sk.id){
    case'wave':case'tri':case'chain':G.fx.push({k:'flash',x:hx,y:hy,r:40,col:sk.id==='chain'?'#9fc4ff':C,life:0.2,max:0.2},{k:'glint',x:hx,y:hy,s:30,a:aim,col:C,life:0.2,max:0.2});break;
    case'spin':case'sweep':pushDust(p.x,p.y,10,90);break;
    case'leap':pushDust(p.x,p.y,8,40);break;
    case'lunge':case'shadow':{const len=sk.id==='lunge'?190:190;G.fx.push({k:'streak',x1:p.x,y1:p.y-20,x2:p.x+Math.cos(aim)*len,y2:p.y-20+Math.sin(aim)*len,w:14,col:sk.id==='shadow'?'#a066e0':C,life:0.3,max:0.3});pushDust(p.x,p.y,6,30);break}
    case'flurry':for(let k=0;k<4;k++)G.fx.push({k:'glint',x:p.x+Math.cos(aim)*rand(40,90),y:p.y-20+Math.sin(aim)*rand(20,60)+rand(-20,20),s:22,a:rand(-1,1),col:C,life:0.3,max:0.3,delay:k*0.1});break;
    case'guard':G.fx.push({k:'pillar',x:p.x,y:p.y,w:40,h:200,col:'#ffd23a',life:0.6,max:0.6});break;
    case'wheel':G.fx.push({k:'flash',x:p.x,y:p.y-14,r:110,col:'#ff7a2a',life:0.35,max:0.35});break;
    case'arrowrain':G.fx.push({k:'flash',x:tx,y:ty,r:90,col:'#fff3c8',life:0.3,max:0.3});break;
  }
}
