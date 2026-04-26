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
import Image from "next/image";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import { Paperclip, X } from "lucide-react";
import { toast } from "sonner";


// When should you refer to secondary care for eczema
// category should be: Skin
// What should i do for a chronic diarrhea patient
// Elderly patient with heart failure. Showing symptoms of hypothyroidism. Subclinical hypothyroidism on their bloods, where possible, give information including symptoms and blood test results, which would prompt initiation of treatment


export default function PdfChat() {
  const [region, setRegion] = useState<Region>(Region.Derbyshire);
  const [messages, setMessages] = useState<{ role: string; content: string }[]>(
    []
  );
  const [showDisclaimer, setShowDisclaimer] = useState(false);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  // Track which object URLs are already committed to the chat history,
  // so we never revoke those (keeps old images visible until page refresh)
  const committedObjectUrls = useRef<Set<string>>(new Set());
  // Place this near your Ask textarea/button block
  const fileInputRef = useRef<HTMLInputElement>(null);
  const askButtonRef = useRef<HTMLButtonElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const questionSubmit = async () => {
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

  // Single entry point: clicking the button opens the picker
  const onClickDiagnose = () => fileInputRef.current?.click();

  // File picked → validate → append image to chat → call API → append diagnosis
  const imageSubmit: React.ChangeEventHandler<HTMLInputElement> = async (e) => {
    const file = e.target.files?.[0] ?? null;
    // allow re-selecting the same file later
    e.target.value = "";

    if (!file) return;

    const okTypes = ["image/png", "image/jpeg", "image/jpg"];
    if (!okTypes.includes(file.type)) {
      toast.error('Please upload a PNG or JPEG image.')
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      toast.error('Image too large. Keep it under 8MB.')
      return;
    }

    // Create an object URL and commit it to the chat history (so it stays visible this session)
    const url = URL.createObjectURL(file);
    committedObjectUrls.current.add(url);

    // Show the image immediately in the chat as a user message
    const imageMsg = { role: "user", content: `![uploaded image](${url})` };
    setMessages((prev) => [...prev, imageMsg]);

    // Send to backend for diagnosis
    setLoading(true);
    try {
      const form = new FormData();
      form.append("image", file);
      // form.append("region", region);
      // form.append("history", JSON.stringify([...messages, imageMsg]));

      const res = await fetch("/api/image-diagnose", { method: "POST", body: form });
      const data = await res.json();

      setMessages((prev) => [...prev, { role: "bot", content: data.reply }]);
    } catch {
      setMessages((prev) => [...prev, { role: "bot", content: "Sorry—there was a problem analyzing the image." }]);
    } finally {
      setLoading(false);
    }
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
          <span className="w-2 h-2 bg-[#E6B980] dark:bg-[#E6B980] rounded-full animate-bounce [animation-delay:0ms]" />
          <span className="w-2 h-2 bg-[#E6B980] dark:bg-[#E6B980] rounded-full animate-bounce [animation-delay:200ms]" />
          <span className="w-2 h-2 bg-[#E6B980] dark:bg-[#E6B980] rounded-full animate-bounce [animation-delay:400ms]" />
        </div>
      </div>
    );
  };

  return (
    <div
      className="h-dvh flex items-stretch sm:items-center justify-center
             bg-[#FFF6EC] dark:bg-slate-900
             text-slate-900 dark:text-white
             p-2 sm:p-3 overflow-hidden"
    >
      <Card
        className="w-full max-w-3xl h-full rounded-2xl shadow-xl
               bg-[#FAE9D2] dark:bg-slate-800
               border border-[#EED9C4] dark:border-slate-700/60 py-2"
      >
        <CardContent className="flex flex-col h-full px-2 sm:px-2 md:px-2 py-0 overflow-hidden">
          {/* Header with theme toggle */}
          <header className="mb-3 sm:mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Image
                src="/assets/dog.jpg"
                alt="Medi Milo - AI Assistant"
                width={40}
                height={40}
                className="rounded-full w-8 h-8 sm:w-10 sm:h-10 object-cover"
                sizes="(max-width: 640px) 32px, 40px"
                priority
              />
              <h1 className="text-2xl sm:text-3xl font-bold select-none text-[#8B5E3C] dark:text-[#D7A978]">
                Medi Milo - AI Assistant
              </h1>
            </div>
            <ThemeToggle />
          </header>

          {/* Scrollable message area */}
          <section className="flex-1 min-h-0 overflow-hidden mb-3 sm:mb-4">
            <ScrollArea className="h-full px-2 sm:px-3" aria-label="Chat messages">
              <div className="space-y-3">
                {messages.map((msg, i) => {
                  const isUser = msg.role === "user";
                  return (
                    <div
                      key={i}
                      className={`flex ${isUser ? "justify-end mr-4 sm:mr-0" : "justify-start"}`}
                    >
                      <div
                        className={[
                          "max-w-[90%] sm:max-w-[85%] md:max-w-[80%]",
                          "p-3 rounded-lg shadow-sm ring-1 transition-colors",
                          isUser
                            ? "bg-[#C98A5B] ring-[#B97D51] text-white dark:bg-[#E6B980] dark:ring-[#D7A978] dark:text-slate-900"
                            : "bg-[#F1D6B8] ring-[#E6CCB3] text-slate-900 dark:bg-slate-700 dark:ring-slate-700 dark:text-slate-100",
                        ].join(" ")}
                        role="group"
                        aria-label={isUser ? "User message" : "Assistant message"}
                      >
                        {/* Markdown content (kept functional) */}
                        <div
                          className="prose prose-slate dark:prose-invert max-w-none
                                     [&_a]:text-[#8B5E3C] dark:[&_a]:text-[#D7A978] [&_a:hover]:underline
                                     [&_table]:w-full [&_table]:border-collapse
                                     [&_th]:px-3 [&_th]:py-2 [&_td]:px-3 [&_td]:py-2 text-sm
                                     [&_th]:text-left
                                     [&_th]:border [&_td]:border
                                     [&_th]:border-slate-200 [&_td]:border-slate-200
                                     dark:[&_th]:border-slate-600 dark:[&_td]:border-slate-700
                                     [&_tbody_tr:nth-child(odd)]:bg-slate-50
                                     dark:[&_tbody_tr:nth-child(odd)]:bg-slate-800/40"
                        >
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm]}

                            // ✅ v9+: allow all URLs (including blob:/data:) instead of sanitizing them
                            urlTransform={(url) => url}

                            components={{
                              // Render a plain <img> so blob:/data: sources work
                              img: ({ node, ...props }) => (
                                <img
                                  {...props}
                                  className="max-w-full h-auto rounded-md"
                                  loading="lazy"
                                  decoding="async"
                                />
                              ),
                              a: ({ href, children }) => (
                                <a href={href as string} target="_blank" rel="noopener noreferrer">
                                  {children}
                                </a>
                              ),
                              // table: ({ children }) => <table className="w-full border-collapse">{children}</table>,
                              table: ({ children }) => (
                                <div
                                  className="max-w-[300px] sm:max-w-[500px] md:max-w-[600px] overflow-x-auto [-webkit-overflow-scrolling:touch] [scrollbar-gutter:stable]"
                                >
                                  <table className="min-w-max border-collapse">
                                    {children}
                                  </table>
                                </div>
                              ),
                              thead: ({ children }) => <thead className="sticky top-0">{children}</thead>,
                              th: ({ children }) => (
                                <th className="border border-slate-600 bg-slate-800 px-3 py-2 text-left">{children}</th>
                              ),
                              td: ({ children }) => (
                                <td className="border border-slate-700 px-3 py-2 align-top">{children}</td>
                              ),
                              tr: ({ children }) => <tr className="odd:bg-slate-800/40">{children}</tr>,
                              ul: ({ children }) => <ul className="list-disc pl-6 space-y-1">{children}</ul>,
                              ol: ({ children }) => <ol className="list-decimal pl-6 space-y-1">{children}</ol>,
                              p: ({ children }) => <p className="leading-relaxed">{children}</p>,
                            }}
                          >
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

          {loading && <TypingIndicator />}

          {/* Controls */}
          <section className="w-full">
            {/* Region toggles — equal width; dog-inspired tones */}
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
                           bg-[#EED9C4] text-[#5B3B28] hover:bg-[#E6CCB3]
                           dark:bg-[#3B2A22] dark:text-[#E6B980] dark:hover:bg-[#4A362B]
                           data-[state=on]:bg-[#C98A5B] data-[state=on]:text-white
                           dark:data-[state=on]:bg-[#C98A5B] dark:data-[state=on]:text-slate-900
                           data-[state=on]:shadow"
                aria-label="Derbyshire"
              >
                {Region.Derbyshire}
              </ToggleGroupItem>
              <ToggleGroupItem
                value={Region.National}
                className="w-full font-semibold text-sm transition cursor-pointer
                           bg-[#EED9C4] text-[#5B3B28] hover:bg-[#E6CCB3]
                           dark:bg-[#3B2A22] dark:text-[#E6B980] dark:hover:bg-[#4A362B]
                           data-[state=on]:bg-[#C98A5B] data-[state=on]:text-white
                           dark:data-[state=on]:bg-[#C98A5B] dark:data-[state=on]:text-slate-900
                           data-[state=on]:shadow"
                aria-label="National"
              >
                {Region.National}
              </ToggleGroupItem>
            </ToggleGroup>

            {/* Textarea + Ask button */}
            <div className="flex flex-col gap-2 w-full">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Let's play fetch! You ask a question and I fetch the answer!"
                className="flex-1 h-24 resize-none
             bg-[#F9EFDF] border border-[#EED9C4] text-slate-900
             placeholder:text-slate-500
             dark:bg-slate-700 dark:border-slate-700 dark:text-slate-100 dark:placeholder:text-slate-400"
                disabled={loading}
                aria-label="Message input"
                onKeyDown={(e) => {
                  if (e.key === "Tab" && !e.shiftKey) {
                    e.preventDefault();                 // stop native tabbing
                    askButtonRef.current?.focus();         // send focus to Ask
                  }
                }}
              />
            </div>

            {/* Hidden file input (no preview UI) */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg"
              className="sr-only"
              onChange={imageSubmit}
            />

            {/* One button that both picks and sends immediately */}
            <TooltipProvider delayDuration={150}>
              <div className="w-full flex flex-row flex-nowrap items-stretch gap-2 pt-2">
                {/* Ask — expands to fill remaining width */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      ref={askButtonRef}
                      onClick={questionSubmit}
                      disabled={loading}
                      aria-label="Send message"
                      title="Send message"
                      className="min-w-0 flex-1 font-semibold cursor-pointer
                     bg-[#C98A5B] hover:bg-[#B97D51] text-white
                     dark:bg-[#E6B980] dark:hover:bg-[#D7A978] dark:text-slate-900
                     disabled:opacity-60 disabled:cursor-not-allowed"

                    >
                      {loading ? "..." : "Ask"}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top">Send message</TooltipContent>
                </Tooltip>


                {/* Attach (icon-only) — fixed width; stays right */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      onClick={onClickDiagnose}
                      disabled={loading}
                      tabIndex={-1}
                      aria-label="Attach image"
                      title="Attach image"
                      variant="outline"
                      className="shrink-0 px-3 sm:px-4 cursor-pointer
                     border-[#EED9C4] text-[#5B3B28] hover:bg-[#F6E2CB]
                     dark:border-slate-600 dark:text-slate-100 dark:hover:bg-slate-700"
                    >
                      <Paperclip className="h-5 w-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top">Attach image</TooltipContent>
                </Tooltip>

              </div>

              {/* Disclaimer */}
              <div className="mt-3 text-center space-y-1">
                <p className="text-xs text-[#8B5E3C]/70 dark:text-[#D7A978]/70">
                  Not a substitute for clinical judgement.{" "}
                  <button
                    onClick={() => setShowDisclaimer(true)}
                    className="underline hover:opacity-80"
                  >
                    Read More
                  </button>
                </p>
              </div>
            </TooltipProvider>


          </section>
        </CardContent>
      </Card>
      {/* Disclaimer */}
      {showDisclaimer && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl bg-[#FAE9D2] dark:bg-slate-800 shadow-2xl border border-[#EED9C4] dark:border-slate-700 p-6 relative">

            <button
              onClick={() => setShowDisclaimer(false)}
              className="absolute top-4 right-4 text-[#8B5E3C] dark:text-[#D7A978] hover:opacity-70"
            >
              <X className="h-5 w-5" />
            </button>

            <h2 className="text-xl font-bold mb-4 text-[#8B5E3C] dark:text-[#D7A978]">
              Disclaimer & Terms of Use
            </h2>

            <div className="space-y-4 text-sm leading-relaxed text-slate-800 dark:text-slate-200">
              <p>
                This platform is provided for informational and educational purposes only.
                It is designed to assist qualified healthcare professionals by summarising
                clinical guidance and offering general decision-support information.
              </p>

              <p>
                It does not constitute medical advice and must not be relied upon as a
                substitute for professional clinical judgement, independent verification,
                or consultation of authoritative sources.
              </p>

              <p>
                Users must exercise their own clinical expertise, judgement, and due
                diligence when interpreting and applying any information generated.
              </p>

              <p>
                Clinical decisions must be based on a comprehensive assessment of the
                individual patient, current evidence-based guidance, national standards,
                and applicable local policies.
              </p>

              <p>
                Do not input patient-identifiable or confidential information. All data
                entered should be fully anonymised.
              </p>

              <p>
                No warranties are made regarding accuracy, completeness, reliability, or
                currency of information provided.
              </p>

              <p>
                By using this platform, you agree that sole responsibility for all
                clinical decisions and patient outcomes rests with the treating clinician.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
