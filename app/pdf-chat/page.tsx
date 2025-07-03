"use client";

import { useState, useRef, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

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

    const res = await fetch("/api/pdf-chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question: input }),
    });

    const data = await res.json();
    setMessages((prev) => [...prev, { role: "bot", content: data.reply }]);
    setLoading(false);
  };

  const handleEmbed = async () => {
    const res = await fetch("/api/embed-pdfs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });

    const data = await res.json();
    console.log('embeed data', data);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 flex justify-center">
      <div className="w-full max-w-3xl space-y-4">
        <h1 className="text-3xl font-bold text-center text-cyan-400">
          PDF Knowledge Chatbot
        </h1>
        <div className="h-[500px] overflow-y-auto space-y-2 border border-slate-700 rounded-lg p-4">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`p-3 rounded-md ${msg.role === "user"
                ? "bg-cyan-700 text-right"
                : "bg-slate-700 text-left"
                }`}
            >
              {msg.content}
            </div>
          ))}
          <div ref={scrollRef} />
        </div>
        <Textarea
          placeholder="Ask something from the PDF..."
          className="bg-slate-800 text-white"
          rows={3}
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <Button onClick={handleSubmit} disabled={loading}>
          {loading ? "Thinking..." : "Ask"}
        </Button>
        <Button onClick={handleEmbed} disabled={loading}>
          Embed API
        </Button>
      </div>
    </div>
  );
}
