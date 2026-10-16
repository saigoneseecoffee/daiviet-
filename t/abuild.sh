#!/bin/bash
# Dựng bản thử riêng cho một mô-đun: bash t/abuild.sh perks|legend|boss2|all
# Ra file dist/agent_<tên>.html (đã bọc khung trang). Mô-đun khác được thay bằng rỗng (trừ 'all').
set -e
cd /home/claude/dvhk
N=${1:?ten mo-dun}
OUT=dist/agent_$N.html
{
echo '<!doctype html><html lang="vi"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><style>[hidden]{display:none!important}html,body{margin:0;background:#1d1410}</style></head><body>'
cat src/head.html
echo '<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>'
echo '<script>'
echo '"use strict";'
for f in data core world human town itemart sprites game fx render ui systems perks legend boss2 main; do
  if [[ "$f" == perks || "$f" == legend || "$f" == boss2 ]] && [[ "$N" != all && "$N" != "$f" ]]; then echo "/* $f bỏ qua */"; continue; fi
  cat src/$f.js; echo
done
echo '</script></body></html>'
} > $OUT
echo $OUT
