import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { toast } from "@/hooks/use-toast";

interface SocketContextType {
  socket: Socket | null;
  connected: boolean;
  emitEvent: (eventName: string, data: Record<string, unknown>) => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const SocketProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const { user } = useAuth();

  const emitEvent = (eventName: string, data: Record<string, unknown>) => {
    if (socket && connected) {
      socket.emit(eventName, data);
    } else {
      console.warn("Socket not connected, can't emit event:", eventName);
    }
  };

  useEffect(() => {
    // Lấy URL cơ sở từ biến môi trường, không bao gồm đường dẫn
    const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";
    
    // Tạo URL cơ sở cho Socket.IO (chỉ lấy phần protocol + domain + port)
    const url = new URL(apiUrl);
    const SOCKET_URL = `${url.protocol}//${url.host}`;
    
    console.log("Attempting socket connection to:", SOCKET_URL);
    
    const socketInstance = io(SOCKET_URL, {
      withCredentials: true,
      transports: ["websocket", "polling"],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 20000,
    });

    socketInstance.on("connect_error", (err) => {
      console.error("Socket connection error:", err);
    });

    socketInstance.on("connect_timeout", () => {
      console.error("Socket connection timeout");
    });

    socketInstance.on('connect', () => {
      console.log('Socket connected!', socketInstance.id);
      setConnected(true);
      
      if (user && user._id) {
        socketInstance.emit('authenticate', user._id);
      }
    });

    socketInstance.on('disconnect', () => {
      console.log('Socket disconnected!');
      setConnected(false);
    });

    socketInstance.on('badge_unlocked', ({ badge }) => {
      console.log('New badge unlocked:', badge);
      toast({
        title: "New Badge Unlocked! 🏆",
        description: `You've earned the "${badge.title}" badge!`,
        variant: "default",
      });
      document.dispatchEvent(new CustomEvent('badgeUnlocked'));
    });

    socketInstance.on('task_updated', ({ task }) => {
      console.log('Task updated:', task);
      document.dispatchEvent(new CustomEvent('taskUpdated'));
    });

    socketInstance.on('level_up', ({ oldLevel, newLevel }) => {
      console.log(`Level up! ${oldLevel} -> ${newLevel}`);
      toast({
        title: "Level Up! 🎉",
        description: `You've reached level ${newLevel}!`,
        variant: "default",
      });
    });

    socketInstance.on('tokens_added', ({ amount }) => {
      console.log(`${amount} tokens added via socket!`);
      
      // Tạo custom event để thông báo cho AuthContext
      document.dispatchEvent(
        new CustomEvent('tokensAdded', { 
          detail: { amount } 
        })
      );
      
      toast({
        title: "Tokens Received",
        description: `You've earned ${amount} tokens!`,
        variant: "default",
      });
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [user]);

  useEffect(() => {
    if (socket && user && user._id) {
      socket.emit('authenticate', user._id);
    }
  }, [socket, user]);

  return (
    <SocketContext.Provider value={{ socket, connected, emitEvent }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
};
