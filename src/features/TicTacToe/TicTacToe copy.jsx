import React, { useState, useEffect } from 'react';
import { Container, Card, Badge, Button, Spinner } from 'react-bootstrap';
import { useSearchParams } from 'react-router-dom';
import { io } from 'socket.io-client';
import HourGlassBlue from '../../assets/logos/HourGlassBlue.png'; 
import TicTacToeLogo from '../../assets/logos/Tic-Tac-Toe.png'; 
import TttBoard from './TttBoard.jsx'


const BACKEND_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:5000/tictactoe' 
    : 'https://game-temple-backend.onrender.com/tictactoe';

const socket = io(BACKEND_URL, { 
    autoConnect: false,
    transports: ['websocket', 'polling']
});

export default function TictactoeRoom() {
    const [searchParams] = useSearchParams();
    const roomCode = searchParams.get('room') || 'UNKNOWN';
    const playerRole = searchParams.get('role') || 'guest'; 
    const playerName = searchParams.get('name') || 'Anonymous';

    const [roomStatus, setRoomStatus] = useState('loading');
    const [opponentName, setOpponentName] = useState('');
    const [board, setBoard] = useState(Array(9).fill(''));
    const [isNext, setIsNext] = useState(true);

    const playerSymbol = playerRole === 'host' ? 'X' : 'O';

useEffect(() => {
 // Define the connection handler
    const onConnect = () => {
        console.log("Socket connected, joining room...");
        socket.emit('joinRoom', { roomCode, playerRole, playerName });
    };

    // Listen for the connection event
    socket.on('connect', onConnect);
    
    // 3. Manually connect
    socket.connect();

    // 4. Existing listeners
    socket.on('roomUpdate', (roomData) => {
        console.log("UI RECEIVED UPDATE:", roomData);
        setBoard(roomData.board);
        setIsNext(roomData.isNext);
        setRoomStatus(roomData.status);
        setOpponentName(playerRole === 'host' ? roomData.guestName : roomData.hostName);
    });

    socket.on('roomNotFound', () => setRoomStatus('not-found'));

    return () => {
        socket.off('connect', onConnect);
        socket.off('roomUpdate');
        socket.off('roomNotFound');
        //socket.disconnect();
    };
}, [roomCode, playerRole, playerName]);

    // ... (keep your calculateWinner, handleSquareClick, handleReset functions same as before)
    if (roomStatus === 'loading') {
        return (
            <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: "80vh" }}>
                <Spinner animation="border" variant="primary" />
                <span className="ms-3">Connecting to room...</span>
            </Container>
        );
    }
    // When creating and connecting to the game room
    if (roomStatus === 'waiting') {
        return (
            <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: "80vh" }}>
                <Card className="shadow-sm p-4 text-center" style={{ width: "100%", maxWidth: "450px" }}>
                    <h3 className="fw-bold mb-2 text-primary">Tic-Tac-Toe</h3>
                        <img
                            src={TicTacToeLogo}
                            className="shadow-lg p-4 text-center"
                            //style={{ maxHeight: '300px', width: 'auto' }} // Corrected
                            style={{ 
                                maxHeight: '200px', 
                                maxWidth: '100%', // Prevents overflow on small screens
                                width: 'auto',
                                display: 'block',
                                margin: '0 auto' 
                            }}
                        />
                    <h1 className="display-4 fw-bold text-primary mb-2">{roomCode}</h1>
                    <p className="text-muted">Waiting for opponent...</p>

                </Card>
            </Container>
        );
    // When Playing
    if (roomStatus === 'playing') {
    return (
        <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: "80vh" }}>
            <Card className="shadow-lg p-3" style={{ width: "100%", maxWidth: "400px" }}>
                <TttBoard 
                    board={board} 
                    isNext={isNext} 
                    roomCode={roomCode}
                    socket={socket} // Pass the socket so TttBoard can emit moves!
                />
            </Card>
        </Container>
    );
}
    }
}