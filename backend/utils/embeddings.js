import { pipeline } from '@xenova/transformers';

// Singleton variable to cache the loaded AI model in memory across requests
let embedder = null;

export const generateEmbedding = async (text) => {
  // Lazy load the model only on the very first search to save initial startup time
  if (!embedder) {
    embedder = await pipeline('feature-extraction', 'Xenova/multi-qa-mpnet-base-dot-v1');
  }
  
  // Generate a dense semantic vector, normalized and mean-pooled for accurate similarity matching
  const output = await embedder(text, { pooling: 'mean', normalize: true });
  
  // Convert the generated Float32Array into a standard JavaScript array for MongoDB compatibility
  return Array.from(output.data);
};