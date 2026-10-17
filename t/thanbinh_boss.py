"""So thời gian đánh boss có/không Thần Tính: TBK=<khóa|none> GR=2 python3 thanbinh_boss.py <lớp> <phút> <chương...>
   Dựa trên chapters_bot_int.py; sau khi dựng nhân vật thì gắn (hoặc gỡ) Thần Tính cấp TBL trên vũ khí."""
import os, sys
src = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'chapters_bot_int.py')).read()
k = os.environ.get('TBK', 'none'); lv = os.environ.get('TBL', '3')
tail = "recalc();G.p.hp=G.p.maxhp;\n  return{lvl:S.lvl,"
assert tail in src
fix = ("{const w=S.equip.vk;if(%s)delete w.tt;else w.tt={k:'%s',lv:Math.min(window.TB.lvCap(w),%s),q:1}}" % ("true" if k == 'none' else "false", k, lv))
src = src.replace(tail, "recalc();G.p.hp=G.p.maxhp;" + fix + "recalc();G.p.hp=G.p.maxhp;\n  return{tt:JSON.stringify(S.equip.vk.tt||null),lvl:S.lvl,")
src = src.replace("pg.screenshot(path=f'shots/ch/bot_{cls}_{mi:02d}.png')", "pass")
exec(compile(src, 'thanbinh_boss', 'exec'))
