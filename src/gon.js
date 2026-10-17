/* ============ GIAO DIỆN GỌN: bớt chữ bay, bảng tên, ô trống để màn hình chiến đấu dễ nhìn ============
   Bật/tắt trong Cài đặt ("Giao diện gọn", mặc định bật). Lưu ở G.save.set.gon (undefined = bật). */
(function(){
const on=()=>!G.save||!G.save.set||G.save.set.gon!==false;
const small=()=>window.innerWidth<820||window.innerHeight<560;
const isNum=t=>typeof t==='string'&&/^-?[\d.,]+(K|Tr)?!?$/.test(t);
window.GON={on,small};

/* ---- chữ bay: tối đa 1 tên chiêu, tối đa N số sát thương, số nhỏ hơn trên điện thoại ---- */
HK.on('tick',()=>{if(!on()||!G.floats)return;const F=G.floats,sm=small();
  let sk=0,nums=0;const capN=sm?7:12;
  for(let i=F.length-1;i>=0;i--){const f=F[i];
    if(!f._g){f._g=1;
      if(isNum(f.txt)){const crit=f.txt.endsWith('!');if(sm)f.size=Math.round(f.size*(crit?0.72:0.8));if(!crit&&f.size>13)f.life=Math.min(f.life,0.7)}
      else if(f.skill&&sm&&f.size<22&&!f.keep){F.splice(i,1);continue}   // tên chiêu thường: bỏ trên điện thoại, chỉ giữ đại chiêu
      else if(f.skill&&sm)f.size=Math.round(f.size*0.82)}
    if(f.skill){if(++sk>1){F.splice(i,1);continue}}
    else if(isNum(f.txt)){if(++nums>capN){F.splice(i,1);continue}}}
});

/* ---- bảng danh hiệu: một bảng duy nhất (Y Phục), mờ đi khi đang đánh ---- */
let fight=0;
HK.on('tick',dt=>{const p=G.p;if(!p||!G.enemies)return;let near=false;
  for(const e of G.enemies){if(!e.dead&&Math.abs(e.x-p.x)<320&&Math.abs(e.y-p.y)<260){near=true;break}}
  fight=near?Math.min(1,fight+dt*3):Math.max(0,fight-dt*1.5);window.GON.fight=fight});

/* ---- CSS: bảng tin nhặt đồ ngắn hơn, liên trảm nhỏ hơn, hàng bí kíp một dòng, ô bí tịch trống ẩn ---- */
const css=document.createElement('style');css.id='gonCss';css.textContent=`
body.gon .bts.empty{display:none!important}
@media (max-width:819px),(max-height:559px){
 body.gon #combo b{font-size:26px}
 body.gon #combo span{font-size:9px}
 body.gon #pkRow{flex-wrap:nowrap;max-width:none;gap:3px}
 body.gon #pkRow span,body.gon #pkRow canvas{width:20px;height:20px}
 body.gon #pkRow span.gonMore{width:auto;min-width:20px;height:20px;padding:0 4px;border-radius:10px;background:rgba(14,9,6,.7);border:1px solid var(--line);font:800 10px/18px var(--f-ui);color:var(--vang2);text-align:center}
 body.gon #pkRow b{min-width:11px;height:11px;font-size:7.5px;line-height:9px}
 body.gon #feed .feed{font-size:12px}
 body.gon #toasts .toast{font-size:13px;padding:6px 12px}
}`;
document.head.appendChild(css);

function apply(){document.body.classList.toggle('gon',on())}
/* hàng bí kíp: trên điện thoại chỉ hiện 6 biểu tượng đầu + "+N" */
function trimPk(){const row=document.getElementById('pkRow');if(!row)return;
  const items=[...row.children].filter(c=>!c.classList.contains('gonMore'));let more=row.querySelector('.gonMore');
  const lim=on()&&small()?6:999;items.forEach((c,i)=>c.style.display=i<lim?'':'none');
  const extra=items.length-lim;if(extra>0){if(!more){more=document.createElement('span');more.className='gonMore';row.appendChild(more)}more.textContent='+'+extra;more.style.display=''}
  else if(more)more.style.display='none'}
let acc=0;HK.on('tick',dt=>{acc+=dt;if(acc<0.4)return;acc=0;apply();trimPk()});

/* bảng tin nhặt đồ: tối đa 3 dòng khi gọn */
const _loot=UI.loot;UI.loot=function(){const r=_loot.apply(this,arguments);if(on()){const box=document.getElementById('feed');if(box)while(box.children.length>3)box.firstChild.remove()}return r};
/* thông báo: tối đa 1 cái một lúc trên điện thoại */
const _toast=UI.toast;UI.toast=function(){const r=_toast.apply(this,arguments);if(on()&&small()){const box=document.getElementById('toasts');if(box)while(box.children.length>1)box.firstChild.remove()}return r};
/* liên trảm: chỉ hiện từ 10 */
const _combo=UI.combo;UI.combo=function(n){if(on()&&n<10)return;return _combo.apply(this,arguments)};

/* ---- công tắc trong Cài đặt ---- */
const _pg=UI.p_gear;UI.p_gear=function(){let h=_pg.apply(this,arguments);const v=on();
  const t=`<button class="tog" role="switch" data-gon="1" aria-checked="${v}"><span>Giao diện gọn<small>Bớt chữ bay, số sát thương nhỏ hơn, ẩn ô trống khi đánh nhau</small></span><span class="sw"></span></button>`;
  const i=h.indexOf('<button class="tog"');return i>=0?h.slice(0,i)+t+h.slice(i):h+t};
const _bg=UI.b_gear;UI.b_gear=function(body){const r=_bg.apply(this,arguments);const b=body.querySelector('[data-gon]');
  if(b)b.onclick=()=>{G.save.set.gon=!on();apply();trimPk();Audio_.play('ui');this.render()};return r};
})();
