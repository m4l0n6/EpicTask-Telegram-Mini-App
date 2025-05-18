import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { Notification as StorageNotification, Badge } from "@/types";
import { getNotifications, markNotificationAsRead, clearAllNotifications } from "@/utils/storage";
import { useAuth } from "./AuthContext";

// Extended notification type with additional fields for UI display
export interface ServerNotification {
  id: string;
  type: string;
  message: string;
  read: boolean;
  createdAt: string;
  data?: {
    badge?: Badge;
    level?: number;
    xp?: number;
    tokens?: number;
    taskId?: string;
    taskTitle?: string;
    [key: string]: any;
  };
}

interface EnhancedNotificationContextType {
  notifications: ServerNotification[];
  unreadCount: number;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
}

const EnhancedNotificationContext = createContext<EnhancedNotificationContextType | undefined>(
  undefined
);

export const EnhancedNotificationProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [notifications, setNotifications] = useState<ServerNotification[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadNotifications();
    } else {
      setNotifications([]);
    }
  }, [user]);

  // Set up polling to check for new notifications
  useEffect(() => {
    if (user) {
      const interval = setInterval(loadNotifications, 30000); // Check every 30 seconds
      return () => clearInterval(interval);
    }
  }, [user]);

  const loadNotifications = () => {
    try {
      const storedNotifications = getNotifications();
      
      // Transform basic notifications to enhanced format
      const enhancedNotifications: ServerNotification[] = storedNotifications.map((notification: StorageNotification) => {
        // Extract data from message if it's in JSON format
        let data = {};
        try {
          if (notification.message.includes('{') && notification.message.includes('}')) {
            const jsonStr = notification.message.substring(
              notification.message.indexOf('{'),
              notification.message.lastIndexOf('}') + 1
            );
            data = JSON.parse(jsonStr);
          }
        } catch (e) {
          console.error('Failed to parse notification data:', e);
        }
        
        let message = notification.message;
        
        // Clean message if it contains JSON
        if (message.includes('{') && message.includes('}')) {
          message = message.substring(0, message.indexOf('{')).trim();
        }
        
        return {
          id: notification.id,
          type: notification.type,
          message: message,
          read: notification.read,
          createdAt: notification.createdAt,
          data: data
        };
      });
      
      // Sort by creation date (newest first)
      enhancedNotifications.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      
      setNotifications(enhancedNotifications);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    }
  };

  const markAsRead = (notificationId: string) => {
    markNotificationAsRead(notificationId);
    setNotifications(prevNotifications =>
      prevNotifications.map(notification =>
        notification.id === notificationId
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    notifications.forEach(notification => {
      if (!notification.read) {
        markNotificationAsRead(notification.id);
      }
    });
    
    setNotifications(prevNotifications =>
      prevNotifications.map(notification => ({
        ...notification,
        read: true
      }))
    );
  };
  
  const clearNotifications = () => {
    clearAllNotifications();
    setNotifications([]);
  };

  const unreadCount = notifications.filter(notification => !notification.read).length;

  return (
    <EnhancedNotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        clearNotifications
      }}
    >
      {children}
    </EnhancedNotificationContext.Provider>
  );
};

export const useNotifications = (): EnhancedNotificationContextType => {
  const context = useContext(EnhancedNotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within an EnhancedNotificationProvider');
  }
  return context;
};
