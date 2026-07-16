import React from 'react';
import { Home, Search, Library, Heart, Upload } from 'lucide-react';

interface MobileNavProps {
  activeTab: 'home' | 'search' | 'library' | 'liked';
  onTabChange: (tab: 'home' | 'search' | 'library' | 'liked') => void;
  onUploadClick: () => void;
  onBackgroundSettingsClick: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ activeTab, onTabChange, onUploadClick }) => {
  const tabs = [
    { id: 'home' as const, icon: Home, label: 'Home' },
    { id: 'search' as const, icon: Search, label: 'Explore' },
    { id: 'library' as const, icon: Library, label: 'Library' },
    { id: 'liked' as const, icon: Heart, label: 'Liked' },
  ];

  return (
    <div
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around px-2"
      style={{ background: '#0f0f0f', borderTop: '1px solid #272727', height: '56px' }}
    >
      {tabs.map(({ id, icon: Icon, label }) => {
        const active = activeTab === id;
        return (
          <button
            key={id}
            onClick={() => onTabChange(id)}
            className="flex flex-col items-center gap-0.5 flex-1 py-1 transition-colors"
            style={{ color: active ? '#fff' : '#606060' }}
          >
            <Icon size={22} strokeWidth={active ? 2.5 : 1.5} fill={active && id === 'liked' ? 'currentColor' : 'none'} style={{ color: active ? '#fff' : '#606060' }} />
            <span className="text-[10px]" style={{ fontWeight: active ? 600 : 400 }}>{label}</span>
          </button>
        );
      })}
    </div>
  );
};
