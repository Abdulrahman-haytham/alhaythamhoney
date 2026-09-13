import { marked } from 'marked';
import sanitizeHtml from 'sanitize-html';

/**
 * يحوّل جسم المقال (Markdown مع HTML بسيط) إلى HTML آمن للعرض.
 * التعقيم إلزامي حتى لو كان الكاتب هو الأدمن: يمنع أي سكربت أو حدث inline
 * قد يتسلل بالنسخ واللصق من محرّر خارجي.
 */
const ALLOWED_TAGS = [
  'h2',
  'h3',
  'h4',
  'p',
  'br',
  'hr',
  'strong',
  'b',
  'em',
  'i',
  'u',
  's',
  'mark',
  'blockquote',
  'ul',
  'ol',
  'li',
  'a',
  'img',
  'figure',
  'figcaption',
  'table',
  'thead',
  'tbody',
  'tr',
  'th',
  'td',
  'code',
  'pre',
  'span',
  'div',
];

marked.setOptions({ gfm: true, breaks: false });

export function renderMarkdown(source: string): string {
  // h1 محجوز لعنوان الصفحة — أي # في الجسم يُنزَّل إلى h2 حفاظاً على بنية SEO سليمة
  const html = marked.parse(source, { async: false }) as string;
  return sanitizeHtml(html.replace(/<(\/?)h1\b/g, '<$1h2'), {
    allowedTags: ALLOWED_TAGS,
    allowedAttributes: {
      a: ['href', 'title', 'target', 'rel'],
      img: ['src', 'alt', 'title', 'width', 'height', 'loading'],
      td: ['colspan', 'rowspan'],
      th: ['colspan', 'rowspan'],
      '*': ['dir'],
    },
    allowedSchemes: ['https', 'http', 'mailto', 'tel'],
    allowedSchemesByTag: { img: ['https', 'http'] },
    allowProtocolRelative: false,
    // الصور المحلية (/images و /uploads) تمرّ لأنها روابط نسبية بلا scheme
    transformTags: {
      a: (tagName, attribs) => {
        const external = /^https?:\/\//.test(attribs.href ?? '');
        return {
          tagName,
          attribs: external
            ? { ...attribs, target: '_blank', rel: 'noopener noreferrer' }
            : attribs,
        };
      },
      img: (tagName, attribs) => ({
        tagName,
        attribs: { ...attribs, loading: 'lazy' },
      }),
    },
  });
}

/** نصّ خام من HTML — لتقدير زمن القراءة والبحث. */
export function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[a-z#0-9]+;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}
