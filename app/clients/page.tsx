"use client";

import { useEffect, useState } from "react";
import { CreateClientModal } from "@/components/CreateClientModal";
import { SkeletonCard } from "@/components/SkeletonCard";
import { useLanguage } from "@/contexts/LanguageContext";

export default function ClientsPage() {
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toast, setToast] = useState<{ show: boolean; message: string }>({ show: false, message: "" });
  const { t } = useLanguage();

  const fetchClients = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/clients");
      const data = await res.json();
      if (Array.isArray(data)) {
        setClients(data);
      } else {
        setClients([]);
      }
    } catch (error) {
      console.error("Failed to fetch clients", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const handleSuccess = () => {
    fetchClients();
    setToast({ show: true, message: "Client created successfully" });
    setTimeout(() => setToast({ show: false, message: "" }), 3000);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 relative min-h-screen">
      <div className="flex justify-between items-center border-b border-[#44403C] pb-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">{t('clients.title')}</h1>
          <p className="text-[#A8A29E]">{t('clients.subtitle')}</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-[#d4a853] text-black px-6 py-2 rounded-lg hover:bg-[#c39b4c] transition-colors font-medium"
        >
          {t('clients.add')}
        </button>
      </div>

      <div className="bg-[#292524] border border-[#44403C] rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-4">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-[#44403C] border-b border-[#44403C]">
                <tr className="text-[#A8A29E] text-sm">
                  <th className="p-4 font-medium">{t('clients.table.name')}</th>
                  <th className="p-4 font-medium">{t('clients.table.budget')}</th>
                  <th className="p-4 font-medium">{t('clients.table.destination')}</th>
                  <th className="p-4 font-medium">{t('clients.table.stay')}</th>
                  <th className="p-4 font-medium text-right">{t('clients.table.linked')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#44403C]">
                {clients.map((client) => (
                  <tr key={client.id} className="hover:bg-[#44403C]/50 transition-colors">
                    <td className="p-4 text-white font-medium">{client.name}</td>
                    <td className="p-4">
                      <span className={`text-xs uppercase tracking-wider font-bold px-2 py-1 rounded-full border ${
                        client.budget === 'Ultra' 
                          ? 'border-[#d4a853] text-[#d4a853] bg-[#d4a853]/10' 
                          : 'border-[#78716C] text-[#A8A29E] bg-transparent'
                      }`}>
                        {client.budget === 'Ultra' ? t('modal.ultraBudget') : t('modal.highBudget')}
                      </span>
                    </td>
                    <td className="p-4 text-[#A8A29E]">{client.destination}</td>
                    <td className="p-4 text-[#A8A29E]">{client.stayDuration} {t('clients.days')}</td>
                    <td className="p-4 text-right text-[#A8A29E]">—</td>
                  </tr>
                ))}
                {clients.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-[#78716C]">{t('clients.empty')}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <CreateClientModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleSuccess}
      />

      {toast.show && (
        <div className="fixed bottom-8 right-8 bg-[#22c55e]/20 border border-[#22c55e] text-[#22c55e] px-6 py-4 rounded-xl shadow-2xl animate-in slide-in-from-bottom-8">
          {toast.message}
        </div>
      )}
    </div>
  );
}
