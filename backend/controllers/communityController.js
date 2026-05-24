import CommunityPost from '../models/CommunityPost.js';

// GET /api/community — All posts
export const getAllPosts = async (req, res) => {
  try {
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

    if (!title || !body) {
      return res.status(400).json({ message: 'Title and body are required.' });
    }

    const post = await CommunityPost.create({
      title,
      body,
      author: req.user._id,
      status: 'unanswered',
    });

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
    const alreadyUpvoted = post.upvotes.map(u => u.toString()).includes(userId);

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
    if (!body || !body.trim()) {
      return res.status(400).json({ message: 'Comment body is required.' });
    }

    const post = await CommunityPost.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found.' });

    post.comments.push({ author: req.user._id, body: body.trim() });
    await post.save();

    // Re-populate and return last comment
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
    if (!answer || !answer.trim()) {
      return res.status(400).json({ message: 'Answer text is required to resolve.' });
    }

    const post = await CommunityPost.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found.' });

    post.status = 'answered';
    post.answer = answer.trim();
    await post.save();

    res.json({ message: 'Post resolved.', post });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
