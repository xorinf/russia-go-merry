import { pipeline } from '@xenova/transformers';

let embedder = null;

export const generateEmbedding = async (text) => {
  if (!embedder) {
    embedder = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
  }
  const output = await embedder(text, { pooling: 'mean', normalize: true });
  return Array.from(output.data);
};
