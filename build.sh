#!/bin/bash
cd /home/claude/dvhk
{
cat src/head.html
echo '<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>'
echo '<script>'
echo '"use strict";'
for f in data core world human town itemart sprites game fx render ui systems main; do cat src/$f.js; echo; done
echo '</script>'
} > dist/dai-viet-hiep-khach.html
# trang thử nghiệm: bọc skeleton giống artifact
{
echo '<!doctype html><html lang="vi"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><style>:root{padding-top:env(safe-area-inset-top);padding-bottom:env(safe-area-inset-bottom);color-scheme:light}body{margin:0;font:14px system-ui}img{max-width:100%}[hidden]{display:none!important}</style></head><body>'
cat dist/dai-viet-hiep-khach.html
echo '</body></html>'
} > dist/test.html
wc -c dist/dai-viet-hiep-khach.html
