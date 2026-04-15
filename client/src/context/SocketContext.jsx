// src/context/SocketContext.jsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useSelector, useDispatch } from 'react-redux';
import { updateFlightRealTime } from '../features/flightSlice';
import { updateRoomAvailability } from '../features/hotelSlice';
import { updateRealtimeOccupancy } from '../features/analyticsSlice';
import { updateTrainRealTime } from '../features/trainSlice';

export const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const { isAuthenticated } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  useEffect(() => {
    let newSocket;
    
    // In complex dev environments, window.location.origin might be 5173 
    // but server is 5002. Using explicit server URL if possible.
    const socketUrl = window.location.hostname === 'localhost' ? 'http://localhost:5002' : window.location.origin;

    if (isAuthenticated) {
      newSocket = io(socketUrl, {
        withCredentials: true,
      });

      newSocket.on('connect', () => {
        console.log('🔌 Socket Connected');
      });

      // Global event listeners for inventory
      newSocket.on('room:updated', (data) => {
        dispatch(updateRoomAvailability(data));
        dispatch(updateRealtimeOccupancy(data));
      });

      newSocket.on('seat:updated', (data) => {
        dispatch(updateFlightRealTime(data));
      });

      newSocket.on('train:seatUpdate', (data) => {
        console.log('🚂 Train Seat Update Received:', data);
        dispatch(updateTrainRealTime(data));
      });

      newSocket.on('flight:status_updated', (data) => {
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
