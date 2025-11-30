
import React from 'react';
import { CalendarDaysIcon, SparklesIcon, UsersIcon } from './icons';
import { User } from '../types';

export type MainView = 'itinerary' | 'ai-guide' | 'social' | 'settings';

interface BottomNavBarProps {
  activeView: MainView;
  onSelectView: (view: MainView) => void;
  currentUser: User;
}

const navItems = [
  { id: 'itinerary', label: '行程表', icon: CalendarDaysIcon },
  { id: 'ai-guide', label: 'AI導遊', icon: SparklesIcon },
  { id: 'social', label: '社群', icon: UsersIcon },
  { id: 'settings', label: '設定', icon: null },
];

const BottomNavBar: React.FC<BottomNavBarProps> = ({ activeView, onSelectView, currentUser }) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-[0_-1px_3px_rgba(0,0,0,0.1)] z-20 md:left-64">
      <div className="flex justify-around items-center h-16">
        {navItems.map(item => {
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectView(item.id as MainView)}
              className={`flex flex-col items-center justify-center w-full h-full transition-colors duration-200 ${
                isActive ? 'text-blue-600' : 'text-gray-500 hover:text-blue-500'
              }`}
              aria-current={isActive ? 'page' : undefined}
            >
              {item.id === 'settings' ? (
                <img
                  src={currentUser.avatarUrl}
                  alt={currentUser.name}
                  className={`w-7 h-7 rounded-full mb-1 transition-all ${isActive ? 'ring-2 ring-offset-1 ring-blue-600' : 'ring-2 ring-transparent'}`}
                />
              ) : (
                item.icon && <item.icon className="w-6 h-6 mb-1" />
              )}
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNavBar;
