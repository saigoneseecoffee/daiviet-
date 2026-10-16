/* ============ 10 PHONG CÁCH VẼ — CÙNG MỘT CẢNH ============ */
(function(){
'use strict';
const VW=360,VH=240,GY=198,HX=120,EX=244,SC=1.17,CYC=2.6,PI=Math.PI;
const ease=t=>t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2,eIn=t=>t*t*t;
const h1=i=>{const x=Math.sin(i*12.9898+78.233)*43758.5453;return x-Math.floor(x)};
const mkc=(w,h)=>{const c=document.createElement('canvas');c.width=w;c.height=h;return c};

/* ---------------- KHUNG XƯƠNG & HOẠT ẢNH ---------------- */
function kf(F,t){for(let i=0;i<F.length-1;i++){const a=F[i],b=F[i+1];if(t>=a[0]&&t<=b[0]){let k=(t-a[0])/((b[0]-a[0])||1);k=b[2]==='in'?eIn(k):ease(k);const o={};for(const key in a[1])o[key]=a[1][key]+(b[1][key]-a[1][key])*k;return o}}return Object.assign({},F[F.length-1][1])}
const HI={x:0,lean:.04,hF:.2,sF:.05,hB:-.18,sB:-.32,aF:.45,eF:1.5,sw:2.25,aB:.3,eB:.75,hd:0};
const mk=o=>Object.assign({},HI,o);
const HERO=[[0,HI],[.55,mk({x:2})],[.9,mk({x:6,lean:.12,hF:.42,sF:.1,hB:-.3,sB:-.45,aF:.6,eF:1.6,sw:2.4,aB:.2,eB:.6})],
 [1.05,mk({x:6,lean:-.06,hF:.25,sF:0,hB:-.22,sB:-.35,aF:3.4,eF:3.9,sw:3.95,aB:-.5,eB:.2,hd:-.1})],
 [1.27,mk({x:16,lean:.3,hF:.6,sF:.2,hB:-.5,sB:-.25,aF:1.15,eF:.95,sw:.7,aB:-.8,eB:-.3,hd:.1}),'in'],
 [1.6,mk({x:16,lean:.26,hF:.58,sF:.2,hB:-.48,sB:-.25,aF:1.05,eF:.9,sw:.75,aB:-.7,eB:-.3,hd:.1})],
 [2.3,mk({x:4})],[CYC,HI]];
const EI={x:0,lean:.06,hF:.22,sF:.08,hB:-.2,sB:-.3,aF:.6,eF:1.3,sw:2.0,aB:.4,eB:.9,hd:0};
const mkE=o=>Object.assign({},EI,o);
const ENEMY=[[0,EI],[1.22,EI],[1.32,mkE({x:-14,lean:-.38,hF:.35,sF:.3,hB:-.05,sB:-.2,aF:-.4,eF:-1,sw:3.4,aB:1.2,eB:1.8,hd:-.35})],
 [1.75,mkE({x:-12,lean:-.25,hF:.3,sF:.2,hB:-.1,sB:-.25,aF:.1,eF:.6,sw:2.6,aB:.9,eB:1.4,hd:-.2})],[2.45,EI],[CYC,EI]];
const P2=(o,a,l)=>[o[0]+Math.sin(a)*l,o[1]+Math.cos(a)*l];
const add=(a,b)=>[a[0]+b[0],a[1]+b[1]];
function rig(p,t){
  const kF0=P2([2,0],p.hF,22),fF0=P2(kF0,p.sF,22),kB0=P2([-2,0],p.hB,22),fB0=P2(kB0,p.sB,22);
  const hy=-Math.max(fF0[1],fB0[1]);const sh=q=>[q[0]+p.x,q[1]+hy];
  const hip=[p.x,hy];const br=Math.sin(t*3.4)*.6;
  const u=[Math.sin(p.lean),-Math.cos(p.lean)],n=[Math.cos(p.lean),Math.sin(p.lean)];
  const T=(tt,s)=>[hip[0]+u[0]*s+n[0]*tt,hip[1]+u[1]*s+n[1]*tt];
  const neck=T(0,30+br),hd=P2(neck,PI-(p.lean*.6+p.hd),13);
  const shF=T(1.5,28+br),shB=T(-2.5,28+br),eF=P2(shF,p.aF,17),hF=P2(eF,p.eF,16),eB=P2(shB,p.aB,17),hB=P2(eB,p.eB,15);
  return{hip,hipF:sh([2,0]),hipB:sh([-2,0]),kF:sh(kF0),fF:sh(fF0),kB:sh(kB0),fB:sh(fB0),T,neck,hd,shF,shB,eF,hF,eB,hB,sd:[Math.sin(p.sw),Math.cos(p.sw)],p};
}
function arcPts(c,r,a0,a1,n){const o=[];for(let i=0;i<=n;i++){const a=a0+(a1-a0)*i/n;o.push([c[0]+Math.cos(a)*r,c[1]+Math.sin(a)*r])}return o}
/* danh sách mảnh hình, vẽ từ sau ra trước */
function build(J,who,t,hs){
  hs=(hs||1)*1.08;const out=[];const T=J.T,hd=J.hd;
  const L=(a,b,w,r)=>out.push({k:'L',a,b,w,r}),Y=(pts,r,x)=>out.push(Object.assign({k:'Y',pts,r},x||{})),C=(c,rad,r)=>out.push({k:'C',c,rad,r}),Tl=(pts,w,r)=>out.push({k:'T',pts,w,r});
  const H=(dx,dy)=>[hd[0]+dx*hs,hd[1]+dy*hs];
  L(J.hipB,J.kB,8.4,'pantsD');L(J.kB,J.fB,7,'pantsD');L(J.fB,add(J.fB,[6,.5]),5,'bootD');
  L(J.shB,J.eB,7.8,'robeD');L(J.eB,J.hB,6.8,'robeD');C(J.hB,3,'skin');
  const w1=Math.sin(t*6)*1.5;
  if(who==='hero'){Tl([H(-9,-4),H(-15,-2+w1),H(-21,3+w1*1.3)],2.4,'accent');Tl([H(-9,-3),H(-14,3+w1),H(-18,9+w1)],2.2,'accent')}
  else Tl([H(-9,-5),H(-16,-1+w1),H(-22,4+w1*1.4)],3.4,'scarf');
  L(J.hipF,J.kF,8.4,'pants');L(J.kF,J.fF,7,'pants');L(J.fF,add(J.fF,[6,.5]),5,'boot');
  Y([T(-8,30),T(8.4,30),T(7.2,13),T(12.5,-20),T(-12,-20),T(-7.2,13)],'robe',{torso:1,T});
  Y([T(2,12),T(5.8,12),T(8.6,-19.5),T(3,-19.5)],'accent');
  L(T(-3.5,29.5),T(4.5,20),2.4,'accent');
  Y([T(-7.3,15),T(7.6,15),T(7.4,11),T(-7.1,11)],'sash');C(T(3,13),1.8,'hilt');
  L(J.neck,hd,5,'skin');
  if(who==='hero')C(H(-1.4,.8),11.6*hs,'hair');
  C(hd,10.6*hs,'skin');out[out.length-1].face=1;
  if(who==='hero'){Y(arcPts(hd,10.9*hs,PI*1.02,PI*2.02,10),'hair',{cap:1});C(H(-2,-12.8),4.6*hs,'hair');Y([H(-10.7,-5.4),H(10.7,-5.4),H(10.5,-2.4),H(-10.5,-2.4)],'accent')}
  else{Y(arcPts(hd,11.6*hs,PI*.95,PI*2.05,12),'scarf',{cap:1});Y([H(-11,-1),H(11.2,-1),H(10.8,2),H(-10.8,2)],'scarf');C(H(-10,-2),3.4*hs,'scarf')}
  C(H(5.3,.6),1.7*hs,'eye');
  L(H(2.6,-3.2+(who==='enemy'?.6:0)),H(7.2,-3.4-(who==='enemy'?1:0)),1.3*hs,'brow');
  const d=J.sd,pp=[-d[1],d[0]],hF=J.hF;
  L(add(hF,[-d[0]*9,-d[1]*9]),hF,3.2,'grip');
  L(add(hF,[pp[0]*5.5,pp[1]*5.5]),add(hF,[-pp[0]*5.5,-pp[1]*5.5]),2.6,'hilt');
  if(who==='hero'){const b=add(hF,[d[0]*2,d[1]*2]),tip=add(hF,[d[0]*52,d[1]*52]),nt=add(hF,[d[0]*46,d[1]*46]);
    Y([add(b,[pp[0]*2,pp[1]*2]),add(nt,[pp[0]*1.6,pp[1]*1.6]),tip,add(nt,[-pp[0]*1.6,-pp[1]*1.6]),add(b,[-pp[0]*2,-pp[1]*2])],'blade',{edge:[b,tip]})}
  else{const a=[],b2=[];for(let i=0;i<=8;i++){const s=i/8,len=2+s*42,cv=-Math.sin(s*PI*.9)*5;const c=add(hF,[d[0]*len+pp[0]*cv,d[1]*len+pp[1]*cv]);const w=i===8?0:2.6+s*1.4;a.push(add(c,[pp[0]*w,pp[1]*w]));b2.unshift(add(c,[-pp[0]*w*.4,-pp[1]*w*.4]))}
    Y(a.concat(b2),'blade',{edge:[hF,add(hF,[d[0]*44,d[1]*44])]})}
  L(J.shF,J.eF,8,'robe');L(J.eF,J.hF,7,'robe');C(J.hF,3.2,'skin');
  return out;
}
function shp(g,p,dx,dy){dx=dx||0;dy=dy||0;g.beginPath();
  if(p.k==='L'){const ax=p.a[0]+dx,ay=p.a[1]+dy,bx=p.b[0]+dx,by=p.b[1]+dy,r=p.w/2,th=Math.atan2(by-ay,bx-ax);g.arc(ax,ay,r,th+PI/2,th+PI*1.5);g.arc(bx,by,r,th-PI/2,th+PI/2);g.closePath()}
  else if(p.k==='Y'){g.moveTo(p.pts[0][0]+dx,p.pts[0][1]+dy);for(let i=1;i<p.pts.length;i++)g.lineTo(p.pts[i][0]+dx,p.pts[i][1]+dy);g.closePath()}
  else if(p.k==='C'){g.arc(p.c[0]+dx,p.c[1]+dy,p.rad,0,PI*2)}
  else{g.moveTo(p.pts[0][0]+dx,p.pts[0][1]+dy);g.quadraticCurveTo(p.pts[1][0]+dx,p.pts[1][1]+dy,p.pts[2][0]+dx,p.pts[2][1]+dy)}}
function ptsOf(p){if(p.k==='Y')return p.pts;if(p.k==='C')return arcPts(p.c,p.rad,0,PI*2,14).slice(0,14);
  const r=p.w/2,th=Math.atan2(p.b[1]-p.a[1],p.b[0]-p.a[0]);return arcPts(p.a,r,th+PI/2,th+PI*1.5,5).concat(arcPts(p.b,r,th-PI/2,th+PI/2,5))}
/* ---------------- CẢNH ---------------- */
const TR=[];for(let tt=1.05;tt<=1.3001;tt+=.0125){const J=rig(kf(HERO,tt),tt);TR.push({t:tt,tip:P2(J.hF,J.p.sw,52),mid:P2(J.hF,J.p.sw,20)})}
const toW=(q,side,px)=>side>0?[HX+q[0]*SC,GY+q[1]*SC]:[EX-q[0]*SC,GY+q[1]*SC];
function scene(t,hs){const hp=kf(HERO,t),ep=kf(ENEMY,t),hj=rig(hp,t),ej=rig(ep,t);
  const tr=[];let ta=0;if(t>=1.05&&t<1.62){const te=Math.min(t,1.3),ts=Math.max(1.05,te-.085)+(t>1.3?(t-1.3)*.4:0);for(const s of TR)if(s.t<=te&&s.t>=ts)tr.push({tip:toW(s.tip,1),mid:toW(s.mid,1),ltip:s.tip,lmid:s.mid});ta=t<=1.3?1:Math.max(0,1-(t-1.3)/.32)}
  const hk=t-1.24;
  return{t,hp,ep,hj,ej,hero:build(hj,'hero',t,hs),enemy:build(ej,'enemy',t,hs),tr,ta,hk,imp:toW(ej.T(0,20),-1),flash:hk>=0&&hk<.13}}
function fig(g,parts,side,fn){g.save();g.translate(side>0?HX:EX,GY);g.scale(side*SC,SC);for(const p of parts)fn(p,side);g.restore()}
function trailPath(g,tr){g.beginPath();g.moveTo(tr[0].tip[0],tr[0].tip[1]);for(const s of tr)g.lineTo(s.tip[0],s.tip[1]);for(let i=tr.length-1;i>=0;i--)g.lineTo(tr[i].mid[0],tr[i].mid[1]);g.closePath()}
function burst(n,seed,k,spd,grav){const o=[];const e=1-Math.pow(1-Math.min(1,k/.45),3);for(let i=0;i<n;i++){const a=h1(seed+i)*PI*2,v=spd*(.35+.65*h1(seed+i*7.1));o.push({x:Math.cos(a)*v*e,y:Math.sin(a)*v*e*.7+(grav||0)*k*k,r:h1(seed+i*3.3),a,i})}return o}
function dmgPos(sc){const k=sc.hk;if(k<0||k>.95)return null;return{x:sc.imp[0]+8,y:sc.imp[1]-24-k*34,a:k<.7?1:1-(k-.7)/.25,s:k<.08?1+(.08-k)*7:1}}
function txt(g,s,x,y,font,fill,stroke,lw){g.font=font;g.textAlign='center';g.textBaseline='middle';if(stroke){g.lineJoin='round';g.lineWidth=lw||3;g.strokeStyle=stroke;g.strokeText(s,x,y)}g.fillStyle=fill;g.fillText(s,x,y)}
function noisePat(seed,a){const c=mkc(96,96),x=c.getContext('2d'),R=mulberry32(seed),im=x.createImageData(96,96);for(let i=0;i<96*96;i++){const v=R()*255;im.data[i*4]=v;im.data[i*4+1]=v;im.data[i*4+2]=v;im.data[i*4+3]=R()*255*a}x.putImageData(im,0,0);return c}
function hills(g,R,y0,amp,col,step){g.beginPath();g.moveTo(-10,VH);let y=y0;for(let x=-10;x<=VW+10;x+=step){y=y0+Math.sin(x*.021+R()*2)*amp*.5+Math.sin(x*.007)*amp;g.lineTo(x,y)}g.lineTo(VW+10,VH);g.closePath();if(col){g.fillStyle=col;g.fill()}}

/* ================= 1. HOẠT HÌNH VECTOR (ĐANG DÙNG) ================= */
const sVector={bg(g){const P=MAPS[0].pal;g.fillStyle=P.g[0];g.fillRect(0,0,VW,VH);
    const R=mulberry32(5);for(let i=0;i<60;i++){g.fillStyle=R()>.5?P.g[1]:P.g[2];g.globalAlpha=.55;g.beginPath();g.ellipse(R()*VW,R()*VH,20+R()*30,10+R()*16,R()*3,0,PI*2);g.fill()}g.globalAlpha=1;
    g.fillStyle=P.path;g.beginPath();g.ellipse(180,GY+6,230,34,0,0,PI*2);g.fill();
    for(let i=0;i<40;i++){g.fillStyle=R()>.5?'rgba(255,240,210,.3)':'rgba(60,40,20,.2)';g.beginPath();g.arc(30+R()*300,GY-10+R()*36,1.5+R()*2,0,PI*2);g.fill()}
    for(let i=0;i<120;i++){const x=R()*VW,y=R()*VH;if(Math.abs(y-GY-6)<34)continue;g.strokeStyle=R()>.6?'rgba(255,255,200,.25)':'rgba(20,40,10,.3)';g.lineWidth=1.4;g.beginPath();g.moveTo(x,y);g.lineTo(x+(R()-.5)*5,y-6);g.stroke()}
    g.save();g.translate(44,GY-4);g.scale(.95,.95);drawObj(g,'banyan',0,P);g.restore();
    g.save();g.translate(336,GY-6);drawObj(g,'bamboo',1,P);g.restore()},
  draw(g,sc){const t=sc.t,atk=t>=.95&&t<1.7?(t-.95)/.75:-1;
    drawHuman(g,{x:EX-sc.ep.x*SC,y:GY,f:-1,look:factionLook('phi','sword'),atk:-1,t:t+2,sc:1.85});
    if(sc.flash){g.save();g.globalCompositeOperation='lighter';g.globalAlpha=.75;drawHuman(g,{x:EX-sc.ep.x*SC,y:GY,f:-1,look:factionLook('phi','sword'),atk:-1,t:t+2,sc:1.85});g.restore()}
    drawHuman(g,{x:HX+sc.hp.x*SC,y:GY,f:1,look:LOOKS.kiem,atk,t,sc:1.85,glow:1});
    if(sc.tr.length>1){g.save();g.globalAlpha=sc.ta*.85;g.fillStyle='#35b0a3';trailPath(g,sc.tr);g.fill();g.globalCompositeOperation='lighter';g.strokeStyle='#fffbe8';g.lineWidth=2.4;g.beginPath();sc.tr.forEach((s,i)=>i?g.lineTo(s.tip[0],s.tip[1]):g.moveTo(s.tip[0],s.tip[1]));g.stroke();g.restore()}
    if(sc.hk>=0&&sc.hk<.5){g.save();g.globalCompositeOperation='lighter';for(const q of burst(10,3,sc.hk,70,90)){g.strokeStyle='#fff0c8';g.globalAlpha=1-sc.hk*2;g.lineWidth=2;g.beginPath();g.moveTo(sc.imp[0]+q.x,sc.imp[1]+q.y);g.lineTo(sc.imp[0]+q.x*.7,sc.imp[1]+q.y*.7);g.stroke()}g.restore()}
    const d=dmgPos(sc);if(d){g.globalAlpha=d.a;txt(g,'128',d.x,d.y,`800 ${16*d.s}px "Be Vietnam Pro",system-ui,sans-serif`,'#fff4e0','rgba(30,12,6,.9)',4);g.globalAlpha=1}}};

/* ================= 2. PIXEL 16-BIT ================= */
const SW16=['#1a1c2c','#5d275d','#b13e53','#ef7d57','#ffcd75','#a7f070','#38b764','#257179','#29366f','#3b5dc9','#41a6f6','#73eff7','#f4f4f4','#94b0c2','#566c86','#333c57'];
const SWRGB=SW16.map(h=>[parseInt(h.slice(1,3),16),parseInt(h.slice(3,5),16),parseInt(h.slice(5,7),16)]);
const PXH={skin:'#ffcd75',hair:'#1a1c2c',robe:'#f4f4f4',robeD:'#94b0c2',pants:'#333c57',pantsD:'#29366f',boot:'#5d275d',bootD:'#5d275d',accent:'#257179',sash:'#b13e53',hilt:'#ffcd75',grip:'#5d275d',blade:'#73eff7',eye:'#1a1c2c',brow:'#1a1c2c'};
const PXE={skin:'#ef7d57',hair:'#1a1c2c',robe:'#566c86',robeD:'#333c57',pants:'#5d275d',pantsD:'#5d275d',boot:'#1a1c2c',bootD:'#1a1c2c',accent:'#ef7d57',scarf:'#b13e53',sash:'#ef7d57',hilt:'#ffcd75',grip:'#5d275d',blade:'#94b0c2',eye:'#1a1c2c',brow:'#1a1c2c'};
const DIG={'0':'111101101101111','1':'010110010010111','2':'111001111100111','3':'111001111001111','4':'101101111001001','5':'111100111001111','6':'111100111101111','7':'111001010010010','8':'111101111101111','9':'111101111001111'};
function pcirc(b,cx,cy,r,col){b.fillStyle=col;for(let y=-r;y<=r;y++)for(let x=-r;x<=r;x++)if(x*x+y*y<=r*r+r*.6)b.fillRect(Math.round(cx+x),Math.round(cy+y),1,1)}
function pixelBG(b){const W=120,H=80,gy=Math.round(GY/3);
  const bands=[['#29366f',0],['#3b5dc9',14],['#41a6f6',30],['#73eff7',44]];
  for(let y=0;y<gy;y++){let c=bands[0][0];for(const[bc,by]of bands)if(y>=by)c=bc;b.fillStyle=c;b.fillRect(0,y,W,1);
    for(const[bc,by]of bands)if(y>=by-3&&y<by){b.fillStyle=bc;for(let x=(y%2);x<W;x+=2)b.fillRect(x,y,1,1)}}
  pcirc(b,96,12,6,'#ffcd75');pcirc(b,96,12,4,'#f4f4f4');
  const R=mulberry32(9);
  for(let x=0;x<W;x++){const h=Math.round(10+Math.sin(x*.09)*5+Math.sin(x*.23+1)*2);b.fillStyle='#566c86';b.fillRect(x,gy-h-12,1,h+12)}
  for(let x=0;x<W;x++){const h=Math.round(6+Math.sin(x*.13+2)*3);b.fillStyle='#257179';b.fillRect(x,gy-h-4,1,h+4)}
  b.fillStyle='#38b764';b.fillRect(0,gy,W,H-gy);b.fillStyle='#a7f070';b.fillRect(0,gy,W,1);
  for(let i=0;i<70;i++){b.fillStyle=R()>.5?'#257179':'#a7f070';b.fillRect(Math.floor(R()*W),gy+2+Math.floor(R()*(H-gy-2)),1,1)}
  b.fillStyle='#ef7d57';for(let x=8;x<112;x++){const w=Math.round(4+Math.sin(x*.2)*1);b.fillRect(x,gy+3,1,w)}b.fillStyle='#ffcd75';for(let x=10;x<110;x+=4)b.fillRect(x,gy+4,1,1);
  b.fillStyle='#5d275d';b.fillRect(13,gy-20,4,20);b.fillStyle='#1a1c2c';b.fillRect(16,gy-20,1,20);
  pcirc(b,15,gy-26,9,'#257179');pcirc(b,10,gy-30,6,'#38b764');pcirc(b,19,gy-33,6,'#38b764');pcirc(b,14,gy-36,5,'#38b764');pcirc(b,12,gy-33,2,'#a7f070');pcirc(b,19,gy-36,2,'#a7f070');
  for(let k=0;k<3;k++){const x=108+k*4;for(let y=gy-40+k*3;y<gy;y++){b.fillStyle=(y%7===0)?'#257179':'#a7f070';b.fillRect(x,y,1,1);b.fillStyle='#38b764';b.fillRect(x+1,y,1,1)}b.fillStyle='#38b764';b.fillRect(x-3,gy-38+k*3,3,1);b.fillRect(x+2,gy-30+k*3,3,1)}}
const sPixel={draw(g,sc,card){const W=120,H=80,s=3;
  if(!card.pbg){card.pbg=mkc(W,H);pixelBG(card.pbg.getContext('2d'))}
  const B=card.pb||(card.pb=mkc(W,H)),F=card.pf||(card.pf=mkc(W,H));const b=B.getContext('2d'),f=F.getContext('2d',{willReadFrequently:true});
  b.clearRect(0,0,W,H);b.drawImage(card.pbg,0,0);
  f.setTransform(1,0,0,1,0,0);f.clearRect(0,0,W,H);f.setTransform(1/s,0,0,1/s,0,0);
  const flat=pal=>(p)=>{if(p.r==='eye'||p.r==='brow')return;const c=pal[p.r]||'#f0f';if(p.k==='T'){f.strokeStyle=c;f.lineWidth=p.w*1.6;shp(f,p);f.stroke();return}f.fillStyle=c;shp(f,p);f.fill()};
  fig(f,sc.enemy,-1,flat(sc.flash?new Proxy({},{get:()=>'#f4f4f4'}):PXE));fig(f,sc.hero,1,flat(PXH));
  if(sc.tr.length>1&&sc.ta>.45){f.fillStyle='#f4f4f4';trailPath(f,sc.tr);f.fill();f.strokeStyle='#73eff7';f.lineWidth=6;f.beginPath();sc.tr.forEach((q,i)=>i?f.lineTo(q.tip[0],q.tip[1]):f.moveTo(q.tip[0],q.tip[1]));f.stroke()}
  const id=f.getImageData(0,0,W,H),d=id.data,m=new Uint8Array(W*H);
  for(let i=0;i<W*H;i++){if(d[i*4+3]<110){d[i*4+3]=0;continue}let best=0,bd=1e9;const r=d[i*4],gg=d[i*4+1],bb=d[i*4+2];
    for(let k=0;k<16;k++){const c=SWRGB[k],dd=(r-c[0])**2+(gg-c[1])**2+(bb-c[2])**2;if(dd<bd){bd=dd;best=k}}const c=SWRGB[best];d[i*4]=c[0];d[i*4+1]=c[1];d[i*4+2]=c[2];d[i*4+3]=255;m[i]=1}
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){const i=y*W+x;if(m[i])continue;if((x>0&&m[i-1])||(x<W-1&&m[i+1])||(y>0&&m[i-W])||(y<H-1&&m[i+W])){d[i*4]=26;d[i*4+1]=28;d[i*4+2]=44;d[i*4+3]=255}}
  f.putImageData(id,0,0);b.drawImage(F,0,0);
  if(sc.hk>=0&&sc.hk<.5){for(const q of burst(9,4,sc.hk,24,30)){b.fillStyle=q.i%2?'#ffcd75':'#f4f4f4';b.fillRect(Math.round(sc.imp[0]/s+q.x),Math.round(sc.imp[1]/s+q.y),q.r>.6?2:1,q.r>.6?2:1)}}
  const dp=dmgPos(sc);if(dp&&dp.a>.3){const x0=Math.round(dp.x/s)-5,y0=Math.round(dp.y/s);const str='128';
    for(const[ox,oy,col]of[[-1,0,'#1a1c2c'],[1,0,'#1a1c2c'],[0,-1,'#1a1c2c'],[0,1,'#1a1c2c'],[0,0,'#ffcd75']]){b.fillStyle=col;[...str].forEach((ch,ci)=>{const bm=DIG[ch];for(let k=0;k<15;k++)if(bm[k]==='1')b.fillRect(x0+ci*4+k%3+ox,y0+Math.floor(k/3)+oy,1,1)})}}
  g.setTransform(1,0,0,1,0,0);g.imageSmoothingEnabled=false;g.drawImage(B,0,0,g.canvas.width,g.canvas.height);g.imageSmoothingEnabled=true}};

/* ================= 3. THỦY MẶC ================= */
const INK='rgba(18,16,14,';
function leaf(g,x,y,a,len,w){g.save();g.translate(x,y);g.rotate(a);g.beginPath();g.moveTo(0,0);g.quadraticCurveTo(len*.4,-w,len,0);g.quadraticCurveTo(len*.4,w*.5,0,0);g.fill();g.restore()}
function seal(g,x,y,s,col,a,b){g.fillStyle=col;g.beginPath();g.roundRect(x,y,s,s,2);g.fill();g.fillStyle='rgba(255,245,230,.92)';g.font=`400 ${s*.3}px "Yeseva One",Georgia,serif`;g.textAlign='center';g.textBaseline='middle';g.fillText(a,x+s/2,y+s*.32);g.fillText(b,x+s/2,y+s*.7)}
const INKH={skin:{f:'rgba(250,244,230,.9)',lw:1.1},hair:{f:INK+'.95)',lw:0},robe:{f:INK+'.07)',lw:2,limb:{f:INK+'.42)',lw:0}},robeD:{f:INK+'.62)',lw:0},pants:{f:INK+'.72)',lw:1},pantsD:{f:INK+'.86)',lw:0},boot:{f:INK+'.95)',lw:0},bootD:{f:INK+'.95)',lw:0},
  accent:{f:'#b3311f',lw:0,red:1},sash:{f:INK+'.8)',lw:0},hilt:{f:INK+'.9)',lw:0},grip:{f:INK+'.9)',lw:0},blade:{f:'rgba(250,246,236,.9)',lw:1.2},eye:{f:INK+'.95)',lw:0},brow:{f:INK+'.9)',lw:0}};
const INKE=Object.assign({},INKH,{robe:{f:INK+'.3)',lw:1.8,limb:{f:INK+'.62)',lw:0}},robeD:{f:INK+'.78)',lw:0},scarf:{f:INK+'.85)',lw:0},accent:{f:INK+'.6)',lw:0},sash:{f:INK+'.6)',lw:0}});
const sInk={bg(g){const R=mulberry32(21);g.fillStyle='#efe7d6';g.fillRect(0,0,VW,VH);
    const v=g.createRadialGradient(VW/2,VH/2,80,VW/2,VH/2,260);v.addColorStop(0,'rgba(0,0,0,0)');v.addColorStop(1,'rgba(120,96,60,.28)');g.fillStyle=v;g.fillRect(0,0,VW,VH);
    for(let i=0;i<700;i++){g.strokeStyle=`rgba(120,96,60,${.03+R()*.05})`;g.lineWidth=.5;const x=R()*VW,y=R()*VH,a=R()*PI;g.beginPath();g.moveTo(x,y);g.lineTo(x+Math.cos(a)*(3+R()*8),y+Math.sin(a)*(3+R()*8));g.stroke()}
    [[120,.18,22],[146,.32,16],[172,.5,12]].forEach(([y0,al,amp],k)=>{g.save();hills(g,R,y0,amp,null,6);const gr=g.createLinearGradient(0,y0-amp*1.6,0,y0+40);gr.addColorStop(0,INK+al+')');gr.addColorStop(1,INK+'0)');g.fillStyle=gr;g.fill();
      g.strokeStyle=INK+(al*.9)+')';g.lineWidth=1.2;g.stroke();g.restore()});
    g.fillStyle='rgba(239,231,214,.85)';g.fillRect(0,GY-24,VW,14);
    g.strokeStyle=INK+'.55)';g.lineCap='round';for(let i=0;i<9;i++){g.lineWidth=1+R()*2.5;g.beginPath();const x=R()*VW;g.moveTo(x,GY+4+R()*8);g.lineTo(x+20+R()*50,GY+5+R()*8);g.stroke()}
    for(let k=0;k<3;k++){const x=318+k*14,top=40+k*16;for(let y=GY;y>top;y-=22){g.strokeStyle=INK+'.78)';g.lineWidth=4.5-k;g.beginPath();g.moveTo(x,y-2);g.lineTo(x,y-19);g.stroke()}}
    g.fillStyle=INK+'.82)';for(let i=0;i<18;i++){leaf(g,300+R()*60,50+R()*110,-.4-R()*1.2+(R()>.5?PI:0),16+R()*10,4+R()*2)}
    seal(g,18,16,30,'#b3311f','Đại','Việt')},
  draw(g,sc){const part=pal=>(p)=>{let c=pal[p.r];if(!c)return;if(p.k==='L'&&c.limb)c=c.limb;
      if(p.k==='T'){g.strokeStyle=c.f;g.lineWidth=p.w;g.lineCap='round';shp(g,p);g.stroke();return}
      if(c.f){g.fillStyle=c.f;shp(g,p);g.fill()}
      if(c.lw){g.strokeStyle=INK+'.85)';g.lineWidth=c.lw;g.lineJoin='round';shp(g,p);g.stroke();g.strokeStyle=INK+'.25)';g.lineWidth=.8;shp(g,p,.7,.5);g.stroke()}};
    fig(g,sc.enemy,-1,part(INKE));fig(g,sc.hero,1,part(INKH));
    if(sc.tr.length>1){g.save();g.globalAlpha=sc.ta;g.fillStyle=INK+'.82)';trailPath(g,sc.tr);g.fill();
      g.strokeStyle=INK+'.5)';g.lineWidth=.9;for(let k=0;k<7;k++){const f=1.08+k*.05;g.beginPath();sc.tr.forEach((s,i)=>{if(h1(i*13+k)<.25)return;const x=s.mid[0]+(s.tip[0]-s.mid[0])*f,y=s.mid[1]+(s.tip[1]-s.mid[1])*f;i&&h1(i*13+k-1)>=.25?g.lineTo(x,y):g.moveTo(x,y)});g.stroke()}g.restore()}
    if(sc.hk>=0&&sc.hk<1.2){const al=sc.hk<.7?1:1-(sc.hk-.7)/.5;g.globalAlpha=al;for(const q of burst(16,8,sc.hk,46,0)){g.fillStyle=q.i<3?'#b3311f':INK+'.85)';g.beginPath();g.arc(sc.imp[0]+q.x,sc.imp[1]+q.y,.8+q.r*3.4,0,PI*2);g.fill()}g.globalAlpha=1}
    const d=dmgPos(sc);if(d){g.globalAlpha=d.a;txt(g,'128',d.x,d.y,`400 ${19*d.s}px "Yeseva One",Georgia,serif`,'#b3311f');g.globalAlpha=1}}};

/* ================= 4. ĐÔNG HỒ ================= */
const DK='#1d1715';
const DHH={skin:'#f3d1a2',hair:DK,robe:'#2d4f86',robeD:'#223c66',pants:DK,pantsD:DK,boot:'#7a2f1c',bootD:'#5e2414',accent:'#c8361f',sash:'#e2a92a',hilt:'#e2a92a',grip:'#7a2f1c',blade:'#f4efe3',eye:DK,brow:DK,dots:'#f0d9a6'};
const DHE={skin:'#efc596',hair:DK,robe:'#a33a22',robeD:'#7a2a18',pants:DK,pantsD:DK,boot:DK,bootD:DK,accent:'#3f7d4c',scarf:'#e2a92a',sash:'#3f7d4c',hilt:'#e2a92a',grip:'#5e2414',blade:'#e8e2d2',eye:DK,brow:DK,dots:'#f0c88a'};
const sDongHo={bg(g){const R=mulberry32(33);const gr=g.createLinearGradient(0,0,0,VH);gr.addColorStop(0,'#f2dfc6');gr.addColorStop(1,'#e9cfb0');g.fillStyle=gr;g.fillRect(0,0,VW,VH);
    for(let i=0;i<500;i++){g.fillStyle=`rgba(255,255,255,${.15+R()*.35})`;g.fillRect(R()*VW,R()*VH,.8+R(),.8+R())}
    for(let i=0;i<200;i++){g.fillStyle=`rgba(190,120,110,${R()*.08})`;g.fillRect(R()*VW,R()*VH,2,1)}
    g.lineWidth=2;g.strokeStyle=DK;
    g.fillStyle='#c8361f';g.beginPath();g.arc(304,46,20,0,PI*2);g.fill();g.stroke();g.strokeStyle='#e2a92a';g.lineWidth=1.4;g.beginPath();g.arc(304,46,13,0,PI*2);g.stroke();
    g.strokeStyle=DK;g.lineWidth=2;for(const[cx,cy]of[[96,40],[200,28]]){g.fillStyle='#f6ead6';g.beginPath();g.arc(cx,cy,10,PI,0);g.arc(cx+16,cy,13,PI,0);g.arc(cx+34,cy,9,PI,0);g.closePath();g.fill();g.stroke();
      g.beginPath();g.arc(cx+16,cy-2,5,PI*.9,PI*2.4);g.stroke()}
    g.fillStyle='#4f8a3c';g.beginPath();g.moveTo(0,VH);g.lineTo(0,GY-6);for(let x=0;x<=VW;x+=20)g.quadraticCurveTo(x+10,GY-14,x+20,GY-6);g.lineTo(VW,VH);g.closePath();g.fill();g.lineWidth=2.4;g.stroke();
    g.fillStyle='#e8c26a';g.beginPath();g.ellipse(180,GY+12,150,14,0,0,PI*2);g.fill();g.lineWidth=2;g.stroke();
    g.strokeStyle=DK;g.lineWidth=1.2;for(let i=0;i<40;i++){const x=R()*VW,y=GY+4+R()*36;if(Math.abs(y-GY-12)<12&&Math.abs(x-180)<140)continue;g.beginPath();g.moveTo(x-3,y-4);g.lineTo(x,y);g.lineTo(x+3,y-4);g.stroke()}
    for(let i=0;i<14;i++){const x=R()*VW,y=GY+22+R()*20;g.fillStyle='#e2a92a';g.beginPath();g.arc(x,y,2.4,0,PI*2);g.fill();g.stroke()}
    g.fillStyle='#8a4a24';g.lineWidth=2.2;g.beginPath();g.moveTo(36,GY-4);g.lineTo(40,GY-60);g.lineTo(50,GY-60);g.lineTo(54,GY-4);g.closePath();g.fill();g.stroke();
    g.fillStyle='#2f6b3a';g.beginPath();for(let i=0;i<12;i++){const a=i/12*PI*2,r=40+(i%2)*6;const x=45+Math.cos(a)*r,y=GY-92+Math.sin(a)*r*.8;i?g.quadraticCurveTo(45+Math.cos(a-.26)*(r+12),GY-92+Math.sin(a-.26)*(r+12)*.8,x,y):g.moveTo(x,y)}g.closePath();g.fill();g.stroke();
    g.lineWidth=1.2;for(let i=0;i<14;i++){const x=20+R()*50,y=GY-120+R()*56;g.beginPath();g.arc(x,y,5,PI*1.1,PI*1.9);g.stroke()}
    g.lineWidth=1.6;g.strokeRect(5,5,VW-10,VH-10);g.lineWidth=.8;g.strokeRect(9,9,VW-18,VH-18)},
  draw(g,sc){const t=sc.t;for(let i=0;i<14;i++){const a=.5+.5*Math.sin(t*3+i*1.7);g.fillStyle=`rgba(255,255,255,${a*.8})`;g.beginPath();g.arc(30+h1(i)*300,20+h1(i+9)*150,.9+a,0,PI*2);g.fill()}
    const part=(pal,fl)=>(p,side)=>{const c=fl&&p.r!=='eye'&&p.r!=='brow'?'#fff7e8':pal[p.r];if(!c)return;
      if(p.k==='T'){g.lineCap='round';g.strokeStyle=DK;g.lineWidth=p.w+2.4;shp(g,p);g.stroke();g.strokeStyle=c;g.lineWidth=p.w;g.stroke();return}
      g.fillStyle=c;shp(g,p,1.3,1);g.fill();
      if(p.torso&&!fl){g.save();shp(g,p,1.3,1);g.clip();g.fillStyle=pal.dots;for(let x=-30;x<30;x+=5)for(let y=-90;y<-20;y+=5){g.beginPath();g.arc(x+((y/5)%2?2.5:0),y,1,0,PI*2);g.fill()}g.restore()}
      if(p.r==='eye'||p.r==='brow')return;g.strokeStyle=DK;g.lineWidth=p.r==='blade'?1.4:2;g.lineJoin='round';shp(g,p);g.stroke();
      if(p.face){g.fillStyle='rgba(200,54,31,.55)';g.beginPath();g.arc(p.c[0]+3.6,p.c[1]+4.4,2.2,0,PI*2);g.fill()}};
    fig(g,sc.enemy,-1,part(DHE,sc.flash));fig(g,sc.hero,1,part(DHH));
    if(sc.tr.length>1){g.save();g.globalAlpha=sc.ta;g.fillStyle='#e2a92a';trailPath(g,sc.tr);g.fill();g.strokeStyle=DK;g.lineWidth=2;g.stroke();
      g.strokeStyle='#fff7e8';g.lineWidth=1.4;g.beginPath();sc.tr.forEach((s,i)=>{const x=(s.tip[0]*3+s.mid[0])/4,y=(s.tip[1]*3+s.mid[1])/4;i?g.lineTo(x,y):g.moveTo(x,y)});g.stroke();
      const l=sc.tr[sc.tr.length-1].tip;g.strokeStyle=DK;g.lineWidth=1.6;for(let k=0;k<3;k++){g.beginPath();for(let a=0;a<PI*3;a+=.3){const r=1+a*1.1;g.lineTo(l[0]+8+k*7+Math.cos(a)*r,l[1]-6+k*5+Math.sin(a)*r)}g.stroke()}g.restore()}
    if(sc.hk>=0&&sc.hk<.5){const k=sc.hk,s=k<.12?k/.12*1.2:1.2-(k-.12)*1.6;g.save();g.translate(sc.imp[0],sc.imp[1]);g.scale(s,s);g.fillStyle='#c8361f';g.strokeStyle=DK;g.lineWidth=2;g.beginPath();
      for(let i=0;i<16;i++){const a=i/16*PI*2,r=i%2?7:17;g.lineTo(Math.cos(a)*r,Math.sin(a)*r)}g.closePath();g.fill();g.stroke();g.fillStyle='#e2a92a';g.beginPath();g.arc(0,0,5,0,PI*2);g.fill();g.stroke();g.restore()}
    const d=dmgPos(sc);if(d){g.globalAlpha=d.a;txt(g,'128',d.x,d.y-6,`400 ${20*d.s}px "Yeseva One",Georgia,serif`,'#c8361f',DK,3);g.globalAlpha=1}}};

/* ================= 5. SƠN MÀI ================= */
const GOLD='#c99a3e';
const LQH={skin:'#e6c08f',hair:'#0c0605',robe:'#a1271a',robeD:'#6b160e',pants:'#140a08',pantsD:'#0c0605',boot:'#2a1410',bootD:'#1a0c08',accent:'#d4a24a',sash:'#d4a24a',hilt:'#e8be5a',grip:'#3a1a10',blade:'#f2e6c4',eye:'#0c0605',brow:'#0c0605'};
const LQE={skin:'#d9b080',hair:'#0c0605',robe:'#2a1410',robeD:'#1a0c08',pants:'#3a1a10',pantsD:'#2a1410',boot:'#0c0605',bootD:'#0c0605',accent:'#8a6a2a',scarf:'#a1271a',sash:'#a1271a',hilt:'#e8be5a',grip:'#3a1a10',blade:'#d8ccb0',eye:'#0c0605',brow:'#0c0605'};
const EGG=(()=>{const R=mulberry32(77),o=[];for(let tt=-11;tt<11;tt+=3.1)for(let s=-9;s<31;s+=3.3){if(tt+s*.32>3)continue;const j=()=>(R()-.5)*1.1,i=.45;o.push([[tt+i+j(),s+i+j()],[tt+3.1-i+j(),s+i+j()],[tt+3.1-i+j(),s+3.3-i+j()],[tt+i+j(),s+3.3-i+j()]])}return o})();
function crackle(g,x0,y0,w,h,seed,col){const R=mulberry32(seed);g.fillStyle=col;for(let y=y0;y<y0+h;y+=3.6)for(let x=x0;x<x0+w;x+=3.4){const j=()=>(R()-.5)*1.2;g.beginPath();g.moveTo(x+.5+j(),y+.5+j());g.lineTo(x+3+j(),y+.5+j());g.lineTo(x+3+j(),y+3.2+j());g.lineTo(x+.5+j(),y+3.2+j());g.closePath();g.fill()}}
const sLacquer={bg(g){const R=mulberry32(41);const gr=g.createLinearGradient(0,0,0,VH);gr.addColorStop(0,'#1d0a07');gr.addColorStop(.6,'#120605');gr.addColorStop(1,'#080303');g.fillStyle=gr;g.fillRect(0,0,VW,VH);
    for(let i=0;i<500;i++){g.fillStyle=`rgba(214,168,74,${R()*.45})`;g.beginPath();g.arc(R()*VW,R()*VH,.2+R()*.9,0,PI*2);g.fill()}
    const mg=g.createRadialGradient(290,52,4,300,58,30);mg.addColorStop(0,'#fff0b8');mg.addColorStop(.6,'#e2b24a');mg.addColorStop(1,'#a6772a');g.fillStyle=mg;g.beginPath();g.arc(300,58,28,0,PI*2);g.fill();
    g.strokeStyle='rgba(90,50,10,.5)';g.lineWidth=.6;for(let i=0;i<14;i++){const a=R()*PI*2;g.beginPath();g.moveTo(300+Math.cos(a)*6,58+Math.sin(a)*6);g.lineTo(300+Math.cos(a+.3)*26,58+Math.sin(a+.3)*26);g.stroke()}
    g.save();hills(g,R,128,20,'#3b0f0a',8);g.strokeStyle=GOLD;g.lineWidth=1;g.stroke();g.restore();
    g.save();hills(g,R,156,18,'#5a140c',8);g.strokeStyle=GOLD;g.lineWidth=1.2;g.stroke();g.clip();crackle(g,0,120,VW,80,5,'rgba(232,220,194,.3)');g.restore();
    g.strokeStyle=GOLD;g.lineWidth=1;for(const[cx,cy]of[[70,46],[180,34]]){g.beginPath();for(let a=0;a<PI*3.2;a+=.2){const r=2+a*2;g.lineTo(cx+Math.cos(a)*r*1.4,cy+Math.sin(a)*r*.6)}g.stroke();g.beginPath();g.moveTo(cx+14,cy+4);g.quadraticCurveTo(cx+40,cy-4,cx+60,cy+4);g.stroke()}
    g.fillStyle='#0a0403';g.fillRect(0,GY-2,VW,VH);g.strokeStyle=GOLD;g.lineWidth=1.4;g.beginPath();g.moveTo(0,GY-2);g.lineTo(VW,GY-2);g.stroke();
    g.strokeStyle='rgba(201,154,62,.5)';g.lineWidth=.7;for(let x=6;x<VW;x+=10){g.beginPath();g.moveTo(x,GY+6+(x%3)*4);g.lineTo(x+16,GY+6+(x%3)*4);g.stroke()}
    for(let k=0;k<4;k++){const x=22+k*11;g.strokeStyle=GOLD;g.lineWidth=2;g.beginPath();g.moveTo(x,GY-2);g.quadraticCurveTo(x+4,GY-60,x+2+k*3,GY-110+k*10);g.stroke();
      g.fillStyle='#d4a24a';for(let i=0;i<5;i++)leaf(g,x+3,GY-40-i*15+k*4,(i%2?.6:-PI-.6),14,3)}},
  draw(g,sc){const part=(pal,fl)=>(p)=>{const c=fl?'#ffe9a8':pal[p.r];if(!c)return;
      if(p.k==='T'){g.lineCap='round';g.strokeStyle=GOLD;g.lineWidth=p.w+1.6;shp(g,p);g.stroke();g.strokeStyle=c;g.lineWidth=p.w;g.stroke();return}
      if(p.r==='blade'){const e=p.edge,gr=g.createLinearGradient(e[0][0],e[0][1],e[1][0],e[1][1]);gr.addColorStop(0,'#e8c060');gr.addColorStop(.5,'#fff4d0');gr.addColorStop(1,'#c9a04a');g.fillStyle=gr}else g.fillStyle=c;
      shp(g,p);g.fill();
      if(p.torso&&!fl){g.save();shp(g,p);g.clip();g.fillStyle='rgba(232,220,194,.86)';for(const q of EGG){g.beginPath();q.forEach((v,i)=>{const w=p.T(v[0],v[1]);i?g.lineTo(w[0],w[1]):g.moveTo(w[0],w[1])});g.closePath();g.fill()}g.restore()}
      if(p.r!=='eye'&&p.r!=='brow'){g.strokeStyle=GOLD;g.lineWidth=1;g.lineJoin='round';shp(g,p);g.stroke()}};
    fig(g,sc.enemy,-1,part(LQE,sc.flash));fig(g,sc.hero,1,part(LQH));
    if(sc.tr.length>1){g.save();g.globalAlpha=sc.ta;const l=sc.tr[sc.tr.length-1];const gr=g.createLinearGradient(sc.tr[0].tip[0],sc.tr[0].tip[1],l.tip[0],l.tip[1]);gr.addColorStop(0,'rgba(201,154,62,0)');gr.addColorStop(1,'#f0c860');
      g.fillStyle=gr;trailPath(g,sc.tr);g.fill();sc.tr.forEach((s,i)=>{if(i%2)return;g.save();g.translate((s.tip[0]+s.mid[0])/2+h1(i)*10-5,(s.tip[1]+s.mid[1])/2+h1(i+3)*10-5);g.rotate(h1(i*5)*3);g.fillStyle=h1(i+7)>.5?'#f6dc90':'#c99a3e';g.fillRect(-1.6,-1.6,3.2,3.2);g.restore()});g.restore()}
    if(sc.hk>=0&&sc.hk<.8){for(const q of burst(18,11,sc.hk,60,60)){g.save();g.globalAlpha=1-sc.hk/.8;g.translate(sc.imp[0]+q.x,sc.imp[1]+q.y);g.rotate(q.a+sc.hk*8);g.fillStyle=q.i%3?'#f0c860':'#fff0c0';g.fillRect(-1.8,-1.8,3.6,3.6);g.restore()}}
    const d=dmgPos(sc);if(d){g.globalAlpha=d.a;const gr=g.createLinearGradient(0,d.y-10,0,d.y+10);gr.addColorStop(0,'#fff0b8');gr.addColorStop(1,'#c9963a');txt(g,'128',d.x,d.y,`400 ${19*d.s}px "Yeseva One",Georgia,serif`,gr,'#1a0907',3);g.globalAlpha=1}}};

/* ================= 6. CẮT GIẤY ================= */
const PCH={skin:'#f6d2b0',hair:'#2d2a33',robe:'#f4f1e8',robeD:'#d9d3c4',pants:'#3d5a73',pantsD:'#2f475c',boot:'#6b4a3a',bootD:'#57392b',accent:'#2fa39a',sash:'#e2574c',hilt:'#f2b84b',grip:'#6b4a3a',blade:'#dfe9ee',eye:'#2d2a33',brow:'#2d2a33'};
const PCE={skin:'#f0c39a',hair:'#2d2a33',robe:'#b9874f',robeD:'#9a6c3c',pants:'#4a3b35',pantsD:'#3a2d28',boot:'#2d2a33',bootD:'#2d2a33',accent:'#7a5a3a',scarf:'#d8473f',sash:'#3d5a73',hilt:'#f2b84b',grip:'#4a3b35',blade:'#cfd9de',eye:'#2d2a33',brow:'#2d2a33'};
function paperShadow(g,k,on){if(on){g.shadowColor='rgba(40,30,20,.35)';g.shadowBlur=2.6*k;g.shadowOffsetX=1.2*k;g.shadowOffsetY=1.8*k}else{g.shadowColor='transparent';g.shadowBlur=0;g.shadowOffsetX=0;g.shadowOffsetY=0}}
function jagPath(g,pts,seed){g.beginPath();pts.forEach((q,i)=>{const j=(h1(seed+i*1.7)-.5)*.7;i?g.lineTo(q[0]+j,q[1]-j):g.moveTo(q[0]+j,q[1]-j)});g.closePath()}
const sPaper={bg(g,k){const R=mulberry32(55);const gr=g.createLinearGradient(0,0,0,VH);gr.addColorStop(0,'#a8d8e2');gr.addColorStop(1,'#d8eee8');g.fillStyle=gr;g.fillRect(0,0,VW,VH);
    paperShadow(g,k,1);g.fillStyle='#f7c94b';g.beginPath();g.arc(300,44,20,0,PI*2);g.fill();
    g.fillStyle='#ffffff';for(const[cx,cy]of[[80,40],[190,26]]){g.beginPath();g.arc(cx,cy,10,PI,0);g.arc(cx+15,cy-4,13,PI,0);g.arc(cx+32,cy,9,PI,0);g.lineTo(cx+41,cy+6);g.lineTo(cx-10,cy+6);g.closePath();g.fill()}
    [['#9cc59a',120,16],['#79b07a',148,14],['#5f9a62',172,10]].forEach(([c,y,a])=>{hills(g,R,y,a,c,14)});
    g.fillStyle='#8cc46a';g.beginPath();g.moveTo(0,VH);g.lineTo(0,GY-6);for(let x=0;x<=VW;x+=24)g.quadraticCurveTo(x+12,GY-12,x+24,GY-6);g.lineTo(VW,VH);g.closePath();g.fill();
    g.fillStyle='#e9d39c';g.beginPath();g.ellipse(180,GY+12,150,13,0,0,PI*2);g.fill();
    g.fillStyle='#a0703f';g.beginPath();g.roundRect(38,GY-58,12,58,3);g.fill();
    for(const[x,y,r,c]of[[30,GY-74,22,'#3f8f4f'],[60,GY-80,22,'#3f8f4f'],[44,GY-100,24,'#56a865'],[28,GY-92,14,'#6fbf73'],[62,GY-102,14,'#6fbf73']]){g.fillStyle=c;g.beginPath();g.arc(x,y,r,0,PI*2);g.fill()}
    for(let i=0;i<10;i++){const x=R()*VW,y=GY+24+R()*16;g.fillStyle=['#e2574c','#f2b84b','#ffffff'][i%3];g.beginPath();for(let j=0;j<5;j++){const a=j/5*PI*2;g.arc(x+Math.cos(a)*2.4,y+Math.sin(a)*2.4,1.8,0,PI*2)}g.fill()}
    for(let k2=0;k2<3;k2++){g.fillStyle=['#7fbf5a','#96d070','#6aa84a'][k2];g.beginPath();g.moveTo(318+k2*12,GY);g.lineTo(322+k2*12,GY-90+k2*14);g.lineTo(326+k2*12,GY);g.closePath();g.fill()}
    paperShadow(g,k,0);g.globalCompositeOperation='multiply';g.fillStyle=g.createPattern(noisePat(3,.08),'repeat');g.fillRect(0,0,VW,VH);g.globalCompositeOperation='source-over'},
  draw(g,sc,card,k){const part=(pal,fl)=>(p)=>{const c=fl?'#ffffff':pal[p.r];if(!c||p.r==='brow')return;
      if(p.k==='T'){paperShadow(g,k,1);g.lineCap='butt';g.strokeStyle=c;g.lineWidth=p.w+.6;shp(g,p);g.stroke();return}
      paperShadow(g,k,p.r!=='eye');g.fillStyle=c;jagPath(g,ptsOf(p),p.pts?p.pts.length*3.1:(p.w||p.rad)*7.3);g.fill();
      paperShadow(g,k,0);if(p.r!=='eye'){g.strokeStyle='rgba(255,255,255,.45)';g.lineWidth=.6;g.stroke()}};
    fig(g,sc.enemy,-1,part(PCE,sc.flash));fig(g,sc.hero,1,part(PCH));paperShadow(g,k,0);
    if(sc.tr.length>1){g.save();g.globalAlpha=sc.ta;paperShadow(g,k,1);g.fillStyle='#ffffff';trailPath(g,sc.tr);g.fill();paperShadow(g,k,0);
      g.strokeStyle='rgba(47,163,154,.35)';g.lineWidth=.8;sc.tr.forEach((s,i)=>{if(i%3)return;g.beginPath();g.moveTo(s.tip[0],s.tip[1]);g.lineTo(s.mid[0],s.mid[1]);g.stroke()});g.restore()}
    if(sc.hk>=0&&sc.hk<1){const cols=['#e2574c','#f2b84b','#2fa39a','#ffffff','#3d5a73'];for(const q of burst(16,21,sc.hk,56,120)){g.save();g.globalAlpha=sc.hk<.7?1:1-(sc.hk-.7)/.3;g.translate(sc.imp[0]+q.x,sc.imp[1]+q.y);g.rotate(q.a+sc.hk*10*(q.r-.5));paperShadow(g,k,1);g.fillStyle=cols[q.i%5];g.fillRect(-3,-1.6,6,3.2);g.restore()}}
    const d=dmgPos(sc);if(d){g.save();g.globalAlpha=d.a;g.translate(d.x,d.y);g.scale(d.s,d.s);g.rotate(-.06);paperShadow(g,k,1);g.fillStyle='#ffffff';g.beginPath();g.roundRect(-17,-10,34,20,3);g.fill();paperShadow(g,k,0);
      txt(g,'128',0,1,'800 14px "Be Vietnam Pro",system-ui,sans-serif','#e2574c');g.restore()}}};

/* ================= 7. ANIME CEL ================= */
const AL='#2b1c2a';
const ANH={skin:'#ffe0c8',hair:'#2b2a3a',robe:'#ffffff',robeD:'#e6e9f2',pants:'#3a4a6a',pantsD:'#2c3a56',boot:'#5a3a2a',bootD:'#4a2e20',accent:'#25c2b0',sash:'#ff4a5a',hilt:'#ffc94a',grip:'#5a3a2a',blade:'#e8f6ff',eye:'#2a9d8f',brow:'#2b2a3a'};
const ANE={skin:'#ffd6b8',hair:'#2b2a3a',robe:'#c9884a',robeD:'#a86c34',pants:'#4a3a3a',pantsD:'#3a2c2c',boot:'#2b2a3a',bootD:'#2b2a3a',accent:'#8a5a2a',scarf:'#e0404a',sash:'#4a6aa8',hilt:'#ffc94a',grip:'#4a3a3a',blade:'#dde6ee',eye:'#a8323a',brow:'#2b2a3a'};
const sAnime={hs:1.28,bg(g){const R=mulberry32(66);const gr=g.createLinearGradient(0,0,0,GY);gr.addColorStop(0,'#4aa8ff');gr.addColorStop(1,'#c4ecff');g.fillStyle=gr;g.fillRect(0,0,VW,VH);
    for(const[cx,cy,s]of[[70,42,1],[210,30,1.3],[320,60,.8]]){g.fillStyle='#d4e8fa';g.beginPath();g.arc(cx,cy+4,12*s,0,PI*2);g.arc(cx+16*s,cy,16*s,0,PI*2);g.arc(cx+34*s,cy+4,11*s,0,PI*2);g.fill();
      g.fillStyle='#ffffff';g.beginPath();g.arc(cx,cy+1,12*s,0,PI*2);g.arc(cx+16*s,cy-3,16*s,0,PI*2);g.arc(cx+34*s,cy+1,11*s,0,PI*2);g.fill()}
    g.save();hills(g,R,150,14,'#7aa6d8',10);g.restore();g.save();hills(g,R,152,12,null,10);g.clip();g.fillStyle='#93bde6';g.fillRect(0,0,VW,150);g.restore();
    g.fillStyle='#6cc24a';g.fillRect(0,GY-14,VW,VH);g.fillStyle='#58a83c';g.fillRect(0,GY+18,VW,VH);g.fillStyle='#9be36e';for(let i=0;i<30;i++){const x=R()*VW,y=GY-10+R()*40;g.fillRect(x,y,10+R()*16,1.6)}
    g.fillStyle='#ead9a8';g.beginPath();g.ellipse(180,GY+6,160,14,0,0,PI*2);g.fill();
    g.strokeStyle=AL;g.lineWidth=1.6;g.fillStyle='#7a4e32';g.beginPath();g.roundRect(38,GY-66,12,62,3);g.fill();g.stroke();
    g.fillStyle='#2f7a3a';g.beginPath();g.arc(44,GY-92,36,0,PI*2);g.fill();g.stroke();g.save();g.beginPath();g.arc(44,GY-92,36,0,PI*2);g.clip();g.fillStyle='#45a052';g.beginPath();g.arc(36,GY-100,34,0,PI*2);g.fill();g.restore();
    g.fillStyle='#bff28f';g.beginPath();g.ellipse(30,GY-110,8,4,-.4,0,PI*2);g.fill()},
  draw(g,sc){const t=sc.t;
    if(sc.hk>-.04&&sc.hk<.32){g.save();g.globalAlpha=sc.hk<.2?.8:.8*(1-(sc.hk-.2)/.12);for(let i=0;i<34;i++){const a=i/34*PI*2+h1(i)*.15,r0=58+h1(i+4)*30;g.strokeStyle=i%3?'#ffffff':'#bff0ff';g.lineWidth=.8+h1(i+9)*1.6;g.beginPath();g.moveTo(sc.imp[0]+Math.cos(a)*r0,sc.imp[1]+Math.sin(a)*r0);g.lineTo(sc.imp[0]+Math.cos(a)*300,sc.imp[1]+Math.sin(a)*300);g.stroke()}g.restore()}
    const part=(pal,fl)=>(p,side)=>{let c=fl?'#ffffff':pal[p.r];if(!c)return;
      if(p.k==='T'){g.lineCap='round';g.strokeStyle=AL;g.lineWidth=p.w+2.2;shp(g,p);g.stroke();g.strokeStyle=c;g.lineWidth=p.w;g.stroke();return}
      if(p.r==='eye'){const x=p.c[0],y=p.c[1]-.4;g.fillStyle='#ffffff';g.beginPath();g.ellipse(x,y,2.8,3.6,0,0,PI*2);g.fill();g.fillStyle=fl?'#fff':c;g.beginPath();g.ellipse(x+.5,y+.4,2,2.9,0,0,PI*2);g.fill();
        g.fillStyle='#1a1018';g.beginPath();g.ellipse(x+.6,y+.6,1,1.6,0,0,PI*2);g.fill();g.fillStyle='#fff';g.beginPath();g.arc(x-.2,y-.8,.8,0,PI*2);g.fill();g.strokeStyle=AL;g.lineWidth=1.3;g.beginPath();g.moveTo(x-3,y-3.4);g.quadraticCurveTo(x,y-4.6,x+3.4,y-3);g.stroke();return}
      g.save();shp(g,p);g.clip();g.fillStyle=fl?'#ffffff':shade(c,-.22);g.fillRect(-120,-200,260,260);g.fillStyle=c;shp(g,p,-2.4*side,-2.4);g.fill();g.restore();
      g.strokeStyle=AL;g.lineWidth=p.r==='brow'?0:1.5;g.lineJoin='round';if(p.r!=='brow'){shp(g,p);g.stroke()}else{g.fillStyle=AL;shp(g,p);g.fill()}
      if(p.cap&&p.r==='hair'){g.strokeStyle='rgba(255,255,255,.75)';g.lineWidth=1.4;g.beginPath();g.arc(p.pts[5][0],p.pts[5][1]+5,6,PI*1.15,PI*1.6);g.stroke()}
      if(p.r==='blade'&&p.edge){g.strokeStyle='#ffffff';g.lineWidth=1.2;g.beginPath();const e=p.edge;g.moveTo(e[0][0]+(e[1][0]-e[0][0])*.2,e[0][1]+(e[1][1]-e[0][1])*.2);g.lineTo(e[0][0]+(e[1][0]-e[0][0])*.7,e[0][1]+(e[1][1]-e[0][1])*.7);g.stroke()}};
    fig(g,sc.enemy,-1,part(ANE,sc.flash));fig(g,sc.hero,1,part(ANH));
    if(sc.tr.length>1){g.save();g.globalAlpha=sc.ta;g.globalCompositeOperation='lighter';g.fillStyle='rgba(37,194,176,.55)';trailPath(g,sc.tr);g.fill();g.globalCompositeOperation='source-over';
      g.fillStyle='#ffffff';g.beginPath();sc.tr.forEach((s,i)=>{const x=(s.tip[0]*3+s.mid[0])/4,y=(s.tip[1]*3+s.mid[1])/4;i?g.lineTo(x,y):g.moveTo(x,y)});for(let i=sc.tr.length-1;i>=0;i--){const s=sc.tr[i];g.lineTo(s.tip[0],s.tip[1])}g.closePath();g.fill();
      g.strokeStyle='#25c2b0';g.lineWidth=2;g.beginPath();sc.tr.forEach((s,i)=>i?g.lineTo(s.tip[0],s.tip[1]):g.moveTo(s.tip[0],s.tip[1]));g.stroke();g.restore()}
    if(sc.hk>=0&&sc.hk<.35){const k=sc.hk,s=k<.08?k/.08*1.3:1.3-(k-.08)*2.4;g.save();g.translate(sc.imp[0],sc.imp[1]);g.scale(s,s);g.rotate(.3);g.fillStyle='#ffe14a';g.strokeStyle=AL;g.lineWidth=1.8;g.beginPath();
      for(let i=0;i<20;i++){const a=i/20*PI*2,r=i%2?8:(20+h1(i)*10);g.lineTo(Math.cos(a)*r,Math.sin(a)*r)}g.closePath();g.fill();g.stroke();g.fillStyle='#ffffff';g.beginPath();g.arc(0,0,6,0,PI*2);g.fill();g.restore()}
    const d=dmgPos(sc);if(d){g.save();g.globalAlpha=d.a;g.translate(d.x,d.y-4);g.scale(d.s,d.s);g.transform(1,0,-.18,1,0,0);txt(g,'CHÍ MẠNG!',0,-17,'900 9px "Be Vietnam Pro",system-ui,sans-serif','#ff4a5a',AL,3);txt(g,'128',0,0,'900 24px "Be Vietnam Pro",system-ui,sans-serif','#ffe14a',AL,5);g.restore()}}};

/* ================= 8. 2.5D DỰNG KHỐI ================= */
const RLH={skin:'#e9bf96',hair:'#1c1612',robe:'#e8e6dc',robeD:'#c8c4b4',pants:'#36464a',pantsD:'#2a373a',boot:'#4a3426',bootD:'#3a281c',accent:'#2b8f86',sash:'#b03a2a',hilt:'#d6aa4a',grip:'#3a2618',blade:'#d8e2e6',eye:'#1a120c',brow:'#2a1a12'};
const RLE={skin:'#d9a87a',hair:'#1c1612',robe:'#7a5a3c',robeD:'#5e442c',pants:'#3a2c22',pantsD:'#2c2018',boot:'#1c1612',bootD:'#1c1612',accent:'#5a4030',scarf:'#8b2e22',sash:'#4a5a3a',hilt:'#d6aa4a',grip:'#2c2018',blade:'#c6ced2',eye:'#1a120c',brow:'#1a120c'};
function isoTile(g,x,y,w,h,top,seed){const R=h1(seed);const c=shade(top,(R-.5)*.16);g.fillStyle=c;g.beginPath();g.moveTo(x,y-h/2);g.lineTo(x+w/2,y);g.lineTo(x,y+h/2);g.lineTo(x-w/2,y);g.closePath();g.fill();
  g.strokeStyle='rgba(255,240,210,.22)';g.lineWidth=.8;g.beginPath();g.moveTo(x-w/2,y);g.lineTo(x,y-h/2);g.lineTo(x+w/2,y);g.stroke();g.strokeStyle='rgba(20,10,0,.28)';g.beginPath();g.moveTo(x-w/2,y);g.lineTo(x,y+h/2);g.lineTo(x+w/2,y);g.stroke()}
function ball(g,x,y,r,c){const gr=g.createRadialGradient(x-r*.4,y-r*.45,r*.1,x,y,r);gr.addColorStop(0,shade(c,.35));gr.addColorStop(.6,c);gr.addColorStop(1,shade(c,-.5));g.fillStyle=gr;g.beginPath();g.arc(x,y,r,0,PI*2);g.fill()}
const s25={bg(g){const R=mulberry32(88);const gr=g.createLinearGradient(0,0,0,150);gr.addColorStop(0,'#2e3a5c');gr.addColorStop(.6,'#c07a5a');gr.addColorStop(1,'#f0b070');g.fillStyle=gr;g.fillRect(0,0,VW,VH);
    const sg=g.createRadialGradient(250,120,2,250,120,90);sg.addColorStop(0,'rgba(255,230,170,.9)');sg.addColorStop(1,'rgba(255,200,120,0)');g.fillStyle=sg;g.fillRect(0,0,VW,VH);
    hills(g,R,112,16,'#4a4a66',10);hills(g,R,132,12,'#5e5a6e',10);
    g.fillStyle='#5a6a3e';g.fillRect(0,140,VW,VH);
    for(let row=0;row<9;row++)for(let col=-1;col<12;col++){const x=col*36+(row%2?18:0),y=140+row*9+4;const onPath=row>=4&&row<=7;isoTile(g,x,y,36,18,onPath?'#8e8a7c':'#6f8a4a',row*31+col)}
    const fog=g.createLinearGradient(0,130,0,170);fog.addColorStop(0,'rgba(240,190,140,.45)');fog.addColorStop(1,'rgba(240,190,140,0)');g.fillStyle=fog;g.fillRect(0,130,VW,40);
    g.save();g.translate(52,GY-2);g.fillStyle='rgba(20,10,0,.35)';g.beginPath();g.ellipse(30,4,46,10,-.15,0,PI*2);g.fill();
    const tg=g.createLinearGradient(-6,0,6,0);tg.addColorStop(0,'#8a6040');tg.addColorStop(1,'#3a2416');g.fillStyle=tg;g.fillRect(-6,-60,12,60);
    for(const[x,y,r,c]of[[-16,-78,22,'#4a7a3a'],[16,-80,22,'#4a7a3a'],[0,-100,24,'#5a8a44'],[-10,-112,15,'#6a9a4c'],[12,-110,15,'#6a9a4c']])ball(g,x,y,r,c);g.restore();
    g.save();g.translate(322,GY-4);g.fillStyle='rgba(20,10,0,.35)';g.beginPath();g.ellipse(14,4,24,7,-.15,0,PI*2);g.fill();
    const box=(x,y,w,h,d)=>{g.fillStyle='#a8a394';g.fillRect(x,y,w,h);g.fillStyle='#6e6a5e';g.beginPath();g.moveTo(x+w,y);g.lineTo(x+w+d,y-d*.5);g.lineTo(x+w+d,y+h-d*.5);g.lineTo(x+w,y+h);g.fill();g.fillStyle='#c8c2b0';g.beginPath();g.moveTo(x,y);g.lineTo(x+d,y-d*.5);g.lineTo(x+w+d,y-d*.5);g.lineTo(x+w,y);g.fill()};
    box(-10,-14,20,14,6);box(-4,-44,8,30,4);box(-13,-58,26,14,6);const lg=g.createRadialGradient(0,-51,1,0,-51,16);lg.addColorStop(0,'rgba(255,220,140,.9)');lg.addColorStop(1,'rgba(255,180,80,0)');g.fillStyle=lg;g.fillRect(-16,-67,32,32);box(-15,-70,30,8,7);g.restore()},
  draw(g,sc){const L=[-.72,-.7];
    for(const[x,side]of[[HX+sc.hp.x*SC,1],[EX-sc.ep.x*SC,-1]]){g.fillStyle='rgba(20,10,0,.32)';g.beginPath();g.ellipse(x+16,GY+2,30,6,-.12,0,PI*2);g.fill();const sg=g.createRadialGradient(x,GY,2,x,GY,18);sg.addColorStop(0,'rgba(20,10,0,.45)');sg.addColorStop(1,'rgba(20,10,0,0)');g.fillStyle=sg;g.beginPath();g.ellipse(x,GY,18,5,0,0,PI*2);g.fill()}
    const part=(pal,fl)=>(p,side)=>{const c=fl?'#fff4e0':pal[p.r];if(!c)return;const ll=[L[0]*side,L[1]];
      if(p.k==='T'){g.lineCap='round';g.strokeStyle=c;g.lineWidth=p.w;shp(g,p);g.stroke();return}
      if(fl){g.fillStyle=c;shp(g,p);g.fill();return}
      if(p.k==='L'){const mx=(p.a[0]+p.b[0])/2,my=(p.a[1]+p.b[1])/2,th=Math.atan2(p.b[1]-p.a[1],p.b[0]-p.a[0]);let px=-Math.sin(th),py=Math.cos(th);if(px*ll[0]+py*ll[1]<0){px=-px;py=-py}const r=p.w/2;
        const gr=g.createLinearGradient(mx+px*r,my+py*r,mx-px*r,my-py*r);gr.addColorStop(0,shade(c,.35));gr.addColorStop(.4,c);gr.addColorStop(1,shade(c,-.5));g.fillStyle=gr}
      else if(p.k==='C'){const r=p.rad;const gr=g.createRadialGradient(p.c[0]+ll[0]*r*.45,p.c[1]+ll[1]*r*.45,r*.1,p.c[0],p.c[1],r);gr.addColorStop(0,shade(c,.3));gr.addColorStop(.65,c);gr.addColorStop(1,shade(c,-.45));g.fillStyle=gr}
      else{let x0=1e9,x1=-1e9,y0=1e9,y1=-1e9;for(const q of p.pts){x0=Math.min(x0,q[0]);x1=Math.max(x1,q[0]);y0=Math.min(y0,q[1]);y1=Math.max(y1,q[1])}const cx=(x0+x1)/2,cy=(y0+y1)/2,r=Math.max(x1-x0,y1-y0)/2;
        const gr=g.createLinearGradient(cx+ll[0]*r,cy+ll[1]*r,cx-ll[0]*r,cy-ll[1]*r);gr.addColorStop(0,shade(c,.32));gr.addColorStop(.45,c);gr.addColorStop(1,shade(c,-.45));g.fillStyle=gr}
      shp(g,p);g.fill();if(p.r!=='eye'&&p.r!=='brow'){g.strokeStyle='rgba(30,20,10,.45)';g.lineWidth=.7;g.stroke()}};
    fig(g,sc.enemy,-1,part(RLE,sc.flash));fig(g,sc.hero,1,part(RLH));
    if(sc.tr.length>1){g.save();g.globalAlpha=sc.ta;g.globalCompositeOperation='lighter';const l=sc.tr[sc.tr.length-1];const gr=g.createLinearGradient(sc.tr[0].tip[0],sc.tr[0].tip[1],l.tip[0],l.tip[1]);gr.addColorStop(0,'rgba(80,200,255,0)');gr.addColorStop(1,'rgba(140,230,255,.85)');
      g.fillStyle=gr;trailPath(g,sc.tr);g.fill();g.strokeStyle='#ffffff';g.lineWidth=2;g.beginPath();sc.tr.forEach((s,i)=>i?g.lineTo(s.tip[0],s.tip[1]):g.moveTo(s.tip[0],s.tip[1]));g.stroke();
      const rg=g.createRadialGradient(l.tip[0],l.tip[1],0,l.tip[0],l.tip[1],18);rg.addColorStop(0,'rgba(255,255,255,.9)');rg.addColorStop(1,'rgba(120,220,255,0)');g.fillStyle=rg;g.fillRect(l.tip[0]-18,l.tip[1]-18,36,36);g.restore()}
    if(sc.hk>=0&&sc.hk<.45){g.save();g.globalCompositeOperation='lighter';const al=1-sc.hk/.45;const rg=g.createRadialGradient(sc.imp[0],sc.imp[1],0,sc.imp[0],sc.imp[1],34);rg.addColorStop(0,`rgba(255,240,200,${al})`);rg.addColorStop(1,'rgba(255,160,60,0)');g.fillStyle=rg;g.fillRect(sc.imp[0]-34,sc.imp[1]-34,68,68);
      for(const q of burst(12,31,sc.hk,64,80)){g.strokeStyle=`rgba(255,220,140,${al})`;g.lineWidth=1.6;g.beginPath();g.moveTo(sc.imp[0]+q.x,sc.imp[1]+q.y);g.lineTo(sc.imp[0]+q.x*.8,sc.imp[1]+q.y*.8);g.stroke()}g.restore()}
    const d=dmgPos(sc);if(d){g.globalAlpha=d.a;const gr=g.createLinearGradient(0,d.y-10,0,d.y+10);gr.addColorStop(0,'#fff6d0');gr.addColorStop(1,'#e8a83a');txt(g,'128',d.x,d.y,`800 ${18*d.s}px "Be Vietnam Pro",system-ui,sans-serif`,gr,'#2a1408',4);g.globalAlpha=1}}};

/* ================= 10. TRANH LỤA ================= */
const SPIA='#5a3e2b';
const SLH={skin:'#ecd3b5',hair:'#2e2925',robe:'#e9e4d6',robeD:'#cfc6b0',pants:'#5e6b70',pantsD:'#4c575c',boot:'#6a5040',bootD:'#594234',accent:'#7fa594',sash:'#c27c74',hilt:'#c9a35a',grip:'#6a5040',blade:'#c6cdcd',eye:'#2e2925',brow:'#2e2925'};
const SLE={skin:'#e2c4a2',hair:'#2e2925',robe:'#a88a62',robeD:'#8f7350',pants:'#5a4e46',pantsD:'#4a3f38',boot:'#3e3530',bootD:'#3e3530',accent:'#8a6f50',scarf:'#b0685e',sash:'#7f8f74',hilt:'#c9a35a',grip:'#4a3f38',blade:'#bdc4c4',eye:'#2e2925',brow:'#2e2925'};
function blossom(g,x,y,r){g.fillStyle='rgba(232,167,167,.85)';for(let i=0;i<5;i++){const a=i/5*PI*2;g.beginPath();g.arc(x+Math.cos(a)*r*.7,y+Math.sin(a)*r*.7,r*.55,0,PI*2);g.fill()}g.fillStyle='#b0685e';g.beginPath();g.arc(x,y,r*.28,0,PI*2);g.fill()}
const sSilk={bg(g){const R=mulberry32(99);const gr=g.createLinearGradient(0,0,0,VH);gr.addColorStop(0,'#ebe1c9');gr.addColorStop(1,'#d9caa9');g.fillStyle=gr;g.fillRect(0,0,VW,VH);
    for(let i=0;i<12;i++){const x=R()*VW,y=R()*VH,r=20+R()*50,sg=g.createRadialGradient(x,y,0,x,y,r);sg.addColorStop(0,'rgba(170,140,90,.07)');sg.addColorStop(1,'rgba(170,140,90,0)');g.fillStyle=sg;g.fillRect(x-r,y-r,r*2,r*2)}
    [[110,.18,'143,176,168',20],[134,.26,'120,160,150',16],[160,.32,'100,140,128',12]].forEach(([y0,a,c,amp])=>{for(let k=0;k<3;k++){hills(g,R,y0+k*1.5,amp,null,8);const hg=g.createLinearGradient(0,y0-amp*1.5,0,y0+50);hg.addColorStop(0,`rgba(${c},${a})`);hg.addColorStop(1,`rgba(${c},0)`);g.fillStyle=hg;g.fill()}});
    for(const y of[120,150]){const mg=g.createLinearGradient(0,y-8,0,y+8);mg.addColorStop(0,'rgba(245,240,228,0)');mg.addColorStop(.5,'rgba(245,240,228,.7)');mg.addColorStop(1,'rgba(245,240,228,0)');g.fillStyle=mg;g.fillRect(0,y-8,VW,16)}
    const gg=g.createLinearGradient(0,GY-16,0,VH);gg.addColorStop(0,'rgba(196,154,74,0)');gg.addColorStop(.3,'rgba(196,154,74,.25)');gg.addColorStop(1,'rgba(150,120,70,.35)');g.fillStyle=gg;g.fillRect(0,GY-16,VW,VH);
    g.strokeStyle='rgba(90,62,43,.45)';g.lineWidth=.6;for(let i=0;i<40;i++){const x=R()*VW,y=GY+R()*40;g.beginPath();g.moveTo(x,y);g.quadraticCurveTo(x+2,y-5,x+(R()-.5)*6,y-9);g.stroke()}
    g.strokeStyle='#5a4030';g.lineCap='round';const br=(x,y,a,l,w,d)=>{if(d>4||l<6)return;const x2=x+Math.cos(a)*l,y2=y+Math.sin(a)*l;g.lineWidth=w;g.beginPath();g.moveTo(x,y);g.quadraticCurveTo((x+x2)/2+(R()-.5)*8,(y+y2)/2+(R()-.5)*8,x2,y2);g.stroke();
      if(R()<.7)blossom(g,x2,y2,3+R()*2);br(x2,y2,a+(R()-.5)*1.2,l*.7,w*.7,d+1);if(R()<.6)br(x2,y2,a+(R()>.5?.8:-.8),l*.5,w*.6,d+1)};br(-4,8,.35,60,4,0);br(-4,30,.1,46,3,1);
    g.strokeStyle='rgba(120,100,70,.04)';g.lineWidth=.5;for(let y=0;y<VH;y+=1.5){g.beginPath();g.moveTo(0,y);g.lineTo(VW,y);g.stroke()}for(let x=0;x<VW;x+=1.5){g.beginPath();g.moveTo(x,0);g.lineTo(x,VH);g.stroke()}
    seal(g,322,198,22,'#a8473b','Hiệp','Khách')},
  draw(g,sc){const t=sc.t;
    for(let i=0;i<8;i++){const ph=(t*.25+h1(i))%1;const x=40+h1(i+3)*300+Math.sin(t+i)*10,y=ph*VH;g.save();g.translate(x,y);g.rotate(t+i);g.fillStyle='rgba(232,167,167,.7)';g.beginPath();g.ellipse(0,0,2.6,1.4,0,0,PI*2);g.fill();g.restore()}
    const part=(pal,fl)=>(p)=>{const c=fl?'#fffaf0':pal[p.r];if(!c)return;
      if(p.k==='T'){g.lineCap='round';g.strokeStyle=c;g.globalAlpha=.8;g.lineWidth=p.w;shp(g,p);g.stroke();g.globalAlpha=1;return}
      g.fillStyle=c;g.globalAlpha=.78;shp(g,p);g.fill();g.globalAlpha=.35;shp(g,p,.7,.5);g.fill();g.globalAlpha=1;
      if(p.r!=='eye'&&p.r!=='brow'){g.strokeStyle=SPIA;g.globalAlpha=.85;g.lineWidth=.75;g.setLineDash([7,1.6]);shp(g,p);g.stroke();g.setLineDash([]);g.globalAlpha=1}};
    fig(g,sc.enemy,-1,part(SLE,sc.flash));fig(g,sc.hero,1,part(SLH));
    if(sc.tr.length>1){g.save();g.globalAlpha=sc.ta;g.fillStyle='rgba(127,165,148,.38)';trailPath(g,sc.tr);g.fill();g.strokeStyle=SPIA;g.lineWidth=.8;g.beginPath();sc.tr.forEach((s,i)=>i?g.lineTo(s.tip[0],s.tip[1]):g.moveTo(s.tip[0],s.tip[1]));g.stroke();g.restore()}
    if(sc.hk>=0&&sc.hk<1.1){const al=sc.hk<.7?1:1-(sc.hk-.7)/.4;for(const q of burst(12,41,sc.hk,46,40)){g.save();g.globalAlpha=al;g.translate(sc.imp[0]+q.x,sc.imp[1]+q.y);g.rotate(q.a+sc.hk*3);blossom(g,0,0,2.4+q.r*1.6);g.restore()}
      const k=Math.min(1,sc.hk/.5);g.globalAlpha=(1-k)*.5;g.strokeStyle='#7fa594';g.lineWidth=3;g.beginPath();g.ellipse(sc.imp[0],sc.imp[1],10+k*30,6+k*18,0,0,PI*2);g.stroke();g.globalAlpha=1}
    const d=dmgPos(sc);if(d){g.globalAlpha=d.a;txt(g,'128',d.x,d.y,`400 ${16*d.s}px "Yeseva One",Georgia,serif`,'#a8473b');g.globalAlpha=1}}};

/* ================= 9. 3D LOW-POLY (THREE.JS) ================= */
const S3={
  init(card){const TH=window.THREE;if(!TH){card.no3d=true;return}
    let r;try{r=new TH.WebGLRenderer({canvas:card.canvas,antialias:true})}catch(e){card.no3d=true;return}
    r.shadowMap.enabled=true;r.shadowMap.type=TH.PCFSoftShadowMap;r.outputEncoding=TH.sRGBEncoding;
    const scn=new TH.Scene();scn.background=new TH.Color(0xa7d3ee);scn.fog=new TH.Fog(0xa7d3ee,420,1000);
    const cam=new TH.PerspectiveCamera(33,1.5,1,3000);cam.position.set(-60,130,340);cam.lookAt(8,58,0);
    scn.add(new TH.HemisphereLight(0xdff0ff,0x5a6b3a,.75));const sun=new TH.DirectionalLight(0xfff0d4,.85);sun.position.set(-160,260,180);sun.castShadow=true;
    Object.assign(sun.shadow.camera,{left:-220,right:220,top:220,bottom:-220,near:10,far:800});sun.shadow.mapSize.set(1024,1024);scn.add(sun);
    const M=c=>new TH.MeshStandardMaterial({color:c,flatShading:true,roughness:.95,metalness:0});
    const gg=new TH.PlaneGeometry(1400,800,48,28);gg.rotateX(-PI/2);const pos=gg.attributes.position,cols=[];const R=mulberry32(12);
    for(let i=0;i<pos.count;i++){const x=pos.getX(i),z=pos.getZ(i);const path=Math.abs(z)<36&&Math.abs(x)<260;let y=0;if(!path&&(Math.abs(z)>60||Math.abs(x)>200))y=(R()-.3)*14*Math.min(1,(Math.abs(z)-40)/120+.3);pos.setY(i,y);
      const c=path?new TH.Color(0xc9ac72).offsetHSL(0,0,(R()-.5)*.06):new TH.Color(0x6aa84a).offsetHSL((R()-.5)*.03,0,(R()-.5)*.08);cols.push(c.r,c.g,c.b)}
    gg.setAttribute('color',new TH.Float32BufferAttribute(cols,3));gg.computeVertexNormals();
    const ground=new TH.Mesh(gg,new TH.MeshStandardMaterial({vertexColors:true,flatShading:true,roughness:1,metalness:0}));ground.receiveShadow=true;scn.add(ground);
    const tree=(x,z,s)=>{const t=new TH.Group();const tr=new TH.Mesh(new TH.CylinderGeometry(3,4.5,22,6),M(0x7a5232));tr.position.y=11;t.add(tr);
      [[30,26,46],[45,20,36],[60,14,28]].forEach(([y,rr,h],i)=>{const c=new TH.Mesh(new TH.ConeGeometry(rr,h,7),M(i%2?0x3f8a4a:0x2f7a3e));c.position.y=y;t.add(c)});
      t.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true}});t.position.set(x,0,z);t.scale.setScalar(s);scn.add(t)};
    tree(-185,-70,1.3);tree(-140,-150,1.1);tree(190,-120,1.4);tree(250,-30,1);tree(-250,40,1.2);
    for(let i=0;i<7;i++){const k=new TH.Mesh(new TH.IcosahedronGeometry(5+R()*7,0),M(0x8f8c84));k.position.set(-260+R()*520,2,-90-R()*80);k.castShadow=true;scn.add(k)}
    const mkFig=(pal,enemy)=>{const mats=[];const MM=c=>{const m=M(c);mats.push(m);return m};const box=(w,h,d,c,y,x,z)=>{const m=new TH.Mesh(new TH.BoxGeometry(w,h,d),MM(c));m.position.set(x||0,y,z||0);m.castShadow=true;return m};
      const root=new TH.Group(),hip=new TH.Group();root.add(hip);
      const leg=(z,c)=>{const g1=new TH.Group();g1.position.z=z;g1.add(box(7,22,7,c,-11));const kn=new TH.Group();kn.position.y=-22;kn.add(box(6.5,22,6.5,c,-11));kn.add(box(10,4,7,pal.boot,-22,3));g1.add(kn);hip.add(g1);return{g:g1,kn}};
      const lB=leg(-4,pal.pantsD),lF=leg(4,pal.pants);
      const torso=new TH.Group();hip.add(torso);const robe=new TH.Mesh(new TH.CylinderGeometry(8,13,52,8),MM(pal.robe));robe.position.y=4;robe.castShadow=true;torso.add(robe);
      const sash=new TH.Mesh(new TH.CylinderGeometry(8,8.6,4.5,8),MM(pal.sash));sash.position.y=13;torso.add(sash);
      torso.add(box(3,30,1.2,pal.accent,-5,10.5,0));
      const head=new TH.Group();head.position.y=31;torso.add(head);
      const hm=new TH.Mesh(new TH.IcosahedronGeometry(10.5,1),MM(pal.skin));hm.position.y=12;hm.castShadow=true;head.add(hm);
      if(!enemy){const cap=new TH.Mesh(new TH.SphereGeometry(11.1,10,6,0,PI*2,0,PI*.52),MM(pal.hair));cap.position.y=12.5;cap.rotation.z=.25;head.add(cap);
        const kn=new TH.Mesh(new TH.IcosahedronGeometry(4.6,0),MM(pal.hair));kn.position.set(-3,25,0);head.add(kn);
        const band=new TH.Mesh(new TH.TorusGeometry(10.9,1.5,5,14),MM(pal.accent));band.rotation.x=PI/2;band.position.y=16;head.add(band);
        const tail=box(1,12,3,pal.accent,10,-13,0);tail.rotation.z=1.1;head.add(tail)}
      else{const cap=new TH.Mesh(new TH.SphereGeometry(11.8,10,6,0,PI*2,0,PI*.56),MM(pal.scarf));cap.position.y=12;head.add(cap);const kn=new TH.Mesh(new TH.IcosahedronGeometry(4,0),MM(pal.scarf));kn.position.set(-11,12,0);head.add(kn)}
      head.add(box(1.4,2.2,1.6,0x1a1410,13,9.6,3.4));head.add(box(1.4,2.2,1.6,0x1a1410,13,9.6,-3.4));
      const arm=(z,c,sword)=>{const s=new TH.Group();s.position.set(z>0?1.5:-2.5,28,z);s.add(box(6,17,6,c,-8.5));const el=new TH.Group();el.position.y=-17;el.add(box(5.5,16,5.5,c,-8));
        const hd=new TH.Mesh(new TH.IcosahedronGeometry(3.2,0),MM(pal.skin));hd.position.y=-16;el.add(hd);let sw=null;
        if(sword){sw=new TH.Group();sw.position.y=-16;sw.add(box(1.5,enemy?44:50,4.4,pal.blade,enemy?-24:-27));sw.add(box(2.6,2.6,12,pal.hilt,-2));sw.add(box(2.6,9,2.6,pal.grip,4.5));el.add(sw)}
        s.add(el);torso.add(s);return{s,el,sw}};
      const aB=arm(-5,pal.robeD,false),aF=arm(5,pal.robe,true);
      if(enemy)root.scale.x=-1;scn.add(root);return{root,hip,lB,lF,torso,head,aB,aF,mats}};
    const H=mkFig({skin:0xf0c9a0,hair:0x191313,robe:0xeef1ea,robeD:0xc9d0c8,pants:0x2b3d3a,pantsD:0x22302e,boot:0x2a1d16,sash:0xc8361f,accent:0x2aa89c,blade:0xdfe9ee,hilt:0xd6ac4e,grip:0x3a2414},false);
    const E=mkFig({skin:0xddb48a,hair:0x1a1410,robe:0x6d5539,robeD:0x4d3c28,pants:0x3d2d1e,pantsD:0x2d2016,boot:0x1e150f,sash:0x8b2e22,accent:0x8b2e22,scarf:0x8b2e22,blade:0xc8ced4,hilt:0xd6ac4e,grip:0x3a2414},true);
    const sg=new TH.BufferGeometry();sg.setAttribute('position',new TH.Float32BufferAttribute(new Float32Array(TR.length*18),3));
    const slash=new TH.Mesh(sg,new TH.MeshBasicMaterial({color:0x9ff4ff,transparent:true,opacity:.8,side:TH.DoubleSide,blending:TH.AdditiveBlending,depthWrite:false}));slash.frustumCulled=false;scn.add(slash);
    const sparks=[];for(let i=0;i<12;i++){const m=new TH.Mesh(new TH.TetrahedronGeometry(1.8),new TH.MeshBasicMaterial({color:i%2?0xffe08a:0xffffff}));scn.add(m);sparks.push(m)}
    card.s3={r,scn,cam,H,E,slash,sparks,TH}},
  pose(F,p,J,side){F.root.position.x=side>0?-55+p.x:55-p.x;F.hip.position.y=-J.hip[1];F.lF.g.rotation.z=p.hF;F.lF.kn.rotation.z=p.sF-p.hF;F.lB.g.rotation.z=p.hB;F.lB.kn.rotation.z=p.sB-p.hB;
    F.torso.rotation.z=-p.lean;F.head.rotation.z=-(p.lean*.6+p.hd)+p.lean;F.aF.s.rotation.z=p.aF+p.lean;F.aF.el.rotation.z=p.eF-p.aF;F.aF.sw.rotation.z=p.sw-p.eF;F.aB.s.rotation.z=p.aB+p.lean;F.aB.el.rotation.z=p.eB-p.aB},
  render(card,t,w,h,dpr){if(!card.s3&&!card.no3d)S3.init(card);if(card.no3d){S3.fallback(card,w,h,dpr);return}const s=card.s3;
    if(s.w!==w||s.h!==h||s.dpr!==dpr){s.r.setPixelRatio(dpr);s.r.setSize(w,h,false);s.cam.aspect=w/h;s.cam.updateProjectionMatrix();s.w=w;s.h=h;s.dpr=dpr}
    const hp=kf(HERO,t),ep=kf(ENEMY,t);S3.pose(s.H,hp,rig(hp,t),1);S3.pose(s.E,ep,rig(ep,t),-1);
    const hk=t-1.24,fl=hk>=0&&hk<.13;for(const m of s.E.mats)m.emissive.setHex(fl?0x888888:0x000000);
    const arr=s.slash.geometry.attributes.position.array;arr.fill(0);let ta=0;
    if(t>=1.05&&t<1.62){ta=t<=1.3?1:Math.max(0,1-(t-1.3)/.32);let n=0;const te=Math.min(t,1.3),ts=Math.max(1.05,te-.085);const pts=TR.filter(q=>q.t<=te&&q.t>=ts);for(let i=1;i<pts.length;i++){const a=pts[i-1],b=pts[i];
      const v=[[a.tip],[a.mid],[b.tip],[b.mid]].map(([q])=>[-55+hp.x*0+q[0],-q[1],7]);[v[0],v[1],v[2],v[1],v[3],v[2]].forEach(q=>{arr[n++]=q[0];arr[n++]=q[1];arr[n++]=q[2]})}}
    s.slash.material.opacity=.85*ta;s.slash.geometry.attributes.position.needsUpdate=true;
    const ix=55-ep.x-4,iy=64;s.sparks.forEach((m,i)=>{if(hk<0||hk>.42){m.visible=false;return}m.visible=true;const q=burst(12,51,hk,40,0)[i];m.position.set(ix+q.x,iy-q.y,10+q.r*6);m.rotation.set(hk*10+i,hk*7,0)});
    s.r.render(s.scn,s.cam);
    const dm=card.dmg;if(dm){if(hk>=0&&hk<.95){const v=new s.TH.Vector3(ix+6,iy+22+hk*34,8).project(s.cam);dm.style.left=((v.x+1)/2*w)+'px';dm.style.top=((1-v.y)/2*h)+'px';dm.style.opacity=hk<.7?1:1-(hk-.7)/.25;dm.hidden=false}else dm.hidden=true}},
  fallback(card,w,h,dpr){if(card.fbDone)return;card.fbDone=1;const c=card.canvas;c.width=w*dpr;c.height=h*dpr;const g=c.getContext('2d');if(!g)return;g.scale(dpr,dpr);g.fillStyle='#2a1d16';g.fillRect(0,0,w,h);g.fillStyle='#bba98a';g.font='600 14px system-ui';g.textAlign='center';g.fillText('Máy này không bật được 3D (WebGL)',w/2,h/2)}};

/* ================= DANH MỤC ================= */
const STYLES=[
 {id:1,name:'Hoạt hình vector',now:1,s:sVector,d:'Kiểu đang dùng trong game. Hình khối có viền, tô màu chuyển, sáng sủa và dễ nhìn trên màn nhỏ.',viet:2,light:5,like:'Game mobile phổ thông'},
 {id:2,name:'Pixel 16-bit',s:sPixel,d:'Điểm ảnh to, 16 màu, viền đen một điểm như máy SNES. Hoài cổ, rất rõ nét khi đông quái.',viet:1,light:5,like:'Game thùng, SNES'},
 {id:3,name:'Thủy mặc',s:sInk,d:'Tranh mực trên giấy dó. Gần như đơn sắc, chỉ điểm son đỏ ở khăn, máu và ấn triện. Đậm chất kiếm hiệp.',viet:4,light:4,like:'Phim, truyện kiếm hiệp'},
 {id:4,name:'Tranh Đông Hồ',s:sDongHo,d:'Màu phẳng tươi, viền đen dày như bản khắc gỗ, giấy điệp lấp lánh, in hơi lệch màu. Chưa game nào làm kiểu này.',viet:5,light:5,like:'Tranh dân gian Việt'},
 {id:5,name:'Sơn mài',s:sLacquer,d:'Nền đen bóng, son đỏ, vàng thếp, khảm vỏ trứng trên áo. Sang trọng, hợp không khí trận đêm và boss.',viet:5,light:4,like:'Tranh sơn mài Việt'},
 {id:6,name:'Cắt giấy nhiều lớp',s:sPaper,d:'Mọi thứ như cắt từ giấy màu, có bóng đổ từng lớp và mép giấy sần. Vui mắt, hợp mọi lứa tuổi.',viet:2,light:3,like:'Paper Mario, Tearaway'},
 {id:7,name:'Anime cel',s:sAnime,d:'Màu tươi, đổ bóng một nấc, đầu to, mắt anime, tia tốc độ và ngôi sao va chạm. Bùng nổ, giống game mobile Á Đông.',viet:2,light:4,like:'Game nhập vai mobile'},
 {id:8,name:'2.5D dựng khối',s:s25,d:'Ánh hoàng hôn chiếu nghiêng, tay chân đổ khối như tượng, nền gạch góc chéo, bóng đổ dài. Gần cảm giác Võ Lâm 2.',viet:3,light:3,like:'Võ Lâm Truyền Kỳ 2, MU'},
 {id:9,name:'3D low-poly',s:{three:1},d:'3D thật bằng Three.js: nhân vật, cây, đá dựng bằng khối, ánh sáng và bóng đổ thật. Nặng máy nhất.',viet:2,light:1,like:'Kiếm Thế, game 3D'},
 {id:10,name:'Tranh lụa',s:sSilk,d:'Màu nước loang trên lụa, nét sepia mảnh, sương núi và cành mai. Nhẹ nhàng, thanh lịch, ít bạo lực.',viet:4,light:4,like:'Tranh lụa Nguyễn Phan Chánh'},
];

/* ================= TRANG ================= */
const cards=[];const REDUCE=matchMedia('(prefers-reduced-motion: reduce)').matches;
function pips(n){let s='';for(let i=1;i<=5;i++)s+=`<i class="${i<=n?'f':''}"></i>`;return s}
function mount(){const grid=document.getElementById('grid');let chosen=null;try{chosen=+localStorage.getItem('dvhk_style')||null}catch(e){}
  STYLES.forEach((st,i)=>{const el=document.createElement('article');el.className='card';el.id='s'+st.id;
    el.innerHTML=`<div class="frame" role="button" tabindex="0" aria-label="Xem to kiểu ${st.id}: ${st.name}"><canvas></canvas>${st.s.three?'<div class="dmg" hidden>128</div>':''}<span class="zoom">Chạm để xem to</span></div>
      <div class="body"><div class="hd"><span class="no">${st.id}</span><h2>${st.name}</h2>${st.now?'<span class="tag">Đang dùng</span>':''}</div><p>${st.d}</p>
      <dl><dt>Chất Việt</dt><dd class="pips">${pips(st.viet)}</dd><dt>Nhẹ máy</dt><dd class="pips">${pips(st.light)}</dd><dt>Gần với</dt><dd>${st.like}</dd></dl>
      <button class="pick" aria-pressed="${chosen===st.id}">${chosen===st.id?'Đã chọn kiểu này':'Chọn kiểu này'}</button></div>`;
    grid.appendChild(el);const frame=el.querySelector('.frame');
    const card={st,style:st.s,el,frame,canvas:el.querySelector('canvas'),dmg:el.querySelector('.dmg'),vis:false,off:i*.23};cards.push(card);
    const open=()=>openBig(card);frame.addEventListener('click',open);frame.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();open()}});
    el.querySelector('.pick').addEventListener('click',()=>choose(st))});
  if(chosen)showChosen(STYLES.find(s=>s.id===chosen));
  const io=new IntersectionObserver(es=>es.forEach(e=>{const c=cards.find(c=>c.frame===e.target);if(c)c.vis=e.isIntersecting}),{rootMargin:'120px'});cards.forEach(c=>io.observe(c.frame));
  document.getElementById('bigClose').addEventListener('click',closeBig);document.addEventListener('keydown',e=>{if(e.key==='Escape')closeBig()});
  requestAnimationFrame(loop)}
function choose(st){try{localStorage.setItem('dvhk_style',st.id)}catch(e){}document.querySelectorAll('.pick').forEach(b=>{const on=b.closest('.card').id==='s'+st.id;b.setAttribute('aria-pressed',on);b.textContent=on?'Đã chọn kiểu này':'Chọn kiểu này'});showChosen(st)}
function showChosen(st){if(!st)return;const b=document.getElementById('chosen');b.innerHTML=`Bạn chọn kiểu <b>${st.id}: ${st.name}</b>. Nhắn cho Claude “chọn kiểu ${st.id}” để áp dụng cho cả game.`;b.hidden=false}
let big=null;
function openBig(card){if(big)return;big=card;const ov=document.getElementById('big');document.getElementById('bigTitle').textContent=`${card.st.id}. ${card.st.name}`;
  card.home=card.frame.parentNode;document.getElementById('bigStage').appendChild(card.frame);card.frame.classList.add('isbig');ov.hidden=false;document.getElementById('bigClose').focus()}
function closeBig(){if(!big)return;const card=big;card.home.insertBefore(card.frame,card.home.firstChild);card.frame.classList.remove('isbig');document.getElementById('big').hidden=true;big=null;card.frame.focus({preventScroll:true})}
function renderCard(card,t){const c=card.canvas,dpr=Math.min(2,window.devicePixelRatio||1),w=c.clientWidth,h=c.clientHeight;if(!w||!h)return;
  if(card.style.three){S3.render(card,t,w,h,dpr);return}
  const bw=Math.round(w*dpr),bh=Math.round(h*dpr);if(c.width!==bw||c.height!==bh){c.width=bw;c.height=bh;card.bg=null}
  const g=card.g||(card.g=c.getContext('2d'));const k=bw/VW;
  if(card.style.bg&&!card.bg){const b=mkc(bw,bh),bg=b.getContext('2d');bg.setTransform(k,0,0,k,0,0);card.style.bg(bg,k);card.bg=b}
  g.setTransform(1,0,0,1,0,0);g.clearRect(0,0,bw,bh);if(card.bg)g.drawImage(card.bg,0,0);
  g.setTransform(k,0,0,k,0,0);g.globalAlpha=1;card.style.draw(g,scene(t,card.style.hs),card,k)}
let first=true;
function loop(ts){requestAnimationFrame(loop);const now=ts/1000;
  for(const c of cards){const isBig=big===c;if(!c.vis&&!isBig&&!first)continue;const t=window.__freeze!=null?window.__freeze:REDUCE&&!isBig?1.28:((now+c.off)%CYC);if(window.__freeze==null&&REDUCE&&!isBig&&c.drawn&&c.drawnW===c.canvas.clientWidth)continue;
    try{renderCard(c,t);c.drawn=1;c.drawnW=c.canvas.clientWidth}catch(e){console.error(e)}}first=false}
window.__STYLES={cards,scene,renderCard};
const go=()=>mount();if(document.fonts&&document.fonts.ready)Promise.race([document.fonts.ready,new Promise(r=>setTimeout(r,1500))]).then(go);else go();
})();
