'use client';

import { createContext, useContext } from 'react';

export interface CustomerPublic {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string | null;
}

const CustomerContext = createContext<CustomerPublic | null>(null);

/** يوصل حساب الزبون الحالي (إن سجّل الدخول) إلى مكوّنات المتصفح. */
export function CustomerProvider({
  customer,
  children,
}: {
  customer: CustomerPublic | null;
  children: React.ReactNode;
}) {
  return <CustomerContext.Provider value={customer}>{children}</CustomerContext.Provider>;
}

export const useCustomer = () => useContext(CustomerContext);
