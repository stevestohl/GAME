import React, { useState, useEffect } from 'react';
import { Container, Card, Badge, Button, Spinner } from 'react-bootstrap';
import { useSearchParams } from 'react-router-dom';
import { io } from 'socket.io-client'; //t

// Connect to your backend server URL
const socket = io('https://game-temple-backend.onrender.com', { autoConnect: false });

export default function TictactoeRoom() {
    const [searchParams] = useSearchParams()

    const roomCode = queryParams.get('room') || 'UNKNOWN';
    const playerRole = queryParams.get('role') || 'host'; 
    const playerName = queryParams.get('name') || 'Anonymous';

    const [roomStatus, setRoomStatus] = useState('loading');
    const [opponentName, setOpponentName] = useState('');
    const [board, setBoard] = useState(Array(9).fill(''));
    const [isNext, setIsNext] = useState(true);

    const playerSymbol = playerRole === 'host' ? 'X' : 'O';

    // Handle Socket Connection and Listeners
    useEffect(() => {
        socket.connect();

        // Join the room
        socket.emit('joinRoom', { roomCode, playerRole, playerName });

        // Handle live room state syncs from the server
        socket.on('roomUpdate', (roomData) => {
            setBoard(roomData.board);
            setIsNext(roomData.isNext);
            setRoomStatus(roomData.status);
            setOpponentName(playerRole === 'host' ? roomData.guestName : roomData.hostName);
        });

        // Error handling if room doesn't exist
        socket.on('roomNotFound', () => {
            setRoomStatus('not-found');
        });

        // Cleanup on unmount
        return () => {
            socket.off('roomUpdate');
            socket.off('roomNotFound');
            socket.disconnect();
        };
    }, [roomCode, playerRole, playerName]);


    // Win conditions calculator
    const calculateWinner = (squares) => {
        const lines = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8],
            [0, 3, 6], [1, 4, 7], [2, 5, 8],
            [0, 4, 8], [2, 4, 6]
        ];
        for (let i = 0; i < lines.length; i++) {
            const [a, b, c] = lines[i];
            if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
                return squares[a];
            }
        }
        return null;
    };

    const winner = calculateWinner(board);
    const isDraw = !winner && board.every(square => square !== '');
    const currentTurnSymbol = isNext ? 'X' : 'O';
    const isMyTurn = currentTurnSymbol === playerSymbol;

    const handleSquareClick = (index) => {
        if (board[index] || winner || isDraw || !isMyTurn) return;

        const newBoard = [...board];
        newBoard[index] = playerSymbol;

        socket.emit('makeMove', {
            roomCode,
            board: newBoard,
            isNext: !isNext
        });
    };

    const handleReset = () => {
        // Emit reset request to server
        socket.emit('resetMatch', { roomCode }); // 
    };

    // UI State A: Loading Screen
    if (roomStatus === 'loading') {
        return (
            <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: "80vh" }}>
                <Spinner animation="border" variant="primary" />
            </Container>
        );
    }

    // UI State B: Invalid Room Screen
    if (roomStatus === 'not-found') { // 
        return (
            <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: "80vh" }}>
                <Card className="shadow-sm p-5 text-center" style={{ width: "100%", maxWidth: "450px" }}>
                    <h3 className="fw-bold text-danger mb-3">Room Not Found</h3>
                    <p className="text-muted mb-4">The room code <strong>{roomCode}</strong> does not exist. Double check the code and try again.</p>
                    <Button variant="primary" href="/tictactoe/lobby">Back to Lobby</Button>
                </Card>
            </Container>
        );
    }

    // UI State C: Waiting Room UI
    if (roomStatus === 'waiting') {
        return (
            <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: "80vh" }}>
                <Card className="shadow-sm p-5 text-center" style={{ width: "100%", maxWidth: "450px" }}>
                    <h3 className="fw-bold mb-4">Room Created!</h3>
                    <h1 className="display-4 fw-bold text-primary mb-4">{roomCode}</h1>
                    <p className="text-muted mb-4">
                        Share this code with your opponent. The game will automatically start when they join.
                    </p>
                    <div className="d-flex justify-content-center align-items-center gap-2">
                        <Spinner animation="border" variant="primary" size="sm" />
                        <span className="fw-bold">Waiting for opponent...</span>
                    </div>
                </Card>
            </Container>
        );
    }

    // UI State D: Active Game Board UI
    return (
        <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: "80vh" }}>
            <Card className="shadow-sm p-4 text-center" style={{ width: "100%", maxWidth: "450px" }}>
                <Card.Header className="bg-transparent border-0 mb-3">
                    <h3 className="fw-bold text-primary mb-1">Room: {roomCode}</h3>
                    <div className="d-flex justify-content-center gap-2 mb-2">
                        <Badge bg="secondary">Name: {playerName}</Badge>
                        <Badge bg={playerRole === 'host' ? 'info' : 'warning'} className="text-dark">
                            Role: {playerRole.toUpperCase()} ({playerSymbol})
                        </Badge>
                        {opponentName && <Badge bg="success">vs {opponentName}</Badge>}
                    </div>
                    <hr />
                    <h5 className="fw-bold my-3">
                        {winner && <span className="text-success">🎉 Winner: {winner}!</span>}
                        {isDraw && <span className="text-muted">🤝 It's a Draw!</span>}
                        {!winner && !isDraw && (
                            isMyTurn ? 
                            <span className="text-danger">🔥 Your Turn ({playerSymbol})</span> : 
                            <span className="text-muted">⏳ Waiting for opponent...</span>
                        )}
                    </h5>
                </Card.Header>

                <div className="mx-auto mb-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 100px)', gap: '10px' }}>
                    {board.map((square, index) => (
                        <Button
                            key={index}
                            variant="light"
                            className="border d-flex align-items-center justify-content-center fw-bold fs-1"
                            style={{ 
                                width: '100px', 
                                height: '100px', 
                                cursor: (board[index] || winner || !isMyTurn) ? 'not-allowed' : 'pointer',
                                color: square === 'X' ? '#0d6efd' : '#dc3545',
                                backgroundColor: square ? '#f8f9fa' : '#ffffff'
                            }}
                            onClick={() => handleSquareClick(index)}
                        >
                            {square}
                        </Button>
                    ))}
                </div>

                <div className="d-flex justify-content-between align-items-center mt-2">
                    <Button variant="outline-secondary" size="sm" href="/tictactoe/lobby">
                        Leave Room
                    </Button>
                    {(winner || isDraw) && (
                        <Button variant="success" size="sm" onClick={handleReset}>
                            Reset Match
                        </Button>
                    )}
                </div>
            </Card>
        </Container>
    );
}