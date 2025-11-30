
import React, { useState, useRef } from 'react';
import { Announcement, User, UserRole } from '../types';
import { MegaphoneIcon, PencilIcon, TrashIcon, PhotoIcon } from './icons';
import ImageViewerModal from './ImageViewerModal';

interface AnnouncementPanelProps {
  announcements: Announcement[];
  currentUser: User;
  onPostAnnouncement: (text: string, imageUrl?: string) => void;
  onUpdateAnnouncement: (announcement: Announcement) => void;
  onDeleteAnnouncement: (announcementId: string) => void;
}

const AnnouncementPanel: React.FC<AnnouncementPanelProps> = ({ announcements, currentUser, onPostAnnouncement, onUpdateAnnouncement, onDeleteAnnouncement }) => {
  const [newAnnouncement, setNewAnnouncement] = useState('');
  const [newAnnouncementImage, setNewAnnouncementImage] = useState<string | null>(null);
  const [viewingImage, setViewingImage] = useState<string | null>(null);
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [editImage, setEditImage] = useState<string | null | undefined>(null);

  const newImageInputRef = useRef<HTMLInputElement>(null);
  const editImageInputRef = useRef<HTMLInputElement>(null);
  
  const canManage = currentUser.role === UserRole.TourLeader || currentUser.role === UserRole.Admin;

  const handleImageUpload = (file: File, setImage: (data: string | null) => void) => {
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newAnnouncement.trim()) {
      onPostAnnouncement(newAnnouncement, newAnnouncementImage || undefined);
      setNewAnnouncement('');
      setNewAnnouncementImage(null);
      if(newImageInputRef.current) newImageInputRef.current.value = "";
    }
  };

  const handleEditStart = (ann: Announcement) => {
    setEditingId(ann.id);
    setEditText(ann.text);
    setEditImage(ann.imageUrl);
  };
  
  const handleEditCancel = () => {
    setEditingId(null);
    setEditText('');
    setEditImage(null);
  };

  const handleEditSave = () => {
    if (!editingId) return;
    const originalAnnouncement = announcements.find(a => a.id === editingId);
    if (!originalAnnouncement) return;

    onUpdateAnnouncement({
      ...originalAnnouncement,
      text: editText,
      imageUrl: editImage || undefined,
    });
    handleEditCancel();
  };

  const timeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " 年前";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " 個月前";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " 天前";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " 小時前";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " 分鐘前";
    return Math.floor(seconds) + " 秒前";
  };

  return (
    <>
      <div className="bg-blue-50 border border-blue-200 rounded-xl shadow-lg p-6 flex flex-col">
        <h3 className="text-xl font-bold text-gray-800 flex items-center mb-4">
          <MegaphoneIcon className="w-6 h-6 mr-3 text-blue-600"/>
          公告
        </h3>
        
        {canManage && (
          <form onSubmit={handleSubmit} className="mb-6 bg-white p-4 rounded-lg shadow">
            <textarea
              value={newAnnouncement}
              onChange={(e) => setNewAnnouncement(e.target.value)}
              placeholder="發布一則公告..."
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-gray-50 text-black"
              rows={3}
            />
            {newAnnouncementImage && (
              <div className="mt-3 relative p-2 border border-dashed rounded-md">
                  <img src={newAnnouncementImage} alt="預覽" className="w-full h-auto max-h-48 object-contain rounded-md" />
                  <button type="button" onClick={() => {setNewAnnouncementImage(null); if(newImageInputRef.current) newImageInputRef.current.value = ""}} className="absolute top-1 right-1 bg-black bg-opacity-50 text-white rounded-full w-6 h-6 flex items-center justify-center font-bold text-sm">&times;</button>
              </div>
            )}
            <div className="flex justify-between items-center mt-2">
               <button type="button" onClick={() => newImageInputRef.current?.click()} className="text-gray-500 hover:text-blue-600 p-2 rounded-full hover:bg-blue-100 transition-colors" aria-label="新增圖片">
                  <PhotoIcon className="w-6 h-6" />
                  <input type="file" ref={newImageInputRef} onChange={e => e.target.files && handleImageUpload(e.target.files[0], setNewAnnouncementImage)} className="hidden" accept="image/*" />
               </button>
               <button
                  type="submit"
                  className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400"
                  disabled={!newAnnouncement.trim()}
                >
                  發布公告
                </button>
            </div>
          </form>
        )}

        <div className="flex-grow overflow-y-auto space-y-4 pr-2 -mr-2">
          {announcements.map(ann => (
            <div key={ann.id} className="bg-white p-4 rounded-lg shadow-sm transition-all duration-300">
              {editingId === ann.id && canManage ? (
                // EDITING VIEW
                <div>
                  <textarea value={editText} onChange={e => setEditText(e.target.value)} rows={3} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-gray-50 text-black" />
                  {editImage && (
                      <div className="mt-3 relative p-2 border border-dashed rounded-md">
                          <img src={editImage} alt="預覽" className="w-full h-auto max-h-48 object-contain rounded-md" />
                          <button type="button" onClick={() => {setEditImage(null); if(editImageInputRef.current) editImageInputRef.current.value = ""}} className="absolute top-1 right-1 bg-black bg-opacity-50 text-white rounded-full w-6 h-6 flex items-center justify-center font-bold text-sm">&times;</button>
                      </div>
                  )}
                  <div className="flex justify-between items-center mt-2">
                      <button type="button" onClick={() => editImageInputRef.current?.click()} className="text-gray-500 hover:text-blue-600 p-2 rounded-full hover:bg-blue-100 transition-colors" aria-label="變更圖片">
                          <PhotoIcon className="w-6 h-6" />
                          <input type="file" ref={editImageInputRef} onChange={e => e.target.files && handleImageUpload(e.target.files[0], (img) => setEditImage(img))} className="hidden" accept="image/*" />
                      </button>
                      <div className="space-x-2">
                          <button onClick={handleEditCancel} className="bg-gray-200 text-gray-800 font-semibold py-1.5 px-3 rounded-lg hover:bg-gray-300">取消</button>
                          <button onClick={handleEditSave} className="bg-blue-600 text-white font-semibold py-1.5 px-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400" disabled={!editText.trim()}>儲存</button>
                      </div>
                  </div>
                </div>
              ) : (
                // DISPLAY VIEW
                <div className="flex items-start space-x-4">
                  <img src={ann.author.avatarUrl} alt={ann.author.name} className="w-10 h-10 rounded-full flex-shrink-0" />
                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <div>
                          <p className="text-sm font-semibold text-gray-900">{ann.author.name}</p>
                          <p className="text-xs text-gray-500">{timeAgo(ann.timestamp)}</p>
                      </div>
                      {canManage && (
                        <div className="flex items-center space-x-1">
                          <button onClick={() => handleEditStart(ann)} className="p-1 text-gray-400 hover:text-blue-600 rounded-full hover:bg-gray-100 transition" aria-label="編輯公告"><PencilIcon className="w-4 h-4"/></button>
                          <button onClick={() => onDeleteAnnouncement(ann.id)} className="p-1 text-gray-400 hover:text-red-600 rounded-full hover:bg-gray-100 transition" aria-label="刪除公告"><TrashIcon className="w-4 h-4"/></button>
                        </div>
                      )}
                    </div>
                    <div className={`mt-2 ${ann.imageUrl ? 'flex items-start space-x-4' : ''}`}>
                      <p className="text-sm text-gray-700 whitespace-pre-wrap flex-1">{ann.text}</p>
                      {ann.imageUrl && 
                        <img 
                          src={ann.imageUrl} 
                          alt="公告縮圖" 
                          className="w-24 h-24 object-cover rounded-lg cursor-pointer transition-transform hover:scale-105 flex-shrink-0"
                          onClick={() => setViewingImage(ann.imageUrl)}
                        />
                      }
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      {viewingImage && (
        <ImageViewerModal 
            imageUrl={viewingImage} 
            onClose={() => setViewingImage(null)} 
            altText="公告圖片"
        />
      )}
    </>
  );
};

export default AnnouncementPanel;
