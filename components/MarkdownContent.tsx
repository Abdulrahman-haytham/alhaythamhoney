import React, { useEffect, useState } from 'react';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkHtml from 'remark-html';
import rehypeSanitize from 'rehype-sanitize';

interface MarkdownContentProps {
  content: string;
  className?: string;
}

export const MarkdownContent: React.FC<MarkdownContentProps> = ({ content, className = '' }) => {
  const [html, setHtml] = useState('');

  useEffect(() => {
    let mounted = true;

    async function renderMarkdown() {
      try {
        const result = await unified()
          .use(remarkParse)
          .use(remarkHtml)
          .use(rehypeSanitize)
          .process(content);

        if (mounted) {
          setHtml(result.toString());
        }
      } catch (error) {
        console.error('Error rendering markdown:', error);
        if (mounted) {
          setHtml(`<p class="text-red-400">خطأ في عرض المحتوى</p>`);
        }
      }
    }

    renderMarkdown();

    return () => {
      mounted = false;
    };
  }, [content]);

  return (
    <div
      className={`prose prose-invert max-w-none ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};
