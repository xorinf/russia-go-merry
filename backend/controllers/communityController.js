import CommunityPost from '../models/CommunityPost.js';
import { generateEmbedding } from '../utils/embeddings.js';

// GET /api/community — All posts
export const getAllPosts = async (req, res) => {
  try {
    // Fetch posts, exclude heavy AI embeddings, join author data, and sort newest first
    const posts = await CommunityPost.find({})
      .select('-embedding')
      .populate('author', 'name')
      .populate('comments.author', 'name')
      .sort({ createdAt: -1 });

    res.json({ posts, total: posts.length });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// GET /api/community/:id — Single post
export const getPostById = async (req, res) => {
  try {
    // Fetch specific post by ID, excluding embeddings and joining author data
    const post = await CommunityPost.findById(req.params.id)
      .select('-embedding')
      .populate('author', 'name')
      .populate('comments.author', 'name');

    if (!post) return res.status(404).json({ message: 'Post not found.' });
    res.json(post);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// POST /api/community — Create a new post (protected)
export const createPost = async (req, res) => {
  try {
    const { title, body } = req.body;

    // Validate inputs
    if (!title || !body) {
      return res.status(400).json({ message: 'Title and body are required.' });
    }

    // Generate vector embedding for semantic search
    let embedding;
    try {
      embedding = await generateEmbedding(`Question: ${title}. Description: ${body}`);
    } catch (err) {
      console.warn('Failed to generate embedding for post:', err.message);
    }

    // Create post linked to the authenticated user with a default 'unanswered' status
    const post = await CommunityPost.create({
      title,
      body,
      author: req.user._id,
      status: 'unanswered',
      embedding,
    });

    // Hydrate the author field before sending back the response
    await post.populate('author', 'name');

    res.status(201).json({ post });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// POST /api/community/:id/upvote — Toggle upvote
export const toggleUpvote = async (req, res) => {
  try {
    const post = await CommunityPost.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found.' });

    const userId = req.user._id.toString();
    
    // Check if the user has already upvoted the post
    const alreadyUpvoted = post.upvotes.map(u => u.toString()).includes(userId);

    // Toggle logic: remove user ID if already upvoted, otherwise push it to the array
    if (alreadyUpvoted) {
      post.upvotes = post.upvotes.filter(u => u.toString() !== userId);
    } else {
      post.upvotes.push(req.user._id);
    }

    await post.save();
    res.json({ upvotes: post.upvotes.length, upvotedByMe: !alreadyUpvoted });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// POST /api/community/:id/comments — Add a comment
export const addComment = async (req, res) => {
  try {
    const { body } = req.body;
    
    // Ensure the comment isn't empty or just whitespace
    if (!body || !body.trim()) {
      return res.status(400).json({ message: 'Comment body is required.' });
    }

    const post = await CommunityPost.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found.' });

    // Push the new comment to the array and save the post
    post.comments.push({ author: req.user._id, body: body.trim() });
    await post.save();

    // Hydrate the newly added comment's author data for the frontend
    await post.populate('comments.author', 'name');
    const newComment = post.comments[post.comments.length - 1];

    res.status(201).json({ comment: newComment, total: post.comments.length });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// PATCH /api/community/:id/resolve — Mark as answered (admin/moderator only)
export const resolvePost = async (req, res) => {
  try {
    const { answer } = req.body;
    
    // Require an official answer to close the thread
    if (!answer || !answer.trim()) {
      return res.status(400).json({ message: 'Answer text is required to resolve.' });
    }

    const post = await CommunityPost.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found.' });

    // Update thread status and attach the official answer
    post.status = 'answered';
    post.answer = answer.trim();
    await post.save();

    res.json({ message: 'Post resolved.', post });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// DELETE /api/community/:id — Delete a community post (Admin/Moderator only)
export const deletePost = async (req, res) => {
  try {
    const post = await CommunityPost.findByIdAndDelete(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found.' });
    res.json({ message: 'Post deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// POST /api/community/:id/comments/:commentId/upvote — Toggle 🤌🔥 upvote on a comment
export const toggleCommentUpvote = async (req, res) => {
  try {
    const post = await CommunityPost.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found.' });

    const comment = post.comments.id(req.params.commentId);
    if (!comment) return res.status(404).json({ message: 'Comment not found.' });

    const userId = req.user._id.toString();
    const alreadyUpvoted = comment.upvotes.map(u => u.toString()).includes(userId);

    if (alreadyUpvoted) {
      // Remove upvote
      comment.upvotes = comment.upvotes.filter(u => u.toString() !== userId);
    } else {
      // Add upvote, remove from downvotes if present
      comment.upvotes.push(req.user._id);
      comment.downvotes = comment.downvotes.filter(u => u.toString() !== userId);
    }

    await post.save();

    const netScore = comment.upvotes.length - comment.downvotes.length;
    res.json({
      upvotes: comment.upvotes.length,
      downvotes: comment.downvotes.length,
      netScore,
      upvotedByMe: !alreadyUpvoted,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// POST /api/community/:id/comments/:commentId/downvote — Toggle 🥀🧊 downvote on a comment
// When net score reaches -5, the comment is auto-deleted and { deleted: true } is returned
export const toggleCommentDownvote = async (req, res) => {
  try {
    const post = await CommunityPost.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found.' });

    const comment = post.comments.id(req.params.commentId);
    if (!comment) return res.status(404).json({ message: 'Comment not found.' });

    const userId = req.user._id.toString();
    const alreadyDownvoted = comment.downvotes.map(u => u.toString()).includes(userId);

    if (alreadyDownvoted) {
      // Remove downvote
      comment.downvotes = comment.downvotes.filter(u => u.toString() !== userId);
    } else {
      // Add downvote, remove from upvotes if present
      comment.downvotes.push(req.user._id);
      comment.upvotes = comment.upvotes.filter(u => u.toString() !== userId);
    }

    const netScore = comment.upvotes.length - comment.downvotes.length;

    // Auto-delete comment if net score reaches -5 (play Faah on frontend)
    if (netScore <= -5) {
      comment.deleteOne();
      await post.save();
      return res.json({
        deleted: true,
        message: 'Comment obliterated. Faah! 🥀',
      });
    }

    await post.save();

    res.json({
      upvotes: comment.upvotes.length,
      downvotes: comment.downvotes.length,
      netScore,
      downvotedByMe: !alreadyDownvoted,
      deleted: false,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// PATCH /api/community/:id/comments/:commentId/verify — Mark a comment as verified top answer
export const verifyComment = async (req, res) => {
  try {
    const post = await CommunityPost.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found.' });

    const comment = post.comments.id(req.params.commentId);
    if (!comment) return res.status(404).json({ message: 'Comment not found.' });

    // Toggle verified status
    comment.verified = !comment.verified;
    await post.save();

    res.json({ verified: comment.verified, commentId: req.params.commentId });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

