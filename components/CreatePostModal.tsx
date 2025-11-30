
import React, { useState, useEffect } from 'react';
import { SocialPost } from '../types';
import { PhotoIcon } from './icons';

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (postData: Omit<SocialPost, 'id' | 'author' | 'timestamp' | 'comments' | 'likes'>) => void;
  post: SocialPost | null;
}

const CreatePostModal: React.FC<CreatePostModalProps> = ({ isOpen, onClose, onSave, post }) => {
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image');
  const [isPublic, setIsPublic] = useState(true);

  useEffect(() => {
    if (post) {
      setTitle(post.title);
      setText(post.text);
      setMediaUrl(post.mediaUrl || '');
      setMediaType(post.mediaType || 'image');
      setIsPublic(post.isPublic);
    } else {
      // Reset form for new post
      setTitle('');
      setText('');
      setMediaUrl('');
      setMediaType('image');
      setIsPublic(true);
    }
  }, [post]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type.startsWith('video/')) {
          setMediaType('video');
      } else {
          setMediaType('image');
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setMediaUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim() && text.trim()) {
      onSave({ 
        title, 
        text, 
        mediaUrl: mediaUrl || undefined, 
        mediaType: mediaUrl ? mediaType : undefined, 
        isPublic 
      });
      onClose();
    }
  };

  if (!isOpen) return null;

  const isFormValid = title.trim() !== '' && text.trim() !== '';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="p-6 border-b flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">{post ? '編輯遊記' : '發布新遊記'}</h2>
           <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl font-bold">&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="flex-grow overflow-y-auto p-6 space-y-4">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="為您的遊記取個標題吧！"
            className="w-full p-2 border-b-2 border-gray-200 focus:border-blue-500 focus:ring-0 text-2xl font-bold bg-gray-50 text-black placeholder-gray-400 outline-none"
            required
          />
          
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="分享您的旅遊心情..."
            className="w-full p-3 mt-2 border border-gray-200 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-base bg-gray-50 text-black"
            rows={6}
            required
          />
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">上傳照片或影片 (選填)</label>
            <div className="mt-1 flex flex-col items-center justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                {mediaUrl ? (
                    <div className="mb-4 relative group">
                        {mediaType === 'image' ? (
                          <img src={mediaUrl} alt="預覽" className="mx-auto h-48 w-auto rounded-md object-contain" />
                        ) : (
                          <video src={mediaUrl} controls className="mx-auto h-48 w-auto rounded-md" />
                        )}
                         <button type="button" onClick={() => setMediaUrl('')} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center font-bold text-sm opacity-0 group-hover:opacity-100 transition">&times;</button>
                    </div>
                ) : (
                    <div className="space-y-1 text-center">
                        <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
                        <div className="flex text-sm text-gray-600 justify-center">
                            <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                                <span>上傳檔案</span>
                                <input id="file-upload" name="file-upload" type="file" className="sr-only" accept="image/*,video/*" onChange={handleFileChange} />
                            </label>
                        </div>
                        <p className="text-xs text-gray-500">PNG, JPG, MP4, etc.</p>
                    </div>
                )}
            </div>
          </div>
          
          <div className="pt-4 border-t">
            <label className="block text-sm font-medium text-gray-700 mb-2">隱私設定</label>
            <div className="flex items-center space-x-4">
              <label htmlFor="isPublicToggle" className="flex items-center cursor-pointer">
                <div className="relative">
                  <input type="checkbox" id="isPublicToggle" className="sr-only" checked={isPublic} onChange={() => setIsPublic(!isPublic)} />
                  <div className="block bg-gray-600 w-14 h-8 rounded-full"></div>
                  <div className="dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition"></div>
                </div>
                <div className="ml-3 text-gray-700">
                    <p className="font-semibold">{isPublic ? '公開' : '私人'}</p>
                    <p className="text-xs">{isPublic ? '行程的其他成員可以看見' : '僅限個人看見'}</p>
                </div>
              </label>
            </div>
          </div>
          <style>{`
            input:checked ~ .dot {
              transform: translateX(100%);
              background-color: #f0f9ff;
            }
            input:checked ~ .block {
                background-color: #2563eb;
            }
          `}</style>

        </form>
        <div className="p-6 bg-gray-50 border-t flex justify-end space-x-3">
          <button type="button" onClick={onClose} className="bg-gray-200 text-gray-800 font-semibold py-2 px-4 rounded-lg hover:bg-gray-300">取消</button>
          <button type="submit" formNoValidate onClick={handleSubmit} disabled={!isFormValid} className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed">
            {post ? '儲存變更' : '發布'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreatePostModal;
