
import React, { useState } from 'react';
import { User, UserRole, Trip } from '../types';

interface LandingPageProps {
  onLogin: (user: User, trip: Trip) => void;
}

const AVATAR_EMOJIS = ['✈️', '🌍', '🏖️', '⛰️', '🏕️', '🗺️', '🚀', '🚢'];

const LandingPage: React.FC<LandingPageProps> = ({ onLogin }) => {
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState('');

  // Join state
  const [joinRole, setJoinRole] = useState<UserRole>(UserRole.Traveler);
  const [tripCode, setTripCode] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [joinError, setJoinError] = useState('');
  const [isJoining, setIsJoining] = useState(false);

  // Create state
  const [createRole, setCreateRole] = useState<UserRole>(UserRole.Planner);
  const [isCreating, setIsCreating] = useState(false);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    setJoinError('');
    setIsJoining(true);

    try {
      if (joinRole === UserRole.TourLeader && verificationCode !== '1234') {
        throw new Error('無效的領隊驗證碼。');
      }

      const response = await fetch(`/api/trips/${tripCode}`);
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('找不到此行程代碼。');
        }
        throw new Error('加入行程失敗，請稍後再試。');
      }

      const trip: Trip = await response.json();

      const newUser: User = {
        id: `user-${Date.now()}`,
        name: `${name} (${joinRole})`,
        role: joinRole,
        avatarUrl: `data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>${avatar}</text></svg>`,
        tripId: trip.id
      };
      onLogin(newUser, trip);

    } catch (err: any) {
      setJoinError(err.message);
    } finally {
      setIsJoining(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);

    try {
      const response = await fetch('/api/trips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `${name} 的行程`,
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString() // Default 3 days
        })
      });

      if (!response.ok) {
        throw new Error('建立行程失敗');
      }

      const trip: Trip = await response.json();

      const newUser: User = {
        id: `user-${Date.now()}`,
        name: `${name} (${createRole})`,
        role: createRole,
        avatarUrl: `data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>${avatar}</text></svg>`,
        tripId: trip.id
      };
      onLogin(newUser, trip);

    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsCreating(false);
    }
  };

  const isBaseInfoValid = name.trim() !== '' && avatar !== '';

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-4xl mx-auto">
        <header className="text-center mb-8">
          <div className="flex justify-center items-center gap-4">
            <svg className="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
            <h1 className="text-4xl font-bold text-gray-800">順旅成章</h1>
          </div>
          <p className="text-gray-600 mt-2">讓旅程順利，譜寫篇章</p>
        </header>

        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-700 mb-6 text-center">開始之前，請先告訴我們您的資訊</h2>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-4xl">
                {avatar || '?'}
              </div>
              <input
                type="text"
                placeholder="您的名字"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 text-lg w-64 bg-gray-50 text-black"
                required
              />
            </div>
            <div className="flex flex-wrap gap-2 justify-center">
              {AVATAR_EMOJIS.map(emoji => (
                <button
                  key={emoji}
                  onClick={() => setAvatar(emoji)}
                  className={`w-12 h-12 text-2xl rounded-full transition-transform duration-200 ${avatar === emoji ? 'bg-blue-500 scale-110' : 'bg-gray-200 hover:bg-gray-300'}`}
                  aria-label={`選擇頭像 ${emoji}`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className={`grid md:grid-cols-2 gap-8 transition-opacity duration-500 ${isBaseInfoValid ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
          {/* Join Itinerary */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h3 className="text-xl font-bold text-gray-800 mb-4">加入現有行程</h3>
            <form onSubmit={handleJoin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">行程代碼</label>
                <input
                  type="text"
                  placeholder="輸入 6 位數代碼"
                  value={tripCode}
                  onChange={(e) => setTripCode(e.target.value)}
                  className="mt-1 block w-full p-2 border border-gray-300 rounded-md bg-gray-50 text-black"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">您的身份</label>
                <select
                  value={joinRole}
                  onChange={(e) => setJoinRole(e.target.value as UserRole)}
                  className="mt-1 block w-full p-2 border border-gray-300 rounded-md bg-gray-50 text-black"
                >
                  <option value={UserRole.Traveler}>旅客</option>
                  <option value={UserRole.TourLeader}>領隊</option>
                </select>
              </div>
              {joinRole === UserRole.TourLeader && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">領隊驗證碼</label>
                  <input
                    type="password"
                    placeholder="1234"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    className="mt-1 block w-full p-2 border border-gray-300 rounded-md bg-gray-50 text-black"
                  />
                </div>
              )}
              {joinError && <p className="text-red-500 text-sm">{joinError}</p>}
              <button
                type="submit"
                disabled={!isBaseInfoValid || isJoining}
                className="w-full bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400"
              >
                {isJoining ? '加入中...' : '加入行程'}
              </button>
            </form>
          </div>

          {/* Create Itinerary */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h3 className="text-xl font-bold text-gray-800 mb-4">建立一個新行程</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <p className="text-gray-600">作為規劃者開始一個新的為期 3 天的旅行計畫。</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">您的身份</label>
                <select
                  value={createRole}
                  onChange={(e) => setCreateRole(e.target.value as UserRole)}
                  className="mt-1 block w-full p-2 border border-gray-300 rounded-md bg-gray-50 text-black"
                >
                  <option value={UserRole.Planner}>規劃員</option>
                  <option value={UserRole.Admin}>管理員</option>
                </select>
              </div>
              <div className="pt-12">
                <button
                  type="submit"
                  disabled={!isBaseInfoValid || isCreating}
                  className="w-full bg-green-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-green-700 transition disabled:bg-gray-400"
                >
                  {isCreating ? '建立中...' : '建立新行程'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
