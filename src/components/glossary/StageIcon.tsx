import { createElement } from 'react';
import { glossaryIconComponent } from '@/lib/glossary';

/** أيقونة المرحلة من مفتاحها المخزّن في القاعدة — BookOpen إن كان المفتاح فارغاً أو مجهولاً. */
export function StageIcon({
  icon,
  className = 'h-5 w-5',
}: {
  icon: string | null | undefined;
  className?: string;
}) {
  // createElement بدل <Icon/>: المكوّن مختار من خريطة ثابتة لا مُنشأ أثناء التصيير
  return createElement(glossaryIconComponent(icon), { className, 'aria-hidden': true });
}
