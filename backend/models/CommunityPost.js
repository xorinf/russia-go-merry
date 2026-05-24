import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    body: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },
  },
  { timestamps: true }
);

const communityPostSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    body: {
      type: String,
      required: [true, 'Post body is required'],
      trim: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['answered', 'unanswered'],
      default: 'unanswered',
    },
    answer: {
      type: String,
      default: null,
    },
    upvotes: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: 'User',
      default: [],
    },
    comments: {
      type: [commentSchema],
      default: [],
    },
    embedding: {
      type: [Number],
      default: undefined,
      select: false,
    },
  },
  { timestamps: true }
);

communityPostSchema.index({ title: 'text', body: 'text' });

export default mongoose.model('CommunityPost', communityPostSchema, 'yaksha_faq_communityposts');
