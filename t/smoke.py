import sys
from harness import *
with sync_playwright() as p:
    for name,opts in [('phone',PHONE),('desk',DESK)]:
        b,ctx,pg,errs=open_page(p,opts)
        pg.screenshot(path=f'shots/{name}_title.png')
        pg.click('#tNew'); pg.wait_for_timeout(600)
        pg.screenshot(path=f'shots/{name}_select.png')
        pg.click('[data-c="giao"]'); pg.click('#goBtn'); pg.wait_for_timeout(900)
        pg.screenshot(path=f'shots/{name}_story.png')
        pg.click('#stGo'); pg.wait_for_timeout(1500)
        pg.screenshot(path=f'shots/{name}_play.png')
        print(name, overflow(pg), errs[:8])
        b.close()
