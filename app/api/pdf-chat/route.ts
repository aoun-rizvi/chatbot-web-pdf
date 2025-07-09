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
    const { question, category, history } = await req.json();

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
    let context = topChunks.join("\n---\n");

    // 5. External links to include in context
    const links = ["https://www.nice.org.uk", "https://bnf.nice.org.uk"];
    const linksContext = links.length
      ? `Also include these web links as part of the context: ${links.join(", ")}`
      : "";
    // let linksContext = 'Also include these web links as part of the context: ';
    // for (const link of links) {
    //   linksContext += link + ", "
    // }

    // 6. other parameters
    const maxWordCount = 300;

    // 7. Convert history into OpenAI message format
    const openAiMessages = (history || []).map((msg: any) => ({
      role: msg.role === "bot" ? "assistant" : msg.role,
      content: msg.content,
    }));

    // 8. Add system prompt and RAG context to the start
    openAiMessages.unshift({
      role: "system",
      content: `
      You are a helpful PDF knowledge assistant.

      Instructions:
      Here is your style guide for how to write the:
      - Informative and clear: Prioritize clarity and precision in presenting data.
      - Sequential and logical: Guide the reader through information or steps in a clear, logical sequence.
      - Steady flow: Ensure a smooth flow of information, transitioning seamlessly from one point to the next.
      - Precision: Be very precise with data presentation, do not message any data.
      - Dosage: Always provide clear dosage if available, in a logical and easy-to-read manner. Give the exact amount needed and for how many days.
      - External web links: Use links sparingly and only when really needed, but when you do make sure you actually include them. Only link to nice.org.uk or bnf.nice.org.uk if necessary.
      - Presentation: Try your best to present information in bullet form and/or table form when necessary. Try to avoid long paragraphs of text.
      - Data accuracy: In no circumstance give incorrect data. The most important thing is to present accurate data given the knowledge base.
      `,
    });

    // 9. Add user prompt and context
    openAiMessages.push({
      role: "user",
      content: `
Context:
${context}
${linksContext}

Question:
${question}
`,
    });

    const chatCompletion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: openAiMessages,
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
