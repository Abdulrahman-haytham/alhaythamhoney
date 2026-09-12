# النشر الآمن على VPS

هذه التعليمات تجهّز خادماً تملكه؛ لا تنفّذها على قاعدة بيانات موجودة دون نسخة احتياطية. لا تستخدم `prisma migrate reset` أو `docker compose down -v` على الإنتاج.

## 1. التحضير

ثبّت Docker Engine مع Compose v2 وNginx وCertbot وفق نظام الخادم. وجّه DNS للدومين إلى عنوان VPS. اسم الدومين الحالي في المثال `alhaythamhoney.sy`؛ عدّله في ملف Nginx وملف البيئة إذا اختلف.

من مجلد المشروع:

```bash
cp .env.production.example .env.production
chmod 600 .env.production
openssl rand -hex 32
openssl rand -hex 32
```

ضع قيمة مستقلة للأول في `POSTGRES_PASSWORD` وللثاني في `ADMIN_SESSION_SECRET`. استخدم كلمة مرور فعلية للأدمن لا تقل عن 12 حرفاً. كلمة مرور PostgreSQL بصيغة hex تتجنب الحاجة إلى ترميزها داخل رابط الاتصال. لا تضع أسراراً في Dockerfile أو Git أو أوامر تشارك صورها. لا تطبع `docker compose config` دون حجب الأسرار.

`NEXT_PUBLIC_SITE_URL` هو عنوان HTTPS النهائي دون مسار إضافي. يُثبّت داخل ملفات المتصفح وقت البناء؛ عند تغييره يجب إعادة البناء. لا تضف `NODE_ENV` إلى ملف التطوير المحلي.

## 2. أول نشر — قاعدة جديدة

```bash
docker compose --env-file .env.production build
docker compose --env-file .env.production up -d db
docker compose --env-file .env.production run --rm migrate
docker compose --env-file .env.production run --rm seed
docker compose --env-file .env.production up -d app
docker compose --env-file .env.production ps
curl --fail http://127.0.0.1:3005/api/health
```

الـmigrations لا تحتاج تفاعلاً ولا تحذف الجداول القديمة. افتح الإدارة **بعد إعداد HTTPS**، ثم راجع بيانات المنتجات والخلطات وانشر المناسب. لا تنشر البيانات الافتراضية تلقائياً. تشغيل Seed مرة أخرى لا يستبدل تعديلاتك.

## 3. Nginx وHTTPS

انسخ `deploy/nginx.conf` إلى إعدادات Nginx بعد التأكد من عدم وجود server block متعارض. الملف يتوقع أن يكون Nginx على نفس VPS خارج Docker:

```bash
sudo nginx -t
sudo systemctl reload nginx
sudo certbot --nginx --redirect -d alhaythamhoney.sy -d www.alhaythamhoney.sy
sudo nginx -t
sudo systemctl reload nginx
```

فعّل تحويل HTTP إلى HTTPS قبل استخدام الإدارة. تحقق من التجديد التلقائي للشهادة. لا تفتح المنفذين 3005 أو 5432 للعامة؛ Compose يربط الأول بـ127.0.0.1، ولا ينشر الثاني. اترك منفذ SSH الخاص بك و80 و443 حسب إعدادات الجدار الناري لديك.

يستبدل Nginx ترويسة `X-Client-IP` بقيمة `$remote_addr` دائماً. لا تجعل التطبيق متاحاً مباشرة مع `TRUST_PROXY=1`. إذا أضفت Cloudflare أو proxy آخر، اضبط عناوين البروكسي الموثوقة في Nginx أولاً؛ لا تثق بكل `X-Forwarded-For` أو بكل عنوان يرسله العميل.

## 4. قاعدة قديمة أُنشئت بـdb push

README القديم استخدم `db push`، ولذلك قد توجد جداول بلا سجل migrations. **لا تعلّم migrations على أنها مطبّقة عشوائياً، ولا تشغّل reset.**

1. خذ نسخة احتياطية واستعدها على قاعدة تجريبية منفصلة.
2. افحص `prisma migrate status` وسجل `_prisma_migrations`.
3. قارن القاعدة بمحتوى migrations، بما فيه الأعمدة والـEnums والفهارس والعلاقات، لا أسماء الجداول فقط.
4. إن كانت جداول الخلطات والاستديو مطابقة تماماً لـ`20260912080000_mixtures_studio` لكنها أُنشئت بـdb push، استخدم `prisma migrate resolve --applied 20260912080000_mixtures_studio` **فقط بعد التحقق على النسخة التجريبية**. إذا كان سجل init أيضاً مفقوداً، يحتاج baseline منفصلاً بعد التحقق الكامل منه.
5. بعدها طبّق `migrate deploy` على النسخة التجريبية، ثم `prisma migrate diff --from-url "$DATABASE_URL" --to-schema-datamodel prisma/schema.prisma --exit-code`. النتيجة المتوقعة لا اختلافات.
6. كرّر العملية الموثّقة على الإنتاج بعد أخذ نسخة حديثة. إن وُجد اختلاف غير مفهوم، توقّف ولا تفرض الترحيل.

## 5. ملفات الاستديو القديمة

المسار الجديد داخل الحاوية `/app/data/uploads/studio` مربوط بالـvolume `uploads`. إن كان لديك استديو من النسخة السابقة في `public/uploads/studio`، انسخ محتوياته إلى هذا المسار **قبل** تحويل الموقع؛ لا تغير الأسماء أو قيم URL في القاعدة. اضبط ملكية الملفات للمستخدم UID/GID 1000 داخل الحاوية. تحقق من صورة وفيديو معروفين بعد النقل، واحتفظ بالمجلد القديم إلى أن ينجح الفحص.

الرفع الجديد لا يحتاج Git أو إعادة build. الصور حتى 8MB والفيديو حتى 60MB، وNginx يحد الطلب إلى 64MB. صيغة MOV ليست مدعومة على كل المتصفحات؛ يُفضّل MP4/H.264 للعرض العام.

## 6. التحديث والرجوع

قبل كل تحديث خذ نسخة من PostgreSQL وvolume الصور، وسجّل SHA النسخة الحالية واحتفظ بصورة Docker السابقة. مثال تحديث بعد وجود التعديلات على GitHub:

```bash
git pull --ff-only origin nextjs
docker compose --env-file .env.production build
docker compose --env-file .env.production run --rm migrate
docker compose --env-file .env.production up -d app
docker compose --env-file .env.production ps
```

لا تحذف volumes عند التحديث. migrations الحالية إضافية فقط، لكن لا تفترض أن أي migration مستقبلية قابلة للعكس. الرجوع للتطبيق السابق يجب أن يراعي توافق المخطط؛ استعادة قاعدة البيانات عملية قد تفقد بيانات وصلت بعد النسخة الاحتياطية، فلا تنفذها آلياً.

## 7. النسخ الاحتياطي والتحقق

شغّل `bash scripts/backup.sh` من مجلد المشروع بعد النشر. يأخذ نسخة PostgreSQL وملفات الاستديو أثناء توقف كتابة التطبيق لفترة قصيرة ثم يعيده للعمل. لا ينسخ `.env.production`؛ احتفظ بنسخة مشفرة منه بشكل منفصل. انقل النسخ إلى مكان خارج VPS وجرّب الاستعادة على بيئة منفصلة. ملف archive على نفس القرص ليس حماية من فقدان الخادم.

لا تحذف النسخ القديمة إلا وفق سياسة احتفاظ واضحة. اختبر الاستعادة من dump إلى **قاعدة جديدة**، ومن أرشيف الملفات إلى **volume جديد**، ثم افحص عدد المنتجات والصور وصفحاتها قبل أي استبدال للإنتاج.

قائمة فحص الإطلاق:

- CI أخضر بما فيه PostgreSQL 16 وPlaywright.
- تسجيل الدخول والخروج، وتعديل منتج ونشره وإخفائه.
- رابط `/q/haytham` القديم، QR، تنزيل vCard وحفظ الرقم على الهاتف.
- منتج غير منشور لا يظهر في المتجر ولا Sitemap ولا الرابط المباشر.
- السلة والمفضلة بعد تحديث الصفحة، والطلب على واتساب مع السعر النهائي الذي تؤكده يدوياً.
- رفع صورة وفيديو، تقديم Range للفيديو، وإعادة إنشاء حاوية التطبيق دون فقد الملفات.
- PWA وأيقوناتها وصفحة عدم الاتصال، وغياب التخزين لصفحات الإدارة.
- اختبار موبايل فعلي وLighthouse بعد تركيب HTTPS؛ لا يُفترض تحسن رقمي للأداء دون القياس.
