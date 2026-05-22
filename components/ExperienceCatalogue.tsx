"use client";

import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import { SkeletonCard } from "./SkeletonCard";
import { useLanguage } from "@/contexts/LanguageContext";
import { DictionaryKey } from "@/lib/dictionaries";

export function ExperienceCatalogue() {
  const [experiences, setExperiences] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("All");
  const { t } = useLanguage();

  const fetchExperiences = async (category: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/experiences?category=${category}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setExperiences(data);
      } else {
        console.error("API did not return an array:", data);
        setExperiences([]);
      }
    } catch (error) {
      console.error("Failed to fetch experiences", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExperiences(filter);
  }, [filter]);

  const tabs: { key: string; labelKey: DictionaryKey }[] = [
    { key: "All", labelKey: "catalogue.tab.all" },
    { key: "Marine", labelKey: "catalogue.tab.marine" },
    { key: "Air", labelKey: "catalogue.tab.air" },
    { key: "Land", labelKey: "catalogue.tab.land" },
  ];

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Marine": return "bg-teal-900/30 text-teal-300 border border-teal-800";
      case "Air": return "bg-blue-900/30 text-blue-300 border border-blue-800";
      case "Land": return "bg-green-900/30 text-green-300 border border-green-800";
      default: return "bg-gray-900 text-gray-300 border border-gray-800";
    }
  };

  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center border-b border-[#44403C] pb-6">
        <h1 className="text-3xl font-bold text-white">{t('catalogue.title')}</h1>
        <button className="bg-[#44403C] border border-[#57534E] text-white px-4 py-2 rounded-lg hover:bg-[#44403C] transition-colors text-sm font-medium">
          {t('catalogue.add')}
        </button>
      </div>

      <div className="flex gap-6 border-b border-[#44403C]">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`pb-3 text-sm font-medium transition-colors relative ${
              filter === tab.key ? 'text-[#d4a853]' : 'text-[#A8A29E] hover:text-white'
            }`}
          >
            {t(tab.labelKey)}
            {filter === tab.key && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#d4a853]" />
            )}
          </button>
        ))}
      </div>

      <div className="text-[#78716C] text-sm">
        {loading ? t('catalogue.loading') : t('catalogue.count', { count: experiences.length })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : (
          experiences.map((exp) => (
            <div key={exp.id} className="bg-[#292524] border border-[#44403C] rounded-xl p-5 hover:-translate-y-1 hover:border-[#d4a853] transition-all duration-300">
              <div className="flex justify-between items-start mb-4">
                <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded-full ${getCategoryColor(exp.category)}`}>
                  {exp.category}
                </span>
                <div className="flex items-center gap-1 text-[#d4a853]">
                  <Star size={14} className="fill-[#d4a853]" />
                  <span className="text-sm font-bold">{exp.luxuryRank}</span>
                </div>
              </div>
              
              <h3 className="text-white text-lg font-bold mb-6">{exp.name}</h3>
              
              <div className="flex items-baseline gap-1">
                <span className="text-[#d4a853] font-bold text-xl">{formatter.format(exp.basePrice)}</span>
                <span className="text-[#78716C] text-xs">{t('catalogue.perPerson')}</span>
              </div>
            </div>
          ))
        )}
        {!loading && experiences.length === 0 && (
          <div className="col-span-3 py-12 text-center text-[#78716C]">
            {t('catalogue.empty')}
          </div>
        )}
      </div>
    </div>
  );
}
