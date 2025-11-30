
import React from 'react';
import { CogIcon } from './icons';

const SettingsView: React.FC = () => {
    return (
        <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <CogIcon className="w-16 h-16 text-gray-500 mb-4" />
            <h2 className="text-3xl font-bold text-gray-800">用戶設定</h2>
            <p className="mt-4 max-w-md text-gray-600">
                在這裡管理您的個人資料、通知偏好設定以及應用程式的其他選項，打造個人化的使用體驗。
            </p>
            <p className="mt-2 text-sm text-gray-400">(此功能即將推出)</p>
        </div>
    );
};

export default SettingsView;
