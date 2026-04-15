// /Users/karthikgouda/Desktop/TravelDesk/client/src/hooks/useTrainSocket.js
import { useEffect, useContext } from 'react';
import { useDispatch } from 'react-redux';
import { SocketContext } from '../context/SocketContext';
import { updateTrainRealTime } from '../features/trainSlice';

const useTrainSocket = (results) => {
  const socket = useContext(SocketContext);
  const dispatch = useDispatch();

  useEffect(() => {
    if (!socket || !results.length) return;

    // Subscribe to all trains currently in view
    results.forEach(train => {
      socket.emit('train:subscribe', train._id);
    });

    const handleSeatUpdate = (payload) => {
      console.log('🚂 Real-time seat update received:', payload);
      dispatch(updateTrainRealTime(payload));
    };

    socket.on('train:seatUpdate', handleSeatUpdate);

    return () => {
      results.forEach(train => {
        socket.emit('train:unsubscribe', train._id);
      });
      socket.off('train:seatUpdate', handleSeatUpdate);
    };
  }, [socket, results, dispatch]);

  return socket;
};

export default useTrainSocket;
