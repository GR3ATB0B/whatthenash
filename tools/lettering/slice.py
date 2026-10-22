import re,sys,json
src,out=sys.argv[1],sys.argv[2]
t=open(src).read()
ds=re.findall(r'<path d="([^"]*)"',t)
strokes=[]
for d in ds:
    n=list(map(float,re.findall(r'-?\d+\.?\d*',d)))
    xs,ys=n[0::2],n[1::2]
    strokes.append(dict(d=d,x0=min(xs),x1=max(xs),y0=min(ys),y1=max(ys)))
# lines: merge strokes by vertical overlap (using core band to avoid descenders bridging)
strokes.sort(key=lambda s:(s['y0']+s['y1'])/2)
lines=[]
for s in strokes:
    cy=(s['y0']+s['y1'])/2
    for L in lines:
        if L['y0']-8<=cy<=L['y1']+8: L['s'].append(s); L['y0']=min(L['y0'],s['y0']); L['y1']=max(L['y1'],s['y1']); break
    else: lines.append(dict(y0=s['y0'],y1=s['y1'],s=[s]))
lines.sort(key=lambda L:L['y0'])
groups=[]
GAP=34
for L in lines:
    ss=sorted(L['s'],key=lambda s:s['x0'])
    cur=None
    for s in ss:
        if cur and s['x0']<=cur['x1']+GAP:
            cur['s'].append(s); cur['x1']=max(cur['x1'],s['x1'])
        else:
            cur=dict(x1=s['x1'],s=[s]); groups.append(cur)
items=[]
for i,g in enumerate(groups):
    x0=min(s['x0'] for s in g['s'])-6; y0=min(s['y0'] for s in g['s'])-6
    x1=max(s['x1'] for s in g['s'])+6; y1=max(s['y1'] for s in g['s'])+6
    items.append(dict(i=i,box=[x0,y0,x1-x0,y1-y0],paths=[s['d'] for s in g['s']]))
json.dump(items,open(out+'/groups.json','w'))
html=['<!doctype html><body style="font:12px sans-serif;display:flex;flex-wrap:wrap;gap:6px;background:#fff">']
for it in items:
    x,y,w,h=it['box']
    html.append(f'<div style="border:1px solid #ccc;padding:2px"><b>{it["i"]}</b><br><svg viewBox="{x} {y} {w} {h}" height="{max(24,min(70,h*0.5))}">'+''.join(f'<path d="{d}" stroke="#000" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>' for d in it['paths'])+'</svg></div>')
open(out+'/sheet.html','w').write(''.join(html))
print(len(lines),'lines',len(items),'groups')
