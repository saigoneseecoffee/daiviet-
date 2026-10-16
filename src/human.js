/* ============ NHÂN VẬT: VẼ THỦ TỤC, CÓ ĐỔ BÓNG, VIỀN, VẢI BAY ============ */
const _shC={};
function shade(hex,a){const k=hex+a;let v=_shC[k];if(v)return v;
  const n=parseInt(hex.slice(1,7),16);let r=n>>16,g=(n>>8)&255,b=n&255;
  if(a>0){r+=(255-r)*a;g+=(255-g)*a;b+=(255-b)*a}else{r*=1+a;g*=1+a;b*=1+a}
  v='#'+[r,g,b].map(c=>Math.max(0,Math.min(255,Math.round(c))).toString(16).padStart(2,'0')).join('');return _shC[k]=v}
const OL='#1a100a';
const LOOKS={
  kiem:{skin:'#efc9a0',hair:'#191313',robe:'#eef1ea',robe2:'#2a8a80',pants:'#2b3d3a',boots:'#2a1d16',sash:'#c8361f',armor:'robe',hat:'topknot',hatC:'#191313',band:'#35b0a3',tails:'#35b0a3',wp:'sword',wc:'#e2ecef',scab:'#2a6660'},
  cung:{skin:'#e6bb90',hair:'#1c1612',robe:'#66873a',robe2:'#3b5420',pants:'#4f3d27',boots:'#2e2016',sash:'#d6ac4e',armor:'leather',hat:'conical',hatC:'#e9d59c',quiver:1,wp:'bow',wc:'#7a4826'},
  giao:{skin:'#e8be93',hair:'#1a1310',robe:'#b5302a',robe2:'#6e1913',pants:'#3a2620',boots:'#26180f',sash:'#e2b24a',armor:'lamellar',plate:'#d9b25a',hat:'plume',hatC:'#cfa64a',cape:'#8f1f14',wp:'spear',wc:'#dfe6ea'},
  dao:{skin:'#e3b78a',hair:'#151018',robe:'#3a2950',robe2:'#1a1226',pants:'#221a30',boots:'#120d18',sash:'#a066e0',armor:'leather',hat:'mask',hatC:'#231931',tails:'#a066e0',scarf:'#a066e0',wp:'dual',wc:'#ece4fb'},
  con:{skin:'#dca97a',hair:'#dca97a',robe:'#e08c2c',robe2:'#8a4d14',pants:'#6b3a12',boots:'#3a2210',sash:'#7a2a1a',armor:'monk',hat:'bald',hatC:'#dca97a',beads:1,wp:'staff',wc:'#8a5a2a'},
  phap:{skin:'#efcca6',hair:'#16131c',robe:'#2e3f7a',robe2:'#e3cf96',pants:'#1f2a52',boots:'#15182a',sash:'#c9a24e',armor:'mage',hat:'tall',hatC:'#171a2e',tails:'#e3cf96',wp:'talisman',wc:'#ffd96a'},
  smith:{skin:'#c98e62',hair:'#2a1a12',robe:'#5a3a24',robe2:'#2a1a10',pants:'#3a2a1c',boots:'#1e140c',sash:'#8a6a44',armor:'apron',hat:'bald',hatC:'#c98e62',wp:'hammer',wc:'#555'},
  merchant:{skin:'#e3b98f',hair:'#1c1612',robe:'#8a5a32',robe2:'#c9a24e',pants:'#4a3420',boots:'#2a1c12',sash:'#d4322a',armor:'robe',hat:'conical',hatC:'#e8d8a0',wp:'none'},
  elder:{skin:'#e3c2a0',hair:'#f2eee6',robe:'#e8e2d0',robe2:'#8a7a5a',pants:'#c9c0aa',boots:'#4a3a2a',sash:'#5a4a32',armor:'mage',hat:'elder',hatC:'#f4f0e8',wp:'staffs',wc:'#6a4a2a'},
  master:{skin:'#deb088',hair:'#2a2420',robe:'#7a2a22',robe2:'#e2b24a',pants:'#2a1a14',boots:'#1a120c',sash:'#e2b24a',armor:'robe',hat:'topknot',hatC:'#2a2420',band:'#e2b24a',tails:'#e2b24a',wp:'staffs',wc:'#6a4a2a',beard:'full'},
  banker:{skin:'#e8c09a',hair:'#1c1612',robe:'#2f4a6a',robe2:'#c9a24e',pants:'#1f2a3a',boots:'#1a1410',sash:'#c9a24e',armor:'robe',hat:'cap',hatC:'#1c1c24',wp:'none',beard:'stache'},
  driver:{skin:'#d9a878',hair:'#1c1612',robe:'#3c5a7a',robe2:'#1f2f40',pants:'#2a2a2a',boots:'#1a1410',sash:'#c9a24e',armor:'robe',hat:'scarf',hatC:'#7a2a22',wp:'none'},
};
function factionLook(fac,wp){const F=FACTION[fac];
  const arm=fac==='han'||fac==='minh'?'lamellar':fac==='nguyen'?'leather':'robe';
  return{skin:'#ddb48a',hair:'#1a1410',robe:F.a,robe2:F.b,pants:shade(F.b,0.15),boots:'#1e150f',sash:F.hc,armor:arm,plate:shade(F.a,0.35),hat:F.h,hatC:F.hc,wp,wc:wp==='bow'?'#6a4426':'#cfd5da',enemy:1,beard:{phi:'full',han:'full',minh:'full',nguyen:'stache',thanh:'stache'}[fac],stubble:fac==='trieu'}}
const easeOutC=t=>1-Math.pow(1-t,3);
/* ---------- công cụ vẽ thân người mềm ----------
   Mỗi bộ phận là một khối thuôn (hai đầu tròn, hai bên cong như bắp thịt).
   Vẽ viền trước rồi tô màu sau, nên chỉ còn đường viền bao ngoài, chỗ nối khớp liền mạch.
   Viền dùng màu tối cùng tông với vải, không dùng đen, để nét mềm hơn. */
function _lgH(g,x0,y0,x1,y1,c){const gr=g.createLinearGradient(x0,y0,x1,y1);gr.addColorStop(0,shade(c,-0.35));gr.addColorStop(0.45,shade(c,0.35));gr.addColorStop(1,shade(c,-0.25));return gr}
function limb(g,pts,w,col){g.lineCap='round';g.lineJoin='round';g.beginPath();g.moveTo(pts[0],pts[1]);for(let i=2;i<pts.length;i+=2)g.lineTo(pts[i],pts[i+1]);
  g.strokeStyle=shade(col,-0.6);g.lineWidth=w+2;g.stroke();g.strokeStyle=col;g.lineWidth=w;g.stroke()}
const olc=c=>shade(c,-0.62);
/* khối thuôn từ A (bán kính ra) tới B (rb); b1/b2 = độ phồng hai bên */
function tseg(g,ax,ay,ra,bx,by,rb,b1,b2){const dx=bx-ax,dy=by-ay,d=Math.hypot(dx,dy)||1e-3,nx=-dy/d,ny=dx/d,an=Math.atan2(ny,nx),mx=(ax+bx)/2,my=(ay+by)/2,rm=(ra+rb)/2,p1=rm+(b1||0),p2=rm+(b2||0);
  g.moveTo(ax+nx*ra,ay+ny*ra);g.quadraticCurveTo(mx+nx*p1,my+ny*p1,bx+nx*rb,by+ny*rb);g.arc(bx,by,rb,an,an-Math.PI,true);
  g.quadraticCurveTo(mx-nx*p2,my-ny*p2,ax-nx*ra,ay-ny*ra);g.arc(ax,ay,ra,an+Math.PI,an,true);g.closePath()}
/* tô một hình: viền mềm trước, màu sau */
function solid(g,fill,ol,ow){g.lineJoin='round';g.lineCap='round';g.strokeStyle=ol;g.lineWidth=ow||2.2;g.stroke();g.fillStyle=fill;g.fill()}
/* động học ngược hai đoạn: vai -> khuỷu -> bàn tay */
function ik2(sx,sy,tx,ty,l1,l2,bend){let dx=tx-sx,dy=ty-sy,d=Math.hypot(dx,dy);const mx=l1+l2-0.05;if(d>mx){dx*=mx/d;dy*=mx/d;d=mx}if(d<1){d=1}
  const a=Math.atan2(dy,dx),c=Math.max(-1,Math.min(1,(l1*l1+d*d-l2*l2)/(2*l1*d))),b=Math.acos(c)*bend;
  return[sx+Math.cos(a+b)*l1,sy+Math.sin(a+b)*l1,sx+dx,sy+dy]}
const ROBEY={robe:1,mage:1,monk:1,apron:1};
const HEMD={robe:15.5,leather:12.5,lamellar:12,mage:24,monk:19,apron:16};

/* tư thế tay cầm vũ khí theo tiến trình đánh sw (0..1, -1 = nghỉ) */
function armPose(wp,sw,t){
  let a=1.25,wa=1.75,ex=0;const at=sw>=0;
  if(wp==='sword'||wp==='dual'||wp==='hammer'){wa=wp==='dual'?1.5:1.85;
    if(at){if(sw<0.22){const k=sw/0.22;a=lerp(1.25,-2.1,easeOutC(k))}else if(sw<0.55){const k=(sw-0.22)/0.33;a=lerp(-2.1,1.35,easeOutC(k))}else a=lerp(1.35,1.25,(sw-0.55)/0.45);wa=a+0.2}}
  else if(wp==='staff'||wp==='staffs'){a=0.9;wa=-1.45;if(wp==='staff'&&at){const k=sw<0.6?easeOutC(sw/0.6):1;a=lerp(-1.6,1.1,k);wa=a-1.57+0.3}}
  else if(wp==='spear'){a=0.95;wa=-1.42;if(at){const k=Math.sin(Math.min(1,sw/0.45)*Math.PI);a=lerp(0.6,0.15,k);wa=lerp(-0.25,-0.04,k);ex=k*15}else{a=1.05}}
  else if(wp==='bow'){a=0.05;wa=0}
  else if(wp==='talisman'){a=at?lerp(0.4,-0.7,Math.sin(Math.min(1,sw)*Math.PI)):0.75;wa=a-0.9}
  else if(wp==='shield'||wp==='bomb'){a=1.0;wa=1.6;if(at){a=lerp(1.0,-0.6,Math.sin(Math.min(1,sw)*Math.PI));wa=a+0.5}}
  return{a,wa,ex};
}
/* thân người hướng mặt sang +x, chân chạm đất tại y=0. Cao khoảng 62 đơn vị (≈4,6 đầu). */
function drawHuman(g,o){
  const L=o.look,f=o.f||1,s=o.sc||1,t=o.t||0,mv=o.moving?1:0,w=o.walk||0,sw=o.atk>=0?o.atk:-1,ride=!!o.ride;
  const robeT=ROBEY[L.armor],hemD=HEMD[L.armor]||14;
  g.save();g.translate(o.x,o.y);g.scale(s,s);
  if(!ride){g.fillStyle='rgba(0,0,0,0.3)';g.beginPath();g.ellipse(0,0,13,4.2,0,0,TAU);g.fill()}
  g.scale(f,1);
  const P=armPose(L.wp,sw,t);
  /* đà người khi đánh: lấy đà ngả sau rồi dồn người tới */
  let aL=0;if(sw>=0&&L.wp!=='bow'){aL=sw<0.22?-0.06*(sw/0.22):sw<0.55?lerp(-0.06,0.15,easeOutC((sw-0.22)/0.33)):lerp(0.15,0,(sw-0.55)/0.45)}
  if(L.wp==='spear'&&sw>=0)aL=P.ex/15*0.12;
  const brth=Math.sin(t*2.1),sway=Math.sin(t*3+w)*1.5+(mv?-3:0);
  /* ---- chân: góc đùi θ, độ gập gối κ; tự hạ hông để bàn chân bám đất ---- */
  const TH=13.4,SH=12.8,legs=[];
  for(const sd of[-1,1]){const ph=w+(sd>0?0:Math.PI);let th,k,toe=0;
    if(ride){th=1.3;k=1.15;toe=0.35}
    else if(mv){th=Math.sin(ph)*0.52;k=0.12+Math.max(0,Math.cos(ph))*0.95;toe=-Math.max(0,Math.cos(ph))*0.25+Math.max(0,-Math.sin(ph))*0.15}
    else{th=sd>0?0.16:-0.13;k=0.2+Math.max(0,aL)*1.2;if(sd>0)th+=Math.max(0,aL)*1.4;else th-=Math.max(0,aL)*0.6}
    const hx=sd*1.6,kx=hx+Math.sin(th)*TH,ky=Math.cos(th)*TH,ax=kx+Math.sin(th-k)*SH,ay=ky+Math.cos(th-k)*SH;
    legs.push({sd,th,k,hx,kx,ky,ax,ay,toe})}
  const hipY=ride?-17:-(2.5+Math.max(legs[0].ay,legs[1].ay));
  const lean=(mv?0.07:0)+aL,lunge=P.ex*0.22+Math.max(0,aL)*6;
  const tw=mv?-Math.sin(w)*1.1:aL*6; // vặn vai theo bước chân
  /* chân dùng hệ toạ độ thường; thân trên xoay quanh hông */
  const legG=(l,dark)=>{const pc=dark?shade(L.pants,-0.24):L.pants,bc=dark?shade(L.boots,-0.22):L.boots;
    const X=v=>v,hy=hipY,K=[l.kx,hy+l.ky],A=[l.ax,hy+l.ay],H=[l.hx,hy];
    g.beginPath();tseg(g,H[0],H[1],4.1,K[0],K[1],3.1,0.5,1.2);tseg(g,K[0],K[1],3.1,A[0],A[1],2.2,1.3,0.2);solid(g,pc,olc(pc));
    // nếp quần ở gối
    g.strokeStyle='rgba(0,0,0,0.16)';g.lineWidth=0.8;g.beginPath();g.moveTo(K[0]-1.6,K[1]-1.2);g.quadraticCurveTo(K[0]+0.6,K[1]+0.4,K[0]+2.2,K[1]-0.6);g.stroke();
    // ống ủng
    const sa=l.th-l.k,bx=A[0]-Math.sin(sa)*5.6,by=A[1]-Math.cos(sa)*5.6;
    g.beginPath();tseg(g,bx,by,2.65,A[0],A[1],2.25,0.4,0);
    // bàn chân (ủng vải mũi hơi cong)
    const fa=(ride?0.35:0)+l.toe,c=Math.cos(fa),sn=Math.sin(fa),P2=(x,y)=>[A[0]+x*c-y*sn,A[1]+x*sn+y*c];
    let q=P2(-2.2,-1.4);g.moveTo(q[0],q[1]);q=P2(-2.8,1.2);g.lineTo(q[0],q[1]);let q1=P2(-2.8,2.5),q2=P2(-1.3,2.5);g.quadraticCurveTo(q1[0],q1[1],q2[0],q2[1]);
    q=P2(4.4,2.5);g.lineTo(q[0],q[1]);q1=P2(6.8,2.5);q2=P2(6.9,0.8);g.quadraticCurveTo(q1[0],q1[1],q2[0],q2[1]);q1=P2(5.2,0.1);q2=P2(1.8,-0.9);g.quadraticCurveTo(q1[0],q1[1],q2[0],q2[1]);q=P2(1.2,-1.8);g.lineTo(q[0],q[1]);g.closePath();
    solid(g,bc,olc(bc));
    g.strokeStyle=shade(bc,0.25);g.lineWidth=0.9;g.beginPath();g.moveTo(bx+Math.cos(sa)*2.4,by-Math.sin(sa)*2.4);g.lineTo(bx-Math.cos(sa)*2.4,by+Math.sin(sa)*2.4);g.stroke();
    if(L.greave){const gx=lerp(K[0],A[0],0.2),gy=lerp(K[1],A[1],0.2),hx2=lerp(K[0],A[0],0.72),hy2=lerp(K[1],A[1],0.72);g.beginPath();tseg(g,gx,gy,2.9,hx2,hy2,2.6,0.8,0.3);
      solid(g,dark?shade(L.greave,-0.2):L.greave,olc(L.greave),1.8);g.strokeStyle='rgba(255,255,255,0.3)';g.lineWidth=0.7;g.beginPath();g.moveTo(gx+2,gy);g.lineTo(hx2+1.8,hy2);g.stroke()}
    return{K,A}};
  /* điểm trên đùi chuyển sang hệ toạ độ thân trên (để vạt áo bám theo đầu gối) */
  const cl=Math.cos(-lean),sl=Math.sin(-lean);
  const toUp=(x,y)=>{y-=hipY;return[x*cl-y*sl-lunge,x*sl+y*cl]};
  const hemPt=(l)=>{const r=hemD;let px=l.hx+Math.sin(l.th)*r*0.85,py=Math.cos(l.th)*r*0.86+r*0.12;if(ride){px=l.hx+Math.sin(l.th)*Math.min(r,TH)+0.5;py=Math.min(r,TH)*0.35+Math.max(0,r-TH)}return toUp(px,py+hipY)};
  const bk=legs[0],fr=legs[1];

  /* ===== lớp sau cùng: áo choàng, ống tên, dây buộc (thân trên) ===== */
  g.save();g.translate(0,hipY);g.rotate(lean);g.translate(lunge,0);
  const SY=-16.4+brth*0.25,NY=-18.2;// vai, chân cổ
  if(L.cape){const cp=L.cape;g.beginPath();g.moveTo(-4.5,SY-1);g.quadraticCurveTo(-11+sway*0.6,SY+10,-12+sway*1.6,hemD*0.8);g.quadraticCurveTo(-6+sway,hemD*0.8+2,-1+sway*0.5,hemD*0.75);g.quadraticCurveTo(-2,SY+8,3,SY-1);g.closePath();solid(g,shade(cp,-0.15),olc(cp));
    g.strokeStyle='rgba(0,0,0,0.2)';g.lineWidth=0.9;g.beginPath();g.moveTo(-3,SY+2);g.quadraticCurveTo(-8+sway*0.6,SY+12,-7+sway*1.2,hemD*0.78);g.stroke()}
  if(L.quiver){g.save();g.translate(-5.6,-11.5);g.rotate(-0.38);g.beginPath();g.roundRect(-3,-5,6,17,2.2);solid(g,'#6a4426',olc('#6a4426'),2);
    g.fillStyle='#c9a24e';g.fillRect(-3,-1,6,1.4);g.fillRect(-3,8,6,1.2);for(let i=0;i<3;i++){g.fillStyle=i%2?'#e8e0cc':'#c8361f';g.beginPath();g.moveTo(-2+i*2,-5);g.lineTo(-3+i*2,-11);g.lineTo(-1+i*2,-11);g.fill()}g.restore()}
  if(L.scab){g.save();g.translate(-4.4,-2.5);g.rotate(2.45);g.beginPath();g.roundRect(-1.8,0,3.6,19,1.6);solid(g,L.scab,olc(L.scab),2);g.fillStyle='#c9a24e';g.fillRect(-2,0,4,2);g.fillRect(-2,16.5,4,2.5);g.restore()}
  // đuôi đai lưng bay phía sau
  g.strokeStyle=shade(L.sash,-0.15);g.lineWidth=2.3;g.lineCap='round';g.beginPath();g.moveTo(-5.4,-4.2);g.quadraticCurveTo(-9.5+sway,1,-11.5+sway*1.4,7+Math.sin(t*4)*1.2);g.stroke();
  g.lineWidth=1.8;g.beginPath();g.moveTo(-5.4,-3.6);g.quadraticCurveTo(-8+sway,2.5,-9+sway*1.2,9.5+Math.sin(t*4+1)*1.2);g.stroke();
  g.restore();

  /* ===== chân sau + vạt áo sau ===== */
  if(!ride)legG(bk,1);
  g.save();g.translate(0,hipY);g.rotate(lean);g.translate(lunge,0);
  const robeC=L.robe,robeD=shade(L.robe,-0.2);
  const panel=(l,front)=>{const h=hemPt(l),fl=Math.sin(t*4+(front?0:2))*0.6*(mv||0.5);const wv=front?1:-1;
    const x0=front?-1.6:-5.6,x1=front?6:2.2,hb=h[1],lx=h[0]-(front?3.4:5.2)+(front?0:sway*0.35),rx=h[0]+(front?5.6:3.2);
    g.beginPath();g.moveTo(x0,-4);g.quadraticCurveTo(lerp(x0,lx,0.5)-1.4,lerp(-4,hb,0.55),lx,hb+0.4);g.quadraticCurveTo((lx+rx)/2,hb+1.6+fl,rx,hb-0.3+fl*0.5);
    g.quadraticCurveTo(lerp(x1,rx,0.5)+1.2,lerp(-4,hb,0.5),x1,-4);g.closePath();return[lx,rx,hb]};
  {const r=panel(bk,0);solid(g,shade(robeD,-0.08),olc(robeC));
    if(L.armor==='lamellar'){g.save();g.clip();g.strokeStyle='rgba(0,0,0,0.28)';g.lineWidth=0.7;g.beginPath();for(let y=-1;y<r[2];y+=3.2){g.moveTo(-12,y);g.lineTo(12,y)}g.stroke();g.restore()}}
  g.restore();

  /* ===== tay sau ===== */
  g.save();g.translate(0,hipY);g.rotate(lean);g.translate(lunge,0);
  const L1=9.4,L2=8.6;
  const Sb=[-4.2-tw*0.5,SY+0.6],Sf=[4.3+tw,SY+0.8];
  // mục tiêu bàn tay trước
  let fT,fBend=1;
  if(L.wp==='bow'){fT=[Sf[0]+16.2,Sf[1]+1.2];}
  else if(L.wp==='none'){const sa=Math.PI/2-(mv?Math.sin(w)*0.55:0.08);fT=[Sf[0]+Math.cos(sa)*16.4,Sf[1]+Math.sin(sa)*16.4]}
  else{const rc=(L1+L2)*(L.wp==='spear'?0.8:0.86)+P.ex*0.25;fT=[Sf[0]+Math.cos(P.a)*rc,Sf[1]+Math.sin(P.a)*rc];if(P.a<-0.2)fBend=-1}
  const fArm=ik2(Sf[0],Sf[1],fT[0],fT[1],L1,L2,fBend);const fH=[fArm[2],fArm[3]];
  // mục tiêu bàn tay sau
  let bT,bBend=1;const twoH=L.wp==='spear'||L.wp==='staff'||L.wp==='staffs';
  if(twoH){const back=L.wp==='spear'?11:9;bT=[fH[0]-Math.cos(P.wa)*back,fH[1]-Math.sin(P.wa)*back]}
  else if(L.wp==='bow'){const pull=sw>=0?Math.sin(Math.min(1,sw)*Math.PI):0;bT=sw>=0?[Sf[0]+14-pull*13,Sf[1]+1.2]:[Sb[0]+3,Sb[1]+15];bBend=sw>=0?-1:1}
  else{let ba=Math.PI/2+0.12+(mv?Math.sin(w)*0.55:0);if(sw>=0&&L.wp!=='talisman')ba=Math.PI/2+0.35+Math.max(0,aL)*5;if(L.wp==='dual'&&sw>=0)ba=Math.PI/2+0.2-Math.max(0,aL)*4;if(L.wp==='talisman')ba=Math.PI/2-0.6;
    bT=[Sb[0]+Math.cos(ba)*15.8,Sb[1]+Math.sin(ba)*15.8]}
  const bArm=ik2(Sb[0],Sb[1],bT[0],bT[1],L1,L2,bBend);const bHand=[bArm[2],bArm[3]];
  const sleeveC=robeT?L.robe:shade(L.robe,-0.06);
  const arm=(S,E,H,col,dark)=>{const c=dark?shade(col,-0.26):col,ol=olc(col);const fa=Math.atan2(H[1]-E[1],H[0]-E[0]);
    const W=[lerp(E[0],H[0],0.86),lerp(E[1],H[1],0.86)];
    g.beginPath();
    if(robeT){tseg(g,S[0],S[1],3.5,E[0],E[1],2.9,0.6,0.6);tseg(g,E[0],E[1],2.9,W[0],W[1],3.7,0.3,0.3);
      // tay áo rộng rủ xuống theo trọng lực
      const n1=[-Math.sin(fa),Math.cos(fa)],lo=n1[1]>=0?1:-1,lw=[W[0]+n1[0]*3.7*lo,W[1]+n1[1]*3.7*lo],le=[E[0]+n1[0]*2.9*lo,E[1]+n1[1]*2.9*lo];
      const sag=1.2+Math.abs(Math.cos(fa))*4.6;
      g.moveTo(le[0],le[1]);g.quadraticCurveTo(lerp(le[0],lw[0],0.6),lerp(le[1],lw[1],0.6)+sag+sway*0.15,lw[0]-Math.cos(fa)*0.6+sway*0.2,lw[1]+sag*0.55);g.lineTo(lw[0],lw[1]);g.closePath()}
    else{tseg(g,S[0],S[1],3.1,E[0],E[1],2.45,0.7,0.5);tseg(g,E[0],E[1],2.45,W[0],W[1],2.0,0.9,0.2)}
    solid(g,c,ol);
    // cổ tay áo / bao tay
    if(robeT){g.strokeStyle=dark?shade(L.robe2,-0.2):L.robe2;g.lineWidth=1.5;const n=[-Math.sin(fa),Math.cos(fa)];g.beginPath();g.moveTo(W[0]+n[0]*3.5,W[1]+n[1]*3.5);g.lineTo(W[0]-n[0]*3.5,W[1]-n[1]*3.5);g.stroke()}
    else{const bc=L.armor==='lamellar'?(L.plate||'#c9a24e'):'#4a3020',B0=[lerp(E[0],H[0],0.42),lerp(E[1],H[1],0.42)];g.beginPath();tseg(g,B0[0],B0[1],2.6,W[0],W[1],2.3,0.4,0.2);solid(g,dark?shade(bc,-0.25):bc,olc(bc),1.8)}
    // nếp gấp khuỷu
    g.strokeStyle='rgba(0,0,0,0.18)';g.lineWidth=0.8;g.beginPath();g.moveTo(E[0]-1.4,E[1]-1);g.lineTo(E[0]+1.2,E[1]+0.8);g.stroke();
    return fa};
  const hand=(H,fa,dark,open)=>{const sk=dark?shade(L.skin,-0.14):L.skin;g.save();g.translate(H[0],H[1]);g.rotate(fa);g.beginPath();
    if(open){g.ellipse(1.3,0,2.7,1.75,0,0,TAU)}else{g.ellipse(0.8,0,2.25,2.05,0,0,TAU)}solid(g,sk,olc(L.skin),1.7);
    g.fillStyle=shade(sk,-0.14);g.beginPath();g.ellipse(open?0.6:0.2,-1.1,1.3,0.75,0.4,0,TAU);g.fill(); // ngón cái
    g.restore()};
  const bfa=arm(Sb,[bArm[0],bArm[1]],bHand,sleeveC,1);
  if(L.wp==='dual'){g.save();g.translate(bHand[0],bHand[1]);g.rotate(bfa+0.75);drawBlade(g,'dual',L,o.glow||0,t);g.restore()}
  hand(bHand,bfa,1,L.wp==='none'||L.wp==='talisman');
  g.restore();

  /* ===== chân trước ===== */
  if(!ride)legG(fr,0);

  /* ===== thân trên ===== */
  g.save();g.translate(0,hipY);g.rotate(lean);g.translate(lunge,0);
  // cổ
  g.beginPath();tseg(g,0.8,NY-2.6,2.1,0.2,NY+1.4,2.6,0,0.4);solid(g,shade(L.skin,-0.16),olc(L.skin),1.8);
  // thân áo
  const br=brth*0.35,tx=tw;
  const torso=()=>{g.beginPath();g.moveTo(-2.2+tx*0.3,NY+0.2);g.quadraticCurveTo(-6.2-tx*0.4,NY+0.4,-6.6-tx*0.5,SY+2.2);g.quadraticCurveTo(-7.2,-9.5,-5.4,-4.6);g.lineTo(-5.9,0.4);g.lineTo(6.2,0.4);g.lineTo(5.7,-4.6);
    g.quadraticCurveTo(7.7+br,-9.6,7.1+tx,SY+2.2);g.quadraticCurveTo(6.6+tx,NY+0.2,2.8+tx*0.5,NY-0.2);g.closePath()};
  torso();solid(g,shade(robeC,0.03),olc(robeC));
  g.fillStyle='rgba(30,12,0,0.2)';g.beginPath();g.moveTo(-2.2+tx*0.3,NY+0.2);g.quadraticCurveTo(-6.2-tx*0.4,NY+0.4,-6.6-tx*0.5,SY+2.2);g.quadraticCurveTo(-7.2,-9.5,-5.4,-4.6);g.lineTo(-5.9,0.4);g.lineTo(-2.4,0.4);g.quadraticCurveTo(-3.4,-9,-2.2+tx*0.3,NY+0.2);g.fill();
  const clipT=L.armor==='lamellar'||L.ov;g.save();if(clipT){torso();g.clip()}
  // nếp vải dọc thân
  g.strokeStyle='rgba(0,0,0,0.13)';g.lineWidth=0.9;g.beginPath();g.moveTo(1,-11);g.quadraticCurveTo(-0.5,-7,0.6,-3);g.moveTo(-3,-12.5);g.quadraticCurveTo(-3.8,-8,-3.2,-4);g.stroke();
  g.strokeStyle='rgba(255,250,235,0.22)';g.lineWidth=1.1;g.beginPath();g.moveTo(6.6+tx,SY+3);g.quadraticCurveTo(7.4+br,-9.6,5.4,-5);g.stroke();
  switch(L.armor){
    case'lamellar':{const pc=L.plate||'#d9b25a';g.fillStyle=shade(robeC,-0.12);g.fillRect(-8,SY+2,17,12);
      g.lineWidth=0.75;g.strokeStyle=shade(pc,-0.35);g.beginPath();for(let r=0;r<4;r++){const y=SY+3.2+r*3.1;g.moveTo(-8,y);g.lineTo(9,y)}g.stroke();
      g.strokeStyle=shade(pc,-0.1);g.beginPath();for(let r=0;r<4;r++){const y=SY+3.2+r*3.1;for(let c=-7;c<=8;c+=2.4){g.moveTo(c+(r%2)*1.2,y-3);g.lineTo(c+(r%2)*1.2,y)}}g.stroke();
      g.fillStyle=pc;g.beginPath();g.arc(2.2,SY+6.5,1.7,0,TAU);g.fill();break}
    case'leather':g.strokeStyle='#3a2414';g.lineWidth=2;g.beginPath();g.moveTo(-6,SY+1.5);g.lineTo(6.5,-5);g.stroke();g.fillStyle='#c9a24e';g.beginPath();g.arc(0.6,-10.6,1.2,0,TAU);g.fill();break;
    case'monk':g.strokeStyle=shade(L.robe2,-0.05);g.lineWidth=3.6;g.beginPath();g.moveTo(-6.5,SY+1);g.lineTo(6.6,-4);g.stroke();g.strokeStyle=shade(L.robe2,0.25);g.lineWidth=0.7;g.beginPath();g.moveTo(-6,SY);g.lineTo(6.6,-5.4);g.stroke();break;
    case'mage':g.fillStyle=L.robe2;for(let i=0;i<3;i++){g.beginPath();g.arc(4.2,-12+i*3.4,0.75,0,TAU);g.fill()}break;
    case'apron':g.fillStyle='#3a2a1c';g.beginPath();g.moveTo(-4,-12);g.lineTo(6.5,-12);g.lineTo(7.5,1);g.lineTo(-4,1);g.closePath();g.fill();break;
  }
  if(L.ov&&L.armor!=='lamellar'){const pc=L.ov;g.fillStyle=_lgH(g,-6,0,7,0,pc);g.beginPath();g.moveTo(-7,SY+2.2);g.quadraticCurveTo(1,SY+0.6,8,SY+2.2);g.lineTo(8,-6);g.lineTo(-7,-6);g.closePath();g.fill();
    g.strokeStyle=shade(pc,-0.45);g.lineWidth=0.7;g.beginPath();for(let r=0;r<3;r++){const y=SY+5+r*3;g.moveTo(-7,y);g.lineTo(8,y);for(let c=-5;c<=7;c+=3){g.moveTo(c+(r%2)*1.5,y-3);g.lineTo(c+(r%2)*1.5,y)}}g.stroke();
    if(L.ovDisc){g.fillStyle=L.ovDisc;g.beginPath();g.arc(2,SY+6.5,2.2,0,TAU);g.fill()}}
  // cổ áo giao lĩnh: vạt phải chéo đè vạt trái
  g.strokeStyle=L.robe2;g.lineWidth=2.3;g.beginPath();g.moveTo(-1.6+tx*0.3,NY+0.4);g.quadraticCurveTo(1.2,SY+3,5.8,-6);g.stroke();
  g.strokeStyle=shade(L.robe2,0.3);g.lineWidth=0.7;g.beginPath();g.moveTo(-1.2+tx*0.3,NY);g.quadraticCurveTo(1.6,SY+2.4,6.2,-6.6);g.stroke();
  g.strokeStyle='#efe6d2';g.lineWidth=1.3;g.beginPath();g.moveTo(2.6+tx*0.5,NY-0.1);g.quadraticCurveTo(1.6,NY+1.6,0.8,SY+3.2);g.stroke();
  g.restore();// hết clip
  /* vạt áo trước (sau chân trước, che đùi) */
  {const r=panel(fr,1);solid(g,shade(robeC,-0.05),olc(robeC));
    g.save();if(L.armor==='lamellar')g.clip();
    if(L.armor==='lamellar'){g.strokeStyle='rgba(0,0,0,0.3)';g.lineWidth=0.7;g.beginPath();for(let y=-1;y<r[2];y+=3.2){g.moveTo(-14,y);g.lineTo(18,y)}g.stroke();g.fillStyle=L.plate||'#d9b25a';g.fillRect(-14,r[2]-1.4,32,1.4)}
    else{g.strokeStyle='rgba(0,0,0,0.15)';g.lineWidth=0.9;g.beginPath();g.moveTo(1.8,-3);g.quadraticCurveTo(r[0]+3,r[2]*0.5,r[0]+2.6,r[2]);g.stroke();
      g.strokeStyle=L.robe2;g.lineWidth=1.8;g.beginPath();g.moveTo(r[0]+0.6,r[2]-0.4);g.lineTo(r[1]-0.6,r[2]-0.9);g.stroke()}
    g.restore()}
  // đai lưng
  g.beginPath();g.moveTo(-6.2,-6.4);g.quadraticCurveTo(0,-7.2,6.4,-6.6);g.lineTo(6.5,-2.8);g.quadraticCurveTo(0,-2.2,-6.3,-2.6);g.closePath();solid(g,L.sash,olc(L.sash),2);
  g.strokeStyle=shade(L.sash,0.35);g.lineWidth=0.7;g.beginPath();g.moveTo(-5.6,-5.9);g.quadraticCurveTo(0,-6.6,5.9,-6);g.stroke();
  g.fillStyle=L.buckle||'#e8c35a';g.strokeStyle=olc('#e8c35a');g.lineWidth=0.8;g.beginPath();g.roundRect(2.4,-7,3.2,4.8,0.8);g.fill();g.stroke();
  if(L.buckleGem){g.fillStyle=L.buckleGem;g.beginPath();g.arc(4,-4.6,1,0,TAU);g.fill()}
  // nút thắt đai rủ trước
  g.strokeStyle=shade(L.sash,-0.08);g.lineWidth=1.6;g.beginPath();g.moveTo(5.2,-3);g.quadraticCurveTo(6.4+sway*0.15,1,5.6+sway*0.3,4.6+Math.sin(t*4)*0.5);g.stroke();
  if(L.pend){g.strokeStyle='#c9a24e';g.lineWidth=0.6;g.beginPath();g.moveTo(-0.5,NY+0.6);g.lineTo(1.8,SY+5);g.lineTo(4,NY+0.4);g.stroke();g.fillStyle=L.pend;g.beginPath();g.arc(1.8,SY+5.8,1.6,0,TAU);g.fill();
    if(L.pendGlow){g.save();g.globalCompositeOperation='lighter';g.fillStyle=L.pendGlow;g.globalAlpha=0.5+Math.sin(t*4)*0.25;g.beginPath();g.arc(1.8,SY+5.8,3.6,0,TAU);g.fill();g.restore()}}
  if(L.beads){g.fillStyle='#5a2a14';for(let i=0;i<9;i++){const a=Math.PI*0.12+i/8*Math.PI*0.72;g.beginPath();g.arc(0.8+Math.cos(a)*5.6,NY-0.6+Math.sin(a)*5.4,1.1,0,TAU);g.fill()}}
  // giáp vai
  if(L.armor==='lamellar'||L.pauld){const pc=L.pauld||L.plate||'#d9b25a';[[Sb,0.25,1],[Sf,-0.15,0]].forEach(([S,r,dk])=>{if(dk)return;g.save();g.translate(S[0],S[1]+0.4);g.rotate(r);
    for(let i=2;i>=0;i--){g.beginPath();g.ellipse(0,i*1.9,4.6-i*0.3,3.2,0,Math.PI,TAU);g.lineTo(4.3-i*0.3,i*1.9+1.2);g.lineTo(-4.3+i*0.3,i*1.9+1.2);g.closePath();solid(g,i?shade(L.pauldB||robeC,-0.1*i):(L.pauldB||shade(robeC,-0.05)),olc(robeC),1.6)}
    g.strokeStyle=pc;g.lineWidth=0.9;g.beginPath();g.ellipse(0,0.3,4,2.4,0,Math.PI,TAU);g.stroke();g.restore()})}
  /* ---- đầu: vẽ theo đơn vị cũ (bán kính 8), thu nhỏ 0,8 ---- */
  const HY=NY-7.4,HX=1.4+Math.max(0,aL)*3;
  g.save();g.translate(HX,HY);g.rotate(Math.max(-0.08,Math.min(0.12,aL*0.6))+(mv?0.03:0));g.scale(0.8,0.8);
  drawHead(g,L,t,sway);
  g.restore();
  if(ride){g.restore();g.save();// chân cưỡi (chỉ thấy chân gần) vẽ trước tay trước
    legG(fr,0);g.translate(0,hipY);g.rotate(lean);g.translate(lunge,0);panel(fr,1);solid(g,shade(robeC,-0.06),olc(robeC));
  }
  /* ---- tay trước + vũ khí ---- */
  const drawW=()=>{if(L.wp==='none')return;g.save();g.translate(fH[0],fH[1]);g.rotate(P.wa);if(L.wTier)g.scale(1+L.wTier*0.05,1+L.wTier*0.05);drawBlade(g,L.wp,L,o.glow||0,t,sw,bHand,fH);g.restore()};
  if(twoH)drawW();
  const ffa=arm(Sf,[fArm[0],fArm[1]],fH,sleeveC,0);
  if(L.armor==='lamellar'||L.pauld){const pc=L.pauld||L.plate||'#d9b25a';g.save();g.translate(Sf[0],Sf[1]-0.2);g.rotate(Math.atan2(fArm[1]-Sf[1],fArm[0]-Sf[0])-Math.PI/2);
    for(let i=2;i>=0;i--){g.beginPath();g.ellipse(0,i*1.8,4.4-i*0.3,3,0,Math.PI,TAU);g.lineTo(4.1-i*0.3,i*1.8+1.1);g.lineTo(-4.1+i*0.3,i*1.8+1.1);g.closePath();solid(g,i?shade(L.pauldB||robeC,-0.08*i):(L.pauldB||shade(robeC,0.05)),olc(robeC),1.6)}
    g.strokeStyle=pc;g.lineWidth=0.9;g.beginPath();g.ellipse(0,0.3,3.8,2.3,0,Math.PI,TAU);g.stroke();g.restore()}
  if(!twoH)drawW();
  hand(fH,L.wp==='bow'?-Math.PI/2:ffa,0,L.wp==='none'||L.wp==='talisman');
  // vị trí mũi vũ khí (để vẽ vệt chém), quy về toạ độ thế giới
  if(o.tipOut){const len=WLEN[L.wp]||0;const c=Math.cos(lean),sn=Math.sin(lean);
    const tr=(x,y)=>{x+=lunge;return[x*c-y*sn,x*sn+y*c+hipY]};
    const tp=tr(fH[0]+Math.cos(P.wa)*len,fH[1]+Math.sin(P.wa)*len),mp=tr(fH[0]+Math.cos(P.wa)*len*0.45,fH[1]+Math.sin(P.wa)*len*0.45);
    o.tipOut.x=o.x+tp[0]*f*s;o.tipOut.y=o.y+tp[1]*s;o.tipOut.mx=o.x+mp[0]*f*s;o.tipOut.my=o.y+mp[1]*s}
  g.restore();
  g.restore();
}
/* đầu nghiêng ba phần tư, mặt hướng +x, tâm (0,0), đơn vị cũ (bán kính ~8) */
function drawHead(g,L,t,sway){
  const sk=L.skin,ol=olc(sk),hairC=L.hair,noHair=L.hat==='bald'||L.hat==='mask';
  // dải buộc tóc bay phía sau đầu
  if(L.tails&&L.hat!=='tall'&&L.hat!=='mask'){g.strokeStyle=L.tails;g.lineWidth=2.1;g.lineCap='round';g.beginPath();g.moveTo(-7,-3.4);g.quadraticCurveTo(-14+sway,0,-18+sway*1.5,6+Math.sin(t*5)*1.5);g.stroke();
    g.lineWidth=1.7;g.beginPath();g.moveTo(-7,-2.6);g.quadraticCurveTo(-12+sway,4,-15+sway*1.3,10+Math.sin(t*5+1)*1.5);g.stroke()}
  // tóc dài phía sau gáy
  if(!noHair){g.beginPath();g.moveTo(-3,-6);g.quadraticCurveTo(-10,-3,-8.6+sway*0.2,6);g.quadraticCurveTo(-7+sway*0.3,10.5,-4.4,9.4);g.quadraticCurveTo(-3,4,-1,2);g.closePath();solid(g,hairC,olc(hairC==='#dca97a'?'#5a3a20':'#3a2a20'),1.8)}
  // sọ + mặt nghiêng
  const face=()=>{g.beginPath();g.moveTo(-3.6,7.2);g.bezierCurveTo(-8.8,4.6,-9,-7.6,-1.2,-8.8);g.bezierCurveTo(4.8,-9.4,8.1,-5.6,7.6,-1.9);
    g.quadraticCurveTo(7.4,-0.5,8.1,0.7);g.lineTo(9.2,2.7);g.quadraticCurveTo(8.7,3.4,7.9,3.35);g.quadraticCurveTo(8.35,3.95,8.05,4.6);g.quadraticCurveTo(8.3,5.3,7.65,5.8);
    g.quadraticCurveTo(7.9,7.5,5.9,8.2);g.quadraticCurveTo(2.2,8.7,-0.6,5.8);g.closePath()};
  face();solid(g,sk,ol,2);g.fillStyle=shade(sk,0.12);g.beginPath();g.ellipse(4.4,-3.4,2.8,2,0.2,0,TAU);g.fill();
  // bóng gò má, dưới hàm
  g.fillStyle='rgba(120,50,30,0.13)';g.beginPath();g.ellipse(3.2,4.6,2.8,1.5,-0.2,0,TAU);g.fill();
  g.fillStyle='rgba(60,25,10,0.16)';g.beginPath();g.moveTo(-0.6,5.8);g.quadraticCurveTo(2.2,8.7,5.9,8.2);g.quadraticCurveTo(3,7.4,0.6,4.2);g.closePath();g.fill();
  // tóc phủ đỉnh đầu + mái + tóc mai
  if(!noHair){g.beginPath();g.moveTo(-3.9,6.4);g.bezierCurveTo(-9.6,3.4,-9.6,-8.4,-1.2,-9.4);g.bezierCurveTo(5.3,-10,8.7,-6.2,7.8,-3.3);g.quadraticCurveTo(5.4,-4.7,3.3,-3.2);
    g.quadraticCurveTo(2.1,-1,2.5,2.4);g.lineTo(1.3,2.5);g.quadraticCurveTo(0.6,-1.2,-1.6,-1.8);g.quadraticCurveTo(-3,1,-2.7,5.2);g.closePath();
    solid(g,hairC,olc(hairC==='#f2eee6'?'#8a8070':'#3a2a20'),1.8);g.strokeStyle='rgba(255,255,255,0.16)';g.lineWidth=1;g.beginPath();g.moveTo(-5.5,-5.5);g.quadraticCurveTo(-1,-9,4.5,-7.4);g.stroke();
    g.strokeStyle='rgba(0,0,0,0.25)';g.lineWidth=0.6;g.beginPath();g.moveTo(-6,-1);g.quadraticCurveTo(-3,-6,3,-6.6);g.moveTo(-6.6,2);g.quadraticCurveTo(-4.4,-3,1,-4.6);g.stroke()}
  // tai
  g.beginPath();g.ellipse(-0.3,1.5,1.55,2.35,0.1,0,TAU);solid(g,shade(sk,-0.06),ol,1.4);g.strokeStyle=shade(sk,-0.3);g.lineWidth=0.6;g.beginPath();g.arc(-0.1,1.5,0.9,-1.4,1.6);g.stroke();
  // mắt hạnh
  const ang=L.enemy?1:0;
  g.fillStyle='#fbf7ee';g.beginPath();g.moveTo(3.2,0.5);g.quadraticCurveTo(4.9,-0.9,6.6,0.1);g.quadraticCurveTo(5,1.5,3.2,0.5);g.fill();
  g.fillStyle='#2b1a10';g.beginPath();g.arc(5.3,0.32,0.95,0,TAU);g.fill();g.fillStyle='#000';g.beginPath();g.arc(5.4,0.32,0.45,0,TAU);g.fill();
  g.fillStyle='#fff';g.fillRect(5.6,-0.2,0.45,0.45);
  g.strokeStyle='#1e120a';g.lineWidth=0.95;g.lineCap='round';g.beginPath();g.moveTo(3,0.35);g.quadraticCurveTo(4.9,-1.15,6.8,0);g.stroke();
  g.strokeStyle='rgba(90,40,20,0.35)';g.lineWidth=0.5;g.beginPath();g.moveTo(3.6,1.3);g.quadraticCurveTo(5,1.8,6.3,0.9);g.stroke();
  // mày
  g.fillStyle=L.hat==='elder'?'#f4f0e8':shade(hairC==='#dca97a'?'#3a2416':hairC,0.05);g.beginPath();g.moveTo(2.6,-2.1+ang*0.2);g.quadraticCurveTo(4.8,-3.6+ang*0.3,7.3,-2.9+ang*1.1);g.lineTo(7.2,-2.2+ang*1.1);g.quadraticCurveTo(4.8,-2.6,2.6,-1.5);g.closePath();g.fill();
  // mũi, miệng
  g.strokeStyle='rgba(110,50,30,0.45)';g.lineWidth=0.6;g.beginPath();g.moveTo(8.3,1.4);g.quadraticCurveTo(8.2,2.6,7.6,2.9);g.stroke();
  g.strokeStyle=L.enemy?'rgba(90,30,20,0.8)':'rgba(130,50,40,0.7)';g.lineWidth=0.75;g.beginPath();g.moveTo(6.4,4.75);g.quadraticCurveTo(7.2,ang?4.95:4.45,8,4.6);g.stroke();
  // râu cho quân địch
  if(L.beard){g.fillStyle=L.beard==='white'?'#efeae0':'#20160f';
    if(L.beard!=='stache'){g.beginPath();g.moveTo(2.4,2.6);g.quadraticCurveTo(2.2,7.6,5,9.6);g.quadraticCurveTo(6.6,11.6,6.6,12.4+Math.sin(t*2)*0.3);g.quadraticCurveTo(8.2,9,7.7,5.7);g.quadraticCurveTo(6.6,6.6,5,6.2);g.quadraticCurveTo(3.4,5,2.4,2.6);g.fill()}
    g.beginPath();g.moveTo(8.1,3.7);g.quadraticCurveTo(6.4,3.3,5.2,5.4);g.quadraticCurveTo(6.6,4.4,8.2,4.3);g.closePath();g.fill()}
  else if(L.stubble){g.fillStyle='rgba(40,28,20,0.22)';g.beginPath();g.moveTo(2.4,2.6);g.quadraticCurveTo(2.6,8,6,8.1);g.quadraticCurveTo(8,7.4,7.7,5.6);g.quadraticCurveTo(5,6.2,2.4,2.6);g.fill()}
  drawHat(g,L,0,0,t,sway);
}
const WLEN={sword:31,dual:25,spear:50,staff:27,staffs:25,hammer:20,talisman:16,bow:0,shield:20,bomb:8};

function drawHat(g,L,hx,hy,t,sway){drawHat0(g,L,hx,hy,t,sway);
  const ht=L.helmT||0;if(ht>=3){g.fillStyle=ht>=5?'#ff4a2a':ht>=4?'#2fae7a':'#d4322a';g.strokeStyle=OL;g.lineWidth=0.8;g.beginPath();g.arc(hx+1.5,hy-5.6,1.6,0,TAU);g.fill();g.stroke();g.fillStyle='#fff';g.fillRect(hx+1,hy-6.3,0.6,0.6)}
  if(ht>=5){g.fillStyle='#f0c040';g.strokeStyle=OL;g.lineWidth=0.9;for(const s of[-1,1]){g.beginPath();g.moveTo(hx+s*5,hy-8);g.quadraticCurveTo(hx+s*13,hy-14,hx+s*12,hy-21+Math.sin(t*3)*0.8);g.quadraticCurveTo(hx+s*9,hy-13,hx+s*3,hy-9);g.closePath();g.fill();g.stroke()}}
}
function drawHat0(g,L,hx,hy,t,sway){
  const c=L.hatC;g.strokeStyle=OL;g.lineWidth=1.4;
  const cap=(cy,r,a0,a1,fill)=>{g.beginPath();g.arc(hx,hy+cy,r,a0,a1);g.closePath();solid(g,fill,olc(c),1.8)};
  switch(L.hat){
    case'topknot':g.beginPath();g.ellipse(hx-1.4,hy-10,3.5,2.9,-0.15,0,TAU);solid(g,L.hair,olc('#3a2a20'),1.8);g.fillStyle='rgba(255,255,255,0.16)';g.beginPath();g.ellipse(hx-0.6,hy-11,1.8,0.8,-0.3,0,TAU);g.fill();
      g.beginPath();g.moveTo(hx-8.9,hy-3.4);g.quadraticCurveTo(hx,hy-7,hx+8,hy-4.8);g.lineTo(hx+7.8,hy-2.9);g.quadraticCurveTo(hx,hy-4.9,hx-9,hy-1.3);g.closePath();solid(g,L.band,olc(L.band),1.4);
      g.strokeStyle=shade(L.band,0.35);g.lineWidth=0.6;g.beginPath();g.moveTo(hx-8.4,hy-3);g.quadraticCurveTo(hx,hy-6.4,hx+7.6,hy-4.4);g.stroke();break;
    case'conical':{g.save();g.translate(hx,hy-3.4);g.rotate(-0.05);const gr=g.createLinearGradient(-15,0,15,0);gr.addColorStop(0,shade(c,-0.2));gr.addColorStop(0.55,shade(c,0.18));gr.addColorStop(1,shade(c,-0.08));
      g.beginPath();g.moveTo(-16,1.5);g.quadraticCurveTo(0,-1,16,1.5);g.lineTo(0,-15.5);g.closePath();solid(g,gr,olc(c),1.8);
      g.strokeStyle='rgba(120,90,40,0.45)';g.lineWidth=0.7;for(let i=1;i<4;i++){const y=-15.5+i*4,wd=i*4;g.beginPath();g.moveTo(-wd,y+0.4);g.lineTo(wd,y+0.4);g.stroke()}
      for(let i=-2;i<=2;i++){g.beginPath();g.moveTo(0,-15);g.lineTo(i*7,1);g.stroke()}
      g.strokeStyle='#8a5a2a';g.lineWidth=0.8;g.beginPath();g.moveTo(-3,1.5);g.quadraticCurveTo(2,12.5,6.5,9.5);g.stroke();g.restore();break}
    case'plume':{const gr=g.createLinearGradient(hx-9,0,hx+9,0);gr.addColorStop(0,shade(c,-0.25));gr.addColorStop(0.6,shade(c,0.25));gr.addColorStop(1,shade(c,-0.1));
      g.beginPath();g.moveTo(hx-8.4,hy-1.6);g.lineTo(hx-9.6,hy+5.5);g.lineTo(hx-4.6,hy+2.6);g.closePath();solid(g,shade(c,-0.25),olc(c),1.6);
      cap(-2.4,9,Math.PI*0.97,Math.PI*2.03,gr);
      g.beginPath();g.roundRect(hx-9.6,hy-3.8,19,2.8,1);solid(g,shade(c,-0.2),olc(c),1.6);
      g.fillStyle=shade(c,0.3);g.fillRect(hx-0.9,hy-16,1.8,5.5);g.beginPath();g.arc(hx,hy-16.5,1.8,0,TAU);g.fill();
      g.fillStyle='#d4322a';g.beginPath();g.moveTo(hx,hy-16);g.quadraticCurveTo(hx-8+sway*0.5,hy-24,hx-17+sway,hy-16+Math.sin(t*6)*1.2);g.quadraticCurveTo(hx-9,hy-17,hx,hy-14);g.fill();
      g.fillStyle='#ff6a4a';g.beginPath();g.moveTo(hx,hy-15.5);g.quadraticCurveTo(hx-6,hy-21,hx-12+sway,hy-17);g.quadraticCurveTo(hx-6,hy-17,hx,hy-14.5);g.fill();break}
    case'mask':cap(-1.8,8.9,Math.PI*0.96,Math.PI*2.03,c);
      g.beginPath();g.moveTo(hx+1.4,hy+1.9);g.lineTo(hx+9.4,hy+1.9);g.quadraticCurveTo(hx+9,hy+8.4,hx+5.6,hy+8.6);g.quadraticCurveTo(hx+2,hy+8.4,hx+1.4,hy+6);g.closePath();solid(g,c,olc(c),1.6);
      g.fillStyle=L.scarf;g.beginPath();g.moveTo(hx-8.8,hy-4.2);g.quadraticCurveTo(hx,hy-7.2,hx+8.4,hy-4.6);g.lineTo(hx+8.2,hy-2.6);g.quadraticCurveTo(hx,hy-5,hx-8.9,hy-2);g.closePath();g.fill();
      g.beginPath();g.moveTo(hx-7,hy-3.6);g.quadraticCurveTo(hx-14+sway,hy-2.5,hx-21+sway*1.6,hy+2+Math.sin(t*6)*2);g.lineTo(hx-19+sway*1.4,hy+5+Math.sin(t*6)*2);g.quadraticCurveTo(hx-13,hy+1,hx-7,hy-1.6);g.fill();break;
    case'bald':g.fillStyle='rgba(255,255,255,0.3)';g.beginPath();g.ellipse(hx-0.5,hy-6,3.6,1.8,-0.25,0,TAU);g.fill();
      g.fillStyle='#7a2a1a';for(let i=0;i<3;i++){g.beginPath();g.arc(hx-2+i*2.8,hy-8.2+Math.abs(i-1)*0.6,0.7,0,TAU);g.fill()}break;
    case'tall':{const gr=g.createLinearGradient(hx-8,0,hx+8,0);gr.addColorStop(0,shade(c,-0.2));gr.addColorStop(0.6,shade(c,0.25));gr.addColorStop(1,c);
      g.beginPath();g.moveTo(hx-8.4,hy-4.6);g.lineTo(hx-6.4,hy-20);g.quadraticCurveTo(hx,hy-22,hx+6.4,hy-20);g.lineTo(hx+7.8,hy-4.9);g.quadraticCurveTo(hx,hy-6.6,hx-8.4,hy-4.6);g.closePath();solid(g,gr,olc(c),1.8);
      g.fillStyle='#c9a24e';g.fillRect(hx-7.4,hy-9.5,14.8,2);g.fillRect(hx-6.4,hy-16,12.8,1.2);g.fillStyle='#ffd96a';g.beginPath();g.arc(hx,hy-13,1.9,0,TAU);g.fill();
      g.strokeStyle=L.tails;g.lineWidth=1.8;g.lineCap='round';g.beginPath();g.moveTo(hx-7.5,hy-5.5);g.quadraticCurveTo(hx-12+sway,hy,hx-14+sway*1.3,hy+9+Math.sin(t*4)*1.5);g.stroke();break}
    case'scarf':cap(-2,8.9,Math.PI*0.95,Math.PI*2.02,c);g.strokeStyle='rgba(0,0,0,0.2)';g.lineWidth=0.7;g.beginPath();g.arc(hx,hy-2,6.5,Math.PI*1.1,Math.PI*1.9);g.stroke();
      g.beginPath();g.moveTo(hx-6.6,hy-2.4);g.quadraticCurveTo(hx-12+sway,hy+2,hx-13.5+sway,hy+8);g.lineTo(hx-9.6,hy+5);g.closePath();solid(g,shade(c,-0.12),olc(c),1.4);break;
    case'cap':cap(-2.4,8.7,Math.PI,TAU,c);g.beginPath();g.roundRect(hx-9.2,hy-3.4,18.6,2.2,1);solid(g,'#2a2a20',OL,1.2);break;
    case'helm':{const gr=g.createLinearGradient(hx-9,0,hx+9,0);gr.addColorStop(0,shade(c,-0.1));gr.addColorStop(0.6,shade(c,0.35));gr.addColorStop(1,c);
      g.beginPath();g.moveTo(hx-8.6,hy-1);g.lineTo(hx-9.4,hy+7.5);g.lineTo(hx-4.4,hy+3);g.closePath();solid(g,shade(c,-0.3),olc(c),1.6);
      cap(-2.2,9.2,Math.PI*0.93,Math.PI*2.03,gr);
      g.fillStyle='#c9a24e';g.fillRect(hx-0.9,hy-16,1.8,5);g.beginPath();g.arc(hx,hy-16.5,2.1,0,TAU);g.fill();g.fillStyle='#d4322a';g.beginPath();g.moveTo(hx,hy-17.5);g.lineTo(hx-1.5,hy-22.5);g.lineTo(hx+1.5,hy-22.5);g.fill();break}
    case'fur':g.beginPath();g.ellipse(hx,hy-5.8,10.5,6.5,0,Math.PI,TAU);g.closePath();solid(g,'#4a3420',OL,1.8);
      g.fillStyle='#e8dcc0';g.beginPath();g.roundRect(hx-10.5,hy-6.8,21,3.4,1.6);g.fill();g.fillStyle='#d6c8a8';for(let i=-9;i<9;i+=3){g.fillRect(hx+i,hy-6.5,1,2.8)}
      g.fillStyle='#8a2a22';g.beginPath();g.moveTo(hx,hy-11.8);g.lineTo(hx+2.2,hy-17.3);g.lineTo(hx-2.2,hy-17.3);g.fill();break;
    case'qing':g.fillStyle='#1c1c24';g.beginPath();g.ellipse(hx,hy-6.6,11.5,3.8,0,0,TAU);solid(g,'#1c1c24',OL,1.6);g.beginPath();g.arc(hx,hy-7.1,6.2,Math.PI,TAU);g.fill();
      g.fillStyle=c;g.beginPath();g.arc(hx,hy-13,2.5,0,TAU);g.fill();g.strokeStyle='#d4322a';g.lineWidth=1;for(let i=-3;i<=3;i++){g.beginPath();g.moveTo(hx,hy-12.5);g.lineTo(hx+i*1.8,hy-8);g.stroke()}
      g.strokeStyle='#1c1c24';g.lineWidth=2.4;g.beginPath();g.moveTo(hx-6,hy);g.quadraticCurveTo(hx-12+sway,hy+6,hx-10+sway,hy+15);g.stroke();break;
    case'elder':g.fillStyle='#f4f0e8';g.beginPath();g.moveTo(hx+2.4,hy+2.4);g.quadraticCurveTo(hx+2.2,hy+8,hx+4.6,hy+12+Math.sin(t*2)*0.6);g.quadraticCurveTo(hx+6,hy+16,hx+5,hy+19+Math.sin(t*2)*0.6);
      g.quadraticCurveTo(hx+8.6,hy+12,hx+8.2,hy+3.6);g.quadraticCurveTo(hx+6.4,hy+3.2,hx+2.4,hy+2.4);g.fill();
      g.beginPath();g.ellipse(hx-0.6,hy-10,3.2,2.6,0,0,TAU);g.fill();g.fillStyle='#2a3a5a';g.beginPath();g.moveTo(hx-8.9,hy-3.4);g.quadraticCurveTo(hx,hy-7,hx+8,hy-4.8);g.lineTo(hx+7.8,hy-2.9);g.quadraticCurveTo(hx,hy-4.9,hx-9,hy-1.3);g.closePath();g.fill();break;
  }
}
/* vũ khí, gốc tọa độ ở bàn tay, trục +x là hướng lưỡi */
function drawBlade(g,wp,L,glow,t,sw,bHand,fH){
  const wc=L.wc||'#ccc';
  const aura=(len,wid)=>{if(glow<=0)return;const col=glow>=3?'#ff5b3d':glow>=2?'#ffc53d':'#62b4ff';const pul=0.55+Math.sin(t*6)*0.2;
    g.save();g.globalCompositeOperation='lighter';g.globalAlpha=pul*0.55;g.strokeStyle=col;g.lineCap='round';g.lineWidth=wid+4+glow*2;g.beginPath();g.moveTo(2,0);g.lineTo(len,0);g.stroke();
    g.globalAlpha=pul*0.5;g.lineWidth=wid+1;g.strokeStyle='#fff';g.stroke();g.restore()};
  g.lineJoin='round';g.lineCap='round';
  switch(wp){
    case'sword':{aura(31,3);// chuôi
      g.fillStyle='#3a2414';g.strokeStyle=OL;g.lineWidth=1;g.beginPath();g.roundRect(-7.5,-1.6,7.5,3.2,1);g.fill();g.stroke();
      g.strokeStyle='#c9a24e';g.lineWidth=0.8;for(let i=-7;i<0;i+=2){g.beginPath();g.moveTo(i,-1.6);g.lineTo(i+1,1.6);g.stroke()}
      g.fillStyle='#e8c35a';g.beginPath();g.arc(-8.2,0,1.8,0,TAU);g.fill();
      g.strokeStyle='#c8361f';g.lineWidth=1.3;g.beginPath();g.moveTo(-8.5,0.5);g.quadraticCurveTo(-10,5,-8,8);g.stroke();
      // chắn
      g.fillStyle=L.wTrim||'#d6ac4e';g.strokeStyle=OL;g.lineWidth=1;g.beginPath();g.moveTo(-0.5,-4.5);g.quadraticCurveTo(1.6,0,-0.5,4.5);g.lineTo(1.4,4);g.quadraticCurveTo(3,0,1.4,-4);g.closePath();g.fill();g.stroke();
      // lưỡi
      const gr=g.createLinearGradient(0,-2,0,2);gr.addColorStop(0,'#ffffff');gr.addColorStop(0.45,wc);gr.addColorStop(1,shade(wc,-0.35));
      g.fillStyle=gr;g.beginPath();g.moveTo(1.5,-2);g.lineTo(27,-1.6);g.lineTo(31.5,0);g.lineTo(27,1.6);g.lineTo(1.5,2);g.closePath();g.fill();g.stroke();
      g.strokeStyle='rgba(60,80,90,0.55)';g.lineWidth=0.7;g.beginPath();g.moveTo(3,0);g.lineTo(25,0);g.stroke();break}
    case'dual':{aura(24,3);g.fillStyle='#2a1a12';g.beginPath();g.roundRect(-6,-1.4,6,2.8,1);g.fill();g.fillStyle='#d6ac4e';g.fillRect(-0.6,-3.2,2,6.4);
      const gr=g.createLinearGradient(0,-3,0,3);gr.addColorStop(0,'#ffffff');gr.addColorStop(0.5,wc);gr.addColorStop(1,shade(wc,-0.4));
      g.fillStyle=gr;g.strokeStyle=OL;g.lineWidth=1;g.beginPath();g.moveTo(1.4,-1.6);g.quadraticCurveTo(14,-3.8,25,-0.6);g.lineTo(23,1.5);g.quadraticCurveTo(13,1.4,1.4,2);g.closePath();g.fill();g.stroke();
      g.strokeStyle='rgba(255,255,255,0.7)';g.lineWidth=0.7;g.beginPath();g.moveTo(3,-1.4);g.quadraticCurveTo(14,-3.2,23,-0.8);g.stroke();break}
    case'spear':{aura(50,2.6);
      const sg=g.createLinearGradient(0,-1.6,0,1.6);sg.addColorStop(0,'#a87848');sg.addColorStop(1,'#5a3a1e');
      g.strokeStyle=OL;g.lineWidth=4.4;g.beginPath();g.moveTo(-26,0);g.lineTo(36,0);g.stroke();g.strokeStyle=sg;g.lineWidth=2.8;g.stroke();
      g.strokeStyle='#d6ac4e';g.lineWidth=3.4;[-24,-10,8].forEach(x=>{g.beginPath();g.moveTo(x,0);g.lineTo(x+1.6,0);g.stroke()});
      // tua đỏ
      g.strokeStyle='#d4322a';g.lineWidth=1.2;for(let i=0;i<5;i++){g.beginPath();g.moveTo(35,0);g.quadraticCurveTo(33-i,4+i,30-i*1.6+Math.sin(t*6+i)*1.2,7+i*0.8);g.stroke()}
      const bg=g.createLinearGradient(0,-3.5,0,3.5);bg.addColorStop(0,'#ffffff');bg.addColorStop(0.5,wc);bg.addColorStop(1,shade(wc,-0.4));
      g.fillStyle=bg;g.strokeStyle=OL;g.lineWidth=1;g.beginPath();g.moveTo(36,-1.5);g.quadraticCurveTo(42,-4.2,51,0);g.quadraticCurveTo(42,4.2,36,1.5);g.closePath();g.fill();g.stroke();
      g.strokeStyle='rgba(60,70,80,0.5)';g.lineWidth=0.7;g.beginPath();g.moveTo(37,0);g.lineTo(48,0);g.stroke();break}
    case'staff':case'staffs':{const len=wp==='staff'?27:24;aura(len,3);
      const sg=g.createLinearGradient(0,-2,0,2);sg.addColorStop(0,shade(wc,0.25));sg.addColorStop(1,shade(wc,-0.3));
      g.strokeStyle=OL;g.lineWidth=5;g.beginPath();g.moveTo(-26,0);g.lineTo(len,0);g.stroke();g.strokeStyle=sg;g.lineWidth=3.4;g.stroke();
      if(wp==='staff'){g.strokeStyle='#cfa64a';g.lineWidth=4.2;[[-26,-21],[len-5,len]].forEach(([a,b])=>{g.beginPath();g.moveTo(a,0);g.lineTo(b,0);g.stroke()});
        g.strokeStyle='rgba(255,240,200,0.6)';g.lineWidth=1;g.beginPath();g.moveTo(-26,-1.3);g.lineTo(-21,-1.3);g.moveTo(len-5,-1.3);g.lineTo(len,-1.3);g.stroke()}
      else{g.fillStyle='#e8c35a';g.beginPath();g.arc(len,0,2.6,0,TAU);g.fill()}break}
    case'bow':{// cung cầm dọc
      g.save();g.rotate(-0.04);const pull=sw>=0?Math.sin(Math.min(1,sw)*Math.PI):0;
      g.strokeStyle=OL;g.lineWidth=4.4;g.beginPath();g.moveTo(-2,-17);g.quadraticCurveTo(7,-12,3,-3);g.lineTo(3,3);g.quadraticCurveTo(7,12,-2,17);g.stroke();
      const bg=g.createLinearGradient(0,-17,0,17);bg.addColorStop(0,'#3a2414');bg.addColorStop(0.5,wc);bg.addColorStop(1,'#3a2414');
      g.strokeStyle=bg;g.lineWidth=2.8;g.stroke();g.strokeStyle='#e8c35a';g.lineWidth=3.2;g.beginPath();g.moveTo(3,-2.5);g.lineTo(3,2.5);g.stroke();
      if(glow>0){g.save();g.globalCompositeOperation='lighter';g.globalAlpha=0.4;g.strokeStyle=glow>=3?'#ff5b3d':glow>=2?'#ffc53d':'#62b4ff';g.lineWidth=7;g.beginPath();g.moveTo(-2,-17);g.quadraticCurveTo(7,-12,3,0);g.quadraticCurveTo(7,12,-2,17);g.stroke();g.restore()}
      const sx=-2-pull*12;g.strokeStyle='#f2ead6';g.lineWidth=0.9;g.beginPath();g.moveTo(-2,-17);g.lineTo(sx,0);g.lineTo(-2,17);g.stroke();
      if(pull>0.15||sw<0){const ax=sx;g.strokeStyle='#8a6a44';g.lineWidth=1.4;g.beginPath();g.moveTo(ax,0);g.lineTo(ax+24,0);g.stroke();
        g.fillStyle='#dfe6ea';g.beginPath();g.moveTo(ax+27,0);g.lineTo(ax+22,-2.2);g.lineTo(ax+22,2.2);g.fill();g.fillStyle='#c8361f';g.beginPath();g.moveTo(ax,0);g.lineTo(ax+5,-2.4);g.lineTo(ax+5,2.4);g.fill()}
      g.restore();break}
    case'talisman':{g.save();g.rotate(-0.3);g.fillStyle='#3a2414';g.fillRect(-2,-1,4,2);
      for(let i=0;i<7;i++){const a=-0.95+i*0.32;g.fillStyle=i%2?'#efe2b8':'#e2cf94';g.beginPath();g.moveTo(0,0);g.lineTo(Math.cos(a)*17,Math.sin(a)*17);g.lineTo(Math.cos(a+0.32)*17,Math.sin(a+0.32)*17);g.closePath();g.fill()}
      g.strokeStyle=OL;g.lineWidth=1;g.beginPath();g.moveTo(0,0);for(let i=0;i<=7;i++){const a=-0.95+i*0.32;g.lineTo(Math.cos(a)*17,Math.sin(a)*17)}g.closePath();g.stroke();
      g.strokeStyle='#c8361f';g.lineWidth=0.9;g.beginPath();g.arc(0,0,12,-0.95,1.29);g.stroke();g.beginPath();g.arc(0,0,7,-0.95,1.29);g.stroke();
      g.globalCompositeOperation='lighter';const pul=0.6+Math.sin(t*5)*0.3;g.fillStyle=`rgba(255,217,106,${pul})`;g.beginPath();g.arc(Math.cos(0.2)*17,Math.sin(0.2)*17,3+glow,0,TAU);g.fill();g.restore();break}
    case'hammer':g.strokeStyle='#5a3a20';g.lineWidth=2.6;g.beginPath();g.moveTo(-3,0);g.lineTo(16,0);g.stroke();g.fillStyle='#4a4d55';g.strokeStyle=OL;g.lineWidth=1;g.beginPath();g.roundRect(14,-4.5,7,9,1.5);g.fill();g.stroke();break;
    case'shield':{g.fillStyle=wc;g.strokeStyle=OL;g.lineWidth=1;g.beginPath();g.moveTo(1,-1.5);g.lineTo(19,-1);g.lineTo(21,0);g.lineTo(19,1);g.lineTo(1,1.5);g.closePath();g.fill();g.stroke();
      g.restore();g.save();// khiên trước ngực (tọa độ thân)
      g.translate(fH?fH[0]-6:2,fH?fH[1]-1:-24);g.rotate(0);const sg=g.createRadialGradient(-2,-3,1,0,0,9);sg.addColorStop(0,'#a0523a');sg.addColorStop(1,'#4a1a10');
      g.fillStyle=sg;g.beginPath();g.ellipse(0,0,7.5,10,0,0,TAU);g.fill();g.stroke();g.strokeStyle='#c9a24e';g.lineWidth=1.3;g.beginPath();g.ellipse(0,0,5.6,8,0,0,TAU);g.stroke();
      g.fillStyle='#e8c35a';g.beginPath();g.arc(0,0,2.2,0,TAU);g.fill();break}
    case'bomb':{g.fillStyle='#262626';g.strokeStyle=OL;g.lineWidth=1;g.beginPath();g.arc(5,0,5.5,0,TAU);g.fill();g.stroke();g.fillStyle='rgba(255,255,255,0.3)';g.beginPath();g.arc(3.5,-2,1.6,0,TAU);g.fill();
      g.strokeStyle='#c9a24e';g.lineWidth=1.3;g.beginPath();g.moveTo(9,-3);g.quadraticCurveTo(12,-6,11,-9);g.stroke();
      g.globalCompositeOperation='lighter';g.fillStyle=`rgba(255,170,60,${0.6+Math.sin(t*20)*0.3})`;g.beginPath();g.arc(11,-9.5,2.2,0,TAU);g.fill();break}
  }
}
