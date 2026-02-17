"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Notification {
  id: string;
  type: string;
  message: string;
  createdAt: string;
  read: boolean;
  relatedId?: string;
}

interface NotificationDropdownProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function NotificationDropdown({ isOpen, onClose }: NotificationDropdownProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
        setLoading(true);
        import("firebase/auth").then(async ({ getAuth }) => {
            const auth = getAuth();
            const user = auth.currentUser;
            if (user) {
                const token = await user.getIdToken();
                fetch("/api/notifications", {
                    headers: { "Authorization": `Bearer ${token}` }
                })
                .then(res => res.json())
                .then(data => {
                    if (data.notifications) {
                        setNotifications(data.notifications);
                    }
                })
                .catch(err => console.error(err))
                .finally(() => setLoading(false));
            } else {
                setLoading(false);
            }
        });
    }
  }, [isOpen]);

  const getTimeAgo = (dateStr: string) => {
      const diff = Date.now() - new Date(dateStr).getTime();
      const mins = Math.floor(diff / 60000);
      if (mins < 1) return "방금 전";
      if (mins < 60) return `${mins}분 전`;
      const hours = Math.floor(mins / 60);
      if (hours < 24) return `${hours}시간 전`;
      return `${Math.floor(hours / 24)}일 전`;
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-[90]" onClick={onClose}></div>

      <div className="absolute top-12 right-0 w-[320px] bg-white rounded-2xl shadow-xl border border-gray-100 z-[95] overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
           <h3 className="font-bold text-sm">알림</h3>
           <button className="text-[11px] text-gray-400 hover:text-black">모두 읽음</button>
        </div>

        <div className="max-h-[300px] overflow-y-auto">
          {loading ? (
             <div className="p-8 text-center text-gray-400 text-xs">로딩 중...</div>
          ) : notifications.length > 0 ? (
            notifications.map((noti) => (
              <div key={noti.id} className={`p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors ${!noti.read ? "bg-blue-50/30" : ""}`}>
                <div className="flex gap-3">
                  <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${
                    noti.type === "like" ? "bg-red-100 text-red-500" :
                    noti.type === "superstar" ? "bg-purple-100 text-purple-500" : "bg-gray-100 text-gray-500"
                  }`}>
                      <span className="material-symbols-outlined text-[16px]">
                          {noti.type === "like" ? "favorite" : noti.type === "superstar" ? "star" : "info"}
                      </span>
                  </div>
                  <div>
                    <p className="text-[13px] text-gray-800 leading-snug font-korean break-keep">
                        {noti.message}
                    </p>
                    <span className="text-[10px] text-gray-400 mt-1 block">{getTimeAgo(noti.createdAt)}</span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-gray-400 text-xs">
              새로운 알림이 없습니다.
            </div>
          )}
        </div>

        <div className="p-2 bg-gray-50 border-t border-gray-100 text-center">
            <Link href="#" className="text-[11px] text-gray-500 font-medium hover:text-black">전체보기</Link>
        </div>
      </div>
    </>
  );
}
