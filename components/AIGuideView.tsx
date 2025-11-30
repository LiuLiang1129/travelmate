
import React from 'react';
import { SparklesIcon } from './icons';

const AIGuideView: React.FC = () => {
    return (
        <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <SparklesIcon className="w-16 h-16 text-blue-500 mb-4" />
            <h2 className="text-3xl font-bold text-gray-800">AI 導遊</h2>
            <p className="mt-4 max-w-md text-gray-600">
                讓我們的 AI 導遊成為您旅途中的智慧夥伴。取得即時翻譯、當地推薦，並詢問任何關於您旅程的問題。
            </p>
            <p className="mt-2 text-sm text-gray-400">(此功能即將推出)</p>
        </div>
    );
};

export default AIGuideView;
