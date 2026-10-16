#!/bin/bash
cd /home/claude/dvhk
{
cat styles/head.html
echo '<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>'
echo '<script>'
echo '"use strict";'
for f in data core world human town; do cat src/$f.js; echo; done
cat styles/gallery.js
echo '</script>'
} > dist/phong-cach-ve.html
{
echo '<!doctype html><html lang="vi"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><style>:root{padding-top:env(safe-area-inset-top);padding-bottom:env(safe-area-inset-bottom);color-scheme:light}body{margin:0;font:14px system-ui}img{max-width:100%}[hidden]{display:none!important}</style></head><body>'
cat dist/phong-cach-ve.html
echo '</body></html>'
} > dist/styles_test.html
wc -c dist/phong-cach-ve.html
