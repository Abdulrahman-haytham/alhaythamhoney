import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { guardAdmin } from '@/lib/admin-request';
import { readJson } from '@/lib/request-security';
import { articleInput } from '@/lib/validation';
import { ARTICLE_BODY_LIMIT, toArticleData } from '@/lib/articles.admin';

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
  const article = await db.article.findUnique({ where: { id }, select: { slug: true } });
  if (!article) return NextResponse.json({ error: 'المقال غير موجود.' }, { status: 404 });
  if (article.slug !== parsed.data.slug) {
    return NextResponse.json(
      { error: 'رابط المقال ثابت لحماية الروابط المنشورة ونتائج البحث.' },
      { status: 400 },
    );
  }
  await db.article.update({ where: { id }, data: toArticleData(parsed.data) });
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request, { params }: Ctx) {
  const denied = await guardAdmin(request);
  if (denied) return denied;
  const { id } = await params;
  const deleted = await db.article.deleteMany({ where: { id } });
  if (deleted.count === 0)
    return NextResponse.json({ error: 'المقال غير موجود.' }, { status: 404 });
  return NextResponse.json({ ok: true });
}
