import FAQ from '../models/FAQ.js';

// GET /api/faq — All FAQs grouped by category
export const getAllFAQs = async (req, res) => {
  try {
    // 1. Fetch all FAQs, exclude heavy AI embeddings, and sort by category and date
    const faqs = await FAQ.find({}).select('-embedding').sort({ category: 1, createdAt: 1 });

    // 2. Group the flat array of FAQs into an object organized by category keys 
    // Example output: { 'Billing': [...], 'General': [...] }
    const grouped = faqs.reduce((acc, faq) => {
      // Initialize the category array if it doesn't exist yet
      if (!acc[faq.category]) acc[faq.category] = [];
      
      // Push the sanitized FAQ data into its respective category
      acc[faq.category].push({
        _id: faq._id,
        question: faq.question,
        answer: faq.answer,
        createdAt: faq.createdAt,
      });
      return acc;
    }, {});

    // 3. Return the grouped object and the total count
    res.json({ grouped, total: faqs.length });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// GET /api/faq/:id — Single FAQ
export const getFAQById = async (req, res) => {
  try {
    // 1. Fetch a specific FAQ by its ID, excluding embeddings
    const faq = await FAQ.findById(req.params.id).select('-embedding');
    
    // 2. Return a 404 error if no FAQ matches the ID
    if (!faq) return res.status(404).json({ message: 'FAQ not found.' });
    
    res.json(faq);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
