// app/api/pdf-chat/route.ts
import { NextResponse } from "next/server";
import { openai } from "@/lib/openai";
import { Category } from "@/enum/category";


export async function POST(req: Request) {
  try {
    const { question } = await req.json();

    if (!question || typeof question !== "string") {
      return NextResponse.json({ error: "Invalid question" }, { status: 400 });
    }

    let context = "I have the following 15 categories: ";
    const allLabels = Category.getAllLabels();
    for (const label of allLabels) {
      context += label + ", "
    }

    const prompt = `
You are a helpful assistant. Answer the question below using only the context provided.

Context:
${context}

Given these categories, tell me which matches the best given this question:
${question}

Answer: As an answer just give me the name of the category, nothing else.
`;

    // 1) FAST PATH: gpt-4o (Chat Completions)
    try {
      console.warn("Using gpt-4o")
      const chatCompletion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: "You are a knowledgeable assistant." },
          { role: "user", content: prompt },
        ],
        temperature: 0.2,
      });

      const reply = chatCompletion.choices[0]?.message?.content || "No answer found.";
      const category = Category.getSlug(reply);

      return NextResponse.json({ category });
    } catch (err: any) {
      // Log + fall back
      console.warn("gpt-4o failed, falling back to gpt-5-nano:", {
        message: err?.message,
        status: err?.status,
        code: err?.code,
        type: err?.type,
      });
    }
    console.warn("Using gpt-5-nano")

    // 2) FALLBACK: gpt-5-nano (Responses API)
    const response = await openai.responses.create({
      model: "gpt-5-nano",
      // temperature: 0.2,
      service_tier: "priority",
      reasoning: { effort: "minimal" },
      text: { verbosity: "medium" },
      // max_output_tokens: 250,
      input: [
        {
          role: "system",
          content: [
            { type: "input_text", text: "You are a knowledgeable assistant." }
          ]
        },
        {
          role: "user",
          content: [
            { type: "input_text", text: prompt }
          ]
        }
      ]
    });

    const reply = response.output_text || "No answer found.";
    const category = Category.getSlug(reply);

    return NextResponse.json({ category });
  } catch (err: any) {
    console.error("PDF Chat Error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
