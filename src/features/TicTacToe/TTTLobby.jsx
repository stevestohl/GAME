import React from 'react';
import { tictactoeSocket as socket } from '../../socket.js';
import TempleWaitingRoom from '../Menu/TempleWaitingRoom.jsx';

// The match starts by itself as soon as the second player joins
export default function TicTacToeLobby({ roomCode, playerName }) {
    return (
        <TempleWaitingRoom
            game="tictactoe"
            title="Tic-Tac-Toe"
            roomCode={roomCode}
            players={[{ id: socket.id, name: playerName || 'Host' }]}
            meId={socket.id}
            status="Waiting for your opponent to join..."
        />
    );
}
