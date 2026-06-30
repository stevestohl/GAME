import React, { useState, useEffect } from 'react';
import socket from '../socket'; // Path to your working socket instance
import LobbyScreen from './LobbyScreen';
import RulesScreen from './RulesScreen';
import QuestionScreen from './QuestionScreen';
import ScoreboardScreen from './ScoreboardScreen';
import FinalResultsScreen from './FinalResultsScreen';

export default function TriviaRoom({ roomCode, playerName }) {
  const [room, setRoom] = useState(null);
  const isHost = room?.players[0]?.id === socket.id; // Usually the first player who joined

  useEffect(() => {
    // 1. Listen for the core gameplay sync event
    socket.on('roomStateUpdated', (updatedRoom) => {
      setRoom(updatedRoom);
    });

    // Clean up listener on unmount
    return () => {
      socket.off('roomStateUpdated');
    };
  }, []);

  if (!room) {
    return <div className="text-white text-center mt-10">Loading game room...</div>;
  }

  // 2. Dynamically render screen depending on server-side room.phase
  switch (room.phase) {
    case 'LOBBY':
      // Fallback to your existing lobby view if phase isn't active gameplay yet
      return <LobbyScreen room={room} isHost={isHost} roomCode={roomCode} />;

    case 'RULES':
      return <RulesScreen room={room} isHost={isHost} roomCode={roomCode} />;

    case 'QUESTION':
      return (
        <QuestionScreen 
          roomCode={roomCode}
          currentQuestion={room.questions[room.currentRound]} 
          playerAnswers={room.playerAnswers}
        />
      );

    case 'SCOREBOARD':
      return <ScoreboardScreen room={room} isHost={isHost} roomCode={roomCode} />;

    case 'FINAL_RESULTS':
      return <FinalResultsScreen room={room} isHost={isHost} />;

    default:
      // If the game hasn't officially started (no phase set yet), show your regular Lobby
      return <LobbyScreen room={room} isHost={isHost} roomCode={roomCode} />;
  }
}