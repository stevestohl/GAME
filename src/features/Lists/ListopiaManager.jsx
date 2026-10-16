import React from 'react';
import { useSearchParams } from 'react-router-dom';
import useWakeLock from '../../hooks/useWakeLock.js';
import ListPlayer from './ListPlayer.jsx';

/**
 * 📱📝 Listopia: List Cast without the TV. Every player, including whoever made the room,
 * plays on their own phone, and the phones show everyone's lists.
 */
export default function ListopiaManager() {
    useWakeLock();
    const [searchParams] = useSearchParams();
    const roomCode = (searchParams.get('room') || '').toUpperCase();
    const playerName = searchParams.get('name') || 'Anonymous';

    return (
        <>
            <ListPlayer roomCode={roomCode} playerName={playerName} mode="phones" />
            {roomCode && (
                <div className="cc-room-code">
                    Room <strong>{roomCode}</strong>
                </div>
            )}
        </>
    );
}
