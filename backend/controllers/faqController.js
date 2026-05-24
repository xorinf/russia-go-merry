import FAQ from '../models/FAQ.js';

// GET /api/faq — All FAQs grouped by category
export const getAllFAQs = async (req, res) => {
  try {
    const faqs = await FAQ.find({}).select('-embedding').sort({ category: 1, createdAt: 1 });

    const grouped = faqs.reduce((acc, faq) => {
      if (!acc[faq.category]) acc[faq.category] = [];
      acc[faq.category].push({
        _id: faq._id,
        question: faq.question,
        answer: faq.answer,
        createdAt: faq.createdAt,
      });
      return acc;
    }, {});

    res.json({ grouped, total: faqs.length });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// GET /api/faq/:id — Single FAQ
export const getFAQById = async (req, res) => {
  try {
    const faq = await FAQ.findById(req.params.id).select('-embedding');
    if (!faq) return res.status(404).json({ message: 'FAQ not found.' });
    res.json(faq);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
