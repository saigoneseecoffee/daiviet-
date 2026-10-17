#!/bin/bash
# Dựng bản thử từ thư mục chứa script này (chạy được trong mọi worktree): bash t/abuild.sh <tên>
# Ra dist/agent_<tên>.html, có đủ khung trang và mọi mô-đun hiện có.
set -e
cd "$(dirname "$0")/.."
N=${1:-all}
mkdir -p dist
OUT=dist/agent_$N.html
{
echo '<!doctype html><html lang="vi"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><style>[hidden]{display:none!important}html,body{margin:0;background:#1d1410}</style></head><body>'
cat src/head.html
echo '<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>'
echo '<script>'
echo '"use strict";'
for f in data core world human town itemart sprites game fx render ui systems perks legend boss2 prog chapters tower daily hub outfit bikip thanbinh luyendan giatuong nhiemvu gon main; do [ -f src/$f.js ] && { cat src/$f.js; echo; }; done
echo '</script></body></html>'
} > $OUT
node -e "const s=require('fs').readFileSync('$OUT','utf8');new Function(s.split('<script>\n\"use strict\";')[1].split('</script>')[0]);" && echo "$(pwd)/$OUT"
