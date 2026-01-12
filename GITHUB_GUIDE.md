# دليل رفع المشروع على GitHub

## الخطوة 1: تثبيت Git (إذا لم يكن مثبتاً)

1. قم بتحميل Git من الموقع الرسمي: https://git-scm.com/download/win
2. قم بتثبيت Git على جهازك
3. افتح PowerShell أو Command Prompt جديد بعد التثبيت

## الخطوة 2: التحقق من تثبيت Git

افتح PowerShell واكتب:
```powershell
git --version
```

إذا ظهر رقم الإصدار، فأنت جاهز للمتابعة.

## الخطوة 3: تهيئة Git في المشروع

افتح PowerShell في مجلد المشروع واكتب الأوامر التالية:

### 3.1 تهيئة مستودع Git
```powershell
git init
```

### 3.2 إضافة جميع الملفات
```powershell
git add .
```

### 3.3 إنشاء أول commit
```powershell
git commit -m "Initial commit"
```

## الخطوة 4: إنشاء مستودع على GitHub

1. اذهب إلى https://github.com
2. سجل الدخول إلى حسابك (أو أنشئ حساب جديد)
3. انقر على زر "+" في الزاوية العلوية اليمنى
4. اختر "New repository"
5. أدخل اسم المستودع (مثلاً: `honey-bee-project`)
6. اختر Public أو Private حسب رغبتك
7. **لا تقم بتهيئة المستودع** (لا تضع علامة على README أو .gitignore)
8. انقر على "Create repository"

## الخطوة 5: ربط المشروع المحلي بـ GitHub

بعد إنشاء المستودع على GitHub، ستظهر لك صفحة بها أوامر. استخدم الأوامر التالية:

### 5.1 إضافة Remote (استبدل YOUR_USERNAME و REPO_NAME بالقيم الصحيحة)
```powershell
git remote add origin https://github.com/YOUR_USERNAME/REPO_NAME.git
```

مثال:
```powershell
git remote add origin https://github.com/username/honey-bee-project.git
```

### 5.2 إعادة تسمية الفرع الرئيسي (إن لزم الأمر)
```powershell
git branch -M main
```

### 5.3 رفع المشروع إلى GitHub
```powershell
git push -u origin main
```

## الخطوة 6: إدخال بيانات الاعتماد

عند رفع المشروع لأول مرة، سيطلب منك:
- **Username**: اسم المستخدم على GitHub
- **Password**: استخدم Personal Access Token بدلاً من كلمة المرور

### إنشاء Personal Access Token:
1. اذهب إلى GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. انقر على "Generate new token (classic)"
3. اختر الصلاحيات المطلوبة (على الأقل: `repo`)
4. انسخ الرمز المميز واحفظه في مكان آمن
5. استخدم هذا الرمز ككلمة المرور عند الطلب

## ملاحظات مهمة:

- تأكد من أن ملف `.gitignore` موجود ويحتوي على `node_modules` و `dist`
- لا ترفع ملفات حساسة مثل `.env` أو مفاتيح API
- يمكنك التحقق من حالة Git في أي وقت باستخدام: `git status`
- لإضافة تغييرات لاحقة:
  ```powershell
  git add .
  git commit -m "وصف التغييرات"
  git push
  ```

## استكشاف الأخطاء:

### إذا ظهرت رسالة خطأ بخصوص المسار:
- استخدم المسار الكامل للمشروع
- أو انسخ المشروع إلى مجلد باسم إنجليزي

### إذا لم يتم التعرف على Git:
- تأكد من تثبيت Git
- أعد تشغيل PowerShell بعد التثبيت
- تحقق من أن Git موجود في PATH
