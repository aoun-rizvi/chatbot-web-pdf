// lib/pdf.ts
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.js";
import * as pdfjsWorker from "pdfjs-dist/legacy/build/pdf.worker.js";
import { getDownloadURL, ref } from "firebase/storage";
import { storage } from "./firebase";
import fetch from "node-fetch";

// Configure PDF.js to use fake worker
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

// Function: Extract text chunks from a Firebase Storage PDF files
export async function extractPdfText(storagePath: string): Promise<string[]> {
  try {
    // Get downloadable URL from Firebase Storage
    const fileRef = ref(storage, storagePath);
    const downloadUrl = await getDownloadURL(fileRef);

    // Fetch the PDF file as ArrayBuffer
    const response = await fetch(downloadUrl);
    const arrayBuffer = await response.arrayBuffer();

    // Load and parse the PDF
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;

    // Create chunks
    const chunks: string[] = [];
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const text = content.items.map((item: any) => item.str).join(" ");
      chunks.push(text.trim());
    }

    return chunks;
  } catch (err) {
    console.error("❌ Failed to extract PDF text:", err);
    throw err;
  }
}
