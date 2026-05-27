import React, { useMemo } from 'react';

/**
 * WordCloud — A minimal, interactive, pure-CSS word cloud component.
 * Renders words sized proportionally to their frequency count.
 * No external dependencies required.
 *
 * @param {{ words: Array<{query: string, count: number}>, onWordClick?: (query: string) => void, maxWords?: number }} props
 */
export default function WordCloud({ words = [], onWordClick, maxWords = 40 }) {
  // Precompute font sizes and colors
  const processedWords = useMemo(() => {
    if (!words.length) return [];

    const sorted = [...words]
      .sort((a, b) => b.count - a.count)
      .slice(0, maxWords);

    const maxCount = sorted[0]?.count || 1;
    const minCount = sorted[sorted.length - 1]?.count || 1;
    const range = maxCount - minCount || 1;

    // Color palette — earthy tones matching the design system
    const colors = [
      'var(--color-accent, #5A7A5A)',
      '#6B8F6B',
      '#8BA88B',
      '#4A6A4A',
      '#7C9A7C',
      '#3D5E3D',
      '#97B397',
      '#2F4F2F',
    ];

    // Slight random rotations for organic feel
    const rotations = [0, 0, 0, -8, 8, -4, 4, -12, 12];

    return sorted.map((word, i) => {
      const normalized = (word.count - minCount) / range; // 0..1
      const fontSize = 0.7 + normalized * 1.8; // 0.7rem to 2.5rem
      const opacity = 0.5 + normalized * 0.5;  // 0.5 to 1.0
      const color = colors[i % colors.length];
      const rotation = rotations[i % rotations.length];

      return {
        ...word,
        fontSize: `${fontSize}rem`,
        opacity,
        color,
        rotation,
        weight: normalized > 0.6 ? 700 : normalized > 0.3 ? 600 : 500,
      };
    });
  }, [words, maxWords]);

  if (!processedWords.length) {
    return (
      <div className="word-cloud-empty">
        <p className="text-xs text-ink-soft">No search data available yet.</p>
      </div>
    );
  }

  return (
    <div className="word-cloud" role="list" aria-label="Popular search queries word cloud">
      {processedWords.map((word, i) => (
        <button
          key={word.query + i}
          role="listitem"
          onClick={() => onWordClick?.(word.query)}
          className="word-cloud-item"
          style={{
            fontSize: word.fontSize,
            opacity: word.opacity,
            color: word.color,
            fontWeight: word.weight,
            '--rotation': `${word.rotation}deg`,
          }}
          title={`"${word.query}" — ${word.count} searches`}
        >
          {word.query}
        </button>
      ))}
    </div>
  );
}
