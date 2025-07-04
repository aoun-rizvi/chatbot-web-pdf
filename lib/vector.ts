// lib/vector.ts
import { db, storage } from "@/lib/firebase";
import { embedText } from "@/lib/embeddings";
import { ref, getDownloadURL } from "firebase/storage";
import { collection, getDocs, doc, setDoc } from "firebase/firestore";
import { extractPdfText } from "@/lib/pdf";
import { Category } from "@/enum/category";


const CHUNK_COLLECTION_NAME = "chunks";

// Pulls all PDFs listed in Firestore and embeds their content from Firebase Storage
export async function embedAllPDFsFromStorage() {
  const categories = Category.getAllSlugs();
  for (const category of categories) {
    const pdfCollection = collection(db, category);
    const snapshot = await getDocs(pdfCollection);

    for (const docSnap of snapshot.docs) {
      const metadata = docSnap.data();
      const firestoreId = docSnap.id;
      const fileName = metadata.fileName;
      const storagePath = metadata.storagePath;

      // If no filename, print warning and move to next item
      if (!fileName) {
        console.warn(`Skipping PDF with missing filename (ID: ${firestoreId})`);
        continue;
      }

      // If no storagePath, print warning and move to next item
      if (!storagePath) {
        console.warn(`Skipping PDF with missing storage path (ID: ${firestoreId}, ${fileName})`);
        continue;
      }

      // If chunk sub-collection already exist, print warning and move to next item
      if (await doesChunksCollectionExist(category, firestoreId)) {
        console.warn(`Chunks already exist (ID: ${firestoreId}, ${fileName})`);
        continue;
      }

      try {
        const fileRef = ref(storage, storagePath);
        const url = await getDownloadURL(fileRef);

        // Get chunks of the PDF file
        // 1. Extract chunks of text from PDF stored in Firebase Storage
        const chunks: string[] = await extractPdfText(url); // chunks: string[]

        // 2. Prepare Firestore collection path
        const chunksCollectionRef = collection(db, category, firestoreId, CHUNK_COLLECTION_NAME);
        for (let i = 0; i < chunks.length; i++) {
          const chunk = chunks[i];

          // 3a. Embed the chunk using OpenAI
          const embedding = await embedText(chunk);

          // 3b. Prepare document reference
          const chunkDocRef = doc(chunksCollectionRef);

          // 3c. Add to Firestore batch
          await setDoc(chunkDocRef, {
            chunk,
            embedding,
            metadata: {
              firestoreId,
              fileName: fileName,
              storagePath: storagePath,
            },
            createdAt: Date.now(),
          });

          console.log(`✅ Uploaded chunk ${i + 1}/${chunks.length} for ${fileName}`);
        }

        console.log(`✅ Embedded and saved chunks for ${fileName}`);
      } catch (err) {
        console.error(`❌ Failed to embed ${fileName}:`, err);
      }
    }
  }
}

// Check if sub-collection exists
async function doesChunksCollectionExist(category: string, pdfId: string): Promise<boolean> {
  const chunksRef = collection(db, category, pdfId, CHUNK_COLLECTION_NAME);
  const snapshot = await getDocs(chunksRef);
  return !snapshot.empty; // true if at least one chunk exists
}

