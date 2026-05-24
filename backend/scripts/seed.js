import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { pipeline } from '@xenova/transformers';
import FAQ from '../models/FAQ.js';
import User from '../models/User.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("ERROR: MONGODB_URI not found in .env");
  process.exit(1);
}

const seed = async () => {
  try {
    console.log("Connecting to MongoDB Atlas...");
    await mongoose.connect(MONGODB_URI);
    
    // Seed Users
    console.log("[1/2] Seeding users...");
    await User.deleteMany();
    const users = [
      {
        name: "Test User",
        email: "user@yaksha.com",
        password: "password123", // Pre-save hook will hash this
        role: "user",
      },
      {
        name: "Admin User",
        email: "admin@yaksha.com",
        password: "admin123",
        role: "admin",
      },
    ];
    await User.create(users);
    console.log("  ✓ Inserted users");

    // Seed FAQs
    console.log("[2/2] Generating FAQ embeddings and seeding...");
    await FAQ.deleteMany();

    const faqFilePath = path.join(__dirname, '..', '..', 'samagama_faq.json');
    const faqDataRaw = await fs.readFile(faqFilePath, 'utf-8');
    const faqData = JSON.parse(faqDataRaw);

    console.log("Loading Xenova transformer model (all-MiniLM-L6-v2)...");
    const extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');

    const docs = [];
    for (let i = 0; i < faqData.faqs.length; i++) {
      const faq = faqData.faqs[i];
      const text = `${faq.question} ${faq.answer}`;
      
      // Generate embedding
      const output = await extractor(text, { pooling: 'mean', normalize: true });
      const embedding = Array.from(output.data);

      docs.push({
        question: faq.question,
        answer: faq.answer,
        category: faq.section,
        embedding: embedding,
        searchCount: 0,
      });

      if ((i + 1) % 10 === 0) {
        console.log(`  Processed ${i + 1} / ${faqData.faqs.length} FAQs`);
      }
    }

    await FAQ.insertMany(docs);
    console.log(`  ✓ Inserted ${docs.length} FAQs with embeddings`);

    console.log("Seeding complete!");
    process.exit(0);
  } catch (error) {
    console.error("Error during seeding:", error);
    process.exit(1);
  }
};

seed();
