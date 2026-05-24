import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import FAQ from '../models/FAQ.js';
import User from '../models/User.js';
import { generateEmbedding } from '../utils/embeddings.js';

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
    await User.create([
      { name: "Test User", email: "user@yaksha.com", password: "password123", role: "user" },
      { name: "Admin User", email: "admin@yaksha.com", password: "admin123", role: "admin" },
    ]);
    console.log("  ✓ Inserted users");

    // Seed FAQs
    console.log("[2/2] Generating FAQ embeddings and seeding...");
    await FAQ.deleteMany();

    const faqFilePath = path.join(__dirname, '..', '..', 'samagama_faq.json');
    const faqDataRaw = await fs.readFile(faqFilePath, 'utf-8');
    const faqData = JSON.parse(faqDataRaw);

    
    // Use flat faqs array directly
    const allFaqs = faqData.faqs.map(faq => ({
      question: faq.question,
      answer: faq.answer,
      category: faq.section,
    }));

    console.log(`Found ${allFaqs.length} FAQs. Generating embeddings...`);

    const docs = [];
    for (let i = 0; i < allFaqs.length; i++) {
      const faq = allFaqs[i];
      
      const embedding = await generateEmbedding(`Section: ${faq.category}. Question: ${faq.question}. Answer: ${faq.answer}`);

      docs.push({
        question: faq.question,
        answer: faq.answer,
        category: faq.category,
        embedding,
        searchCount: 0,
      });

      if ((i + 1) % 10 === 0) {
        console.log(`  Processed ${i + 1} / ${allFaqs.length}`);
      }
    }

    await FAQ.insertMany(docs);
    console.log(`  ✓ Inserted ${docs.length} FAQs with embeddings`);
    console.log("Seeding complete!");
    process.exit(0);
  } catch (error) {
    console.error("Seeding error:", error);
    process.exit(1);
  }
};

seed();