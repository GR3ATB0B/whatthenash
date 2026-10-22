import re,sys,json,os
src,out=sys.argv[1],sys.argv[2]
t=open(src).read()
strokes=[]
for d in re.findall(r'<path d="([^"]*)"',t):
    n=list(map(float,re.findall(r'-?\d+\.?\d*',d))); xs,ys=n[0::2],n[1::2]
    strokes.append(dict(d=d,x0=min(xs),x1=max(xs),y0=min(ys),y1=max(ys),cx=(min(xs)+max(xs))/2,cy=(min(ys)+max(ys))/2))
G=json.load(open(os.path.join(os.path.dirname(out),'letters/groups.json')))
gp={g['i']:set(g['paths']) for g in G}
def by_groups(*ix): return [s for s in strokes if any(s['d'] in gp[i] for i in ix)]
# PNG display coords (389x2000 preview) -> svg units
def R(x0,y0,x1,y1):
    k=4.2316; f=lambda px,py:(-804+px*k*(1546/1646), 75+py*k*(8353/8453))
    a,b=f(x0,y0); c,d=f(x1,y1)
    return [s for s in strokes if a<=s['cx']<=c and b<=s['cy']<=d]
# digit rows: split into 11 glyphs by largest gaps
def digits(row_groups):
    ss=sorted(by_groups(*row_groups),key=lambda s:s['x0'])
    clusters=[[ss[0]]]
    for s in ss[1:]:
        if s['x0']<=max(q['x1'] for q in clusters[-1])+2: clusters[-1].append(s)
        else: clusters.append([s])
    while len(clusters)>11:
        gaps=[min(q['x0'] for q in clusters[i+1])-max(q['x1'] for q in clusters[i]) for i in range(len(clusters)-1)]
        i=gaps.index(min(gaps)); clusters[i]+=clusters.pop(i+1)
    return clusters
M={}
names=['0','1','2','3','4','5','6','7','8','9','pct']
for v,rg in zip('abc',[range(0,11),range(11,22),range(22,23)]):
    pass
# find digit rows by line membership: groups 0-22 span 3 rows; split by y
dg=sorted(by_groups(*range(0,23)),key=lambda s:s['cy'])
rows=[[],[],[]]; ys=sorted(set(round(s['cy']) for s in dg))
ymid=[s['cy'] for s in dg]; lo,hi=min(ymid),max(ymid)
for s in dg: rows[min(2,int((s['cy']-lo)/((hi-lo)/3+1e-6)))].append(s)
for v,row in zip('abc',rows):
    gi=[g['i'] for g in G if any(p in {r['d'] for r in row} for p in gp[g['i']])]
    cl=digits(gi)
    assert len(cl)==11,(v,len(cl))
    for n,c in zip(names,cl): M[f'digit-{n}-{v}']=c
W={ 'hey-im-nash':[(23,24,25),(26,27,28),(29,30,31)], 'i':[(32,),(36,),(40,)], 'create':[(33,),(37,),(41,)],
 'wonder':[(34,),(38,),(42,)], 'rebuild':[(35,),(39,),(43,)], 'menu':[(44,),(47,),(50,)], 'close':[(45,),(48,),(51,)],
 'back':[(46,),(49,),(52,)], 'work':[(53,),(58,),(63,)], 'about':[(54,),(59,),(64,)], 'hobbies':[(55,),(60,),(65,)],
 'contact':[(56,),(61,),(66,)], 'support':[(57,),(62,),(67,)], 'wasd':[(68,),(71,),(74,)], 'arrows':[(69,),(72,),(75,)],
 'space':[(70,),(73,),(76,)], 'work-caps':[(77,),(88,)], 'banana-peel-1':[(78,),(89,)], 'bob':[(79,),(90,)],
 'claude-approver':[(80,81),(91,92)], 'skystream':[(82,),(93,94)], 'eras-ii-MISSPELLED':[(83,84),(95,96)],
 'house-point-counter':[(85,86,87),(97,98)], 'next-cap':[(99,),(103,)], 'prev-cap':[(100,),(104,)],
 'next':[(101,),(105,)], 'prev':[(102,),(106,)], 'lab-notes':[(107,108),(111,112)], 'hobbies-notebook':[(109,),(113,)],
 'nash-sig':[(110,),(114,)], 'contact-panel':[(115,),(121,)], 'say-hi':[(116,117),(122,123)], 'budget':[(118,),(124,)],
 'send':[(119,),(125,)], 'sent':[(120,),(126,)], 'what-the-nash':[(145,146,147,148,149,150)],
 'icon-eyes':[(152,)], 'icon-dollar':[(153,)], 'icon-hand':[(154,)], 'icon-notebook':[(155,)], 'icon-house':[(156,)],
 'icon-x':[(157,)], 'icon-question':[(158,159)], 'icon-menu':[(166,167)], 'icon-close':[(169,170)],
 'arrow-back':[(141,)], 'arrow-swoop':[(134,)], 'key-space':[(176,)],
}
for name,vs in W.items():
    for v,ix in zip('abc',vs): M[f'{name}-{v}']=by_groups(*ix)
json.dump({k:[s['d'] for s in v] for k,v in M.items()},open(out+'/named.json','w'))
print(len(M),'named')
D={'what-the-nash-a':(20,1620,272,1690),'signature-full-a':(3,1565,236,1635),
 'char-still-a':(190,1345,242,1450),'char-walk-right-a':(255,1345,303,1450),'char-walk-left-a':(238,1495,282,1561),
 'char-jump-a':(320,1485,360,1565),'icon-smile-a':(222,1835,254,1875),'icon-frown-a':(260,1835,300,1875),
 'arrow-up-a':(172,1895,198,1940),'arrow-down-a':(205,1895,238,1960),'arrow-left-a':(246,1908,295,1940),
 'arrow-right-a':(312,1908,365,1940),'icon-spark-a':(45,1345,80,1395),'icon-box-a':(304,1345,348,1392)}
for k,r in D.items(): M[k]=R(*r)
json.dump({k:[s['d'] for s in v] for k,v in M.items()},open(out+'/named.json','w'))
print({k:len(M[k]) for k in D})
