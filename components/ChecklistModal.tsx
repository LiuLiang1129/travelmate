
import React, { useState, useEffect } from 'react';
import { ChecklistItem, User } from '../types';
import { PlusIcon, TrashIcon } from './icons';

interface ChecklistModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (checklist: ChecklistItem[]) => void;
  checklist: ChecklistItem[];
  currentUser: User;
  title?: string;
}

const ChecklistModal: React.FC<ChecklistModalProps> = ({ isOpen, onClose, onSave, checklist, currentUser, title = "出發前檢查表" }) => {
  const [localChecklist, setLocalChecklist] = useState<ChecklistItem[]>(checklist);

  useEffect(() => {
    setLocalChecklist(checklist);
  }, [checklist]);

  const handleTextChange = (id: string, newText: string) => {
    setLocalChecklist(prev => prev.map(item =>
      item.id === id ? { ...item, text: newText } : item
    ));
  };

  const handleToggle = (id: string) => {
    setLocalChecklist(prev => prev.map(item =>
      item.id === id ? { ...item, isChecked: !item.isChecked } : item
    ));
  };

  const handleAddItem = () => {
    const newItem: ChecklistItem = {
      id: `personal-${Date.now()}`,
      text: '',
      isChecked: false,
      authorId: currentUser.id,
    };
    setLocalChecklist(prev => [...prev, newItem]);
  };

  const handleRemoveItem = (id: string) => {
    setLocalChecklist(prev => prev.filter(item => item.id !== id));
  };

  const handleSave = () => {
    // Filter out empty personal items before saving
    const filteredList = localChecklist.filter(item => !(item.authorId && item.text.trim() === ''));
    onSave(filteredList);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl font-bold">&times;</button>
        </div>
        <div className="flex-grow overflow-y-auto p-6 space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-3">官方清單</h3>
            <div className="space-y-2">
              {localChecklist.filter(item => !item.authorId).map((item) => (
                <div key={item.id} className="flex items-center space-x-3 bg-gray-50 p-3 rounded-md">
                  <input
                    type="checkbox"
                    id={`check-${item.id}`}
                    checked={item.isChecked}
                    onChange={() => handleToggle(item.id)}
                    className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 flex-shrink-0"
                  />
                  <label htmlFor={`check-${item.id}`} className="flex-grow text-gray-800">{item.text}</label>
                </div>
              ))}
               {localChecklist.filter(item => !item.authorId).length === 0 && (
                <p className="text-sm text-gray-500">沒有官方項目。</p>
              )}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-3">我的個人清單</h3>
            <div className="space-y-2">
              {localChecklist.filter(item => item.authorId === currentUser.id).map((item) => (
                <div key={item.id} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={item.isChecked}
                    onChange={() => handleToggle(item.id)}
                    className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 flex-shrink-0"
                  />
                  <input
                    type="text"
                    value={item.text}
                    onChange={(e) => handleTextChange(item.id, e.target.value)}
                    placeholder="新增個人項目..."
                    className="block w-full p-2 border border-gray-300 rounded-md bg-gray-50 text-black"
                  />
                  <button type="button" onClick={() => handleRemoveItem(item.id)} className="p-2 text-gray-400 hover:text-red-600 rounded-full flex-shrink-0" aria-label="移除項目">
                    <TrashIcon className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
            <button type="button" onClick={handleAddItem} className="mt-4 flex items-center text-sm font-medium text-blue-600 hover:text-blue-800">
              <PlusIcon className="w-4 h-4 mr-1" />
              新增個人項目
            </button>
          </div>
        </div>
        <div className="p-6 bg-gray-50 border-t flex justify-end">
          <button type="button" onClick={handleSave} className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700">
            完成
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChecklistModal;
