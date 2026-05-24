import mongoose from 'mongoose';

const faqSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: [true, 'Question is required'],
      trim: true,
    },
    answer: {
      type: String,
      required: [true, 'Answer is required'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
    },
    embedding: {
      type: [Number],
      default: undefined,
      select: false,
    },
    searchCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

faqSchema.index({ question: 'text', answer: 'text' });

export default mongoose.model('FAQ', faqSchema, 'yaksha_faq_faqs');
