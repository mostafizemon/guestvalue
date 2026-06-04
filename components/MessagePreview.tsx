"use client";

import { useState, useEffect, useRef } from "react";
import { MessageSquare, ArrowRight, RefreshCw, Send, Check, Sparkles, Pencil, X, Save, Copy } from "lucide-react";
import { SkeletonCard } from "./SkeletonCard";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSearchParams } from "next/navigation";

// ─── Types ────────────────────────────────────────────────────────────────────
type Message = {
  id: string;
  clientName: string;
  draftEN: string;
  draftFN: string;
  link: string;
  recommendationId: string | null;
};

// ─── Inline editable textarea ─────────────────────────────────────────────────
function EditableText({
  value,
  onSave,
  rows = 5,
}: {
  value: string;
  onSave: (v: string) => Promise<void>;
  rows?: number;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => { setDraft(value); }, [value]);
  useEffect(() => { if (editing && ref.current) { ref.current.focus(); ref.current.select(); } }, [editing]);

  const handleSave = async () => {
    if (draft === value) { setEditing(false); return; }
    setSaving(true);
    try {
      await onSave(draft);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      setEditing(false);
    } finally {
      setSaving(false);
    }
  };

  if (editing) {
    return (
      <div className="flex flex-col gap-2">
        <textarea
          ref={ref}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          rows={rows}
          className="w-full text-sm text-[#212529] border border-[#C09A51] rounded-xl p-3 resize-y focus:outline-none focus:ring-2 focus:ring-[#C09A51]/30 leading-relaxed"
        />
        <div className="flex gap-2 justify-end">
          <button
            onClick={() => { setDraft(value); setEditing(false); }}
            className="flex items-center gap-1 text-xs font-bold text-[#6C757D] hover:text-[#212529] px-3 py-1.5 rounded-lg transition-colors border border-gray-200"
          >
            <X size={13} /> Annuler
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-1 text-xs font-bold bg-[#C09A51] text-white px-4 py-1.5 rounded-lg hover:bg-[#A98440] transition-colors disabled:opacity-60"
          >
            {saving ? <div className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <Save size={13} />}
            Enregistrer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="group relative">
      <p className="text-sm text-[#6C757D] leading-relaxed whitespace-pre-wrap pr-7">
        {value || <span className="italic text-[#ADB5BD]">—</span>}
      </p>
      <button
        onClick={() => { setDraft(value); setEditing(true); }}
        className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 text-[#ADB5BD] hover:text-[#C09A51] transition-all"
        title="Modifier"
      >
        {saved ? <Check size={15} className="text-green-500" /> : <Pencil size={15} />}
      </button>
    </div>
  );
}

// ─── Per-client message card ──────────────────────────────────────────────────
const AVATAR_COLORS = [
  "bg-blue-100 text-blue-700", "bg-purple-100 text-purple-700",
  "bg-teal-100 text-teal-700",  "bg-indigo-100 text-indigo-700",
  "bg-amber-100 text-amber-700","bg-rose-100 text-rose-700",
];

function MessageCard({
  msg,
  idx,
  lang,
  onChange,
}: {
  msg: Message;
  idx: number;
  lang: "EN" | "FR";
  onChange: (id: string, field: "draftEN" | "draftFN", val: string) => void;
}) {
  const [copiedField, setCopiedField] = useState<"EN" | "FR" | null>(null);

  const initials = msg.clientName
    .split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase();

  const handleCopy = (field: "EN" | "FR", text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const saveField = async (field: "draftEN" | "draftFN", val: string) => {
    const body: Record<string, string> = { id: msg.id };
    if (field === "draftEN") body.draftEN = val;
    else body.draftFN = val;

    await fetch("/api/messages", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    onChange(msg.id, field, val);
  };

  const activeText = lang === "EN" ? msg.draftEN : msg.draftFN;
  const activeField = lang === "EN" ? "draftEN" : "draftFN";

  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
      {/* Card header */}
      <div className="flex items-center gap-4 px-6 py-4 border-b border-gray-50">
        <div
          className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${AVATAR_COLORS[idx % AVATAR_COLORS.length]}`}
        >
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[#212529] font-bold text-sm">{msg.clientName}</p>
          {msg.link && (
            <a
              href={msg.link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] text-[#C09A51] hover:underline font-medium"
            >
              Voir la proposition →
            </a>
          )}
        </div>
        {/* Copy active language */}
        <button
          onClick={() => handleCopy(lang, activeText)}
          className="flex items-center gap-1.5 text-[11px] font-bold text-[#6C757D] hover:text-[#212529] border border-gray-200 px-3 py-1.5 rounded-lg transition-colors"
          title={`Copier (${lang})`}
        >
          {copiedField === lang ? (
            <><Check size={13} className="text-green-500" /> Copié !</>
          ) : (
            <><Copy size={13} /> Copier ({lang})</>
          )}
        </button>
      </div>

      {/* Message body — shows the selected language draft, editable */}
      <div className="px-6 py-5">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#ADB5BD]">
            Message ({lang})
          </span>
          <span className="text-[9px] font-medium bg-[#C09A51]/10 text-[#C09A51] px-2 py-0.5 rounded-full">
            éditable
          </span>
        </div>
        <EditableText
          key={`${msg.id}-${lang}`}
          value={activeText}
          rows={6}
          onSave={(val) => saveField(activeField, val)}
        />
      </div>
    </div>
  );
}

// ─── Saved Messages List (shown when no URL params) ───────────────────────────
function SavedMessagesList() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [lang, setLang] = useState<"EN" | "FR">("FR");
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/messages")
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setMessages(data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (id: string, field: "draftEN" | "draftFN", val: string) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, [field]: val } : m))
    );
  };

  const filtered = messages.filter((m) =>
    m.clientName.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="space-y-4 p-6">
        <SkeletonCard /><SkeletonCard /><SkeletonCard />
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-[#6C757D]">
        <MessageSquare size={48} className="opacity-20 mb-4" />
        <h2 className="text-xl font-bold text-[#212529] mb-2">Aucune proposition en cours</h2>
        <p className="text-sm text-center max-w-xs text-[#6C757D]">
          Les messages générés depuis les recommandations apparaîtront ici.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-[900px] mx-auto">
      {/* Header */}
      <div className="border-b border-gray-200 pb-6 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-[28px] font-bold text-[#212529] mb-1">Sélection du Concierge</h1>
          <p className="text-[#6C757D] text-sm font-medium">
            {messages.length} message{messages.length > 1 ? "s" : ""} — cliquez sur le texte pour modifier
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Language toggle */}
          <div className="flex bg-gray-100 rounded-lg p-1 w-[110px]">
            <button
              onClick={() => setLang("FR")}
              className={`flex-1 py-1.5 text-[10px] uppercase tracking-wider font-bold rounded-md transition-all ${
                lang === "FR" ? "bg-white text-[#212529] shadow-sm" : "text-[#ADB5BD] hover:text-[#6C757D]"
              }`}
            >
              FR
            </button>
            <button
              onClick={() => setLang("EN")}
              className={`flex-1 py-1.5 text-[10px] uppercase tracking-wider font-bold rounded-md transition-all ${
                lang === "EN" ? "bg-white text-[#212529] shadow-sm" : "text-[#ADB5BD] hover:text-[#6C757D]"
              }`}
            >
              EN
            </button>
          </div>
        </div>
      </div>

      {/* Search */}
      <input
        type="text"
        placeholder="Rechercher un client..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-[#212529] focus:outline-none focus:border-[#C09A51] focus:ring-1 focus:ring-[#C09A51]/30 transition-all"
      />

      {/* Cards */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <p className="text-center text-[#ADB5BD] text-sm py-8">Aucun résultat pour « {search} »</p>
        ) : (
          filtered.map((msg, idx) => (
            <MessageCard
              key={msg.id}
              msg={msg}
              idx={idx}
              lang={lang}
              onChange={handleChange}
            />
          ))
        )}
      </div>
    </div>
  );
}

// ─── Message Generator (shown when ?client= & ?exps= params present) ──────────
function MessageGenerator({ clientId, expQuery }: { clientId: string; expQuery: string }) {
  const [clientProfile, setClientProfile] = useState<any>(null);
  const [selectedExps, setSelectedExps] = useState<any[]>([]);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [drafts, setDrafts] = useState<{ EN: string; FR: string } | null>(null);
  const [generating, setGenerating] = useState(false);
  const [lang, setLang] = useState<"EN" | "FR">("FR");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function fetchDetails() {
      try {
        const expIds = expQuery.split(",");
        const [clientsRes, expsRes] = await Promise.all([
          fetch("/api/clients"),
          fetch("/api/experiences"),
        ]);
        const clientsData = await clientsRes.json();
        const expsData = await expsRes.json();
        setClientProfile(clientsData.find((x: any) => x.id === clientId));
        setSelectedExps(expsData.filter((x: any) => expIds.includes(x.id)));
      } catch { console.error("Failed to load details"); }
      finally { setLoadingInitial(false); }
    }
    fetchDetails();
  }, [clientId, expQuery]);

  const handleGenerate = async () => {
    if (!clientId || selectedExps.length === 0) return;
    setGenerating(true);
    try {
      const res = await fetch("/api/messages/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId, experienceIds: selectedExps.map((e) => e.id) }),
      });
      const data = await res.json();
      if (data.draftEN && data.draftFR) setDrafts({ EN: data.draftEN, FR: data.draftFR });
    } catch { console.error("Generate failed"); }
    finally { setGenerating(false); }
  };

  const formatter = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
  const totalPrice = selectedExps.reduce((acc, curr) => acc + curr.basePrice, 0);

  const handleCopy = () => {
    if (drafts) { navigator.clipboard.writeText(lang === "EN" ? drafts.EN : drafts.FR); setCopied(true); setTimeout(() => setCopied(false), 2000); }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 min-h-screen flex flex-col max-w-[1400px] mx-auto pb-8">
      <div className="border-b border-gray-200 pb-6">
        <h1 className="text-[28px] font-bold text-[#212529] mb-1">Sélection du Concierge</h1>
        <p className="text-[#6C757D] text-sm font-medium">Revoyez et envoyez des propositions de conciergerie sur mesure.</p>
      </div>

      {/* Progress */}
      <div className="w-full max-w-3xl mx-auto py-8">
        <div className="flex items-center justify-between relative">
          <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-0.5 bg-gray-200 -z-10" />
          <div className="absolute left-0 w-3/5 top-1/2 -translate-y-1/2 h-0.5 bg-[#C09A51] -z-10" />
          {[{ step: 1, label: "Client" }, { step: 2, label: "Recommandations" }, { step: 3, label: "Message", active: true }, { step: 4, label: "Aperçu" }, { step: 5, label: "Envoi" }].map((item: any) => (
            <div key={item.step} className="flex flex-col items-center gap-2 bg-[#F8F9FA] px-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${item.active ? "bg-white border-2 border-[#C09A51] text-[#212529]" : item.step < 3 ? "bg-[#C09A51] border-2 border-[#C09A51] text-white" : "bg-white border-2 border-gray-200 text-[#ADB5BD]"}`}>{item.step}</div>
              <span className={`text-[10px] uppercase font-bold tracking-wider ${item.active || item.step < 3 ? "text-[#212529]" : "text-[#ADB5BD]"}`}>{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-6">
        {/* Left: Client */}
        <div className="w-full lg:w-1/4 bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
          <h2 className="text-[#212529] font-bold mb-6 text-sm">Client sélectionné</h2>
          {loadingInitial ? <SkeletonCard /> : clientProfile ? (
            <div className="space-y-4">
              <div><h3 className="text-xl font-bold text-[#212529] mb-1">{clientProfile.name}</h3><p className="text-[#6C757D] text-xs font-medium">{clientProfile.destination}</p></div>
              {[["Type de séjour", clientProfile.stayType], ["Durée", `${clientProfile.stayDuration} jours`], ["Budget", clientProfile.budget], ["Langue", clientProfile.language]].map(([label, val]) => (
                <div key={label}><p className="text-[#ADB5BD] text-[10px] uppercase font-bold tracking-wider mb-1">{label}</p><p className="text-[#212529] text-sm font-semibold">{val}</p></div>
              ))}
            </div>
          ) : null}
        </div>

        {/* Center: Editor */}
        <div className="flex-1 bg-white border border-gray-100 rounded-2xl shadow-sm flex flex-col overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white">
            <h2 className="text-[#212529] font-bold text-sm">Message généré par IA</h2>
            {drafts && (
              <div className="flex bg-gray-100 rounded-lg p-1 w-[120px]">
                {(["FR", "EN"] as const).map((l) => (
                  <button key={l} onClick={() => setLang(l)} className={`flex-1 py-1 text-[10px] uppercase tracking-wider font-bold rounded-md transition-all shadow-sm ${lang === l ? "bg-white text-[#212529]" : "text-[#ADB5BD] hover:text-[#6C757D] shadow-none"}`}>{l}</button>
                ))}
              </div>
            )}
          </div>
          <div className="flex-1 p-8 bg-gray-50/50 overflow-y-auto flex flex-col justify-center min-h-[400px]">
            {generating ? (
              <div className="flex flex-col items-center justify-center text-[#6C757D]">
                <div className="w-10 h-10 border-4 border-[#C09A51]/20 border-t-[#C09A51] rounded-full animate-spin mb-4" />
                <p className="font-bold text-sm">Génération de la proposition...</p>
                <p className="text-xs italic mt-2 text-[#ADB5BD]">Analyse du panier d'expériences en cours...</p>
              </div>
            ) : drafts ? (
              <div className="bg-white text-[#212529] rounded-2xl p-6 shadow-sm whitespace-pre-wrap text-[15px] leading-relaxed border border-gray-100">{lang === "EN" ? drafts.EN : drafts.FR}</div>
            ) : (
              <div className="flex flex-col items-center justify-center text-[#ADB5BD]">
                <MessageSquare size={48} className="opacity-20 mb-4" />
                <button onClick={handleGenerate} className="bg-[#C09A51] text-white px-8 py-3 rounded-lg hover:bg-[#A98440] transition-colors font-bold text-sm shadow-sm flex items-center gap-2"><Sparkles size={16} />Générer le message</button>
              </div>
            )}
          </div>
          {drafts && (
            <div className="p-6 border-t border-gray-100 bg-white flex justify-between items-center">
              <button onClick={handleGenerate} className="bg-white border border-[#C09A51] text-[#C09A51] px-6 py-2.5 rounded-lg hover:bg-[#C09A51]/5 transition-colors font-bold text-sm shadow-sm flex items-center gap-2"><RefreshCw size={16} />Régénérer</button>
              <button onClick={handleCopy} className="bg-gray-100 text-[#212529] px-6 py-2.5 rounded-lg hover:bg-gray-200 transition-colors font-bold text-sm shadow-sm flex items-center gap-2">{copied ? <><Check size={16} className="text-green-600" />Copié !</> : <><Send size={16} />Copier</>}</button>
            </div>
          )}
        </div>

        {/* Right: Summary */}
        <div className="w-full lg:w-1/4 bg-white border border-gray-100 rounded-2xl shadow-sm flex flex-col">
          <div className="p-6 border-b border-gray-100"><h2 className="text-[#212529] font-bold text-sm">Résumé de la proposition</h2></div>
          <div className="flex-1 p-6 space-y-6 overflow-y-auto">
            {loadingInitial ? <SkeletonCard /> : selectedExps.map((exp) => (
              <div key={exp.id} className="flex justify-between items-start gap-4">
                <div className="text-sm font-semibold text-[#212529]">{exp.name}</div>
                <div className="text-sm font-bold text-[#212529]">{formatter.format(exp.basePrice)}</div>
              </div>
            ))}
            {!loadingInitial && selectedExps.length > 0 && (
              <div className="pt-6 border-t border-gray-100 flex justify-between items-center">
                <div className="text-sm font-bold text-[#212529]">Total</div>
                <div className="text-lg font-black text-[#212529]">{formatter.format(totalPrice)}</div>
              </div>
            )}
          </div>
          <div className="p-6 border-t border-gray-100 bg-white mt-auto">
            <button className="w-full bg-[#C09A51] text-white px-6 py-3.5 rounded-lg hover:bg-[#A98440] transition-colors font-bold text-sm shadow-sm flex justify-center items-center gap-2 disabled:opacity-50" disabled={!drafts}>Aperçu et envoi<ArrowRight size={16} /></button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────
export function MessagePreview() {
  const searchParams = useSearchParams();
  const clientId = searchParams.get("client");
  const expQuery = searchParams.get("exps");

  if (clientId && expQuery) {
    return <MessageGenerator clientId={clientId} expQuery={expQuery} />;
  }

  return <SavedMessagesList />;
}
