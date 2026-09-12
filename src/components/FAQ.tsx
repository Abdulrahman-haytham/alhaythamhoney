'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { FAQ_ITEMS, type FAQItem } from '@/lib/faq';

/** يحوّل `**…**` إلى تمييز ذهبي و`_…_` إلى مائل — التنسيق الوحيد الذي تحتاجه الإجابات. */
function renderInline(text: string) {
  return text.split(/(\*\*.+?\*\*|_.+?_)/g).map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} className="text-amber-500 font-bold">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith('_') && part.endsWith('_')) {
      return (
        <em key={i} className="text-zinc-300">
          {part.slice(1, -1)}
        </em>
      );
    }
    return part;
  });
}

function Answer({ item }: { item: FAQItem }) {
  return (
    <>
      {item.answer && <p>{renderInline(item.answer)}</p>}
      {item.bullets && (
        <ul className={`list-disc list-inside space-y-2 text-zinc-400 marker:text-amber-500 ${item.answer ? 'mt-3' : ''}`}>
          {item.bullets.map((b) => (
            <li key={b}>{b}</li>
          ))}
        </ul>
      )}
    </>
  );
}

interface FAQProps {
  limit?: number;
  /** الصفحة المستقلة تجعل العنوان h1؛ الصفحة الرئيسية تبقيه h2. */
  headingLevel?: 'h1' | 'h2';
}

export default function FAQ({ limit, headingLevel = 'h2' }: FAQProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const Heading = headingLevel;

  const toggleIndex = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  const displayedFAQ = limit ? FAQ_ITEMS.slice(0, limit) : FAQ_ITEMS;

  return (
    <section className="py-16 px-4 bg-zinc-950">
      <div className="container mx-auto max-w-3xl">
        <div className="text-center mb-12">
          <Heading className="text-3xl md:text-4xl font-amiri font-bold text-white mb-4">الأسئلة الشائعة</Heading>
          <div className="w-16 h-1 bg-amber-500 mx-auto rounded-full mb-6"></div>
          <p className="text-zinc-400 max-w-2xl mx-auto leading-relaxed text-lg">
            كل ما تحتاج معرفته عن العسل الطبيعي ومنتجات النحل — <span className="text-amber-500">بثقة، ووعي، ومسؤولية.</span>
          </p>
        </div>

        <div className="space-y-4 mb-8">
          {displayedFAQ.map((item, index) => (
            <div key={index} className="border border-zinc-800 rounded-xl overflow-hidden bg-zinc-900/30">
              <button
                onClick={() => toggleIndex(index)}
                className="w-full flex items-center justify-between p-5 text-right hover:bg-zinc-900/50 transition-colors focus:outline-none min-h-[60px]"
                aria-expanded={activeIndex === index}
              >
                <span className="font-bold text-zinc-100 text-lg">{item.question}</span>
                <ChevronDown
                  className={`w-6 h-6 text-amber-500 transition-transform duration-300 flex-shrink-0 ${
                    activeIndex === index ? 'rotate-180' : ''
                  }`}
                />
              </button>

              <AnimatePresence>
                {activeIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="p-5 pt-0 text-zinc-400 leading-relaxed border-t border-zinc-800/50">
                      <Answer item={item} />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>

        {limit && (
          <div className="text-center">
            <Link
              href="/faq"
              className="inline-flex items-center gap-2 text-amber-500 hover:text-amber-400 font-bold transition-colors"
            >
              عرض كل الأسئلة
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
