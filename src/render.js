/* ============ VẼ KHUNG HÌNH ============ */
let cv,cx,DPR=1,VW=0,VH=0,vignette=null;
function setupCanvas(){
  cv=document.getElementById('cv');cx=cv.getContext('2d');resize();
  window.addEventListener('resize',resize);window.addEventListener('orientationchange',()=>setTimeout(resize,200));
}
function resize(){
  DPR=Math.min(G.dprCap||2,window.devicePixelRatio||1);VW=window.innerWidth;VH=window.innerHeight;
  cv.width=Math.round(VW*DPR);cv.height=Math.round(VH*DPR);cv.style.width=VW+'px';cv.style.height=VH+'px';
  G.cam.z=clamp(Math.min(VW,VH)/440,0.78,1.35);
  vignette=null;
  if(G.W)G.W.chunks.clear();
}
function makeVignette(){
  const v=document.createElement('canvas');v.width=Math.max(2,Math.round(VW/4));v.height=Math.max(2,Math.round(VH/4));
  const vg=v.getContext('2d');vg.fillStyle=G.W.M.pal.tint;vg.fillRect(0,0,v.width,v.height);
  const gr=vg.createRadialGradient(v.width/2,v.height/2,Math.min(v.width,v.height)*0.3,v.width/2,v.height/2,Math.max(v.width,v.height)*0.75);
  gr.addColorStop(0,'rgba(20,10,5,0)');gr.addColorStop(1,'rgba(20,10,5,0.55)');vg.fillStyle=gr;vg.fillRect(0,0,v.width,v.height);v.mi=G.W.mi;return v}
function worldToScreen(x,y){const z=G.cam.z;return[(x-G.cam.x)*z+VW/2,(y-G.cam.y)*z+VH/2]}

function render(dt){
  const W=G.W,p=G.p;if(!W)return;
  const z=G.cam.z,S=z*DPR;
  // camera
  if(p){const lead=G.state==='play'?24:0;const tx=p.x+(p.moving?Math.cos(p.aim)*lead:0),ty=p.y-20+(p.moving?Math.sin(p.aim)*lead:0);
    G.cam.x=lerp(G.cam.x,tx,1-Math.pow(0.0008,dt));G.cam.y=lerp(G.cam.y,ty,1-Math.pow(0.0008,dt))}
  let sx=0,sy=0;if(G.shake>0){sx=(Math.random()-0.5)*G.shake;sy=(Math.random()-0.5)*G.shake;G.shake=Math.max(0,G.shake-dt*40)}
  const vw=VW/z,vh=VH/z,left=G.cam.x-vw/2+sx,top=G.cam.y-vh/2+sy;
  cx.setTransform(1,0,0,1,0,0);cx.fillStyle=W.M.pal.g[2];cx.fillRect(0,0,cv.width,cv.height);
  cx.setTransform(S,0,0,S,-left*S,-top*S);
  // địa hình
  const cs=CHUNK*T,c0=Math.floor(left/cs),c1=Math.floor((left+vw)/cs),r0=Math.floor(top/cs),r1=Math.floor((top+vh)/cs);
  for(let cy=r0;cy<=r1;cy++)for(let cxx=c0;cxx<=c1;cxx++){if(cxx<0||cy<0||cxx*CHUNK>=MW||cy*CHUNK>=MH)continue;const ch=getChunk(W,cxx,cy,S);cx.drawImage(ch,cxx*cs,cy*cs,cs,cs)}
  // gợn nước
  const tx0=Math.max(0,Math.floor(left/T)),tx1=Math.min(MW-1,Math.floor((left+vw)/T)),ty0=Math.max(0,Math.floor(top/T)),ty1=Math.min(MH-1,Math.floor((top+vh)/T));
  cx.strokeStyle='rgba(255,255,255,0.22)';cx.lineWidth=1.6;cx.beginPath();
  for(let y=ty0;y<=ty1;y++)for(let x=tx0;x<=tx1;x++){if(W.tile[y*MW+x]!==TW)continue;const h=hash2(x,y,5);if(h<0.45)continue;
    const ph=G.t*1.2+h*10,ox=x*T+h*30,oy=y*T+20+Math.sin(ph)*5;cx.moveTo(ox,oy);cx.quadraticCurveTo(ox+6,oy-3,ox+12,oy)}cx.stroke();
  drawTownUnder(left,top,vw,vh);
  // đấu trường
  drawArena(W);
  // vùng & cảnh báo
  drawZones();drawFxLayer(true);
  for(const t of G.tele){const k=t.t/t.dur;cx.fillStyle=`rgba(255,60,40,${0.12+0.1*k})`;cx.beginPath();cx.ellipse(t.x,t.y,t.r,t.r*0.8,0,0,TAU);cx.fill();
    cx.strokeStyle=t.col;cx.lineWidth=2.5;cx.stroke();cx.fillStyle=`rgba(255,90,60,0.3)`;cx.beginPath();cx.ellipse(t.x,t.y,t.r*k,t.r*0.8*k,0,0,TAU);cx.fill()}
  for(const e of G.enemies){if(e.dead||!e.tele||e.state!=='wind')continue;drawEnemyTele(e)}
  // loot beam (dưới)
  for(const d of G.drops){if(d.kind==='item'&&d.val.rar>=2){const col=RARITY[d.val.rar].color;const gr=cx.createLinearGradient(0,d.y-120,0,d.y);gr.addColorStop(0,'rgba(0,0,0,0)');gr.addColorStop(1,col);
    cx.globalAlpha=0.35+Math.sin(G.t*4)*0.1;cx.fillStyle=gr;cx.fillRect(d.x-6,d.y-120,12,120);cx.globalAlpha=1}}
  // y-sort
  const list=[];
  for(let y=Math.max(0,ty0-1);y<=Math.min(MH-1,ty1+7);y++)for(let x=Math.max(0,tx0-4);x<=Math.min(MW-1,tx1+4);x++){const os=W.ogrid[y*MW+x];if(os)for(const o of os)list.push({y:o.y,o})}
  for(const n of W.npcs)list.push({y:n.y,n});
  for(const e of G.enemies)if(!e.dead&&e.x>left-100&&e.x<left+vw+100&&e.y>top-60&&e.y<top+vh+160)list.push({y:e.y,e});
  for(const d of G.drops)list.push({y:d.y,d});
  if(p&&(G.state!=='dead'))list.push({y:p.y,p:1});
  list.sort((a,b)=>a.y-b.y);
  for(const it of list){
    if(it.o){const o=it.o,sp=getSprite(o.k,o.v,W.M.pal,S*o.s);
      let al=1;if(p&&OBJ[o.k].h>80&&p.y<o.y&&p.y>o.y-sp.h*o.s*0.9&&Math.abs(p.x-o.x)<sp.w*o.s*0.4)al=0.45;
      cx.globalAlpha=al;cx.drawImage(sp.c,o.x-sp.w*o.s/2,o.y-(sp.h-6)*o.s,sp.w*o.s,sp.h*o.s);cx.globalAlpha=1;
      if(o.k==='fire')drawFire(o.x,o.y-6);if(o.k==='anvil'&&Math.random()<0.04)sparks(o.x-26,o.y-10,3,'#ffb347',90);if(o.k==='rockery'||o.k==='b_forge')townDyn(o);}
    else if(it.n)drawNpc(it.n);
    else if(it.e)drawEnemy(it.e);
    else if(it.d)drawDrop(it.d);
    else if(it.p)drawPlayer();
  }
  drawTownLights(left,top,vw,vh);HK.ev('drawWorld',left,top,vw,vh);
  // đạn
  for(const b of G.projs)drawProj(b);
  // hiệu ứng
  drawFxLayer(false);
  // hạt
  for(let pass=0;pass<2;pass++){if(pass)cx.globalCompositeOperation='lighter';
    for(const q of G.parts){if(!!q.add!==!!pass)continue;const a=q.life/q.max;cx.globalAlpha=Math.min(1,a*1.5);cx.fillStyle=q.col;
      if(q.sh==='s'){cx.strokeStyle=q.col;cx.lineWidth=q.size*0.8;cx.lineCap='round';cx.beginPath();cx.moveTo(q.x,q.y);cx.lineTo(q.x-q.vx*0.035,q.y-q.vy*0.035);cx.stroke()}
      else{cx.beginPath();cx.arc(q.x,q.y,q.size*(0.5+a*0.5),0,TAU);cx.fill()}}}
  cx.globalCompositeOperation='source-over';
  cx.globalAlpha=1;
  drawTownLabels(left,top,vw,vh);
  // môi trường
  drawAmbient(dt,left,top,vw,vh);
  // số sát thương
  cx.textAlign='center';cx.lineJoin='round';
  for(const f of G.floats){const a=Math.min(1,f.life*2.5);cx.globalAlpha=a;const s=f.skill?f.size*(f.life>1.0?1+(f.life-1.0)*4:1):f.size*(f.life>0.75?1+(f.life-0.75)*2:1);
    cx.font=f.skill?`400 ${s}px "Yeseva One",Georgia,serif`:`800 ${s}px "Be Vietnam Pro",system-ui,sans-serif`;if(f.skill){cx.lineWidth=6;cx.strokeStyle='rgba(60,10,0,0.85)';cx.strokeText(f.txt,f.x,f.y);cx.fillStyle=f.col;cx.fillText(f.txt,f.x,f.y);continue}cx.lineWidth=4;cx.strokeStyle='rgba(30,12,6,0.9)';cx.strokeText(f.txt,f.x,f.y);cx.fillStyle=f.col;cx.fillText(f.txt,f.x,f.y)}
  cx.globalAlpha=1;
  // phủ màn
  cx.setTransform(1,0,0,1,0,0);
  if(!vignette||vignette.mi!==W.mi)vignette=makeVignette();
  cx.drawImage(vignette,0,0,cv.width,cv.height);
  if(G.flash&&G.flash.t>0){G.flash.t-=dt;cx.globalCompositeOperation='lighter';cx.fillStyle=G.flash.col;cx.globalAlpha=Math.min(1,G.flash.t/G.flash.d)*0.35;cx.fillRect(0,0,cv.width,cv.height);cx.globalAlpha=1;cx.globalCompositeOperation='source-over'}
  if(p&&p.hurtT>0){cx.fillStyle=`rgba(200,20,10,${p.hurtT*0.6})`;cx.fillRect(0,0,cv.width,cv.height)}
  if(p&&G.state==='play'&&p.hp<p.maxhp*0.3){cx.fillStyle=`rgba(160,0,0,${0.12+Math.sin(G.t*6)*0.06})`;cx.fillRect(0,0,cv.width,cv.height)}
  if(G.state==='play'||G.state==='dead')drawQuestArrow();
  cx.setTransform(1,0,0,1,0,0);HK.ev('drawScreen');
}
function drawArena(W){
  const A=W.arena,S=G.save,step=MAPS[W.mi].quest[S?S.qs[W.mi]:0];const open=step&&step.t==='boss';const done=!step;
  cx.fillStyle='rgba(60,30,20,0.18)';cx.beginPath();cx.ellipse(A.x,A.y,A.r,A.r*0.82,0,0,TAU);cx.fill();
  cx.strokeStyle=done?'rgba(255,215,120,0.3)':open?`rgba(255,80,50,${0.5+Math.sin(G.t*3)*0.2})`:'rgba(200,170,255,0.55)';cx.lineWidth=3;cx.beginPath();cx.ellipse(A.x,A.y,A.r,A.r*0.82,0,0,TAU);cx.stroke();
  if(!open&&!done&&!G.boss){cx.fillStyle=`rgba(180,140,255,${0.08+Math.sin(G.t*2)*0.04})`;cx.beginPath();cx.ellipse(A.x,A.y,A.r,A.r*0.82,0,0,TAU);cx.fill();
    for(let k=0;k<3;k++){const a=G.t*0.6+k*2.1;cx.fillStyle='rgba(220,200,255,0.5)';cx.beginPath();cx.arc(A.x+Math.cos(a)*A.r*0.9,A.y+Math.sin(a)*A.r*0.74,3,0,TAU);cx.fill()}}
  // ký hiệu trống đồng ở tâm
  cx.strokeStyle='rgba(255,220,140,0.22)';cx.lineWidth=2;for(let r=30;r<A.r*0.8;r+=34){cx.beginPath();cx.ellipse(A.x,A.y,r,r*0.82,0,0,TAU);cx.stroke()}
  cx.save();cx.translate(A.x,A.y);cx.scale(1,0.82);cx.fillStyle='rgba(255,220,140,0.25)';for(let i=0;i<14;i++){cx.rotate(TAU/14);cx.beginPath();cx.moveTo(0,-6);cx.lineTo(4,-24);cx.lineTo(-4,-24);cx.fill()}cx.restore();
}
function drawEnemyTele(e){
  const t=e.tele,k=1-Math.max(0,e.st)/Math.max(0.01,(e.boss?1:e.def.wind));
  cx.save();cx.translate(e.x,e.y);
  if(t.k==='arc'){cx.fillStyle=`rgba(255,50,30,${0.15+0.25*k})`;cx.beginPath();cx.moveTo(0,0);cx.arc(0,0,t.r,t.a-t.arc/2,t.a+t.arc/2);cx.closePath();cx.fill();
    cx.strokeStyle='rgba(255,90,60,0.8)';cx.lineWidth=2;cx.stroke()}
  if(t.k==='line'){cx.rotate(t.a);cx.fillStyle=`rgba(255,50,30,${0.12+0.2*k})`;cx.fillRect(0,-t.w/2,t.len,t.w);cx.fillStyle='rgba(255,80,50,0.35)';cx.fillRect(0,-t.w/2,t.len*k,t.w);
    cx.strokeStyle='rgba(255,90,60,0.8)';cx.lineWidth=2;cx.strokeRect(0,-t.w/2,t.len,t.w)}
  if(t.k==='aim'){cx.rotate(t.a);cx.strokeStyle=`rgba(255,80,60,${0.3+0.5*k})`;cx.setLineDash([6,6]);cx.lineWidth=2;cx.beginPath();cx.moveTo(10,-18);cx.lineTo(t.len,-18);cx.stroke();cx.setLineDash([])}
  cx.restore();
}
function drawFire(x,y){for(let i=0;i<3;i++){const h=14+Math.sin(G.t*12+i*2)*5;cx.fillStyle=i?'#ffd23a':'#ff6a2a';cx.beginPath();cx.moveTo(x-8+i*5,y);cx.quadraticCurveTo(x-6+i*5,y-h,x-2+i*5,y-h-6);cx.quadraticCurveTo(x+2+i*5,y-h,x+4+i*5,y);cx.fill()}
  if(Math.random()<0.2)addPart(x+rand(-6,6),y-14,rand(-10,10),rand(-70,-40),0.8,'#ffb347',2,0)}
function drawNpc(n){
  if(n.horse){drawMount(cx,MOUNT_BY.nau,{x:n.x-46,y:n.y+6,f:1,t:G.t,walk:0,moving:false})}
  drawHuman(cx,{x:n.x,y:n.y,f:n.x>G.W.camp.x?-1:1,look:LOOKS[n.look],t:G.t,atk:n.look==='smith'?((G.t*1.2)%1):-1});
  // tên + dấu
  cx.font='700 12px "Be Vietnam Pro",system-ui,sans-serif';cx.textAlign='center';cx.lineWidth=3;cx.strokeStyle='rgba(20,10,5,0.85)';cx.strokeText(n.name,n.x,n.y-80);cx.fillStyle='#ffe2a0';cx.fillText(n.name,n.x,n.y-80);
  const near=G.nearNpc===n;const bob=Math.sin(G.t*3)*3;
  if(n.act==='quest'||near){cx.fillStyle=near?'#ffd23a':'#ffd23a';cx.beginPath();cx.moveTo(n.x,n.y-88+bob);cx.lineTo(n.x-6,n.y-98+bob);cx.lineTo(n.x+6,n.y-98+bob);cx.fill()}
}
function drawEnemy(e){
  const bossOrBig=e.boss;
  if(e.elite){cx.strokeStyle=`rgba(255,200,60,${0.5+Math.sin(G.t*5)*0.25})`;cx.lineWidth=2.5;cx.beginPath();cx.ellipse(e.x,e.y,e.r*1.5,e.r*0.5,0,0,TAU);cx.stroke()}
  const drawIt=()=>{if(e.boss)drawBoss(cx,e,G.t);
    else if(e.def.body==='human')drawHuman(cx,{x:e.x,y:e.y,f:e.f,look:e.look||(e.look=factionLook(e.def.fac,e.def.wp)),walk:e.walk,moving:e.moving,atk:e.atkAnim,t:G.t+e.id,sc:e.sc});
    else drawBeast(cx,e,G.t+e.id)};
  drawIt();
  if(e.flash>0){cx.save();cx.globalCompositeOperation='lighter';cx.globalAlpha=Math.min(1,e.flash*8)*0.7;drawIt();cx.restore()}
  if(e.stun>0){for(let k=0;k<3;k++){const a=G.t*6+k*2.1;cx.fillStyle='#ffd23a';cx.beginPath();cx.arc(e.x+Math.cos(a)*12,e.y-(e.def.body==='human'?62:44)*e.sc+Math.sin(a)*4,2.5,0,TAU);cx.fill()}}
  // thanh máu + tên
  if(!e.boss&&(e.hp<e.max||e.elite||G.lastTarget===e)){const w=e.elite?48:36,y=e.y-(e.def.body==='cav'?64:e.def.body==='human'?68:46)*e.sc;
    cx.fillStyle='rgba(20,10,5,0.75)';cx.fillRect(e.x-w/2-1,y-1,w+2,6);cx.fillStyle=e.elite?'#ffb32a':'#d93a2a';cx.fillRect(e.x-w/2,y,w*Math.max(0,e.hp/e.max),4);
    if(e.elite||G.lastTarget===e){cx.font='700 11px "Be Vietnam Pro",system-ui,sans-serif';cx.textAlign='center';cx.lineWidth=3;cx.strokeStyle='rgba(20,10,5,0.85)';
      const lbl=e.name+' · '+e.lv;cx.strokeText(lbl,e.x,y-5);cx.fillStyle=e.elite?'#ffd23a':'#f4e6d0';cx.fillText(lbl,e.x,y-5)}}
  if(G.lastTarget===e&&!e.boss){cx.strokeStyle='rgba(255,90,60,0.9)';cx.lineWidth=2;const r=e.r*1.3;cx.beginPath();
    for(let k=0;k<4;k++){const a=k*Math.PI/2+G.t*2;cx.moveTo(e.x+Math.cos(a)*r,e.y+Math.sin(a)*r*0.4);cx.lineTo(e.x+Math.cos(a+0.5)*r,e.y+Math.sin(a+0.5)*r*0.4)}cx.stroke()}
}
function drawDrop(d){
  const y=d.y-d.z,bob=d.z>0?0:Math.sin(G.t*3+d.id*10)*2;
  cx.fillStyle='rgba(0,0,0,0.25)';cx.beginPath();cx.ellipse(d.x,d.y,7,2.5,0,0,TAU);cx.fill();
  if(d.kind==='gold'){cx.fillStyle='#b8860b';cx.beginPath();cx.arc(d.x,y-6+bob,6,0,TAU);cx.fill();cx.fillStyle='#ffd23a';cx.beginPath();cx.arc(d.x-1,y-7+bob,4.5,0,TAU);cx.fill();cx.fillStyle='#b8860b';cx.fillRect(d.x-2.5,y-8.5+bob,3,3)}
  else if(d.kind==='ore'){cx.fillStyle='#4a6a8a';cx.beginPath();cx.moveTo(d.x,y-16+bob);cx.lineTo(d.x+7,y-8+bob);cx.lineTo(d.x+3,y-1+bob);cx.lineTo(d.x-5,y-2+bob);cx.lineTo(d.x-7,y-9+bob);cx.closePath();cx.fill();
    cx.fillStyle='#9fd8ff';cx.beginPath();cx.moveTo(d.x,y-15+bob);cx.lineTo(d.x+5,y-8+bob);cx.lineTo(d.x-1,y-6+bob);cx.closePath();cx.fill()}
  else if(d.kind==='pot'){cx.fillStyle=d.val==='potHP'?'#d93a2a':'#3a6ad9';cx.beginPath();cx.arc(d.x,y-7+bob,6,0,TAU);cx.fill();cx.fillStyle='#e8d8b0';cx.fillRect(d.x-2,y-17+bob,4,5)}
  else if(d.kind==='chest'){drawChest(d,y+bob)}
  else if(d.kind==='frag'){additive(()=>glow(d.x,y-9+bob,14,'#ff8a2a',0.7));cx.fillStyle=_lg(cx,0,y-18,0,y,metalSt('#4c525c'));cx.strokeStyle=OL;cx.lineWidth=1;cx.beginPath();cx.moveTo(d.x-7,y-2+bob);cx.lineTo(d.x-3,y-17+bob);cx.lineTo(d.x+7,y-12+bob);cx.lineTo(d.x+5,y-2+bob);cx.closePath();cx.fill();cx.stroke()}
  else if(d.kind==='qitem'){cx.fillStyle='#ffd23a';cx.shadowColor='#ffd23a';cx.shadowBlur=10;cx.beginPath();cx.moveTo(d.x,y-18+bob);cx.lineTo(d.x+7,y-9+bob);cx.lineTo(d.x,y+bob);cx.lineTo(d.x-7,y-9+bob);cx.closePath();cx.fill();cx.shadowBlur=0}
  else if(d.kind==='item'){const col=RARITY[d.val.rar].color;cx.drawImage(itemArtCanvas(d.val),d.x-15,y-30+bob,30,30);
    if(d.val.rar>=1){cx.font='700 10px "Be Vietnam Pro",system-ui,sans-serif';cx.textAlign='center';cx.lineWidth=3;cx.strokeStyle='rgba(20,10,5,0.85)';cx.strokeText(d.val.name,d.x,y-28+bob);cx.fillStyle=col;cx.fillText(d.val.name,d.x,y-28+bob)}}
}
/* môi trường theo chương */
function drawAmbient(dt,left,top,vw,vh){
  const kind=G.W.M.amb;const want=kind==='rain'?90:kind==='mist'?14:40;
  while(G.amb.length<want)G.amb.push({x:left+Math.random()*vw,y:top+Math.random()*vh,s:Math.random(),ph:Math.random()*TAU});
  for(const a of G.amb){
    if(a.x<left-60)a.x+=vw+100;if(a.x>left+vw+60)a.x-=vw+100;if(a.y<top-60)a.y+=vh+100;if(a.y>top+vh+60)a.y-=vh+100;
    if(kind==='firefly'){a.ph+=dt;a.x+=Math.cos(a.ph*0.7)*12*dt;a.y+=Math.sin(a.ph)*10*dt;const al=0.4+Math.sin(a.ph*3)*0.4;cx.fillStyle=`rgba(230,255,140,${al})`;cx.beginPath();cx.arc(a.x,a.y,1.8+a.s,0,TAU);cx.fill()}
    else if(kind==='rain'){a.y+=700*dt;a.x-=120*dt;cx.strokeStyle='rgba(200,225,240,0.35)';cx.lineWidth=1.2;cx.beginPath();cx.moveTo(a.x,a.y);cx.lineTo(a.x+6,a.y-22);cx.stroke()}
    else if(kind==='petal'){a.ph+=dt*2;a.y+=(30+a.s*30)*dt;a.x+=Math.sin(a.ph)*30*dt+15*dt;cx.fillStyle=a.s>0.5?'#ffb8cc':'#ffe0ea';cx.save();cx.translate(a.x,a.y);cx.rotate(a.ph);cx.beginPath();cx.ellipse(0,0,4,2.2,0,0,TAU);cx.fill();cx.restore()}
    else if(kind==='dust'){a.ph+=dt;a.x+=(10+a.s*20)*dt;a.y+=Math.sin(a.ph)*6*dt;cx.fillStyle='rgba(255,235,190,0.35)';cx.beginPath();cx.arc(a.x,a.y,1.4+a.s,0,TAU);cx.fill()}
    else if(kind==='mist'){a.x+=(8+a.s*10)*dt;const gr=cx.createRadialGradient(a.x,a.y,0,a.x,a.y,160);gr.addColorStop(0,'rgba(230,240,240,0.16)');gr.addColorStop(1,'rgba(230,240,240,0)');cx.fillStyle=gr;cx.fillRect(a.x-160,a.y-160,320,320)}
  }
}
function drawQuestArrow(){
  const q=questTarget();G.questArrow=q;if(!q||q.e)return;const [sx,sy]=worldToScreen(q.x,q.y);const m=60;
  const p=G.p;const on=sx>m&&sx<VW-m&&sy>m&&sy<VH-m;
  cx.setTransform(DPR,0,0,DPR,0,0);
  if(on){const b=Math.sin(G.t*4)*4;cx.fillStyle='#ffd23a';cx.beginPath();cx.moveTo(sx,sy-20+b);cx.lineTo(sx-9,sy-34+b);cx.lineTo(sx+9,sy-34+b);cx.fill();cx.setTransform(1,0,0,1,0,0);return}
  const [px,py]=worldToScreen(p.x,p.y-20);const a=Math.atan2(sy-py,sx-px);const r=Math.min(VW,VH)*0.32+20;
  const ax=clamp(VW/2+Math.cos(a)*r*1.2,40,VW-40),ay=clamp(VH/2+Math.sin(a)*r,90,VH-150);
  cx.translate(ax,ay);cx.rotate(a);cx.globalAlpha=0.85+Math.sin(G.t*5)*0.15;cx.fillStyle='#ffd23a';cx.strokeStyle='rgba(40,20,5,0.8)';cx.lineWidth=2;
  cx.beginPath();cx.moveTo(18,0);cx.lineTo(-8,-12);cx.lineTo(-3,0);cx.lineTo(-8,12);cx.closePath();cx.fill();cx.stroke();cx.globalAlpha=1;cx.setTransform(1,0,0,1,0,0);
}

/* ---- vẽ chân dung lớp nhân vật lên canvas nhỏ ---- */
function drawPortrait(c,clsId,t,atk,big){
  const g=c.getContext('2d'),d=Math.min(2,window.devicePixelRatio||1),w=c.clientWidth||c.width,h=c.clientHeight||c.height;
  if(c.width!==Math.round(w*d)){c.width=Math.round(w*d);c.height=Math.round(h*d)}
  g.setTransform(d,0,0,d,0,0);g.clearRect(0,0,w,h);const s=big?h/74:h/66;
  g.save();g.translate(w/2,h*(big?0.94:0.97));g.scale(s,s);drawHuman(g,{x:0,y:0,f:1,look:LOOKS[clsId],t,atk,walk:0,moving:false,glow:big?1:0});g.restore();
}
