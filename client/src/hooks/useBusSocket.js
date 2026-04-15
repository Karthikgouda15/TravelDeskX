// /Users/karthikgouda/Desktop/TravelDesk/client/src/hooks/useBusSocket.js
import { useEffect, useContext } from 'react';
import { useDispatch } from 'react-redux';
import { SocketContext } from '../context/SocketContext';
import { updateBusRealTime } from '../features/busSlice';

/**
 * Custom hook to manage real-time bus availability subscriptions
 * @param {Array} results - Current list of buses being viewed
 */
const useBusSocket = (results) => {
  const socket = useContext(SocketContext);
  const dispatch = useDispatch();

  useEffect(() => {
    if (!socket || !results || results.length === 0) return;

    // Subscribe to all buses in the current view
    results.forEach(bus => {
      socket.emit('bus:subscribe', bus._id);
    });

    const handleSeatUpdate = (data) => {
      console.log('🚍 Bus Seat Update Received:', data);
      dispatch(updateBusRealTime(data));
    };

    socket.on('bus:seatUpdate', handleSeatUpdate);

    // Cleanup: unsubscribe when component unmounts or search changes
    return () => {
      results.forEach(bus => {
        socket.emit('bus:unsubscribe', bus._id);
      });
      socket.off('bus:seatUpdate', handleSeatUpdate);
    };
  }, [socket, results, dispatch]);
};

export default useBusSocket;
