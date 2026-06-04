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
    <aside className="fixed left-0 top-0 bottom-0 w-[260px] bg-white border-r border-gray-200 flex flex-col z-10 shadow-[2px_0_10px_rgba(0,0,0,0.02)]">
      <div className="p-8">
        <div className="flex items-center gap-2 mb-1">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L22 12L12 22L2 12L12 2Z" fill="#C09A51" />
          </svg>
          <span className="text-[#212529] font-bold tracking-widest text-lg">GUESTVALUE</span>
        </div>
        <div className="text-[#C09A51] text-[9px] uppercase tracking-[0.25em] font-bold ml-7">
          {t('app.subtitle')}
        </div>
      </div>

      <nav className="flex-1 px-4 py-2 space-y-2 mt-4">
        {navLinks.map((link) => {
          const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
          const Icon = link.icon;

          return (
            <Link
              key={link.nameKey}
              href={link.href}
              className={`flex items-center gap-4 px-4 py-3.5 rounded-xl text-[14px] font-semibold transition-all ${
                isActive
                  ? 'bg-[#C09A51]/10 text-[#C09A51] relative'
                  : 'text-[#6C757D] hover:bg-gray-50 hover:text-[#212529]'
              }`}
            >
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-[#C09A51] rounded-r-md" />
              )}
              <Icon size={18} className={isActive ? "text-[#C09A51]" : "text-[#ADB5BD]"} strokeWidth={isActive ? 2.5 : 2} />
              {t(link.nameKey)}
            </Link>
          );
        })}
      </nav>

      <div className="p-6 mt-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-full bg-[#212529] flex items-center justify-center text-white text-sm font-bold shadow-md">
            ME
          </div>
          <div className="text-sm">
            <p className="text-[#212529] font-bold">Mostafiz Emon</p>
            <p className="text-[#ADB5BD] text-xs">{t('app.admin')}</p>
          </div>
        </div>

        <div className="flex bg-gray-100 rounded-lg p-1 w-[120px]">
          <button
            onClick={() => setLanguage('fr')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all shadow-sm ${
              language === 'fr' ? 'bg-white text-[#212529]' : 'text-[#ADB5BD] hover:text-[#6C757D] shadow-none'
            }`}
          >
            FR
          </button>
          <button
            onClick={() => setLanguage('en')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all shadow-sm ${
              language === 'en' ? 'bg-white text-[#212529]' : 'text-[#ADB5BD] hover:text-[#6C757D] shadow-none'
            }`}
          >
            EN
          </button>
        </div>
      </div>
    </aside>
  );
}
