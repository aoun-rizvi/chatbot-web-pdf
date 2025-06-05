"use client"

import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

export default function Home() {
  const [messages, setMessages] = useState<{
    role: "user" | "bot";
    content: string;
  }[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const bottomRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMessage = { role: "user", content: input } as const;
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [...messages, userMessage] }),
      });
      const data = await res.json();
      setMessages((prev) => [...prev, { role: "bot", content: data.reply }]);
    } catch (err) {
      setMessages((prev) => [...prev, { role: "bot", content: "Error: Failed to fetch response." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-slate-900 to-slate-700 p-4 text-white">
      <Card className="w-full max-w-3xl shadow-xl rounded-2xl bg-slate-800 border-none">
        <CardContent className="p-1">
          <h1 className="text-3xl font-bold mb-4 text-center text-cyan-400">AI Chat Assistant</h1>
          <ScrollArea className="h-96 mb-4 space-y-3">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={cn("mt-1 p-3 rounded-md text-sm", {
                  "bg-slate-700 text-right ml-auto": msg.role === "user",
                  "bg-slate-600 text-left mr-auto": msg.role === "bot",
                })}
              >
                {msg.content}
              </div>
            ))}
            <div ref={bottomRef} />
          </ScrollArea>
          <div className="flex items-center gap-2">
            {/* <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Ask me anything..."
              className="flex-1 bg-slate-700 border-none text-white"
              disabled={loading}
            /> */}
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything..."
              className="flex-1 bg-slate-700 border-none text-white resize-none h-24"
              disabled={loading}
            />
            <Button onClick={sendMessage} disabled={loading} className="bg-cyan-500 hover:bg-cyan-600">
              {loading ? "..." : "Send"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
