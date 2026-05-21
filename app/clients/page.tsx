"use client";

import { useEffect, useState } from "react";
import { CreateClientModal } from "@/components/CreateClientModal";
import { SkeletonCard } from "@/components/SkeletonCard";

export default function ClientsPage() {
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toast, setToast] = useState<{ show: boolean; message: string }>({ show: false, message: "" });

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
      <div className="flex justify-between items-center border-b border-[#222] pb-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Clients</h1>
          <p className="text-[#a0a0a0]">Manage your luxury concierge portfolio.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-[#d4a853] text-black px-6 py-2 rounded-lg hover:bg-[#c39b4c] transition-colors font-medium"
        >
          Add Client
        </button>
      </div>

      <div className="bg-[#111] border border-[#222] rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-4">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-[#1a1a1a] border-b border-[#222]">
                <tr className="text-[#a0a0a0] text-sm">
                  <th className="p-4 font-medium">Name</th>
                  <th className="p-4 font-medium">Budget</th>
                  <th className="p-4 font-medium">Destination</th>
                  <th className="p-4 font-medium">Stay Duration</th>
                  <th className="p-4 font-medium text-right">Linked Recs</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#222]">
                {clients.map((client) => (
                  <tr key={client.id} className="hover:bg-[#1a1a1a]/50 transition-colors">
                    <td className="p-4 text-white font-medium">{client.name}</td>
                    <td className="p-4">
                      <span className={`text-xs uppercase tracking-wider font-bold px-2 py-1 rounded-full border ${
                        client.budget === 'Ultra' 
                          ? 'border-[#d4a853] text-[#d4a853] bg-[#d4a853]/10' 
                          : 'border-[#606060] text-[#a0a0a0] bg-transparent'
                      }`}>
                        {client.budget}
                      </span>
                    </td>
                    <td className="p-4 text-[#a0a0a0]">{client.destination}</td>
                    <td className="p-4 text-[#a0a0a0]">{client.stayDuration} days</td>
                    <td className="p-4 text-right text-[#a0a0a0]">—</td>
                  </tr>
                ))}
                {clients.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-[#606060]">No clients found.</td>
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
