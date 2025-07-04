"use client";

import { useState, useRef, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@radix-ui/react-scroll-area";


// When should you refer to secondary care for eczema
// category should be: Skin

export default function PdfChat() {
  const [messages, setMessages] = useState<{ role: string; content: string }[]>(
    []
  );
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = async () => {
    if (!input.trim()) return;
    const newMsg = { role: "user", content: input };
    setMessages((prev) => [...prev, newMsg]);
    setLoading(true);
    setInput("");

    let res = await fetch("/api/pdf-category", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question: input }),
    });
    let data = await res.json();

    res = await fetch("/api/pdf-chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question: input, category: data.category }),
    });

    data = await res.json();
    setMessages((prev) => [...prev, { role: "bot", content: data.reply }]);
    setLoading(false);
  };

  const handleQuestionCategory = async () => {
    if (!input.trim()) return;

    const res = await fetch("/api/pdf-category", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question: input }),
    });

    const data = await res.json();
  };

  const handleEmbed = async () => {
    const res = await fetch("/api/embed-pdfs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });

    const data = await res.json();
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-slate-900 to-slate-700 p-4 text-white">
      <Card className="w-full max-w-3xl shadow-xl rounded-2xl bg-slate-800 border-none">
        <CardContent className="p-1">
          <h1 className="text-3xl font-bold mb-4 text-center text-cyan-400">AI Chat Assistant</h1>
          <ScrollArea className="h-96 mb-4 space-y-3">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`p-3 rounded-md ${msg.role === "user"
                  ? "bg-cyan-700 text-slate-900 text-right"
                  : "bg-slate-700 text-slate-400 text-left"
                  }`}
              >
                {msg.content}
              </div>
            ))}
            <div ref={scrollRef} />
          </ScrollArea>
          <div className="flex items-center gap-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything..."
              className="flex-1 bg-slate-700 border-none text-white resize-none h-24"
              disabled={loading}
            />
            <Button onClick={handleSubmit} disabled={loading} className="bg-cyan-500 hover:bg-cyan-600">
              {loading ? "..." : "Ask"}
            </Button>
            {/* <Button onClick={handleQuestionCategory} disabled={loading}>
          Question Category
        </Button> */}
            {/* <Button onClick={handleEmbed} disabled={loading}>
              Embed API
            </Button> */}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
