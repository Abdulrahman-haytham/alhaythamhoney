import { NextResponse } from 'next/server';
import { guardAdmin } from '@/lib/admin-request';
import { readJson } from '@/lib/request-security';
import { renderMarkdown } from '@/lib/markdown';
import { ARTICLE_BODY_LIMIT } from '@/lib/articles.admin';

/** معاينة حيّة في المحرّر: نفس مسار التصيير والتعقيم الذي يراه الزائر. */
export async function POST(request: Request) {
  const denied = await guardAdmin(request);
  if (denied) return denied;
  const data = await readJson(request, ARTICLE_BODY_LIMIT);
  const body = typeof data === 'object' && data && 'body' in data ? data.body : null;
  if (typeof body !== 'string') return NextResponse.json({ error: 'نص مفقود.' }, { status: 400 });
  return NextResponse.json({ html: renderMarkdown(body) });
}
