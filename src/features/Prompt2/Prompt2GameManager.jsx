import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { prompt2Socket as socket } from '../../socket.js'; 

import Prompt2Lobby from './Prompt2Lobby';
import Prompt2RulesScreen from './Prompt2RulesScreen';
import Prompt2PromptSelection from './Prompt2PromptSelection';
import Prompt2CardSelectionScreen from './Prompt2CardSelectionScreen'; // FIXED
import Prompt2JudgingScreen from './Prompt2JudgingScreen';
import Prompt2Scoreboard from './Prompt2Scoreboard';

export default function Prompt2GameManager() {
    const [searchParams] = useSearchParams();
    const [name] = useState(searchParams.get('name') || '');
    const [roomCode, setRoomCode] = useState(searchParams.get('room') || '');
    const [roomData, setRoomData] = useState(null);
    const [gameState, setGameState] = useState('setup'); // setup, lobby, rules, prompt_selection, writing, judging, scoreboard
    
    // Game-specific payloads received from backend events
    const [promptOptions, setPromptOptions] = useState([]);
    const [currentPrompt, setCurrentPrompt] = useState(null);
    const [submissions, setSubmissions] = useState([]);
    const [roundResults, setRoundResults] = useState(null);

    useEffect(() => {
        // Manually open the namespace connection because autoConnect is false
        socket.connect();

        // If we loaded into the page with a room and name, register this socket instantly
        if (roomCode && name) {
            socket.emit('join_room', { roomCode, name });
        }

        // Core room syncing (Handles state routing dynamically)
        socket.on('room_updated', (data) => {
            setRoomData(data);

            if (data.roomCode) {
                setRoomCode(data.roomCode);
            }
            
            // Synchronizes UI view with whatever phase the backend dictates
            if (data.gameState) {
                setGameState(data.gameState);
            }
        });

        // Step 1: Host chooses a prompt
        socket.on('prompt_options', (data) => {
            setPromptOptions(data.prompts);
            setGameState('prompt_selection');
        });

        // Step 2: Everyone writes/chooses an answer
        socket.on('writing_phase_started', (data) => {
            setCurrentPrompt(data.prompt);
            setGameState('writing');
        });

        // Step 3: Host judges anonymous submissions
        socket.on('start_judging', (data) => {
            setSubmissions(data.submissions);
            setGameState('judging');
        });

        // Step 4: Show scoreboard and round winner
        socket.on('round_ended', (data) => {
            setRoundResults(data);
            setGameState('scoreboard');
        });

        // Cleanup tracking listeners and kill the connection instance on component unmount
        return () => {
            socket.off('room_updated');
            socket.off('prompt_options');
            socket.off('writing_phase_started');
            socket.off('start_judging');
            socket.off('round_ended');
            
            socket.disconnect(); 
        };
    }, [roomCode, name]); 

    // Helper to determine if this client window is the current room judge/host
    const isHost = roomData?.hostId === socket.id;

    // Direct conditional screen rendering based on engine gameState state
    switch (gameState) {
        case 'setup':
        case 'lobby':
            return (
                <Prompt2Lobby 
                    name={name} 
                    roomCode={roomCode} 
                    setRoomCode={setRoomCode} 
                    roomData={roomData} 
                    isHost={isHost} 
                />
            );
        case 'rules':
            return <Prompt2RulesScreen roomCode={roomCode} isHost={isHost} />;
        case 'prompt_selection':
            return <Prompt2PromptSelection roomCode={roomCode} isHost={isHost} options={promptOptions} />;
        case 'writing':
            // FIXED: Component now correctly matches the imported layout name
            return <Prompt2CardSelectionScreen roomCode={roomCode} isHost={isHost} prompt={currentPrompt} />;
        case 'judging':
            return <Prompt2JudgingScreen roomCode={roomCode} isHost={isHost} submissions={submissions} />;
        case 'scoreboard':
            return <Prompt2Scoreboard roomCode={roomCode} isHost={isHost} results={roundResults} />;
        default:
            return <div>Loading Game Phase...</div>;
    }
}