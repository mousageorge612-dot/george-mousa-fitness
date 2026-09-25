GEORGE MOUSA — WEB DEPLOYMENT
=============================

هذه النسخة جاهزة للرفع مباشرة على GitHub Pages أو Netlify أو Cloudflare Pages.

هيكل الملفات:
index.html
assets/
  css/styles.css
  js/app.js
  images/
downloads/
  GM_Arnold_Split_3_Days.pdf
  GM_Womens_Foundation_8_Weeks.pdf
.nojekyll
robots.txt

طريقة الرفع على GitHub Pages:
1) أنشئ Repository جديد.
2) ارفع كل محتويات هذا المجلد إلى جذر الـ Repository.
3) ادخل Settings > Pages.
4) اختر Deploy from a branch.
5) اختر main ثم /root واضغط Save.
6) بعد نشر الموقع أضف الدومين من Custom domain.
7) فعّل Enforce HTTPS بعد اكتمال إعداد DNS.

ملاحظات:
- الصور أصبحت ملفات WebP مضغوطة لتحسين سرعة الموقع على الهاتف.
- ملفات PDF المجانية أصبحت ملفات منفصلة وليست مدمجة داخل HTML.
- احتفظ بنفس بنية المجلدات حتى تعمل كل الصور والتحميلات بشكل صحيح.
