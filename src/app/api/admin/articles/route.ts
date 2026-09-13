import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { db } from '@/lib/db';
import { guardAdmin } from '@/lib/admin-request';
import { readJson } from '@/lib/request-security';
import { articleInput } from '@/lib/validation';
import { ARTICLE_BODY_LIMIT, toArticleData } from '@/lib/articles.admin';

export async function POST(request: Request) {
  const denied = await guardAdmin(request);
  if (denied) return denied;
  const parsed = articleInput.safeParse(await readJson(request, ARTICLE_BODY_LIMIT));
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || 'تحقق من الحقول.' },
      { status: 400 },
    );
  }
  try {
    const article = await db.article.create({ data: toArticleData(parsed.data) });
    return NextResponse.json({ id: article.id }, { status: 201 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return NextResponse.json({ error: 'رابط المقال مستخدم بالفعل.' }, { status: 409 });
    }
    throw error;
  }
}
