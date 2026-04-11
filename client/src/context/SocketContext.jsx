import { createContext, useContext, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const { user } = useAuth();
  const socketRef = useRef(null);

  useEffect(() => {
    const socket = io('/', { withCredentials: true, autoConnect: true });
    socketRef.current = socket;
    return () => { socket.disconnect(); socketRef.current = null; };
  }, []);

  return (
    <SocketContext.Provider value={socketRef}>
      {children}
    </SocketContext.Provider>
  );
}

export const useSocket = () => {
  const ref = useContext(SocketContext);
  return ref?.current;
};
