import React from 'react';
import { prompt2Socket as socket } from '../../socket.js';
import TempleWaitingRoom from '../Menu/TempleWaitingRoom.jsx';

export default function Prompt2Lobby({ roomCode, players = [], isHost }) {
    const leader = players.find((p) => p.isPlayerHost);
    return (
        <TempleWaitingRoom
            game="prompt2"
            title="Prompt 2"
            roomCode={roomCode}
            players={players}
            meId={socket.id}
            leaderId={leader?.id}
            onStart={isHost ? () => socket.emit('showRules', { roomCode }) : undefined}
            canStart={players.length >= 2}
            startDisabledLabel="Waiting for players..."
            status={isHost ? null : `Waiting for ${leader?.name || 'the host'} to start the game...`}
        />
    );
}
