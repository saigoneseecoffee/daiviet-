/* ============ THẾ GIỚI: TẠO BẢN ĐỒ, VA CHẠM, VẼ ĐỊA HÌNH ============ */
const T=48,MW=64,MH=64;
const TG=0,TP=1,TW=2,TS=3,TF=4,TC=5,TL=6,TB=7; // ground path water shore field cliff wall bridge
function makeWorld(mi){
  const M=MAPS[mi],R=mulberry32(M.seed*7919+3),s=M.seed;
  const W={mi,M,tile:new Uint8Array(MW*MH),solid:new Uint8Array(MW*MH),objs:[],ogrid:Array(MW*MH),reach:new Uint8Array(MW*MH),
    camp:{x:11.5*T,y:56*T},out:{x:13*T,y:38.5*T},arena:{x:54*T,y:9.5*T,r:6.2*T},npcs:[],pathPts:[]};
  for(let i=0;i<W.ogrid.length;i++)W.ogrid[i]=null;
  const id=(x,y)=>y*MW+x, inb=(x,y)=>x>=0&&y>=0&&x<MW&&y<MH;
  const setT=(x,y,v)=>{if(inb(x,y))W.tile[id(x,y)]=v};
  const getT=(x,y)=>inb(x,y)?W.tile[id(x,y)]:TC;
  const cx=W.camp.x/T,cy=W.camp.y/T,ax=W.arena.x/T,ay=W.arena.y/T;
  const nearCamp=(x,y,r)=>dist(x+.5,y+.5,cx,cy)<r, nearArena=(x,y,r)=>dist(x+.5,y+.5,ax,ay)<r;

  /* --- đặc trưng địa hình --- */
  if(M.feat==='river'||M.feat==='bigriver'||M.feat==='fields'){
    const wid=M.feat==='bigriver'?3.4:M.feat==='fields'?1.9:2.3;
    const base=M.feat==='bigriver'?31:M.feat==='fields'?40:24;
    for(let x=0;x<MW;x++){
      const yc=base+(M.feat==='bigriver'?0:x*0.25)+Math.sin(x*0.17+s)*4+Math.sin(x*0.07+s*2)*3;
      for(let y=0;y<MH;y++){if(Math.abs(y-yc)<wid+vnoise(x*0.3,y*0.3,s)*1.2)setT(x,y,TW)}
    }
  }
  if(M.feat!=='bigriver'){ // ao hồ
    for(let k=0;k<3;k++){const px=randInt(R,12,52),py=randInt(R,14,50),pr=1.6+R()*2.2;
      for(let y=-5;y<=5;y++)for(let x=-5;x<=5;x++){const d=Math.hypot(x,y)+vnoise((px+x)*0.5,(py+y)*0.5,s+k)*1.4;if(d<pr)setT(px+x,py+y,TW)}}
  }
  if(M.feat==='fields'){
    for(let y=0;y<MH;y++)for(let x=0;x<MW;x++){if(getT(x,y)===TG&&fbm(x*0.12,y*0.12,s+5)>0.55)setT(x,y,TF)}
  }
  if(M.feat==='spiral'){ // thành xoắn ốc Cổ Loa
    const ox=33,oy=32;
    [[8.5,1.0],[14.5,2.2],[20.5,3.6]].forEach(([rr,g],k)=>{
      for(let y=0;y<MH;y++)for(let x=0;x<MW;x++){const d=Math.hypot(x+.5-ox,y+.5-oy);
        if(Math.abs(d-rr)<0.9){const a=Math.atan2(y+.5-oy,x+.5-ox);const gap=Math.abs(angDiff(a,g))<0.28||Math.abs(angDiff(a,g+2.6))<0.22;if(!gap)setT(x,y,TL)}}
    });
  }
  if(M.feat==='pass'||M.feat==='mounds'){
    for(let y=0;y<MH;y++)for(let x=0;x<MW;x++){
      const n=fbm(x*0.09,y*0.09,s+3);
      if(M.feat==='pass'&&n>0.56&&getT(x,y)===TG)setT(x,y,TC);
      if(M.feat==='mounds'&&n>0.68&&getT(x,y)===TG)setT(x,y,TC);
    }
  }
  /* viền bản đồ */
  for(let x=0;x<MW;x++){setT(x,0,TC);setT(x,MH-1,TC);if(R()<0.6)setT(x,1,TC);if(R()<0.6)setT(x,MH-2,TC)}
  for(let y=0;y<MH;y++){setT(0,y,TC);setT(MW-1,y,TC);if(R()<0.6)setT(1,y,TC);if(R()<0.6)setT(MW-2,y,TC)}

  /* --- đường mòn từ trại tới đấu trường --- */
  const wps=[[12.9,41],[24+R()*5,36+R()*4],[30+R()*6,30+R()*6],[42+R()*6,18+R()*6],[ax,ay]];
  const pts=catmull(wps,14);W.pathPts=pts.map(p=>({x:p[0]*T,y:p[1]*T}));
  const carve=(pts,w)=>pts.forEach(([px,py])=>{for(let y=-3;y<=3;y++)for(let x=-3;x<=3;x++){const tx=Math.floor(px)+x,ty=Math.floor(py)+y;
    if(!inb(tx,ty)||tx<1||ty<1||tx>MW-2||ty>MH-2||inTownT(tx,ty))continue;if(Math.hypot(tx+.5-px,ty+.5-py)<w){const t=getT(tx,ty);setT(tx,ty,t===TW?TB:TP)}}});
  carve(pts,1.35);carve(catmull([[22.6,52.9],[25.5,47],wps[1]],10),1.1);
  /* nhánh rẽ để khám phá */
  for(let b=0;b<3;b++){const p0=pts[Math.floor(pts.length*(0.2+b*0.25))];const ang=R()*TAU;
    const br=catmull([p0,[clamp(p0[0]+Math.cos(ang)*10,4,60),clamp(p0[1]+Math.sin(ang)*10,4,60)],[clamp(p0[0]+Math.cos(ang+0.6)*18,4,60),clamp(p0[1]+Math.sin(ang+0.6)*18,4,60)]],10);
    carve(br,1.0);}
  /* trại & đấu trường: dọn trống */
  for(let y=0;y<MH;y++)for(let x=0;x<MW;x++){
    if(nearCamp(x,y,5.2)||nearArena(x,y,7.2)){const t=getT(x,y);if(t===TC||t===TL||t===TW||t===TF)setT(x,y,TG)}
    if(nearCamp(x,y,3.4))setT(x,y,TP);
  }
  townTiles(W);
  /* bờ */
  for(let y=1;y<MH-1;y++)for(let x=1;x<MW-1;x++){if(getT(x,y)===TG){let w=0;for(let k=0;k<8;k++){const t=getT(x+[1,-1,0,0,1,1,-1,-1][k],y+[0,0,1,-1,1,-1,1,-1][k]);if(t===TW)w++}if(w>0)setT(x,y,TS)}}
  for(let i=0;i<W.tile.length;i++){const t=W.tile[i];W.solid[i]=(t===TW||t===TC||t===TL||t===TV)?1:0}
  townSolid(W);

  /* --- vật thể --- */
  const addObj=(o)=>{W.objs.push(o);const k=id(Math.floor(o.x/T),Math.floor(o.y/T));(W.ogrid[k]||(W.ogrid[k]=[])).push(o)};
  const big=M.deco.filter(d=>OBJ[d]&&OBJ[d].solid),small=M.deco.filter(d=>OBJ[d]&&!OBJ[d].solid);
  for(let y=2;y<MH-2;y++)for(let x=2;x<MW-2;x++){
    const t=getT(x,y);if((x<=TOWN.x1+1&&y>=TOWN.y0-1)||nearArena(x,y,7.6))continue;
    const n=fbm(x*0.11,y*0.11,s+19);
    let pathNear=false;for(let yy=-1;yy<=1&&!pathNear;yy++)for(let xx=-1;xx<=1;xx++){const tt=getT(x+xx,y+yy);if(tt===TP||tt===TB){pathNear=true;break}}
    if(t===TG&&!pathNear&&R()<(n>0.55?0.42:n>0.45?0.12:0.03)&&big.length){
      const k=pick2(R,big);addObj({x:(x+.5+(R()-.5)*0.4)*T,y:(y+.75)*T,k,v:Math.floor(R()*3),cr:OBJ[k].cr,s:0.85+R()*0.35})}
    else if((t===TG||t===TS)&&R()<0.07&&small.length){const k=pick2(R,small);addObj({x:(x+R())*T,y:(y+R())*T,k,v:Math.floor(R()*3),cr:0,s:0.8+R()*0.4})}
    if(t===TW&&M.feat==='bigriver'&&R()<0.13)addObj({x:(x+.5)*T,y:(y+.6)*T,k:'stake',v:0,cr:0,s:0.9+R()*0.3});
  }
  /* Vật thể trại */
  const C=W.camp;
  W.npcs=townNpcs(W);townObjs(W,addObj);
  /* đấu trường: cột đá bao quanh */
  for(let k=0;k<10;k++){const a=k/10*TAU+0.3;const ox=W.arena.x+Math.cos(a)*W.arena.r*1.06,oy=W.arena.y+Math.sin(a)*W.arena.r*1.06;
    const tx=Math.floor(ox/T),ty=Math.floor(oy/T);if(getT(tx,ty)===TP)continue;addObj({x:ox,y:oy,k:'pillar',v:k,cr:16,s:1})}

  /* --- vùng đi được (BFS từ trại) --- */
  const blocked=(x,y)=>{const i=id(x,y);if(W.solid[i])return true;const o=W.ogrid[i];if(o)for(const q of o)if(q.cr>0)return true;return false};
  const q=[id(Math.floor(cx),Math.floor(cy))];W.reach[q[0]]=1;
  while(q.length){const i=q.shift(),x=i%MW,y=(i/MW)|0;for(const[dx,dy]of[[1,0],[-1,0],[0,1],[0,-1]]){const nx=x+dx,ny=y+dy;if(!inb(nx,ny))continue;const j=id(nx,ny);if(W.reach[j]||blocked(nx,ny))continue;W.reach[j]=1;q.push(j)}}
  W.walk=new Uint8Array(MW*MH);for(let i=0;i<MW*MH;i++)W.walk[i]=W.reach[i];
  W.walkLocked=W.walk.slice();for(let i=0;i<MW*MH;i++){const x=i%MW,y=(i/MW)|0;if(nearArena(x,y,7.4))W.walkLocked[i]=0}
  W.spawnTiles=[];for(let i=0;i<W.reach.length;i++)if(W.reach[i]){const x=i%MW,y=(i/MW)|0;if(!(x<=TOWN.x1+3&&y>=TOWN.y0-3)&&!nearArena(x,y,8.5))W.spawnTiles.push(i)}
  W.campToArena=dist(C.x,C.y,W.arena.x,W.arena.y);
  W.chunks=new Map();
  W.mini=makeMiniBase(W);
  return W;
}
function randInt(R,a,b){return Math.floor(a+R()*(b-a+1))}
function pick2(R,a){return a[Math.floor(R()*a.length)]}
function catmull(p,steps){const out=[];for(let i=0;i<p.length-1;i++){const p0=p[Math.max(0,i-1)],p1=p[i],p2=p[i+1],p3=p[Math.min(p.length-1,i+2)];
  for(let s=0;s<steps;s++){const t=s/steps,t2=t*t,t3=t2*t;
    out.push([0.5*((2*p1[0])+(-p0[0]+p2[0])*t+(2*p0[0]-5*p1[0]+4*p2[0]-p3[0])*t2+(-p0[0]+3*p1[0]-3*p2[0]+p3[0])*t3),
              0.5*((2*p1[1])+(-p0[1]+p2[1])*t+(2*p0[1]-5*p1[1]+4*p2[1]-p3[1])*t2+(-p0[1]+3*p1[1]-3*p2[1]+p3[1])*t3)])}}
  out.push(p[p.length-1]);return out}

/* ---- va chạm ---- */
function tileAt(W,px,py){const x=Math.floor(px/T),y=Math.floor(py/T);if(x<0||y<0||x>=MW||y>=MH)return TC;return W.tile[y*MW+x]}
function isSolidPt(W,px,py){const x=Math.floor(px/T),y=Math.floor(py/T);if(x<0||y<0||x>=MW||y>=MH)return true;return W.solid[y*MW+x]===1}
function moveEnt(W,e,dx,dy){
  e.x+=dx;resolve(W,e);e.y+=dy;resolve(W,e);
  e.x=clamp(e.x,T,(MW-1)*T);e.y=clamp(e.y,T,(MH-1)*T);
}
function resolve(W,e){
  const r=e.r*0.72,x0=Math.floor((e.x-r)/T),x1=Math.floor((e.x+r)/T),y0=Math.floor((e.y-r)/T),y1=Math.floor((e.y+r)/T);
  for(let ty=y0-1;ty<=y1+1;ty++)for(let tx=x0-1;tx<=x1+1;tx++){
    if(tx<0||ty<0||tx>=MW||ty>=MH)continue;const i=ty*MW+tx;
    if(W.solid[i]&&!(e.fly)){const nx=clamp(e.x,tx*T,tx*T+T),ny=clamp(e.y,ty*T,ty*T+T);let dx=e.x-nx,dy=e.y-ny;const d2=dx*dx+dy*dy;
      if(d2<r*r){if(d2<0.0001){/* bên trong ô: đẩy ra cạnh gần nhất */const cxm=tx*T+T/2,cym=ty*T+T/2;dx=e.x-cxm;dy=e.y-cym;const d=Math.hypot(dx,dy)||1;e.x=cxm+dx/d*(T*0.75+r);e.y=cym+dy/d*(T*0.75+r)}
        else{const d=Math.sqrt(d2);e.x+=dx/d*(r-d);e.y+=dy/d*(r-d)}}}
    const os=W.ogrid[i];if(os)for(const o of os){if(!o.cr)continue;const dx=e.x-o.x,dy=e.y-o.y,rr=o.cr*0.8+r,d2=dx*dx+dy*dy;
      if(d2<rr*rr&&d2>0.0001){const d=Math.sqrt(d2);e.x+=dx/d*(rr-d);e.y+=dy/d*(rr-d)}}
  }
}

/* ---- bản đồ nhỏ ---- */
function makeMiniBase(W){
  const c=document.createElement('canvas');c.width=MW;c.height=MH;const x=c.getContext('2d');const P=W.M.pal;
  const im=x.createImageData(MW,MH);
  const hex=h=>[parseInt(h.slice(1,3),16),parseInt(h.slice(3,5),16),parseInt(h.slice(5,7),16)];
  const cols={[TG]:hex(P.g[0]),[TP]:hex(P.path),[TW]:hex(P.water),[TS]:hex(P.shore),[TF]:hex(P.field||P.g[1]),[TC]:hex(P.cliff||'#4a4a40'),[TL]:hex(P.wall||'#7a5a3a'),[TB]:hex('#8a6a44'),[TQ]:hex('#d2c4a0'),[TV]:hex('#8a8272')};
  for(let i=0;i<MW*MH;i++){let c0=cols[W.tile[i]];const o=W.ogrid[i];if(o&&o.some(q=>q.cr>12))c0=hex(P.tree2);if(W.bfoot&&W.bfoot[i])c0=hex('#7a3a2a');
    im.data[i*4]=c0[0]*0.8;im.data[i*4+1]=c0[1]*0.8;im.data[i*4+2]=c0[2]*0.8;im.data[i*4+3]=255}
  x.putImageData(im,0,0);return c;
}

/* ============ VẼ ĐỊA HÌNH (cache theo khối) ============ */
const CHUNK=8;
function getChunk(W,cx,cy,S){
  const key=cx+','+cy;let c=W.chunks.get(key);if(c&&c.S===S)return c;
  c=document.createElement('canvas');const px=CHUNK*T;c.width=Math.ceil(px*S);c.height=Math.ceil(px*S);c.S=S;
  const g=c.getContext('2d');g.scale(S,S);g.translate(-cx*px,-cy*px);drawTerrain(W,g,cx*CHUNK-1,cy*CHUNK-1,cx*CHUNK+CHUNK,cy*CHUNK+CHUNK);
  W.chunks.set(key,c);if(W.chunks.size>64){const k0=W.chunks.keys().next().value;W.chunks.delete(k0)}
  return c;
}
function drawTerrain(W,g,x0,y0,x1,y1){
  const P=W.M.pal,s=W.M.seed;
  const tt=(x,y)=>(x<0||y<0||x>=MW||y>=MH)?TC:inTownT(x,y)?99:W.tile[y*MW+x];
  // lượt 1: nền
  for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){
    const t=tt(x,y),px=x*T,py=y*T;if(t===99)continue;
    if(t===TW||t===TB){g.fillStyle=P.water;g.fillRect(px,py,T,T);
      g.fillStyle=P.water2;g.globalAlpha=0.25+hash2(x,y,s)*0.2;g.fillRect(px,py+hash2(x,y,s+1)*T*0.7,T,6);g.globalAlpha=1;continue}
    const n=fbm(x*0.18,y*0.18,s+2);g.fillStyle=n>0.58?P.g[1]:n<0.4?P.g[2]:P.g[0];g.fillRect(px-0.5,py-0.5,T+1,T+1);
  }
  // lượt 1b: mảng màu mềm phá lưới ô
  for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){const t=tt(x,y);if(t===TW||t===TB)continue;
    const h=hash2(x,y,s+9);g.fillStyle=h>0.5?P.g[1]:P.g[2];g.globalAlpha=0.5;
    g.beginPath();g.ellipse(x*T+T*h,y*T+T*hash2(x,y,s+4),T*(0.4+h*0.4),T*(0.3+h*0.3),h*3,0,TAU);g.fill();g.globalAlpha=1}
  // bờ cát
  for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){if(tt(x,y)!==TS)continue;g.fillStyle=P.shore;
    g.beginPath();g.arc(x*T+T/2,y*T+T/2,T*0.72,0,TAU);g.fill()}
  for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){if(tt(x,y)!==TW)continue;// mép nước tối
    g.fillStyle=P.water;g.beginPath();g.arc(x*T+T/2,y*T+T/2,T*0.62,0,TAU);g.fill()}
  // ruộng
  for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){if(tt(x,y)!==TF)continue;const px=x*T,py=y*T;
    g.fillStyle=P.field;g.fillRect(px+2,py+2,T-4,T-4);g.strokeStyle=P.field2;g.lineWidth=2;
    for(let k=0;k<4;k++){g.beginPath();g.moveTo(px+6,py+8+k*11);g.lineTo(px+T-6,py+8+k*11);g.stroke()}
    g.strokeStyle='rgba(60,50,20,0.35)';g.lineWidth=2;g.strokeRect(px+1,py+1,T-2,T-2)}
  // đường
  for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){if(tt(x,y)!==TP)continue;g.fillStyle=P.path;g.beginPath();g.arc(x*T+T/2,y*T+T/2,T*0.74,0,TAU);g.fill()}
  for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){if(tt(x,y)!==TP)continue;
    for(let k=0;k<4;k++){const h=hash2(x*7+k,y,s+31);g.fillStyle=h>0.5?'rgba(255,240,210,0.25)':'rgba(60,40,20,0.18)';g.beginPath();g.arc(x*T+T*hash2(x,y*3+k,s),y*T+T*hash2(x+k,y,s+5),1.5+h*2.5,0,TAU);g.fill()}}
  // cầu gỗ
  for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){if(tt(x,y)!==TB)continue;const px=x*T,py=y*T;
    g.fillStyle='#7a5432';g.fillRect(px-1,py+2,T+2,T-4);g.strokeStyle='#4a301a';g.lineWidth=2;
    for(let k=0;k<5;k++){g.beginPath();g.moveTo(px+k*10+3,py+2);g.lineTo(px+k*10+3,py+T-2);g.stroke()}
    g.fillStyle='rgba(255,220,170,0.15)';g.fillRect(px,py+3,T,4)}
  // cỏ, hoa nhỏ
  for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){const t=tt(x,y);if(t!==TG)continue;
    for(let k=0;k<6;k++){const h=hash2(x*13+k,y*7,s+40),hx=x*T+hash2(x,y+k*5,s+41)*T,hy=y*T+hash2(x+k*3,y,s+42)*T;
      g.strokeStyle=h>0.6?'rgba(255,255,200,0.22)':'rgba(20,40,10,0.28)';g.lineWidth=1.6;g.beginPath();g.moveTo(hx,hy);g.lineTo(hx+(h-0.5)*5,hy-5-h*5);g.stroke()}
    if(hash2(x,y,s+50)>0.86){g.fillStyle=W.M.amb==='petal'?'#ffc4d4':pick3(x,y,['#f6e27a','#f4f0e6','#e88a6a']);
      for(let k=0;k<3;k++){g.beginPath();g.arc(x*T+hash2(x,y,k)*T,y*T+hash2(y,x,k)*T,2.2,0,TAU);g.fill()}}}
  drawTownGround(W,g,x0,y0,x1,y1);
  // vách đá / tường thành (nổi khối)
  for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){const t=tt(x,y);if(t!==TC&&t!==TL)continue;const px=x*T+T/2,py=y*T+T/2;
    const a=t===TL?P.wall:(P.cliff||'#5a5a50'),b=t===TL?P.wall2:(P.cliff2||'#3c3c34');
    g.fillStyle='rgba(0,0,0,0.25)';g.beginPath();g.ellipse(px+4,py+16,T*0.66,T*0.5,0,0,TAU);g.fill();
    g.fillStyle=b;g.beginPath();g.arc(px,py+6,T*0.68,0,TAU);g.fill();
    g.fillStyle=a;g.beginPath();g.arc(px-2,py-2,T*0.62,0,TAU);g.fill();
    if(t===TL){g.fillStyle='rgba(120,160,60,0.6)';g.beginPath();g.arc(px-6,py-10,T*0.3,0,TAU);g.fill()}
    else{g.fillStyle='rgba(255,255,255,0.12)';g.beginPath();g.arc(px-8,py-10,T*0.25,0,TAU);g.fill()}}
}
function pick3(x,y,a){return a[Math.floor(hash2(x,y,99)*a.length)]}

/* ============ SPRITE VẬT THỂ ============ */
const OBJ={
  banyan:{solid:1,cr:20,w:150,h:150},bamboo:{solid:1,cr:16,w:90,h:140},palm:{solid:1,cr:12,w:110,h:130},
  pine:{solid:1,cr:14,w:90,h:140},mangrove:{solid:1,cr:16,w:120,h:110},peach:{solid:1,cr:14,w:120,h:120},
  karst:{solid:1,cr:22,w:90,h:150},rock:{solid:1,cr:18,w:70,h:60},hut:{solid:1,cr:26,w:120,h:110},
  haystack:{solid:1,cr:16,w:60,h:60},lantern:{solid:1,cr:8,w:40,h:90},
  fern:{solid:0,w:40,h:30},flower:{solid:0,w:30,h:24},reed:{solid:0,w:36,h:44},stake:{solid:0,w:20,h:46},
  anvil:{solid:1,w:60,h:50},stall:{solid:1,w:110,h:100},fire:{solid:1,w:60,h:60},cart:{solid:1,w:100,h:70},
  drum:{solid:1,w:70,h:50},tent:{solid:0,w:110,h:90},flag:{solid:1,w:50,h:110},pillar:{solid:1,w:44,h:96},
};
const spriteCache=new Map();
function getSprite(kind,v,pal,S){
  const key=kind+v+pal.tree+S;let sp=spriteCache.get(key);if(sp)return sp;
  const o=OBJ[kind];const c=document.createElement('canvas');c.width=Math.ceil(o.w*S);c.height=Math.ceil(o.h*S);
  const g=c.getContext('2d');g.scale(S,S);g.translate(o.w/2,o.h-6);g.lineJoin='round';g.lineCap='round';
  drawObj(g,kind,v,pal);sp={c,w:o.w,h:o.h};spriteCache.set(key,sp);return sp;
}
function blob(g,x,y,r,col){g.fillStyle=col;g.beginPath();g.arc(x,y,r,0,TAU);g.fill()}
function shadowE(g,w,h){g.fillStyle='rgba(0,0,0,0.28)';g.beginPath();g.ellipse(0,0,w,h,0,0,TAU);g.fill()}
function drawObj(g,k,v,P){
  const R=mulberry32(k.length*97+v*13+3);
  const ol='rgba(20,14,8,0.55)';
  switch(k){
  case'banyan':{shadowE(g,46,14);g.fillStyle=P.trunk;g.strokeStyle=ol;g.lineWidth=2;
    g.beginPath();g.moveTo(-12,0);g.quadraticCurveTo(-8,-40,-14,-62);g.lineTo(14,-62);g.quadraticCurveTo(8,-40,12,0);g.closePath();g.fill();g.stroke();
    g.strokeStyle=P.trunk;g.lineWidth=2;for(let i=0;i<5;i++){const x=-30+i*15;g.beginPath();g.moveTo(x,-70);g.lineTo(x+R()*4,-4);g.stroke()}
    const cl=[[-36,-76,30],[34,-78,30],[0,-100,38],[-18,-112,26],[20,-110,26],[0,-74,30]];
    cl.forEach(([x,y,r])=>blob(g,x,y+4,r,P.tree2));cl.forEach(([x,y,r])=>blob(g,x,y,r,P.tree));
    cl.forEach(([x,y,r])=>blob(g,x-r*0.3,y-r*0.35,r*0.45,'rgba(255,255,190,0.16)'));break}
  case'bamboo':{shadowE(g,30,10);for(let i=0;i<7;i++){const x=-24+i*8+R()*4,h=90+R()*40,lean=(R()-0.5)*18;
      g.strokeStyle=i%2?'#7a9a3a':'#8aac44';g.lineWidth=5;g.beginPath();g.moveTo(x,0);g.quadraticCurveTo(x+lean*0.3,-h*0.5,x+lean,-h);g.stroke();
      g.strokeStyle='#4f6a22';g.lineWidth=5.5;for(let n=1;n<5;n++){const t=n/5;const nx=x+lean*t*t,ny=-h*t;g.beginPath();g.moveTo(nx-2.5,ny);g.lineTo(nx+2.5,ny);g.stroke()}
      g.fillStyle=i%2?P.tree:P.tree2;for(let l=0;l<4;l++){const ly=-h*(0.55+l*0.13),lx=x+lean*(0.6+l*0.1);g.beginPath();g.ellipse(lx+(l%2?10:-10),ly,13,4,l%2?0.5:-0.5,0,TAU);g.fill()}}break}
  case'palm':{shadowE(g,30,9);g.strokeStyle=P.trunk;g.lineWidth=7;g.beginPath();g.moveTo(0,0);g.quadraticCurveTo(14,-60,4,-108);g.stroke();
    g.strokeStyle='rgba(0,0,0,0.2)';g.lineWidth=7;for(let n=0;n<8;n++){g.beginPath();g.arc(0,0,0,0,0);g.stroke()}
    for(let i=0;i<7;i++){const a=-Math.PI/2+(i-3)*0.55;g.strokeStyle=i%2?P.tree:P.tree2;g.lineWidth=9;g.beginPath();g.moveTo(4,-108);
      g.quadraticCurveTo(4+Math.cos(a)*30,-108+Math.sin(a)*30-6,4+Math.cos(a)*50,-100+Math.sin(a)*40+20);g.stroke()}blob(g,4,-106,7,'#6a4a20');break}
  case'pine':{shadowE(g,28,9);g.fillStyle=P.trunk;g.fillRect(-5,-24,10,24);
    for(let i=0;i<4;i++){const y=-24-i*26,w=40-i*8;g.fillStyle=P.tree2;g.beginPath();g.moveTo(-w,y+4);g.lineTo(0,y-40);g.lineTo(w,y+4);g.closePath();g.fill();
      g.fillStyle=P.tree;g.beginPath();g.moveTo(-w+6,y);g.lineTo(0,y-38);g.lineTo(w-10,y);g.closePath();g.fill()}break}
  case'mangrove':{shadowE(g,40,11);g.strokeStyle=P.trunk;g.lineWidth=4;for(let i=0;i<6;i++){const x=-28+i*11;g.beginPath();g.moveTo(x,0);g.quadraticCurveTo(x*0.4,-30,0,-40);g.stroke()}
    const cl=[[-26,-58,24],[24,-60,24],[0,-76,28]];cl.forEach(([x,y,r])=>blob(g,x,y+4,r,P.tree2));cl.forEach(([x,y,r])=>blob(g,x,y,r,P.tree));
    cl.forEach(([x,y,r])=>blob(g,x-8,y-8,r*0.4,'rgba(255,255,200,0.14)'));break}
  case'peach':{shadowE(g,36,10);g.strokeStyle='#3c2820';g.lineWidth=7;g.beginPath();g.moveTo(0,0);g.lineTo(-2,-40);g.stroke();
    g.lineWidth=4;[[-30,-70],[28,-74],[-6,-90],[14,-60],[-20,-54]].forEach(([x,y])=>{g.beginPath();g.moveTo(-2,-40);g.quadraticCurveTo(x*0.4,y*0.7,x,y);g.stroke()});
    for(let i=0;i<70;i++){const a=R()*TAU,r=R()*42;const x=Math.cos(a)*r*1.1-2,y=-68+Math.sin(a)*r*0.7;blob(g,x,y,2.5+R()*2.5,R()>0.3?'#ff9fb8':'#ffd6e2')}break}
  case'karst':{shadowE(g,34,10);g.fillStyle=P.cliff2||'#555';g.beginPath();g.moveTo(-30,0);g.quadraticCurveTo(-36,-80,-12,-140);g.quadraticCurveTo(10,-150,20,-120);g.quadraticCurveTo(36,-60,30,0);g.closePath();g.fill();
    g.fillStyle=P.cliff||'#777';g.beginPath();g.moveTo(-24,-6);g.quadraticCurveTo(-28,-80,-10,-132);g.quadraticCurveTo(4,-138,10,-118);g.quadraticCurveTo(14,-60,8,-6);g.closePath();g.fill();
    blob(g,-4,-128,12,P.tree);blob(g,12,-96,8,P.tree);break}
  case'rock':{shadowE(g,28,8);g.fillStyle=P.cliff2||'#5d5a52';g.beginPath();g.moveTo(-26,0);g.quadraticCurveTo(-30,-30,-6,-38);g.quadraticCurveTo(24,-40,28,-8);g.quadraticCurveTo(26,2,-26,0);g.fill();
    g.fillStyle=P.cliff||'#86827a';g.beginPath();g.moveTo(-20,-6);g.quadraticCurveTo(-22,-30,-4,-34);g.quadraticCurveTo(18,-34,20,-12);g.closePath();g.fill();blob(g,-8,-26,6,'rgba(255,255,255,0.15)');break}
  case'hut':{shadowE(g,52,12);g.fillStyle='#8a6a44';g.fillRect(-36,-46,72,46);g.fillStyle='#3a2616';g.fillRect(-10,-30,20,30);
    g.fillStyle='#c9a24e';g.beginPath();g.moveTo(-52,-40);g.lineTo(0,-100);g.lineTo(52,-40);g.closePath();g.fill();
    g.strokeStyle='#9a7a36';g.lineWidth=2;for(let i=0;i<8;i++){g.beginPath();g.moveTo(-46+i*12,-42);g.lineTo(-20+i*5,-88);g.stroke()}break}
  case'haystack':{shadowE(g,24,8);g.fillStyle='#c9a24e';g.beginPath();g.moveTo(-24,0);g.quadraticCurveTo(-26,-40,0,-50);g.quadraticCurveTo(26,-40,24,0);g.closePath();g.fill();
    g.fillStyle='#e0c060';g.beginPath();g.moveTo(-16,-6);g.quadraticCurveTo(-16,-36,0,-44);g.lineTo(0,-6);g.fill();g.fillStyle='#6a4a20';g.fillRect(-2,-56,4,10);break}
  case'lantern':{shadowE(g,10,4);g.fillStyle='#4a3020';g.fillRect(-2,-80,4,80);g.fillRect(-2,-80,20,3);
    g.fillStyle='rgba(255,90,60,0.25)';blob(g,16,-64,16,'rgba(255,90,60,0.22)');g.fillStyle='#d4322a';g.beginPath();g.ellipse(16,-64,9,11,0,0,TAU);g.fill();g.fillStyle='#ffc53d';g.fillRect(12,-77,8,3);g.fillRect(12,-54,8,3);break}
  case'fern':{g.fillStyle=P.tree;for(let i=0;i<5;i++){const a=-Math.PI/2+(i-2)*0.5;g.beginPath();g.ellipse(Math.cos(a)*10,Math.sin(a)*8-4,10,3,a,0,TAU);g.fill()}break}
  case'flower':{g.strokeStyle=P.tree2;g.lineWidth=1.5;for(let i=0;i<3;i++){g.beginPath();g.moveTo(-6+i*6,0);g.lineTo(-6+i*6,-12-i*2);g.stroke();blob(g,-6+i*6,-13-i*2,3.5,['#f6e27a','#ffffff','#e88a6a'][(i+v)%3])}break}
  case'reed':{g.strokeStyle='#8a8a50';g.lineWidth=1.8;for(let i=0;i<7;i++){g.beginPath();g.moveTo(-10+i*3.3,0);g.lineTo(-12+i*4,-30-R()*10);g.stroke()}
    g.fillStyle='#6a4a2a';for(let i=0;i<3;i++){g.beginPath();g.ellipse(-8+i*8,-36,2,6,0,0,TAU);g.fill()}break}
  case'stake':{g.fillStyle='rgba(255,255,255,0.18)';g.beginPath();g.ellipse(0,0,10,3,0,0,TAU);g.fill();g.fillStyle='#5a3a20';g.beginPath();g.moveTo(-4,0);g.lineTo(-3,-30);g.lineTo(0,-40);g.lineTo(3,-30);g.lineTo(4,0);g.closePath();g.fill();
    g.fillStyle='#8a9aa0';g.beginPath();g.moveTo(-3,-30);g.lineTo(0,-40);g.lineTo(3,-30);g.fill();break}
  case'anvil':{shadowE(g,24,7);g.fillStyle='#5a3a24';g.fillRect(-14,-14,28,14);g.fillStyle='#3a3d44';g.beginPath();g.moveTo(-24,-14);g.lineTo(22,-14);g.quadraticCurveTo(30,-16,30,-22);g.lineTo(-18,-22);g.quadraticCurveTo(-24,-20,-24,-14);g.fill();
    g.fillRect(-10,-30,22,8);g.fillStyle='#6a6e78';g.fillRect(-10,-30,22,3);blob(g,-26,-8,8,'#e86a2a');blob(g,-26,-8,4,'#ffd060');break}
  case'stall':{shadowE(g,48,10);g.fillStyle='#6a4a2a';g.fillRect(-44,-70,4,70);g.fillRect(40,-70,4,70);g.fillStyle='#8a6038';g.fillRect(-46,-28,92,10);
    g.fillStyle='#b8322a';g.beginPath();g.moveTo(-54,-64);g.lineTo(54,-64);g.lineTo(46,-88);g.lineTo(-46,-88);g.closePath();g.fill();
    g.fillStyle='#ffc53d';for(let i=0;i<5;i++)g.fillRect(-46+i*20,-66,10,4);
    ['#c9a24e','#7aa04a','#d4322a','#e8e0c8'].forEach((c,i)=>blob(g,-30+i*20,-34,7,c));break}
  case'fire':{shadowE(g,20,6);g.strokeStyle='#4a2a14';g.lineWidth=5;g.beginPath();g.moveTo(-16,-2);g.lineTo(16,-8);g.moveTo(-16,-8);g.lineTo(16,-2);g.stroke();
    g.fillStyle='#8a8070';for(let i=0;i<8;i++){const a=i/8*TAU;blob(g,Math.cos(a)*18,Math.sin(a)*6-2,4,'#6a645a')}break}
  case'cart':{shadowE(g,44,9);g.fillStyle='#7a5432';g.fillRect(-36,-36,60,18);g.strokeStyle='#4a301a';g.lineWidth=4;g.beginPath();g.arc(-20,-14,14,0,TAU);g.stroke();
    g.beginPath();g.moveTo(24,-28);g.lineTo(48,-24);g.stroke();g.fillStyle='#c9a24e';g.beginPath();g.moveTo(-40,-36);g.quadraticCurveTo(-10,-62,28,-36);g.fill();break}
  case'drum':{shadowE(g,30,8);g.fillStyle='#8a6a2a';g.beginPath();g.ellipse(0,-10,28,10,0,0,Math.PI);g.fill();g.fillRect(-28,-26,56,16);
    g.fillStyle='#c9a24e';g.beginPath();g.ellipse(0,-26,28,10,0,0,TAU);g.fill();g.strokeStyle='#7a5a1a';g.lineWidth=1.5;
    for(let r=4;r<28;r+=6){g.beginPath();g.ellipse(0,-26,r,r*0.36,0,0,TAU);g.stroke()}g.fillStyle='#ffe08a';
    for(let i=0;i<12;i++){g.save();g.translate(0,-26);g.scale(1,0.36);g.rotate(i/12*TAU);g.beginPath();g.moveTo(0,0);g.lineTo(2,-6);g.lineTo(-2,-6);g.fill();g.restore()}break}
  case'flag':{shadowE(g,10,4);g.fillStyle='#4a3020';g.fillRect(-2,-104,4,104);g.fillStyle=['#d4322a','#c9a24e','#d4322a','#c9a24e','#a3392d','#d4322a'][v];
    g.beginPath();g.moveTo(2,-102);g.lineTo(40,-94);g.lineTo(34,-82);g.lineTo(40,-70);g.lineTo(2,-66);g.closePath();g.fill();blob(g,18,-84,6,'#ffe08a');break}
  case'tent':{shadowE(g,46,10);const col=['#8a5a32','#7a3a22','#7a2f2a','#6a5030','#a3392d','#3f5a7a'][v]||'#7a3a22';g.fillStyle=shade(col,-0.25);g.beginPath();g.moveTo(-44,0);g.lineTo(0,-62);g.lineTo(44,0);g.closePath();g.fill();
    g.fillStyle=col;g.beginPath();g.moveTo(-40,0);g.lineTo(0,-60);g.lineTo(18,0);g.closePath();g.fill();g.fillStyle='#1a100a';g.beginPath();g.moveTo(-6,0);g.lineTo(4,-30);g.lineTo(12,0);g.closePath();g.fill();
    g.strokeStyle='#3a2414';g.lineWidth=2.4;g.beginPath();g.moveTo(0,-62);g.lineTo(0,-72);g.stroke();g.fillStyle='#d4322a';g.beginPath();g.moveTo(0,-72);g.lineTo(14,-68);g.lineTo(0,-64);g.fill();
    g.fillStyle='#6a645a';for(let i=0;i<6;i++){const a=i/6*TAU;blob(g,34+Math.cos(a)*8,-4+Math.sin(a)*3,2.6,'#6a645a')}break}
  default:drawTownObj(g,k,v,P);break;
  case'pillar':{shadowE(g,18,6);g.fillStyle='#6a6458';g.fillRect(-14,-80,28,80);g.fillStyle='#8a8476';g.fillRect(-14,-80,10,80);g.fillStyle='#5a5448';g.fillRect(-18,-88,36,10);
    g.fillStyle='#d4322a';g.fillRect(-8,-62,16,22);g.strokeStyle='#ffd060';g.lineWidth=1.6;g.beginPath();g.arc(0,-51,5,0,TAU*0.8);g.stroke();g.beginPath();g.arc(0,-51,1.6,0,TAU);g.stroke();break}
  }
}

/* ---- tìm đường: BFS trên lưới ô ---- */
function bfsField(W,gx,gy,WK){const walk=WK||W.walk;
  const d=new Int16Array(MW*MH).fill(-1);gx=clamp(gx,0,MW-1);gy=clamp(gy,0,MH-1);
  let start=gy*MW+gx;
  if(!walk[start]){let best=-1,bd=1e9;for(let yy=-2;yy<=2;yy++)for(let xx=-2;xx<=2;xx++){const x=gx+xx,y=gy+yy;if(x<0||y<0||x>=MW||y>=MH)continue;const j=y*MW+x;if(walk[j]&&xx*xx+yy*yy<bd){bd=xx*xx+yy*yy;best=j}}if(best<0)return d;start=best}
  const q=new Int32Array(MW*MH);let h=0,t=0;q[t++]=start;d[start]=0;
  while(h<t){const i=q[h++],x=i%MW,y=(i/MW)|0,nd=d[i]+1;
    if(x>0&&d[i-1]<0&&walk[i-1]){d[i-1]=nd;q[t++]=i-1}if(x<MW-1&&d[i+1]<0&&walk[i+1]){d[i+1]=nd;q[t++]=i+1}
    if(y>0&&d[i-MW]<0&&walk[i-MW]){d[i-MW]=nd;q[t++]=i-MW}if(y<MH-1&&d[i+MW]<0&&walk[i+MW]){d[i+MW]=nd;q[t++]=i+MW}}
  return d;
}
function losClear(W,x0,y0,x1,y1,WK){const walk=WK||W.walk;const d=dist(x0,y0,x1,y1),n=Math.ceil(d/14);if(!n)return true;const nx=-(y1-y0)/d*11,ny=(x1-x0)/d*11;
  for(let k=1;k<=n;k++){const x=lerp(x0,x1,k/n),y=lerp(y0,y1,k/n);for(const o of[0,1,-1]){const px=x+nx*o,py=y+ny*o;const i=Math.floor(py/T)*MW+Math.floor(px/T);if(!walk[i])return false}}return true}
/* hướng đi theo trường khoảng cách: trả về [dx,dy] chuẩn hóa hoặc null */
function fieldDir(W,f,x,y){
  const tx=Math.floor(x/T),ty=Math.floor(y/T);let best=-1,bv=1e9;
  const here=f[ty*MW+tx];
  for(let yy=-1;yy<=1;yy++)for(let xx=-1;xx<=1;xx++){if(!xx&&!yy)continue;const nx=tx+xx,ny=ty+yy;if(nx<0||ny<0||nx>=MW||ny>=MH)continue;const j=ny*MW+nx;const v=f[j];if(v<0)continue;
    if(xx&&yy&&(!W.walk[ty*MW+nx]||!W.walk[ny*MW+tx]))continue;const c=v+(xx&&yy?0.4:0);if(c<bv){bv=c;best=j}}
  if(best<0||(here>=0&&bv>=here+0.5&&here===0))return null;
  const cx=(best%MW+0.5)*T,cy=(((best/MW)|0)+0.5)*T;const a=Math.atan2(cy-y,cx-x);return[Math.cos(a),Math.sin(a)];
}
