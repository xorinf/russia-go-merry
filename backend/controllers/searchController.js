import mongoose from 'mongoose';
import SearchLog from '../models/SearchLog.js';
import { generateEmbedding } from '../utils/embeddings.js';
import { LRUCache } from 'lru-cache';

// Cache configuration: Store up to 500 recent queries for 1 hour to reduce DB/AI loads
const searchCache = new LRUCache({
  max: 500, 
  ttl: 1000 * 60 * 60, 
});

// Helper: Reciprocal Rank Fusion (RRF) algorithm to merge vector and keyword search results
// Formula: RRF_SCORE = 1 / (k + rank)
const RRF_K = 60;
function computeRRF(vectorResults, textResults) {
  const scores = new Map(); // Tracks unique documents by ID

  // Assign RRF scores based on ranking in Vector Search results
  vectorResults.forEach((doc, index) => {
    const id = doc._id.toString();
    const rank = index + 1;
    const rrfScore = 1 / (RRF_K + rank);
    scores.set(id, { doc, rrfScore, vectorScore: doc.score || 0, textScore: 0 });
  });

  // Assign and accumulate RRF scores based on ranking in Text Search results
  textResults.forEach((doc, index) => {
    const id = doc._id.toString();
    const rank = index + 1;
    const rrfScore = 1 / (RRF_K + rank);

    if (scores.has(id)) {
      const entry = scores.get(id);
      entry.rrfScore += rrfScore; // Boost score if found in both searches
      entry.textScore = doc.score || 0;
    } else {
      scores.set(id, { doc, rrfScore, vectorScore: 0, textScore: doc.score || 0 });
    }
  });

  // Convert map to array, sort by highest RRF score, and attach underlying scores for debugging
  return Array.from(scores.values())
    .sort((a, b) => b.rrfScore - a.rrfScore)
    .map(entry => {
      entry.doc.rrfScore = entry.rrfScore;
      entry.doc.vectorScore = entry.vectorScore;
      entry.doc.textScore = entry.textScore;
      return entry.doc;
    });
}

// Helper: Executes traditional MongoDB keyword search
const runTextSearch = async (collectionName, queryStr, limit = 5) => {
  try {
    const db = mongoose.connection.db;
    const collection = db.collection(collectionName);
    
    // Find documents matching text index, sort by native textScore
    return await collection.find(
      { $text: { $search: queryStr } },
      { projection: { score: { $meta: 'textScore' } } }
    )
    .sort({ score: { $meta: 'textScore' } })
    .limit(limit)
    .toArray();
  } catch (error) {
    // Fail gracefully if the text index hasn't been built yet
    console.warn(`Text search on '${collectionName}' failed: ${error.message}`);
    return [];
  }
};

// Helper: Executes MongoDB Atlas Vector Search (Semantic Search)
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
          numCandidates: limit * 10, // Over-fetch for better accuracy before limiting
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
          score: { $meta: 'vectorSearchScore' }, // Expose similarity score
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
 * Main Hybrid Search Controller
 */
export const semanticSearch = async (req, res) => {
  try {
    const { query } = req.body;

    if (!query) {
      return res.status(400).json({ message: 'query string is required.' });
    }
    
    const normalizedQuery = query.trim().toLowerCase();

    // 1. Check LRU Cache for immediate response
    if (searchCache.has(normalizedQuery)) {
      const cachedResults = searchCache.get(normalizedQuery);
      return res.json({ results: cachedResults, total: cachedResults.length, cached: true });
    }

    // 2. Compute AI Embedding for the search term
    const embedding = await generateEmbedding(query);

    // 3. Execute Vector and Text searches in parallel across both collections for maximum speed
    const [faqVec, commVec, faqTxt, commTxt] = await Promise.all([
      runVectorSearch('yaksha_faq_faqs', embedding, 5),
      runVectorSearch('yaksha_faq_communityposts', embedding, 5),
      runTextSearch('yaksha_faq_faqs', query, 5),
      runTextSearch('yaksha_faq_communityposts', query, 5)
    ]);
    
    // Tag results with their origin source (FAQ vs Community)
    const processResults = (results, source) => results.map(r => ({ ...r, source }));
    const allVec = [...processResults(faqVec, 'faq'), ...processResults(commVec, 'community')];
    const allTxt = [...processResults(faqTxt, 'faq'), ...processResults(commTxt, 'community')];

    // 4. Merge results using Reciprocal Rank Fusion
    const merged = computeRRF(allVec, allTxt);

    // 5. Apply threshold filters to remove irrelevant garbage results
    const filtered = merged.filter(doc => {
      if (doc.textScore > 0) return true; // Direct keyword matches are always kept
      return doc.vectorScore > 0.65;      // Semantic matches must hit a 65% similarity threshold
    }).slice(0, 5); // Return only the absolute top 5 results

    // 6. Save valid results to cache
    searchCache.set(normalizedQuery, filtered);

    // 7. Fire-and-forget: Log search analytics asynchronously (does not block response)
    const topResult = filtered[0] || null;
    SearchLog.create({
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
// Aggregates search logs to find the top 6 most popular queries
export const getTrending = async (req, res) => {
  try {
    const trending = await SearchLog.aggregate([
      {
        $group: {
          _id: { $toLower: '$query' }, // Group by case-insensitive query
          count: { $sum: 1 },          // Tally total searches
          lastSearched: { $max: '$createdAt' }, 
        },
      },
      { $sort: { count: -1 } }, // Sort by highest count first
      { $limit: 6 },            // Take top 6
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
