import React from 'react';
import { Card, Button, Row, Col, Badge, Modal } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { tictactoeSocket as socket } from '../../socket.js';

import xIcon from '../../assets/logos/X.png'; 
import oIcon from '../../assets/logos/O.png'; 
import WinnerGif from '../../assets/logos/fireworks5.gif';

export default function TictactoeGameScreen({ roomCode, roomData, playerRole, playerName, opponentName }) {
    const navigate = useNavigate();

    // Extract authoritative room state directly from manager props
    const board = roomData?.board || Array(9).fill('');
    const isNext = roomData?.isNext ?? true;

    // --- WINNER EVALUATION ---
    const calculateWinner = (squares) => {
        const lines = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
            [0, 4, 8], [2, 4, 6]             // Diagonals
        ];
        for (let [a, b, c] of lines) {
            if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
                return squares[a];
            }
        }
        return squares.every(s => s !== '') ? 'Draw' : null;
    };

    const winner = calculateWinner(board);

    // Host is always 'X' (isNext = true), Guest is always 'O' (isNext = false)
    const isMyTurn = (playerRole === 'host' && isNext) || (playerRole === 'guest' && !isNext);

    // --- WINNER MODAL TEXT ---
    const getWinnerText = () => {
        if (!winner) return '';
        if (winner === 'Draw') return "It's a Tie!";
        
        const winningRole = winner === 'X' ? 'host' : 'guest';
        return playerRole === winningRole ? 'Victory! You Win!' : `${opponentName || 'Opponent'} Wins!`;
    };

    // --- GAME ACTIONS ---
    const handleSquareClick = (index) => {
        if (board[index] || winner || !isMyTurn) return;

        const newBoard = [...board];
        newBoard[index] = playerRole === 'host' ? 'X' : 'O';
        
        socket.emit('makeMove', { roomCode, board: newBoard, isNext: !isNext });
    };

    const handleReset = () => {
        socket.emit('resetMatch', { roomCode });
    };

    const handleLeaveRoom = () => {
        navigate('/');
    };

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
                    {/* Player Badges & Turn Status Header */}
                    <Row className="mb-3 align-items-center">
                        <Col xs={4}>
                            <Badge bg={playerRole === 'host' ? "primary" : "secondary"} className="p-2 w-100 text-truncate">
                                {playerRole === 'host' ? playerName : opponentName} (X)
                            </Badge>
                        </Col>
                        
                        <Col xs={4} className="text-center">
                            <h6 className={`m-0 fw-bold small text-uppercase ${isMyTurn ? 'text-primary' : 'text-muted'}`}>
                                {isMyTurn ? "Your Turn" : `${opponentName}'s Turn`}
                            </h6>
                        </Col>
                        
                        <Col xs={4}>
                            <Badge bg={playerRole === 'guest' ? "primary" : "secondary"} className="p-2 w-100 text-truncate">
                                {playerRole === 'guest' ? playerName : opponentName} (O)
                            </Badge>
                        </Col>
                    </Row>

                    {/* 3x3 Game Board Grid */}
                    <div className="mx-auto" style={{ maxWidth: '300px' }}>
                        {[0, 3, 6].map(row => (
                            <Row key={row} className="g-2 mb-2">
                                {[0, 1, 2].map(col => {
                                    const index = row + col;
                                    const squareValue = board[index];
                                    return (
                                        <Col xs={4} key={index}>
                                            <Button 
                                                variant={squareValue ? "light" : "outline-secondary"} 
                                                className="w-100 d-flex align-items-center justify-content-center p-0 overflow-hidden" 
                                                style={{ height: '90px' }} 
                                                onClick={() => handleSquareClick(index)}
                                                disabled={!isMyTurn && !squareValue}
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

                    <Button variant="outline-primary" className="w-100 mt-3 fw-bold" onClick={handleReset}>
                        Reset Arena
                    </Button>
                </Card.Body>
            </Card>

            {/* Game Over Modal */}
            <Modal
                show={!!winner}
                onHide={() => {}} 
                backdrop="static"
                keyboard={false}    
                centered
            >
                <Modal.Header
                    as="h5" 
                    style={{ backgroundColor: '#014eb6', color: '#f1f2f5', letterSpacing: '0.2em' }} 
                    className='d-flex align-items-center justify-content-center border-0 py-2 fw-black tracking-widest text-uppercase fs-6'
                >
                    GAME OVER
                </Modal.Header>
                <Modal.Body className='text-center p-4'>
                    <img
                        src={WinnerGif}
                        alt="Winning!!!"
                        className="img-fluid mb-2"
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