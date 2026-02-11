// app/api/image-diagnose/route.ts
import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { openai } from "@/lib/openai";


export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const file = form.get("image") as File | null;

    if (!file) {
      return NextResponse.json({ reply: "No image received." }, { status: 400 });
    }

    if (!["image/jpg", "image/jpeg", "image/png"].includes(file.type)) {
      return NextResponse.json({ reply: "Please upload a PNG, JPG, or JPEG image." }, { status: 400 });
    }

    // Read file as buffer
    const ab = await file.arrayBuffer();
    const b64 = Buffer.from(ab).toString("base64");
    const dataUrl = `data:${file.type};base64,${b64}`;

    const systemInstructions = `
      You are a helpful medical image reasoning assistant.

      Guidelines:
      - Be clear, precise, and structured.
      - If the image is insufficient, say so explicitly and suggest 1–3 clearer photos (lighting, angle, distance).
      - Never assert a definitive diagnosis; give the top differentials with reasoning.
      - Prefer short bullet points or a compact table where helpful.
      - Include red-flag symptoms that require urgent in-person evaluation.
      - If medications are discussed, give typical adult dosage ranges when relevant and safe to do so; otherwise say "dose depends on clinician assessment."
      - Avoid external links unless essential.
      - Dosage: Always provide clear dosage if available, in a logical and easy-to-read manner. Give the exact amount needed and for how many days.
      - Presentation: Try your best to present information in table form. Try to avoid long paragraphs of text.
      - Data accuracy: In no circumstance give incorrect data. The most important thing is to present accurate data given the knowledge base.
      `.trim();

    const question = "Identify the most likely condition shown in this image and key differentials. Give dosage and treatment information. Explain briefly.";

    const response = await openai.responses.create({
      model: "gpt-5-nano",
      // temperature: 0.2,
      service_tier: "priority",
      reasoning: { effort: "minimal" },
      // max_output_tokens: 250,
      instructions: systemInstructions,
      input: [
        {
          role: "user",
          content: [
            { type: "input_text", text: `Question:\n${question}` },
            { type: "input_image", image_url: dataUrl, detail: "high" },
          ],
        },
      ]
    });

    const raw = response.output_text || "No answer found.";

    const reply = normalizeToMarkdown(raw);

    return NextResponse.json({ reply }, { status: 200 });
  } catch (err: any) {
    console.error("Image Diagnose Error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

function normalizeToMarkdown(s: string) {
  // convert <br> to newlines
  const withNewlines = s.replace(/<br\s*\/?>/gi, "\n");
  // strip any remaining HTML tags (very basic sanitizer; keeps text)
  const stripped = withNewlines.replace(/<\/?[^>]+(>|$)/g, "");
  // trim extra blank lines
  return stripped.replace(/\n{3,}/g, "\n\n").trim();
}
