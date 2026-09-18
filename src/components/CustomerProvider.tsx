'use client';

import { createContext, useContext, useEffect, useState } from 'react';

export interface CustomerPublic {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string | null;
}

const CustomerContext = createContext<CustomerPublic | null>(null);

/**
 * يوصل حساب الزبون الحالي (إن سجّل الدخول) إلى مكوّنات المتصفح.
 * الجلسة تُجلب من `/api/account/me` بعد التحميل لا من التخطيط الجذري: قراءة الكوكي
 * على الخادم تُخرج كل صفحات الموقع من التخزين المؤقت، وهو ثمن باهظ مقابل اسمٍ في الرأس.
 */
export function CustomerProvider({ children }: { children: React.ReactNode }) {
  const [customer, setCustomer] = useState<CustomerPublic | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    fetch('/api/account/me', { signal: controller.signal })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => setCustomer(data?.customer ?? null))
      .catch(() => null);
    return () => controller.abort();
  }, []);

  return <CustomerContext.Provider value={customer}>{children}</CustomerContext.Provider>;
}

export const useCustomer = () => useContext(CustomerContext);
