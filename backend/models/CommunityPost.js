import mongoose from 'mongoose';

// Sub-schema for individual comments to be embedded within posts
const commentSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // Establishes a relationship to the User collection
      required: true,
    },
    body: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000, // Enforces a reasonable limit to prevent database bloat
    },
    upvotes: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: 'User',
      default: [], // Stores IDs of users who upvoted (🤌🔥) this comment
    },
    downvotes: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: 'User',
      default: [], // Stores IDs of users who downvoted (🥀🧊) this comment
    },
    verified: {
      type: Boolean,
      default: false, // Moderators can mark a comment as the verified "top answer"
    },
  },
  { timestamps: true } // Automatically adds createdAt and updatedAt to each comment
);

// Main schema for a community question/post
const communityPostSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'], // Custom error message
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
      enum: ['answered', 'unanswered'], // Restricts values to only these two options
      default: 'unanswered',
    },
    answer: {
      type: String,
      default: null, // Stores the official/accepted answer text
    },
    upvotes: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: 'User',
      default: [], // Stores IDs of users who upvoted to prevent double-voting
    },
    comments: {
      type: [commentSchema], // Embeds the comment sub-schema defined above
      default: [],
    },
    embedding: {
      type: [Number], // Stores high-dimensional vector arrays for AI semantic search
      default: undefined,
      select: false, // EXCELLENT optimization: hides this heavy field from standard queries by default
    },
  },
  { timestamps: true }
);

// Creates a compound text index to enable traditional keyword-based MongoDB $text searches
communityPostSchema.index({ title: 'text', body: 'text' });

// Export the model, explicitly defining the target collection name ('yaksha_faq_communityposts')
export default mongoose.model('CommunityPost', communityPostSchema, 'yaksha_faq_communityposts');
