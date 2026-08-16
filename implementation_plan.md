# باك اب يومي تلقائي إلى Google Drive

## الوضع الحالي

النظام يستخدم بالفعل **spatie/laravel-backup** مع الإعدادات التالية:
- ✅ الجدولة موجودة في [console.php](file:///c:/laravelProjects/DentalCare/routes/console.php) — `backup:run` يوميًا الساعة 2:00 صباحاً
- ✅ تنظيف النسخ القديمة `backup:clean` يوميًا الساعة 3:00 صباحاً
- ✅ مراقبة صحة النسخ `backup:monitor` يوميًا الساعة 4:00 صباحاً
- ⚠️ وجهة الباك اب الحالية: **S3** (عبر `BACKUP_DISKS` env)، ولكن مفاتيح AWS فارغة فعليًا في `.env`
- ❌ لا يوجد disk لـ Google Drive في [filesystems.php](file:///c:/laravelProjects/DentalCare/config/filesystems.php)

## المطلوب

إضافة Google Drive كوجهة تخزين للباك اب اليومي بحيث:
1. تُرفع نسخة كاملة (قاعدة بيانات + ملفات) يوميًا إلى Google Drive الخاص بالمؤسسة
2. يعمل بجانب أي وجهة أخرى (S3) أو كبديل عنها

---

## الخطوات المطلوبة للتنفيذ

### الخطوة 1: إعداد Google Cloud Project و Service Account

> [!IMPORTANT]
> هذه الخطوة تُنفذ يدويًا في Google Cloud Console — لا تتعلق بالكود.

1. اذهب إلى [Google Cloud Console](https://console.cloud.google.com/)
2. أنشئ مشروع جديد أو استخدم مشروع قائم
3. فعّل **Google Drive API** من قسم APIs & Services → Library
4. أنشئ **Service Account** من قسم IAM & Admin → Service Accounts:
   - أعطه اسمًا مثل `prodentic-backup`
   - أنشئ مفتاح JSON (سيتم تنزيل ملف `.json`)
5. **شارك مجلد Google Drive** الخاص بالمؤسسة مع إيميل الـ Service Account (ستجده في ملف JSON بصيغة `xxx@xxx.iam.gserviceaccount.com`) بصلاحية **Editor**
6. انسخ **Folder ID** من رابط المجلد في Google Drive:
   - الرابط يكون بصيغة: `https://drive.google.com/drive/folders/FOLDER_ID_HERE`

### الخطوة 2: تثبيت Flysystem Google Drive Adapter

```bash
composer require masbug/flysystem-google-drive-ext
```

> [!NOTE]
> هذه الحزمة تدعم Laravel 10/11/12 وتوفر Flysystem v3 adapter لـ Google Drive.

---

### الخطوة 3: تغييرات في الكود

#### [MODIFY] [filesystems.php](file:///c:/laravelProjects/DentalCare/config/filesystems.php)

إضافة disk جديد باسم `google` في مصفوفة `disks`:

```php
'google' => [
    'driver' => 'google',
    'clientId' => env('GOOGLE_DRIVE_CLIENT_ID'),
    'clientSecret' => env('GOOGLE_DRIVE_CLIENT_SECRET'),
    'refreshToken' => env('GOOGLE_DRIVE_REFRESH_TOKEN'),
    'folder' => env('GOOGLE_DRIVE_FOLDER_ID'),
    // — أو باستخدام Service Account (الأفضل للسيرفرات) —
    // 'service_account_credentials_json' => storage_path('app/google/service-account.json'),
    // 'folder' => env('GOOGLE_DRIVE_FOLDER_ID'),
],
```

#### [NEW] [GoogleDriveServiceProvider.php](file:///c:/laravelProjects/DentalCare/app/Providers/GoogleDriveServiceProvider.php)

إنشاء Service Provider لتسجيل Google Drive driver مع Flysystem:

```php
// يقوم بتسجيل 'google' driver في Storage facade
// يستخدم Service Account credentials للمصادقة
```

#### [MODIFY] [.env](file:///c:/laravelProjects/DentalCare/.env)

إضافة متغيرات البيئة:

```env
# Google Drive Backup
GOOGLE_DRIVE_FOLDER_ID=your_folder_id_here
BACKUP_DISKS=google
```

#### [MODIFY] [backup.php](file:///c:/laravelProjects/DentalCare/config/backup.php) (لا تغيير مطلوب فعليًا)

الكونفق الحالي يقرأ `BACKUP_DISKS` من `.env` ديناميكيًا — فقط نضيف `google` في قيمة المتغير.

---

## User Review Required

> [!IMPORTANT]
> **اختيار طريقة المصادقة مع Google Drive:**
>
> | الطريقة | المميزات | العيوب |
> |---------|---------|--------|
> | **Service Account** (مُوصى بها) | لا تحتاج تفاعل مستخدم، مناسبة للسيرفرات، لا تنتهي صلاحيتها | تحتاج مشاركة المجلد مع إيميل الـ Service Account |
> | **OAuth2 Refresh Token** | تعمل مع حساب Google العادي | تحتاج إنشاء OAuth consent screen، قد تنتهي صلاحية الـ token |
>
> **الاقتراح:** استخدام **Service Account** لأنها الأنسب لعمليات الباك اب التلقائية على السيرفر.

> [!IMPORTANT]
> **هل تريد الاحتفاظ بـ S3 كوجهة إضافية أم الاعتماد على Google Drive فقط؟**
> - `BACKUP_DISKS=google` — Google Drive فقط
> - `BACKUP_DISKS=s3,google` — الاثنين معًا

> [!WARNING]
> **ملف Service Account JSON** يحتوي على مفاتيح حساسة. يجب:
> - عدم إضافته لـ Git (أضفه في `.gitignore`)
> - رفعه يدويًا على السيرفر في مسار `storage/app/google/service-account.json`

---

## Open Questions

> [!IMPORTANT]
> 1. **هل لديك حساب Google Workspace (مؤسسي) أم حساب Gmail عادي؟** — هذا يؤثر على طريقة الإعداد
> 2. **هل تفضل Service Account أم OAuth2؟** — أنصح بـ Service Account
> 3. **هل تريد حفظ النسخة على Google Drive فقط أم بالإضافة لـ S3؟**
> 4. **هل السيرفر الحالي عليه `cron` مُفعّل لـ Laravel Scheduler؟** — مطلوب لتشغيل الباك اب التلقائي

---

## Verification Plan

### Manual Verification
1. تشغيل `php artisan backup:run --only-db` يدويًا والتأكد من رفع الملف لـ Google Drive
2. تشغيل `php artisan backup:run` كاملًا والتأكد من وصول النسخة
3. التحقق من مجلد Google Drive أن الملفات موجودة بالتواريخ الصحيحة
4. تشغيل `php artisan backup:list` للتأكد من ظهور Google Drive كوجهة

### Cron Verification
```bash
# التأكد من أن cron مُعد على السيرفر
crontab -l
# يجب أن يحتوي على:
# * * * * * cd /path-to-project && php artisan schedule:run >> /dev/null 2>&1
```
