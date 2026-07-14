import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { prompt2Socket as socket } from '../../socket.js'; 
import Prompt2Lobby from './Prompt2Lobby';
import Prompt2RulesScreen from './Prompt2RulesScreen.jsx';
import Prompt2PromptSelection from './Prompt2PromptSelectionScreen.jsx';
import Prompt2ResponseSelectionScreen from './Prompt2ResponseSelectionScreen'; 
import Prompt2JudgingScreen from './Prompt2JudgingScreen.jsx';
import Prompt2Scoreboard from './Prompt2Scoreboard.jsx';

export default function Prompt2GameManager() {
    const [searchParams] = useSearchParams();
    const name = searchParams.get('name') || 'Anonymous';
    const [roomCode, setRoomCode] = useState(searchParams.get('room') || '');
    const [roomData, setRoomData] = useState(null);
    const [gameState, setGameState] = useState('setup'); 

    // Game-specific payloads received from backend events
    const [promptOptions, setPromptOptions] = useState([]);
    const [currentPrompt, setCurrentPrompt] = useState(null);
    const [submissions, setSubmissions] = useState([]);
    const [roundResults, setRoundResults] = useState(null);

    useEffect(() => {
        console.log("[GameManager] Mounting and establishing socket connection...");
        socket.connect();

        // Join room cleanly on mount using synchronized backend keys
        if (roomCode && name) {
            console.log(`[GameManager] Emitting joinRoom for room: ${roomCode}, player: ${name}`);
            socket.emit('joinRoom', { roomCode, playerName: name });
        }

        // Centralized room listener (Handles state transitions globally)
        socket.on('room_updated', (data) => {
            console.log("[GameManager] room_updated state received:", data); 
            setRoomData(data);
            if (data.roomCode) {
                setRoomCode(data.roomCode);
            }
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

        // Cleanup tracking listeners on component unmount
        return () => {
            console.log("[GameManager] Cleaning up socket listeners...");
            socket.off('room_updated');
            socket.off('prompt_options');
            socket.off('writing_phase_started');
            socket.off('start_judging');
            socket.off('round_ended');
        };

    }, [roomCode, name]); 

    // Strictly verify host identity using the socket context data structures
    const isHost = roomData?.hostId === socket.id || roomData?.players[socket.id]?.isPlayerHost === true;
    
    // Extract array format out of raw room object data safely for map components
    const playersArray = roomData && roomData.players ? Object.values(roomData.players) : [];

    // =========================================================================
    // NEW SOCKET HANDLERS 
    // (Note: Make sure these event names match what your Node.js backend expects!)
    // =========================================================================
    
    // Handler for when the Host clicks on a prompt
    const handleSelectPrompt = (selectedPrompt) => {
        console.log(`[GameManager] Host selected prompt: "${selectedPrompt}". Emitting 'select_prompt'...`);
        socket.emit('selectPrompt', { roomCode, prompt: selectedPrompt });
    };

    // Handler for when a Player submits their response text
    const handleSubmitResponse = (responseChoice) => {
        console.log(`[GameManager] Player submitting response: "${responseChoice}". Emitting 'submit_response'...`);
        socket.emit('submitResponse', { roomCode, response: responseChoice });
    };

    // Handler for when the Host decides to reveal the choices to the lobby
    const handleRevealChoices = () => {
        console.log("[GameManager] Host revealing choices. Emitting 'reveal_choices'...");
        socket.emit('revealChoices', { roomCode });
    };

    // =========================================================================

    // Direct conditional screen rendering based on engine gameState state
    switch (gameState) {
        case 'setup':
        case 'lobby':
            return (
                <Prompt2Lobby 
                    roomCode={roomCode} 
                    players={playersArray} 
                    isHost={isHost} 
                />
            );
        case 'rules':
            return <Prompt2RulesScreen roomCode={roomCode} isHost={isHost} />;
        
        case 'prompt_selection':
            return (
                <Prompt2PromptSelection 
                    roomCode={roomCode} 
                    isHost={isHost} 
                    options={promptOptions} 
                    onSelectPrompt={handleSelectPrompt} // Pass the missing prop handler!
                />
            );
            
        case 'writing':
            // Count players who aren't the host
            const activePlayers = playersArray.filter(p => !p.isPlayerHost);
            const totalPlayersCount = activePlayers.length || 1; // Fallback to 1 to avoid NaN divides
            
            // Count how many players have "hasSubmitted" flag set to true in the sync data
            const submittedCount = activePlayers.filter(p => p.hasSubmitted).length;

            return (
                <Prompt2ResponseSelectionScreen 
                    isHost={isHost} 
                    promptText={currentPrompt} 
                    submittedCount={submittedCount}
                    totalPlayers={totalPlayersCount}
                    onSubmitResponse={handleSubmitResponse} // Pass the submit handler!
                    onRevealChoices={handleRevealChoices}     // Pass the reveal handler!
                />
            );
            
        case 'judging':
            return <Prompt2JudgingScreen roomCode={roomCode} isHost={isHost} submissions={submissions} />;
        case 'scoreboard':
            return <Prompt2Scoreboard roomCode={roomCode} isHost={isHost} results={roundResults} />;
        default:
            return <div className="text-center mt-5 text-white">Loading Game Phase ({gameState})...</div>;
    }
}