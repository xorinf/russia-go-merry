import React, { useState } from 'react';

const FAQItem = ({ question, answer }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-black/6 last:border-0">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-start justify-between gap-4 py-4 text-left group"
        aria-expanded={open}
      >
        <span className="text-sm font-medium text-ink group-hover:text-sage-700 transition-colors leading-snug">
          {question}
        </span>
        <span
          className={`flex-shrink-0 w-5 h-5 rounded-full border border-black/12
                      flex items-center justify-center text-ink/40
                      transition-transform duration-200 mt-0.5
                      ${open ? 'rotate-180 border-sage-300 text-sage-600' : ''}`}
        >
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </span>
      </button>

      {open && (
        <div className="pb-4 pr-9">
          <p className="text-sm text-ink/65 leading-relaxed whitespace-pre-line">
            {answer}
          </p>
        </div>
      )}
    </div>
  );
};

export default function FAQAccordion({ category, items }) {
  return (
    <div className="bg-white rounded-xl border border-black/6 shadow-card overflow-hidden">
      {/* Category header */}
      <div className="px-5 py-3 bg-mist border-b border-black/6">
        <h2 className="text-xs font-semibold text-ink/50 uppercase tracking-wider">
          {category}
        </h2>
      </div>

      {/* FAQ items */}
      <div className="px-5">
        {items.map((faq) => (
          <FAQItem key={faq._id} question={faq.question} answer={faq.answer} />
        ))}
      </div>
    </div>
  );
}
