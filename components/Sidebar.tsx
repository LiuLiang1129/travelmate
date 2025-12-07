
import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { SunIcon, PlusIcon, XIcon, TemplateIcon, TicketIcon, CloudArrowUpIcon, ArrowUpTrayIcon, LockClosedIcon, UsersIcon } from './icons';

interface SidebarProps {
    totalDays: number;
    selectedView: 'trip-info' | number;
    onSelectView: (view: 'trip-info' | number) => void;
    startDate: Date;
    onAddDay: () => void;
    onClose: () => void;
    canManage: boolean;
    onOpenTemplatesModal: () => void;
    tripCode: string | null;
    onSaveTrip: () => void;
    onLoadTrip: (e: React.ChangeEvent<HTMLInputElement>) => void;
    isSaving?: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({
    totalDays,
    selectedView,
    onSelectView,
    startDate,
    onAddDay,
    onClose,
    canManage,
    onOpenTemplatesModal,
    tripCode,
    onSaveTrip,
    onLoadTrip,
    isSaving = false
}) => {
    const days = Array.from({ length: totalDays }, (_, i) => i + 1);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { user, signOut } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await signOut();
        navigate('/');
    };

    const handleLogin = () => {
        navigate('/auth');
        onClose();
    };

    const handleSelectAndClose = (view: 'trip-info' | number) => {
        onSelectView(view);
        onClose();
    };

    return (
        <div className="h-full flex flex-col bg-white border-r border-gray-200">
            <div className="p-4 flex justify-between items-center border-b border-gray-200 flex-shrink-0">
                <div>
                    <h2 className="text-lg font-semibold text-gray-700">行程表</h2>
                    {tripCode && (
                        <p className="text-sm text-gray-500 font-mono tracking-wider pt-1">代碼: {tripCode}</p>
                    )}
                </div>
                <button
                    onClick={onClose}
                    className="md:hidden p-2 -mr-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                    aria-label="關閉選單"
                >
                    <XIcon className="w-6 h-6" />
                </button>
            </div>
            <nav className="flex-grow p-4 overflow-y-auto">
                <ul className="space-y-1">
                    <li>
                        <button
                            onClick={() => handleSelectAndClose('trip-info')}
                            className={`w-full text-left flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 ${selectedView === 'trip-info'
                                ? 'bg-blue-600 text-white shadow-md'
                                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                                }`}
                        >
                            <TicketIcon className={`w-5 h-5 flex-shrink-0 ${selectedView === 'trip-info' ? 'text-white' : 'text-gray-400'}`} />
                            <div className="flex-grow">
                                <div className="font-medium">住宿與交通</div>
                                <div className={`text-sm ${selectedView === 'trip-info' ? 'text-blue-200' : 'text-gray-500'}`}>出發、返程與住宿</div>
                            </div>
                        </button>
                    </li>
                    <hr className="my-2 border-gray-200" />
                    {days.map(day => {
                        const date = new Date(startDate);
                        date.setDate(startDate.getDate() + day - 1);
                        const dateString = date.toLocaleDateString('zh-TW', { month: 'numeric', day: 'numeric' });
                        const weekdayString = date.toLocaleDateString('zh-TW', { weekday: 'short' });

                        return (
                            <li key={day}>
                                <button
                                    onClick={() => handleSelectAndClose(day)}
                                    className={`w-full text-left flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 ${selectedView === day
                                        ? 'bg-blue-600 text-white shadow-md'
                                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                                        }`}
                                >
                                    <SunIcon className={`w-5 h-5 flex-shrink-0 ${selectedView === day ? 'text-white' : 'text-gray-400'}`} />
                                    <div className="flex-grow">
                                        <div className="font-medium">{`第 ${day} 天`}</div>
                                        <div className={`text-sm ${selectedView === day ? 'text-blue-200' : 'text-gray-500'}`}>{`${dateString} ${weekdayString}`}</div>
                                    </div>
                                </button>
                            </li>
                        );
                    })}
                </ul>
                {canManage && (
                    <div className="mt-4 pt-4 border-t border-gray-200 space-y-2">
                        <button
                            onClick={onAddDay}
                            className="w-full text-center flex items-center justify-center space-x-2 p-2 rounded-lg border-2 border-dashed border-gray-300 text-gray-500 hover:bg-gray-100 hover:border-gray-400 transition"
                            aria-label="新增一天行程"
                        >
                            <PlusIcon className="w-5 h-5" />
                            <span className="font-medium text-sm">新增一天</span>
                        </button>
                        <button
                            onClick={onOpenTemplatesModal}
                            className="w-full text-left flex items-center space-x-2 p-2 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition"
                            aria-label="管理範本"
                        >
                            <TemplateIcon className="w-5 h-5 text-gray-500" />
                            <span className="font-medium text-sm">管理範本</span>
                        </button>
                        <button
                            onClick={onSaveTrip}
                            disabled={isSaving}
                            className="w-full text-left flex items-center space-x-2 p-2 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition disabled:opacity-50 disabled:cursor-wait"
                            aria-label="儲存行程至雲端"
                        >
                            <CloudArrowUpIcon className={`w-5 h-5 ${isSaving ? 'text-blue-500 animate-pulse' : 'text-gray-500'}`} />
                            <span className="font-medium text-sm">{isSaving ? '正在儲存至 D1...' : '儲存行程 (D1)'}</span>
                        </button>
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="w-full text-left flex items-center space-x-2 p-2 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition"
                            aria-label="讀取行程"
                        >
                            <ArrowUpTrayIcon className="w-5 h-5 text-gray-500" />
                            <span className="font-medium text-sm">讀取行程檔案</span>
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={onLoadTrip}
                                accept="application/json"
                                className="hidden"
                            />
                        </button>
                    </div>
                )}

                <div className="mt-4 pt-4 border-t border-gray-200">
                    {user ? (
                        <div className="space-y-2">
                            <div className="px-2 py-1 text-xs text-gray-500 truncate" title={user.email}>
                                {user.email}
                            </div>
                            <button
                                onClick={handleLogout}
                                className="w-full text-left flex items-center space-x-2 p-2 rounded-lg text-red-600 hover:bg-red-50 hover:text-red-700 transition"
                            >
                                <LockClosedIcon className="w-5 h-5" />
                                <span className="font-medium text-sm">登出</span>
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={handleLogin}
                            className="w-full text-left flex items-center space-x-2 p-2 rounded-lg text-blue-600 hover:bg-blue-50 hover:text-blue-700 transition"
                        >
                            <UsersIcon className="w-5 h-5" />
                            <span className="font-medium text-sm">登入 / 註冊</span>
                        </button>
                    )}
                </div>
            </nav>
        </div>
    );
};

export default Sidebar;
