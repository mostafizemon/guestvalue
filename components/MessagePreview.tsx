"use client";

import { useEffect, useState } from "react";
import { MessageSquare, Copy, Check } from "lucide-react";
import { SkeletonCard } from "./SkeletonCard";
import { useLanguage } from "@/contexts/LanguageContext";

export function MessagePreview() {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [lang, setLang] = useState<"EN" | "FR">("EN");
  const [copied, setCopied] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    async function fetchMessages() {
      try {
        const res = await fetch("/api/messages");
        const data = await res.json();
        if (Array.isArray(data)) {
          setMessages(data);
        } else {
          setMessages([]);
        }
      } catch (err) {
        console.error("Failed to fetch messages");
      } finally {
        setLoading(false);
      }
    }
    fetchMessages();
  }, []);

  const selectedMsg = messages.find(m => m.id === selectedId);

  const handleCopy = () => {
    if (selectedMsg) {
      const textToCopy = lang === "EN" ? selectedMsg.draftEN : selectedMsg.draftFN;
      navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 h-[calc(100vh-64px)] flex flex-col">
      <div className="border-b border-[#44403C] pb-6 flex-shrink-0">
        <h1 className="text-3xl font-bold text-white mb-2">{t('messages.title')}</h1>
        <p className="text-[#A8A29E]">{t('messages.subtitle')}</p>
      </div>

      <div className="flex-1 flex gap-8 overflow-hidden">
        {/* Left pane - Selection list */}
        <div className="w-1/3 bg-[#292524] border border-[#44403C] rounded-xl flex flex-col overflow-hidden">
          <div className="p-4 border-b border-[#44403C] bg-[#44403C]">
            <h2 className="text-white font-medium">{t('messages.pending')}</h2>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {loading ? (
              <>
                <SkeletonCard />
                <SkeletonCard />
              </>
            ) : messages.length === 0 ? (
              <div className="text-center text-[#78716C] py-8">{t('messages.empty')}</div>
            ) : (
              messages.map((msg) => (
                <button
                  key={msg.id}
                  onClick={() => setSelectedId(msg.id)}
                  className={`w-full text-left p-4 rounded-xl border transition-all ${
                    selectedId === msg.id 
                      ? "border-[#d4a853] bg-[#44403C]" 
                      : "border-[#44403C] hover:border-[#57534E] hover:bg-[#44403C]"
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-full bg-[#44403C] flex items-center justify-center">
                      <MessageSquare size={14} className={selectedId === msg.id ? "text-[#d4a853]" : "text-[#A8A29E]"} />
                    </div>
                    <div>
                      <div className={`font-medium ${selectedId === msg.id ? "text-white" : "text-[#A8A29E]"}`}>
                        {t('messages.draft')} #{msg.id.slice(-4)}
                      </div>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Right pane - Preview */}
        <div className="flex-1 bg-[#292524] border border-[#44403C] rounded-xl flex flex-col overflow-hidden">
          {selectedMsg ? (
            <>
              {/* Tab Bar */}
              <div className="flex border-b border-[#44403C] bg-[#44403C]">
                <button
                  onClick={() => setLang("EN")}
                  className={`flex-1 py-4 text-sm font-medium transition-colors relative ${
                    lang === "EN" ? "text-[#d4a853]" : "text-[#A8A29E] hover:text-white"
                  }`}
                >
                  English
                  {lang === "EN" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#d4a853]" />}
                </button>
                <button
                  onClick={() => setLang("FR")}
                  className={`flex-1 py-4 text-sm font-medium transition-colors relative ${
                    lang === "FR" ? "text-[#d4a853]" : "text-[#A8A29E] hover:text-white"
                  }`}
                >
                  Français
                  {lang === "FR" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#d4a853]" />}
                </button>
              </div>

              {/* Chat UI */}
              <div className="flex-1 bg-black/50 p-6 flex flex-col items-center justify-center overflow-y-auto relative bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]">
                {/* Header mimicking WhatsApp */}
                <div className="w-full max-w-sm bg-[#44403C] rounded-t-2xl p-4 flex items-center gap-3 border-b border-[#57534E] shadow-lg absolute top-6">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2L22 12L12 22L2 12L12 2Z" fill="#d4a853" />
                  </svg>
                  <div>
                    <div className="text-white font-medium text-sm">GuestValue Concierge</div>
                    <div className="text-green-500 text-[10px]">{t('messages.online')}</div>
                  </div>
                </div>

                {/* Message Bubble */}
                <div className="w-full max-w-sm mt-24">
                  <div className="bg-white text-black rounded-2xl rounded-tl-sm p-4 shadow-xl whitespace-pre-wrap text-[15px] leading-relaxed relative">
                    {lang === "EN" ? selectedMsg.draftEN : selectedMsg.draftFN}
                    
                    {/* Timestamp inside bubble bottom right */}
                    <div className="text-[#A8A29E] text-[10px] text-right mt-2 flex justify-end items-center gap-1">
                      {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      <Check size={12} className="text-blue-500" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Bar */}
              <div className="p-4 bg-[#44403C] border-t border-[#44403C] flex justify-end">
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-2 bg-[#d4a853] text-black px-6 py-2 rounded-lg hover:bg-[#c39b4c] transition-colors font-medium"
                >
                  {copied ? <Check size={18} /> : <Copy size={18} />}
                  {copied ? t('messages.copied') : t('messages.copy')}
                </button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-[#78716C]">
              <div className="text-center">
                <MessageSquare size={48} className="mx-auto mb-4 opacity-20" />
                <p>{t('messages.selectToPreview')}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
