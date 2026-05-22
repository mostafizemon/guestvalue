"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Star, Sparkles, MessageSquare, Users } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { DictionaryKey } from '@/lib/dictionaries';

const navLinks: { nameKey: DictionaryKey; href: string; icon: any }[] = [
  { nameKey: 'nav.overview', href: '/', icon: LayoutDashboard },
  { nameKey: 'nav.catalogue', href: '/catalogue', icon: Star },
  { nameKey: 'nav.suggestions', href: '/suggestions', icon: Sparkles },
  { nameKey: 'nav.messages', href: '/messages', icon: MessageSquare },
  { nameKey: 'nav.clients', href: '/clients', icon: Users },
];

export function Sidebar() {
  const pathname = usePathname();
  const { t, language, setLanguage } = useLanguage();

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-[240px] bg-[#292524] border-r border-[#44403C] flex flex-col">
      <div className="p-6">
        <div className="flex items-center gap-2 mb-1">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L22 12L12 22L2 12L12 2Z" fill="#d4a853" />
          </svg>
          <span className="text-white font-bold tracking-widest text-lg">GUESTVALUE</span>
        </div>
        <div className="text-[#d4a853] text-[10px] uppercase tracking-[0.2em] font-medium ml-8">
          {t('app.subtitle')}
        </div>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-1">
        {navLinks.map((link) => {
          const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
          const Icon = link.icon;

          return (
            <Link
              key={link.nameKey}
              href={link.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-[#44403C] text-[#d4a853] border-l-2 border-[#d4a853] rounded-l-none'
                  : 'text-[#A8A29E] hover:bg-[#44403C] hover:text-white'
              }`}
            >
              <Icon size={18} className={isActive ? "text-[#d4a853]" : ""} />
              {t(link.nameKey)}
            </Link>
          );
        })}
      </nav>

      <div className="p-6 border-t border-[#44403C]">
        <div className="flex bg-[#1C1917] rounded-lg p-1 mb-4 border border-[#44403C]">
          <button
            onClick={() => setLanguage('fr')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-colors ${
              language === 'fr' ? 'bg-[#44403C] text-[#d4a853]' : 'text-[#78716C] hover:text-[#A8A29E]'
            }`}
          >
            FR
          </button>
          <button
            onClick={() => setLanguage('en')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-colors ${
              language === 'en' ? 'bg-[#44403C] text-[#d4a853]' : 'text-[#78716C] hover:text-[#A8A29E]'
            }`}
          >
            EN
          </button>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#44403C] border border-[#44403C] flex items-center justify-center text-[#A8A29E] text-sm font-medium">
            M
          </div>
          <div className="text-sm">
            <p className="text-white font-medium">Mostafiz Emon</p>
            <p className="text-[#78716C] text-xs">{t('app.admin')}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
