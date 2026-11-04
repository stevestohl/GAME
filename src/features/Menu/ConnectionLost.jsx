import React, { useEffect, useState } from 'react';

// A quick blip fixes itself: only speak up if it lasts this long
const SHOW_AFTER_MS = 3000;

// 📡 On the TV: says so when the connection to the server drops, because the screen would otherwise
// sit there looking fine while nobody can join. It goes away by itself once the connection is back.
export default function ConnectionLost({ socket }) {
    const [isLost, setIsLost] = useState(false);

    useEffect(() => {
        let timer = null;
        const handleDisconnect = () => {
            clearTimeout(timer);
            timer = setTimeout(() => setIsLost(true), SHOW_AFTER_MS);
        };
        const handleConnect = () => {
            clearTimeout(timer);
            setIsLost(false);
        };
        socket.on('disconnect', handleDisconnect);
        socket.on('connect', handleConnect);
        return () => {
            clearTimeout(timer);
            socket.off('disconnect', handleDisconnect);
            socket.off('connect', handleConnect);
        };
    }, [socket]);

    if (!isLost) return null;
    return (
        <div className="cc-connection-lost" role="alert">
            📡 Connection lost. Trying to reconnect... players can't join until it's back.
        </div>
    );
}
