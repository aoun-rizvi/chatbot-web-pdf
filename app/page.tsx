"use client";

import { useState, useRef, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { addDocumentsForPdfs } from "@/lib/addDocumentsForPdfs";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";


// When should you refer to secondary care for eczema
// category should be: Skin
// What should i do for a chronic diarrhea patient


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
      body: JSON.stringify({
        question: input,
        category: data.category,
        history: messages,
      }),
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

  const updateFirestoreWithPdfs = async () => {
    addDocumentsForPdfs();
  };

  return (
    <div className="h-screen flex items-center justify-center bg-gradient-to-b from-slate-900 to-slate-700 p-4 text-white overflow-hidden">
      <Card className="py-2 w-full max-w-3xl shadow-xl rounded-2xl bg-slate-800 border-none flex flex-col h-full">
        <CardContent className="px-2 flex flex-col flex-1 overflow-hidden">
          {/* Header */}
          <h1 className="text-3xl font-bold mb-4 text-center text-cyan-400">Medical AI Assistant</h1>

          {/* Scrollable message area */}
          <div className="flex-1 overflow-hidden mb-4">
            <ScrollArea className="h-full px-3">
              <div className="space-y-3">
                {messages.map((msg, i) => (
                  <div
                    key={i}
                    className={`p-3 rounded-md ${msg.role === "user"
                      ? "bg-cyan-700 text-slate-900 text-right"
                      : "bg-slate-700 text-slate-400 text-left"
                      }`}
                  >
                    <div className="prose prose-invert max-w-none">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {msg.content}
                      </ReactMarkdown>
                    </div>
                  </div>
                ))}
                <div ref={scrollRef} />
              </div>
            </ScrollArea>
          </div>

          {/* Input section */}
          <div className="pb-1 flex items-center gap-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything..."
              className="flex-1 bg-slate-700 border-none text-white resize-none h-24"
              disabled={loading}
            />
            <Button
              onClick={handleSubmit}
              disabled={loading}
              className="bg-cyan-500 hover:bg-cyan-600"
            >
              {loading ? "..." : "Ask"}
            </Button>
          </div>
          {/* <div className="flex flex-col gap-2">
            <Button onClick={updateFirestoreWithPdfs} disabled={loading}>
              PDF Config
            </Button>
            <Button onClick={handleEmbed} disabled={loading}>
              PDF Embedding
            </Button>
          </div> */}
        </CardContent>
      </Card>
    </div>
  );


}
