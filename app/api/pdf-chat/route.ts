// app/api/pdf-chat/route.ts
import { NextResponse } from "next/server";
import { embedText, getTopKRelevantChunks } from "@/lib/embeddings";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import { openai } from "@/lib/openai";
import { getCachedChunks, setCachedChunks } from "@/lib/cache";


const CHUNK_COLLECTION_NAME = "chunks";
// 1 day in milliseconds = 24 * 60 * 60 * 1000 = 86400000
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

type ChunkDocument = {
  chunk: string;
  embedding: number[];
  // createdAt: string;
  metadata: {
    firestoreId: string;
    fileName: string;
    // storagePath: string;
  };
};

export async function POST(req: Request) {
  try {
    const { question, category } = await req.json();

    if (!question || typeof question !== "string") {
      return NextResponse.json({ error: "Invalid question" }, { status: 400 });
    }

    // 1. Embed user question
    const embeddedQuery = await embedText(question);

    // 2. Load all PDF chunks from Firestore
    const allDocs = await loadAllChunksCached(category);

    // 3. Get top-k similar chunks
    const topChunks = getTopKRelevantChunks(embeddedQuery, allDocs, 5);

    // 4. Ask OpenAI using retrieved content as context
    const context = topChunks.join("\n---\n");

    // 5. External links to include in context
    const links = [""];
    let linksContext = 'Also include these web links as part of the context: ';
    for (const link of links) {
      linksContext += link + ", "
    }

    // 6. other parameters
    const maxWordCount = 150;

    const prompt = `
You are a helpful assistant. Answer the question below using only the context provided.

Context:
${context}
${linksContext}

Question:
${question}

Answer: Summarize the answer in less than ${maxWordCount} words.
`;

    const chatCompletion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: "You are a PDF knowledge assistant." },
        { role: "user", content: prompt },
      ],
      temperature: 0.2,
    });

    const reply = chatCompletion.choices[0]?.message?.content || "No answer found.";

    return NextResponse.json({ reply });
  } catch (err: any) {
    console.error("PDF Chat Error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

async function loadAllChunksCached(category: string) {
  const cacheKey = category;
  // const cacheKey = "all-pdf-chunks";
  const cached = getCachedChunks(cacheKey);

  if (cached && Date.now() - cached.timestamp < ONE_DAY_MS) {
    return cached.data;
  }

  const chunks = await loadAllChunksFromFirestore(category);
  setCachedChunks(cacheKey, chunks);
  return chunks;
}

async function loadAllChunksFromFirestore(category: string): Promise<ChunkDocument[]> {
  const allChunks: ChunkDocument[] = [];

  // Step 1: Get all documents inside the collection
  const pdfsCollection = collection(db, category);
  const pdfDocsSnapshot = await getDocs(pdfsCollection);

  // Step 2: For each PDF document, get the 'chunks' subcollection
  for (const pdfDoc of pdfDocsSnapshot.docs) {
    const firestoreId = pdfDoc.id;
    const chunksRef = collection(db, category, firestoreId, CHUNK_COLLECTION_NAME);
    const chunksSnapshot = await getDocs(chunksRef);

    const chunks = chunksSnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        chunk: data.chunk,
        embedding: data.embedding,
        metadata: {
          firestoreId,
          fileName: data.metadata?.fileName || "unknown.pdf",
        },
      };
    });

    allChunks.push(...chunks);
  }

  return allChunks;
}
