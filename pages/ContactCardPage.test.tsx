import { describe, it, expect, vi, beforeAll } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { ContactCardPage } from './ContactCardPage';
import { CONTACTS } from '../data/contacts';

const renderAt = (path: string) =>
  render(
    <HelmetProvider>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="/q/:slug" element={<ContactCardPage />} />
        </Routes>
      </MemoryRouter>
    </HelmetProvider>
  );

describe('ContactCardPage', () => {
  beforeAll(() => {
    URL.createObjectURL = vi.fn(() => 'blob:vcard');
    URL.revokeObjectURL = vi.fn();
  });

  it('renders the contact card for a known slug', () => {
    renderAt('/q/haytham');
    expect(screen.getByRole('heading', { name: CONTACTS.haytham.nameAr })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /أضف جهة الاتصال/ })).toBeInTheDocument();
    expect(screen.getByText(CONTACTS.haytham.phone)).toBeInTheDocument();
  });

  it('downloads a .vcf file when the add-contact button is clicked', () => {
    const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
    renderAt('/q/haytham');

    fireEvent.click(screen.getByRole('button', { name: /أضف جهة الاتصال/ }));

    expect(URL.createObjectURL).toHaveBeenCalledOnce();
    const blob = (URL.createObjectURL as ReturnType<typeof vi.fn>).mock.calls[0][0] as Blob;
    expect(blob.type).toBe('text/vcard;charset=utf-8');
    expect(clickSpy).toHaveBeenCalledOnce();
    clickSpy.mockRestore();
  });

  it('shows a friendly 404 for an unknown slug', () => {
    renderAt('/q/unknown');
    expect(screen.getByText(/هذه البطاقة غير موجودة/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /الانتقال إلى الموقع/ })).toBeInTheDocument();
  });
});
