import SearchLog from '../models/SearchLog.js';

// GET /api/analytics — Fetch search log analytics (Admin/Moderator only)
export const getSearchAnalytics = async (req, res) => {
  try {
    // 1. Total searches count
    const totalSearches = await SearchLog.countDocuments();

    // 2. Aggregate popular queries
    const popularQueries = await SearchLog.aggregate([
      {
        $group: {
          _id: { $toLower: '$query' },
          count: { $sum: 1 },
          lastSearched: { $max: '$createdAt' },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 10 },
      {
        $project: {
          _id: 0,
          query: '$_id',
          count: 1,
          lastSearched: 1,
        },
      },
    ]);

    // 3. Aggregate failed queries (queries that yielded 0 results)
    const failedQueries = await SearchLog.aggregate([
      { $match: { resultsCount: 0 } },
      {
        $group: {
          _id: { $toLower: '$query' },
          count: { $sum: 1 },
          lastSearched: { $max: '$createdAt' },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 20 },
      {
        $project: {
          _id: 0,
          query: '$_id',
          count: 1,
          lastSearched: 1,
        },
      },
    ]);

    res.json({
      totalSearches,
      popularQueries,
      failedQueries,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
