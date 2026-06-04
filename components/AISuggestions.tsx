"use client";

import { useEffect, useState, useRef } from "react";
import { Check, Pencil, X, Save, Sparkles, Clock, MapPin, Users, Copy, Send, ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

type Recommendation = {
  id: string;
  clientName: string;
  selectedExperience: string;
  expImageUrls: string[];
  expBasePrice: number;
  expCategory: string;
  matchScore: number;
  aiInsight: string;
  sales: number;
};

const formatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const getScoreStyle = (score: number) => {
  if (score >= 80) return "border-green-200 text-green-600 bg-green-50";
  if (score >= 50) return "border-amber-200 text-amber-600 bg-amber-50";
  return "border-red-200 text-red-600 bg-red-50";
};

// ─── Generic inline editable textarea cell ───────────────────────────────────
function MessageEditor({
  value,
  onSave,
  placeholder = "—",
}: {
  value: string;
  onSave: (newValue: string) => Promise<void>;
  placeholder?: string;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { t } = useLanguage();

  useEffect(() => {
    setDraft(value);
  }, [value]);

  useEffect(() => {
    if (editing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
    }
  }, [editing]);

  const handleSave = async () => {
    if (draft === value) { setEditing(false); return; }
    setSaving(true);
    try {
      await onSave(draft);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      setEditing(false);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setDraft(value);
    setEditing(false);
  };

  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 flex flex-col h-full">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-bold text-[#212529]">{t('suggestions.generatedMessage')} <span className="text-[#6C757D] font-normal">{t('suggestions.fr')}</span></h3>
        {!editing && (
          <button 
            onClick={() => { setDraft(value); setEditing(true); }}
            className="flex items-center gap-1.5 text-xs text-[#6C757D] hover:text-[#C09A51] font-medium transition-colors"
          >
            {saved ? <Check size={14} className="text-green-500" /> : <><Pencil size={14} /> {t('suggestions.edit')}</>}
          </button>
        )}
      </div>

      {editing ? (
        <div className="flex flex-col gap-3 flex-1">
          <textarea
            ref={textareaRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            className="w-full flex-1 text-sm text-[#212529] border border-[#C09A51] rounded-xl p-3 resize-none focus:outline-none focus:ring-2 focus:ring-[#C09A51]/30 min-h-[150px]"
          />
          <div className="flex gap-2 justify-end mt-2">
            <button
              onClick={handleCancel}
              className="flex items-center gap-1 text-xs font-bold text-[#6C757D] hover:text-[#212529] px-3 py-2 rounded-lg transition-colors"
            >
              <X size={14} /> {t('modal.cancel')}
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-1 text-xs font-bold bg-[#C09A51] text-white px-4 py-2 rounded-xl hover:bg-[#A98440] transition-colors disabled:opacity-60"
            >
              {saving ? (
                <div className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              ) : (
                <Save size={14} />
              )}
              {t('suggestions.save')}
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col flex-1">
          <div className="text-sm text-[#495057] whitespace-pre-wrap flex-1 leading-relaxed">
            {value || <span className="italic text-[#ADB5BD]">{placeholder}</span>}
          </div>
          <div className="flex justify-end items-center gap-3 mt-6 pt-4 border-t border-gray-100">
            <button className="flex items-center gap-2 text-sm font-bold text-[#212529] border border-gray-200 px-4 py-2 rounded-xl hover:bg-gray-50 transition-colors">
              <Copy size={16} /> {t('suggestions.copyMessage')}
            </button>
            <button className="flex items-center gap-2 text-sm font-bold bg-[#C09A51] text-white px-5 py-2 rounded-xl hover:bg-[#A98440] transition-colors">
              <Send size={16} /> {t('suggestions.sendToClient')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export function AISuggestions() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedClient, setSelectedClient] = useState<string | null>(null);
  const [selectedRecId, setSelectedRecId] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { t } = useLanguage();

  useEffect(() => {
    fetch("/api/recommendations")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setRecommendations(data);
          const clients = Array.from(new Set(data.map((r) => r.clientName))).sort();
          if (clients.length > 0) setSelectedClient(clients[0]);
        } else {
          setError(t('suggestions.errorLoading'));
        }
      })
      .catch(() => setError(t('suggestions.errorLoadingFallback')))
      .finally(() => setLoading(false));
  }, []);

  const clientRecs = recommendations
    .filter((r) => r.clientName === selectedClient)
    .sort((a, b) => b.matchScore - a.matchScore);

  useEffect(() => {
    if (clientRecs.length > 0) {
      if (!clientRecs.find((r) => r.id === selectedRecId)) {
        setSelectedRecId(clientRecs[0].id);
      }
    } else {
      setSelectedRecId(null);
    }
  }, [clientRecs, selectedRecId]);

  const activeRec = clientRecs.find((r) => r.id === selectedRecId) || clientRecs[0];

  useEffect(() => {
    setCurrentImageIndex(0);
  }, [activeRec?.id]);

  const handleSaveInsight = async (recId: string, newValue: string) => {
    await fetch("/api/recommendations", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: recId, aiInsight: newValue }),
    });
    setRecommendations((prev) =>
      prev.map((r) => (r.id === recId ? { ...r, aiInsight: newValue } : r))
    );
  };

  const clients = Array.from(new Set(recommendations.map((r) => r.clientName))).sort();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-[#C09A51]/30 border-t-[#C09A51] rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-sm font-medium">
        {error}
      </div>
    );
  }

  if (recommendations.length === 0) {
    return (
      <div className="p-12 text-center text-[#6C757D] font-medium bg-white rounded-2xl border border-gray-100 shadow-sm">
        {t('suggestions.empty')}
      </div>
    );
  }

  return (
    <div className="flex gap-6 max-w-full mx-auto h-[calc(100vh-8rem)]">
      {/* Client Sidebar */}
      <div className="w-64 bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden flex flex-col">
        <div className="p-4 border-b border-gray-100 bg-gray-50/50">
          <h2 className="text-sm font-bold text-[#212529] uppercase tracking-wider">{t('suggestions.clientsTitle')}</h2>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {clients.map((client) => {
            const isActive = client === selectedClient;
            return (
              <button
                key={client}
                onClick={() => setSelectedClient(client)}
                className={`w-full text-left px-4 py-3 rounded-xl transition-all ${
                  isActive
                    ? "bg-[#C09A51]/10 text-[#C09A51] font-bold"
                    : "text-[#495057] hover:bg-gray-50 font-medium"
                }`}
              >
                {client}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto pr-2">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-[#212529]">{selectedClient}</h1>
            <p className="text-[#6C757D] text-sm font-medium mt-1 uppercase tracking-wider">
              {t('suggestions.title')}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button className="px-5 py-2 text-sm font-bold text-[#C09A51] border border-[#C09A51] rounded-full hover:bg-[#C09A51]/5 transition-colors">
              {t('suggestions.markSent')}
            </button>
            <button className="w-10 h-10 flex items-center justify-center text-[#6C757D] border border-gray-200 rounded-full hover:bg-gray-50 transition-colors">
              <MoreHorizontal size={20} />
            </button>
          </div>
        </div>

        {activeRec ? (
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
            
            {/* Left Detail Panel */}
            <div className="xl:col-span-7 bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden flex flex-col">
              {/* Image Hero */}
              <div className="relative h-72 w-full bg-gray-200">
                {activeRec.expImageUrls && activeRec.expImageUrls.length > 0 ? (
                  <img src={activeRec.expImageUrls[currentImageIndex]} alt={activeRec.selectedExperience} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[#ADB5BD]">{t('suggestions.noImage')}</div>
                )}
                
                {/* Navigation arrows */}
                {activeRec.expImageUrls && activeRec.expImageUrls.length > 1 && (
                  <>
                    <button 
                      onClick={() => setCurrentImageIndex((prev) => (prev === 0 ? activeRec.expImageUrls.length - 1 : prev - 1))}
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 backdrop-blur rounded-full flex items-center justify-center text-gray-800 hover:bg-white transition-colors"
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <button 
                      onClick={() => setCurrentImageIndex((prev) => (prev === activeRec.expImageUrls.length - 1 ? 0 : prev + 1))}
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 backdrop-blur rounded-full flex items-center justify-center text-gray-800 hover:bg-white transition-colors"
                    >
                      <ChevronRight size={20} />
                    </button>
                  </>
                )}

                {/* Score overlay */}
                <div className="absolute bottom-4 left-4 bg-[#212529]/80 backdrop-blur text-white px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-2">
                  {t('suggestions.score')} <span className="text-[#C09A51]">{activeRec.matchScore}</span>
                </div>
              </div>

              {/* Details Content */}
              <div className="p-6 flex-1">
                <h2 className="text-2xl font-bold text-[#212529] mb-4">{activeRec.selectedExperience}</h2>
                
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-1 bg-[#C09A51]/10 rounded">
                    <Sparkles size={14} className="text-[#C09A51]" />
                  </div>
                  <h3 className="text-sm font-bold text-[#212529]">{t('suggestions.overviewTab')}</h3>
                </div>
                
                {/* Mock description since it's not in Airtable */}
                <p className="text-sm text-[#495057] leading-relaxed mb-6">
                  {t('suggestions.mockDesc', { experience: activeRec.selectedExperience, category: activeRec.expCategory })}
                </p>

                {/* Mock Details */}
                <div className="grid grid-cols-3 gap-4 mb-8">
                  <div>
                    <div className="flex items-center gap-1.5 text-[#6C757D] mb-1">
                      <Clock size={14} />
                      <span className="text-xs font-bold uppercase tracking-wider">{t('suggestions.duration')}</span>
                    </div>
                    <span className="text-sm font-medium text-[#212529]">2h - 4h</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 text-[#6C757D] mb-1">
                      <MapPin size={14} />
                      <span className="text-xs font-bold uppercase tracking-wider">{t('suggestions.location')}</span>
                    </div>
                    <span className="text-sm font-medium text-[#212529]">Saint-Barthélemy</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 text-[#6C757D] mb-1">
                      <Users size={14} />
                      <span className="text-xs font-bold uppercase tracking-wider">{t('suggestions.participants')}</span>
                    </div>
                    <span className="text-sm font-medium text-[#212529]">1-6 pers.</span>
                  </div>
                </div>

                {/* Tags (Derived from category for now) */}
                <div className="flex flex-wrap gap-2 mb-6">
                  <span className="px-3 py-1 bg-gray-100 text-[#495057] rounded-full text-xs font-bold">Vue panoramique</span>
                  <span className="px-3 py-1 bg-gray-100 text-[#495057] rounded-full text-xs font-bold">Exclusif</span>
                  <span className="px-3 py-1 bg-gray-100 text-[#495057] rounded-full text-xs font-bold">{activeRec.expCategory}</span>
                </div>

                {/* Dynamic gallery thumbnails */}
                {activeRec.expImageUrls && activeRec.expImageUrls.length > 0 && (
                  <div className="flex gap-3">
                    {activeRec.expImageUrls.map((url, idx) => (
                      <button 
                        key={idx}
                        onClick={() => setCurrentImageIndex(idx)}
                        className={`w-24 h-16 rounded-xl overflow-hidden transition-all ${currentImageIndex === idx ? 'border-2 border-[#C09A51] opacity-100' : 'opacity-60 hover:opacity-100'}`}
                      >
                        <img src={url} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right Panel (List + Message + Status) */}
            <div className="xl:col-span-5 flex flex-col gap-6 h-full">
              
              {/* Recommendations List */}
              <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
                <div className="flex items-center gap-3 mb-4">
                  <h3 className="text-sm font-bold text-[#212529]">{t('suggestions.recommendationsFor', { client: selectedClient || "" })}</h3>
                  <span className="text-[10px] font-bold text-[#C09A51] bg-[#C09A51]/10 px-2 py-0.5 rounded-full">
                    {t('suggestions.experiencesCount', { count: clientRecs.length })}
                  </span>
                </div>

                <div className="space-y-3">
                  {clientRecs.map((rec, index) => {
                    const isSelected = rec.id === selectedRecId;
                    return (
                      <div 
                        key={rec.id}
                        onClick={() => setSelectedRecId(rec.id)}
                        className={`flex items-center gap-4 p-3 rounded-xl border cursor-pointer transition-all ${
                          isSelected ? "border-[#C09A51] bg-[#C09A51]/5 shadow-sm" : "border-gray-100 hover:border-gray-300"
                        }`}
                      >
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                          isSelected ? "bg-[#212529] text-white" : "bg-gray-100 text-[#495057]"
                        }`}>
                          {index + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-bold text-[#212529] text-sm truncate">{rec.selectedExperience}</div>
                        </div>
                        <div className="flex items-center gap-4 flex-shrink-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] text-[#6C757D] uppercase tracking-wider font-bold">{t('table.score')}</span>
                            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border ${getScoreStyle(rec.matchScore)}`}>
                              {rec.matchScore}
                            </span>
                          </div>
                          <div className="text-right">
                            <div className="text-[10px] text-[#6C757D] uppercase tracking-wider font-bold">{t('suggestions.quote')}</div>
                            <div className="font-bold text-[#C09A51] text-sm">
                              {formatter.format(rec.expBasePrice)}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Generated Message (Editable) */}
              <div className="flex-1">
                <MessageEditor
                  value={activeRec.aiInsight}
                  onSave={(val) => handleSaveInsight(activeRec.id, val)}
                  placeholder={t('suggestions.noMessage')}
                />
              </div>

              {/* Status Dropdown */}
              <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-4 flex items-center gap-4">
                <span className="text-sm font-bold text-[#495057]">{t('suggestions.proposalStatus')}</span>
                <select className="flex-1 bg-gray-50 border border-gray-200 text-[#212529] text-sm font-medium rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#C09A51]/30">
                  <option value="preparation">{t('suggestions.status.prep')}</option>
                  <option value="sent">{t('suggestions.status.sent')}</option>
                  <option value="accepted">{t('suggestions.status.accepted')}</option>
                  <option value="declined">{t('suggestions.status.declined')}</option>
                </select>
              </div>

            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
