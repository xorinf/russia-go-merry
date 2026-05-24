import mongoose from 'mongoose';
import dotenv from 'dotenv';
import CommunityPost from '../models/CommunityPost.js';
import User from '../models/User.js';

dotenv.config();

async function addCommunityPost() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find our test user
    let author = await User.findOne({ email: 'reg@yaksha.com' });
    if (!author) {
      author = await User.findOne(); // fallback to any user
    }

    if (!author) {
      console.log('No user found to set as author.');
      process.exit(1);
    }

    const newPost = await CommunityPost.create({
      title: 'Welcome to the Yaksha Community Board! 🎉',
      body: 'Hello everyone! I just wanted to test out the live deployment. Feel free to ask any internship-related questions here, and the community will help you out!',
      author: author._id,
      status: 'answered',
      answer: 'Thanks for stopping by! The deployment looks great. - Admin',
    });

    console.log('Successfully added new community post:', newPost.title);
    process.exit(0);
  } catch (err) {
    console.error('Failed to add post:', err);
    process.exit(1);
  }
}

addCommunityPost();
