import json,sqlite3,sys,os,html
from PIL import Image,ImageChops
SHA=sys.argv[1] if len(sys.argv)>1 else 'SHA'
ns={};exec(open('map.py').read(),ns);M=ns['M'];SKIP=ns['SKIP']
V=[json.loads(l) for l in open('/mnt/project-files/exercise-video-links/مكتبة روابط التمارين/exercise_videos.index.jsonl',encoding='utf-8') if l.strip()]
V=[v for v in V if v.get('confidence')=='verified']
db=sqlite3.connect('/mnt/project-files/exercise-image-library/exercise_assets.sqlite3')
CDN=f'https://cdn.jsdelivr.net/gh/mousageorge612-dot/george-mousa-fitness@{SHA}/canva/'
os.makedirs('img',exist_ok=True)
items=[]
for k,v in enumerate(V):
    if k in SKIP: continue
    img=M.get(k)
    it=dict(k=k,aud=v['audience'],key=v['exercise_key'],ar=v['exercise_ar'],en=v['exercise_en'],eq=v['equipment'],setting=v['setting'],mg=v['muscle_group'],url=v['url'],vid=v['video_id'],img=img,pres=v['presentation'],dur=v['duration_seconds'])
    if img:
        f,n=db.execute('select file,name from assets where id=?',(img,)).fetchone(); it['img_file']=f; it['img_name']=n
        out=f'img/{img}.jpg'
        if not os.path.exists(out):
            im=Image.open('/mnt/project-files/exercise-image-library/'+f).convert('RGB')
            bg=Image.new('RGB',im.size,'white');diff=ImageChops.difference(im,bg).convert('L').point(lambda p:255 if p>18 else 0)
            # ignore top-left watermark corner triangle
            w,h=im.size;diff.paste(0,(0,0,int(w*.08),int(h*.08)))
            bb=diff.getbbox() or (0,0,w,h);im=im.crop(bb)
            W,H=600,252;s=min((W-16)/im.width,(H-12)/im.height);im=im.resize((max(1,int(im.width*s)),max(1,int(im.height*s))),Image.LANCZOS)
            c=Image.new('RGB',(W,H),'white');c.paste(im,((W-im.width)//2,(H-im.height)//2));c.save(out,quality=86)
    items.append(it)
json.dump(items,open('items.json','w',encoding='utf-8'),ensure_ascii=False,indent=0)
ORDER=['chest','back','shoulders','biceps','triceps','lower_body','core','cardio','warmup','mobility','stretching']
AR={'chest':'صدر','back':'ظهر','shoulders':'أكتاف','biceps':'بايسبس','triceps':'ترايسبس','lower_body':'أرجل ومؤخرة','core':'بطن وجذع','cardio':'كارديو','warmup':'إحماء','mobility':'حركية ومرونة','stretching':'إطالات'}
EN={'chest':'CHEST','back':'BACK','shoulders':'SHOULDERS','biceps':'BICEPS','triceps':'TRICEPS','lower_body':'LOWER BODY','core':'CORE','cardio':'CARDIO','warmup':'WARM-UP','mobility':'MOBILITY','stretching':'STRETCHING'}
DEF={'core':('3','15','45 ث'),'cardio':('3','30 ث','30 ث'),'warmup':('2','10','—'),'mobility':('2','10','—'),'stretching':('2','30 ث','—')}
css=open('style.css').read()
LOGO=CDN+'gm-logo.png'
def head(t1,t2,sub):
    return f'<div class="head"><div><div class="day">{t1}</div><div class="title">{t2}{sub}</div></div><img class="logo" src="{LOGO}" alt="George Mousa"></div>'
FOOT='<div class="foot"><span>@george.mousa1</span><span>+963 987 461 750</span></div>'
def card(n,it):
    s,r,rest=DEF.get(it['mg'],('3','10-12','1.5 د'))
    name=html.escape(it['ar']);en=html.escape(it['en'])
    cmp=' cmp cmp2' if len(it['ar'])>28 else (' cmp' if len(it['ar'])>20 else '')
    if it['img']:
        ph=f'<div class="ph has"><img src="{CDN}lib2/{it["img"]}.jpg" alt="{en}"></div>'
    else:
        ph='<div class="ph">لا توجد صورة مطابقة</div>'
    return (f'<div class="card cardL{cmp}"><div class="num">{n}</div><div class="info"><div><div class="name">{name}</div><div class="en">{en}</div></div>'
      f'<div class="chips"><div class="chip"><div class="v">{s}</div><div class="l">مجموعات</div></div><div class="chip"><div class="v">{r}</div><div class="l">تكرار</div></div><div class="chip"><div class="v">{rest}</div><div class="l">راحة</div></div></div></div>'
      f'<div class="media">{ph}<div class="yt"><a href="{it["url"]}">▶<br>الشرح</a></div></div></div>')
def build(fname,title_en,title_ar,blurb,sections):
    pages=[];toc=[];pno=3
    for label_ar,label_en,lst in sections:
        if not lst: continue
        chunks=[lst[i:i+6] for i in range(0,len(lst),6)]
        toc.append((label_ar,pno))
        for ci,ch in enumerate(chunks):
            sub=f'<span class="y"> ({ci+1}/{len(chunks)})</span>' if len(chunks)>1 else ''
            body=''.join(card(ci*6+j+1,it) for j,it in enumerate(ch))
            pages.append(f'<div class="page" data-document-role="page" data-label="{label_ar} ({ci+1}/{len(chunks)})">{head(label_en,label_ar,sub)}<div class="sec">{len(lst)} تمرين · صفحة {ci+1} من {len(chunks)}</div>{body}{FOOT}</div>')
            pno+=1
    total=sum(len(l) for _,_,l in sections)
    cover=f'<div class="page cover" data-document-role="page" data-label="الغلاف"><img src="{LOGO}" style="height:44px;margin-bottom:28px" alt="George Mousa"><div class="big">{title_en}</div><div class="title" style="margin-top:18px">{title_ar}</div><div style="margin-top:10px;color:#aaa;font-size:13px;font-weight:600;padding:0 50px">{total} تمرين. {blurb}<br>انسخ البطاقة والصقها في برنامج المشترك.</div></div>'
    tocp=f'<div class="page" data-document-role="page" data-label="الفهرس">{head("CONTENTS","الفهرس","")}<div class="toc">'+''.join(f'<div class="r"><span>{a}</span><span>{p}</span></div>' for a,p in toc)+f'</div>{FOOT}</div>'
    doc=f'<!doctype html>\n<html lang="ar" dir="rtl"><head><meta charset="utf-8">\n<link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&family=Bebas+Neue&display=swap" rel="stylesheet">\n<style>{css}</style></head><body>\n'+cover+'\n'+tocp+'\n'+'\n'.join(pages)+'\n</body></html>'
    open(fname,'w',encoding='utf-8').write(doc);print(fname,total,'cards',len(pages)+2,'pages')
def by_mg(lst,suffix=''):
    return [(AR[m]+suffix,EN[m],[i for i in lst if i['mg']==m]) for m in ORDER]
W=[i for i in items if i['aud']=='female'];Mn=[i for i in items if i['aud']=='male']
HOME_EQ={'bodyweight','band','chair','wall'}
home=lambda l:[i for i in l if i['eq'] in HOME_EQ and i['setting']!='gym']
build('gm-lib-women.html','WOMEN<br>LIBRARY','مكتبة تمارين السيدات','كل بطاقة: صورة نموذج سيدة + زر شرح بفيديو.',by_mg(W))
build('gm-lib-men.html','MEN<br>LIBRARY','مكتبة تمارين الرجال','كل بطاقة: صورة نموذج رجل + زر شرح بفيديو.',by_mg(Mn))
G=[('upper',['chest','back','shoulders','biceps','triceps'],'الجزء العلوي','UPPER BODY'),('lower',['lower_body'],'أرجل ومؤخرة','LOWER BODY'),('core',['core'],'بطن وجذع','CORE'),('cardio',['cardio','warmup'],'كارديو وإحماء','CARDIO'),('flex',['mobility','stretching'],'إطالات ومرونة','STRETCH')]
def coarse(l,suf): return [(a+suf,e,[i for i in l if i['mg'] in ms]) for _,ms,a,e in G]
build('gm-lib-home.html','HOME &amp;<br>BODYWEIGHT','تمارين منزلية ووزن الجسم','بدون نادي: وزن الجسم والمطاط. سيدات ثم رجال.',coarse(home(W),' · سيدات')+coarse(home(Mn),' · رجال'))
