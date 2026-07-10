import React, { useState, useEffect } from 'react';
import { Container, Card, Button, Spinner, Row, Col, Badge, Modal } from 'react-bootstrap';
import { useSearchParams } from 'react-router-dom';
import { io } from 'socket.io-client';
import HourGlassBlue from '../../assets/logos/HourGlassBlue.png'; 
import TicTacToeLogo from '../../assets/logos/Tic-Tac-Toe.png'; 
import xIcon from '../../assets/logos/X.png'; 
import oIcon from '../../assets/logos/O.png'; 
import HourGlass from '../../assets/logos/HourGlass.gif';
import WinnerGif from '../../assets/logos/fireworks5.gif';

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
    const [board, setBoard] = useState(Array(9).fill(''));
    const [isNext, setIsNext] = useState(true);
    const [opponentName, setOpponentName] = useState('');

    useEffect(() => {
        const onConnect = () => {
            console.log("Socket connected, joining room...");
            socket.emit('joinRoom', { roomCode, playerRole, playerName });
        };

        socket.on('connect', onConnect);
        socket.on('roomUpdate', (roomData) => {
            setBoard(roomData.board);
            setIsNext(roomData.isNext);
            setRoomStatus(roomData.status);
            setOpponentName(playerRole === 'host' ? roomData.guestName : roomData.hostName);
        });

        socket.on('roomNotFound', () => setRoomStatus('not-found'));
        socket.connect();

        return () => {
            socket.off('connect', onConnect);
            socket.off('roomUpdate');
            socket.off('roomNotFound');
        };
    }, [roomCode, playerRole, playerName]);

    const calculateWinner = (squares) => {
        const lines = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
        for (let [a,b,c] of lines) {
            if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) return squares[a];
        }
        return squares.every(s => s !== '') ? 'Draw' : null;
    };

    const winner = calculateWinner(board);
    const isMyTurn = (playerRole === 'host' && isNext) || (playerRole === 'guest' && !isNext);

    //--------------------------
    // Winner Text For Modal
    //--------------------------
    const getWinnerText = () => {
        if (!winner) return '';
        if (winner === 'Draw') return "It's a Tie!";
        
        const winningRole = winner === 'X' ? 'host' : 'guest';
        if (playerRole === winningRole) {
            return `Victory! You Win!`;
        } else {
            return `${opponentName || 'Opponent'} Wins!`;
        }
    };

    const handleSquareClick = (index) => {
        if (board[index] || winner) return;
        if (!isMyTurn) return; // Cleanly reuse the variable here

        const newBoard = [...board];
        newBoard[index] = playerRole === 'host' ? 'X' : 'O';
        socket.emit('makeMove', { roomCode, board: newBoard, isNext: !isNext });
    };

    const handleReset = () => socket.emit('resetMatch', { roomCode });
    const handleLeaveRoom = () => window.location.href = '/home';

    if (roomStatus === 'loading') return (
        <div className="d-flex justify-content-center align-items-center p-1" style={{ minHeight: "80vh" }}>
            <Spinner animation="border" variant="primary" />
        </div>
    );

    if (roomStatus === 'waiting') return (
        <div className="d-flex justify-content-center align-items-center p-1" style={{ minHeight: "80vh" }}>
            <Card className="text-center shadow-lg border-0" style={{ maxWidth: "450px", width: "100%" }}>
                <Card.Header 
                    as="h5" 
                    className="d-flex align-items-center justify-content-center border-0 py-2 fw-black tracking-widest text-uppercase fs-6"
                    style={{ backgroundColor: '#014eb6', color: '#f1f2f5', letterSpacing: '0.2em' }}>
                    Tic-Tac-Toe Room Created
                </Card.Header>
                
                <Card.Body className="p-4">
                    <img
                        src={HourGlass}
                        alt="Waiting Hourglass"
                        className="img-fluid"
                        style={{ maxWidth: "140px", height: "auto" }}
                    />
                    <h1 className="display-4 fw-bold text-primary mb-2">{roomCode}</h1>
                    <p className="text-muted fw-bold small text-uppercase tracking-wider mb-0">
                        Waiting for opponent...
                    </p>
                </Card.Body>
            </Card>
        </div>
    );

    // Game Play code
    return (
        <div className="d-flex justify-content-center align-items-center p-1" style={{ minHeight: "80vh" }}>
            <Card className="text-center shadow-lg border-0" style={{ maxWidth: "450px", width: "100%" }}>
                <Card.Header 
                    as="h5" 
                    className="d-flex align-items-center justify-content-center border-0 py-2 fw-black tracking-widest text-uppercase fs-6"
                    style={{ backgroundColor: '#014eb6', color: '#f1f2f5', letterSpacing: '0.2em' }}>
                    Tic-Tac-Toe
                </Card.Header>
                    
                <Card.Body className="p-3">
                    <Row className="mb-3">
                        <Col xs={4}>
                            <Badge bg={playerRole === 'host' ? "primary" : "secondary"} className="p-2 w-100 text-truncate">
                                {playerRole === 'guest' ? playerName : opponentName}
                            </Badge>
                        </Col>
                        
                        <Col xs={4} className="text-center">
                            <h6 className={`m-0 fw-bold small text-uppercase ${isMyTurn ? 'text-primary' : 'text-muted'}`}>
                                {isMyTurn ? "Your Turn" : `${opponentName}'s Turn`}
                            </h6>
                        </Col>
                        
                        <Col xs={4}>
                            <Badge bg={playerRole === 'host' ? "secondary" : "primary"} className="p-2 w-100 text-truncate">
                                {playerRole === 'guest' ? opponentName : playerName}
                            </Badge>
                        </Col>
                    </Row>

                    <div className="mx-auto" style={{ maxWidth: '300px' }}>
                        {[0, 3, 6].map(row => (
                            <Row key={row} className="g-2 mb-2">
                                {[0, 1, 2].map(col => {
                                    const squareValue = board[row + col];
                                    return (
                                        <Col xs={4} key={row + col}>
                                            <Button 
                                                variant={squareValue ? "light" : "outline-secondary"} 
                                                className="w-100 d-flex align-items-center justify-content-center p-0 overflow-hidden" 
                                                style={{ height: '90px' }} 
                                                onClick={() => handleSquareClick(row + col)}
                                            >
                                                {squareValue === 'X' && (
                                                    <img 
                                                        src={xIcon} 
                                                        alt="X" 
                                                        style={{ width: "100%", height: "100%", objectFit: "cover" }} 
                                                    />
                                                )}
                                                {squareValue === 'O' && (
                                                    <img 
                                                        src={oIcon} 
                                                        alt="O" 
                                                        style={{ width: "100%", height: "100%", objectFit: "cover" }} 
                                                    />
                                                )}
                                            </Button>
                                        </Col>
                                    );
                                })}
                            </Row>
                        ))}
                    </div>
                    <Button variant="outline-primary" className="w-100 mt-3" onClick={handleReset}>
                        Reset Arena
                    </Button>
                </Card.Body>
            </Card>
            <Modal
                show={!!winner}
                onHide={()=> {}} // prevents closing by clicking back
                backdrop="static"
                keyboard={false}    
                centered
            >
                <Modal.Header
                    as="h5" 
                    style={{ backgroundColor:'#014eb6', color:'#f1f2f5', letterSpacing: '0.2em'}} 
                    className='d-flex align-items-center justify-content-center border-0 py-2 fw-black tracking-widest text-uppercase fs-6'
                >
                    GAME OVER
                </Modal.Header>
                <Modal.Body className='text-center p-4'>
                    <img
                        src={WinnerGif}
                        alt="Winning!!!"
                        className="img-fluid"
                        style={{ maxWidth: "140px", height: "auto" }}
                    />                    
                    <h2 className='fw-bold text-dark mb-4'>{getWinnerText()}</h2>
                    <div className='d-flex gap-2'>


                        <Button variant='outline-primary' className='w-100 fw-bold py-2' onClick={handleReset}>
                            Play Again
                        </Button>
                        <Button variant="primary" className='w-100 fw-bold py-2' onClick={handleLeaveRoom}>
                            Leave Room
                        </Button>
                    </div>
                </Modal.Body>
            </Modal>
        </div>
    );
}