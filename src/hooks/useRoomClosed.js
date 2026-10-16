import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// 🧹 When the server closes this device's room (finished, empty or idle for too long),
// head back to the menu and say why, instead of sitting on a screen that never updates.
export default function useRoomClosed(socket) {
    const navigate = useNavigate();

    useEffect(() => {
        const handleRoomClosed = ({ message } = {}) => {
            navigate('/home', { state: { toastMessage: message || 'That game has ended.' } });
        };
        socket.on('room_closed', handleRoomClosed);
        return () => socket.off('room_closed', handleRoomClosed);
    }, [socket, navigate]);
}
