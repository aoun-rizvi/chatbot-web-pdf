import { openai } from "@/lib/openai";

// Generate vector
export async function embedText(text: string): Promise<number[]> {
  const res = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: text,
  });

  return res.data[0].embedding;
}

// Similarity
export function cosineSimilarity(a: number[], b: number[]): number {
  const dot = a.reduce((acc, val, i) => acc + val * b[i], 0);
  const normA = Math.sqrt(a.reduce((acc, val) => acc + val * val, 0));
  const normB = Math.sqrt(b.reduce((acc, val) => acc + val * val, 0));
  return dot / (normA * normB);
}

export function getTopKRelevantChunks(
  embeddedQuery: number[],
  documents: {
    chunk: string;
    embedding: number[];
    metadata: { fileName: string; firestoreId: string };
  }[],
  k: number = 5
) {
  const scored = documents.map((doc) => ({
    ...doc,
    score: cosineSimilarity(embeddedQuery, doc.embedding),
  }));

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, k)
    .map((doc) => doc.chunk);
}
