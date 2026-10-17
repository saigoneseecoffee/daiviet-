/* ============ VÕ ĐẠO: bảng gom các hệ phát triển nhân vật ============
   Mô-đun đăng ký một thẻ:  HUB.add({id,name,order,html(),bind(body),dot()})
     html()  trả về chuỗi HTML của thẻ; bind(body) gắn sự kiện; dot() true khi có việc cần làm (chấm đỏ)
   Mở:  HUB.show('bikip')   ·   phím Y   ·   nút ☯ Võ Đạo trên menu */
const HUB=(()=>{
  const tabs=[];let cur=null,domOk=false;
  const ICO='<svg viewBox="0 0 24 24" fill="none" stroke="#ffd98a" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3c-3 3-3 6 0 9s3 6 0 9"/><path d="M5 9c3 1 5 1 7 0s4-1 7 0"/><path d="M5 15c3 1 5 1 7 0s4-1 7 0"/><circle cx="12" cy="12" r="9"/></svg>';
  function sorted(){return tabs.slice().sort((a,b)=>(a.order||50)-(b.order||50))}
  function ensure(){if(domOk||!document.getElementById('menu'))return;domOk=true;
    const m=document.getElementById('menu');
    const gear=m.querySelector('[data-p="gear"]');
    const b=document.createElement('button');b.className='mbtn';b.id='bHub';b.setAttribute('aria-label','Võ Đạo');
    b.innerHTML=ICO+'<span class="dot" hidden></span><span class="kc">Y</span>';
    if(gear)m.insertBefore(b,gear);else m.appendChild(b);
    b.addEventListener('click',()=>{Audio_.play('ui');if(UI.panel==='vodao')UI.close();else H.show()});
  }
  const H={tabs,
    add(t){const i=tabs.findIndex(x=>x.id===t.id);if(i>=0)tabs[i]=t;else tabs.push(t)},
    show(id){ensure();const l=sorted();if(!l.length)return;cur=id&&l.find(t=>t.id===id)?id:(cur&&l.find(t=>t.id===cur)?cur:l[0].id);UI.open('vodao',cur)},
    get cur(){return cur},
    refresh(){if(UI.panel==='vodao')UI.render()},
    dots(){if(!domOk)return;const any=tabs.some(t=>{try{return t.dot&&t.dot()}catch(e){return false}});
      const d=document.querySelector('#bHub .dot');if(d)d.hidden=!any}
  };
  UI.p_vodao=function(){const l=sorted();if(this.tab&&l.find(t=>t.id===this.tab))cur=this.tab;
    if(!l.find(t=>t.id===cur))cur=l[0]&&l[0].id;
    if(l.length>1)this.setTabs(l.map(t=>[t.id,t.name+((t.dot&&(()=>{try{return t.dot()}catch(e){return false}})())?' •':'')]),cur);
    const t=l.find(t=>t.id===cur);return t?t.html():''};
  UI.b_vodao=function(body){const t=tabs.find(t=>t.id===cur);t&&t.bind&&t.bind(body)};
  const _init=UI.init;UI.init=function(){const r=_init.apply(this,arguments);ensure();return r};
  const _open=UI.open;UI.open=function(k){const r=_open.apply(this,arguments);if(k==='vodao'&&this.panel==='vodao')document.getElementById('shTitle').textContent='Võ Đạo';return r};
  window.addEventListener('keydown',e=>{const tg=e.target&&e.target.tagName;if(tg==='INPUT'||tg==='TEXTAREA')return;
    if(e.code!=='KeyY'||e.repeat||G.state!=='play')return;if(UI.panel==='vodao')UI.close();else H.show()});
  let acc=0;HK.on('tick',dt=>{acc+=dt;if(acc>0.5){acc=0;H.dots()}});
  window.HUB=H;return H;
})();
