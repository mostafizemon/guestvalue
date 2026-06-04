"use client";

import { useEffect, useState } from "react";
import { Users, Hourglass, CheckCircle2, DollarSign, Download, ArrowUp, Star } from "lucide-react";
import { KPICard } from "./KPICard";
import { SkeletonCard } from "./SkeletonCard";
import { useLanguage } from "@/contexts/LanguageContext";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

const pieData = [
  { name: "20% ou moins", value: 4, color: "#1F2937" },
  { name: "Entre 21% et 70%", value: 4, color: "#C09A51" },
  { name: "Entre 71% et 99%", value: 2, color: "#D1D5DB" },
  { name: "100%", value: 1, color: "#9CA3AF" }
];

export function Dashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { t, language } = useLanguage();

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
    <div className="space-y-8 animate-in fade-in duration-500 max-w-7xl">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-[28px] font-bold text-[#212529] mb-1">{t('dashboard.title')}</h1>
          <p className="text-[#6C757D] text-sm font-medium capitalize">
            {new Date().toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <button className="bg-white border border-[#C09A51] text-[#C09A51] px-4 py-2 rounded-lg hover:bg-[#C09A51]/5 transition-colors text-sm font-bold flex items-center gap-2">
          <Download size={16} />
          {t('dashboard.export')}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {loading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : (
          <>
            <KPICard label={t('dashboard.activeJourneys')} value={data.clients.length} icon={<Users size={20} />} trend="+ 15%" />
            <KPICard label={t('dashboard.pendingRecs')} value={Math.floor(data.recommendations.length / 2) || 5} icon={<Hourglass size={20} />} trend="+ 8%" />
            <KPICard label={t('dashboard.validatedRecs')} value={Math.ceil(data.recommendations.length / 2) || 7} icon={<CheckCircle2 size={20} />} trend="+ 22%" />
            <KPICard label={t('dashboard.revenuePotential')} value={formatter.format(data.salesData.totalPipeline || 19000)} icon={<DollarSign size={20} />} trend="+ 12.5%" />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity Table */}
        <div className="lg:col-span-2 bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-bold text-[#212529] mb-6">{t('dashboard.recentActivity')}</h2>
          {loading ? (
            <div className="space-y-4">
              <SkeletonCard />
              <SkeletonCard />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[#6C757D] text-xs font-semibold border-b border-gray-100">
                    <th className="pb-3 px-2">{t('dashboard.table.client')}</th>
                    <th className="pb-3 px-2">{t('dashboard.table.experience')}</th>
                    <th className="pb-3 px-2">{t('dashboard.table.status')}</th>
                    <th className="pb-3 px-2">{t('dashboard.table.progress')}</th>
                    <th className="pb-3 px-2 text-right">{t('dashboard.table.revenue')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {data.recommendations.slice(0, 5).map((rec: any, idx: number) => {
                    const progress = idx === 0 ? 30 : idx === 1 ? 75 : idx === 2 ? 50 : 100;
                    const status = progress === 100 || progress === 75 ? t('dashboard.status.validated') : t('dashboard.status.pending');
                    const isStatusGreen = status === t('dashboard.status.validated');
                    
                    return (
                      <tr key={rec.id} className="hover:bg-gray-50 transition-colors group">
                        <td className="py-4 px-2 text-[#212529] text-sm font-bold">{rec.clientName}</td>
                        <td className="py-4 px-2 text-[#6C757D] text-sm">{rec.selectedExperience}</td>
                        <td className="py-4 px-2">
                          <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded-full ${
                            isStatusGreen ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                          }`}>
                            {status}
                          </span>
                        </td>
                        <td className="py-4 px-2">
                          <div className="flex items-center gap-3">
                            <span className="text-xs font-bold text-[#212529] w-8">{progress}%</span>
                            <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                              <div className="h-full bg-[#C09A51]" style={{ width: `${progress}%` }} />
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-2 text-right text-[#212529] font-bold text-sm">
                          {formatter.format(rec.sales)}
                        </td>
                      </tr>
                    );
                  })}
                  {data.recommendations.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-[#6C757D]">{t('empty.recommendations')}</td>
                    </tr>
                  )}
                </tbody>
              </table>
              
              <div className="mt-6 text-center">
                <button className="bg-[#C09A51]/10 text-[#C09A51] px-4 py-2 rounded-lg hover:bg-[#C09A51]/20 transition-colors text-xs font-bold flex items-center gap-2 mx-auto">
                  <Star size={14} className="fill-[#C09A51]" />
                  {t('dashboard.viewAllRecs')}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Donut Chart Widget */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm flex flex-col">
          <h2 className="text-lg font-bold text-[#212529] mb-4">{t('dashboard.journeysByLevel')}</h2>
          
          <div className="relative h-48 w-full flex-shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={75}
                  paddingAngle={2}
                  dataKey="value"
                  stroke="none"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-black text-[#212529]">{data ? data.clients.length : 11}</span>
              <span className="text-[10px] font-bold text-[#6C757D] uppercase">{t('dashboard.journeys')}</span>
            </div>
          </div>
          
          <div className="mt-4 space-y-3">
            {pieData.map((item, i) => (
              <div key={i} className="flex justify-between items-center text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-[#6C757D] font-semibold">{item.name}</span>
                </div>
                <span className="font-bold text-[#212529]">{item.value}</span>
              </div>
            ))}
          </div>

          <div className="mt-auto pt-6 border-t border-gray-100 bg-orange-50/50 -mx-6 -mb-6 p-6 rounded-b-2xl">
            <p className="text-[#C09A51] text-xs font-bold mb-1">{t('dashboard.avgCompletion')}</p>
            <p className="text-3xl font-black text-[#212529] mb-2">62%</p>
            <div className="flex items-center gap-1 text-green-600 text-xs font-bold">
              <ArrowUp size={12} strokeWidth={3} />
              <span>{t('dashboard.vsLastWeek')}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
