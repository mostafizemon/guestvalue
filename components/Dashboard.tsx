"use client";

import { useEffect, useState } from "react";
import { Users, Star, Sparkles, DollarSign } from "lucide-react";
import { KPICard } from "./KPICard";
import { SkeletonCard } from "./SkeletonCard";

export function Dashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [clientsRes, expRes, recRes, salesRes] = await Promise.all([
          fetch("/api/clients"),
          fetch("/api/experiences"),
          fetch("/api/recommendations"),
          fetch("/api/sales"),
        ]);

        const [clients, experiences, recommendations, salesData] = await Promise.all([
          clientsRes.json(),
          expRes.json(),
          recRes.json(),
          salesRes.json(),
        ]);

        setData({
          clients: Array.isArray(clients) ? clients : [],
          experiences: Array.isArray(experiences) ? experiences : [],
          recommendations: Array.isArray(recommendations) ? recommendations : [],
          salesData: salesData && typeof salesData === 'object' && salesData.sales ? salesData : { sales: [], totalPipeline: 0 }
        });
      } catch (error) {
        console.error("Error fetching dashboard data", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Vue d'ensemble</h1>
          <p className="text-[#a0a0a0] text-sm">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
        <button className="bg-[#1a1a1a] border border-[#333] text-white px-4 py-2 rounded-lg hover:bg-[#222] transition-colors text-sm font-medium">
          Export Report
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {loading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : (
          <>
            <KPICard label="Total Clients" value={data.clients.length} icon={<Users />} />
            <KPICard label="Experiences" value={data.experiences.length} icon={<Star />} />
            <KPICard label="Recommendations" value={data.recommendations.length} icon={<Sparkles />} />
            <KPICard label="Pipeline Revenue" value={formatter.format(data.salesData.totalPipeline)} icon={<DollarSign />} trend="+12.5%" />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-3 bg-[#111] border border-[#222] rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-6">Recent Recommendations</h2>
          {loading ? (
            <div className="space-y-4">
              <SkeletonCard />
              <SkeletonCard />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[#606060] text-sm border-b border-[#222]">
                    <th className="pb-3 font-medium">Client</th>
                    <th className="pb-3 font-medium">Experience</th>
                    <th className="pb-3 font-medium text-center">Score</th>
                    <th className="pb-3 font-medium text-right">Revenue</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#222]">
                  {data.recommendations.slice(0, 5).map((rec: any) => (
                    <tr key={rec.id} className="hover:bg-[#1a1a1a] transition-colors">
                      <td className="py-4 text-white text-sm">{rec.clientName}</td>
                      <td className="py-4 text-[#a0a0a0] text-sm">{rec.selectedExperience}</td>
                      <td className="py-4 text-center">
                        <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold ${
                          rec.matchScore >= 80 ? 'bg-green-900/30 text-green-500 border border-green-800' :
                          rec.matchScore >= 50 ? 'bg-amber-900/30 text-amber-500 border border-amber-800' :
                          'bg-red-900/30 text-red-500 border border-red-800'
                        }`}>
                          {rec.matchScore}
                        </span>
                      </td>
                      <td className="py-4 text-right text-white font-medium text-sm">
                        {formatter.format(rec.sales)}
                      </td>
                    </tr>
                  ))}
                  {data.recommendations.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-[#606060]">No recommendations found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="lg:col-span-2 bg-[#111] border border-[#222] rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-6">Recent Clients</h2>
          {loading ? (
            <div className="space-y-4">
              <SkeletonCard />
              <SkeletonCard />
            </div>
          ) : (
            <div className="space-y-4">
              {data.clients.slice(0, 5).map((client: any) => (
                <div key={client.id} className="flex justify-between items-center p-3 rounded-lg hover:bg-[#1a1a1a] border border-transparent hover:border-[#333] transition-colors">
                  <div>
                    <p className="text-white font-medium text-sm">{client.name}</p>
                    <p className="text-[#606060] text-xs mt-1">{client.destination}</p>
                  </div>
                  <div>
                    <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded-full border ${
                      client.budget === 'Ultra' 
                        ? 'border-[#d4a853] text-[#d4a853] bg-[#d4a853]/10' 
                        : 'border-[#606060] text-[#a0a0a0] bg-transparent'
                    }`}>
                      {client.budget}
                    </span>
                  </div>
                </div>
              ))}
              {data.clients.length === 0 && (
                <div className="py-8 text-center text-[#606060]">No clients found</div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
