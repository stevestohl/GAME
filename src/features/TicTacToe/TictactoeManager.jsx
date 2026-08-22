import React, { useState, useEffect } from 'react';
import { Container, Spinner, Alert, Card, Button } from 'react-bootstrap';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { tictactoeSocket as socket } from '../../socket.js';

import TTTLobby from './TTTLobby.jsx';
import TictactoeGameScreen from './TictactoeGameScreen.jsx';

export default function TictactoeManager() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const roomCode = searchParams.get('room');
    const playerName = searchParams.get('name') || 'Anonymous';
    const playerRole = searchParams.get('role') || 'guest'; // 👈 Extracted playerRole

    const [roomStatus, setRoomStatus] = useState('loading');
    const [roomData, setRoomData] = useState(null);
    const [errorMessage, setErrorMessage] = useState('');

    // 🚪 State to track when an opponent leaves or disconnects
    const [opponentLeftMessage, setOpponentLeftMessage] = useState('');

    useEffect(() => {
        if (!roomCode) {
            setErrorMessage('No room code provided!');
            setRoomStatus('error');
            return;
        }

        const emitJoin = () => {
            console.log("Manager emitting joinRoom:", { roomCode, playerName, playerRole });
            socket.emit('joinRoom', { roomCode, playerName, playerRole });
        };

        if (!socket.connected) {
            socket.connect();
        }

        socket.on('connect', emitJoin);
        if (socket.connected) {
            emitJoin();
        }

        // Server-authoritative room state synchronization
        socket.on('roomUpdate', (data) => {
            if (data) {
                console.log("Room updated state:", data);
                setRoomData(data);
                setRoomStatus(data.status);
            }
        });


        socket.on('playerLeft', (data) => {
            const leaverName = data?.playerName || 'Your opponent';
            // Redirect to Home with Toast payload in history state
            navigate('/', { 
                state: { toastMessage: `${leaverName} has left the room.` } 
            });
        });

        socket.on('roomNotFound', () => {
            setErrorMessage('Room not found or expired.');
            setRoomStatus('error');
        });

        socket.on('errorMsg', (msg) => {
            setErrorMessage(msg);
            setTimeout(() => setErrorMessage(''), 5000);
        });

        return () => {
            socket.off('connect', emitJoin);
            socket.off('roomUpdate');
            socket.off('playerLeft');
            socket.off('roomNotFound');
            socket.off('errorMsg');
        };
    }, [roomCode, playerName, playerRole]);
    
    // 🚪 Opponent Left Screen
    if (roomStatus === 'ended') {
        return (
            <div className="page-container">
                <Card className="main-card">
                    <Card.Header className="main-card-header">
                        Game Over
                    </Card.Header>
                    <Card.Body className="p-4 text-center">
                        <div className="fs-1 mb-2">🚪</div>
                        <h5 className="fw-bold text-dark mb-2">Match Ended</h5>
                        <p className="text-muted small mb-4">
                            {opponentLeftMessage}
                        </p>
                        <Button 
                            variant="primary" 
                            size="lg"
                            className="w-100 fw-bold shadow-sm"
                            onClick={() => navigate('/')}
                        >
                            Return to Home
                        </Button>
                    </Card.Body>
                </Card>
            </div>
        );
    }

    if (roomStatus === 'loading') {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "80vh" }}>
                <Spinner animation="border" variant="primary" />
            </div>
        );
    }

    if (roomStatus === 'error') {
        return (
            <Container className="mt-5 text-center" style={{ maxWidth: '400px' }}>
                <Alert variant="danger">{errorMessage || 'An error occurred.'}</Alert>
                <button className="btn btn-primary" onClick={() => navigate('/join')}>
                    Back to Join
                </button>
            </Container>
        );
    }

    // Determine roles dynamically using socket ID vs server-stored IDs
    const isHost = roomData?.hostSocketId === socket.id || playerRole === 'host';
    const currentOpponentName = isHost ? (roomData?.guestName || 'Waiting...') : (roomData?.hostName || 'Host');

    return (
        <>
            {errorMessage && (
                <Alert variant="danger" className="text-center m-2 position-absolute w-100" style={{ zIndex: 999 }}>
                    {errorMessage}
                </Alert>
            )}

            {roomStatus === 'waiting' ? (
                <TTTLobby 
                    roomCode={roomCode} 
                    playerName={playerName} 
                />
            ) : (
                <TictactoeGameScreen 
                    roomCode={roomCode}
                    roomData={roomData}
                    playerRole={playerRole}
                    playerName={playerName}
                    opponentName={currentOpponentName}
                />
            )}
        </>
    );
}