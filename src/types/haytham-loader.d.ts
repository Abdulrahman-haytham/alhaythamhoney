import type { DetailedHTMLProps, HTMLAttributes } from 'react';

type HaythamLoaderElement = DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement> & {
  active?: boolean | '';
  overlay?: boolean | '';
  theme?: 'light' | 'dark';
  label?: string;
};

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'haytham-loader': HaythamLoaderElement;
    }
  }
}
