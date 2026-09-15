import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

/** نص نسخة سابقة — يُحمَّل عند الطلب فقط لأن الأجسام قد تكون كبيرة. */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string; revisionId: string }> },
) {
  // GET بلا Origin — يكفي التحقق من الجلسة (لا كتابة هنا)
  if (!(await requireAdmin())) return NextResponse.json({ error: 'غير مصرّح.' }, { status: 401 });
  const { id, revisionId } = await params;
  const revision = await db.articleRevision.findFirst({
    where: { id: revisionId, articleId: id },
    select: { title: true, body: true, createdAt: true },
  });
  if (!revision) return NextResponse.json({ error: 'النسخة غير موجودة.' }, { status: 404 });
  return NextResponse.json(revision);
}
