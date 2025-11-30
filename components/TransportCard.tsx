
import React from 'react';
import { TransportationEvent, User } from '../types';
import { PaperAirplaneIcon, TicketIcon, BellIcon, ClipboardDocumentCheckIcon, PencilIcon, ClockIcon, TrashIcon } from './icons';

interface TransportCardProps {
  transport: TransportationEvent;
  currentUser: User;
  canManage: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onChecklistClick: () => void;
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


const TransportCard: React.FC<TransportCardProps> = ({ transport, canManage, onEdit, onDelete, onChecklistClick }) => {
  const firstSegment = transport.segments[0];
  const lastSegment = transport.segments[transport.segments.length - 1];

  if (!firstSegment) return null;

  const startDate = new Date(firstSegment.departureDateTime);
  const startDateString = startDate.toLocaleDateString('zh-TW', { year: 'numeric', month: 'numeric', day: 'numeric' });
  const startTimeString = startDate.toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit', hour12: false });
  const startWeekdayString = startDate.toLocaleDateString('zh-TW', { weekday: 'short' });

  let arrivalDateString, arrivalTimeString, arrivalWeekdayString;
  if (lastSegment.arrivalDateTime) {
      const arrivalDate = new Date(lastSegment.arrivalDateTime);
      arrivalDateString = arrivalDate.toLocaleDateString('zh-TW', { year: 'numeric', month: 'numeric', day: 'numeric' });
      arrivalTimeString = arrivalDate.toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit', hour12: false });
      arrivalWeekdayString = arrivalDate.toLocaleDateString('zh-TW', { weekday: 'short' });
  }

  const completedChecklistItems = transport.checklist.filter(item => item.isChecked).length;
  const totalChecklistItems = transport.checklist.length;
  const checklistProgress = totalChecklistItems > 0 ? (completedChecklistItems / totalChecklistItems) * 100 : 0;

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 flex justify-between items-center text-white">
          <h3 className="text-xl font-bold flex items-center">
             <PaperAirplaneIcon className="w-5 h-5 mr-2" />
             {transport.title}
          </h3>
          {canManage && (
             <div className="flex space-x-2">
                 <button onClick={onEdit} className="p-1.5 hover:bg-white/20 rounded-lg transition" title="編輯">
                    <PencilIcon className="w-5 h-5" />
                 </button>
                 <button onClick={onDelete} className="p-1.5 hover:bg-white/20 rounded-lg transition" title="刪除">
                    <TrashIcon className="w-5 h-5" />
                 </button>
             </div>
          )}
      </div>

      <div className="p-6">
        {transport.checkInTime && (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800 p-3 rounded mb-6 text-sm flex items-center">
                <ClockIcon className="w-5 h-5 mr-2 text-yellow-600"/>
                <span><strong>提醒：</strong>{transport.checkInTime}</span>
            </div>
        )}

        {/* Main Route Info */}
        <div className="flex flex-col md:flex-row justify-between items-start mb-8 gap-6">
            <div className="flex-grow w-full">
                <div className="flex items-center justify-between md:justify-start md:space-x-8 mb-2">
                    <div className="text-center md:text-left">
                         <div className="text-2xl font-bold text-gray-800">{firstSegment.origin}</div>
                         <div className="text-sm text-gray-500">{startDateString} {startTimeString} ({startWeekdayString})</div>
                    </div>
                    <div className="flex flex-col items-center px-4">
                        <span className="text-xs text-gray-400 font-medium tracking-wider mb-1">
                            {calculateDuration(firstSegment.departureDateTime, lastSegment.arrivalDateTime)}
                        </span>
                        <div className="w-24 h-0.5 bg-gray-300 relative">
                             <div className="absolute -top-1.5 right-0 w-3 h-3 bg-gray-300 rounded-full"></div>
                             <div className="absolute -top-1.5 left-0 w-3 h-3 bg-gray-300 rounded-full"></div>
                        </div>
                        <span className="text-xs text-blue-600 font-bold mt-1 uppercase tracking-wider">{transport.segments.map(s => s.transportMode).join(' + ')}</span>
                    </div>
                    <div className="text-center md:text-right">
                         <div className="text-2xl font-bold text-gray-800">{lastSegment.destination}</div>
                         <div className="text-sm text-gray-500">
                             {arrivalDateString ? `${arrivalDateString} ${arrivalTimeString} (${arrivalWeekdayString})` : '未定'}
                         </div>
                    </div>
                </div>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Details */}
            <div className="space-y-6">
                 <div>
                    <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center">
                        <TicketIcon className="w-4 h-4 mr-1.5"/> 詳細行程
                    </h4>
                    <div className="space-y-4 border-l-2 border-gray-200 ml-2 pl-4">
                        {transport.segments.map((segment, index) => (
                            <div key={segment.id} className="relative">
                                <div className="absolute -left-[23px] top-1 w-3.5 h-3.5 bg-gray-300 rounded-full border-2 border-white"></div>
                                <div className="text-sm">
                                    <div className="font-semibold text-gray-800">{segment.origin} → {segment.destination}</div>
                                    <div className="text-gray-600 mt-1 grid grid-cols-2 gap-x-4 gap-y-1">
                                        <span>模式: {segment.transportMode}</span>
                                        <span>班次: {segment.transportDetails.number}</span>
                                        {segment.transportDetails.terminalOrPlatform && <span className="col-span-2">地點: {segment.transportDetails.terminalOrPlatform}</span>}
                                        {segment.transportDetails.notes && <span className="col-span-2 text-gray-500 italic">{segment.transportDetails.notes}</span>}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                 </div>

                 {transport.reminders.length > 0 && (
                    <div>
                        <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center">
                            <BellIcon className="w-4 h-4 mr-1.5"/> 提醒事項
                        </h4>
                        <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                            {transport.reminders.map((r, i) => <li key={i}>{r}</li>)}
                        </ul>
                    </div>
                 )}
            </div>
            
            {/* Checklist */}
            <div>
                 <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center">
                    <ClipboardDocumentCheckIcon className="w-4 h-4 mr-1.5"/> 檢查表
                </h4>
                <div 
                    className="bg-gray-50 rounded-lg p-4 cursor-pointer hover:bg-gray-100 transition border border-gray-200"
                    onClick={onChecklistClick}
                >
                    <div className="flex justify-between items-center mb-2">
                        <span className="font-semibold text-gray-700">準備進度</span>
                        <span className="text-blue-600 font-bold text-sm">{completedChecklistItems}/{totalChecklistItems}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full transition-all duration-500" style={{ width: `${checklistProgress}%` }}></div>
                    </div>
                    <div className="mt-3 space-y-2">
                        {transport.checklist.slice(0, 3).map(item => (
                             <div key={item.id} className="flex items-center text-sm text-gray-600">
                                <div className={`w-4 h-4 rounded border flex items-center justify-center mr-2 ${item.isChecked ? 'bg-blue-600 border-blue-600' : 'border-gray-400'}`}>
                                    {item.isChecked && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>}
                                </div>
                                <span className={item.isChecked ? 'line-through opacity-70' : ''}>{item.text}</span>
                             </div>
                        ))}
                        {transport.checklist.length > 3 && (
                            <div className="text-xs text-gray-400 pl-6">+ 還有 {transport.checklist.length - 3} 個項目...</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default TransportCard;
