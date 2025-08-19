"use client";

import { useState, useRef, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { addDocumentsForPdfs } from "@/lib/addDocumentsForPdfs";
import { Region } from "@/enum/region"
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";


// When should you refer to secondary care for eczema
// category should be: Skin
// What should i do for a chronic diarrhea patient
// Elderly patient with heart failure. Showing symptoms of hypothyroidism. Subclinical hypothyroidism on their bloods, where possible, give information including symptoms and blood test results, which would prompt initiation of treatment


export default function PdfChat() {
  const [region, setRegion] = useState<Region>(Region.Derbyshire);
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

    let res, data;
    if (region === Region.Derbyshire) {
      res = await fetch("/api/pdf-category", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: input }),
      });
      data = await res.json();

      res = await fetch("/api/pdf-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: input,
          category: data.category,
          history: messages,
        }),
      });
    } else {
      res = await fetch("/api/chat-national", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: input,
          history: messages,
        }),
      });
    }

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

  const TypingIndicator = () => {
    return (
      <div className="flex justify-center mb-2">
        <div className="flex items-center space-x-1">
          <span className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce [animation-delay:0ms]"></span>
          <span className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce [animation-delay:200ms]"></span>
          <span className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce [animation-delay:400ms]"></span>
        </div>
      </div>
    );
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
                    <div className="prose prose-invert max-w-none
  [&_a]:text-cyan-400 [&_a:hover]:underline
  [&_table]:w-full
  [&_thead_th]:bg-slate-800
  [&_th]:px-3 [&_th]:py-2 [&_td]:px-3 [&_td]:py-2
  [&_th]:text-left
  [&_table]:border-collapse
  [&_th]:border [&_td]:border [&_th]:border-slate-600 [&_td]:border-slate-700
  [&_tbody_tr:nth-child(odd)]:bg-slate-800/40
">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          a: ({ href, children }) => (
                            <a href={href} target="_blank" rel="noopener noreferrer">
                              {children}
                            </a>
                          ),
                          table: ({ children }) => (
                            <table className="w-full border-collapse">{children}</table>
                          ),
                          thead: ({ children }) => <thead className="sticky top-0">{children}</thead>,
                          th: ({ children }) => (
                            <th className="border border-slate-600 bg-slate-800 px-3 py-2 text-left">
                              {children}
                            </th>
                          ),
                          td: ({ children }) => (
                            <td className="border border-slate-700 px-3 py-2 align-top">{children}</td>
                          ),
                          tr: ({ children }) => <tr className="odd:bg-slate-800/40">{children}</tr>,
                          // Optional: tighter lists
                          ul: ({ children }) => <ul className="list-disc pl-6 space-y-1">{children}</ul>,
                          ol: ({ children }) => <ol className="list-decimal pl-6 space-y-1">{children}</ol>,
                          li: ({ children }) => <li className="leading-relaxed">{children}</li>,
                          p: ({ children }) => <p className="leading-relaxed">{children}</p>,
                        }}
                      >
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
          {loading && <TypingIndicator />}
          <div className="pb-1 flex items-center gap-2 w-full">
            {/* Toggle Group */}
            <ToggleGroup
              type="single"
              value={region}
              onValueChange={(value) => {
                if (value) setRegion(value as Region);
              }}
              className="flex flex-col justify-center h-24 rounded-md overflow-hidden gap-1"
            >
              <ToggleGroupItem
                value={Region.Derbyshire}
                className={`
                  flex-1 w-full font-semibold text-sm transition cursor-pointer
                  bg-cyan-700 text-black hover:bg-cyan-500
                  data-[state=on]:bg-cyan-500
                  data-[state=on]:text-white
                  data-[state=on]:shadow-lg data-[state=on]:translate-y-[-2px]
                  rounded-md
                `}
              >
                {Region.Derbyshire}
              </ToggleGroupItem>

              <ToggleGroupItem
                value={Region.National}
                className={`
                  flex-1 w-full font-semibold text-sm transition cursor-pointer
                  bg-cyan-700 text-black hover:bg-cyan-500
                  data-[state=on]:bg-cyan-500
                  data-[state=on]:text-white
                  data-[state=on]:shadow-lg data-[state=on]:translate-y-[-2px]
                  rounded-md
                `}
              >
                {Region.National}
              </ToggleGroupItem>
            </ToggleGroup>

            {/* Textarea */}
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything..."
              className="flex-1 bg-slate-700 border-none text-white resize-none h-24"
              disabled={loading}
            />

            {/* Ask Button */}
            <Button
              onClick={handleSubmit}
              disabled={loading}
              className="bg-cyan-500 hover:bg-cyan-600 cursor-pointer"
            >
              {loading ? "..." : "Ask"}
            </Button>
          </div>
          {/* Helper Buttons */}
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
