import FAQ from '../models/FAQ.js';
import { generateEmbedding } from '../utils/embeddings.js';

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

// POST /api/faq — Create a new FAQ (Admin/Moderator only)
export const createFAQ = async (req, res) => {
  try {
    const { question, answer, category } = req.body;

    if (!question || !answer || !category) {
      return res.status(400).json({ message: 'Question, answer, and category are required.' });
    }

    // Generate vector embedding for semantic search
    const embedding = await generateEmbedding(`Section: ${category}. Question: ${question}. Answer: ${answer}`);

    const faq = await FAQ.create({
      question,
      answer,
      category,
      embedding,
    });

    res.status(201).json({ message: 'FAQ created successfully.', faq });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// PUT /api/faq/:id — Update an FAQ (Admin/Moderator only)
export const updateFAQ = async (req, res) => {
  try {
    const { question, answer, category } = req.body;

    const faq = await FAQ.findById(req.params.id);
    if (!faq) {
      return res.status(404).json({ message: 'FAQ not found.' });
    }

    if (question) faq.question = question;
    if (answer) faq.answer = answer;
    if (category) faq.category = category;

    // Recalculate embedding if any key field is updated
    if (question || answer || category) {
      faq.embedding = await generateEmbedding(
        `Section: ${faq.category}. Question: ${faq.question}. Answer: ${faq.answer}`
      );
    }

    await faq.save();
    res.json({ message: 'FAQ updated successfully.', faq });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// DELETE /api/faq/:id — Delete an FAQ (Admin/Moderator only)
export const deleteFAQ = async (req, res) => {
  try {
    const faq = await FAQ.findByIdAndDelete(req.params.id);
    if (!faq) {
      return res.status(404).json({ message: 'FAQ not found.' });
    }
    res.json({ message: 'FAQ deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
