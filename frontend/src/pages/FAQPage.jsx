import React, { useEffect, useState } from 'react';
import Navbar from '../components/layout/Navbar';
import FAQAccordion from '../components/ui/FAQAccordion';
import { FAQDoodles } from '../components/ui/PageDoodles';
import api from '../utils/api';

export default function FAQPage() {
  // State management for API data, loading status, and potential errors
  const [grouped, setGrouped] = useState({});
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch the pre-grouped FAQs from the backend as soon as the page loads
  useEffect(() => {
    api.get('/faq')
      .then((res) => {
        setGrouped(res.data.grouped || {});
        setTotal(res.data.total || 0);
      })
      .catch(() => setError('Failed to load FAQs. Please try again.'))
      .finally(() => setLoading(false));
  }, []);

  // Extract and alphabetically sort the category names to use as keys and section headers
  const categories = Object.keys(grouped).sort();

  return (
    <div className="min-h-screen bg-bg grid-bg relative">
      <FAQDoodles />
      <Navbar />

      <main className="max-w-3xl mx-auto px-6 pt-24 pb-10 relative z-10">
        
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-serif text-ink tracking-tight">
            Frequently Asked Questions
          </h1>
          {total > 0 && (
            <p className="mt-1.5 text-sm text-ink-soft">{total} questions across {categories.length} categories</p>
          )}
        </div>

        {/* Loading Skeleton */}
        {loading && (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-card rounded-2xl border border-border shadow-subtle overflow-hidden animate-pulse">
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

        {/* Error State */}
        {error && (
          <div className="rounded-2xl bg-danger-light border border-danger/15 p-4 text-sm text-danger">
            {error}
          </div>
        )}

        {/* Main Content */}
        {!loading && !error && (
          <div className="space-y-4">
            {categories.length === 0 ? (
              // Empty state if the database has no FAQs
              <p className="text-center text-sm text-ink-soft py-16">No FAQs available yet.</p>
            ) : (
              // Render a grouped accordion for each category
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
