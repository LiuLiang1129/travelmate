import React from 'react';
import { Vote, User } from '../types';
import { LockClosedIcon, CheckCircleIcon } from './icons';

interface VoteDisplayProps {
    vote: Vote;
    itemId: string;
    currentUser: User;
    canEdit: boolean;
    onVote: (itemId: string, optionId: string) => void;
    onToggleClosed: (itemId: string) => void;
}

const VoteDisplay: React.FC<VoteDisplayProps> = ({ vote, itemId, currentUser, canEdit, onVote, onToggleClosed }) => {
    const { question, options, isClosed } = vote;

    const totalVotes = options.reduce((sum, o) => sum + o.voters.length, 0);
    
    let winnerVoteCount = 0;
    if (isClosed && totalVotes > 0) {
        winnerVoteCount = Math.max(...options.map(o => o.voters.length));
    }

    return (
        <div className="mt-6">
            <div className="flex justify-between items-center mb-3">
                <h4 className="font-semibold text-gray-800 flex items-center">
                    {question}
                    {isClosed && <LockClosedIcon className="w-4 h-4 ml-2 text-gray-500" />}
                </h4>
                {canEdit && (
                    <button 
                        onClick={() => onToggleClosed(itemId)}
                        className="text-sm font-semibold text-blue-600 hover:text-blue-800"
                    >
                        {isClosed ? '重新開啟投票' : '結束投票'}
                    </button>
                )}
            </div>
            {isClosed && totalVotes === 0 && (
                <div className="text-center p-4 bg-gray-100 rounded-md text-sm text-gray-600">
                    投票已結束，無人投票。
                </div>
            )}
            <div className="space-y-2">
                {options.map(option => {
                    const votePercentage = totalVotes > 0 ? (option.voters.length / totalVotes) * 100 : 0;
                    const isVotedByCurrentUser = option.voters.includes(currentUser.id);
                    const isWinner = isClosed && winnerVoteCount > 0 && option.voters.length === winnerVoteCount;
                    
                    return (
                        <div key={option.id} className="relative">
                            <button
                                onClick={() => !isClosed && onVote(itemId, option.id)}
                                disabled={isClosed}
                                className={`w-full text-left p-3 border rounded-lg transition ${
                                    isVotedByCurrentUser && !isClosed ? 'border-blue-500 bg-blue-50' : 
                                    isClosed ? 'bg-gray-100' :
                                    'border-gray-300 bg-gray-50 hover:bg-gray-100'
                                } ${isWinner ? '!border-yellow-500 border-2' : ''}`}
                                aria-pressed={isVotedByCurrentUser}
                            >
                                <div className="flex justify-between items-center">
                                    <span className={`font-medium flex items-center ${isVotedByCurrentUser && !isClosed ? 'text-blue-700' : 'text-gray-700'} ${isWinner ? '!text-gray-900' : ''}`}>
                                        {isWinner && <CheckCircleIcon className="w-5 h-5 mr-2 text-yellow-600" />}
                                        {option.text}
                                    </span>
                                    <span className="text-sm font-semibold text-gray-600">{option.voters.length} 票</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                                    <div className={`h-1.5 rounded-full ${isWinner ? 'bg-yellow-500' : 'bg-blue-500'}`} style={{ width: `${votePercentage}%` }}></div>
                                </div>
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default VoteDisplay;
