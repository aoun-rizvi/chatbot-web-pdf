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
import { ThemeToggle } from "@/components/theme-toggle";


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
    <div className="h-screen min-h-dvh sm:h-dvh flex items-center justify-center
                bg-slate-50 dark:bg-slate-900
                text-slate-900 dark:text-white
                p-2 sm:p-3 overflow-hidden">

      <Card className="w-full max-w-3xl h-full rounded-2xl shadow-xl
                   bg-white dark:bg-slate-800
                   border border-slate-200 dark:border-slate-700/60 py-2">
        <CardContent className="flex flex-col h-full px-2 sm:px-2 md:px-2 py-0 overflow-hidden">

          {/* Header with theme toggle */}
          <header className="mb-3 sm:mb-4 flex items-center justify-between">
            <h1 className="text-2xl sm:text-3xl font-bold select-none
                       text-cyan-700 dark:text-cyan-400">
              Medical AI Assistant
            </h1>
            {/* Optional: keep/remove your theme toggle component */}
            <ThemeToggle />
          </header>

          {/* Scrollable message area */}
          <section className="flex-1 min-h-0 overflow-hidden mb-3 sm:mb-4">
            <ScrollArea className="h-full px-2 sm:px-3" aria-label="Chat messages">
              <div className="space-y-3">
                {messages.map((msg, i) => {
                  const isUser = msg.role === "user";
                  return (
                    <div key={i} className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
                      <div
                        className={[
                          "max-w-[90%] sm:max-w-[85%] md:max-w-[80%]",
                          "p-3 rounded-lg shadow-sm ring-1 transition-colors",
                          isUser
                            ? "bg-cyan-600 ring-cyan-500 text-white"
                            : "bg-slate-100 ring-slate-200 text-slate-900 dark:bg-slate-700 dark:ring-slate-700 dark:text-slate-100",
                        ].join(" ")}
                        role="group"
                        aria-label={isUser ? "User message" : "Assistant message"}
                      >
                        {/* Markdown content (kept functional) */}
                        <div className="prose prose-slate dark:prose-invert max-w-none
                                    [&_a]:text-cyan-700 dark:[&_a]:text-cyan-300 [&_a:hover]:underline
                                    [&_table]:w-full [&_table]:border-collapse
                                    [&_th]:px-3 [&_th]:py-2 [&_td]:px-3 [&_td]:py-2 text-sm
                                    [&_th]:text-left
                                    [&_th]:border [&_td]:border
                                    [&_th]:border-slate-200 [&_td]:border-slate-200
                                    dark:[&_th]:border-slate-600 dark:[&_td]:border-slate-700
                                    [&_tbody_tr:nth-child(odd)]:bg-slate-50
                                    dark:[&_tbody_tr:nth-child(odd)]:bg-slate-800/40">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {msg.content}
                          </ReactMarkdown>
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={scrollRef} />
              </div>
            </ScrollArea>
          </section>

          {loading && (
            <div className="flex justify-center mb-2" aria-label="Assistant is typing">
              <span className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce [animation-delay:0ms]" />
              <span className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce [animation-delay:200ms] ml-1" />
              <span className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce [animation-delay:400ms] ml-1" />
            </div>
          )}

          {/* Controls */}
          <section className="w-full">

            {/* Derbyshire/National row — full width, equal space per button */}
            <ToggleGroup
              type="single"
              value={region}
              onValueChange={(value) => value && setRegion(value as Region)}
              className="grid grid-cols-2 gap-2 w-full mb-2"
              aria-label="Select guidance source"
            >
              <ToggleGroupItem
                value={Region.Derbyshire}
                className="w-full font-semibold text-sm transition cursor-pointer
                       bg-cyan-700 text-black hover:bg-cyan-600
                       data-[state=on]:bg-cyan-600 data-[state=on]:text-white
                       data-[state=on]:shadow"
                aria-label="Derbyshire"
              >
                {Region.Derbyshire}
              </ToggleGroupItem>
              <ToggleGroupItem
                value={Region.National}
                className="w-full font-semibold text-sm transition cursor-pointer
                       bg-cyan-700 text-black hover:bg-cyan-600
                       data-[state=on]:bg-cyan-600 data-[state=on]:text-white
                       data-[state=on]:shadow"
                aria-label="National"
              >
                {Region.National}
              </ToggleGroupItem>
            </ToggleGroup>

            {/* Textarea + Ask button (Ask is full width below input) */}
            <div className="flex flex-col gap-2 w-full">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask me anything..."
                className="flex-1 h-24 resize-none
                       bg-slate-200 border border-slate-400 text-slate-900
                       dark:bg-slate-700 dark:border-slate-700 dark:text-slate-100"
                disabled={loading}
                aria-label="Message input"
              />
              <Button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full font-semibold cursor-pointer
                       bg-cyan-600 hover:bg-cyan-700 text-white
                       disabled:opacity-60 disabled:cursor-not-allowed"
                aria-label="Send message"
              >
                {loading ? "..." : "Ask"}
              </Button>
            </div>
          </section>
        </CardContent>
      </Card>
    </div>
  );
}
