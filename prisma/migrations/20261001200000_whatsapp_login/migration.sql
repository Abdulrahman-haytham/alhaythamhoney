-- الدخول برمز على واتساب بدل البريد: رقم واتساب هو هوية الحساب، والبريد صار اختيارياً.

-- AlterTable
ALTER TABLE "customers" ADD COLUMN "whatsapp" TEXT;
ALTER TABLE "customers" ALTER COLUMN "email" DROP NOT NULL;

-- Backfill: الحسابات القائمة تدخل بهاتف التوصيل المسجّل إن كان خلوياً سورياً صالحاً.
-- رقم مكرّر بين حسابين يذهب للأقدم، ويبقى الآخر بالبريد (يُربط يدوياً عند الحاجة).
WITH digits AS (
    SELECT id, "createdAt", regexp_replace(regexp_replace(phone, '[^0-9]', '', 'g'), '^00', '') AS d
    FROM "customers"
), norm AS (
    SELECT id, "createdAt", CASE
        WHEN d ~ '^09[0-9]{8}$' THEN '963' || substr(d, 2)
        WHEN d ~ '^9[0-9]{8}$' THEN '963' || d
        WHEN d ~ '^9639[0-9]{8}$' THEN d
        WHEN d ~ '^96309[0-9]{8}$' THEN '963' || substr(d, 5)
    END AS wa
    FROM digits
), ranked AS (
    SELECT id, wa, row_number() OVER (PARTITION BY wa ORDER BY "createdAt", id) AS rn
    FROM norm WHERE wa IS NOT NULL
)
UPDATE "customers" c SET "whatsapp" = r.wa FROM ranked r WHERE c.id = r.id AND r.rn = 1;

-- CreateIndex
CREATE UNIQUE INDEX "customers_whatsapp_key" ON "customers"("whatsapp");

-- رموز الدخول القديمة كانت للبريد وصلاحيتها دقائق — لا شيء يستحق النقل
DELETE FROM "login_codes";
DROP INDEX "login_codes_email_createdAt_idx";
ALTER TABLE "login_codes" RENAME COLUMN "email" TO "phone";
CREATE INDEX "login_codes_phone_createdAt_idx" ON "login_codes"("phone", "createdAt");
