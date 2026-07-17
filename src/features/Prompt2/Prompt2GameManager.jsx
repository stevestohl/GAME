import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { prompt2Socket as socket } from '../../socket.js'; 
import Prompt2Lobby from './Prompt2Lobby';
import Prompt2RulesScreen from './Prompt2RulesScreen.jsx';
import Prompt2PromptSelection from './Prompt2PromptSelectionScreen.jsx';
import Prompt2ResponseSelectionScreen from './Prompt2ResponseSelectionScreen'; 
import Prompt2JudgingScreen from './Prompt2JudgingScreen.jsx';
import Prompt2Scoreboard from './Prompt2Scoreboard.jsx';
import RoundWinnerScreen from './Prompt2RoundWinner.jsx';

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
        // Get or generate Persistnt player ID
        let playerId = localStorage.getItem('prompt2_player_id');
        if (!playerId) {
            playerId = crypto.randomUUID();
            localStorage.setItem('prompt2_player_id', playerId);
        }

        // Define Connect Handler
        const onConnect = () => {
            console.log("Connected! Registering with playerId:", playerId);
            if (roomCode && name) {
                // Pass the persistent ID to the backend
                socket.emit('joinRoom', { roomCode, playerName: name, playerId });
            }
        };
        // Setup Listeners
        socket.on('connect', onConnect);
        socket.connect();

        if (roomCode && name) {
            socket.emit('joinRoom', { roomCode, playerName: name });
        }

        // Centralized room listener (Handles state transitions globally)
socket.on('room_updated', (data) => {
            console.log("SERVER UPDATED ROOM STATE TO:", data.gameState);
            setRoomData(data);
            if (data.roomCode) setRoomCode(data.roomCode);
            if (data.gameState) setGameState(data.gameState);
            if (data.currentPrompt) {
                setCurrentPrompt(data.currentPrompt);
            }
        });

        // Specific phase listeners
        socket.on('prompt_options', (data) => {
            setPromptOptions(data.prompts);
            setGameState('prompt_selection');
        });

        socket.on('writing_phase_started', (data) => {
            setCurrentPrompt(data.prompt);
            setGameState('writing');
        });

        socket.on('start_judging', (data) => {
            setSubmissions(data.submissions);
            setGameState('judging');
        });

        socket.on('round_ended', (data) => {
            setRoundResults(data);
            if(data.isGameOver) {
                setGameState('scoreboard')
            } else {
                setGameState('winner_reveal')
            }
        });


        socket.on('sync_game_state'), (data) => {
            console.log("Full state recover: ", data)

            // udpate all necessary state variables at once
            setRoomData(data.roomData)
            setGameState(data.gameState)

            // Check if these fields exists in sync played
            if(data.submissions) setSubmissions(data.submissions)
            if(data.currentPrompt) setCurrentPrompt(data.currentPrompt)
            if(data.promptOptions) setPromptOptions(data.promptOptions)
            if (data.roundResults) setRoundResults(data.roundResults);
        
            }
        return () => {
            socket.off('connect', onConnect);
            socket.off('room_updated');
            socket.off('sync_game_state')
            socket.off('prompt_options');
            socket.off('writing_phase_started');
            socket.off('start_judging');
            socket.off('round_ended');
        };
    }, [roomCode, name]); 

    // Host Identification
    const isHost = roomData?.hostId === socket.id || roomData?.players?.[socket.id]?.isPlayerHost === true;
    const playersArray = roomData?.players ? Object.values(roomData.players) : [];

    // =========================================================================
    // SOCKET EVENT HANDLERS
    // These trigger the backend updates. The backend will then 
    // broadcast 'room_updated' which automatically refreshes the UI.
    // =========================================================================
    
    const handleSelectPrompt = (selectedPrompt) => {
        socket.emit('select_prompt', { roomCode, selectedPrompt: selectedPrompt });
    };

    const handleSubmitResponse = (responseChoice) => {
        socket.emit('submit_answer', { roomCode, answer: responseChoice });
    };

    const handleRevealChoices = () => {
        socket.emit('reveal_choices', { roomCode });
    };


    const handleNextRound = () => {
        socket.emit('nextRound', { roomCode });
    };

    const handlePickWinner = (winningPlayerId) => {
    socket.emit('pick_winner', { roomCode, winningPlayerId });
};


    // Rendering Logic
    switch (gameState) {
        case 'setup':
        case 'lobby':
            return <Prompt2Lobby roomCode={roomCode} players={playersArray} isHost={isHost} />;
            
        case 'rules':
            return <Prompt2RulesScreen roomCode={roomCode} isHost={isHost} />;
        
        case 'prompt_selection':
            return (
                <Prompt2PromptSelection 
                    isHost={isHost} 
                    onSelectPrompt={handleSelectPrompt} 
                />
            );
            
        case 'writing':
            const activePlayers = playersArray.filter(p => !p.isPlayerHost);
            const totalPlayersCount = activePlayers.length || 1;
            const submittedCount = activePlayers.filter(p => p.hasSubmitted).length;

            return (
                <Prompt2ResponseSelectionScreen 
                    isHost={isHost} 
                    // Extract the text safely if it exists, otherwise pass the raw string
                    promptText={currentPrompt?.text || currentPrompt || "Loading prompt..."} 
                    submittedCount={submittedCount}
                    totalPlayers={totalPlayersCount}
                    onSubmitResponse={handleSubmitResponse}
                    onRevealChoices={handleRevealChoices}
                />
            );
            
        case 'judging':
            return ( 
                <Prompt2JudgingScreen 
                    roomCode={roomCode} 
                    isHost={isHost} 
                    submissions={submissions}
                    onPickWinner={handlePickWinner}
                    />
            )
        case 'winner_reveal':
            return (
                <RoundWinnerScreen
                roomCode={roomCode}
                isHost={isHost}
                results={roundResults}
                onNextRound={handleNextRound}
                nextHostName={roundResults?.nextHostName || "UNKNOWN"}
                />
            )
        case 'scoreboard':
            return (
                <Prompt2Scoreboard 
                    roomCode={roomCode} 
                    isHost={isHost} 
                    players={playersArray}
                />
            )
        default:
            return <div className="text-center mt-5 text-white">Loading Game Phase ({gameState})...</div>;
    }
}