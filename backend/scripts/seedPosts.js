import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { pipeline } from '@xenova/transformers';
import path from 'path';
import { fileURLToPath } from 'url';
import CommunityPost from '../models/CommunityPost.js';
import User from '../models/User.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const samplePosts = [
  {
    title: 'Do I need to attend all team standups?',
    body: 'My team has daily standups at 9 AM but my timezone makes it hard. Is attendance strictly mandatory?',
    status: 'answered',
    answer: 'Standups are generally expected unless you have a prior arrangement with your manager. Please discuss timezone accommodations directly with them.',
  },
  {
    title: 'Project documentation – is there a specific format required?',
    body: 'I want to start writing my project documentation. Is there a template I should follow?',
    status: 'unanswered',
    answer: null,
  },
  {
    title: 'Can I work on side features outside the assigned project scope?',
    body: 'I have some ideas that go beyond the current task. Should I implement them anyway?',
    status: 'answered',
    answer: 'Always complete your core tasks first. If you have bandwidth, discuss the side features with your mentor before starting them.',
  },
  {
    title: 'How to request time off during the internship?',
    body: 'I have a family event next month. What is the process for taking a few days off?',
    status: 'answered',
    answer: 'Submit a PTO request through the HR portal at least 2 weeks in advance and notify your direct manager.',
  },
  {
    title: 'When do we get access to the production servers?',
    body: 'I need to debug a live issue but I do not have SSH access to production yet.',
    status: 'unanswered',
    answer: null,
  }
];

async function seedPosts() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGODB_URI);
    
    let author = await User.findOne({ email: 'reg@yaksha.com' });
    if (!author) {
      author = await User.findOne();
    }
    
    if (!author) {
      console.log('No user found to act as author. Please run seed.js first.');
      process.exit(1);
    }

    console.log("Loading Xenova transformer model (all-MiniLM-L6-v2) for embeddings...");
    const extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');

    const docsToInsert = [];
    
    for (let i = 0; i < samplePosts.length; i++) {
      const post = samplePosts[i];
      const textToEmbed = `${post.title} ${post.body} ${post.answer || ''}`;
      
      const output = await extractor(textToEmbed, { pooling: 'mean', normalize: true });
      const embedding = Array.from(output.data);

      docsToInsert.push({
        ...post,
        author: author._id,
        embedding: embedding,
      });
      
      console.log(`Processed post: ${post.title}`);
    }

    await CommunityPost.insertMany(docsToInsert);
    console.log(`\nSuccessfully inserted ${docsToInsert.length} community posts into the database!`);
    
    process.exit(0);
  } catch (err) {
    console.error('Error seeding posts:', err);
    process.exit(1);
  }
}

seedPosts();
