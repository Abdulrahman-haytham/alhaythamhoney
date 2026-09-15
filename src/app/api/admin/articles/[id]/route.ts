import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { guardAdmin } from '@/lib/admin-request';
import { readJson } from '@/lib/request-security';
import { articleInput } from '@/lib/validation';
import { ARTICLE_BODY_LIMIT, REVISION_LIMIT, toArticleData } from '@/lib/articles.admin';
import { logAudit } from '@/lib/audit.server';

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Ctx) {
  const denied = await guardAdmin(request);
  if (denied) return denied;
  const parsed = articleInput.safeParse(await readJson(request, ARTICLE_BODY_LIMIT));
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || 'تحقق من الحقول.' },
      { status: 400 },
    );
  }
  const { id } = await params;
  const article = await db.article.findUnique({
    where: { id },
    include: { products: { select: { id: true } } },
  });
  if (!article) return NextResponse.json({ error: 'المقال غير موجود.' }, { status: 404 });
  if (article.slug !== parsed.data.slug) {
    return NextResponse.json(
      { error: 'رابط المقال ثابت لحماية الروابط المنشورة ونتائج البحث.' },
      { status: 400 },
    );
  }
  const data = toArticleData(parsed.data);
  const contentChanged = article.title !== data.title || article.body !== data.body;
  const updated = await db.$transaction(async (tx) => {
    // نسخة سابقة تُحفظ قبل الكتابة فوقها — للاستعادة عند الخطأ (آخر REVISION_LIMIT فقط)
    if (contentChanged) {
      await tx.articleRevision.create({
        data: { articleId: id, title: article.title, body: article.body },
      });
      const stale = await tx.articleRevision.findMany({
        where: { articleId: id },
        orderBy: { createdAt: 'desc' },
        skip: REVISION_LIMIT,
        select: { id: true },
      });
      if (stale.length)
        await tx.articleRevision.deleteMany({ where: { id: { in: stale.map((r) => r.id) } } });
    }
    return tx.article.update({
      where: { id },
      data,
      include: { products: { select: { id: true } } },
    });
  });
  await logAudit({
    entity: 'article',
    entityId: id,
    action: 'update',
    label: updated.title,
    before: { ...article, products: article.products.map((p) => p.id) },
    after: { ...updated, products: updated.products.map((p) => p.id) },
  });
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request, { params }: Ctx) {
  const denied = await guardAdmin(request);
  if (denied) return denied;
  const { id } = await params;
  const existing = await db.article.findUnique({ where: { id }, select: { title: true } });
  const deleted = await db.article.deleteMany({ where: { id } });
  if (deleted.count === 0)
    return NextResponse.json({ error: 'المقال غير موجود.' }, { status: 404 });
  await logAudit({ entity: 'article', entityId: id, action: 'delete', label: existing?.title });
  return NextResponse.json({ ok: true });
}
