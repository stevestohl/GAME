import React from 'react';
import { triviaSocket as socket } from '../../socket.js';
import TempleWaitingRoom from '../Menu/TempleWaitingRoom.jsx';

export default function TriviaWaitingRoom({ roomCode, role, players = [], socketId }) {
    const isHost = role === 'host';
    return (
        <TempleWaitingRoom
            game="trivia"
            title="Trivia"
            roomCode={roomCode}
            players={players}
            meId={socketId}
            leaderId={players[0]?.id}
            onStart={isHost ? () => socket.emit('startGame', { roomCode }) : undefined}
            status={isHost ? null : 'Waiting for the host to start the game...'}
        />
    );
}
