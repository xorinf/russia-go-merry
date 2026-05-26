import mongoose from 'mongoose';
import CommunityPost from '../models/CommunityPost.js';
import { generateEmbedding } from '../utils/embeddings.js';

const COLLECTION_NAME = CommunityPost.collection.name;
const RRF_K = 60;

function computeRRF(vectorResults, textResults) {
  const scores = new Map();

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
    .map((entry) => {
      entry.doc.rrfScore = entry.rrfScore;
      entry.doc.vectorScore = entry.vectorScore;
      entry.doc.textScore = entry.textScore;
      return entry.doc;
    });
}

async function runTextSearch(queryStr, limit = 10) {
  try {
    const db = mongoose.connection.db;
    const collection = db.collection(COLLECTION_NAME);

    return await collection
      .find(
        { $text: { $search: queryStr } },
        {
          projection: {
            score: { $meta: 'textScore' },
            title: 1,
            body: 1,
            author: 1,
            status: 1,
            answer: 1,
            createdAt: 1,
            updatedAt: 1,
          },
        }
      )
      .sort({ score: { $meta: 'textScore' } })
      .limit(limit)
      .toArray();
  } catch (error) {
    console.warn(`Text search on '${COLLECTION_NAME}' failed: ${error.message}`);
    return [];
  }
}

async function runVectorSearch(queryEmbedding, limit = 10) {
  try {
    const db = mongoose.connection.db;
    const collection = db.collection(COLLECTION_NAME);

    return await collection
      .aggregate([
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
            body: 1,
            author: 1,
            status: 1,
            answer: 1,
            createdAt: 1,
            updatedAt: 1,
            score: { $meta: 'vectorSearchScore' },
          },
        },
      ])
      .toArray();
  } catch (error) {
    console.warn(`Vector search on '${COLLECTION_NAME}' failed: ${error.message}`);
    return [];
  }
}

export const searchCommunityPosts = async (req, res) => {
  try {
    const q = String(req.query.q || '').trim();

    if (!q) {
      const posts = await CommunityPost.find({})
        .select('-embedding')
        .populate('author', 'name')
        .populate('comments.author', 'name')
        .sort({ createdAt: -1 })
        .limit(30);

      return res.json({ results: posts, total: posts.length, query: q });
    }

    const embedding = await generateEmbedding(q);

    const [vectorResults, textResults] = await Promise.all([
      runVectorSearch(embedding, 10),
      runTextSearch(q, 10),
    ]);

    const merged = computeRRF(vectorResults, textResults);

    const filtered = merged
      .filter((doc) => doc.textScore > 0 || doc.vectorScore > 0.8)
      .slice(0, 20);

    const ids = filtered.map((d) => d._id);
    const hydrated = await CommunityPost.find({ _id: { $in: ids } })
      .select('-embedding')
      .populate('author', 'name')
      .populate('comments.author', 'name');

    const hydratedMap = new Map(hydrated.map((doc) => [doc._id.toString(), doc]));

    const results = filtered
      .map((item) => {
        const doc = hydratedMap.get(item._id.toString());
        if (!doc) return null;
        return { ...doc.toObject(), score: item.rrfScore, source: 'community' };
      })
      .filter(Boolean);

    return res.json({ results, total: results.length, query: q });
  } catch (error) {
    res.status(500).json({ message: 'Search failed', error: error.message });
  }
};