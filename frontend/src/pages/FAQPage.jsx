import React, { useEffect, useState } from 'react';
import Navbar from '../components/layout/Navbar';
import FAQAccordion from '../components/ui/FAQAccordion';
import api from '../utils/api';

export default function FAQPage() {
  const [grouped, setGrouped] = useState({});
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/faq')
      .then((res) => {
        setGrouped(res.data.grouped || {});
        setTotal(res.data.total || 0);
      })
      .catch(() => setError('Failed to load FAQs. Please try again.'))
      .finally(() => setLoading(false));
  }, []);

  const categories = Object.keys(grouped).sort();

  return (
    <div className="min-h-screen bg-cream">
      <Navbar />

      <main className="max-w-3xl mx-auto px-6 py-10">
        {/* Page header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-ink tracking-tight">
            Frequently Asked Questions
          </h1>
          {total > 0 && (
            <p className="mt-1.5 text-sm text-ink/45">{total} questions across {categories.length} categories</p>
          )}
        </div>

        {/* Loading skeleton */}
        {loading && (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-xl border border-black/6 shadow-card overflow-hidden animate-pulse">
                <div className="h-9 bg-mist" />
                <div className="p-5 space-y-3">
                  <div className="h-3 bg-mist rounded w-3/4" />
                  <div className="h-3 bg-mist rounded w-full" />
                  <div className="h-3 bg-mist rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="rounded-xl bg-red-50 border border-red-100 p-4 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* FAQ groups */}
        {!loading && !error && (
          <div className="space-y-4">
            {categories.length === 0 ? (
              <p className="text-center text-sm text-ink/40 py-16">No FAQs available yet.</p>
            ) : (
              categories.map((category) => (
                <FAQAccordion
                  key={category}
                  category={category}
                  items={grouped[category]}
                />
              ))
            )}
          </div>
        )}

        <div className="h-12" />
      </main>
    </div>
  );
}
