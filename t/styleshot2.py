from harness import *
import harness
harness.HTML='/home/claude/dvhk/dist/styles_test.html'
with sync_playwright() as p:
    b=p.chromium.launch(args=['--use-gl=swiftshader','--enable-webgl','--ignore-gpu-blocklist','--enable-unsafe-swiftshader'])
    ctx=b.new_context(viewport={'width':1300,'height':900},device_scale_factor=1);ctx.route('**/*',route);pg=ctx.new_page();errs=[]
    pg.on('pageerror',lambda e:errs.append(str(e)));pg.on('console',lambda m: errs.append(m.text) if m.type=='error' else None)
    pg.goto('file://'+harness.HTML);pg.wait_for_timeout(2000)
    for ft in [1.24,1.29]:
        pg.evaluate(f"window.__freeze={ft}")
        for i,c in enumerate(pg.query_selector_all('.card .frame')):
            c.scroll_into_view_if_needed();pg.wait_for_timeout(150);c.screenshot(path=f'shots/st_{ft}_{i+1}.png')
    print(errs[:5])
