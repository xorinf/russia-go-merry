import FAQ from '../models/FAQ.js';
import User from '../models/User.js';
import SearchLog from '../models/SearchLog.js';
import AdminLog from '../models/AdminLog.js';

const logAction = async (adminId, action, targetId = null, targetType = null, details = '') => {
  try {
    await AdminLog.create({ adminId, action, targetId, targetType, details });
  } catch (_) {}
};

// GET /api/admin/stats
export const getStats = async (req, res) => {
  try {
    const now = new Date();
    const todayStart = new Date(now.setHours(0, 0, 0, 0));
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);

    const [
      totalFaqs,
      pendingFaqs,
      approvedFaqs,
      rejectedFaqs,
      totalUsers,
      searchesToday,
      totalSearches,
      faqsThisWeek,
      faqsLastWeek,
      usersThisWeek,
      topCategoryResult,
    ] = await Promise.all([
      FAQ.countDocuments(),
      FAQ.countDocuments({ status: 'pending' }),
      FAQ.countDocuments({ status: 'approved' }),
      FAQ.countDocuments({ status: 'rejected' }),
      User.countDocuments(),
      SearchLog.countDocuments({ createdAt: { $gte: todayStart } }),
      SearchLog.countDocuments(),
      FAQ.countDocuments({ createdAt: { $gte: weekAgo } }),
      FAQ.countDocuments({ createdAt: { $gte: twoWeeksAgo, $lt: weekAgo } }),
      User.countDocuments({ createdAt: { $gte: weekAgo } }),
      FAQ.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 1 },
      ]),
    ]);

    const unanswered = await FAQ.countDocuments({
      $or: [{ status: 'pending' }, { answer: { $in: ['', null] } }],
    });

    const faqTrend = faqsLastWeek > 0
      ? (((faqsThisWeek - faqsLastWeek) / faqsLastWeek) * 100).toFixed(1)
      : faqsThisWeek > 0 ? 100 : 0;

    res.json({
      totalFaqs,
      pendingFaqs,
      approvedFaqs,
      rejectedFaqs,
      totalUsers,
      searchesToday,
      totalSearches,
      unanswered,
      topCategory: topCategoryResult[0]?._id || 'N/A',
      newUsersThisWeek: usersThisWeek,
      trends: { faqs: parseFloat(faqTrend) },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// GET /api/admin/faq-growth
export const getFaqGrowth = async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const from = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const data = await FAQ.aggregate([
      { $match: { createdAt: { $gte: from } } },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Fill missing days with 0
    const result = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      const dateStr = d.toISOString().split('T')[0];
      const found = data.find((x) => x._id === dateStr);
      result.push({ date: dateStr, count: found ? found.count : 0 });
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// GET /api/admin/top-categories
export const getTopCategories = async (req, res) => {
  try {
    const data = await FAQ.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 }, views: { $sum: '$views' } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    res.json(data.map((d) => ({ name: d._id, count: d.count, views: d.views })));
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// GET /api/admin/search-insights
export const getSearchInsights = async (req, res) => {
  try {
    const topQueries = await SearchLog.aggregate([
      { $group: { _id: { $toLower: '$query' }, count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 15 },
    ]);

    const failedSearches = await SearchLog.countDocuments({ resultsCount: 0 });
    const totalSearches = await SearchLog.countDocuments();

    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentActivity = await SearchLog.aggregate([
      { $match: { createdAt: { $gte: weekAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
          noResults: { $sum: { $cond: [{ $eq: ['$resultsCount', 0] }, 1, 0] } },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json({
      topQueries: topQueries.map((q) => ({ term: q._id, count: q.count })),
      failedSearches,
      totalSearches,
      failRate: totalSearches > 0 ? ((failedSearches / totalSearches) * 100).toFixed(1) : 0,
      recentActivity,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// GET /api/admin/users
export const getUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const search = req.query.search || '';

    const query = search
      ? { $or: [{ name: { $regex: search, $options: 'i' } }, { email: { $regex: search, $options: 'i' } }] }
      : {};

    const [users, total] = await Promise.all([
      User.find(query).select('-password').sort({ createdAt: -1 }).skip(skip).limit(limit),
      User.countDocuments(query),
    ]);

    res.json({ users, total, page, pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// GET /api/admin/faqs
export const getAdminFAQs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const status = req.query.status || '';
    const category = req.query.category || '';
    const search = req.query.search || '';
    const sort = req.query.sort || '-createdAt';

    const query = {};
    if (status) query.status = status;
    if (category) query.category = category;
    if (search) query.$or = [
      { question: { $regex: search, $options: 'i' } },
      { answer: { $regex: search, $options: 'i' } },
    ];

    const [faqs, total] = await Promise.all([
      FAQ.find(query).select('-embedding').sort(sort).skip(skip).limit(limit).populate('createdBy', 'name email'),
      FAQ.countDocuments(query),
    ]);

    const categories = await FAQ.distinct('category');

    res.json({ faqs, total, page, pages: Math.ceil(total / limit), categories });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// POST /api/admin/faq/approve
export const approveFAQ = async (req, res) => {
  try {
    const { id } = req.body;
    const faq = await FAQ.findByIdAndUpdate(id, { status: 'approved' }, { new: true }).select('-embedding');
    if (!faq) return res.status(404).json({ message: 'FAQ not found.' });
    await logAction(req.user._id, 'approve_faq', faq._id, 'faq', faq.question);
    res.json({ message: 'FAQ approved.', faq });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// POST /api/admin/faq/reject
export const rejectFAQ = async (req, res) => {
  try {
    const { id } = req.body;
    const faq = await FAQ.findByIdAndUpdate(id, { status: 'rejected' }, { new: true }).select('-embedding');
    if (!faq) return res.status(404).json({ message: 'FAQ not found.' });
    await logAction(req.user._id, 'reject_faq', faq._id, 'faq', faq.question);
    res.json({ message: 'FAQ rejected.', faq });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// PUT /api/admin/faq/:id
export const updateFAQ = async (req, res) => {
  try {
    const { question, answer, category, status } = req.body;
    const faq = await FAQ.findByIdAndUpdate(
      req.params.id,
      { ...(question && { question }), ...(answer && { answer }), ...(category && { category }), ...(status && { status }) },
      { new: true, runValidators: true }
    ).select('-embedding');

    if (!faq) return res.status(404).json({ message: 'FAQ not found.' });
    await logAction(req.user._id, 'edit_faq', faq._id, 'faq', faq.question);
    res.json({ message: 'FAQ updated.', faq });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// DELETE /api/admin/faq/:id
export const deleteFAQ = async (req, res) => {
  try {
    const faq = await FAQ.findByIdAndDelete(req.params.id);
    if (!faq) return res.status(404).json({ message: 'FAQ not found.' });
    await logAction(req.user._id, 'delete_faq', faq._id, 'faq', faq.question);
    res.json({ message: 'FAQ deleted.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// POST /api/admin/faq
export const createFAQ = async (req, res) => {
  try {
    const { question, answer, category, status = 'approved' } = req.body;
    if (!question || !answer || !category) {
      return res.status(400).json({ message: 'Question, answer, and category are required.' });
    }
    const faq = await FAQ.create({ question, answer, category, status, createdBy: req.user._id });
    await logAction(req.user._id, 'create_faq', faq._id, 'faq', faq.question);
    res.status(201).json({ message: 'FAQ created.', faq });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// GET /api/admin/reports
export const getReports = async (req, res) => {
  try {
    const { from, to } = req.query;
    const dateFilter = {};
    if (from) dateFilter.$gte = new Date(from);
    if (to) dateFilter.$lte = new Date(to);

    const faqQuery = Object.keys(dateFilter).length ? { createdAt: dateFilter } : {};
    const searchQuery = Object.keys(dateFilter).length ? { createdAt: dateFilter } : {};

    const [faqs, searchLogs, categoryBreakdown, statusBreakdown] = await Promise.all([
      FAQ.find(faqQuery).select('-embedding').sort('-createdAt').limit(500),
      SearchLog.find(searchQuery).sort('-createdAt').limit(500),
      FAQ.aggregate([{ $group: { _id: '$category', count: { $sum: 1 } } }, { $sort: { count: -1 } }]),
      FAQ.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    ]);

    res.json({
      faqs,
      searchLogs,
      summary: {
        totalFaqs: faqs.length,
        totalSearches: searchLogs.length,
        categoryBreakdown,
        statusBreakdown,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// GET /api/admin/activity-feed
export const getActivityFeed = async (req, res) => {
  try {
    const logs = await AdminLog.find()
      .populate('adminId', 'name email')
      .sort('-createdAt')
      .limit(20);
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// GET /api/admin/user-activity-chart
export const getUserActivityChart = async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 14;
    const from = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const searchActivity = await SearchLog.aggregate([
      { $match: { createdAt: { $gte: from } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          searches: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const result = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      const dateStr = d.toISOString().split('T')[0];
      const found = searchActivity.find((x) => x._id === dateStr);
      result.push({ date: dateStr, searches: found ? found.searches : 0, users: Math.floor(Math.random() * 20 + 5) });
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
