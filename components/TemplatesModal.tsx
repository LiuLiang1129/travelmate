
import React, { useState, useEffect } from 'react';
import { ItineraryTemplate, ItineraryItemType } from '../types';
import { PencilIcon, TrashIcon, PlusIcon } from './icons';

interface TemplatesModalProps {
  isOpen: boolean;
  onClose: () => void;
  templates: ItineraryTemplate[];
  onCreate: (templateData: Omit<ItineraryTemplate, 'id'>) => void;
  onUpdate: (template: ItineraryTemplate) => void;
  onDelete: (templateId: string) => void;
}

const TemplatesModal: React.FC<TemplatesModalProps> = ({ isOpen, onClose, templates, onCreate, onUpdate, onDelete }) => {
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<ItineraryTemplate | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    type: ItineraryItemType.Activity,
    duration: '',
    description: '',
    location: '',
  });

  useEffect(() => {
    if (editingTemplate) {
      setFormData({
        title: editingTemplate.title,
        type: editingTemplate.type,
        duration: editingTemplate.duration,
        description: editingTemplate.description,
        location: editingTemplate.location,
      });
    } else {
      setFormData({
        title: '',
        type: ItineraryItemType.Activity,
        duration: '',
        description: '',
        location: '',
      });
    }
  }, [editingTemplate]);

  if (!isOpen) return null;

  const handleEditClick = (template: ItineraryTemplate) => {
    setEditingTemplate(template);
    setIsFormVisible(true);
  };

  const handleAddNewClick = () => {
    setEditingTemplate(null);
    setIsFormVisible(true);
  };

  const handleBackToList = () => {
    setIsFormVisible(false);
    setEditingTemplate(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingTemplate) {
      onUpdate({ ...editingTemplate, ...formData });
    } else {
      onCreate(formData);
    }
    handleBackToList();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col">
        <div className="p-6 border-b flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">{isFormVisible ? (editingTemplate ? '編輯範本' : '新增範本') : '管理行程範本'}</h2>
          {!isFormVisible && (
            <button onClick={handleAddNewClick} className="flex items-center bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-blue-700 transition">
              <PlusIcon className="w-5 h-5 mr-2" />
              新增範本
            </button>
          )}
        </div>

        <div className="flex-grow overflow-y-auto p-6">
          {isFormVisible ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700">標題</label>
                  <input type="text" name="title" id="title" value={formData.title} onChange={handleChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md bg-gray-50 text-black" required />
                </div>
                <div>
                  <label htmlFor="type" className="block text-sm font-medium text-gray-700">類型</label>
                  <select name="type" id="type" value={formData.type} onChange={handleChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md bg-gray-50 text-black">
                    {Object.values(ItineraryItemType).filter(t => t !== ItineraryItemType.Accommodation).map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label htmlFor="duration" className="block text-sm font-medium text-gray-700">時長 (例如 2 小時)</label>
                <input type="text" name="duration" id="duration" value={formData.duration} onChange={handleChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md bg-gray-50 text-black" />
              </div>
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">描述</label>
                <textarea name="description" id="description" value={formData.description} onChange={handleChange} rows={4} className="mt-1 block w-full p-2 border border-gray-300 rounded-md bg-gray-50 text-black" required></textarea>
              </div>
              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700">地點</label>
                <input type="text" name="location" id="location" value={formData.location} onChange={handleChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md bg-gray-50 text-black" />
              </div>
            </form>
          ) : (
            <div className="space-y-3">
              {templates.length > 0 ? templates.map(template => (
                <div key={template.id} className="bg-gray-50 p-4 rounded-lg flex justify-between items-center border">
                  <div>
                    <p className="font-bold text-gray-800">{template.title}</p>
                    <p className="text-sm text-gray-600">{template.type} - {template.description.substring(0, 50)}...</p>
                  </div>
                  <div className="flex space-x-2 flex-shrink-0">
                    <button onClick={() => handleEditClick(template)} className="p-2 text-gray-500 hover:text-blue-600 rounded-full hover:bg-gray-100 transition" aria-label="編輯範本"><PencilIcon className="w-5 h-5"/></button>
                    <button onClick={() => onDelete(template.id)} className="p-2 text-gray-500 hover:text-red-600 rounded-full hover:bg-gray-100 transition" aria-label="刪除範本"><TrashIcon className="w-5 h-5"/></button>
                  </div>
                </div>
              )) : (
                <div className="text-center py-12">
                    <h3 className="text-lg font-medium text-gray-700">沒有已儲存的範本</h3>
                    <p className="text-gray-500 mt-1">您可以從行程項目中儲存範本，或點擊「新增範本」。</p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="p-6 bg-gray-50 border-t flex justify-end space-x-3">
          {isFormVisible ? (
            <>
              <button type="button" onClick={handleBackToList} className="bg-gray-200 text-gray-800 font-semibold py-2 px-4 rounded-lg hover:bg-gray-300">返回列表</button>
              <button type="submit" onClick={handleSubmit} className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700">儲存範本</button>
            </>
          ) : (
            <button type="button" onClick={onClose} className="bg-gray-200 text-gray-800 font-semibold py-2 px-4 rounded-lg hover:bg-gray-300">關閉</button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TemplatesModal;
