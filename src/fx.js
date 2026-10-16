/* ============ HIỆU ỨNG: ÁNH SÁNG CỘNG MÀU, VỆT CHÉM, SÓNG CHẤN ============ */
const _glow={};
function getGlow(col){let c=_glow[col];if(c)return c;c=document.createElement('canvas');c.width=c.height=64;const g=c.getContext('2d');
  const gr=g.createRadialGradient(32,32,0,32,32,32);gr.addColorStop(0,'rgba(255,255,255,1)');gr.addColorStop(0.18,col);gr.addColorStop(0.5,col.replace('rgb(','rgba(').replace(')',',0.35)'));gr.addColorStop(1,'rgba(0,0,0,0)');
  g.fillStyle=gr;g.fillRect(0,0,64,64);return _glow[col]=c}
function hexRgb(h){const n=parseInt(h.slice(1,7),16);return`rgb(${n>>16},${(n>>8)&255},${n&255})`}
/* chấm sáng cộng màu */
function glow(x,y,r,col,a){if(r<=0)return;const c=getGlow(col[0]==='#'?hexRgb(col):col);cx.globalAlpha=a==null?1:a;cx.drawImage(c,x-r,y-r,r*2,r*2)}
function additive(fn,mode){cx.save();cx.globalCompositeOperation=mode||'screen';fn();cx.restore()}
/* lớp màu thường (giữ sắc độ trên nền sáng) */
function normal(fn){cx.save();fn();cx.restore()}
/* bóng mờ nhân vật (ảnh lưu sẵn, tô màu) */
function makeGhost(look,f,col,glowLv){const c=document.createElement('canvas');c.width=100;c.height=118;const g=c.getContext('2d');
  g.translate(50,110);g.scale(1.12,1.12);drawHuman(g,{x:0,y:0,f,look,t:0,atk:0.4});g.setTransform(1,0,0,1,0,0);
  g.globalCompositeOperation='source-atop';g.fillStyle=col;g.globalAlpha=0.75;g.fillRect(0,0,100,118);return c}
function pushGhost(x,y,f,col,life){const p=G.p;const key=p.cls.id+f+col;G._ghosts=G._ghosts||{};let img=G._ghosts[key];if(!img)img=G._ghosts[key]=makeGhost(p.look,f,col);
  G.fx.push({k:'ghost',x,y,img,life:life||0.3,max:life||0.3})}
/* vết nứt mặt đất */
function pushCrack(x,y,r,n){const segs=[];for(let i=0;i<(n||7);i++){let a=Math.random()*TAU,px=x,py=y,l=r*rand(0.5,1);const pts=[px,py];for(let k=0;k<4;k++){a+=rand(-0.5,0.5);px+=Math.cos(a)*l/4;py+=Math.sin(a)*l/4*0.8;pts.push(px,py)}segs.push(pts)}
  G.fx.push({k:'crack',segs,life:1.4,max:1.4,under:1})}
function pushDust(x,y,n,r){for(let i=0;i<n;i++){const a=Math.random()*TAU;addPart(x+Math.cos(a)*r*0.3,y+Math.sin(a)*r*0.2,Math.cos(a)*rand(60,180),Math.sin(a)*rand(30,90)-30,rand(0.4,0.8),'rgba(190,165,120,0.55)',rand(4,8),60)}}
function callout(txt,col){const p=G.p;G.floats.push({x:p.x,y:p.y-90,txt,col:col||'#ffe7a8',size:24,life:1.15,vy:-24,skill:1})}

/* ================= NGƯỜI CHƠI ================= */
function drawPlayer(){
  const p=G.p,L=p.look,C=p.cls;
  // vòng chân phát sáng theo phái
  additive(()=>{cx.globalAlpha=0.5+Math.sin(G.t*3)*0.12;cx.strokeStyle=C.color;cx.lineWidth=2;cx.beginPath();cx.ellipse(p.x,p.y,19,6.5,0,0,TAU);cx.stroke();
    glow(p.x,p.y,26,C.color,0.18)});
  // Kim Cang Thân: chuông vàng
  if(p.buff.guard>0){const k=Math.min(1,p.buff.guard*2);additive(()=>{cx.save();cx.translate(p.x,p.y-22);
      cx.globalAlpha=0.32*k;cx.fillStyle='#ffc53d';cx.beginPath();cx.ellipse(0,0,30,40,0,0,TAU);cx.fill();
      cx.globalAlpha=0.95*k;cx.strokeStyle='#ffd98a';cx.lineWidth=3;cx.beginPath();cx.ellipse(0,0,30,40,0,0,TAU);cx.stroke();
      cx.rotate(G.t*0.8);cx.globalAlpha=0.55*k;cx.strokeStyle='#ffe7a8';cx.lineWidth=1.2;for(let i=0;i<8;i++){cx.rotate(TAU/8);cx.beginPath();cx.ellipse(0,-24,5,12,0,0,TAU);cx.stroke()}cx.restore()})}
  // Phong Hỏa Luân: vòng lửa sau lưng
  if(p.buff.wheel>0){drawWheel(p,0)}
  drawAura(p);
  // vệt vũ khí
  drawTrail(p);
  if(p.ifr>0&&!p.dash&&Math.floor(G.t*20)%2)cx.globalAlpha=0.55;
  let atk=p.atkAnim;if(p.spinT>0)atk=(G.t*4)%1;
  const tip=p.tip||(p.tip={x:0,y:0});
  const RM=ridingMount();if(RM){const seat=drawMount(cx,RM,{x:p.x,y:p.y,f:p.f,walk:p.walk,moving:p.moving,t:G.t});drawHuman(cx,{x:p.x+seat.x*p.f,y:p.y+seat.y+17*1.08,f:p.f,look:L,walk:0,moving:false,atk,t:G.t,glow:p.glow||0,tipOut:tip,sc:1.08,ride:1})}
  else drawHuman(cx,{x:p.x,y:p.y,f:p.f,look:L,walk:p.walk,moving:p.moving,atk,t:G.t,glow:p.glow||0,tipOut:tip,sc:1.12});
  cx.globalAlpha=1;
  if(p.buff.wheel>0)drawWheel(p,1);
  // Pháp sư: bùa bay quanh người
  if(C.id==='phap'){for(let i=0;i<3;i++){const a=G.t*1.8+i*TAU/3,x=p.x+Math.cos(a)*22,y=p.y-30+Math.sin(a)*8,front=Math.sin(a)>0;
      cx.save();cx.translate(x,y);cx.rotate(Math.sin(G.t*3+i)*0.3);cx.globalAlpha=front?1:0.6;cx.fillStyle='#efe0b0';cx.fillRect(-3,-6,6,12);cx.strokeStyle='#c8361f';cx.lineWidth=1;
      cx.beginPath();cx.moveTo(0,-4);cx.lineTo(0,4);cx.moveTo(-2,-1);cx.lineTo(2,-1);cx.moveTo(-2,2);cx.lineTo(2,3);cx.stroke();cx.restore();
      additive(()=>glow(x,y,10,'#ffd96a',0.35))}}
  // tia lửa vũ khí cấp cao
  if(p.glow>=1&&Math.random()<0.15+p.glow*0.15){const col=p.glow>=3?'#ff6a3a':p.glow>=2?'#ffd23a':'#8fc8ff';
    addPart(lerp(tip.mx||p.x,tip.x,Math.random()),lerp(tip.my||p.y-30,tip.y,Math.random()),rand(-15,15),rand(-50,-20),rand(0.4,0.7),col,rand(1.5,2.8),-30,'c',1)}
}
function drawTrail(p){
  const melee=p.cls.atk.type!=='shot';const swinging=(p.atkAnim>=0&&p.atkAnim<0.6)||p.spinT>0;
  p.trail=p.trail||[];
  if(melee&&swinging&&p.tip&&p.tip.x)p.trail.push({x:p.tip.x,y:p.tip.y,mx:p.tip.mx,my:p.tip.my,t:G.t});
  while(p.trail.length&&G.t-p.trail[0].t>0.12)p.trail.shift();
  if(p.trail.length<2)return;
  const col=p.glow>=3?'#ff6a3a':p.glow>=2?'#ffd23a':p.cls.color;
  additive(()=>{const tr=p.trail;for(let i=1;i<tr.length;i++){const a=tr[i-1],b=tr[i],k=i/tr.length;
      cx.globalAlpha=k*0.75;cx.fillStyle=col;cx.beginPath();cx.moveTo(a.x,a.y);cx.lineTo(b.x,b.y);cx.lineTo(b.mx,b.my);cx.lineTo(a.mx,a.my);cx.closePath();cx.fill()}
    const l=tr[tr.length-1];cx.globalAlpha=0.9;cx.strokeStyle='#fffbe8';cx.lineWidth=2;cx.beginPath();cx.moveTo(tr[0].x,tr[0].y);for(const q of tr)cx.lineTo(q.x,q.y);cx.stroke();glow(l.x,l.y,10,col,0.8)});
}
function drawWheel(p,front){const k=Math.min(1,p.buff.wheel);cx.save();cx.translate(p.x,p.y-14);cx.scale(1,0.62);
  for(let i=0;i<5;i++){const a=G.t*9+i*TAU/5,s=Math.sin(a);if((s>0)!==!!front)continue;const gr=cx.createLinearGradient(Math.cos(a-0.7)*100,Math.sin(a-0.7)*100,Math.cos(a)*100,s*100);
    gr.addColorStop(0,'rgba(200,40,10,0)');gr.addColorStop(1,'#e8461a');cx.globalAlpha=0.85*k;cx.strokeStyle=gr;cx.lineWidth=9;cx.lineCap='round';cx.beginPath();cx.arc(0,0,100,a-0.7,a);cx.stroke()}
  cx.globalAlpha=1;
  additive(()=>{for(let i=0;i<5;i++){const a=G.t*9+i*TAU/5,s=Math.sin(a);if((s>0)!==!!front)continue;
      const x=Math.cos(a)*100,y=s*100;glow(x,y,26,'#ff7a2a',0.7*k);glow(x,y,12,'#ffe08a',0.9*k);
}
    if(front){cx.globalAlpha=0.25*k;cx.strokeStyle='#ffd23a';cx.lineWidth=2;cx.beginPath();cx.arc(0,0,100,0,TAU);cx.stroke()}});
  cx.restore()}

/* ================= ĐẠN ================= */
function drawProj(b){
  if(b.kind==='shell'){cx.fillStyle='rgba(0,0,0,0.3)';cx.beginPath();cx.ellipse(b.x,b.y+20,7,2.4,0,0,TAU);cx.fill();
    cx.fillStyle='#262626';cx.beginPath();cx.arc(b.x,b.y-b.z,7,0,TAU);cx.fill();additive(()=>{glow(b.x+4,b.y-b.z-6,9,'#ffb347',0.9)});
    if(Math.random()<0.5)addPart(b.x,b.y-b.z,rand(-10,10),rand(-20,0),0.5,'rgba(90,90,90,0.5)',4,-10);return}
  const a=Math.atan2(b.vy,b.vx);const P=b.from==='p';
  switch(b.kind){
    case'arrow':{const col=P?(b.col||'#fff3c8'):'#ff8a6a';
      additive(()=>{cx.save();cx.translate(b.x,b.y);cx.rotate(a);const gr=cx.createLinearGradient(-46,0,6,0);gr.addColorStop(0,'rgba(0,0,0,0)');gr.addColorStop(1,col);
        cx.strokeStyle=gr;cx.lineWidth=P?4:3;cx.beginPath();cx.moveTo(-46,0);cx.lineTo(6,0);cx.stroke();cx.restore();glow(b.x,b.y,P?12:9,col,0.7)});
      cx.save();cx.translate(b.x,b.y);cx.rotate(a);cx.strokeStyle='#8a6a44';cx.lineWidth=1.6;cx.beginPath();cx.moveTo(-14,0);cx.lineTo(8,0);cx.stroke();
      cx.fillStyle='#eef3f4';cx.beginPath();cx.moveTo(13,0);cx.lineTo(6,-3.2);cx.lineTo(6,3.2);cx.fill();cx.fillStyle='#c8361f';cx.beginPath();cx.moveTo(-14,0);cx.lineTo(-9,-3);cx.lineTo(-9,3);cx.fill();cx.restore();break}
    case'orb':additive(()=>{glow(b.x,b.y,22,'#5d8fff',0.75);glow(b.x,b.y,10,'#e8f0ff',1);
        for(let i=0;i<3;i++){const s=G.t*12+i*2.1;glow(b.x+Math.cos(s)*9,b.y+Math.sin(s)*9,5,'#9fc4ff',0.8)}});break;
    case'rock':cx.fillStyle='#7a746a';cx.strokeStyle=OL;cx.lineWidth=1;cx.beginPath();cx.arc(b.x,b.y,5,0,TAU);cx.fill();cx.stroke();break;
    case'water':additive(()=>{glow(b.x,b.y,16,'#3fb8d8',0.7);glow(b.x,b.y,7,'#e0fbff',0.9)});break;
    case'feather':cx.save();cx.translate(b.x,b.y);cx.rotate(a);cx.fillStyle='#f4efe6';cx.beginPath();cx.ellipse(0,0,12,4,0,0,TAU);cx.fill();cx.strokeStyle='#c9a24e';cx.lineWidth=1;cx.beginPath();cx.moveTo(-12,0);cx.lineTo(12,0);cx.stroke();cx.restore();
      additive(()=>glow(b.x,b.y,10,'#ffffff',0.35));break;
    case'fire':additive(()=>{glow(b.x,b.y,20,'#ff6a1a',0.8);glow(b.x,b.y,8,'#fff1b0',1)});break;
    case'wave':{const k=Math.min(1,b.life/0.55*2);additive(()=>{cx.save();cx.translate(b.x,b.y);cx.rotate(a);
        for(const[r,w,al,c]of[[34,16,0.25,b.col],[32,8,0.6,b.col],[31,3,0.95,'#ffffff']]){cx.globalAlpha=al*k;cx.strokeStyle=c;cx.lineWidth=w;cx.beginPath();cx.arc(-14,0,r,-1.05,1.05);cx.stroke()}
        cx.restore();glow(b.x,b.y,30,b.col,0.4*k)});
      if(Math.random()<0.8)addPart(b.x+rand(-10,10),b.y+rand(-24,24),-b.vx*0.1,-b.vy*0.1,0.3,b.col,2.2,0,'c',1);break}
  }
}

/* ================= VÙNG CHIÊU ================= */
function drawZones(){
  for(const z of G.zones){const a=Math.min(1,z.t*2);
    if(z.kind==='fire'){
      normal(()=>{const gr=cx.createRadialGradient(z.x,z.y,z.r*0.2,z.x,z.y,z.r);gr.addColorStop(0,`rgba(255,140,40,${0.18*a})`);gr.addColorStop(0.8,`rgba(220,60,10,${0.32*a})`);gr.addColorStop(1,'rgba(160,30,0,0)');
        cx.fillStyle=gr;cx.beginPath();cx.ellipse(z.x,z.y,z.r,z.r*0.8,0,0,TAU);cx.fill();
        // lưỡi lửa: giọt lửa có lõi vàng, lay động
        const n=24;const fl=[];for(let i=0;i<n;i++){const ang=i/n*TAU+G.t*0.5;fl.push([z.x+Math.cos(ang)*z.r*0.9,z.y+Math.sin(ang)*z.r*0.72,i])}
        fl.sort((p,q)=>p[1]-q[1]);
        for(const[px,py,i]of fl){const h=(13+((i*7)%5)*2)*(0.85+Math.sin(G.t*13+i*1.9)*0.18),w=4.5+(i%3),sw=Math.sin(G.t*9+i)*2.5;
          const fg=cx.createLinearGradient(px,py,px,py-h);fg.addColorStop(0,'#ffe27a');fg.addColorStop(0.45,'#ff8a2a');fg.addColorStop(1,'rgba(220,50,10,0)');
          cx.globalAlpha=a;cx.fillStyle=fg;cx.beginPath();cx.moveTo(px-w,py);cx.bezierCurveTo(px-w,py-h*0.45,px+sw-w*0.3,py-h*0.7,px+sw,py-h);cx.bezierCurveTo(px+sw+w*0.3,py-h*0.7,px+w,py-h*0.45,px+w,py);
          cx.quadraticCurveTo(px,py+w*0.5,px-w,py);cx.fill()}});
      additive(()=>{// hình rồng lửa: đuôi xoay
        cx.lineCap='round';let lx=0,ly=0;const head=G.t*2.4;
        for(let i=0;i<=36;i++){const ang=head-i*0.13,r=z.r*(0.62-i/36*0.38);const px=z.x+Math.cos(ang)*r,py=z.y+Math.sin(ang)*r*0.8;
          if(i){cx.globalAlpha=a*(1-i/36)*0.9;cx.strokeStyle=i<8?'#fff1b0':'#ffb347';cx.lineWidth=(1-i/36)*9+1;cx.beginPath();cx.moveTo(lx,ly);cx.lineTo(px,py);cx.stroke()}else glow(px,py,18,'#ffd23a',a);lx=px;ly=py}
        glow(z.x,z.y,z.r*0.5,'#ff8a2a',0.25*a)});
    }else{ // mưa tên: vòng nhắm
      cx.strokeStyle=`rgba(255,240,180,${0.55*a})`;cx.lineWidth=1.5;cx.setLineDash([6,6]);cx.beginPath();cx.ellipse(z.x,z.y,z.r,z.r*0.8,0,0,TAU);cx.stroke();cx.setLineDash([]);
      cx.fillStyle=`rgba(255,240,180,${0.08*a})`;cx.fill();
    }}
}

/* ================= HIỆU ỨNG ================= */
function drawFxLayer(under){for(const f of G.fx){if(f.delay>0||!!f.under!==under)continue;drawFx(f)}}
function drawFx(f){
  const k=f.life/f.max;cx.save();
  switch(f.k){
    case'slash':{cx.translate(f.x,f.y);cx.rotate(f.a);cx.scale(1,0.78);
      if(f.thrust){const L=f.r+16;normal(()=>{const gr=cx.createLinearGradient(0,0,L,0);gr.addColorStop(0,'rgba(255,255,255,0)');gr.addColorStop(0.6,f.col);gr.addColorStop(1,shade(f.col,0.7));
          cx.globalAlpha=Math.min(1,k*1.3);cx.fillStyle=gr;cx.beginPath();cx.moveTo(8,-10*k);cx.lineTo(L,0);cx.lineTo(8,10*k);cx.closePath();cx.fill()});
        additive(()=>{cx.globalAlpha=k;cx.strokeStyle='#fffbe8';cx.lineWidth=2;cx.beginPath();cx.moveTo(12,0);cx.lineTo(L,0);cx.stroke();glow(L-4,0,16,f.col,k)},'lighter');break}
      const s=-f.arc/2,dir=f.flip?-1:1,p=Math.min(1,(1-k)*2.6);const a0=dir>0?s:-s,a1=a0+dir*f.arc*p;
      const r=f.r,col=f.enemy?'#ff6a4a':f.col;
      const steps=14;
      normal(()=>{cx.globalAlpha=Math.min(1,k*1.3);// lưỡi liềm màu: dày giữa, mảnh hai đầu
        for(let i=0;i<steps;i++){const t0=i/steps,t1=(i+1)/steps,an0=lerp(a0,a1,t0),an1=lerp(a0,a1,t1);const th=Math.sin(Math.PI*((t0+t1)/2))*r*0.42*(0.4+0.6*k)+2;
          const gr=cx.createRadialGradient(0,0,r-th,0,0,r);gr.addColorStop(0,'rgba(255,255,255,0)');gr.addColorStop(0.55,col);gr.addColorStop(1,shade(col,0.6));
          cx.fillStyle=gr;cx.beginPath();cx.arc(0,0,r,an0,an1,dir<0);cx.arc(0,0,r-th,an1,an0,dir>0);cx.closePath();cx.fill()}});
      additive(()=>{cx.globalAlpha=k;cx.strokeStyle='#fffbe8';cx.lineWidth=2.4;cx.beginPath();cx.arc(0,0,r*0.98,a0,a1,dir<0);cx.stroke();
        glow(Math.cos(a1)*r,Math.sin(a1)*r,12+r*0.08,col,k)},'lighter');break}
    case'spin':{cx.translate(f.x,f.y);cx.scale(1,0.72);const p=1-k;
      normal(()=>{for(let j=0;j<3;j++){const st=f.a+p*7+j*2.1,r=f.r*(0.55+j*0.18);cx.globalAlpha=Math.min(1,k*1.4)*(1-j*0.2);
          const gr=cx.createRadialGradient(0,0,r-14,0,0,r);gr.addColorStop(0,'rgba(255,255,255,0)');gr.addColorStop(0.75,f.col);gr.addColorStop(1,shade(f.col,0.6));
          cx.fillStyle=gr;cx.beginPath();cx.arc(0,0,r,st,st+2.2);cx.arc(0,0,r-14,st+2.2,st,true);cx.closePath();cx.fill()}});
      additive(()=>{for(let j=0;j<3;j++){const st=f.a+p*7+j*2.1,r=f.r*(0.55+j*0.18);cx.globalAlpha=k;cx.strokeStyle='#fffbe8';cx.lineWidth=2;cx.beginPath();cx.arc(0,0,r,st,st+2.2);cx.stroke()}glow(0,0,f.r*0.6,f.col,0.3*k)});break}
    case'ring':{const r=lerp(f.r2,f.r,k);normal(()=>{cx.globalAlpha=k*0.75;cx.strokeStyle=f.col;cx.lineWidth=14*k+3;cx.beginPath();cx.ellipse(f.x,f.y,r,r*0.8,0,0,TAU);cx.stroke()});
      additive(()=>{cx.globalAlpha=k;cx.lineWidth=2.2;cx.strokeStyle='#fffbe8';cx.beginPath();cx.ellipse(f.x,f.y,r,r*0.8,0,0,TAU);cx.stroke()});break}
    case'flash':additive(()=>{glow(f.x,f.y,f.r*(1.3-k*0.3),f.col,k)});break;
    case'glint':{additive(()=>{cx.translate(f.x,f.y);cx.rotate(f.a||0);const s=f.s*(0.5+k*0.7);cx.globalAlpha=k;cx.fillStyle='#fffbe8';
        cx.beginPath();cx.moveTo(-s,0);cx.lineTo(0,-s*0.12);cx.lineTo(s,0);cx.lineTo(0,s*0.12);cx.closePath();cx.fill();cx.beginPath();cx.moveTo(0,-s*0.7);cx.lineTo(s*0.1,0);cx.lineTo(0,s*0.7);cx.lineTo(-s*0.1,0);cx.closePath();cx.fill();
        glow(0,0,s*0.6,f.col||'#ffd98a',k*0.9)},'lighter');break}
    case'crack':cx.globalAlpha=Math.min(1,k*1.6)*0.55;cx.strokeStyle='#2a1a10';cx.lineWidth=2.2;cx.lineCap='round';for(const s of f.segs){cx.beginPath();cx.moveTo(s[0],s[1]);for(let i=2;i<s.length;i+=2)cx.lineTo(s[i],s[i+1]);cx.stroke()}
      if(k>0.6)additive(()=>{cx.globalAlpha=(k-0.6)*2;cx.strokeStyle='#ffb347';cx.lineWidth=1.2;for(const s of f.segs){cx.beginPath();cx.moveTo(s[0],s[1]);for(let i=2;i<s.length;i+=2)cx.lineTo(s[i],s[i+1]);cx.stroke()}},'lighter');break;
    case'bolt':{if(!f.pts){f.pts=[];const n=9;for(let i=0;i<=n;i++){const t=i/n;f.pts.push([lerp(f.x1,f.x2,t)+(i&&i<n?rand(-14,14):0),lerp(f.y1,f.y2,t)+(i&&i<n?rand(-8,8):0)])}
        f.br=[];for(let b=0;b<3;b++){const i=randi(2,7),p0=f.pts[i];const a=Math.atan2(f.y2-f.y1,f.x2-f.x1)+rand(-1.2,1.2);const br=[p0];let x=p0[0],y=p0[1];for(let j=0;j<3;j++){x+=Math.cos(a)*rand(10,22);y+=Math.sin(a)*rand(10,22);br.push([x,y])}f.br.push(br)}}
      if(Math.random()<0.5)for(let i=1;i<f.pts.length-1;i++){f.pts[i][0]+=rand(-3,3);f.pts[i][1]+=rand(-2,2)}
      const path=(pts)=>{cx.beginPath();cx.moveTo(pts[0][0],pts[0][1]);for(const q of pts)cx.lineTo(q[0],q[1])};
      normal(()=>{cx.lineCap='round';cx.lineJoin='round';cx.globalAlpha=0.55*k;cx.strokeStyle='#4f7fe0';cx.lineWidth=(f.w||3)*2.6;path(f.pts);cx.stroke()});
      additive(()=>{cx.lineCap='round';cx.lineJoin='round';
        for(const[w,al,c]of[[(f.w||3)*3.5,0.35,f.col],[(f.w||3)*1.4,0.9,f.col],[(f.w||3)*0.6,1,'#ffffff']]){cx.globalAlpha=al*k;cx.strokeStyle=c;cx.lineWidth=w;path(f.pts);cx.stroke();
          cx.lineWidth=w*0.5;for(const b of f.br){path(b);cx.stroke()}}
        glow(f.x2,f.y2,30,'#9fc4ff',k);glow(f.x1,f.y1,14,'#ffffff',k*0.6)},'lighter');break}
    case'fallsword':{const h=k*280;const x=f.x,y=f.y-h;
      additive(()=>{const gr=cx.createLinearGradient(x,y-160,x,y);gr.addColorStop(0,'rgba(0,0,0,0)');gr.addColorStop(1,f.col);cx.globalAlpha=0.85;cx.strokeStyle=gr;cx.lineWidth=7;cx.beginPath();cx.moveTo(x,y-160);cx.lineTo(x,y-20);cx.stroke();
        glow(x,y-10,22,f.col,0.8)},'lighter');
      normal(()=>{cx.globalAlpha=(1-k)*0.5;cx.fillStyle=f.col;cx.beginPath();cx.ellipse(f.x,f.y,24*(1-k)+6,8*(1-k)+2,0,0,TAU);cx.fill()});
      cx.translate(x,y);cx.fillStyle='#ecf8f6';cx.strokeStyle=OL;cx.lineWidth=1;cx.beginPath();cx.moveTo(-3,-36);cx.lineTo(3,-36);cx.lineTo(2.4,-2);cx.lineTo(0,6);cx.lineTo(-2.4,-2);cx.closePath();cx.fill();cx.stroke();
      cx.fillStyle='#d6ac4e';cx.fillRect(-8,-38,16,3.4);cx.fillStyle='#3a2414';cx.fillRect(-1.6,-47,3.2,9);break}
    case'stake':{const rise=Math.min(1,(1-k)*5),h=34*rise*(k>0.2?1:k*5);cx.translate(f.x,f.y);
      cx.fillStyle='rgba(40,25,10,0.4)';cx.beginPath();cx.ellipse(0,0,7,2.5,0,0,TAU);cx.fill();
      const gr=cx.createLinearGradient(-5,0,5,0);gr.addColorStop(0,'#3e2614');gr.addColorStop(0.5,'#8a5a30');gr.addColorStop(1,'#4a2e18');
      cx.fillStyle=gr;cx.strokeStyle=OL;cx.lineWidth=1;cx.beginPath();cx.moveTo(-5,0);cx.lineTo(-3.4,-h*0.72);cx.lineTo(3.4,-h*0.72);cx.lineTo(5,0);cx.closePath();cx.fill();cx.stroke();
      cx.fillStyle='#cfd8dc';cx.beginPath();cx.moveTo(-3.4,-h*0.72);cx.lineTo(0,-h);cx.lineTo(3.4,-h*0.72);cx.closePath();cx.fill();cx.stroke();
      if(rise<1&&Math.random()<0.4)addPart(f.x,f.y,rand(-60,60),rand(-120,-40),0.5,'#6a4a2a',2.5,500);break}
    case'arrowfall':{const y=f.y-k*150;additive(()=>{const gr=cx.createLinearGradient(f.x,y-50,f.x,y);gr.addColorStop(0,'rgba(0,0,0,0)');gr.addColorStop(1,'#fff3c8');cx.strokeStyle=gr;cx.lineWidth=3;cx.beginPath();cx.moveTo(f.x,y-50);cx.lineTo(f.x,y);cx.stroke()},'lighter');
      cx.strokeStyle='#8a6a44';cx.lineWidth=1.6;cx.beginPath();cx.moveTo(f.x,y-16);cx.lineTo(f.x,y);cx.stroke();if(k<0.25)additive(()=>glow(f.x,f.y,10,'#ffe7a8',1-k*4),'lighter');break}
    case'ghost':if(f.img){cx.globalAlpha=k*0.6;cx.drawImage(f.img,f.x-50,f.y-110,100,118)}break;
    case'ghostB':cx.globalAlpha=k*0.3;drawBoss(cx,Object.assign({},f.e,{x:f.x,y:f.y}),G.t);break;
    case'pillar':{additive(()=>{const w=f.w*(0.4+k*0.6);const gr=cx.createLinearGradient(f.x-w,0,f.x+w,0);gr.addColorStop(0,'rgba(0,0,0,0)');gr.addColorStop(0.5,f.col);gr.addColorStop(1,'rgba(0,0,0,0)');
        cx.globalAlpha=k*0.8;cx.fillStyle=gr;cx.fillRect(f.x-w,f.y-f.h,w*2,f.h);glow(f.x,f.y,w*2,f.col,k*0.6)});break}
    case'streak':{normal(()=>{const gr=cx.createLinearGradient(f.x1,f.y1,f.x2,f.y2);gr.addColorStop(0,'rgba(255,255,255,0)');gr.addColorStop(1,f.col);cx.globalAlpha=k*0.9;cx.strokeStyle=gr;cx.lineWidth=f.w*k+2;cx.lineCap='round';
        cx.beginPath();cx.moveTo(f.x1,f.y1);cx.lineTo(f.x2,f.y2);cx.stroke()});additive(()=>{cx.globalAlpha=k;cx.strokeStyle='#ffffff';cx.lineWidth=2*k;cx.lineCap='round';cx.beginPath();cx.moveTo(f.x1,f.y1);cx.lineTo(f.x2,f.y2);cx.stroke()},'lighter');break}
    case'xslash':{cx.translate(f.x,f.y);const s=26*(1.3-k*0.3);cx.lineCap='round';
      normal(()=>{cx.globalAlpha=k;cx.strokeStyle=f.col;cx.lineWidth=9;cx.beginPath();cx.moveTo(-s,-s);cx.lineTo(s,s);cx.moveTo(s,-s);cx.lineTo(-s,s);cx.stroke()});
      additive(()=>{cx.globalAlpha=k;cx.strokeStyle='#fff';cx.lineWidth=3;cx.beginPath();cx.moveTo(-s,-s);cx.lineTo(s,s);cx.moveTo(s,-s);cx.lineTo(-s,s);cx.stroke();glow(0,0,24,f.col,k)},'lighter');break}
  }
  cx.restore();
}
