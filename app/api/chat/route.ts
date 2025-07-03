import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const messages = body.messages;

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ error: "Missing OpenAI API Key" }, { status: 500 });
  }

  try {
    const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: messages.map((msg: { role: string; content: string }) => ({
          role: msg.role === "bot" ? "assistant" : msg.role,
          content: msg.content,
        })),
        temperature: 0.7,
      }),
    });

    const data = await openaiRes.json();

    const reply = data.choices?.[0]?.message?.content || "No reply";

    return NextResponse.json({ reply });
  } catch (error) {
    console.error("OpenAI API Error:", error);
    return NextResponse.json({ error: "Failed to connect to OpenAI" }, { status: 500 });
  }
}
