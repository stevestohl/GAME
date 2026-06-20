import React, { useState } from 'react';
import TttLobby from './TttLobby.jsx';
import TttBoard from './TttBoard.jsx';

export default function TicTacToe() {
    const params = new URLSearchParams(window.location.search);
    const roomFromUrl = params.get('room');
    const roleFromUrl = params.get('role') || 'guest';

    // If there is no room code in the URL, show the manual lobby. 
    // If there IS a room code, skip straight to the Board!
    if (!roomFromUrl) {
        return <TttLobby />;
    }

    return <TttBoard roomCode={roomFromUrl} isHost={roleFromUrl === 'host'} />;
}