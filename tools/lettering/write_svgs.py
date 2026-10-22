import json,re,sys,os
named=json.load(open(sys.argv[1])); out=sys.argv[2]; os.makedirs(out,exist_ok=True)
html=['<!doctype html><body style="font:11px sans-serif;display:flex;flex-wrap:wrap;gap:6px;color:#222">']
for k,ds in sorted(named.items()):
    if not ds: print('EMPTY',k); continue
    n=[list(map(float,re.findall(r'-?\d+\.?\d*',d))) for d in ds]
    xs=[v for a in n for v in a[0::2]]; ys=[v for a in n for v in a[1::2]]
    p=6; x0,y0=min(xs)-p,min(ys)-p; w,h=max(xs)-x0+p,max(ys)-y0+p
    # shift to origin, 1 decimal
    def rdp(pts,eps=0.9):
        if len(pts)<3: return pts
        (ax,ay),(bx,by)=pts[0],pts[-1]; L=((bx-ax)**2+(by-ay)**2)**.5 or 1e-9
        dm,ix=0,0
        for i in range(1,len(pts)-1):
            px,py=pts[i]; dd=abs((bx-ax)*(ay-py)-(ax-px)*(by-ay))/L
            if dd>dm: dm,ix=dd,i
        return rdp(pts[:ix+1],eps)[:-1]+rdp(pts[ix:],eps) if dm>eps else [pts[0],pts[-1]]
    def sh(d):
        n=list(map(float,re.findall(r'-?\d+\.?\d*',d))); pts=rdp(list(zip(n[0::2],n[1::2])))
        return 'M'+' L'.join(f'{a-x0:.0f} {b-y0:.0f}' for a,b in pts)
    paths=''.join(f'<path d="{sh(d)}"/>' for d in ds)
    svg=(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w:.0f} {h:.0f}" fill="none" stroke="currentColor" '
         f'stroke-width="5" stroke-linecap="round" stroke-linejoin="round">{paths}</svg>\n')
    open(f'{out}/{k}.svg','w').write(svg)
    html.append(f'<div style="border:1px solid #ddd;padding:3px;text-align:center"><img src="{k}.svg" style="height:{36 if not k.startswith("icon") else 48}px;display:block;margin:auto"><span>{k}</span></div>')

