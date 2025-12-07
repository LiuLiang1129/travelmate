
import React, { useState, useRef } from 'react';
import { Announcement, User, UserRole } from '../types';
import { MegaphoneIcon, PencilIcon, TrashIcon, PhotoIcon } from './icons';
import ImageViewerModal from './ImageViewerModal';

import { processImageFile } from '../utils/imageUtils';

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

  const handleImageUpload = async (file: File, setImage: (data: string | null) => void) => {
    if (file) {
      try {
        const processedFile = await processImageFile(file);
        const reader = new FileReader();
        reader.onloadend = () => {
          setImage(reader.result as string);
        };
        reader.readAsDataURL(processedFile);
      } catch (error) {
        console.error("Error processing image:", error);
        alert("無法處理圖片");
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newAnnouncement.trim()) {
      onPostAnnouncement(newAnnouncement, newAnnouncementImage || undefined);
      setNewAnnouncement('');
      setNewAnnouncementImage(null);
      if (newImageInputRef.current) newImageInputRef.current.value = "";
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
          <MegaphoneIcon className="w-6 h-6 mr-3 text-blue-600" />
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
                <button type="button" onClick={() => { setNewAnnouncementImage(null); if (newImageInputRef.current) newImageInputRef.current.value = "" }} className="absolute top-1 right-1 bg-black bg-opacity-50 text-white rounded-full w-6 h-6 flex items-center justify-center font-bold text-sm">&times;</button>
              </div>
            )}
            <div className="flex justify-between items-center mt-2">
              <button type="button" onClick={() => newImageInputRef.current?.click()} className="text-gray-500 hover:text-blue-600 p-2 rounded-full hover:bg-blue-100 transition-colors" aria-label="新增圖片">
                <PhotoIcon className="w-6 h-6" />
                <input type="file" ref={newImageInputRef} onChange={e => {
                  const file = e.target.files?.[0];
                  if (file) handleImageUpload(file, setNewAnnouncementImage);
                }} className="hidden" accept="image/*,.heic,.heif" />
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

        <div className="flex-grow overflow-y-auto space-y-4 pr-1">
          {announcements.length === 0 ? (
            <p className="text-gray-500 text-center py-4">目前沒有公告。</p>
          ) : (
            announcements.map((ann) => (
              <div key={ann.id} className="bg-white p-4 rounded-lg shadow border border-gray-100">
                {editingId === ann.id ? (
                  <div className="space-y-3">
                    <textarea
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                      rows={3}
                    />
                    {editImage && (
                      <div className="relative w-full max-w-xs mx-auto">
                        <img src={editImage} alt="編輯預覽" className="rounded-lg shadow-sm max-h-40 object-cover" />
                        <button onClick={() => setEditImage(null)} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 shadow hover:bg-red-600">
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                    <div className="flex items-center space-x-2">
                      <button onClick={() => editImageInputRef.current?.click()} className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center">
                        <PhotoIcon className="w-5 h-5 mr-1" />
                        更換圖片
                      </button>
                      <input type="file" ref={editImageInputRef} onChange={e => {
                        const file = e.target.files?.[0];
                        if (file) handleImageUpload(file, (img) => setEditImage(img));
                      }} className="hidden" accept="image/*,.heic,.heif" />
                    </div>
                    <div className="flex justify-end space-x-2">
                      <button onClick={handleEditCancel} className="px-3 py-1 text-gray-600 hover:text-gray-800">取消</button>
                      <button onClick={handleEditSave} className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700">儲存</button>
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
                            <button onClick={() => handleEditStart(ann)} className="p-1 text-gray-400 hover:text-blue-600 rounded-full hover:bg-gray-100 transition" aria-label="編輯公告"><PencilIcon className="w-4 h-4" /></button>
                            <button onClick={() => onDeleteAnnouncement(ann.id)} className="p-1 text-gray-400 hover:text-red-600 rounded-full hover:bg-gray-100 transition" aria-label="刪除公告"><TrashIcon className="w-4 h-4" /></button>
                          </div>
                        )}
                      </div>
                      <div className={`mt-2 ${ann.imageUrl ? 'flex items-start space-x-4' : ''}`}>
                        <p className="text-sm text-gray-700 whitespace-pre-wrap flex-1">{ann.text}</p>
                        {ann.imageUrl && (
                          <img
                            src={ann.imageUrl}
                            alt="公告縮圖"
                            className="w-24 h-24 object-cover rounded-lg cursor-pointer transition-transform hover:scale-105 flex-shrink-0"
                            onClick={() => setViewingImage(ann.imageUrl || null)}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )))}
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
