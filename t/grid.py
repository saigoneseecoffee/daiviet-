import sys
from PIL import Image
tag=sys.argv[1];suf=sys.argv[2] if len(sys.argv)>2 else ''
ims=[Image.open(f'shots/outfit_{tag}_{c}_r{r}{suf}.png') for c in ['kiem','phap','giao'] for r in [0,4,8]]
w,h=ims[0].size;o=Image.new('RGB',(w*3,h*3))
for i,im in enumerate(ims):o.paste(im,((i%3)*w,(i//3)*h))
o=o.resize((w*3//2,h*3//2));o.save(f'shots/outfit_{tag}_grid{suf}.png')
