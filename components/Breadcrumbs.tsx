import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, Home } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items }) => {
  return (
    <nav aria-label="مسار التنقل" className="flex items-center gap-2 text-sm text-zinc-400 mb-8 overflow-x-auto whitespace-nowrap pb-2 scrollbar-hide">
      <Link
        to="/"
        className="flex items-center gap-1 hover:text-amber-500 transition-colors"
        aria-label="الصفحة الرئيسية"
      >
        <Home className="w-4 h-4" />
        <span className="sr-only">الرئيسية</span>
      </Link>

      {items.map((item, index) => (
        <React.Fragment key={index}>
          <ChevronLeft className="w-4 h-4 text-zinc-600 flex-shrink-0" aria-hidden="true" />
          {item.href ? (
            <Link
              to={item.href}
              className="hover:text-amber-500 transition-colors"
              aria-current={index === items.length - 1 ? 'page' : undefined}
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-zinc-200 font-medium" aria-current="page">
              {item.label}
            </span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};