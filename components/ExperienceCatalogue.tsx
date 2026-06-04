"use client";

import { useEffect, useState } from "react";
import { Star, Search, MapPin, Clock, MoreHorizontal } from "lucide-react";
import { SkeletonCard } from "./SkeletonCard";
import { useLanguage } from "@/contexts/LanguageContext";
import { DictionaryKey } from "@/lib/dictionaries";

const getThumbnail = (category: string, index: number) => {
  if (category === 'Air') return "https://images.unsplash.com/photo-1540946485063-a40da27545f8?auto=format&fit=crop&w=300&h=200&q=80"; // Helicopter
  if (category === 'Marine') return "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=300&h=200&q=80"; // Yacht
  if (category === 'Land') return "https://images.unsplash.com/photo-1512453979436-5a50ce8c8d05?auto=format&fit=crop&w=300&h=200&q=80"; // Dinner/Lounge
  return "https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=300&h=200&q=80"; // Default Resort/Spa
};

const getMockDetails = (index: number) => {
  const locations = ["St Barth", "Maldives", "New York", "Monaco"];
  const durations = ["45 min", "2 heures", "3 heures", "6 heures"];
  const ratings = ["4.9", "4.6", "4.7", "4.5"];
  
  return {
    location: locations[index % locations.length],
    duration: durations[index % durations.length],
    rating: ratings[index % ratings.length],
  };
};

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

  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-7xl mx-auto">
      <div className="flex justify-between items-start border-b border-gray-200 pb-6">
        <div>
          <h1 className="text-[28px] font-bold text-[#212529] mb-1">{t('catalogue.title')}</h1>
          <p className="text-[#6C757D] text-sm font-medium">{t('catalogue.subtitle')}</p>
        </div>
        <button className="bg-[#C09A51] text-white px-6 py-2.5 rounded-lg hover:bg-[#A98440] transition-colors font-bold text-sm shadow-sm flex items-center gap-2">
          {t('catalogue.add')}
        </button>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`px-4 py-2 text-sm font-bold rounded-lg border transition-all ${
                filter === tab.key 
                  ? 'bg-white border-[#C09A51] text-[#C09A51] shadow-sm' 
                  : 'bg-transparent border-gray-200 text-[#6C757D] hover:border-gray-300 hover:text-[#212529]'
              }`}
            >
              {t(tab.labelKey)}
            </button>
          ))}
          <button
            onClick={() => setFilter("Bien-être")}
            className={`px-4 py-2 text-sm font-bold rounded-lg border transition-all ${
              filter === "Bien-être" 
                ? 'bg-white border-[#C09A51] text-[#C09A51] shadow-sm' 
                : 'bg-transparent border-gray-200 text-[#6C757D] hover:border-gray-300 hover:text-[#212529]'
            }`}
          >
            {t('catalogue.tab.wellness')}
          </button>
        </div>
        
        <div className="relative w-full md:w-64">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#ADB5BD]" />
          <input 
            type="text" 
            placeholder={t('catalogue.search')} 
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-medium focus:border-[#C09A51] focus:ring-1 focus:ring-[#C09A51] focus:outline-none transition-all placeholder:text-[#ADB5BD] text-[#212529]"
          />
        </div>
      </div>

      <div className="space-y-4">
        {loading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : (
          experiences.map((exp, idx) => {
            const mock = getMockDetails(idx);
            
            return (
              <div key={exp.id} className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row gap-6 items-center">
                <img src={getThumbnail(exp.category, idx)} alt={exp.name} className="w-full md:w-48 h-32 rounded-xl object-cover" />
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#C09A51]"></div>
                    <span className="text-[#C09A51] text-xs font-bold uppercase tracking-wider">{exp.category}</span>
                  </div>
                  <h3 className="text-[#212529] text-lg font-bold mb-3">{exp.name}</h3>
                  
                  <div className="flex flex-wrap items-center gap-6 text-[#6C757D] text-sm font-medium">
                    <div className="flex items-center gap-1.5">
                      <MapPin size={14} />
                      {mock.location}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock size={14} />
                      {mock.duration}
                    </div>
                    <div className="flex items-baseline gap-1 text-[#212529]">
                      <span className="font-bold">{formatter.format(exp.basePrice)}</span>
                      <span className="text-xs text-[#6C757D] font-normal">{t('catalogue.perPerson')}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-row md:flex-col items-center md:items-end justify-between w-full md:w-auto h-full gap-4 md:gap-0 py-2">
                  <div className="flex items-center gap-1.5 bg-orange-50 text-[#C09A51] px-3 py-1 rounded-lg font-bold text-sm">
                    <Star size={14} className="fill-[#C09A51]" />
                    {mock.rating}
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <span className="bg-green-50 text-green-700 border border-green-200 text-[10px] font-bold px-3 py-1 rounded-full uppercase">
                      {t('catalogue.available')}
                    </span>
                    <button className="text-[#ADB5BD] hover:text-[#212529] transition-colors p-1">
                      <MoreHorizontal size={20} />
                    </button>
                  </div>
                </div>
              </div>
            )
          })
        )}
        {!loading && experiences.length === 0 && (
          <div className="py-12 text-center text-[#6C757D] font-medium border border-dashed border-gray-200 rounded-2xl">
            {t('catalogue.empty')}
          </div>
        )}
      </div>
    </div>
  );
}
