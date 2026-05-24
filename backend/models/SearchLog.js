import mongoose from 'mongoose';

// Schema designed to track user search behavior for analytics and trending topics
const searchLogSchema = new mongoose.Schema(
  {
    query: {
      type: String,
      required: true,
      trim: true, // The exact search term the user entered
    },
    resultsCount: {
      type: Number,
      default: 0, // Tracks how many items were returned (useful for spotting "dead end" searches)
    },
    topResultId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null, // Stores the ID of the highest-ranked result to measure click/relevance potential
    },
    topResultSource: {
      type: String,
      enum: ['faq', 'community', null], // Identifies whether the best answer came from official FAQs or user posts
      default: null,
    },
  },
  { timestamps: true } // Automatically records exactly when the search happened via 'createdAt'
);

// Export the model, explicitly defining the target collection name ('yaksha_faq_searchlogs')
export default mongoose.model('SearchLog', searchLogSchema, 'yaksha_faq_searchlogs');
