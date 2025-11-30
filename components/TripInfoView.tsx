
import React, { useState } from 'react';
import { TransportationEvent, ItineraryItem, User, ItineraryItemType } from '../types';
import TransportCard from './TransportCard';
import ItineraryCard from './ItineraryCard';
import { TicketIcon, BuildingOfficeIcon, PlusIcon } from './icons';

interface TripInfoViewProps {
  transportations: TransportationEvent[];
  accommodations: ItineraryItem[];
  currentUser: User;
  canManage: boolean;
  onAddTransport: () => void;
  onEditTransport: (transport: TransportationEvent) => void;
  onDeleteTransport: (id: string) => void;
  onOpenChecklist: (id: string) => void;
  onAddAccommodation: () => void;
  onEditAccommodation: (item: ItineraryItem) => void;
  onDeleteAccommodation: (itemId: string) => void;
  onAddComment: (itemId: string, text: string) => void;
  onVote: (itemId: string, optionId: string) => void;
  onSaveAsTemplate: (item: ItineraryItem) => void;
  onToggleVoteClosed: (itemId: string) => void;
  onSelectAccommodation: (itemId: string) => void;
}

type Tab = 'transportation' | 'accommodation';

const TripInfoView: React.FC<TripInfoViewProps> = ({
  transportations,
  accommodations,
  currentUser,
  canManage,
  onAddTransport,
  onEditTransport,
  onDeleteTransport,
  onOpenChecklist,
  onAddAccommodation,
  onEditAccommodation,
  onDeleteAccommodation,
  onAddComment,
  onVote,
  onSaveAsTemplate,
  onToggleVoteClosed,
  onSelectAccommodation
}) => {
  const [activeTab, setActiveTab] = useState<Tab>('transportation');

  return (
    <div className="w-full max-w-4xl mx-auto p-4 md:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h2 className="text-3xl font-bold text-gray-800">住宿與交通</h2>
        <div className="flex bg-gray-200 p-1 rounded-lg">
            <button
                onClick={() => setActiveTab('transportation')}
                className={`flex items-center px-4 py-2 rounded-md text-sm font-semibold transition-all ${
                    activeTab === 'transportation' 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-800'
                }`}
            >
                <TicketIcon className="w-4 h-4 mr-2" />
                交通資訊
            </button>
            <button
                onClick={() => setActiveTab('accommodation')}
                className={`flex items-center px-4 py-2 rounded-md text-sm font-semibold transition-all ${
                    activeTab === 'accommodation' 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-800'
                }`}
            >
                <BuildingOfficeIcon className="w-4 h-4 mr-2" />
                住宿安排
            </button>
        </div>
      </div>

      <div className="animate-fade-in">
        {activeTab === 'transportation' && (
            <div>
                 <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-gray-700 flex items-center">
                        <TicketIcon className="w-6 h-6 mr-2 text-blue-500" />
                        交通行程列表
                    </h3>
                    {canManage && (
                        <button 
                            onClick={onAddTransport}
                            className="flex items-center bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-blue-700 transition"
                        >
                            <PlusIcon className="w-5 h-5 mr-2" />
                            新增交通安排
                        </button>
                    )}
                </div>

                {transportations.length > 0 ? (
                    <div className="space-y-8">
                        {transportations.map(transport => (
                             <TransportCard 
                                key={transport.id}
                                transport={transport}
                                currentUser={currentUser}
                                canManage={canManage}
                                onEdit={() => onEditTransport(transport)}
                                onDelete={() => onDeleteTransport(transport.id)}
                                onChecklistClick={() => onOpenChecklist(transport.id)}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16 px-6 bg-white rounded-lg shadow-sm border border-dashed border-gray-300">
                        <h3 className="text-xl font-medium text-gray-700">尚未新增任何交通安排。</h3>
                        <p className="text-gray-500 mt-2">
                            {canManage ? "點擊「新增交通安排」開始規劃！" : "領隊稍後會在此新增資訊。"}
                        </p>
                    </div>
                )}
            </div>
        )}

        {activeTab === 'accommodation' && (
            <div>
                 <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-gray-700 flex items-center">
                        <BuildingOfficeIcon className="w-6 h-6 mr-2 text-blue-500" />
                        住宿列表
                    </h3>
                    {canManage && (
                        <button 
                            onClick={onAddAccommodation}
                            className="flex items-center bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-blue-700 transition"
                        >
                            <PlusIcon className="w-5 h-5 mr-2" />
                            新增住宿
                        </button>
                    )}
                </div>

                {accommodations.length > 0 ? (
                    <div className="space-y-6">
                        {accommodations.map(item => (
                            <div key={item.id} className="relative">
                                <div className="absolute -left-3 top-4 bg-blue-100 text-blue-800 text-xs font-bold px-2 py-1 rounded-r-md z-10 shadow-sm">
                                    第 {item.day} 天
                                </div>
                                <ItineraryCard
                                    item={item}
                                    currentUser={currentUser}
                                    onAddComment={onAddComment}
                                    onVote={onVote}
                                    onEdit={() => onEditAccommodation(item)}
                                    onDelete={onDeleteAccommodation}
                                    canEdit={canManage}
                                    onSelect={onSelectAccommodation}
                                    onSaveAsTemplate={onSaveAsTemplate}
                                    onToggleVoteClosed={onToggleVoteClosed}
                                />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16 px-6 bg-white rounded-lg shadow-sm border border-dashed border-gray-300">
                        <h3 className="text-xl font-medium text-gray-700">尚未安排住宿。</h3>
                        <p className="text-gray-500 mt-2">
                            {canManage ? "點擊「新增住宿」開始安排！" : "領隊稍後會在此新增住宿資訊。"}
                        </p>
                    </div>
                )}
            </div>
        )}
      </div>
    </div>
  );
};

export default TripInfoView;
