// src/hooks/useFlightSocket.js
import { useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { io } from 'socket.io-client';
import { updateFlightRealTime } from '../features/flightSlice';

// Empty string → connects to current origin, letting the Vite proxy forward /socket.io → backend
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || '';

/**
 * Connects to Socket.io and listens for `flight:priceUpdate` events.
 * Dispatches updateFlightRealTime to Redux on each event.
 * Returns liveToast — a recent update to display in the UI ticker.
 */
const useFlightSocket = (subscribedFlightIds = []) => {
  const dispatch = useDispatch();
  const socketRef = useRef(null);
  const [liveUpdates, setLiveUpdates] = useState([]);

  useEffect(() => {
    const socket = io(SOCKET_URL, {
      withCredentials: true,
      transports: ['websocket', 'polling'],
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('[Socket] Connected:', socket.id);
      // Subscribe to any flight-specific rooms if IDs are provided
      subscribedFlightIds.forEach((id) => {
        socket.emit('flight:subscribe', id);
      });
    });

    socket.on('flight:priceUpdate', (payload) => {
      const { flightId, availableSeats, price, airline } = payload;

      // Update Redux state
      dispatch(updateFlightRealTime({ flightId, availableSeats, price }));

      // Append to live updates for ticker display (keep last 5)
      setLiveUpdates((prev) => {
        const update = {
          id: Date.now(),
          airline: airline || 'A flight',
          availableSeats,
          price,
          flightId,
          timestamp: Date.now(),
        };
        return [update, ...prev].slice(0, 5);
      });
    });

    socket.on('disconnect', () => {
      console.log('[Socket] Disconnected');
    });

    return () => {
      subscribedFlightIds.forEach((id) => {
        socket.emit('flight:unsubscribe', id);
      });
      socket.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch]);

  return { liveUpdates };
};

export default useFlightSocket;
