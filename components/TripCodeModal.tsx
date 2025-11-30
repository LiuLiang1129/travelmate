
import React, { useState, useEffect } from 'react';

interface TripCodeModalProps {
  isOpen: boolean;
  onSave: (code: string) => void;
}

const TripCodeModal: React.FC<TripCodeModalProps> = ({ isOpen, onSave }) => {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');

  const validateCode = (value: string): boolean => {
    if (value.length < 4 || value.length > 10) {
      setError('代碼長度必須介於 4 到 10 個字元之間。');
      return false;
    }
    if (!/^[a-zA-Z0-9]+$/.test(value)) {
      setError('代碼只能包含英文字母和數字。');
      return false;
    }
    setError('');
    return true;
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newCode = e.target.value;
    setCode(newCode);
    validateCode(newCode);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateCode(code)) {
      onSave(code);
    }
  };
  
  useEffect(() => {
      if (isOpen) {
          const randomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
          setCode(randomCode);
          validateCode(randomCode);
      }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-800">設定行程代碼</h2>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <p className="text-gray-600">為您的新行程建立一個獨特的代碼。其他成員將使用此代碼加入。</p>
          <div>
            <label htmlFor="tripCode" className="block text-sm font-medium text-gray-700">行程代碼</label>
            <input
              type="text"
              id="tripCode"
              name="tripCode"
              value={code}
              onChange={handleChange}
              className={`mt-1 block w-full p-2 border rounded-md bg-gray-50 text-black ${error ? 'border-red-500 text-red-900 placeholder-red-300 focus:outline-none focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'}`}
              required
              minLength={4}
              maxLength={10}
              autoFocus
            />
            {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
            <p className="mt-1 text-xs text-gray-500">4-10 個英文字母或數字。</p>
          </div>
        </form>
        <div className="p-6 bg-gray-50 border-t flex justify-end">
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={!!error || code.trim() === ''}
            className="w-full bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            儲存並開始
          </button>
        </div>
      </div>
    </div>
  );
};

export default TripCodeModal;
