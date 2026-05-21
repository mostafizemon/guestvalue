"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Star, Sparkles, MessageSquare, Users } from 'lucide-react';

const navLinks = [
  { name: 'Overview', href: '/', icon: LayoutDashboard },
  { name: 'Experiences', href: '/catalogue', icon: Star },
  { name: 'AI Suggestions', href: '/suggestions', icon: Sparkles },
  { name: 'Messages', href: '/messages', icon: MessageSquare },
  { name: 'Clients', href: '/clients', icon: Users },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-[240px] bg-[#111111] border-r border-[#222] flex flex-col">
      <div className="p-6">
        <div className="flex items-center gap-2 mb-1">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L22 12L12 22L2 12L12 2Z" fill="#d4a853" />
          </svg>
          <span className="text-white font-bold tracking-widest text-lg">GUESTVALUE</span>
        </div>
        <div className="text-[#d4a853] text-[10px] uppercase tracking-[0.2em] font-medium ml-8">Concierge Intelligence</div>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-1">
        {navLinks.map((link) => {
          const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
          const Icon = link.icon;

          return (
            <Link
              key={link.name}
              href={link.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-[#1a1a1a] text-[#d4a853] border-l-2 border-[#d4a853] rounded-l-none'
                  : 'text-[#a0a0a0] hover:bg-[#1a1a1a] hover:text-white'
              }`}
            >
              <Icon size={18} className={isActive ? "text-[#d4a853]" : ""} />
              {link.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-6 border-t border-[#222]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#1a1a1a] border border-[#222] flex items-center justify-center text-[#a0a0a0] text-sm font-medium">
            M
          </div>
          <div className="text-sm">
            <p className="text-white font-medium">Mostafiz Emon</p>
            <p className="text-[#606060] text-xs">Admin</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
