"use client";

import { useEffect, useState } from "react";
import { CreateClientModal } from "@/components/CreateClientModal";
import { SkeletonCard } from "@/components/SkeletonCard";
import { useLanguage } from "@/contexts/LanguageContext";

// Utility to mock missing data for UI
const getRandomStayType = (budget: string, index: number) => {
  if (budget === 'Ultra') return index % 2 === 0 ? 'VIP' : 'Business';
  return index % 2 === 0 ? 'Couple' : 'Famille';
};

const getAvatarColor = (index: number) => {
  const colors = ['bg-blue-100 text-blue-700', 'bg-purple-100 text-purple-700', 'bg-teal-100 text-teal-700', 'bg-indigo-100 text-indigo-700', 'bg-gray-200 text-gray-700'];
  return colors[index % colors.length];
};

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
    <div className="space-y-8 animate-in fade-in duration-500 relative min-h-screen max-w-7xl mx-auto">
      <div className="flex justify-between items-center border-b border-gray-200 pb-6">
        <div>
          <h1 className="text-[28px] font-bold text-[#212529] mb-1">{t('clients.title')}</h1>
          <p className="text-[#6C757D] text-sm font-medium">Gérez et suivez les profils de vos clients.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-[#C09A51] text-white px-6 py-2.5 rounded-lg hover:bg-[#A98440] transition-colors font-bold text-sm shadow-sm"
        >
          Ajouter un client
        </button>
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-6 space-y-4">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-white border-b border-gray-100">
                <tr className="text-[#6C757D] text-xs font-semibold">
                  <th className="p-5">Client</th>
                  <th className="p-5">Type de séjour</th>
                  <th className="p-5">Destination</th>
                  <th className="p-5">Durée</th>
                  <th className="p-5">Complétion</th>
                  <th className="p-5 text-center">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {clients.map((client, idx) => {
                  const initials = client.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase();
                  const type = getRandomStayType(client.budget, idx);
                  const progress = idx % 3 === 0 ? 100 : idx % 2 === 0 ? 50 : 75;
                  const status = progress === 100 ? 'Prêt' : 'En cours';
                  const isReady = status === 'Prêt';

                  return (
                    <tr key={client.id} className="hover:bg-gray-50 transition-colors group">
                      <td className="p-5">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${getAvatarColor(idx)}`}>
                            {initials}
                          </div>
                          <span className="text-[#212529] font-bold text-sm">{client.name}</span>
                        </div>
                      </td>
                      <td className="p-5 text-[#6C757D] text-sm font-medium">{type}</td>
                      <td className="p-5 text-[#6C757D] text-sm font-medium">{client.destination}</td>
                      <td className="p-5 text-[#6C757D] text-sm font-medium">{client.stayDuration} {t('clients.days')}</td>
                      <td className="p-5">
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-bold text-[#212529] w-8">{progress}%</span>
                          <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div className={`h-full ${progress === 100 ? 'bg-green-500' : 'bg-[#C09A51]'}`} style={{ width: `${progress}%` }} />
                          </div>
                        </div>
                      </td>
                      <td className="p-5 text-center">
                        <span className={`text-[10px] font-bold px-3 py-1 rounded-full border ${
                          isReady ? 'bg-green-50 text-green-700 border-green-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}>
                          {status}
                        </span>
                      </td>
                    </tr>
                  )
                })}
                {clients.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-[#6C757D] font-medium">{t('clients.empty')}</td>
                  </tr>
                )}
              </tbody>
            </table>
            
            {!loading && clients.length > 0 && (
              <div className="flex items-center justify-center gap-2 p-4 border-t border-gray-100">
                <button className="w-8 h-8 flex items-center justify-center text-[#ADB5BD] hover:text-[#212529] transition-colors">&lt;</button>
                <button className="w-8 h-8 flex items-center justify-center bg-[#C09A51]/10 text-[#C09A51] border border-[#C09A51]/20 font-bold rounded-md">1</button>
                <button className="w-8 h-8 flex items-center justify-center text-[#6C757D] hover:bg-gray-50 rounded-md">2</button>
                <button className="w-8 h-8 flex items-center justify-center text-[#6C757D] hover:text-[#212529] transition-colors">&gt;</button>
              </div>
            )}
          </div>
        )}
      </div>

      <CreateClientModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleSuccess}
      />

      {toast.show && (
        <div className="fixed bottom-8 right-8 bg-green-50 border border-green-200 text-green-700 px-6 py-4 rounded-xl shadow-lg font-bold animate-in slide-in-from-bottom-8">
          {toast.message}
        </div>
      )}
    </div>
  );
}
