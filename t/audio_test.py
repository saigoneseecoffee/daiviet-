import harness as H, json
from playwright.sync_api import sync_playwright
H.HTML='/home/claude/dvhk/index.html'
SOUNDS=None
with sync_playwright() as p:
    for name,opts in [('phone',H.PHONE),('desk',H.DESK)]:
        b=p.chromium.launch()  # không cờ autoplay: giống trình duyệt thật
        ctx=b.new_context(**opts);ctx.route('**/*',H.route);pg=ctx.new_page();errs=[]
        pg.on('pageerror',lambda e:errs.append(str(e)));pg.on('console',lambda m:errs.append(m.text) if m.type=='error' else None)
        print(name,'goto',flush=True);pg.goto('file://'+H.HTML);pg.evaluate('localStorage.clear()');pg.reload();pg.wait_for_timeout(1000)
        print(name,'loaded',flush=True);before=pg.evaluate("Audio_.ctx?Audio_.ctx.state:'none'")
        if name=='phone': pg.tap('#tNew')
        else: pg.click('#tNew')
        pg.wait_for_timeout(400)
        st=pg.evaluate("Audio_.ctx&&Audio_.ctx.state");print(name,'state',st,flush=True)
        # đo tín hiệu thật qua AnalyserNode
        print(name,'measure',flush=True);rms=pg.evaluate("""()=>new Promise(res=>{const c=Audio_.ctx,an=c.createAnalyser();an.fftSize=2048;Audio_.master.connect(an);
          const names=['hit','crit','swing','bow','magic','zap','level','loot','boom','ui','win','roar','quest','hurt'];let mx=0,i=0;
          const buf=new Float32Array(an.fftSize);
          const iv=setInterval(()=>{if(i<names.length){try{Audio_.play(names[i],2)}catch(e){console.error('play '+names[i]+' '+e)}}i++;
            an.getFloatTimeDomainData(buf);let s=0;for(const v of buf)s+=v*v;mx=Math.max(mx,Math.sqrt(s/buf.length));
            if(i>=names.length+3){clearInterval(iv);res(mx)}},120)})""")
        print(name,'trước:',before,'sau khi chạm:',st,'RMS đỉnh:',round(rms,4),'lỗi:',errs[:4])
        b.close()
