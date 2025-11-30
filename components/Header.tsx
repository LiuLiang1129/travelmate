
import React from 'react';
import { User } from '../types';
import { MenuIcon } from './icons';

interface HeaderProps {
  currentUser: User;
  onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ currentUser, onMenuClick }) => {
  return (
    <header className="bg-white shadow-md w-full p-4 flex justify-between items-center sticky top-0 z-50 flex-shrink-0">
      <div className="flex items-center space-x-3">
        <button 
            onClick={onMenuClick} 
            className="md:hidden p-2 -ml-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100"
            aria-label="開啟選單"
        >
            <MenuIcon className="w-6 h-6" />
        </button>
        <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">順旅成章</h1>
      </div>
      <div className="flex items-center space-x-4">
        <span className="text-gray-700 font-medium">{currentUser.name}</span>
      </div>
    </header>
  );
};

export default Header;
