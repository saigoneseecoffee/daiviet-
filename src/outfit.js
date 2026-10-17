/* ============ Y PHỤC, HÀO QUANG CẢNH GIỚI, BẢNG DANH HIỆU, ĐẠI CHIÊU ============
   Lưu ở G.save.outfit = {v, cur, own:{id:1}, seen:{id:1}, pity, plate}
   - Y Phục: thẻ "Y Phục" trong bảng Võ Đạo. Đổi ngoại hình người chơi bằng cách bọc updateLook:
     tạm thay LOOKS[phái] bằng bản đã trộn y phục, để trang bị vẫn phủ lên như cũ.
     Mũ mới vẽ bằng cách bọc drawHat0; hoa văn áo qua L.deco / L.deco2 / L.armX (móc nhỏ trong human.js).
   - Hào quang Cảnh Giới thay phần vẽ của prog.js (prog bỏ qua khi OF.aura bật), vẽ từ ảnh dựng sẵn.
   - Bảng danh hiệu trên đầu (móc drawWorld), đồ họa đại chiêu (móc cast, vẽ dưới chân qua drawFxLayer).
   Xuất: window.OF */
(function(){
const ST=()=>{const S=G.save;if(!S)return null;let o=S.outfit;
  if(!o||typeof o!=='object')o=S.outfit={v:1,cur:'mac',own:{mac:1,aonau:1},seen:{mac:1,aonau:1},pity:0,plate:1};
  if(!o.own)o.own={mac:1,aonau:1};if(!o.seen)o.seen={};if(!o.cur||!OF_BY[o.cur])o.cur='mac';if(o.plate==null)o.plate=1;return o};

/* ---------------- hoa văn áo (vẽ trong hệ toạ độ thân trên của drawHuman) ---------------- */
const GOLD='#e8c35a';
function decoGauze(g,SY,NY){g.strokeStyle='rgba(255,255,255,0.12)';g.lineWidth=0.5;g.beginPath();for(let x=-7;x<9;x+=1.6){g.moveTo(x,NY);g.lineTo(x+0.6,1)}g.stroke()}
function decoBrocade(g,SY,NY){g.strokeStyle='rgba(255,215,120,0.42)';g.lineWidth=0.55;g.beginPath();
  for(let k=-24;k<20;k+=3.6){g.moveTo(k,NY);g.lineTo(k+19,1);g.moveTo(k+19,NY);g.lineTo(k,1)}g.stroke();
  g.fillStyle='rgba(255,225,140,0.75)';for(let y=SY+2;y<0;y+=3.6)for(let x=-6+((y*10|0)%2);x<8;x+=3.6){g.fillRect(x-0.35,y-0.35,0.7,0.7)}}
function decoTho(g,SY){g.strokeStyle=GOLD;g.lineWidth=0.6;for(const[x,y]of[[-3.2,SY+4],[3,SY+7.5],[-2.4,-3.6]]){g.beginPath();g.arc(x,y,1.7,0,TAU);g.stroke();g.beginPath();g.moveTo(x-1,y);g.lineTo(x+1,y);g.moveTo(x,y-1);g.lineTo(x,y+1);g.stroke()}}
function decoDongSon(g,SY){g.fillStyle='#b8863a';g.fillRect(-8,SY+4.2,17,3.2);g.strokeStyle='#5a3a14';g.lineWidth=0.5;g.strokeRect(-8,SY+4.2,17,3.2);
  g.fillStyle='#5a3a14';for(let x=-6.5;x<9;x+=2.6){g.beginPath();g.arc(x,SY+5.8,0.75,0,TAU);g.fill()}g.fillStyle='#ffe2a0';for(let x=-6.5;x<9;x+=2.6)g.fillRect(x-0.2,SY+5.6,0.4,0.4)}
function decoDragon(g,SY,NY,tx,t){g.save();g.lineCap='round';
  g.strokeStyle='#b5231a';g.lineWidth=2.4;g.beginPath();g.moveTo(-6.5,-1.5);g.bezierCurveTo(-2,-6,-7,-10,-1.5,-12.5);g.bezierCurveTo(3,-14.5,6,-11,7.5,-13.5);g.stroke();
  g.strokeStyle=GOLD;g.lineWidth=1.5;g.stroke();
  g.strokeStyle='#fff2c0';g.lineWidth=0.45;g.beginPath();for(let i=0;i<7;i++){const x=-6+i*2,y=-2-i*1.6;g.moveTo(x,y);g.lineTo(x+0.8,y-1.2)}g.stroke();
  g.fillStyle='#ff5a3a';g.beginPath();g.arc(5.2,-9.2,1.1,0,TAU);g.fill();// ngọc
  g.fillStyle=GOLD;g.beginPath();g.moveTo(7.5,-13.5);g.lineTo(9,-15.5);g.lineTo(8.6,-12.6);g.closePath();g.fill();g.restore()}
function decoBagua(g,SY){g.strokeStyle=GOLD;g.lineWidth=0.7;g.beginPath();g.arc(1.6,SY+6.5,3.2,0,TAU);g.stroke();
  g.fillStyle=GOLD;g.beginPath();g.arc(1.6,SY+6.5,3.2,-Math.PI/2,Math.PI/2);g.arc(1.6,SY+8.1,1.6,Math.PI/2,-Math.PI/2,true);g.arc(1.6,SY+4.9,1.6,Math.PI/2,-Math.PI/2);g.fill();
  g.fillRect(-5,SY+3,2.4,0.7);g.fillRect(-5,SY+4.4,0.9,0.7);g.fillRect(-3.5,SY+4.4,0.9,0.7);g.fillRect(-5,SY+5.8,2.4,0.7)}
function decoSamurai(){}
/* vạt áo trước: r=[mép trái, mép phải, gấu] */
function hemWaves(col){return(g,r)=>{const y=r[2]-2.2;g.strokeStyle=col;g.lineWidth=0.7;g.beginPath();for(let x=r[0]-2;x<r[1]+2;x+=2.4){g.moveTo(x,y+1.6);g.arc(x+1.2,y+1.6,1.2,Math.PI,0)}g.stroke();
  g.fillStyle=col;g.fillRect(r[0]-3,r[2]-4.6,r[1]-r[0]+6,0.8)}}
function hemBand(col,w){return(g,r)=>{g.fillStyle=col;g.fillRect(r[0]-3,r[2]-(w||2.6),r[1]-r[0]+6,w||2.6)}}
/* băng tay Sát Thát */
function armSatThat(g,S,E,dark){if(dark)return;const a=Math.atan2(E[1]-S[1],E[0]-S[0]),x=lerp(S[0],E[0],0.78),y=lerp(S[1],E[1],0.78);
  g.save();g.translate(x,y);g.rotate(a);g.fillStyle='#c8361f';g.strokeStyle='#ffd98a';g.lineWidth=0.5;g.beginPath();g.rect(-1.3,-3.5,2.6,7);g.fill();g.stroke();
  g.strokeStyle='#1a0c08';g.lineWidth=0.45;g.beginPath();g.moveTo(-0.5,-1.6);g.lineTo(0.6,-1.6);g.moveTo(0,-2.4);g.lineTo(0,-0.6);g.moveTo(-0.5,1);g.lineTo(0.6,1.8);g.moveTo(0.6,1);g.lineTo(-0.5,1.8);g.stroke();g.restore()}

/* ---------------- danh mục y phục ----------------
   un: free | realm:n | ch:chỉ số chương | ach:mã thành tựu | gold:n | tq:n | drop:tỉ lệ (boss)
   b: cộng chỉ số nhỏ khi mặc (tối đa 1%) */
const BASE={cape:null,tails:null,band:null,beads:0,scarf:null,deco:null,deco2:null,armX:null,hair:'#1a1310'};
const O=(id,nm,era,d,un,b,look,x)=>Object.assign({id,nm,era,d,un,b,look:look?Object.assign({},BASE,look):null},x||{});
const OUTFITS=[
 O('mac','Y Phục Môn Phái','Bản môn','Trang phục gốc của môn phái, giữ nguyên dáng vẻ quen thuộc.',{free:1},null,null),
 O('aonau','Áo Nâu Nón Lá','Làng quê Bắc Bộ','Áo nâu sồng, nón lá đội đầu. Hiệp khách xuất thân từ ruộng đồng.',{free:1},null,
   {robe:'#7a5232',robe2:'#4e331f',pants:'#3e2c1e',boots:'#2a1d14',sash:'#a8753a',armor:'robe',hat:'conical',hatC:'#e6d29a'}),
 O('lacviet','Lông Chim Lạc','Văn Lang','Mũ cắm lông chim Lạc như hình người trên mặt trống đồng Đông Sơn, áo vải đay thắt đai đồng.',{ch:0},{hpp:1},
   {robe:'#b8864a',robe2:'#6a3f1e',pants:'#5a3a20',boots:'#3a2414',sash:'#c8361f',armor:'robe',hat:'feather',hatC:'#b8863a',deco:decoDongSon},{noOv:1}),
 O('haiba','Chiến Y Mê Linh','Năm 40, Hai Bà Trưng','Áo vàng khăn vấn, áo choàng đỏ của nghĩa quân Mê Linh.',{ch:2},{atkp:1},
   {robe:'#d9a432',robe2:'#8a2a1a',pants:'#4a2a1a',boots:'#2a1810',sash:'#c8361f',armor:'leather',hat:'khanvan',hatC:'#7a1f18',cape:'#b5231a',deco2:hemBand('#8a2a1a')}),
 O('aothe','Áo The Khăn Xếp','Kẻ sĩ đất Bắc','Áo the đen dài, khăn xếp chữ nhân, quần trắng. Văn võ song toàn.',{gold:3000},{hpp:1},
   {robe:'#22202a',robe2:'#e8e0cc',pants:'#e8e0cc',boots:'#1a1410',sash:'#3a3644',armor:'aodai',hat:'khanxep',hatC:'#1c1a22',deco:decoGauze},{noOv:1}),
 O('quaithao','Nón Quai Thao','Kinh Bắc','Áo tứ thân nâu, thắt lưng xanh, nón quai thao rủ tua. Dáng hội làng quan họ.',{ach:'li7'},{hpp:1},
   {robe:'#5a3a32',robe2:'#d9a432',pants:'#2a1a14',boots:'#2a1a14',sash:'#5f9a4a',armor:'aodai',hat:'quaithao',hatC:'#e0c890'},{noOv:1}),
 O('truclam','Tăng Bào Trúc Lâm','Thiền phái Trúc Lâm','Cà sa nâu vàng, tràng hạt. Như vị vua đi tu trên núi Yên Tử.',{realm:3},{hpp:1},
   {robe:'#a8742e',robe2:'#6a3a14',pants:'#5a3a1a',boots:'#3a2210',sash:'#6a3a14',armor:'monk',hat:'bald',hatC:'#dcae80',hair:'#dcae80',beads:1},{noOv:1}),
 O('daobao','Đạo Bào Bát Quái','Đạo sĩ Huyền Phù','Đạo bào lam thêu Bát Quái, mũ cao viền vàng.',{realm:5},{atkp:1},
   {robe:'#24305e',robe2:'#e3cf96',pants:'#1a2246',boots:'#15182a',sash:'#c9a24e',armor:'mage',hat:'tall',hatC:'#171a2e',tails:'#e3cf96',deco:decoBagua,deco2:hemWaves('#e3cf96')},{noOv:1}),
 O('ngothan','Áo Ngũ Thân Gấm','Kinh thành Thăng Long','Áo dài ngũ thân bằng gấm xanh ngọc, viền sóng nước, khăn xếp.',{tq:20},{atkp:1},
   {robe:'#2a6a5a',robe2:'#e2b24a',pants:'#e8e0cc',boots:'#1a1410',sash:'#e2b24a',armor:'aodai',hat:'khanxep',hatC:'#1e3a34',deco:decoBrocade,deco2:hemWaves('#ffd98a')},{noOv:1}),
 O('satthat','Giáp Sát Thát','Năm 1285, nhà Trần','Giáp sắt quân Đông A, mũ đâu mâu, tay buộc dải "Sát Thát" quyết đánh giặc Nguyên.',{ch:7},{atkp:1},
   {robe:'#6a1a14',robe2:'#2a1a14',pants:'#2a2420',boots:'#1a120c',sash:'#3a2a1c',armor:'lamellar',plate:'#a8b0b4',hat:'daumau',hatC:'#7a8288',armX:armSatThat}),
 O('bachy','Bạch Y Kiếm Khách','Giang hồ','Áo trắng như tuyết, dải buộc tóc bạc bay theo gió.',{ach:'k1k'},{atkp:1},
   {robe:'#f4f2ec',robe2:'#9fb0bc',pants:'#d8dcdc',boots:'#4a4a52',sash:'#9aa8b4',armor:'robe',hat:'topknot',hatC:'#151318',hair:'#151318',band:'#e8eef2',tails:'#e8eef2'}),
 O('lamson','Chiến Bào Lam Sơn','Năm 1427, khởi nghĩa Lam Sơn','Áo chàm, khăn chít đầu của nghĩa binh Lê Lợi.',{ch:9},{hpp:1},
   {robe:'#2c4a52',robe2:'#c9a24e',pants:'#2a3430',boots:'#1a1a14',sash:'#8a2a1a',armor:'leather',hat:'scarf',hatC:'#3a5a3a'}),
 O('hacy','Hắc Y Dạ Hành','Thích khách','Áo đen bịt mặt, khăn đỏ thẫm. Chỉ có trên mình các tướng giặc bại trận.',{drop:0.04},{atkp:1},
   {robe:'#1c1a22',robe2:'#5a1a22',pants:'#141218',boots:'#0e0c10',sash:'#8a1a22',armor:'leather',hat:'mask',hatC:'#1c1a22',scarf:'#8a1a22'}),
 O('tuongquan','Kim Giáp Tướng Quân','Đại tướng','Giáp vảy vàng, mũ trụ, áo choàng đỏ. Rất hiếm khi boss đánh rơi.',{drop:0.02},{hpp:1},
   {robe:'#8a1a12',robe2:'#e2b24a',pants:'#3a1a12',boots:'#2a120c',sash:'#e2b24a',armor:'lamellar',plate:'#e8c35a',hat:'helm',hatC:'#e2b24a',cape:'#b5231a'},{lock:['plate','cape']}),
 O('tayson','Áo Đỏ Tây Sơn','Năm 1789, Quang Trung','Áo đỏ, khăn đỏ của đạo quân áo vải thần tốc ra Bắc.',{ch:11},{atkp:1},
   {robe:'#b5231a',robe2:'#2a1a14',pants:'#2a1a14',boots:'#1a100a',sash:'#e2b24a',armor:'leather',hat:'topknot',hatC:'#1a1310',band:'#d4322a',tails:'#d4322a'}),
 O('hoangbao','Hoàng Bào','Võ Thần','Hoàng bào thêu rồng, mũ xung thiên. Chỉ bậc Võ Thần mới khoác nổi.',{realm:8},{atkp:1},
   {robe:'#e0aa22',robe2:'#b5231a',pants:'#7a4a12',boots:'#2a1a10',sash:'#b5231a',armor:'aodai',hat:'xungthien',hatC:'#1c1a22',deco:decoDragon,deco2:hemWaves('#b5231a')},{noOv:1}),
];
const OF_BY={};OUTFITS.forEach(o=>OF_BY[o.id]=o);
/* dáng áo dài: vạt dài, tay áo rộng */
ROBEY.aodai=1;HEMD.aodai=26;

/* ---------------- mũ mới ---------------- */
const _h0=drawHat0;drawHat0=function(g,L,hx,hy,t,sway){const c=L.hatC||'#222';
  switch(L.hat){
    case'khanxep':{g.beginPath();g.moveTo(hx-9.4,hy-0.6);g.bezierCurveTo(hx-10.6,hy-9.4,hx-2,hy-12.6,hx+4,hy-10.8);g.bezierCurveTo(hx+8.8,hy-9.2,hx+9.6,hy-5.4,hx+8.4,hy-3.2);g.quadraticCurveTo(hx,hy-5.4,hx-9.4,hy-0.6);g.closePath();solid(g,c,olc(c),1.6);
      g.strokeStyle=shade(c,0.38);g.lineWidth=0.75;g.beginPath();for(let i=0;i<4;i++){const y=hy-2.4-i*2.1;g.moveTo(hx-8.8+i*0.7,y+1.2);g.quadraticCurveTo(hx-1,y-1.8,hx+7.8-i*0.6,y-0.8)}g.stroke();
      g.strokeStyle=shade(c,-0.5);g.lineWidth=0.9;g.beginPath();g.moveTo(hx+1.6,hy-10.6);g.lineTo(hx+4.6,hy-5.2);g.lineTo(hx+7.6,hy-8.8);g.stroke();return}
    case'khanvan':{g.beginPath();g.ellipse(hx-0.6,hy-8.2,8.6,3.4,-0.1,0,TAU);solid(g,shade(c,0.12),olc(c),1.5);
      g.beginPath();g.ellipse(hx-0.4,hy-4.6,10,3.8,-0.12,0,TAU);solid(g,c,olc(c),1.6);
      g.strokeStyle=shade(c,0.4);g.lineWidth=0.7;g.beginPath();for(let x=-8;x<9;x+=2.6){g.moveTo(hx+x,hy-7.6);g.lineTo(hx+x+2,hy-2.2)}for(let x=-7;x<7;x+=2.6){g.moveTo(hx+x,hy-10.8);g.lineTo(hx+x+1.8,hy-6.2)}g.stroke();return}
    case'quaithao':{// quai, tua
      g.strokeStyle='#1e120a';g.lineWidth=0.9;g.beginPath();g.moveTo(hx-5,hy-8);g.quadraticCurveTo(hx-1,hy+6,hx+5,hy+8.8);g.stroke();
      g.fillStyle='#1e120a';for(const s of[-1,1]){for(let k=0;k<5;k++){const x=hx+s*(11+k*1.1);g.fillRect(x-0.3,hy-8.6,0.6,8+((k*7)%3)+Math.sin(t*3+k)*0.5)}}
      const gr=g.createLinearGradient(hx-18,0,hx+18,0);gr.addColorStop(0,shade(c,-0.25));gr.addColorStop(0.55,shade(c,0.2));gr.addColorStop(1,shade(c,-0.1));
      g.beginPath();g.ellipse(hx,hy-9.6,17.5,3.6,-0.05,0,TAU);solid(g,gr,olc(c),1.6);
      g.beginPath();g.ellipse(hx,hy-11.2,7,2.3,-0.05,Math.PI,TAU);g.closePath();solid(g,shade(c,-0.15),olc(c),1.2);
      g.strokeStyle='rgba(110,70,20,0.5)';g.lineWidth=0.6;g.beginPath();g.ellipse(hx,hy-9.8,12.5,2.4,-0.05,0,TAU);g.stroke();return}
    case'daumau':{const gr=g.createLinearGradient(hx-9,0,hx+9,0);gr.addColorStop(0,shade(c,-0.25));gr.addColorStop(0.6,shade(c,0.45));gr.addColorStop(1,shade(c,-0.05));
      g.beginPath();g.moveTo(hx-8.2,hy-2.6);g.quadraticCurveTo(hx-12.4,hy+3.6,hx-10.8,hy+8.6);g.lineTo(hx-4.6,hy+5);g.lineTo(hx-3.6,hy-1.2);g.closePath();solid(g,shade(c,-0.3),olc(c),1.5);
      g.beginPath();g.moveTo(hx-9.6,hy-2.6);g.quadraticCurveTo(hx-9.6,hy-12.4,hx,hy-15);g.quadraticCurveTo(hx+9.4,hy-12.4,hx+9.4,hy-3.4);g.closePath();solid(g,gr,olc(c),1.7);
      g.strokeStyle='rgba(0,0,0,0.3)';g.lineWidth=0.6;g.beginPath();for(const k of[-5,0,5]){g.moveTo(hx+k*0.3,hy-14.5);g.quadraticCurveTo(hx+k,hy-9,hx+k*1.6,hy-3.4)}g.stroke();
      g.beginPath();g.roundRect(hx-10,hy-4.4,19.8,2.8,1);solid(g,'#c9a24e',olc('#c9a24e'),1.2);
      g.fillStyle='#d4322a';g.beginPath();g.moveTo(hx,hy-15.5);g.quadraticCurveTo(hx-7+sway*0.4,hy-17,hx-9+sway,hy-11+Math.sin(t*5)*0.8);g.quadraticCurveTo(hx-4,hy-14,hx,hy-14);g.fill();
      g.fillStyle='#e8ecef';g.strokeStyle=OL;g.lineWidth=0.7;g.beginPath();g.moveTo(hx-1.3,hy-14.8);g.lineTo(hx,hy-25);g.lineTo(hx+1.3,hy-14.8);g.closePath();g.fill();g.stroke();
      g.fillStyle='#c9a24e';g.beginPath();g.arc(hx,hy-15.2,1.7,0,TAU);g.fill();return}
    case'feather':{const cols=['#f2ead6','#2a2420','#f2ead6','#c8361f','#f2ead6'];
      for(let i=4;i>=0;i--){const bx=hx-2+i*0.9,by=hy-8.4,tx=hx-9-i*3.6+sway*(0.6+i*0.15),ty=hy-25+i*3.4+Math.sin(t*3+i)*0.6;
        g.beginPath();g.moveTo(bx,by);g.quadraticCurveTo((bx+tx)/2+3,(by+ty)/2-3,tx,ty);g.quadraticCurveTo((bx+tx)/2-1,(by+ty)/2+1,bx-1.6,by+0.6);g.closePath();solid(g,cols[i],olc('#6a5a40'),1.1);
        g.strokeStyle='rgba(0,0,0,0.35)';g.lineWidth=0.5;g.beginPath();g.moveTo(bx-0.6,by);g.quadraticCurveTo((bx+tx)/2+1,(by+ty)/2-1,tx,ty);g.stroke()}
      g.beginPath();g.moveTo(hx-8.9,hy-3.4);g.quadraticCurveTo(hx,hy-7.4,hx+8,hy-5);g.lineTo(hx+7.8,hy-2.6);g.quadraticCurveTo(hx,hy-4.8,hx-9,hy-0.9);g.closePath();solid(g,c,olc(c),1.3);
      g.fillStyle='#5a3a14';for(let x=-6;x<7;x+=3){g.beginPath();g.arc(hx+x,hy-4.2+Math.abs(x)*0.05-(x>0?x*0.06:0),0.7,0,TAU);g.fill()}return}
    case'xungthien':{for(const k of[0,1]){g.save();g.translate(hx-5.5+k*2.2,hy-11.5);g.rotate(-1.05+k*0.4);g.beginPath();g.ellipse(0,-4.6,3.4,5.4,0,0,TAU);solid(g,'#1c1a22',OL,1.3);
        g.strokeStyle=GOLD;g.lineWidth=0.7;g.beginPath();g.ellipse(0,-4.6,2.4,4.4,0,0,TAU);g.stroke();g.restore()}
      g.beginPath();g.moveTo(hx-9.4,hy-1.8);g.bezierCurveTo(hx-10.2,hy-11,hx-3,hy-14.6,hx+2.6,hy-13.4);g.bezierCurveTo(hx+8.6,hy-12,hx+9.6,hy-6.6,hx+8.6,hy-3.4);g.quadraticCurveTo(hx,hy-5.6,hx-9.4,hy-1.8);g.closePath();solid(g,c,olc(c),1.6);
      g.beginPath();g.moveTo(hx-9.6,hy-1.4);g.quadraticCurveTo(hx,hy-6.2,hx+8.8,hy-3.6);g.lineTo(hx+8.6,hy-1.6);g.quadraticCurveTo(hx,hy-4,hx-9.6,hy+0.6);g.closePath();solid(g,GOLD,olc(GOLD),1);
      g.strokeStyle=GOLD;g.lineWidth=0.8;g.beginPath();g.moveTo(hx-7,hy-7);g.quadraticCurveTo(hx-1,hy-12.6,hx+6,hy-8.6);g.stroke();
      g.fillStyle='#ff4a2a';g.beginPath();g.arc(hx+3.4,hy-8.2,1.5,0,TAU);g.fill();g.fillStyle='#fff';g.fillRect(hx+3,hy-8.8,0.5,0.5);return}
  }
  return _h0.apply(this,arguments)};

/* ---------------- áp y phục lên ngoại hình người chơi ---------------- */
let busy=0;
const _ul=updateLook;updateLook=function(){const S=G.save,st=S&&ST(),o=st&&OF_BY[st.cur];
  if(!o||!o.look||!G.p)return _ul.apply(this,arguments);
  const k=S.cls,orig=LOOKS[k];LOOKS[k]=Object.assign({},orig,o.look);let r;try{r=_ul.apply(this,arguments)}finally{LOOKS[k]=orig}
  const L=G.p.look;if(L){L.hatC=o.look.hatC;if(o.noOv){delete L.ov;delete L.ovDisc}if(o.lock)for(const f of o.lock)L[f]=o.look[f]}
  return r};
/* chân dung trên HUD cũng mặc y phục đang chọn */
const _dp=drawPortrait;drawPortrait=function(c,clsId){const p=G.p;if(!c||c.id!=='pcv'||!p||!p.look||G.state==='title')return _dp.apply(this,arguments);
  const orig=LOOKS[clsId];LOOKS[clsId]=p.look;try{return _dp.apply(this,arguments)}finally{LOOKS[clsId]=orig}};
/* ngoại hình khi mặc thử một bộ (không đổi lựa chọn đang lưu) */
function looksFor(ids){const st=ST(),p=G.p;if(!st||!p)return{};const keep=st.cur,out={};
  busy=1;try{for(const id of ids){st.cur=id;updateLook();out[id]=p.look}}finally{st.cur=keep;updateLook();busy=0}return out}

/* ---------------- mở khóa ---------------- */
function achName(id){const A=window.DAILY&&DAILY.ACH&&DAILY.ACH.find(a=>a.id===id);return A?A.nm:id}
function howTxt(o){const u=o.un;if(u.free)return'Có sẵn';if(u.realm!=null)return'Đạt Cảnh Giới '+(window.PROG?PROG.REALMS[u.realm].n:u.realm);
  if(u.ch!=null)return`Chinh phục chương ${u.ch+1}: ${MAPS[u.ch]?MAPS[u.ch].name:''}`;if(u.ach)return'Thành tựu «'+achName(u.ach)+'»';
  if(u.gold)return`Mua ${fmtFull(u.gold)} vàng`;if(u.tq)return`Đổi ${u.tq} Tàn Quyển`;if(u.drop)return'Boss có thể rơi (hiếm)';return''}
function earned(o){const S=G.save,u=o.un;if(u.free)return true;
  if(u.realm!=null)return(typeof realmIdx==='function'?realmIdx():0)>=u.realm;
  if(u.ch!=null)return(S.cleared||[]).includes(u.ch)||(S.ng||0)>0&&u.ch<MAPS.length;
  if(u.ach){const d=S.daily;return!!(d&&d.ach&&d.ach[u.ach])}
  return false}
function grant(id,why){const st=ST();if(!st||st.own[id])return;st.own[id]=1;const o=OF_BY[id];
  UI.toast('Mở khóa Y Phục: '+o.nm+(why?' ('+why+')':''),'quest');Audio_.play('loot');saveGame();if(UI.panel==='vodao'&&HUB.cur==='yphuc')HUB.refresh()}
function checkUnlocks(){const st=ST();if(!st||G.state==='title')return;for(const o of OUTFITS)if(!st.own[o.id]&&earned(o))grant(o.id)}
function buy(id){const S=G.save,st=ST(),o=OF_BY[id],u=o.un;if(st.own[id])return'';
  if(u.gold){if(S.gold<u.gold)return`Thiếu vàng (cần ${fmtFull(u.gold)})`;S.gold-=u.gold;G.dirty.stats=1}
  else if(u.tq){if((S.tq||0)<u.tq)return`Thiếu Tàn Quyển (cần ${u.tq})`;S.tq-=u.tq}else return'Chưa đủ điều kiện';
  st.own[id]=1;st.seen[id]=1;Audio_.play('coin');saveGame();return''}
function wear(id){const st=ST();if(!st||!OF_BY[id])return false;if(!st.own[id])return false;st.cur=id;st.seen[id]=1;
  if(G.p){updateLook();recalc()}saveGame();return true}
/* boss rơi y phục hiếm; có bảo hiểm: 30 boss không rơi thì chắc chắn rơi */
HK.on('kill',e=>{if(!e||!e.boss||!G.save)return;const st=ST();const pool=OUTFITS.filter(o=>o.un.drop&&!st.own[o.id]);if(!pool.length)return;
  st.pity=(st.pity||0)+1;let got=null;for(const o of pool)if(Math.random()<o.un.drop){got=o;break}
  if(!got&&st.pity>=30)got=pool[0];if(got){st.pity=0;grant(got.id,'boss rơi');for(let i=0;i<14;i++)addPart(e.x+rand(-20,20),e.y-rand(0,40),rand(-40,40),rand(-120,-60),1,'#ffd98a',3,-40,'c',1)}});
HK.on('stats',st=>{const S=G.save;if(!S||!S.outfit)return;const o=OF_BY[S.outfit.cur];if(o&&o.b)for(const k in o.b)st[k]=(st[k]||0)+o.b[k]});
let acc=0;HK.on('tick',dt=>{acc+=dt;if(acc>1){acc=0;checkUnlocks()}});
const _sg=startGame;startGame=function(){const r=_sg.apply(this,arguments);try{ST();if(G.p){updateLook();recalc()}}catch(e){console.error(e)}return r};

/* ================= ẢNH DỰNG SẴN: TRỐNG ĐỒNG, BÁT QUÁI, CỘT SÁNG, PHI KIẾM ================= */
const CV={};
function mk(w,h){const c=document.createElement('canvas');c.width=w;c.height=h;return[c,c.getContext('2d')]}
/* mặt trống đồng Đông Sơn: sao giữa, các vành chim Lạc, vòng tròn chấm, răng cưa */
function drum(col){const k='d'+col;if(CV[k])return CV[k];const[c,g]=mk(256,256);g.translate(128,128);g.strokeStyle=col;g.fillStyle=col;
  const ring=(r,w,a)=>{g.globalAlpha=a;g.lineWidth=w;g.beginPath();g.arc(0,0,r,0,TAU);g.stroke()};
  ring(124,4,0.9);ring(116,1.2,0.7);
  g.globalAlpha=0.8;g.lineWidth=1.6;for(let i=0;i<72;i++){const a=i/72*TAU;g.beginPath();g.moveTo(Math.cos(a)*104,Math.sin(a)*104);g.lineTo(Math.cos(a+0.04)*114,Math.sin(a+0.04)*114);g.stroke()}
  ring(102,1.2,0.7);
  g.globalAlpha=0.85;g.lineWidth=1.4;for(let i=0;i<18;i++){const a=i/18*TAU,x=Math.cos(a)*92,y=Math.sin(a)*92;g.beginPath();g.arc(x,y,6,0,TAU);g.stroke();g.beginPath();g.arc(x,y,1.8,0,TAU);g.fill()}
  ring(82,1.2,0.7);
  // chim Lạc bay quanh
  g.globalAlpha=0.9;for(let i=0;i<10;i++){g.save();g.rotate(i/10*TAU);g.translate(0,-68);g.beginPath();g.moveTo(-11,4);g.quadraticCurveTo(-2,-2,6,-2);g.lineTo(13,-6);g.lineTo(8,0);g.quadraticCurveTo(0,2,-11,4);g.closePath();g.fill();
    g.beginPath();g.moveTo(-4,0);g.lineTo(-9,-8);g.lineTo(-1,-1);g.fill();g.restore()}
  ring(54,1.4,0.75);ring(48,1,0.6);
  // sao 14 cánh
  g.globalAlpha=0.95;g.beginPath();for(let i=0;i<28;i++){const a=i/28*TAU-Math.PI/2,r=i%2?12:44;g.lineTo(Math.cos(a)*r,Math.sin(a)*r)}g.closePath();g.fill();
  g.globalAlpha=0.5;g.lineWidth=1;for(let i=0;i<14;i++){const a=(i+0.5)/14*TAU-Math.PI/2;g.beginPath();g.moveTo(Math.cos(a)*16,Math.sin(a)*16);g.lineTo(Math.cos(a)*36,Math.sin(a)*36);g.stroke()}
  g.globalAlpha=1;g.fillStyle='#fff';g.beginPath();g.arc(0,0,7,0,TAU);g.fill();return CV[k]=c}
/* Bát Quái: tám quẻ, âm dương ở giữa */
const TRI=[[1,1,1],[0,1,1],[1,0,1],[0,0,1],[1,1,0],[0,1,0],[1,0,0],[0,0,0]];
function bagua(col,ringOnly){const k='b'+col+(ringOnly?1:0);if(CV[k])return CV[k];const[c,g]=mk(256,256);g.translate(128,128);g.strokeStyle=col;g.fillStyle=col;
  const ring=(r,w,a)=>{g.globalAlpha=a;g.lineWidth=w;g.beginPath();g.arc(0,0,r,0,TAU);g.stroke()};
  ring(124,3.5,0.9);ring(117,1,0.6);
  g.globalAlpha=0.7;for(let i=0;i<64;i++){const a=i/64*TAU;g.save();g.rotate(a);g.fillRect(-1,-114,2,i%8?5:9);g.restore()}
  ring(102,1.2,0.7);
  g.globalAlpha=0.95;for(let i=0;i<8;i++){g.save();g.rotate(i/8*TAU);const T=TRI[i];for(let j=0;j<3;j++){const y=-94+j*9;if(T[j])g.fillRect(-17,y,34,5.5);else{g.fillRect(-17,y,14,5.5);g.fillRect(3,y,14,5.5)}}g.restore()}
  ring(62,1.4,0.75);
  if(!ringOnly){g.globalAlpha=0.9;g.beginPath();g.arc(0,0,42,-Math.PI/2,Math.PI/2);g.arc(0,21,21,Math.PI/2,-Math.PI/2,true);g.arc(0,-21,21,Math.PI/2,-Math.PI/2);g.fill();
    g.lineWidth=2;g.beginPath();g.arc(0,0,42,0,TAU);g.stroke();g.beginPath();g.arc(0,-21,6,0,TAU);g.globalAlpha=0.25;g.fill();g.globalAlpha=0.95;g.beginPath();g.arc(0,21,6,0,TAU);g.fillStyle='#fff';g.fill()}
  return CV[k]=c}
/* cột sáng: mờ hai bên, mờ dần lên trên */
function pillar(col){const k='p'+col;if(CV[k])return CV[k];const[c,g]=mk(64,256);
  let gr=g.createLinearGradient(0,0,64,0);gr.addColorStop(0,'rgba(0,0,0,0)');gr.addColorStop(0.35,col);gr.addColorStop(0.5,'#ffffff');gr.addColorStop(0.65,col);gr.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=gr;g.fillRect(0,0,64,256);
  g.globalCompositeOperation='destination-in';gr=g.createLinearGradient(0,0,0,256);gr.addColorStop(0,'rgba(0,0,0,0)');gr.addColorStop(0.7,'rgba(0,0,0,0.7)');gr.addColorStop(1,'rgba(0,0,0,1)');g.fillStyle=gr;g.fillRect(0,0,64,256);return CV[k]=c}
/* phi kiếm nhỏ (mũi hướng +x) */
function fsword(col){const k='s'+col;if(CV[k])return CV[k];const[c,g]=mk(60,16);g.translate(6,8);
  const gr=g.createLinearGradient(0,-3,0,3);gr.addColorStop(0,'#ffffff');gr.addColorStop(1,col);
  g.fillStyle='#6a4a20';g.fillRect(-4,-1.2,8,2.4);g.fillStyle=GOLD;g.fillRect(3,-4,2,8);
  g.fillStyle=gr;g.beginPath();g.moveTo(5,-2.2);g.lineTo(44,-1.6);g.lineTo(51,0);g.lineTo(44,1.6);g.lineTo(5,2.2);g.closePath();g.fill();return CV[k]=c}

/* ================= HÀO QUANG CẢNH GIỚI ================= */
const tierOf=ri=>ri>=9?3:ri>=6?2:ri>=3?1:0;
const REALM=()=>window.PROG?PROG.REALMS:[{n:'Phàm Nhân',c:'#bba98a'}];
function auraBack(pl,ri){const col=REALM()[ri].c,t=G.t,tier=tierOf(ri),RL=REALM();
  cx.save();cx.translate(pl.x,pl.y);
  additive(()=>{
    cx.save();cx.scale(1,0.38);
    if(tier>=1){const R=46+tier*9;cx.save();cx.rotate(t*0.35);cx.globalAlpha=0.5+0.08*Math.sin(t*2);cx.drawImage(drum(col),-R,-R,R*2,R*2);cx.restore();
      if(tier>=2){const R2=R+18;cx.save();cx.rotate(-t*0.22);cx.globalAlpha=0.38;cx.drawImage(bagua(tier>=3?'#fff1a8':col,1),-R2,-R2,R2*2,R2*2);cx.restore()}}
    else{cx.globalAlpha=0.32;cx.strokeStyle=col;cx.lineWidth=1.6;cx.beginPath();cx.arc(0,0,32,0,TAU);cx.stroke()}
    glow(0,0,40+tier*12,col,0.16+0.05*tier);cx.restore();
    // khí tụ quanh thân: vệt mờ xoắn lên
    const n=2+tier;for(let k=0;k<n;k++){const h=(t*0.45+k/n)%1,a=t*1.6+k*TAU/n;for(let j=0;j<4;j++){const hh=Math.max(0,h-j*0.035),aa=a-j*0.25;
        glow(Math.cos(aa)*(17-hh*5),-8-hh*64+Math.sin(aa)*5,(5-j)*(1-hh*0.5),col,(0.42-j*0.09)*Math.sin(h*Math.PI))}}
    if(tier>=2){cx.globalAlpha=0.22+0.06*Math.sin(t*1.7);cx.drawImage(pillar(col),-26,-190,52,190)}
    if(tier>=3){for(let k=0;k<3;k++){const a=t*0.5+k*TAU/3,x=Math.cos(a)*40,y=Math.sin(a)*14;cx.globalAlpha=0.3+0.12*Math.sin(t*2+k);cx.drawImage(pillar('#ffd98a'),x-7,y-150,14,150)}
      glow(-2,-60,26,'#fff1a8',0.3+0.08*Math.sin(t*2.4))}
  },'lighter');
  if(tier>=3)orbit(pl,0);
  cx.restore();
  if(tier>=1&&Math.random()<0.1+0.08*tier)addPart(pl.x+rand(-24,24),pl.y-rand(0,8),rand(-5,5),rand(-90,-50),rand(0.7,1.1),tier>=3?'#ffe08a':col,rand(1.4,2.6),-30,'c',1);
}
/* phi kiếm bay vòng quanh người (bậc cao); front=1 vẽ nửa trước sau thân người */
function orbit(pl,front){const t=G.t,n=4;for(let k=0;k<n;k++){const a=t*1.3+k*TAU/n,s=Math.sin(a);if((s>0)!==!!front)continue;
  const x=Math.cos(a)*30,y=-34+s*9+Math.sin(t*3+k)*2;cx.save();cx.translate(x,y);cx.rotate(-Math.PI/2+Math.sin(t*2+k)*0.15);cx.globalAlpha=front?0.95:0.6;
  const im=fsword('#fff1a8');cx.drawImage(im,-6,-8,30,8);cx.restore();if(front)additive(()=>glow(x,y-8,8,'#ffd98a',0.5),'lighter')}}
/* thay phần hào quang của prog.js (prog bỏ qua khi OF.aura bật) */
const _da=drawAura;drawAura=function(pl){try{const S=G.save;if(S&&S.prog&&G.state!=='title'&&pl===G.p)auraBack(pl,S.prog.realm||0)}catch(e){console.error(e)}return _da.apply(this,arguments)};

/* ================= BẢNG DANH HIỆU TRÊN ĐẦU ================= */
const PL={};
function plateCanvas(txt,col,title,sc){const k=txt+'|'+col+'|'+title+'|'+sc+'|'+(document.fonts?document.fonts.status:'');if(PL[k])return PL[k];
  for(const q in PL)if(Object.keys(PL).length>24)delete PL[q];
  const[c0,m]=mk(4,4);m.font='400 11px "Yeseva One",Georgia,serif';const w1=Math.ceil(m.measureText(txt).width)+22;
  m.font='700 9px "Be Vietnam Pro",system-ui,sans-serif';const w2=title?Math.ceil(m.measureText('✦ '+title).width)+14:0;
  const W=Math.max(w1,w2)+4,H=title?32:17;const[c,g]=mk(Math.ceil(W*sc),Math.ceil(H*sc));g.scale(sc,sc);
  let y0=0;if(title){g.fillStyle='rgba(120,24,14,0.92)';g.strokeStyle='#ffd98a';g.lineWidth=0.8;g.beginPath();g.roundRect((W-w2)/2,0.5,w2,13,6.5);g.fill();g.stroke();
    g.font='700 9px "Be Vietnam Pro",system-ui,sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillStyle='#ffe7b0';g.fillText('✦ '+title,W/2,7.4);y0=15}
  const x0=(W-w1)/2;g.fillStyle='rgba(22,12,8,0.78)';g.strokeStyle=shade(col,-0.1);g.lineWidth=1;g.beginPath();g.roundRect(x0+0.5,y0+0.5,w1-1,15.5,3);g.fill();g.stroke();
  g.strokeStyle='rgba(255,230,170,0.25)';g.lineWidth=0.6;g.beginPath();g.moveTo(x0+4,y0+2.6);g.lineTo(x0+w1-4,y0+2.6);g.stroke();
  g.fillStyle=col;g.beginPath();g.moveTo(x0+8,y0+4.4);g.lineTo(x0+11.6,y0+8.3);g.lineTo(x0+8,y0+12.2);g.lineTo(x0+4.4,y0+8.3);g.closePath();g.fill();
  g.font='400 11px "Yeseva One",Georgia,serif';g.textAlign='center';g.textBaseline='middle';g.fillStyle=shade(col,0.25);g.fillText(txt,x0+w1/2+5,y0+8.8);
  return PL[k]={c,W,H}}
let tCache={k:'',t:null};
function dailyTitle(){const d=G.save&&G.save.daily;if(!d||!d.title||!window.DAILY)return null;if(tCache.k===d.title)return tCache.t;
  let nm=null;try{const x=DAILY.titles().find(t=>t.id===d.title);nm=x?x.nm:null}catch(e){}tCache={k:d.title,t:nm};return nm}
function drawPlate(){const p=G.p,S=G.save;if(!p||!S||G.state==='title'||G.state==='dead')return;const st=ST();if(!st.plate)return;
  const ri=S.prog?S.prog.realm||0:0,R=REALM()[ri],lh=S.prog&&S.prog.lh&&window.PROG?PROG.lhTitle(S.prog.lh):'';
  const sc=Math.max(1,Math.round(DPR*G.cam.z*2)/2),P=plateCanvas(R.n+(lh?' · '+lh:''),R.c,dailyTitle()||'',sc);
  const ty=p.y-(ridingMount()?122:98)-P.H;cx.globalAlpha=0.95;cx.drawImage(P.c,Math.round(p.x-P.W/2),ty,P.W,P.H);cx.globalAlpha=1}
/* vệt cung phụ theo màu phẩm chất vũ khí Hiếm trở lên */
function rareArc(){const p=G.p,w=G.save&&G.save.equip&&G.save.equip.vk;if(!p||!w||w.rar<2||!p.trail||p.trail.length<3)return;
  const col=RARITY[Math.min(w.rar,RARITY.length-1)].color,tr=p.trail;
  additive(()=>{cx.strokeStyle=col;cx.lineCap='round';for(let i=1;i<tr.length;i++){const a=tr[i-1],b=tr[i];cx.globalAlpha=0.5*i/tr.length;cx.lineWidth=1+3*i/tr.length;
    cx.beginPath();cx.moveTo(a.x*1.06-a.mx*0.06,a.y*1.06-a.my*0.06);cx.lineTo(b.x*1.06-b.mx*0.06,b.y*1.06-b.my*0.06);cx.stroke()}},'lighter')}
HK.on('drawWorld',()=>{const p=G.p,S=G.save;if(!p||!S||G.state==='title')return;
  if(S.prog&&tierOf(S.prog.realm||0)>=3&&G.state!=='dead'){cx.save();cx.translate(p.x,p.y);orbit(p,1);cx.restore()}
  rareArc();drawPlate()});

/* ================= ĐẠI CHIÊU: VÒNG ẤN DƯỚI ĐẤT ================= */
const GF=[];
function castFx(i,sk){const p=G.p,S=G.save;if(!p||!S||i<1)return;const lv=S.skl[i]||1,C=p.cls.color,ph=p.cls.id==='phap';
  let x=p.x,y=p.y,follow=sk.id==='wheel'||sk.id==='guard';
  if(sk.id==='arrowrain'||sk.id==='firering'){const z=G.zones[G.zones.length-1];if(z){x=z.x;y=z.y}}
  const big=i===2,R=big?Math.min(190,120+lv*4):Math.min(110,64+lv*2.5);
  GF.push({x,y,R,age:0,life:big?1.25:0.8,col:C,img:ph?bagua(C):drum(C),acc:big?(ph?bagua('#fff1a8',1):drum('#ffd98a')):null,follow,big,spin:ph?1.4:-1.1});
  if(GF.length>6)GF.shift();
  if(big){G.shake=Math.max(G.shake,6+Math.min(7,lv*0.35));
    /* chớp màn hình cộng màu: dịu lại để nền sáng không bị cháy trắng */if(G.flash)G.flash={col:shade(C,-0.55+Math.min(0.15,lv*0.01)),t:0.34,d:0.34};
    G.fx.push({k:'pillar',x,y,w:34+Math.min(30,lv*1.5),h:420,col:'#fff1c8',life:0.8,max:0.8},{k:'ring',x,y,r:R*0.3,r2:R*1.15,life:0.5,max:0.5,col:'#ffd98a'});
    if(lv>=10)G.fx.push({k:'ring',x,y,r:R*0.6,r2:R*1.5,life:0.7,max:0.7,col:C});
    for(let k=0;k<18;k++){const a=k/18*TAU;addPart(x+Math.cos(a)*R*0.9,y+Math.sin(a)*R*0.38,0,rand(-140,-70),rand(0.6,1),k%2?'#ffe08a':C,rand(2,3.4),-40,'c',1)}}}
HK.on('cast',(i,sk)=>{try{castFx(i,sk)}catch(e){console.error(e)}});
HK.on('tick',dt=>{for(let i=GF.length-1;i>=0;i--){const f=GF[i];f.age+=dt;if(f.follow&&G.p){f.x=G.p.x;f.y=G.p.y}if(f.age>=f.life)GF.splice(i,1)}});
function drawGlyphs(){if(!GF.length)return;additive(()=>{for(const f of GF){const a=f.age,k=a/f.life,s=f.R*(0.55+0.45*easeOutC(Math.min(1,a/0.25)));
  const al=a<0.12?a/0.12:k>0.55?1-(k-0.55)/0.45:1;cx.save();cx.translate(f.x,f.y);cx.scale(1,0.42);
  cx.save();cx.rotate(a*f.spin);cx.globalAlpha=al*(f.big?0.95:0.6);cx.drawImage(f.img,-s,-s,s*2,s*2);cx.restore();
  if(f.acc){const s2=s*1.22;cx.save();cx.rotate(-a*f.spin*0.6);cx.globalAlpha=al*0.45;cx.drawImage(f.acc,-s2,-s2,s2*2,s2*2);cx.restore()}
  glow(0,0,s*1.1,f.col,al*0.25);cx.restore()}},'lighter')}
const _fl=drawFxLayer;drawFxLayer=function(under){if(under)try{drawGlyphs()}catch(e){console.error(e)}return _fl.apply(this,arguments)};

/* ================= THẺ Y PHỤC TRONG BẢNG VÕ ĐẠO ================= */
const CSS=`
.ofTop{display:grid;grid-template-columns:132px minmax(0,1fr);gap:12px;align-items:center}
.ofStage{position:relative;height:178px;border-radius:12px;overflow:hidden;border:1px solid rgba(226,178,74,.35);background:radial-gradient(ellipse at 50% 82%,color-mix(in srgb,var(--rc) 45%,transparent),transparent 62%),linear-gradient(#2a1d16,#140d09)}
.ofStage canvas{position:absolute;inset:0;width:100%;height:100%}
.ofStage .ofR{position:absolute;left:0;right:0;bottom:4px;text-align:center;font:400 11px/1 var(--f-display);color:var(--rc);text-shadow:0 1px 3px #000}
.ofInfo{min-width:0}.ofInfo .k{font:700 10px/1.2 var(--f-ui);letter-spacing:.06em;color:var(--vang);text-transform:uppercase}
.ofInfo h3{margin:3px 0 4px;font:400 20px/1.1 var(--f-display);color:var(--vang2)}
.ofInfo p{margin:0 0 6px;font:500 12.5px/1.45 var(--f-ui);color:var(--ink)}
.ofInfo .ofSt{font-weight:700;color:var(--dim)}.ofInfo .ofSt.ok{color:#9fe89a}
.ofBtns{display:flex;gap:8px;flex-wrap:wrap}.ofBtns .btn{flex:1 1 auto}
.ofGrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(96px,1fr));gap:8px}
.ofCard{position:relative;display:flex;flex-direction:column;align-items:stretch;gap:2px;padding:4px 4px 6px;min-height:44px;border-radius:10px;text-align:center;color:var(--ink);
  background:linear-gradient(170deg,#3a271c,#21160f);border:1.5px solid rgba(226,178,74,.22)}
.ofCard[aria-pressed="true"]{border-color:var(--vang2);box-shadow:0 0 0 2px rgba(255,217,138,.3)}
.ofCard canvas{width:100%;height:92px;display:block;border-radius:7px;background:radial-gradient(circle at 50% 80%,rgba(255,220,150,.13),transparent 70%)}
.ofCard b{font:700 11.5px/1.2 var(--f-ui);min-height:2.4em;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;text-wrap:balance}
.ofCard small{font:600 10px/1.2 var(--f-ui);color:var(--dim);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.ofCard.lock canvas{filter:grayscale(1) brightness(.45)}.ofCard.lock b{color:var(--dim)}
.ofCard.on small{color:#9fe89a}.ofCard .nw{position:absolute;top:3px;right:3px;padding:1px 5px;border-radius:6px;background:var(--son);font:800 9px/1.3 var(--f-ui);color:#fff}
.ofNote{font:500 12px/1.45 var(--f-ui);color:var(--dim);margin:6px 0 0}
@media (max-height:520px){.ofTop{grid-template-columns:104px minmax(0,1fr)}.ofStage{height:132px}.ofInfo h3{font-size:18px}.ofInfo p{margin-bottom:4px}}
@media (min-width:600px){.ofBtns .btn{flex:0 1 auto;min-width:180px}}
`;
let cssOk=0;function css(){if(cssOk)return;cssOk=1;const s=document.createElement('style');s.id='ofCss';s.textContent=CSS;document.head.appendChild(s)}
let sel=null;
function stateTxt(o,st){if(st.cur===o.id)return'Đang mặc';if(st.own[o.id])return'Đã có';const u=o.un;
  if(u.gold)return fmt(u.gold)+' vàng';if(u.tq)return u.tq+' Tàn Quyển';if(u.realm!=null)return REALM()[u.realm]?REALM()[u.realm].n:'Cảnh Giới';if(u.ch!=null)return'Chương '+(u.ch+1);if(u.ach)return'Thành tựu';if(u.drop)return'Boss rơi';return'Khóa'}
const BN={atkp:'% công',hpp:'% sinh lực'};
function html(){css();const st=ST(),S=G.save;checkUnlocks();if(!sel||!OF_BY[sel])sel=st.cur;const o=OF_BY[sel],own=!!st.own[o.id];
  const ri=S.prog?S.prog.realm||0:0,R=REALM()[ri];let btn='';
  if(st.cur===o.id)btn=`<button class="btn sec" disabled>Đang mặc</button>`;
  else if(own)btn=`<button class="btn gold" id="ofWear">Mặc bộ này</button>`;
  else if(o.un.gold||o.un.tq){const can=o.un.gold?S.gold>=o.un.gold:(S.tq||0)>=o.un.tq;btn=`<button class="btn" id="ofBuy" ${can?'':'disabled'}>${o.un.gold?'Mua '+fmt(o.un.gold)+' vàng':'Đổi '+o.un.tq+' Tàn Quyển'}</button>`}
  const nOwn=OUTFITS.filter(x=>st.own[x.id]).length;
  let h=`<div class="sec"><div class="ofTop"><div class="ofStage" style="--rc:${R.c}"><canvas id="ofPrev" aria-label="Xem trước y phục"></canvas><span class="ofR">${esc(R.n)}</span></div>
  <div class="ofInfo"><div class="k">${esc(o.era)}</div><h3>${esc(o.nm)}</h3><p>${esc(o.d)}</p>
  <p class="ofSt${own?' ok':''}">${own?'Đã sở hữu':'Mở khóa: '+esc(howTxt(o))}${o.b?' · Khi mặc: '+Object.keys(o.b).map(k=>'+'+o.b[k]+BN[k]).join(', '):''}</p><div class="ofBtns">${btn}</div></div></div></div>
  <div class="sec"><h4>TỦ Y PHỤC · ${nOwn}/${OUTFITS.length}</h4><div class="ofGrid">${OUTFITS.map(x=>{const ow=!!st.own[x.id];
    return`<button class="ofCard${ow?'':' lock'}${st.cur===x.id?' on':''}" data-of="${x.id}" aria-pressed="${x.id===sel}">${ow&&!st.seen[x.id]?'<span class="nw">Mới</span>':''}<canvas data-th="${x.id}"></canvas><b>${esc(x.nm)}</b><small>${esc(stateTxt(x,st))}</small></button>`}).join('')}</div>
  <p class="ofNote">Y phục chỉ đổi dáng vẻ (cộng tối đa 1% chỉ số khi mặc). Trang bị cấp cao vẫn hiện giáp vai, áo choàng, mũ trụ. Hào quang dưới chân lớn dần theo Cảnh Giới.</p></div>
  <div class="sec"><h4>BẢNG DANH HIỆU TRÊN ĐẦU</h4><div class="ofBtns"><button class="btn sec" id="ofPlate" aria-pressed="${!!st.plate}">${st.plate?'Đang hiện · Bấm để ẩn':'Đang ẩn · Bấm để hiện'}</button></div></div>`;
  return h}
function sizeCv(c){const r=c.getBoundingClientRect(),d=Math.min(2.5,window.devicePixelRatio||1);c.width=Math.max(1,Math.round(r.width*d));c.height=Math.max(1,Math.round(r.height*d));return d}
function drawThumb(c,L){const d=sizeCv(c),g=c.getContext('2d'),w=c.width,h=c.height,s=Math.min(w/60,h/96)*0.95;
  g.save();g.translate(w/2,h*0.93);g.scale(s,s);drawHuman(g,{x:0,y:0,f:1,look:L,t:1.3,atk:-1,walk:0,moving:false,glow:G.p?G.p.glow||0:0});g.restore()}
let loop=0;
function bind(body){const st=ST();st.seen[sel]=1;
  const ids=OUTFITS.map(o=>o.id),L=looksFor(ids);
  body.querySelectorAll('canvas[data-th]').forEach(c=>{try{drawThumb(c,L[c.dataset.th])}catch(e){console.error(e)}});
  body.querySelectorAll('[data-of]').forEach(b=>b.onclick=()=>{sel=b.dataset.of;Audio_.play('ui');HUB.refresh()});
  const w=body.querySelector('#ofWear');if(w)w.onclick=()=>{wear(sel);Audio_.play('loot');UI.toast('Đã mặc '+OF_BY[sel].nm,'quest');HUB.refresh()};
  const b=body.querySelector('#ofBuy');if(b)b.onclick=()=>{const e=buy(sel);if(e){UI.toast(e,'warn');return}UI.toast('Đã có '+OF_BY[sel].nm,'quest');wear(sel);HUB.refresh()};
  const pl=body.querySelector('#ofPlate');if(pl)pl.onclick=()=>{st.plate=st.plate?0:1;saveGame();Audio_.play('ui');HUB.refresh()};
  const c=body.querySelector('#ofPrev');if(!c)return;sizeCv(c);const PL0=L[sel];const id=++loop;const S=G.save,ri=S.prog?S.prog.realm||0:0,col=REALM()[ri].c,t0=performance.now();
  const fr=()=>{if(id!==loop||!c.isConnected)return;const g=c.getContext('2d'),w=c.width,h=c.height,t=(performance.now()-t0)/1000;g.clearRect(0,0,w,h);
    const s=Math.min(w/70,h/112),cyc=t%6,walking=cyc>1.2&&cyc<4.2,f=Math.floor(t/6)%2?-1:1,atk=cyc>4.6&&cyc<5.4?(cyc-4.6)/0.8:-1;
    g.save();g.translate(w/2,h*0.86);g.scale(s,s);
    g.save();g.globalCompositeOperation='lighter';g.scale(1,0.38);if(ri>=3){g.rotate(t*0.35);g.globalAlpha=0.6;g.drawImage(drum(col),-40,-40,80,80)}else{g.globalAlpha=0.5;g.strokeStyle=col;g.lineWidth=1.5;g.beginPath();g.arc(0,0,26,0,TAU);g.stroke()}g.restore();
    drawHuman(g,{x:0,y:0,f,look:PL0,t,walk:t*9,moving:walking,atk,glow:G.p?G.p.glow||0:0});g.restore();requestAnimationFrame(fr)};
  requestAnimationFrame(fr)}
function dot(){const st=G.save&&G.save.outfit;if(!st)return false;for(const id in st.own)if(!st.seen[id])return true;return false}
HUB.add({id:'yphuc',name:'Y Phục',order:60,html,bind,dot});

window.OF={OUTFITS,BY:OF_BY,aura:true,state:ST,wear,buy,grant,earned,checkUnlocks,looksFor,howTxt,glyphs:GF,
  show(id){if(id)sel=id;HUB.show('yphuc')},
  dev:{unlockAll(){const st=ST();OUTFITS.forEach(o=>{st.own[o.id]=1;st.seen[o.id]=1})},canvases:CV}};
})();
