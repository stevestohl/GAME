import React, { useState, useEffect } from 'react';
import { Container, Card, Badge, Button, Spinner } from 'react-bootstrap';

import { ref, set, onValue, off, update } from 'firebase/database'; 
import { db } from './firebaseConfig.js';

console.log("What is DB?", db); // <--- Add this temporary log

export default function TictactoeRoom() {
    // Extract URL Parameters
    const queryParams = new URLSearchParams(window.location.search);
    const roomCode = queryParams.get('room') || 'UNKNOWN';
    const playerRole = queryParams.get('role') || 'host'; 
    const playerName = queryParams.get('name') || 'Anonymous';

    // Game state variables
    const [roomStatus, setRoomStatus] =useState('waiting')
    const [opponentName, setOpponentName] = useState('')

    // board and gameplay state
    const [board, setBoard] = useState(Array(9).fill(null));
    const [isNext, setIsNext] = useState(true)

    const playerSymbol = playerRole === 'host' ? 'X' : 'O';

    // 2. Listen to Firebase for live room updates
    useEffect(() => {
        // Create a reference pointing to this specific room's data in the cloud
        const roomRef = ref(db, `rooms/${roomCode}`);

        // Listen for changes from any player
        onValue(roomRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                // Whenever Firebase changes, update our local React states instantly
                setBoard(data.board || Array(9).fill(null));
                setIsXNext(data.isXNext !== undefined ? data.isXNext : true);

                // sync new lobby variables
                setRoomStatus(data.status || 'waiting')
                setOpponentName(playerRole ==='host' ? data.guestName: data.hostName)
            }
        });

        // Cleanup listener when the user unmounts or leaves the room
        return () => off(roomRef);
    }, [roomCode, playerRole]);

    useEffect(()=> {
        if(playerRole ==='guest' && roomStatus === 'waiting') {
            update(ref(db, `room/${roomCode}`), {
                status: 'playing',
                guestName: playerName
            })
        }
    }, [playerRole, roomStatus, roomCode, playerName])

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
    const isDraw = !winner && board.every(square => square !== null);
    const currentTurnSymbol = isXNext ? 'X' : 'O';
    const isMyTurn = currentTurnSymbol === playerSymbol;

    // 3. Handle Player Move (Pushing to the Cloud)
    const handleSquareClick = (index) => {
        // Stop clicks if cell is taken, game is over, or it's not your turn
        if (board[index] || winner || isDraw || !isMyTurn) return;

        const newBoard = [...board];
        newBoard[index] = playerSymbol;

        // Instead of local state updates, save directly to Firebase!
        // Firebase will sync it back down to BOTH players via the useEffect listener above.
        set(ref(db, `rooms/${roomCode}`), {
            board: newBoard,
            isXNext: !isXNext
        });
    };

    const handleReset = () => {
        set(ref(db, `rooms/${roomCode}`), {
            board: Array(9).fill(null),
            isXNext: true
        });
    };


        // Conditional Rendering for waiting room
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

    // If status is 'playing', return your normal Game Board UI!
    return (
        <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: "80vh" }}>
            {/* ... Keep all your existing Tic-Tac-Toe Grid JSX here ... */}
        </Container>
    );
}

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

                {/* Grid UI */}
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