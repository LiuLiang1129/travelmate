
import React, { useState, useEffect } from 'react';
import { TransportationEvent, ChecklistItem, User, TransportSegment } from '../types';
import { PlusIcon, TrashIcon, ClockIcon } from './icons';

interface TransportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (info: TransportationEvent) => void;
  transport: TransportationEvent | null;
  currentUser: User;
  canManage: boolean;
}

const calculateDuration = (start?: string, end?: string): string => {
    if (!start || !end) return '請輸入完整的時間';
    const startDate = new Date(start);
    const endDate = new Date(end);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime()) || endDate <= startDate) {
      return '時間無效';
    }

    let diff = endDate.getTime() - startDate.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    diff -= hours * (1000 * 60 * 60);
    const minutes = Math.floor(diff / (1000 * 60));

    const parts = [];
    if (hours > 0) parts.push(`${hours} 小時`);
    if (minutes > 0) parts.push(`${minutes} 分鐘`);

    return parts.length > 0 ? parts.join(' ') : '0 分鐘';
};

const TransportModal: React.FC<TransportModalProps> = ({ isOpen, onClose, onSave, transport, currentUser, canManage }) => {
  const [formData, setFormData] = useState<TransportationEvent>({
      id: '',
      title: '',
      segments: [],
      reminders: [],
      checklist: []
  });

  useEffect(() => {
    if (transport) {
        setFormData(transport);
    } else {
        // Initialize new transport
        setFormData({
            id: `trans-${Date.now()}`,
            title: '',
            checkInTime: '',
            segments: [{
                id: `seg-${Date.now()}`,
                departureDateTime: new Date().toISOString(),
                origin: '',
                destination: '',
                transportMode: '飛行',
                transportDetails: { number: '', terminalOrPlatform: '', notes: '' }
            }],
            reminders: [],
            checklist: []
        });
    }
  }, [transport, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSegmentChange = (index: number, e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const newSegments = [...formData.segments];
    newSegments[index] = { ...newSegments[index], [name]: value };
    setFormData(prev => ({ ...prev, segments: newSegments }));
  };

  const handleSegmentDateTimeChange = (index: number, field: 'departureDateTime' | 'arrivalDateTime', value: string) => {
    const newSegments = [...formData.segments];
    const dateValue = value ? new Date(value + 'Z').toISOString() : undefined;
    (newSegments[index] as any)[field] = dateValue;
    setFormData(prev => ({ ...prev, segments: newSegments }));
  };

  const handleSegmentDetailsChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const newSegments = [...formData.segments];
    newSegments[index].transportDetails = { ...newSegments[index].transportDetails, [name]: value };
    setFormData(prev => ({ ...prev, segments: newSegments }));
  };

  const addSegment = () => {
      const lastSegment = formData.segments[formData.segments.length - 1];
      const newSegment: TransportSegment = {
          id: `seg-${Date.now()}`,
          departureDateTime: lastSegment?.arrivalDateTime || new Date().toISOString(),
          arrivalDateTime: undefined,
          origin: lastSegment?.destination || '',
          destination: '',
          transportMode: lastSegment?.transportMode || '飛行',
          transportDetails: { number: '', terminalOrPlatform: '', notes: '' },
      };
      setFormData(prev => ({...prev, segments: [...prev.segments, newSegment]}));
  };

  const removeSegment = (index: number) => {
      setFormData(prev => ({ ...prev, segments: prev.segments.filter((_, i) => i !== index)}));
  };

  const handleReminderChange = (index: number, value: string) => {
    const newReminders = [...formData.reminders];
    newReminders[index] = value;
    setFormData(prev => ({ ...prev, reminders: newReminders }));
  };

  const handleChecklistItemTextChange = (index: number, value: string) => {
    const newChecklist = [...formData.checklist];
    newChecklist[index] = { ...newChecklist[index], text: value };
    setFormData(prev => ({ ...prev, checklist: newChecklist }));
  };
  
  const handleChecklistToggle = (index: number) => {
    const newChecklist = [...formData.checklist];
    newChecklist[index] = { ...newChecklist[index], isChecked: !newChecklist[index].isChecked };
    setFormData(prev => ({ ...prev, checklist: newChecklist }));
  };

  const addListItem = (list: 'reminders' | 'checklist') => {
      setFormData(prev => {
          if (list === 'reminders') {
              return { ...prev, reminders: [...prev.reminders, ''] };
          }
          const newChecklistItem: ChecklistItem = {
              id: `new-${Date.now()}`,
              text: '',
              isChecked: false,
              authorId: canManage ? undefined : currentUser.id 
          };
          return { ...prev, checklist: [...prev.checklist, newChecklistItem] };
      });
  };

  const removeListItem = (list: 'reminders' | 'checklist', index: number) => {
      setFormData(prev => {
          if (list === 'reminders') {
              return { ...prev, reminders: prev.reminders.filter((_, i) => i !== index) };
          }
          return { ...prev, checklist: prev.checklist.filter((_, i) => i !== index) };
      });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col">
        <div className="p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-800">{transport ? '編輯交通安排' : '新增交通安排'}</h2>
        </div>
        <form onSubmit={handleSubmit} className="flex-grow overflow-y-auto p-6 space-y-4">
          
          <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">標題</label>
              <input 
                type="text" 
                name="title" 
                id="title"
                value={formData.title} 
                onChange={handleChange} 
                placeholder="例如：去程班機、京都往大阪"
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md bg-gray-50 text-black disabled:bg-gray-100 disabled:text-gray-500" 
                required 
                disabled={!canManage}
              />
          </div>

          <fieldset className="border p-4 rounded-md">
            <legend className="text-sm font-medium text-gray-700 px-2">行程分段</legend>
            <div className="space-y-4">
              {formData.segments.map((segment, index) => (
                <div key={index} className="p-4 border rounded-lg relative bg-gray-50">
                  <div className="flex justify-between items-center mb-4">
                      <h4 className="text-lg font-semibold text-gray-800">第 {index + 1} 段</h4>
                      {formData.segments.length > 1 && canManage && (
                          <button type="button" onClick={() => removeSegment(index)} className="p-1 text-gray-400 hover:text-red-600 rounded-full hover:bg-red-50" aria-label="移除此段行程">
                              <TrashIcon className="w-5 h-5" />
                          </button>
                      )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">出發時間</label>
                      <input type="datetime-local" value={segment.departureDateTime.substring(0, 16)} onChange={e => handleSegmentDateTimeChange(index, 'departureDateTime', e.target.value)} className="mt-1 block w-full p-2 border border-gray-300 rounded-md bg-gray-50 text-black disabled:bg-gray-100 disabled:text-gray-500" required disabled={!canManage} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">抵達時間</label>
                      <input type="datetime-local" value={segment.arrivalDateTime ? segment.arrivalDateTime.substring(0, 16) : ''} onChange={e => handleSegmentDateTimeChange(index, 'arrivalDateTime', e.target.value)} className="mt-1 block w-full p-2 border border-gray-300 rounded-md bg-gray-50 text-black disabled:bg-gray-100 disabled:text-gray-500" disabled={!canManage} />
                    </div>
                    <div className="md:col-span-2">
                        <div className="flex items-center text-sm text-gray-600 bg-gray-100 p-2 rounded-md border">
                            <ClockIcon className="w-5 h-5 mr-2 text-gray-500 flex-shrink-0" />
                            <span className="font-medium text-gray-500 mr-2">時間長度:</span>
                            <span className="font-semibold text-gray-800">{calculateDuration(segment.departureDateTime, segment.arrivalDateTime)}</span>
                        </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">出發地</label>
                      <input type="text" name="origin" value={segment.origin} onChange={e => handleSegmentChange(index, e)} className="mt-1 block w-full p-2 border border-gray-300 rounded-md bg-gray-50 text-black disabled:bg-gray-100 disabled:text-gray-500" required disabled={!canManage}/>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">目的地</label>
                      <input type="text" name="destination" value={segment.destination} onChange={e => handleSegmentChange(index, e)} className="mt-1 block w-full p-2 border border-gray-300 rounded-md bg-gray-50 text-black disabled:bg-gray-100 disabled:text-gray-500" required disabled={!canManage}/>
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700">交通方式</label>
                        <select name="transportMode" value={segment.transportMode} onChange={e => handleSegmentChange(index, e)} className="mt-1 block w-full p-2 border border-gray-300 rounded-md bg-gray-50 text-black disabled:bg-gray-100 disabled:text-gray-500" disabled={!canManage}>
                          <option value="飛行">飛行</option>
                          <option value="火車">火車</option>
                          <option value="巴士">巴士</option>
                          <option value="自行開車">自行開車</option>
                          <option value="船運">船運</option>
                          <option value="其他">其他</option>
                        </select>
                    </div>
                     <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <input type="text" name="number" value={segment.transportDetails.number} onChange={e => handleSegmentDetailsChange(index, e)} placeholder="班次/車次" className="p-2 border border-gray-300 rounded-md bg-gray-50 text-black disabled:bg-gray-100 disabled:text-gray-500" disabled={!canManage}/>
                        <input type="text" name="terminalOrPlatform" value={segment.transportDetails.terminalOrPlatform} onChange={e => handleSegmentDetailsChange(index, e)} placeholder="航廈/月台" className="p-2 border border-gray-300 rounded-md bg-gray-50 text-black disabled:bg-gray-100 disabled:text-gray-500" disabled={!canManage}/>
                        <input type="text" name="notes" value={segment.transportDetails.notes || ''} onChange={e => handleSegmentDetailsChange(index, e)} placeholder="備註" className="p-2 border border-gray-300 rounded-md bg-gray-50 text-black disabled:bg-gray-100 disabled:text-gray-500" disabled={!canManage}/>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {canManage && (
              <button type="button" onClick={addSegment} className="mt-4 w-full flex items-center justify-center space-x-2 p-2 rounded-lg border-2 border-dashed border-gray-300 text-gray-500 hover:bg-gray-100 hover:border-gray-400 transition">
                <PlusIcon className="w-5 h-5" />
                <span>新增轉乘/轉機</span>
              </button>
            )}
          </fieldset>
          
          <div>
              <label htmlFor="checkInTime" className="block text-sm font-medium text-gray-700">提前報到提醒</label>
              <input type="text" id="checkInTime" name="checkInTime" value={formData.checkInTime || ''} onChange={handleChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md bg-gray-50 text-black disabled:bg-gray-100 disabled:text-gray-500" placeholder="例如：建議於起飛前 3 小時抵達" disabled={!canManage}/>
           </div>
          
          <fieldset className="border p-4 rounded-md">
            <legend className="text-sm font-medium text-gray-700 px-2">提醒事項</legend>
            <div className="space-y-2">
                {formData.reminders.map((reminder, index) => (
                    <div key={index} className="flex items-center space-x-2">
                        <input type="text" value={reminder} onChange={e => handleReminderChange(index, e.target.value)} className="block w-full p-2 border border-gray-300 rounded-md bg-gray-50 text-black disabled:bg-gray-100 disabled:text-gray-500" disabled={!canManage}/>
                        {canManage && <button type="button" onClick={() => removeListItem('reminders', index)} className="p-2 text-gray-400 hover:text-red-600 rounded-full" aria-label="移除提醒"><TrashIcon className="w-5 h-5" /></button>}
                    </div>
                ))}
            </div>
            {canManage && <button type="button" onClick={() => addListItem('reminders')} className="mt-2 flex items-center text-sm font-medium text-blue-600"><PlusIcon className="w-4 h-4 mr-1" />新增提醒</button>}
          </fieldset>

          <fieldset className="border p-4 rounded-md">
            <legend className="text-sm font-medium text-gray-700 px-2">檢查表</legend>
            <div className="space-y-2">
                {formData.checklist.map((item, index) => {
                    const isOwnPersonalItem = item.authorId === currentUser.id;
                    const isTextEditable = canManage || isOwnPersonalItem;
                    const isDeletable = canManage || isOwnPersonalItem;

                    return (
                        <div key={item.id} className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                checked={item.isChecked}
                                onChange={() => handleChecklistToggle(index)}
                                className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 flex-shrink-0"
                            />
                            <input type="text" value={item.text} onChange={e => handleChecklistItemTextChange(index, e.target.value)} className="block w-full p-2 border border-gray-300 rounded-md bg-gray-50 text-black disabled:bg-gray-100 disabled:text-gray-500" disabled={!isTextEditable} />
                            {isDeletable ? (
                                <button type="button" onClick={() => removeListItem('checklist', index)} className="p-2 text-gray-400 hover:text-red-600 rounded-full flex-shrink-0" aria-label="移除項目"><TrashIcon className="w-5 h-5" /></button>
                            ) : (
                                <div className="w-9 h-9 flex-shrink-0" />
                            )}
                        </div>
                    );
                })}
            </div>
            <button type="button" onClick={() => addListItem('checklist')} className="mt-2 flex items-center text-sm font-medium text-blue-600"><PlusIcon className="w-4 h-4 mr-1" />新增項目</button>
          </fieldset>
        </form>
        <div className="p-6 bg-gray-50 border-t flex justify-end space-x-3">
          <button type="button" onClick={onClose} className="bg-gray-200 text-gray-800 font-semibold py-2 px-4 rounded-lg hover:bg-gray-300">取消</button>
          <button type="submit" formNoValidate onClick={handleSubmit} className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700">儲存</button>
        </div>
      </div>
    </div>
  );
};
export default TransportModal;
