
import React, { useState } from 'react';
import { PhotoIcon } from './icons';

interface CreateThreadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { title: string; content: string; topic: string; imageUrl?: string }) => void;
}

const TOPICS = ['餐飲', '景點', '交通', '住宿', '購物', '其他'];

const CreateThreadModal: React.FC<CreateThreadModalProps> = ({ isOpen, onClose, onSave }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [topic, setTopic] = useState(TOPICS[0]);
  const [imageUrl, setImageUrl] = useState<string | undefined>(undefined);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim() && content.trim()) {
      onSave({ title, content, topic, imageUrl });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="p-6 border-b flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">發起新討論</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl font-bold">&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="flex-grow overflow-y-auto p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label htmlFor="thread-title" className="block text-sm font-medium text-gray-700">標題</label>
              <input
                type="text"
                id="thread-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md bg-gray-50 text-black"
                required
              />
            </div>
            <div>
              <label htmlFor="thread-topic" className="block text-sm font-medium text-gray-700">主題</label>
              <select
                id="thread-topic"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md bg-gray-50 text-black"
              >
                {TOPICS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label htmlFor="thread-content" className="block text-sm font-medium text-gray-700">內容</label>
            <textarea
              id="thread-content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={6}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md bg-gray-50 text-black"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">上傳圖片 (選填)</label>
            <div className="mt-1 flex flex-col items-center justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                {imageUrl ? (
                    <div className="mb-4 relative group">
                        <img src={imageUrl} alt="預覽" className="mx-auto h-40 w-auto rounded-md object-contain" />
                         <button type="button" onClick={() => setImageUrl(undefined)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center font-bold text-sm opacity-0 group-hover:opacity-100 transition">&times;</button>
                    </div>
                ) : (
                    <div className="space-y-1 text-center">
                        <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
                        <div className="flex text-sm text-gray-600 justify-center">
                            <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                                <span>上傳檔案</span>
                                <input id="file-upload" name="file-upload" type="file" className="sr-only" accept="image/*" onChange={handleFileChange} />
                            </label>
                        </div>
                        <p className="text-xs text-gray-500">PNG, JPG, GIF</p>
                    </div>
                )}
            </div>
          </div>
        </form>
        <div className="p-6 bg-gray-50 border-t flex justify-end space-x-3">
          <button type="button" onClick={onClose} className="bg-gray-200 text-gray-800 font-semibold py-2 px-4 rounded-lg hover:bg-gray-300">取消</button>
          <button type="submit" formNoValidate onClick={handleSubmit} disabled={!title.trim() || !content.trim()} className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400">
            發布
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateThreadModal;
