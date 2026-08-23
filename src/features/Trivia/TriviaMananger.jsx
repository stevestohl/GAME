import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Container, Spinner, Alert } from 'react-bootstrap';
import { triviaSocket as socket } from '../../socket.js';

import TriviaWaitingRoom from './TriviaWaitingRoom.jsx';
import RulesScreen from './RulesScreen.jsx';
import QuestionScreen from './QuestionScreen.jsx';
import ScoreboardScreen from './ScoreboardScreen.jsx';
import GameOverScreen from './TriviaGameOver.jsx';

export default function TriviaManager() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const roomCode = searchParams.get('room');
    const playerName = searchParams.get('name') || 'Anonymous';
    const role = searchParams.get('role') || 'guest';

    const [players, setPlayers] = useState([]);
    const [roomState, setRoomState] = useState(null);
    const [errorMessage, setErrorMessage] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!roomCode) {
            setErrorMessage('No room code provided!');
            setIsLoading(false);
            return;
        }
        // Gets or generates session token to idnetify players by token instead of socket id
        let sessionToken = localStorage.getItem('templeSessionToken');
        if (!sessionToken) {
            sessionToken = crypto.randomUUID(); 
            localStorage.setItem('templeSessionToken', sessionToken);
        }
        if (!socket.connected) {
            socket.connect();
        }

        socket.off('roomUpdated');
        socket.off('roomStateUpdated');
        socket.off('errorMsg');

        socket.emit('joinRoom', { roomCode, playerName, sessionToken });

        socket.on('roomUpdated', (data) => {
            setPlayers(data.players || []);
            setIsLoading(false);
        });

        socket.on('roomStateUpdated', (updateRoom) => {
            setRoomState(updateRoom);
            setIsLoading(false);
        });

        socket.on('errorMsg', (msg) => {
            setErrorMessage(msg);
            setIsLoading(false);
        });
        socket.on('nameTaken', ({ roomCode, message }) => {
            navigate(`/join?room=${roomCode}`, { 
            state: { toastMessage: message } 
        });
    });
        return () => {
            socket.off('roomUpdated');
            socket.off('roomStateUpdated');
            socket.off('errorMsg');
            socket.off('nameTaken');
        };
    }, [roomCode, playerName]);

    if (isLoading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "80vh" }}>
                <Spinner animation="border" variant="primary" />
            </div>
        );
    }

    if (errorMessage) {
        return (
            <Container className="mt-5 text-center" style={{ maxWidth: '400px' }}>
                <Alert variant="danger">{errorMessage}</Alert>
                <button className="btn btn-primary" onClick={() => navigate('/join')}>
                    Back to Join
                </button>
            </Container>
        );
    }

    // Phase Controller
    if (roomState) {
        switch (roomState.phase) {
            case 'RULES':
                return <RulesScreen roomCode={roomCode} isHost={role === 'host'} />;
            case 'QUESTION':
                return (
                    <QuestionScreen 
                        roomCode={roomCode}
                        currentQuestion={roomState.questions[roomState.currentRound]}
                        playerAnswers={roomState.playerAnswers}
                    />
                );
            case 'SCOREBOARD':
                return (
                    <ScoreboardScreen 
                        roomCode={roomCode}
                        players={roomState.players}
                        isHost={role === 'host'}
                    />
                );
            case 'GAMEOVER':
                return (
                    <GameOverScreen 
                        players={roomState.players} 
                        roomCode={roomCode} 
                        isHost={role === 'host'} 
                    />
                );
            default:
                break;
        }
    }

    // Default Lobby View
    return (
        <TriviaWaitingRoom 
            roomCode={roomCode}
            role={role}
            players={players}
            socketId={socket.id}
        />
    );
}