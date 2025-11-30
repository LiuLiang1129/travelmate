
import React, { useState, useEffect } from 'react';
import { ItineraryItem, ItineraryItemType, ItineraryTemplate } from '../types';
import { PlusIcon, TrashIcon } from './icons';

type ModalVotePayload = {
    question: string;
    options: { id: string; text: string }[];
} | null;

interface ItineraryItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (itemData: Omit<ItineraryItem, 'id' | 'comments' | 'vote'> & { vote: ModalVotePayload }) => void;
  item: ItineraryItem | null;
  day: number;
  totalDays: number;
  forcedType: ItineraryItemType | null;
  templates: ItineraryTemplate[];
  canManage: boolean;
}

type FormData = {
    title: string;
    day: number;
    type: ItineraryItemType;
    time: string;
    duration: string;
    description: string;
    location: string;
    imageUrl: string;
    endDay: string;
};

const ItineraryItemModal: React.FC<ItineraryItemModalProps> = ({ isOpen, onClose, onSave, item, day, totalDays, forcedType, templates, canManage }) => {
  const [formData, setFormData] = useState<FormData>({
    title: '',
    day: day,
    type: ItineraryItemType.Activity,
    time: '12:00',
    duration: '',
    description: '',
    location: '',
    imageUrl: '',
    endDay: ''
  });

  // Vote state
  const [hasVote, setHasVote] = useState(false);
  const [voteQuestion, setVoteQuestion] = useState('');
  const [voteOptions, setVoteOptions] = useState<{id: string, text: string}[]>([{ id: `opt-${Date.now()}`, text: '' }]);

  useEffect(() => {
    if (item) {
      setFormData({
        title: item.title,
        day: item.day,
        type: item.type,
        time: item.time,
        duration: item.duration || '',
        description: item.description,
        location: item.location || '',
        imageUrl: item.imageUrl || '',
        endDay: item.endDay?.toString() || '',
      });
       setHasVote(!!item.vote);
       setVoteQuestion(item.vote?.question || '');
       setVoteOptions(item.vote?.options.map(o => ({ id: o.id, text: o.text })) || [{ id: `opt-${Date.now()}`, text: '' }]);
    } else {
        const defaultType = forcedType || ItineraryItemType.Activity;
        setFormData({
            title: '', day: day, type: defaultType, time: '12:00',
            duration: '', description: '', location: '',
            imageUrl: '',
            endDay: (defaultType === ItineraryItemType.Accommodation) ? (day + 1).toString() : '',
        });
        setHasVote(false);
        setVoteQuestion('');
        setVoteOptions([{ id: `opt-${Date.now()}`, text: '' }]);
    }
  }, [item, forcedType, day]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name === 'day' ? parseInt(value, 10) : value }));
  };
  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, imageUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const { endDay, ...restFormData } = formData;
    
    const votePayload: ModalVotePayload = hasVote && voteQuestion.trim() && voteOptions.some(o => o.text.trim())
        ? {
            question: voteQuestion,
            options: voteOptions.filter(o => o.text.trim() !== '')
          }
        : null;

    const baseData = { ...restFormData };
    
    if (baseData.type === ItineraryItemType.Accommodation && endDay) {
        onSave({ ...baseData, endDay: parseInt(endDay, 10), vote: votePayload });
    } else {
        onSave({ ...baseData, endDay: undefined, vote: votePayload });
    }
  };

  const handleUseTemplate = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const templateId = e.target.value;
    if (!templateId) return;
    const template = templates.find(t => t.id === templateId);
    if (template) {
        setFormData(prev => ({
            ...prev,
            title: template.title,
            type: template.type,
            duration: template.duration || '',
            description: template.description,
            location: template.location || '',
            imageUrl: `https://picsum.photos/seed/${template.title.replace(/\s+/g, '-')}/800/400`,
        }));
    }
  };
  
  // Vote form handlers
  const handleOptionChange = (id: string, text: string) => {
    setVoteOptions(opts => opts.map(o => o.id === id ? { ...o, text } : o));
  };
  const addOption = () => {
    setVoteOptions(opts => [...opts, { id: `opt-${Date.now()}`, text: '' }]);
  };
  const removeOption = (id: string) => {
    setVoteOptions(opts => opts.filter(o => o.id !== id));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-800">{item ? '編輯行程項目' : '新增行程項目'}</h2>
        </div>
        <form onSubmit={handleSubmit} className="flex-grow overflow-y-auto p-6 space-y-4">
          {!item && templates.length > 0 && (
            <div>
              <label htmlFor="template-select" className="block text-sm font-medium text-gray-700">或使用範本</label>
              <select
                  id="template-select"
                  onChange={handleUseTemplate}
                  className="mt-1 block w-full p-2 border border-gray-300 rounded-md bg-gray-50 text-black"
              >
                  <option value="">選擇一個範本...</option>
                  {templates.map(template => (
                      <option key={template.id} value={template.id}>{template.title}</option>
                  ))}
              </select>
              <hr className="my-6 border-t" />
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">標題</label>
              <input type="text" name="title" id="title" value={formData.title} onChange={handleChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md bg-gray-50 text-black" required />
            </div>
            <div>
                <label htmlFor="day" className="block text-sm font-medium text-gray-700">天數</label>
                <select name="day" id="day" value={formData.day} onChange={handleChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md bg-gray-50 text-black">
                    {Array.from({ length: totalDays }, (_, i) => i + 1).map(d => (
                        <option key={d} value={d}>第 {d} 天</option>
                    ))}
                </select>
            </div>
             <div>
                <label htmlFor="type" className="block text-sm font-medium text-gray-700">類型</label>
                <select name="type" id="type" value={formData.type} onChange={handleChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md bg-gray-50 text-black disabled:bg-gray-100" disabled={!!forcedType && !item}>
                  {Object.values(ItineraryItemType).map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
            </div>
             <div>
                <label htmlFor="time" className="block text-sm font-medium text-gray-700">時間</label>
                <input type="time" name="time" id="time" value={formData.time} onChange={handleChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md bg-gray-50 text-black" required />
            </div>
             <div>
                <label htmlFor="duration" className="block text-sm font-medium text-gray-700">時長 (例如 2 小時)</label>
                <input type="text" name="duration" id="duration" value={formData.duration} onChange={handleChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md bg-gray-50 text-black" />
            </div>
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">描述</label>
            <textarea name="description" id="description" value={formData.description} onChange={handleChange} rows={3} className="mt-1 block w-full p-2 border border-gray-300 rounded-md bg-gray-50 text-black" required></textarea>
          </div>
          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700">地點</label>
            <input type="text" name="location" id="location" value={formData.location} onChange={handleChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md bg-gray-50 text-black" />
          </div>
          {formData.type === ItineraryItemType.Accommodation && (
            <div>
                <label htmlFor="endDay" className="block text-sm font-medium text-gray-700">退房日 (第幾天)</label>
                <input type="number" name="endDay" id="endDay" value={formData.endDay} onChange={handleChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md bg-gray-50 text-black" min={formData.day + 1} placeholder={`例如 ${formData.day + 1}`} required />
                <p className="text-xs text-gray-500 mt-1">您將在第 {formData.endDay || '?'} 天早上退房。入住天數為 {(formData.endDay ? parseInt(formData.endDay) : formData.day + 1) - formData.day} 晚。</p>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700">圖片</label>
            <div className="mt-1 flex flex-col items-center justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                {formData.imageUrl && (
                    <div className="mb-4">
                        <img src={formData.imageUrl} alt="預覽" className="mx-auto h-40 w-auto rounded-md object-contain" />
                    </div>
                )}
                <div className="space-y-1 text-center">
                    {!formData.imageUrl && (
                        <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                            <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    )}
                    <div className="flex text-sm text-gray-600 justify-center">
                        <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                            <span>{formData.imageUrl ? '更換圖片' : '上傳圖片'}</span>
                            <input id="file-upload" name="file-upload" type="file" className="sr-only" accept="image/*" onChange={handleImageChange} />
                        </label>
                    </div>
                     <p className="text-xs text-gray-500">PNG, JPG, GIF</p>
                </div>
            </div>
          </div>
          {canManage && (
            <div className="pt-4 border-t">
                <div className="flex items-center">
                    <input type="checkbox" id="hasVote" name="hasVote" checked={hasVote} onChange={(e) => setHasVote(e.target.checked)} className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                    <label htmlFor="hasVote" className="ml-2 block text-sm font-medium text-gray-900">啟用投票</label>
                </div>
                {hasVote && (
                    <div className="mt-4 pl-6 border-l-2 space-y-4">
                         <div>
                            <label htmlFor="voteQuestion" className="block text-sm font-medium text-gray-700">投票問題</label>
                            <input type="text" name="voteQuestion" id="voteQuestion" value={voteQuestion} onChange={e => setVoteQuestion(e.target.value)} className="mt-1 block w-full p-2 border border-gray-300 rounded-md bg-gray-50 text-black" placeholder="例如：我們午餐該吃什麼？" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">選項</label>
                            <div className="space-y-2 mt-1">
                                {voteOptions.map((opt, index) => (
                                    <div key={opt.id} className="flex items-center space-x-2">
                                        <input type="text" value={opt.text} onChange={e => handleOptionChange(opt.id, e.target.value)} className="block w-full p-2 border border-gray-300 rounded-md bg-gray-50 text-black" placeholder={`選項 ${index + 1}`} />
                                        <button type="button" onClick={() => removeOption(opt.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full" aria-label="移除選項">
                                            <TrashIcon className="w-5 h-5" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                            <button type="button" onClick={addOption} className="mt-2 flex items-center text-sm font-medium text-blue-600 hover:text-blue-800">
                                <PlusIcon className="w-4 h-4 mr-1" />
                                新增選項
                            </button>
                        </div>
                    </div>
                )}
            </div>
          )}
        </form>
        <div className="p-6 bg-gray-50 border-t flex justify-end space-x-3">
          <button type="button" onClick={onClose} className="bg-gray-200 text-gray-800 font-semibold py-2 px-4 rounded-lg hover:bg-gray-300">取消</button>
          <button type="submit" formNoValidate onClick={handleSubmit} className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700">儲存</button>
        </div>
      </div>
    </div>
  );
};

export default ItineraryItemModal;
