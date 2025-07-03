// app/api/embed-pdfs/route.ts
import { NextResponse } from "next/server";
import { embedAllPDFsFromStorage } from "@/lib/vector";

export async function POST() {
  try {
    await embedAllPDFsFromStorage(); // Only runs at runtime when API is called
    return NextResponse.json({ status: "success" });
  } catch (err) {
    console.error("Embed PDFs error:", err);
    return NextResponse.json({ error: "Failed to embed PDFs" }, { status: 500 });
  }
}
