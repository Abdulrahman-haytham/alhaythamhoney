import { NextResponse } from 'next/server';

/** No stock ledger exists: do not collect emails for an availability promise. */
export async function POST() {
  return NextResponse.json(
    { error: 'يمكن الاستفسار عن المنتج مباشرة عبر واتساب.' },
    { status: 410 },
  );
}
