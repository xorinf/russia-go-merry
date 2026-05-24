import CommunityPost from '../models/CommunityPost.js';

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

    // Create post linked to the authenticated user with a default 'unanswered' status
    const post = await CommunityPost.create({
      title,
      body,
      author: req.user._id,
      status: 'unanswered',
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
