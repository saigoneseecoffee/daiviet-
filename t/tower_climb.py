"""Bot leo tháp: python3 tower_climb.py <phái> <cấp> [rèn] [phẩm] [tầng tối đa] [phút mô phỏng]
   Tạo nhân vật cấp L, đồ phẩm `rar` cấp L rèn +enh, bật tự đánh, leo đến khi thua. In tầng đạt được và thời gian mỗi tầng."""
import sys, json
from tower_lib import *
cls = sys.argv[1] if len(sys.argv) > 1 else 'kiem'
L = int(sys.argv[2]) if len(sys.argv) > 2 else 30
enh = int(sys.argv[3]) if len(sys.argv) > 3 else 7
rar = int(sys.argv[4]) if len(sys.argv) > 4 else 2
maxf = int(sys.argv[5]) if len(sys.argv) > 5 else 200
mins = float(sys.argv[6]) if len(sys.argv) > 6 else 40
with sync_playwright() as p:
    b, ctx, pg, errs = open_page(p, DESK)
    new_game(pg, cls)
    print('char', pg.evaluate(MKCHAR, [L, enh, rar]))
    pg.evaluate("G.save.cleared=[0];G.save.set.auto=true;VT.enter()")
    t = 0; allw = []
    while t < mins:
        r = pg.evaluate(CLIMB, [60, maxf]); t += 1
        for x in r['log']: print(json.dumps(x, ensure_ascii=False), flush=True); allw.append(x)
        if not r['on'] or r['best'] >= maxf: break
    ws = [x for x in allw if x['win']]
    print(f"RESULT {cls} L{L} +{enh} rar{rar}: best floor {r['best']}, deaths {r['deaths']}, sim {t} min, avg floor time {sum(x['t'] for x in ws)/max(1,len(ws)):.1f}s, cq {r['cq']}, tq {r['tq']}, lvl now {r['lvl']}")
    print('errors', errs[:6])
    b.close()
