import React from 'react';
import { Settlement } from '../types';
import { ArrowRightIcon } from './icons';

interface SettlementSummaryProps {
    settlements: Settlement[];
}

const SettlementSummary: React.FC<SettlementSummaryProps> = ({ settlements }) => {
    return (
        <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">清算帳務</h3>
            <div>
                {settlements.length > 0 ? (
                    <ul className="space-y-2">
                        {settlements.map((s, index) => (
                            <li key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                                <div className="flex items-center">
                                    {/* From User */}
                                    <div className="flex items-center">
                                        <img src={s.from.avatarUrl} alt={s.from.name} className="w-8 h-8 rounded-full mr-3"/>
                                        <span className="font-medium text-gray-800">{s.from.name}</span>
                                    </div>
                                    
                                    <ArrowRightIcon className="w-5 h-5 mx-4 text-gray-400" />

                                    {/* To User */}
                                    <div className="flex items-center">
                                        <img src={s.to.avatarUrl} alt={s.to.name} className="w-8 h-8 rounded-full mr-3"/>
                                        <span className="font-medium text-gray-800">{s.to.name}</span>
                                    </div>
                                </div>
                                
                                {/* Amount */}
                                <span className="font-bold text-red-600 text-lg">
                                    ¥{s.amount.toLocaleString()}
                                </span>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-center text-gray-500 py-4">所有帳目皆已結清！🎉</p>
                )}
            </div>
        </div>
    );
};

export default SettlementSummary;