import mongoose from 'mongoose';

const searchLogSchema = new mongoose.Schema(
  {
    query: {
      type: String,
      required: true,
      trim: true,
    },
    resultsCount: {
      type: Number,
      default: 0,
    },
    topResultId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    topResultSource: {
      type: String,
      enum: ['faq', 'community', null],
      default: null,
    },
  },
  { timestamps: true }
);

export default mongoose.model('SearchLog', searchLogSchema, 'yaksha_faq_searchlogs');
