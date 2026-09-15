'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { REFERRAL_CODE_RE, REFERRAL_STORAGE_KEY } from '@/lib/loyalty';

/**
 * يلتقط ?ref=XXXXXX من أي رابط دعوة ويحفظه على الجهاز حتى يُرفق عند إنشاء الحساب لاحقاً
 * (الزائر قد يتصفح أياماً قبل أن يسجّل).
 */
export default function ReferralCapture() {
  const params = useSearchParams();
  const ref = params.get('ref');
  useEffect(() => {
    if (!ref) return;
    const code = ref.trim().toUpperCase();
    if (!REFERRAL_CODE_RE.test(code)) return;
    try {
      localStorage.setItem(REFERRAL_STORAGE_KEY, code);
    } catch {
      // التخزين قد يكون معطّلاً
    }
  }, [ref]);
  return null;
}

/** الرمز المحفوظ (إن وُجد) — يُقرأ عند التسجيل */
export function storedReferral(): string | null {
  try {
    const v = localStorage.getItem(REFERRAL_STORAGE_KEY);
    return v && REFERRAL_CODE_RE.test(v) ? v : null;
  } catch {
    return null;
  }
}

export function clearStoredReferral() {
  try {
    localStorage.removeItem(REFERRAL_STORAGE_KEY);
  } catch {
    // لا شيء
  }
}
