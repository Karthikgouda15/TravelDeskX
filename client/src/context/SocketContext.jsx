// src/context/SocketContext.jsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useSelector, useDispatch } from 'react-redux';
import { updateFlightRealTime } from '../features/flightSlice';
import { updateRoomAvailability } from '../features/hotelSlice';
import { updateRealtimeOccupancy } from '../features/analyticsSlice';

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const { isAuthenticated } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  useEffect(() => {
    let newSocket;
    if (isAuthenticated) {
      newSocket = io(window.location.origin, {
        withCredentials: true,
      });

      newSocket.on('connect', () => {
        console.log('🔌 Socket Connected');
      });

      // Global event listeners for inventory
      newSocket.on('room:updated', (data) => {
        console.log('🎯 Room Update Received:', data);
        dispatch(updateRoomAvailability(data));
        dispatch(updateRealtimeOccupancy(data));
      });

      newSocket.on('seat:updated', (data) => {
        console.log('🎯 Seat Update Received:', data);
        dispatch(updateFlightRealTime(data));
      });

      newSocket.on('flight:status_updated', (data) => {
        console.log('🎯 Flight Status Update Received:', data);
        dispatch(updateFlightRealTime(data));
      });

      setSocket(newSocket);
    }

    return () => {
      if (newSocket) {
        newSocket.disconnect();
      }
    };
  }, [isAuthenticated, dispatch]);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};
