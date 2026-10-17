/* ============ TIỆN ÍCH ============ */
const TAU=Math.PI*2;
const clamp=(v,a,b)=>v<a?a:v>b?b:v;
const lerp=(a,b,t)=>a+(b-a)*t;
const rand=(a,b)=>a+Math.random()*(b-a);
const randi=(a,b)=>Math.floor(a+Math.random()*(b-a+1));
const pick=a=>a[Math.floor(Math.random()*a.length)];
const dist2=(ax,ay,bx,by)=>{const dx=ax-bx,dy=ay-by;return dx*dx+dy*dy};
const dist=(ax,ay,bx,by)=>Math.sqrt(dist2(ax,ay,bx,by));
const angDiff=(a,b)=>{let d=(b-a)%TAU;if(d>Math.PI)d-=TAU;if(d<-Math.PI)d+=TAU;return d};
function mulberry32(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
function hash2(x,y,s){let h=(x*374761393+y*668265263+s*982451653)|0;h=(h^(h>>>13))*1274126177|0;return((h^(h>>>16))>>>0)/4294967296}
function vnoise(x,y,s){const xi=Math.floor(x),yi=Math.floor(y),xf=x-xi,yf=y-yi;
  const u=xf*xf*(3-2*xf),v=yf*yf*(3-2*yf);
  const a=hash2(xi,yi,s),b=hash2(xi+1,yi,s),c=hash2(xi,yi+1,s),d=hash2(xi+1,yi+1,s);
  return lerp(lerp(a,b,u),lerp(c,d,u),v)}
function fbm(x,y,s){return vnoise(x,y,s)*0.6+vnoise(x*2.1,y*2.1,s+7)*0.3+vnoise(x*4.3,y*4.3,s+13)*0.1}
const fmt=n=>{n=Math.floor(n);if(n>=1e6)return(n/1e6).toFixed(n>=1e7?0:1)+'Tr';if(n>=1e4)return(n/1e3).toFixed(n>=1e5?0:1)+'K';return n.toLocaleString('vi-VN')};
const fmtFull=n=>Math.floor(n).toLocaleString('vi-VN');
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const REDUCED=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
const FINE=window.matchMedia&&matchMedia('(pointer: fine)').matches;

/* ============ LƯU GAME ============ */
const SAVE_KEY='dvhk_save_v1';
const store={
  get(k){try{return localStorage.getItem(k)}catch(e){return null}},
  set(k,v){try{localStorage.setItem(k,v);return true}catch(e){return false}},
  del(k){try{localStorage.removeItem(k)}catch(e){}}
};
/* ---- điểm nối cho mô-đun mở rộng (perks.js, legend.js, boss2.js) ----
   HK.on(tên, hàm) để đăng ký. HK.ev chỉ báo sự kiện; HK.mod truyền giá trị qua từng hàm, hàm trả về giá trị mới (hoặc undefined để giữ nguyên).
   Sự kiện: res(k,n,why) · stats(st) · spawn(e) · hit(e,dmg,o) · kill(e) · lvl(level) · attack(target) · cast(i,sk) · tick(dt) · drawWorld(left,top,vw,vh) · drawScreen()
   Biến đổi: dmgOut(dmg,e,o) · dmgIn(dmg,src) · item(it) */
const HK={_h:{},on(n,f){(this._h[n]||(this._h[n]=[])).push(f)},
  ev(n,a,b,c,d){const l=this._h[n];if(l)for(const f of l){try{f(a,b,c,d)}catch(err){console.error(err)}}},
  mod(n,v,a,b,c){const l=this._h[n];if(l)for(const f of l){try{const r=f(v,a,b,c);if(r!==undefined)v=r}catch(err){console.error(err)}}return v}};
/* ---- tài nguyên dài hạn dùng chung giữa các mô-đun ----
   cq: Chân Khí (luyện Cảnh Giới, Kinh Mạch) · tq: Tàn Quyển (nâng kỹ năng trên cấp 10)
   Cộng tài nguyên luôn qua giveRes để các mô-đun khác (thành tựu, nhiệm vụ ngày) nghe được sự kiện 'res'. */
const RES_NAME={gold:'vàng',ore:'Huyền Thiết',charm:'Bùa Bảo Hộ',cq:'Chân Khí',tq:'Tàn Quyển',potHP:'Bình Kim Sang',potMP:'Bình Nội Lực'};
function giveRes(k,n,why){const S=G.save;if(!S||!n)return;S[k]=(S[k]||0)+n;HK.ev('res',k,n,why);G.dirty.stats=1}
/* ngày theo giờ máy người chơi, dạng 20261016; đổi ngày lúc 0 giờ */
function dayKey(d){d=d||new Date();return d.getFullYear()*10000+(d.getMonth()+1)*100+d.getDate()}
function weekKey(d){d=d||new Date();const t=new Date(d.getFullYear(),d.getMonth(),d.getDate());t.setDate(t.getDate()-((t.getDay()+6)%7));return dayKey(t)}
function loadSave(){
  try{const hot=window.claude&&window.claude.hot&&window.claude.hot.data;if(hot&&hot.save)return hot.save}catch(e){}
  const raw=store.get(SAVE_KEY);if(!raw)return null;
  try{const s=JSON.parse(raw);if(s&&s.ver===1&&CLASS_BY_ID[s.cls])return s}catch(e){}
  return null;
}
function newSave(cls,name){
  return{ver:1,cls,name,lvl:1,exp:0,gold:60,ore:2,charm:0,potHP:5,potMP:3,sp:0,
    skl:[1,0,0],equip:{},bag:[],map:0,unlocked:1,cleared:[],qs:[0,0,0,0,0,0],qp:0,ng:0,
    side:null,sideChain:0,score:0,best:0,kills:0,iid:1,firstItem:false,
    set:{music:true,sfx:true,autoPot:true,autoSalvage:false,auto:false},
    tut:{move:false,atk:false,skill:false,equip:false,forge:false}};
}

/* ============ ÂM THANH (tổng hợp bằng WebAudio) ============ */
const Audio_={
  ctx:null,master:null,sfxG:null,musG:null,on:false,musicTimer:null,step:0,mode:0,
  /* iPhone: (1) đặt phiên âm thanh là 'playback' để vẫn kêu khi gạt nút im lặng (Safari 17+), bản cũ hơn thì phát một thẻ <audio> im lặng lặp lại;
     (2) gọi lại ở mọi cử chỉ, kể cả touchend/click vì iOS chỉ mở khóa ở đó; (3) trạng thái 'interrupted' sau khi chuyển app cũng phải resume. */
  kick(){const c=this.ctx;if(!c)return;
    if(c.state!=='running'){try{const r=c.resume();if(r&&r.catch)r.catch(()=>{})}catch(e){}}
    try{const b=c.createBuffer(1,1,22050),s=c.createBufferSource();s.buffer=b;s.connect(c.destination);s.start(0)}catch(e){}
    if(!this.tag){try{const a=new Audio('data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAESsAABErAAABAAgAZGF0YQAAAAA=');a.loop=true;a.setAttribute('playsinline','');a.volume=0.01;this.tag=a}catch(e){}}
    if(this.tag&&this.tag.paused){try{const r=this.tag.play();if(r&&r.catch)r.catch(()=>{})}catch(e){}}},
  unlock(){
    try{if(navigator.audioSession&&navigator.audioSession.type!=='playback')navigator.audioSession.type='playback'}catch(e){}
    if(this.ctx){this.kick();return}
    try{
      const C=window.AudioContext||window.webkitAudioContext;if(!C)return;
      this.ctx=new C();this.master=this.ctx.createGain();this.master.gain.value=0.8;this.master.connect(this.ctx.destination);
      this.sfxG=this.ctx.createGain();this.sfxG.connect(this.master);
      this.musG=this.ctx.createGain();this.musG.gain.value=0.16;this.musG.connect(this.master);
      const b=this.ctx.createBuffer(1,this.ctx.sampleRate*0.5,this.ctx.sampleRate),d=b.getChannelData(0);
      for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;this.noiseBuf=b;
      this.on=true;this.applySettings();this.kick();
      this.startMusic();
    }catch(e){}
  },
  applySettings(){if(!this.ctx||!G.save)return;
    this.sfxG.gain.value=G.save.set.sfx?1:0;this.musG.gain.value=G.save.set.music?0.15:0},
  tone(f,dur,type,vol,slide,delay,dest){
    if(!this.on)return;const c=this.ctx,t=c.currentTime+(delay||0);
    const o=c.createOscillator(),g=c.createGain();o.type=type||'sine';o.frequency.setValueAtTime(f,t);
    if(slide)o.frequency.exponentialRampToValueAtTime(Math.max(20,slide),t+dur);
    g.gain.setValueAtTime(0.0001,t);g.gain.exponentialRampToValueAtTime(vol||0.2,t+0.008);g.gain.exponentialRampToValueAtTime(0.0001,t+dur);
    o.connect(g);g.connect(dest||this.sfxG);o.start(t);o.stop(t+dur+0.05);
  },
  noise(dur,f,q,vol,delay,f2){
    if(!this.on)return;const c=this.ctx,t=c.currentTime+(delay||0);
    const s=c.createBufferSource();s.buffer=this.noiseBuf;const bp=c.createBiquadFilter();bp.type='bandpass';bp.frequency.setValueAtTime(f,t);
    if(f2)bp.frequency.exponentialRampToValueAtTime(f2,t+dur);bp.Q.value=q||1;
    const g=c.createGain();g.gain.setValueAtTime(vol||0.2,t);g.gain.exponentialRampToValueAtTime(0.0001,t+dur);
    s.connect(bp);bp.connect(g);g.connect(this.sfxG);s.start(t);s.stop(t+dur+0.02);
  },
  lastHit:0,
  play(n,x){
    if(!this.on)return;const now=this.ctx.currentTime;
    switch(n){
      case 'swing':this.noise(0.12,1800,0.8,0.12,0,600);break;
      case 'hit':if(now-this.lastHit<0.03)return;this.lastHit=now;this.tone(140,0.09,'triangle',0.22,60);this.noise(0.06,2400,1.2,0.12);break;
      case 'crit':this.tone(160,0.12,'triangle',0.28,50);this.noise(0.08,3200,1,0.18);this.tone(1320,0.14,'square',0.05,990,0.01);break;
      case 'bow':this.tone(520,0.08,'triangle',0.14,180);this.noise(0.05,4000,2,0.06);break;
      case 'magic':this.tone(660,0.25,'sine',0.12,1320);this.tone(990,0.2,'sine',0.06,1980,0.05);break;
      case 'zap':this.noise(0.18,5000,0.6,0.16,0,900);this.tone(90,0.2,'sawtooth',0.08,40);break;
      case 'boom':this.tone(90,0.4,'sine',0.35,35);this.noise(0.35,600,0.6,0.3,0,120);break;
      case 'coin':this.tone(1568,0.06,'square',0.05);this.tone(2093,0.09,'square',0.05,0,0.05);break;
      case 'loot':{const r=x||1;const sc=[523,587,698,784,880,1047];for(let i=0;i<2+r;i++)this.tone(sc[i%6]*(i>=6?2:1),0.35,'sine',0.09,0,i*0.06);}break;
      case 'level':{const sc=[392,440,523,587,698,784,880,1047];sc.forEach((f,i)=>this.tone(f,0.5,'triangle',0.1,0,i*0.07));this.tone(196,0.9,'sine',0.15,0,0)}break;
      case 'hurt':this.tone(110,0.14,'sawtooth',0.12,55);break;
      case 'clang':[1,2.76,5.4].forEach((m,i)=>this.tone(320*m,0.5-i*0.1,'square',0.05,320*m*0.98));this.noise(0.1,6000,1,0.2);break;
      case 'win':[523,659,784,1047].forEach((f,i)=>this.tone(f,0.6,'triangle',0.12,0,i*0.09));break;
      case 'fail':this.tone(330,0.5,'sawtooth',0.1,110);this.tone(220,0.6,'triangle',0.1,82,0.1);break;
      case 'roar':this.tone(70,1.0,'sawtooth',0.2,40);this.noise(0.8,300,0.5,0.2,0,80);break;
      case 'ui':this.tone(880,0.05,'sine',0.06);break;
      case 'dash':this.noise(0.18,900,0.7,0.14,0,3000);break;
      case 'quest':[587,698,880,1175].forEach((f,i)=>this.tone(f,0.45,'sine',0.1,0,i*0.08));break;
      case 'slam':this.tone(60,0.35,'sine',0.4,30);this.noise(0.3,400,0.5,0.3);break;
    }
  },
  /* Nhạc nền: ngũ cung, tiếng trống và giai điệu kiểu đàn bầu */
  startMusic(){
    if(this.musicTimer)return;const self=this;
    const scales=[[0,2,5,7,9],[0,3,5,7,10],[0,2,5,7,9],[0,3,5,7,10],[0,2,4,7,9],[0,2,5,7,9]];
    let next=this.ctx.currentTime+0.1;const beat=0.42;
    function sched(){
      if(!self.on)return;const c=self.ctx;
      while(next<c.currentTime+0.6){
        const s=self.step++,bar=s%16,sc=scales[self.mode%6],root=self.mode===5?196:174.6;
        if(bar%4===0)self.drum(next,0.5);if(bar%8===6)self.drum(next,0.25);
        if(bar===0||bar===8){const f=root/2*Math.pow(2,sc[0]/12);self.pad(next,f,beat*7.5)}
        if(Math.random()<(bar%2===0?0.55:0.25)){
          const deg=sc[Math.floor(Math.random()*5)],oct=Math.random()<0.3?2:1;
          const f=root*oct*Math.pow(2,deg/12);self.bau(next,f,beat*(Math.random()<0.3?2:1))}
        next+=beat;
      }
    }
    this.musicTimer=setInterval(sched,150);
  },
  drum(t,v){const c=this.ctx,o=c.createOscillator(),g=c.createGain();o.frequency.setValueAtTime(120,t);o.frequency.exponentialRampToValueAtTime(45,t+0.25);
    g.gain.setValueAtTime(v*0.9,t);g.gain.exponentialRampToValueAtTime(0.0001,t+0.35);o.connect(g);g.connect(this.musG);o.start(t);o.stop(t+0.4)},
  pad(t,f,d){const c=this.ctx;[1,1.5].forEach(m=>{const o=c.createOscillator(),g=c.createGain();o.type='triangle';o.frequency.value=f*m;
    g.gain.setValueAtTime(0.0001,t);g.gain.linearRampToValueAtTime(0.12,t+0.8);g.gain.linearRampToValueAtTime(0.0001,t+d);o.connect(g);g.connect(this.musG);o.start(t);o.stop(t+d+0.1)})},
  bau(t,f,d){const c=this.ctx,o=c.createOscillator(),g=c.createGain(),l=c.createOscillator(),lg=c.createGain();
    o.type='sine';o.frequency.setValueAtTime(f*0.94,t);o.frequency.exponentialRampToValueAtTime(f,t+0.09);
    l.frequency.value=5.5;lg.gain.setValueAtTime(0,t);lg.gain.linearRampToValueAtTime(f*0.012,t+d*0.6);l.connect(lg);lg.connect(o.frequency);
    if(Math.random()<0.3)o.frequency.exponentialRampToValueAtTime(f*1.06,t+d*0.9);
    g.gain.setValueAtTime(0.0001,t);g.gain.exponentialRampToValueAtTime(0.35,t+0.02);g.gain.exponentialRampToValueAtTime(0.0001,t+d*1.4);
    o.connect(g);g.connect(this.musG);o.start(t);l.start(t);o.stop(t+d*1.5);l.stop(t+d*1.5)},
};
