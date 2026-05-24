import mongoose from 'mongoose';
import SearchLog from '../models/SearchLog.js';
import { generateEmbedding } from '../utils/embeddings.js';
import { LRUCache } from 'lru-cache';

// Cache configuration
const searchCache = new LRUCache({
  max: 500, // store up to 500 queries
  ttl: 1000 * 60 * 60, // 1 hour
});

// Helper for Reciprocal Rank Fusion
// RRF_SCORE = 1 / (k + rank)
const RRF_K = 60;
function computeRRF(vectorResults, textResults) {
  const scores = new Map(); // id -> { doc, rrfScore, vectorScore, textScore }

  vectorResults.forEach((doc, index) => {
    const id = doc._id.toString();
    const rank = index + 1;
    const rrfScore = 1 / (RRF_K + rank);
    scores.set(id, { doc, rrfScore, vectorScore: doc.score || 0, textScore: 0 });
  });

  textResults.forEach((doc, index) => {
    const id = doc._id.toString();
    const rank = index + 1;
    const rrfScore = 1 / (RRF_K + rank);

    if (scores.has(id)) {
      const entry = scores.get(id);
      entry.rrfScore += rrfScore;
      entry.textScore = doc.score || 0;
    } else {
      scores.set(id, { doc, rrfScore, vectorScore: 0, textScore: doc.score || 0 });
    }
  });

  return Array.from(scores.values())
    .sort((a, b) => b.rrfScore - a.rrfScore)
    .map(entry => {
      // Add the scores back to the doc for debugging/thresholding
      entry.doc.rrfScore = entry.rrfScore;
      entry.doc.vectorScore = entry.vectorScore;
      entry.doc.textScore = entry.textScore;
      return entry.doc;
    });
}

const runTextSearch = async (collectionName, queryStr, limit = 5) => {
  try {
    const db = mongoose.connection.db;
    const collection = db.collection(collectionName);
    
    // Find documents matching the text query, sort by textScore
    return await collection.find(
      { $text: { $search: queryStr } },
      { projection: { score: { $meta: 'textScore' } } }
    )
    .sort({ score: { $meta: 'textScore' } })
    .limit(limit)
    .toArray();
  } catch (error) {
    // If text index doesn't exist yet, this will throw. We silently return [].
    console.warn(`Text search on '${collectionName}' failed: ${error.message}`);
    return [];
  }
};

const runVectorSearch = async (collectionName, queryEmbedding, limit = 5) => {
  try {
    const db = mongoose.connection.db;
    const collection = db.collection(collectionName);

    const pipeline = [
      {
        $vectorSearch: {
          index: 'vector_index',
          path: 'embedding',
          queryVector: queryEmbedding,
          numCandidates: limit * 10,
          limit,
        },
      },
      {
        $project: {
          _id: 1,
          title: 1,
          question: 1,
          answer: 1,
          body: 1,
          status: 1,
          category: 1,
          score: { $meta: 'vectorSearchScore' },
        },
      },
    ];

    return await collection.aggregate(pipeline).toArray();
  } catch (error) {
    console.warn(`Vector search on '${collectionName}' failed: ${error.message}`);
    return [];
  }
};

/**
 * POST /api/search
 * Body: { query: string }
 */
export const semanticSearch = async (req, res) => {
  try {
    const { query } = req.body;

    if (!query) {
      return res.status(400).json({ message: 'query string is required.' });
    }
    
    const normalizedQuery = query.trim().toLowerCase();

    // 1. Check Cache
    if (searchCache.has(normalizedQuery)) {
      const cachedResults = searchCache.get(normalizedQuery);
      return res.json({ results: cachedResults, total: cachedResults.length, cached: true });
    }

    // 2. Compute Embedding
    const embedding = await generateEmbedding(query);

    // 3. Parallel Vector + Text Search
    const [faqVec, commVec, faqTxt, commTxt] = await Promise.all([
      runVectorSearch('yaksha_faq_faqs', embedding, 5),
      runVectorSearch('yaksha_faq_communityposts', embedding, 5),
      runTextSearch('yaksha_faq_faqs', query, 5),
      runTextSearch('yaksha_faq_communityposts', query, 5)
    ]);
    
    // Tag sources
    const processResults = (results, source) => results.map(r => ({ ...r, source }));
    const allVec = [...processResults(faqVec, 'faq'), ...processResults(commVec, 'community')];
    const allTxt = [...processResults(faqTxt, 'faq'), ...processResults(commTxt, 'community')];

    // 4. RRF Fusion
    const merged = computeRRF(allVec, allTxt);

    // 5. Thresholding (Filter out garbage results where vector is too low and text is 0)
    const filtered = merged.filter(doc => {
      // If it's a good text match, keep it
      if (doc.textScore > 0) return true;
      // If no text match, require a minimum semantic similarity
      return doc.vectorScore > 0.80;
    }).slice(0, 5); // Return top 5

    // 6. Cache and Log
    searchCache.set(normalizedQuery, filtered);

    const topResult = filtered[0] || null;
    await SearchLog.create({
      query,
      resultsCount: filtered.length,
      topResultId: topResult?._id || null,
      topResultSource: topResult?.source || null,
    }).catch(() => {});

    res.json({ results: filtered, total: filtered.length, cached: false });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ message: 'Search failed', error: error.message });
  }
};

// GET /api/search/trending
export const getTrending = async (req, res) => {
  try {
    const trending = await SearchLog.aggregate([
      {
        $group: {
          _id: { $toLower: '$query' },
          count: { $sum: 1 },
          lastSearched: { $max: '$createdAt' },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 6 },
      {
        $project: {
          _id: 0,
          query: '$_id',
          count: 1,
          lastSearched: 1,
        },
      },
    ]);

    res.json({ trending });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
