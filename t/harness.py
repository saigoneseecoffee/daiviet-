import os, re, json
from playwright.sync_api import sync_playwright
T = '/home/claude/dvhk/t'
NM = T + '/node_modules'
HTML = os.environ.get('DVHK_HTML','/home/claude/dvhk/dist/test.html')

def font_css():
    css = ''
    for w in ['400', '500', '600', '700', '800']:
        css += open(f'{NM}/@fontsource/be-vietnam-pro/{w}.css').read()
    css += open(f'{NM}/@fontsource/yeseva-one/index.css').read()
    return re.sub(r'url\(\./files/([^)]+)\)', r'url(https://fonts.gstatic.com/x/\1)', css)

FCSS = font_css()

def route(r):
    u = r.request.url
    if 'three.min.js' in u:
        return r.fulfill(path=NM + '/three/build/three.min.js', content_type='application/javascript')
    if 'gsap.min.js' in u and os.environ.get('NOGSAP'):
        return r.fulfill(status=404, body='')
    if 'gsap.min.js' in u:
        return r.fulfill(path=NM + '/gsap/dist/gsap.min.js', content_type='application/javascript')
    if 'fonts.googleapis.com' in u:
        return r.fulfill(body=FCSS, content_type='text/css')
    if 'fonts.gstatic.com/x/' in u:
        fn = u.split('/x/')[1]
        for pk in ['be-vietnam-pro', 'yeseva-one']:
            p = f'{NM}/@fontsource/{pk}/files/{fn}'
            if os.path.exists(p):
                return r.fulfill(path=p, content_type='font/woff2' if fn.endswith('2') else 'font/woff')
        return r.fulfill(status=404, body='')
    if u.startswith('file://'):
        return r.continue_()
    return r.fulfill(status=404, body='')

PHONE = dict(viewport={'width': 390, 'height': 844}, device_scale_factor=3, is_mobile=True, has_touch=True)
SE = dict(viewport={'width': 375, 'height': 667}, device_scale_factor=2, is_mobile=True, has_touch=True)
LAND = dict(viewport={'width': 844, 'height': 390}, device_scale_factor=3, is_mobile=True, has_touch=True)
DESK = dict(viewport={'width': 1300, 'height': 800}, device_scale_factor=1)

def open_page(p, ctxopts, clear=True, init=None):
    b = p.chromium.launch(args=['--autoplay-policy=no-user-gesture-required'])
    ctx = b.new_context(**ctxopts)
    ctx.route('**/*', route)
    pg = ctx.new_page()
    errs = []
    pg.on('console', lambda m: errs.append(('console.' + m.type, m.text)) if m.type in ('error', 'warning') else None)
    pg.on('pageerror', lambda e: errs.append(('pageerror', str(e))))
    if os.environ.get('DVHK_DAO')!='1':
        pg.add_init_script('window.__DVHK_NODAO=1')  # bỏ hộp chọn Chính/Tà tự bật khi bài thử đặt cấp cao
    if init:
        pg.add_init_script(init)
    pg.goto('file://' + HTML)
    if clear:
        pg.evaluate('localStorage.clear()')
        pg.reload()
    pg.wait_for_timeout(1200)
    return b, ctx, pg, errs

def overflow(pg):
    return pg.evaluate('({sw:document.documentElement.scrollWidth,cw:document.documentElement.clientWidth,bw:document.body.scrollWidth})')
