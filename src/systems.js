/* ============ NGOẠI HÌNH THEO TRANG BỊ, BỘ ĐỒ, THÚ CƯỠI, Ổ QUÁI, QUÁI TRIỀU, RƯƠNG BÁU ============ */
const SET_NAMES=['','Bộ Sắt','Bộ Thép','Bộ Kim Giáp','Bộ Ngọc Giáp','Bộ Long Giáp'];
function setInfo(){const S=G.save;let n=0,minT=9;for(const sl of SLOTS){const it=S.equip[sl];if(!it)continue;n++;minT=Math.min(minT,itemTier(it))}
  if(n<6||minT<1)return null;return{tier:minT,name:SET_NAMES[minT],atkp:4*minT,hpp:5*minT,def:6*minT}}
function updateLook(){
  const p=G.p,S=G.save;if(!p)return;const L=Object.assign({},LOOKS[S.cls]);const e=S.equip;let enh=0;
  const T=it=>it?itemTier(it):-1;
  if(e.vk){const t=T(e.vk),M=TIERMAT[t];L.wc=M.m;L.wTier=t;L.wTrim=M.trim;enh+=e.vk.enh}
  if(e.ao){const t=T(e.ao),M=TIERMAT[t];enh+=e.ao.enh;
    if(L.armor==='lamellar')L.plate=t>=3?M.trim:M.m;else if(t>=2)L.ov=t>=4?M.trim:M.m;
    if(t>=3){L.pauld=M.trim;L.pauldB=shade(M.m,-0.1)}if(t>=4&&!L.cape)L.cape=M.cloth;if(t>=5){L.cape='#a3261a';L.ovDisc=M.gem}}
  if(e.mu){const t=T(e.mu),M=TIERMAT[t];enh+=e.mu.enh;L.helmT=t;
    if(['plume','helm','cap','conical'].includes(L.hat)&&t>=1)L.hatC=t>=3?M.trim:M.m;
    if(L.hat==='topknot'&&t>=3)L.band=M.trim;if(L.hat==='mask'&&t>=3)L.scarf=t>=5?'#ff4a2a':L.scarf}
  if(e.dai){const t=T(e.dai),M=TIERMAT[t];enh+=e.dai.enh;if(t>=3)L.sash=shade(M.trim,-0.15);L.buckle=M.trim;if(t>=4)L.buckleGem=M.gem}
  if(e.giay){const t=T(e.giay),M=TIERMAT[t];enh+=e.giay.enh;if(t>=2)L.boots=t>=3?shade(M.m,-0.4):'#3a2414';if(t>=3)L.greave=M.m}
  if(e.boi){const t=T(e.boi),M=TIERMAT[t];enh+=e.boi.enh;if(t>=1){L.pend=t>=4?(M.jade||'#5fc79a'):t>=3?'#e89a2a':'#e8e2d6';if(t>=5)L.pendGlow='#ffcf5a'}}
  p.look=L;const w=e.vk;p.glow=!w?0:w.enh>=13?3:w.enh>=10?2:w.enh>=7?1:0;
  const si=setInfo();p.set=si;p.enhSum=enh;
  p.auraLv=Math.max(enh>=66?3:enh>=45?2:enh>=24?1:0,si?(si.tier>=5?3:si.tier>=4?2:si.tier>=3?1:0):0);
  G._ghosts={};
}
function applyExtra(st){
  const si=setInfo();if(si){st.atkp+=si.atkp;st.hpp+=si.hpp;st.def*=1+si.def/100}
  const m=ridingMount();if(m){const lv=G.save.mounts[m.id].lv,k=1+0.08*(lv-1);st.spd+=m.spd*k;for(const key in m.bon){if(key==='def')st.def*=1+m.bon.def*k/100;else st[key]=(st[key]||0)+m.bon[key]*k}}
}
/* hào quang dưới chân theo tổng cấp rèn / bộ đồ */
function drawAura(p){const lv=p.auraLv||0;if(!lv)return;const col=['','#62b4ff','#ffc53d','#ff5b3d'][lv];
  cx.save();cx.translate(p.x,p.y);cx.scale(1,0.36);
  additive(()=>{cx.globalAlpha=0.55;cx.strokeStyle=col;cx.lineWidth=2.2;cx.beginPath();cx.arc(0,0,34,0,TAU);cx.stroke();cx.beginPath();cx.arc(0,0,27,0,TAU);cx.stroke();
    cx.rotate(G.t*0.9);for(let i=0;i<8;i++){cx.rotate(TAU/8);cx.globalAlpha=0.75;cx.fillStyle=col;cx.beginPath();cx.moveTo(30,0);cx.lineTo(34,-3);cx.lineTo(38,0);cx.lineTo(34,3);cx.closePath();cx.fill()}
    glow(0,0,46,col,0.35)},'lighter');cx.restore();
  if(Math.random()<0.25*lv)addPart(p.x+rand(-22,22),p.y-rand(0,10),rand(-6,6),rand(-70,-40),rand(0.6,1),col,rand(1.5,2.6),-20,'c',1);
  if(lv>=3){// cánh ánh sáng
    cx.save();cx.translate(p.x-p.f*2,p.y-40);const fl=Math.sin(G.t*3)*0.12;additive(()=>{for(const s of[-1,1]){cx.save();cx.scale(s,1);cx.rotate(-0.3+fl*s);
      const gr=cx.createLinearGradient(0,0,46,-20);gr.addColorStop(0,'rgba(255,220,140,0.75)');gr.addColorStop(1,'rgba(255,90,40,0)');cx.fillStyle=gr;
      cx.beginPath();cx.moveTo(2,0);cx.quadraticCurveTo(26,-34,52,-26);cx.quadraticCurveTo(34,-14,44,-4);cx.quadraticCurveTo(24,-4,30,8);cx.quadraticCurveTo(14,4,2,6);cx.closePath();cx.globalAlpha=0.7;cx.fill();cx.restore()}},'lighter');cx.restore()}
}

/* ================= THÚ CƯỠI ================= */
const MOUNTS=[
 {id:'nau',name:'Ngựa Nâu',body:'horse',c:{coat:'#8a5a32',dark:'#4a2e18',mane:'#2a1a10',blaze:'#f2e8d6',tack:'#8a2a1e',trim:'#c9a24e'},spd:22,bon:{},price:150,lv:2,d:'Ngựa thồ của dân làng Phong Châu. Rẻ, chạy nhanh hơn đi bộ nhiều.'},
 {id:'o',name:'Ngựa Ô',body:'horse',c:{coat:'#2c2628',dark:'#121012',mane:'#0a0808',tack:'#2f4a6b',trim:'#c9a24e'},spd:30,bon:{atkp:4},price:2500,lv:7,d:'Chiến mã đen tuyền. Tặng miễn phí khi hạ Ngư Tinh.'},
 {id:'bach',name:'Bạch Mã',body:'horse',c:{coat:'#efece4',dark:'#b0a898',mane:'#fbfaf6',tack:'#c8361f',trim:'#f0c040'},spd:36,bon:{hpp:8,atkp:5},price:8000,lv:12,d:'Ngựa trắng của tướng lĩnh, tăng công và sinh lực.'},
 {id:'ho',name:'Hổ Chúa',body:'tiger',c:{coat:'#e08c2c',dark:'#2b1a10',belly:'#f6e8cf',tack:'#3a2a52',trim:'#c9a24e'},spd:32,bon:{atkp:10,crit:4},skill:'roar',price:20000,lv:18,d:'Chúa sơn lâm. Khi cưỡi, mỗi 7 giây gầm làm choáng quái xung quanh.'},
 {id:'voi',name:'Voi Chiến',body:'elephant',c:{coat:'#8d8b8f',dark:'#4a4850',tack:'#a3261a',trim:'#f0c040'},spd:16,bon:{hpp:25,def:20},skill:'stomp',price:45000,lv:24,d:'Voi trận thời Hai Bà Trưng. Mỗi 5 giây giẫm đất, gây sát thương quanh mình.'},
 {id:'giong',name:'Ngựa Sắt Thánh Gióng',body:'iron',c:{coat:'#4c525c',dark:'#23262d',mane:'#ff8a2a',tack:'#7a1f14',trim:'#f0c040'},spd:45,bon:{atkp:15,hpp:12},skill:'fire',frag:8,lv:20,d:'Ngựa sắt phun lửa của Thánh Gióng. Ghép từ 8 Mảnh Ngựa Sắt rơi từ boss và quái tinh anh.'},
];
const MOUNT_BY={};MOUNTS.forEach(m=>MOUNT_BY[m.id]=m);
const SKILL_NAME={roar:'Hổ Gầm',stomp:'Voi Giẫm',fire:'Lửa Thánh Gióng'};
const mountNeed=lv=>Math.round(30*Math.pow(lv,1.6));
function ensureMountSave(){const S=G.save;if(!S.mounts)S.mounts={};if(S.frag==null)S.frag=0;if(S.horseT==null)S.horseT=0}
function ridingMount(){const S=G.save;if(!S||!S.riding||!S.mounts||!S.mounts[S.riding])return null;return MOUNT_BY[S.riding]}
function toggleRide(){const S=G.save;ensureMountSave();
  if(S.riding){S.riding=null;UI.toast('Đã xuống thú cưỡi')}
  else{const id=S.lastMount&&S.mounts[S.lastMount]?S.lastMount:Object.keys(S.mounts)[0];if(!id){UI.toast('Chưa có thú cưỡi. Gặp Mã Phu ở trại để mua.','warn');return}
    S.riding=id;S.lastMount=id;const p=G.p;UI.toast('Cưỡi '+MOUNT_BY[id].name);pushDust(p.x,p.y,10,40);G.fx.push({k:'flash',x:p.x,y:p.y-20,r:60,col:'#ffe7a8',life:0.3,max:0.3});Audio_.play('dash')}
  const hpR=G.p.hp/G.p.maxhp;recalc();G.p.hp=Math.round(G.p.maxhp*hpR);G.mountCd=1.5;saveGame()}
function giveMount(id,why){const S=G.save;ensureMountSave();if(S.mounts[id])return false;S.tut.mount=true;S.mounts[id]={lv:1,exp:0};UI.toast((why||'Nhận thú cưỡi: ')+MOUNT_BY[id].name,'quest');Audio_.play('win');saveGame();return true}
function mountGainExp(v){const m=ridingMount();if(!m)return;const ms=G.save.mounts[m.id];if(ms.lv>=10)return;ms.exp+=v;
  while(ms.lv<10&&ms.exp>=mountNeed(ms.lv)){ms.exp-=mountNeed(ms.lv);ms.lv++;UI.toast(`${m.name} lên cấp ${ms.lv}`,'skill');recalc()}}
function updateMount(dt){
  const m=ridingMount(),p=G.p;if(!m)return;
  if(p.moving&&Math.random()<0.35)addPart(p.x-p.f*rand(10,24),p.y-2,-p.f*rand(10,40),rand(-30,-5),rand(0.3,0.6),m.body==='iron'?'#ff8a2a':'rgba(190,165,120,0.5)',rand(3,6),m.body==='iron'?-30:30,'c',m.body==='iron'?1:0);
  if(!m.skill)return;G.mountCd=(G.mountCd||0)-dt;if(G.mountCd>0)return;
  const lv=G.save.mounts[m.id].lv,k=1+0.1*(lv-1);
  if(m.skill==='roar'){const es=enemiesIn(p.x,p.y,170);if(!es.length)return;G.mountCd=7;es.forEach(e=>hurtEnemy(e,p.atk*0.6*k,{stun:1.3,noStagger:1}));
    G.fx.push({k:'ring',x:p.x,y:p.y,r:20,r2:180,life:0.5,max:0.5,col:'#ffc53d'},{k:'flash',x:p.x+p.f*30,y:p.y-30,r:70,col:'#ffc53d',life:0.3,max:0.3});Audio_.play('roar');G.shake=6;callout(SKILL_NAME.roar,'#ffd98a')}
  if(m.skill==='stomp'){const es=enemiesIn(p.x,p.y,145);if(!es.length)return;G.mountCd=5;es.forEach(e=>hurtEnemy(e,p.atk*1.4*k,{kb:180}));
    G.fx.push({k:'ring',x:p.x,y:p.y,r:20,r2:150,life:0.45,max:0.45,col:'#c9a24e'});pushCrack(p.x,p.y,120,9);pushDust(p.x,p.y,16,120);G.shake=10;G.hitstop=0.05;Audio_.play('slam');callout(SKILL_NAME.stomp,'#ffd98a')}
  if(m.skill==='fire'){const t=nearestEnemy(p.x,p.y,190);if(!t)return;G.mountCd=4;const a0=Math.atan2(t.y-p.y,t.x-p.x);
    for(let i=-3;i<=3;i++){const a=a0+i*0.13;G.projs.push({x:p.x+Math.cos(a)*30,y:p.y-34,vx:Math.cos(a)*460,vy:Math.sin(a)*460,r:16,dmg:p.atk*1.5*k,from:'p',pierce:4,life:0.42,kind:'fire',hit:new Set()})}
    G.fx.push({k:'flash',x:p.x+Math.cos(a0)*36,y:p.y-34,r:60,col:'#ff7a2a',life:0.3,max:0.3});Audio_.play('boom');callout(SKILL_NAME.fire,'#ffb347')}
}
/* ---- vẽ thú cưỡi: trả về điểm yên (so với gốc chân) ---- */
function mleg(g,x,y0,len,ang,w,col,hoof){const kx=x+Math.sin(ang)*len*0.5,ky=y0+Math.cos(ang)*len*0.5;const k2=ang<0?ang*0.4:ang*1.6;
  const fx=kx+Math.sin(k2)*len*0.5,fy=Math.min(0,ky+Math.cos(k2)*len*0.5);limb(g,[x,y0,kx,ky,fx,fy],w,col);
  g.fillStyle=hoof;g.strokeStyle=OL;g.lineWidth=1;g.beginPath();g.ellipse(fx+1,fy,w*0.62,w*0.42,0,0,TAU);g.fill();g.stroke()}
function drawMount(g,m,o){
  const c=m.c,w=o.walk||0,mv=o.moving?1:0,t=o.t||0;g.save();g.translate(o.x,o.y);
  const big=m.body==='elephant'?1.35:1.3;g.fillStyle='rgba(0,0,0,0.3)';g.beginPath();g.ellipse(0,0,30*big,7*big,0,0,TAU);g.fill();
  g.scale(o.f||1,1);const MS=m.body==='elephant'?1:1.32;g.scale(MS,MS);g.lineJoin='round';g.lineCap='round';let seat={x:0,y:-38};
  const bob=mv?Math.sin(w*2)*1.6:Math.sin(t*2)*0.5;
  if(m.body==='horse'||m.body==='iron'){const iron=m.body==='iron';const coat=c.coat;
    g.translate(0,-bob);
    // đuôi
    if(iron){g.save();g.globalCompositeOperation='lighter';for(let i=0;i<6;i++){g.strokeStyle=i%2?'#ff8a2a':'#ffd23a';g.lineWidth=3-i*0.3;g.globalAlpha=0.75;g.beginPath();g.moveTo(-22,-32);g.quadraticCurveTo(-34-i*2,-30+Math.sin(t*9+i)*4,-38-i*2,-14+Math.sin(t*7+i)*5);g.stroke()}g.restore()}
    else{g.fillStyle=c.mane;g.strokeStyle=OL;g.lineWidth=1.2;g.beginPath();g.moveTo(-21,-33);g.quadraticCurveTo(-34,-30+Math.sin(t*4)*2-mv*4,-34+Math.sin(t*5)*2-mv*6,-12);g.quadraticCurveTo(-28,-20,-20,-27);g.closePath();g.fill();g.stroke()}
    // chân xa
    const ph=mv?w:0,sw=0.55*mv;
    mleg(g,-12,-24,24,Math.sin(ph+1.6)*sw,5,shade(coat,-0.3),'#1a1410');mleg(g,15,-24,24,Math.sin(ph+3.1)*sw,5,shade(coat,-0.3),'#1a1410');
    // thân
    g.fillStyle=_lg(g,0,-40,0,-18,iron?metalSt(coat):[[0,shade(coat,0.22)],[0.55,coat],[1,shade(coat,-0.35)]]);g.strokeStyle=OL;g.lineWidth=1.5;
    g.beginPath();g.ellipse(0,-29,23,10.5,0,0,TAU);g.fill();g.stroke();
    g.beginPath();g.arc(15,-28,9.5,0,TAU);g.fill();
    // cổ + đầu
    g.beginPath();g.moveTo(12,-36);g.quadraticCurveTo(18,-50,25,-55);g.lineTo(31,-50);g.quadraticCurveTo(27,-38,23,-24);g.closePath();g.fill();g.stroke();
    g.beginPath();g.moveTo(24,-56);g.quadraticCurveTo(30,-58,40,-48);g.quadraticCurveTo(42,-44,38,-42);g.lineTo(30,-44);g.quadraticCurveTo(26,-46,24,-50);g.closePath();g.fill();g.stroke();
    g.beginPath();g.moveTo(25,-55);g.lineTo(26,-61);g.lineTo(29,-56);g.closePath();g.fill();g.stroke();
    if(c.blaze){g.fillStyle=c.blaze;g.beginPath();g.moveTo(31,-55);g.quadraticCurveTo(37,-50,39,-45);g.lineTo(36,-46);g.quadraticCurveTo(33,-50,30,-53);g.fill()}
    if(iron){g.strokeStyle='rgba(0,0,0,0.45)';g.lineWidth=0.8;for(const x of[-14,-6,2,10]){g.beginPath();g.moveTo(x,-38);g.quadraticCurveTo(x+2,-29,x,-20);g.stroke()}
      g.save();g.globalCompositeOperation='lighter';g.fillStyle='#ffb347';g.beginPath();g.arc(32,-50,1.8,0,TAU);g.fill();glowAt(g,32,-50,7,'#ff8a2a');g.restore()}
    else{g.fillStyle='#120c08';g.beginPath();g.arc(31.5,-50,1.2,0,TAU);g.fill()}
    g.strokeStyle=c.trim;g.lineWidth=1.1;g.beginPath();g.moveTo(34,-52);g.quadraticCurveTo(39,-48,36,-43);g.moveTo(27,-55);g.lineTo(33,-51);g.stroke();g.strokeStyle='#3a2414';g.lineWidth=0.9;g.beginPath();g.moveTo(37,-44);g.quadraticCurveTo(20,-36,9,-41);g.stroke();
    // bờm
    if(iron){g.save();g.globalCompositeOperation='lighter';for(let i=0;i<7;i++){const x=24-i*2.4,y=-54+i*3;g.strokeStyle=i%2?'#ff7a1a':'#ffd23a';g.lineWidth=2.6;g.globalAlpha=0.8;g.beginPath();g.moveTo(x,y);g.quadraticCurveTo(x-6,y-6+Math.sin(t*10+i)*2,x-10-mv*3,y-3+Math.sin(t*8+i)*3);g.stroke()}g.restore()}
    else{g.fillStyle=c.mane;for(let i=0;i<6;i++){const x=24-i*2.3,y=-55+i*3.2;g.beginPath();g.moveTo(x,y);g.quadraticCurveTo(x-6,y-3+Math.sin(t*5+i),x-8-mv*3,y+3);g.lineTo(x-1,y+2);g.closePath();g.fill()}}
    // yên và chăn
    g.fillStyle=c.tack;g.strokeStyle=OL;g.lineWidth=1.1;g.beginPath();g.moveTo(-9,-39);g.lineTo(9,-39);g.lineTo(10,-26);g.lineTo(-10,-26);g.closePath();g.fill();g.stroke();
    g.fillStyle=c.trim;for(let x=-9;x<=9;x+=3){g.beginPath();g.moveTo(x,-26);g.lineTo(x+1.5,-23);g.lineTo(x+3,-26);g.fill()}
    g.fillStyle='#2a1a10';g.beginPath();g.moveTo(-8,-40);g.quadraticCurveTo(-2,-43,6,-40);g.lineTo(7,-37);g.lineTo(-8,-37);g.closePath();g.fill();
    g.strokeStyle='#8a8e94';g.lineWidth=1;g.beginPath();g.moveTo(1,-37);g.lineTo(2,-22);g.stroke();
    // chân gần
    mleg(g,-8,-24,24,Math.sin(ph)*sw,5.4,coat,'#1a1410');mleg(g,19,-24,24,Math.sin(ph+4.6)*sw,5.4,coat,'#1a1410');
    if(iron&&mv&&Math.random()<0.5)addPart(o.x+rand(-14,18)*(o.f||1),o.y-2,rand(-20,20),rand(-50,-20),0.4,'#ff8a2a',rand(2,4),-20,'c',1);
    seat={x:-1,y:-40-bob};
  }
  else if(m.body==='tiger'){g.translate(0,-bob*0.6);const ph=mv?w:0,sw=0.5*mv;
    g.strokeStyle=c.coat;g.lineWidth=4;g.beginPath();g.moveTo(-22,-26);g.quadraticCurveTo(-34,-34+Math.sin(t*4)*3,-36,-20);g.stroke();g.strokeStyle=c.dark;g.lineWidth=4.2;g.beginPath();g.moveTo(-35,-24);g.lineTo(-36,-20);g.stroke();
    mleg(g,-13,-20,20,Math.sin(ph+1.6)*sw,6,shade(c.coat,-0.3),'#2a1a10');mleg(g,15,-20,20,Math.sin(ph+3.1)*sw,6,shade(c.coat,-0.3),'#2a1a10');
    g.fillStyle=_lg(g,0,-34,0,-14,[[0,shade(c.coat,0.2)],[0.6,c.coat],[1,shade(c.coat,-0.3)]]);g.strokeStyle=OL;g.lineWidth=1.5;g.beginPath();g.ellipse(0,-25,25,9.5,0,0,TAU);g.fill();g.stroke();
    g.fillStyle=c.belly;g.beginPath();g.ellipse(2,-18.5,17,3.4,0,0,TAU);g.fill();
    g.strokeStyle=c.dark;g.lineWidth=2.4;for(let i=-3;i<=3;i++){g.beginPath();g.moveTo(i*6,-34);g.quadraticCurveTo(i*6+3,-28,i*6+1,-22);g.stroke()}
    g.fillStyle=_rg(g,24,-30,1,11,[[0,shade(c.coat,0.25)],[1,c.coat]],-2,-3);g.strokeStyle=OL;g.lineWidth=1.4;g.beginPath();g.arc(25,-30,10,0,TAU);g.fill();g.stroke();
    g.fillStyle=c.coat;g.beginPath();g.arc(19,-39,3.2,0,TAU);g.fill();g.stroke();g.beginPath();g.arc(28,-40,3.2,0,TAU);g.fill();g.stroke();
    g.fillStyle=c.belly;g.beginPath();g.ellipse(31,-26,6,4.2,0,0,TAU);g.fill();g.fillStyle='#2a1a10';g.beginPath();g.ellipse(35,-28,1.6,1.2,0,0,TAU);g.fill();
    g.fillStyle='#ffd23a';g.beginPath();g.ellipse(28,-32,2,1.5,0,0,TAU);g.fill();g.fillStyle='#120c08';g.beginPath();g.arc(28.5,-32,0.9,0,TAU);g.fill();
    g.strokeStyle=c.dark;g.lineWidth=1.4;g.beginPath();g.moveTo(22,-37);g.lineTo(24,-33);g.moveTo(26,-38);g.lineTo(26,-34);g.stroke();
    g.fillStyle=c.tack;g.strokeStyle=OL;g.lineWidth=1.1;g.beginPath();g.moveTo(-10,-34);g.lineTo(8,-34);g.lineTo(9,-21);g.lineTo(-11,-21);g.closePath();g.fill();g.stroke();
    g.fillStyle=c.trim;g.fillRect(-11,-23,20,2);g.fillStyle='#2a1a10';g.beginPath();g.moveTo(-8,-35);g.quadraticCurveTo(-2,-38,6,-35);g.lineTo(6,-32);g.lineTo(-8,-32);g.closePath();g.fill();
    mleg(g,-8,-20,20,Math.sin(ph)*sw,6.4,c.coat,'#2a1a10');mleg(g,19,-20,20,Math.sin(ph+4.6)*sw,6.4,c.coat,'#2a1a10');
    seat={x:-1,y:-35-bob*0.6};
  }
  else if(m.body==='elephant'){g.scale(1.35,1.35);const ph=mv?w*0.7:0,sw=0.3*mv;
    const ear=Math.sin(t*2.4)*0.15;
    mleg(g,-14,-26,26,Math.sin(ph+1.6)*sw,9,shade(c.coat,-0.25),shade(c.coat,-0.5));mleg(g,14,-26,26,Math.sin(ph+3.1)*sw,9,shade(c.coat,-0.25),shade(c.coat,-0.5));
    g.strokeStyle=c.coat;g.lineWidth=2;g.beginPath();g.moveTo(-26,-36);g.quadraticCurveTo(-31,-28+Math.sin(t*3)*2,-30,-20);g.stroke();
    g.fillStyle=_lg(g,0,-56,0,-22,[[0,shade(c.coat,0.2)],[0.6,c.coat],[1,shade(c.coat,-0.35)]]);g.strokeStyle=OL;g.lineWidth=1.5;g.beginPath();g.ellipse(-2,-38,28,17,0,0,TAU);g.fill();g.stroke();
    g.strokeStyle='rgba(0,0,0,0.2)';g.lineWidth=0.8;for(const x of[-14,-4,6]){g.beginPath();g.moveTo(x,-26);g.quadraticCurveTo(x+2,-34,x,-46);g.stroke()}
    // đầu, tai, vòi, ngà
    g.fillStyle=c.coat;g.strokeStyle=OL;g.lineWidth=1.4;g.beginPath();g.arc(25,-42,12,0,TAU);g.fill();g.stroke();
    g.save();g.translate(19,-44);g.rotate(ear);g.fillStyle=shade(c.coat,-0.12);g.beginPath();g.moveTo(0,-8);g.quadraticCurveTo(-14,-12,-15,2);g.quadraticCurveTo(-12,14,0,8);g.closePath();g.fill();g.stroke();
    g.fillStyle='rgba(200,130,130,0.35)';g.beginPath();g.ellipse(-6,1,5,6,0,0,TAU);g.fill();g.restore();
    const ts=Math.sin(t*2+w*0.5)*0.25;g.strokeStyle=OL;g.lineWidth=7;g.beginPath();g.moveTo(33,-40);g.quadraticCurveTo(42,-30,38+ts*10,-14);g.quadraticCurveTo(37+ts*12,-8,42+ts*12,-8);g.stroke();
    g.strokeStyle=c.coat;g.lineWidth=5;g.stroke();
    g.fillStyle='#f4efe2';g.strokeStyle=OL;g.lineWidth=1;g.beginPath();g.moveTo(30,-34);g.quadraticCurveTo(38,-28,42,-32);g.lineTo(40,-34);g.quadraticCurveTo(36,-32,31,-37);g.closePath();g.fill();g.stroke();
    g.fillStyle='#120c08';g.beginPath();g.arc(28,-46,1.4,0,TAU);g.fill();
    // khăn trán + bành voi
    g.fillStyle=c.tack;g.beginPath();g.moveTo(22,-54);g.quadraticCurveTo(30,-56,34,-48);g.lineTo(30,-40);g.quadraticCurveTo(26,-46,20,-46);g.closePath();g.fill();g.stroke();g.fillStyle=c.trim;g.beginPath();g.arc(28,-49,1.8,0,TAU);g.fill();
    g.fillStyle=c.tack;g.beginPath();g.moveTo(-20,-52);g.lineTo(14,-52);g.lineTo(18,-34);g.lineTo(-24,-34);g.closePath();g.fill();g.stroke();
    g.fillStyle=c.trim;for(let x=-22;x<=16;x+=4){g.beginPath();g.moveTo(x,-34);g.lineTo(x+2,-30);g.lineTo(x+4,-34);g.fill()}
    g.fillStyle=_lg(g,-16,-60,12,-52,goldSt(c.trim));g.beginPath();g.roundRect(-16,-60,28,8,2);g.fill();g.stroke();
    g.strokeStyle='#5a3a20';g.lineWidth=1.6;g.beginPath();g.moveTo(-14,-60);g.lineTo(-14,-80);g.moveTo(10,-60);g.lineTo(10,-80);g.stroke();
    g.fillStyle='#c8361f';g.beginPath();g.moveTo(-18,-80);g.quadraticCurveTo(-2,-90,14,-80);g.lineTo(12,-77);g.lineTo(-16,-77);g.closePath();g.fill();g.stroke();
    mleg(g,-8,-26,26,Math.sin(ph)*sw,9.6,c.coat,shade(c.coat,-0.5));mleg(g,19,-26,26,Math.sin(ph+4.6)*sw,9.6,c.coat,shade(c.coat,-0.5));
    seat={x:-2*1.35,y:-60*1.35};
  }
  g.restore();return{x:seat.x*MS,y:seat.y*MS};
}
function glowAt(g,x,y,r,col){const gr=g.createRadialGradient(x,y,0,x,y,r);gr.addColorStop(0,col);gr.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=gr;g.beginPath();g.arc(x,y,r,0,TAU);g.fill()}

/* ================= Ổ QUÁI ================= */
function initCamps(){
  const W=G.W;W.camps=[];const pts=[];
  for(let tries=0;tries<400&&pts.length<6;tries++){const i=pick(W.spawnTiles),x=(i%MW+.5)*T,y=(((i/MW)|0)+.5)*T;const d=dist(x,y,W.camp.x,W.camp.y)/W.campToArena;
    if(d<0.18||d>0.95)continue;if(pts.some(q=>dist(q.x,q.y,x,y)<520))continue;if(dist(x,y,W.arena.x,W.arena.y)<W.arena.r+250)continue;pts.push({x,y})}
  pts.forEach((q,k)=>{W.camps.push({id:k,x:q.x,y:q.y,alive:false,respawn:0,left:0});const o={x:q.x,y:q.y-14,k:'tent',v:W.mi,cr:0,s:1};W.objs.push(o);const gi=Math.floor(o.y/T)*MW+Math.floor(o.x/T);(W.ogrid[gi]||(W.ogrid[gi]=[])).push(o)});
  W.camps.forEach(c=>spawnCamp(c));
}
function spawnCamp(c){const n=randi(6,8);const lv=enemyLevelAt(c.x,c.y)+1;c.left=n;c.alive=true;
  for(let k=0;k<n;k++){const a=k/n*TAU+Math.random()*0.4,r=k===0?0:rand(50,110);let x=c.x+Math.cos(a)*r,y=c.y+Math.sin(a)*r*0.8;if(isSolidPt(G.W,x,y)){x=c.x;y=c.y}
    const e=spawnEnemy(k===0?pickType():pickType(),x,y,lv,k===0);e.camp=c.id;e.hx=c.x;e.hy=c.y}}
function campMemberDied(e){const c=G.W.camps&&G.W.camps[e.camp];if(!c)return;c.left--;if(c.left<=0){c.alive=false;c.respawn=80;dropChest(c.x,c.y,0.7,'Phá ổ quái');}}
/* ================= QUÁI TRIỀU ================= */
function updateHorde(dt){
  const S=G.save,p=G.p;if(G.hordeT==null)G.hordeT=rand(70,95);
  if(G.horde){const h=G.horde;h.t-=dt;
    if(h.waves>0){h.waveT-=dt;if(h.waveT<=0){h.waves--;h.waveT=6;spawnWave(h)}}
    if(h.kill>=h.need){G.horde=null;G.hordeT=rand(100,140);const gold=Math.round(40*S.lvl*(1+S.map*0.3));S.gold+=gold;gainExp(need(S.lvl)*0.18);S.score+=800*(S.map+1)*(1+S.ng);
      dropChest(p.x+p.f*40,p.y,1.0,'Đẩy lùi quái triều');UI.toast(`Đẩy lùi quái triều! +${fmt(gold)} vàng`,'quest');Audio_.play('win')}
    else if(h.t<=0){G.horde=null;G.hordeT=rand(90,120);UI.toast('Quái triều đã rút. Lần sau nhanh tay hơn.','warn')}
    return}
  if(G.boss||p.inCamp||S.lvl<3||G.state!=='play')return;
  G.hordeT-=dt;if(G.hordeT>0)return;
  const n=16+Math.min(10,S.map*2);G.horde={kill:0,need:n,t:55,waves:3,waveT:0,per:Math.ceil(n/3)+2};
  UI.toast(`Quái triều kéo tới! Hạ ${n} quái trong 55 giây`,'boss');Audio_.play('roar');G.shake=8;
}
function spawnWave(h){const p=G.p,W=G.W;let made=0;for(let k=0;k<40&&made<h.per;k++){const a=Math.random()*TAU,r=rand(300,430);const x=p.x+Math.cos(a)*r,y=p.y+Math.sin(a)*r;
  const ti=Math.floor(y/T)*MW+Math.floor(x/T);if(!W.walk[ti])continue;if(inTownPt(x,y)||dist(x,y,W.camp.x,W.camp.y)<G.campR+60)continue;
  const e=spawnEnemy(pickType(),x,y,enemyLevelAt(x,y),Math.random()<0.08);e.horde=1;e.state='chase';made++;for(let j=0;j<5;j++)addPart(x,y-10,rand(-60,60),rand(-90,-20),0.5,'#c58bff',3,100)}}
/* ================= RƯƠNG BÁU ================= */
function dropChest(x,y,bonus,why){G.drops.push({x,y,vx:0,vy:0,z:30,vz:120,kind:'chest',val:{bonus,why},t:0,id:Math.random()});G.fx.push({k:'pillar',x,y,w:26,h:260,col:'#ffd23a',life:1.2,max:1.2})}
function openChest(d){const S=G.save,p=G.p,b=d.val.bonus,lv=enemyLevelAt(d.x,d.y);
  for(let i=0;i<8;i++)dropAt(d.x,d.y,'gold',Math.round((lv*3+randi(2,8))*(1+p.goldB/100)));
  dropAt(d.x,d.y,'ore',randi(2,4));if(Math.random()<0.6)dropAt(d.x,d.y,'pot',Math.random()<0.6?'potHP':'potMP');
  const n=Math.random()<0.5?2:1;for(let i=0;i<n;i++)dropAt(d.x,d.y,'item',genItem(lv+1,Math.max(1,rollRarity(b))));
  if(Math.random()<0.12*b)dropAt(d.x,d.y,'frag',1);
  G.fx.push({k:'flash',x:d.x,y:d.y-10,r:80,col:'#ffd23a',life:0.4,max:0.4},{k:'ring',x:d.x,y:d.y,r:10,r2:90,life:0.5,max:0.5,col:'#ffd23a'});
  UI.toast((d.val.why?d.val.why+': ':'')+'mở rương báu!','quest');Audio_.play('loot',3);S.score+=300*(S.map+1)}
function drawChest(d,y){const open=false;cx.save();cx.translate(d.x,y);
  additive(()=>glow(0,-8,26+Math.sin(G.t*4)*3,'#ffd23a',0.45));
  cx.fillStyle=_lg(cx,0,-18,0,0,woodSt('#7a4a26'));cx.strokeStyle=OL;cx.lineWidth=1.2;cx.beginPath();cx.roundRect(-13,-14,26,14,2);cx.fill();cx.stroke();
  cx.fillStyle=_lg(cx,0,-24,0,-12,woodSt('#8a5a30'));cx.beginPath();cx.moveTo(-13,-14);cx.quadraticCurveTo(0,-26,13,-14);cx.closePath();cx.fill();cx.stroke();
  cx.fillStyle=_lg(cx,-2,0,2,0,goldSt('#e8b83a'));for(const x of[-9,7])cx.fillRect(x,-20,3,20);cx.fillRect(-13,-15,26,2.4);
  cx.fillStyle='#e8b83a';cx.beginPath();cx.roundRect(-3,-12,6,6,1);cx.fill();cx.stroke();cx.restore();
  if(Math.random()<0.2)addPart(d.x+rand(-12,12),y-rand(4,20),0,rand(-40,-20),0.6,'#ffe7a8',2,-10,'c',1)}

/* ================= CẬP NHẬT CHUNG ================= */
function updateSystems(dt){
  const W=G.W,p=G.p;updateMount(dt);updateHorde(dt);
  if(W.camps)for(const c of W.camps){if(c.alive)continue;c.respawn-=dt;if(c.respawn<=0&&dist(c.x,c.y,p.x,p.y)>760)spawnCamp(c)}
}

/* ================= BẢNG THÚ CƯỠI ================= */
Object.assign(UI,{
  p_mount(){const S=G.save;ensureMountSave();const cur=S.riding;
    let h=`<p class="hist" style="margin-bottom:10px">Cưỡi thú để chạy nhanh và nhận thêm chỉ số. Thú lên cấp khi bạn hạ quái lúc đang cưỡi. Mảnh Ngựa Sắt: <b style="color:var(--vang2)">${S.frag}/8</b>.</p>`;
    h+=MOUNTS.map(m=>{const own=S.mounts[m.id],k=own?1+0.08*(own.lv-1):1;
      const bon=[`+${Math.round(m.spd*k)}% tốc chạy`].concat(Object.keys(m.bon).map(key=>`+${Math.round(m.bon[key]*k)}${key==='crit'?'% chí mạng':key==='def'?'% thủ':key==='atkp'?'% công':'% sinh lực'}`)).join(', ');
      let act='';
      if(own)act=cur===m.id?`<button class="btn sec sm" data-down="1">Xuống</button>`:`<button class="btn sm" data-ride="${m.id}">Cưỡi</button>`;
      else if(m.frag)act=`<button class="btn sm" data-forge="${m.id}" ${S.frag<m.frag||S.lvl<m.lv?'disabled':''}>Ghép (${S.frag}/${m.frag})</button>`;
      else act=`<button class="btn sm" data-buy="${m.id}" ${S.gold<m.price||S.lvl<m.lv?'disabled':''}>${fmt(m.price)} vàng</button>`;
      const lvTxt=own?`cấp ${own.lv}/10${own.lv<10?` · ${Math.floor(own.exp)}/${mountNeed(own.lv)}`:''}`:`cần cấp ${m.lv}`;
      return`<div class="mnt${cur===m.id?' on':''}"><canvas data-m="${m.id}" width="240" height="180"></canvas><div><h5>${esc(m.name)} <span>· ${lvTxt}</span></h5><p>${esc(m.d)}</p><div class="meta">${bon}${m.skill?' · chiêu: '+SKILL_NAME[m.skill]:''}</div>
        ${own&&own.lv<10?`<button class="btn sec sm" data-train="${m.id}" style="margin-top:6px">Huấn luyện (${fmt(120*own.lv*own.lv)} vàng)</button>`:''}</div><div class="mact">${act}</div></div>`}).join('');
    return h},
  b_mount(body){const S=G.save;
    body.querySelectorAll('canvas[data-m]').forEach(c=>{const g=c.getContext('2d');g.setTransform(1,0,0,1,0,0);g.clearRect(0,0,240,180);const m=MOUNT_BY[c.dataset.m];g.save();g.translate(110,158);g.scale(m.body==='elephant'?1.25:1.8,m.body==='elephant'?1.25:1.8);
      const seat=drawMount(g,m,{x:0,y:0,f:1,t:1.2,walk:0,moving:false});if(S.mounts[m.id])drawHuman(g,{x:seat.x,y:seat.y+17,f:1,look:G.p.look,t:1,ride:1});g.restore();
      if(!S.mounts[m.id]){g.globalCompositeOperation='source-atop';g.fillStyle='rgba(20,12,8,0.55)';g.fillRect(0,0,240,180);g.globalCompositeOperation='source-over'}});
    body.querySelectorAll('[data-buy]').forEach(b=>b.onclick=()=>{const m=MOUNT_BY[b.dataset.buy];if(S.gold<m.price||S.lvl<m.lv)return;S.gold-=m.price;giveMount(m.id,'Đã mua ');S.riding=m.id;S.lastMount=m.id;recalc();this.render()});
    body.querySelectorAll('[data-forge]').forEach(b=>b.onclick=()=>{const m=MOUNT_BY[b.dataset.forge];if(S.frag<m.frag)return;S.frag-=m.frag;giveMount(m.id,'Ghép thành công ');S.riding=m.id;S.lastMount=m.id;recalc();this.render()});
    body.querySelectorAll('[data-ride]').forEach(b=>b.onclick=()=>{S.riding=null;S.lastMount=b.dataset.ride;toggleRide();this.render()});
    body.querySelectorAll('[data-down]').forEach(b=>b.onclick=()=>{toggleRide();this.render()});
    body.querySelectorAll('[data-train]').forEach(b=>b.onclick=()=>{const id=b.dataset.train,ms=S.mounts[id],c=120*ms.lv*ms.lv;if(S.gold<c){this.toast('Không đủ vàng');return}S.gold-=c;
      const keep=S.riding;S.riding=id;mountGainExp(mountNeed(ms.lv)*0.5);S.riding=keep;recalc();Audio_.play('level');this.render()})},
});
