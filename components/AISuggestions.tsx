"use client";

import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import { SkeletonCard } from "./SkeletonCard";

export function AISuggestions() {
  const [clients, setClients] = useState<any[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string>("");
  const [loadingClients, setLoadingClients] = useState(true);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchClients() {
      try {
        const res = await fetch("/api/clients");
        const data = await res.json();
        setClients(data);
      } catch (err) {
        console.error("Failed to fetch clients");
      } finally {
        setLoadingClients(false);
      }
    }
    fetchClients();
  }, []);

  const handleGenerate = async () => {
    if (!selectedClientId) return;
    
    setLoadingSuggestions(true);
    setError(null);
    setSuggestions([]);

    try {
      const res = await fetch("/api/recommendations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId: selectedClientId }),
      });

      if (!res.ok) {
        throw new Error("Failed to generate suggestions. Please ensure ANTHROPIC_API_KEY is valid.");
      }

      const data = await res.json();
      if (Array.isArray(data)) {
        setSuggestions(data);
      } else {
        throw new Error("Invalid response format from Claude");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-4xl mx-auto">
      <div className="text-center pb-8 border-b border-[#222]">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-[#1a1a1a] rounded-2xl flex items-center justify-center border border-[#333]">
            <Sparkles className="text-[#d4a853] w-8 h-8" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">AI Suggestions</h1>
        <p className="text-[#a0a0a0]">Powered by Claude</p>
      </div>

      <div className="bg-[#111] border border-[#222] rounded-xl p-6">
        <label className="block text-sm font-medium text-[#a0a0a0] mb-2">Select Client</label>
        <select
          value={selectedClientId}
          onChange={(e) => setSelectedClientId(e.target.value)}
          disabled={loadingClients}
          className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg p-4 text-white focus:border-[#d4a853] focus:outline-none transition-colors appearance-none mb-6"
        >
          <option value="" disabled>Select a client...</option>
          {clients.map((client) => (
            <option key={client.id} value={client.id}>
              {client.name} — {client.destination} ({client.budget} Budget)
            </option>
          ))}
        </select>

        <button
          onClick={handleGenerate}
          disabled={!selectedClientId || loadingSuggestions}
          className="w-full bg-[#d4a853] text-black font-semibold py-4 rounded-lg hover:bg-[#c39b4c] transition-colors disabled:opacity-50 disabled:hover:bg-[#d4a853] flex justify-center items-center gap-2 text-lg"
        >
          <Sparkles size={20} />
          {loadingSuggestions ? "Generating..." : "Generate Suggestions"}
        </button>
      </div>

      {error && (
        <div className="bg-red-900/20 border border-red-800 text-red-400 p-4 rounded-xl text-center">
          {error}
        </div>
      )}

      {loadingSuggestions && (
        <div className="space-y-4">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <p className="text-center text-[#606060] italic text-sm mt-4">Claude is analyzing client profile...</p>
        </div>
      )}

      {suggestions.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-white mb-4">Top Recommendations</h2>
          {suggestions.map((sug, idx) => (
            <div key={idx} className="bg-[#111] border border-[#222] rounded-xl p-6 flex flex-col md:flex-row gap-6 items-center hover:-translate-y-1 transition-all duration-300">
              <div className="flex-shrink-0">
                <div className={`w-20 h-20 rounded-full flex items-center justify-center border-4 ${
                  sug.matchScore >= 80 ? 'border-green-500/20 text-green-500' :
                  sug.matchScore >= 50 ? 'border-amber-500/20 text-amber-500' :
                  'border-red-500/20 text-red-500'
                }`}>
                  <span className="text-2xl font-bold">{sug.matchScore}</span>
                </div>
              </div>
              
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-white text-lg font-bold mb-2">{sug.experienceName}</h3>
                <p className="text-[#a0a0a0] text-sm leading-relaxed mb-3">{sug.reasoning}</p>
                <div className="text-[#d4a853] font-bold">{formatter.format(sug.suggestedPrice)}</div>
              </div>
              
              <div className="w-full md:w-auto">
                <button className="w-full md:w-auto px-6 py-3 border border-[#d4a853] text-[#d4a853] rounded-lg hover:bg-[#d4a853]/10 transition-colors font-medium">
                  Build Proposal
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
