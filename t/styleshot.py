import sys
from harness import *
import harness
harness.HTML='/home/claude/dvhk/dist/styles_test.html'
with sync_playwright() as p:
    for name,opts in [('desk',dict(viewport={'width':1300,'height':900},device_scale_factor=1)),('phone',PHONE)]:
        b=p.chromium.launch(args=['--use-gl=swiftshader','--enable-webgl','--ignore-gpu-blocklist'])
        ctx=b.new_context(**opts);ctx.route('**/*',route);pg=ctx.new_page();errs=[]
        pg.on('console',lambda m: errs.append(m.text) if m.type in('error','warning') else None);pg.on('pageerror',lambda e:errs.append(str(e)))
        pg.goto('file://'+harness.HTML);pg.wait_for_timeout(2500)
        print(name,'overflow',overflow(pg),'errors',errs[:6])
        if name=='desk':
            for i,c in enumerate(pg.query_selector_all('.card .frame')):
                c.scroll_into_view_if_needed();pg.wait_for_timeout(300)
                # chụp tại khoảnh khắc chém
                pg.evaluate(f"(()=>{{const c=window.__STYLES.cards[{i}];c.off=(1.27-(performance.now()/1000)%2.6+2.6*10)%2.6}})()")
                pg.wait_for_timeout(120)
                c.screenshot(path=f'shots/style_{i+1}.png')
            pg.screenshot(path='shots/styles_desk.png')
        else:
            pg.screenshot(path='shots/styles_phone.png')
            pg.click('.card >> nth=3 >> .frame');pg.wait_for_timeout(600);pg.screenshot(path='shots/styles_phone_big.png')
            pg.click('#bigClose');pg.click('.card >> nth=3 >> .pick');pg.wait_for_timeout(200);print('chosen',pg.inner_text('#chosen'))
        b.close()
