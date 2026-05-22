"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface CreateClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateClientModal({ isOpen, onClose, onSuccess }: CreateClientModalProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [formData, setFormData] = useState({
    name: "",
    destination: "",
    stayDuration: "",
    budget: "High",
  });
  const [loading, setLoading] = useState(false);
  const { t } = useLanguage();

  if (!isOpen) return null;

  const handleNext = () => setStep((s) => (s + 1) as 1 | 2 | 3);
  const handleBack = () => setStep((s) => (s - 1) as 1 | 2 | 3);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          destination: formData.destination,
          stayDuration: Number(formData.stayDuration),
          budget: formData.budget,
        }),
      });

      if (!res.ok) throw new Error("Failed to create client");
      onSuccess();
      onClose();
      // Reset form
      setStep(1);
      setFormData({ name: "", destination: "", stayDuration: "", budget: "High" });
    } catch (error) {
      console.error(error);
      alert("Error creating client");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-[#292524] border border-[#44403C] rounded-2xl p-8 w-full max-w-lg shadow-2xl relative">
        <div className="flex justify-center gap-2 mb-8">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full ${
                step >= i ? "bg-[#d4a853]" : "bg-[#57534E]"
              }`}
            />
          ))}
        </div>

        {step === 1 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
            <h2 className="text-xl font-bold text-white mb-6">{t('modal.step1')}</h2>
            <div>
              <label className="block text-sm text-[#A8A29E] mb-1">{t('modal.name')}</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-[#44403C] border border-[#57534E] rounded-lg p-3 text-white focus:border-[#d4a853] focus:outline-none transition-colors"
                placeholder={t('modal.namePlaceholder')}
              />
            </div>
            <div>
              <label className="block text-sm text-[#A8A29E] mb-1">{t('modal.destination')}</label>
              <input
                type="text"
                value={formData.destination}
                onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                className="w-full bg-[#44403C] border border-[#57534E] rounded-lg p-3 text-white focus:border-[#d4a853] focus:outline-none transition-colors"
                placeholder={t('modal.destinationPlaceholder')}
              />
            </div>
            <div>
              <label className="block text-sm text-[#A8A29E] mb-1">{t('modal.stay')}</label>
              <input
                type="number"
                value={formData.stayDuration}
                onChange={(e) => setFormData({ ...formData, stayDuration: e.target.value })}
                className="w-full bg-[#44403C] border border-[#57534E] rounded-lg p-3 text-white focus:border-[#d4a853] focus:outline-none transition-colors"
                placeholder={t('modal.stayPlaceholder')}
              />
            </div>
            <div className="flex justify-end gap-3 mt-8">
              <button onClick={onClose} className="px-4 py-2 text-[#A8A29E] hover:text-white transition-colors">{t('modal.cancel')}</button>
              <button
                onClick={handleNext}
                disabled={!formData.name || !formData.destination || !formData.stayDuration}
                className="bg-[#d4a853] text-black font-medium px-6 py-2 rounded-lg hover:bg-[#c39b4c] transition-colors disabled:opacity-50"
              >
                {t('modal.next')}
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
            <h2 className="text-xl font-bold text-white mb-6">{t('modal.step2')}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                onClick={() => setFormData({ ...formData, budget: "High" })}
                className={`text-left p-5 rounded-xl border-2 transition-all ${
                  formData.budget === "High"
                    ? "border-white bg-[#44403C]"
                    : "border-[#57534E] bg-transparent hover:border-[#57534E]"
                }`}
              >
                <div className={`text-lg font-bold mb-2 ${formData.budget === "High" ? "text-white" : "text-[#A8A29E]"}`}>{t('modal.highBudget')}</div>
                <div className="text-sm text-[#78716C]">{t('modal.highSubtitle')}</div>
              </button>
              
              <button
                onClick={() => setFormData({ ...formData, budget: "Ultra" })}
                className={`text-left p-5 rounded-xl border-2 transition-all relative ${
                  formData.budget === "Ultra"
                    ? "border-[#d4a853] bg-[#44403C]"
                    : "border-[#57534E] bg-transparent hover:border-[#57534E]"
                }`}
              >
                {formData.budget === "Ultra" && <Star className="absolute top-4 right-4 text-[#d4a853] w-5 h-5 fill-[#d4a853]" />}
                <div className={`text-lg font-bold mb-2 ${formData.budget === "Ultra" ? "text-[#d4a853]" : "text-[#A8A29E]"}`}>{t('modal.ultraBudget')}</div>
                <div className="text-sm text-[#78716C]">{t('modal.ultraSubtitle')}</div>
              </button>
            </div>
            <div className="flex justify-between mt-8">
              <button onClick={handleBack} className="px-4 py-2 text-[#A8A29E] hover:text-white transition-colors">{t('modal.back')}</button>
              <button
                onClick={handleNext}
                className="bg-[#d4a853] text-black font-medium px-6 py-2 rounded-lg hover:bg-[#c39b4c] transition-colors"
              >
                {t('modal.next')}
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
            <h2 className="text-xl font-bold text-white mb-6">{t('modal.step3')}</h2>
            <div className="bg-[#44403C] rounded-xl p-5 space-y-3 border border-[#57534E]">
              <div className="flex justify-between">
                <span className="text-[#78716C]">{t('modal.name')}</span>
                <span className="text-white font-medium">{formData.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#78716C]">{t('modal.destination')}</span>
                <span className="text-white font-medium">{formData.destination}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#78716C]">{t('modal.stay')}</span>
                <span className="text-white font-medium">{formData.stayDuration} {t('clients.days')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#78716C]">{t('suggestions.budget')}</span>
                <span className={formData.budget === "Ultra" ? "text-[#d4a853] font-medium" : "text-white font-medium"}>
                  {formData.budget === "Ultra" ? t('modal.ultraBudget') : t('modal.highBudget')}
                </span>
              </div>
            </div>
            
            <div className="flex justify-between mt-8">
              <button onClick={handleBack} className="px-4 py-2 text-[#A8A29E] hover:text-white transition-colors">{t('modal.back')}</button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="bg-[#d4a853] text-black font-medium px-6 py-2 rounded-lg hover:bg-[#c39b4c] transition-colors disabled:opacity-50"
              >
                {loading ? t('modal.creating') : t('modal.create')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
