import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { pipeline } from '@xenova/transformers';
import FAQ from '../models/FAQ.js';
import User from '../models/User.js';

// Resolve the current directory path (necessary because standard __dirname is not available in ES Modules)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from the parent directory's .env file
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const MONGODB_URI = process.env.MONGODB_URI;

// Fail fast if the database URI is missing
if (!MONGODB_URI) {
  console.error("ERROR: MONGODB_URI not found in .env");
  process.exit(1);
}

const seed = async () => {
  try {
    console.log("Connecting to MongoDB Atlas...");
    await mongoose.connect(MONGODB_URI);
    
    // --- STEP 1: SEED USERS ---
    console.log("[1/2] Seeding users...");
    await User.deleteMany(); // Clear existing users to avoid duplicates
    
    const users = [
      {
        name: "Test User",
        email: "user@yaksha.com",
        password: "password123", // The Mongoose pre-save hook will automatically hash this
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

    // --- STEP 2: SEED FAQS WITH AI EMBEDDINGS ---
    console.log("[2/2] Generating FAQ embeddings and seeding...");
    await FAQ.deleteMany(); // Clear existing FAQs

    // Read the raw FAQ data from your local JSON file
    const faqFilePath = path.join(__dirname, '..', '..', 'samagama_faq.json');
    const faqDataRaw = await fs.readFile(faqFilePath, 'utf-8');
    const faqData = JSON.parse(faqDataRaw);

    // Initialize the local, in-memory Transformer model to calculate vector embeddings
    console.log("Loading Xenova transformer model (all-MiniLM-L6-v2)...");
    const extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');

    const docs = [];
    
    // Loop through each FAQ to generate its semantic footprint
    for (let i = 0; i < faqData.faqs.length; i++) {
      const faq = faqData.faqs[i];
      
      // Combine the question and answer to give the AI maximum context
      const text = `${faq.question} ${faq.answer}`;
      
      // Generate a normalized, mean-pooled embedding vector
      const output = await extractor(text, { pooling: 'mean', normalize: true });
      const embedding = Array.from(output.data); // Convert Float32Array to standard JS Array

      // Prepare the document object
      docs.push({
        question: faq.question,
        answer: faq.answer,
        category: faq.section,
        embedding: embedding,
        searchCount: 0,
      });

      // Provide progress updates in the console
      if ((i + 1) % 10 === 0) {
        console.log(`  Processed ${i + 1} / ${faqData.faqs.length} FAQs`);
      }
    }

    // Bulk insert the fully prepared documents into MongoDB for maximum performance
    await FAQ.insertMany(docs);
    console.log(`  ✓ Inserted ${docs.length} FAQs with embeddings`);

    console.log("Seeding complete!");
    process.exit(0); // Exit successfully
  } catch (error) {
    console.error("Error during seeding:", error);
    process.exit(1); // Exit with failure code
  }
};

// Execute the seeder
seed();
