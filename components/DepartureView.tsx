import React from 'react';
import { DepartureInfo, User } from '../types';
import { PaperAirplaneIcon, TicketIcon, BellIcon, ClipboardDocumentCheckIcon, PencilIcon, ClockIcon } from './icons';

interface DepartureViewProps {
  departureInfo: DepartureInfo;
  currentUser: User;
  canManage: boolean;
  onEdit: () => void;
}

const calculateDuration = (start?: string, end?: string): string => {
    if (!start || !end) return '';
    const startDate = new Date(start);
    const endDate = new Date(end);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime()) || endDate <= startDate) {
      return '';
    }

    let diff = endDate.getTime() - startDate.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    diff -= hours * (1000 * 60 * 60);
    const minutes = Math.floor(diff / (1000 * 60));

    const parts = [];
    if (hours > 0) parts.push(`${hours} 小時`);
    if (minutes > 0) parts.push(`${minutes} 分鐘`);

    return parts.length > 0 ? parts.join(' ') : '';
};


const DepartureView: React.FC<DepartureViewProps> = ({ departureInfo, canManage, onEdit }) => {
  if (!departureInfo.segments || departureInfo.segments.length === 0) {
    return (
      <div className="w-full max-w-4xl mx-auto p-4 md:p-6 lg:p-8">
         <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold text-gray-800">出發資訊</h2>
             {canManage && (
                <button 
                    onClick={onEdit}
                    className="flex items-center bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-blue-700 transition"
                >
                    <PencilIcon className="w-5 h-5 mr-2" />
                    新增資訊
                </button>
            )}
        </div>
        <div className="text-center py-16 px-6 bg-white rounded-lg shadow-sm border border-dashed border-gray-300">
             <h3 className="text-xl font-medium text-gray-700">尚未新增出發資訊。</h3>
             <p className="text-gray-500 mt-2">
                {canManage ? "點擊「新增資訊」開始規劃！" : "領隊稍後會在此新增資訊。"}
            </p>
        </div>
      </div>
    );
  }

  const firstSegment = departureInfo.segments[0];
  const lastSegment = departureInfo.segments[departureInfo.segments.length - 1];

  const departureDate = new Date(firstSegment.departureDateTime);
  const departureDateString = departureDate.toLocaleDateString('zh-TW', { year: 'numeric', month: 'long', day: 'numeric' });
  const departureTimeString = departureDate.toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit', hour12: false });
  const departureWeekdayString = departureDate.toLocaleDateString('zh-TW', { weekday: 'long' });

  let arrivalDateString, arrivalTimeString, arrivalWeekdayString;
  if (lastSegment.arrivalDateTime) {
      const arrivalDate = new Date(lastSegment.arrivalDateTime);
      arrivalDateString = arrivalDate.toLocaleDateString('zh-TW', { year: 'numeric', month: 'long', day: 'numeric' });
      arrivalTimeString = arrivalDate.toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit', hour12: false });
      arrivalWeekdayString = arrivalDate.toLocaleDateString('zh-TW', { weekday: 'long' });
  }

  const completedChecklistItems = departureInfo.checklist.filter(item => item.isChecked).length;
  const totalChecklistItems = departureInfo.checklist.length;
  const checklistProgress = totalChecklistItems > 0 ? (completedChecklistItems / totalChecklistItems) * 100 : 0;

  return (
    <div className="w-full max-w-4xl mx-auto p-4 md:p-6 lg:p-8 animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800">出發資訊</h2>
        {canManage && (
            <button 
                onClick={onEdit}
                className="flex items-center bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-blue-700 transition"
            >
                <PencilIcon className="w-5 h-5 mr-2" />
                編輯
            </button>
        )}
      </div>

      {departureInfo.checkInTime && (
          <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800 p-4 rounded-lg mb-8 shadow">
            <div className="flex items-center">
                <ClockIcon className="w-6 h-6 mr-3"/>
                <div>
                    <p className="font-bold">提前報到</p>
                    <p>{departureInfo.checkInTime}</p>
                </div>
            </div>
          </div>
      )}

      {/* Main Info Card */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border-l-4 border-blue-500">
        <div className="flex flex-col md:flex-row justify-between items-start">
            <div className="flex-grow">
                <p className="text-sm font-semibold text-gray-500">{departureInfo.segments.map(s => s.transportMode).join(' → ')}</p>
                <div className="flex items-center space-x-4 my-2">
                    <p className="text-2xl font-bold text-gray-800">{firstSegment.origin}</p>
                    <PaperAirplaneIcon className="w-8 h-8 text-blue-500 transform rotate-45" />
                    <p className="text-2xl font-bold text-gray-800">{lastSegment.destination}</p>
                </div>
                {lastSegment.arrivalDateTime && (
                    <div className="flex items-center text-gray-600 mt-2">
                        <ClockIcon className="w-5 h-5 mr-2"/>
                        <span className="font-semibold">{`總交通時間: ${calculateDuration(firstSegment.departureDateTime, lastSegment.arrivalDateTime)}`}</span>
                    </div>
                )}
            </div>
            <div className="text-left md:text-right mt-4 md:mt-0 flex-shrink-0 md:pl-6 space-y-2">
                <div>
                    <p className="text-sm font-semibold text-blue-600">出發</p>
                    <p className="text-xl font-bold text-gray-800">{departureTimeString}</p>
                    <p className="text-gray-600">{departureDateString} ({departureWeekdayString})</p>
                </div>
                {lastSegment.arrivalDateTime && arrivalTimeString && (
                <div>
                    <p className="text-sm font-semibold text-green-600">抵達 (當地時間)</p>
                    <p className="text-xl font-bold text-gray-800">{arrivalTimeString}</p>
                    <p className="text-gray-600">{arrivalDateString} ({arrivalWeekdayString})</p>
                </div>
                )}
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column */}
        <div className="space-y-8">
            {/* Transport Details */}
            <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-800 flex items-center mb-4">
                    <TicketIcon className="w-6 h-6 mr-3 text-green-600"/>
                    交通細節
                </h3>
                <div className="space-y-6">
                    {departureInfo.segments.map((segment, index) => (
                        <div key={segment.id}>
                             <div className="flex items-center space-x-3 mb-2">
                                <span className="flex-shrink-0 bg-green-100 text-green-800 text-sm font-bold w-6 h-6 rounded-full flex items-center justify-center">{index + 1}</span>
                                <p className="font-bold text-gray-700">{segment.origin} → {segment.destination}</p>
                            </div>
                            <div className="pl-9 space-y-2 text-sm text-gray-700">
                                <div className="flex justify-between"><span className="font-semibold text-gray-500">模式:</span><span>{segment.transportMode}</span></div>
                                <div className="flex justify-between"><span className="font-semibold text-gray-500">班次/車次:</span><span>{segment.transportDetails.number}</span></div>
                                <div className="flex justify-between"><span className="font-semibold text-gray-500">航廈/月台:</span><span>{segment.transportDetails.terminalOrPlatform}</span></div>
                                {segment.transportDetails.notes && <div className="flex justify-between"><span className="font-semibold text-gray-500">備註:</span><span>{segment.transportDetails.notes}</span></div>}
                            </div>
                            {index < departureInfo.segments.length - 1 && (
                                <div className="pl-3 pt-4">
                                    <div className="border-l-2 border-dashed border-gray-300 h-8 ml-3 relative">
                                        <p className="absolute left-4 -top-3 text-sm font-semibold text-gray-500 bg-white px-2">轉乘/轉機</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
            
            {/* Reminders */}
            <div className="bg-white rounded-xl shadow-lg p-6">
                 <h3 className="text-xl font-bold text-gray-800 flex items-center mb-4">
                    <BellIcon className="w-6 h-6 mr-3 text-yellow-600"/>
                    提醒事項
                </h3>
                <ul className="space-y-2 list-disc list-inside text-gray-700">
                    {departureInfo.reminders.map((reminder, index) => (
                        <li key={index}>{reminder}</li>
                    ))}
                </ul>
            </div>
        </div>
        
        {/* Right Column - Checklist */}
        <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-800 flex items-center mb-4">
                <ClipboardDocumentCheckIcon className="w-6 h-6 mr-3 text-purple-600"/>
                出發前檢查表
            </h3>
            <div 
                className="space-y-3 cursor-pointer group"
                onClick={onEdit}
                role="button"
                tabIndex={0}
                aria-label={canManage ? "編輯檢查表" : "查看檢查表"}
            >
                <div className="flex justify-between items-center font-semibold">
                    <span className="text-gray-700">進度</span>
                    <span className="text-purple-700">{completedChecklistItems} / {totalChecklistItems}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div className="bg-purple-600 h-2.5 rounded-full transition-all duration-500" style={{ width: `${checklistProgress}%` }}></div>
                </div>
                <p className="text-center text-sm text-gray-500 pt-2 group-hover:text-blue-600 transition">{canManage ? '點擊以編輯檢查表' : '點擊以查看/管理您的檢查表'}</p>
            </div>
        </div>
      </div>
    </div>
  );
};

export default DepartureView;