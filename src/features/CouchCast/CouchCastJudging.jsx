import React, { useState, useEffect } from 'react';
import { Container, Card, Button, Spinner } from 'react-bootstrap';
import { couchCastSocket as socket } from '../../socket';

export default function CouchCastJudging({ roomCode, isJudge, currentPrompt, endTime, submissions =[] }) {
    // The answer the Judge tapped (one tap crowns it, so this also locks the screen)
    const [selectedWinnerId, setSelectedWinnerId] = useState(null);

    // Countdown to the server's deadline (after it, a random answer wins)
    const [timeLeft, setTimeLeft] = useState(null);

    useEffect(() => {
        if (!endTime) return;
        const updateTime = () => {
            const remaining = Math.floor((endTime - Date.now()) / 1000);
            setTimeLeft(remaining > 0 ? remaining : 0);
        };
        updateTime();
        const timer = setInterval(updateTime, 1000);
        return () => clearInterval(timer);
    }, [endTime]);

    // One tap picks the winner straight away (no separate "crown" button)
    const handlePickWinner = (playerId) => {
        if (selectedWinnerId) return; // Prevent double-taps
        setSelectedWinnerId(playerId);
        console.log(`[CouchCast] Judge picked winner ${playerId} for room ${roomCode}`);
        socket.emit('pick_winner', { roomCode, winningPlayerId: playerId });
    };

    // ==========================================
    // 1. THE PLAYER'S VIEW (Waiting for Judge)
    // ==========================================
    if (!isJudge) {
        return (
            <Container className="mt-5 d-flex justify-content-center">
                <Card className="shadow-sm w-100 border-info" style={{ maxWidth: '420px' }}>
                    <Card.Body className="text-center p-5">
                        <Spinner animation="border" variant="info" className="mb-4" style={{ width: '3rem', height: '3rem' }} />
                        <Card.Title className="fw-bold fs-4 text-dark mb-2">
                            Moment of Truth
                        </Card.Title>
                        <Card.Text className="text-muted fs-6">
                            The Judge is currently reviewing the submissions. Look up at the TV and cross your fingers!
                        </Card.Text>
                    </Card.Body>
                </Card>
            </Container>
        );
    }

    // ==========================================
    // 2. THE JUDGE'S VIEW (Picking the Winner)
    // ==========================================
    return (
        <Container className="mt-4 d-flex justify-content-center pb-5">
            <Card className="shadow-sm w-100 border-warning" style={{ maxWidth: '420px' }}>
                <Card.Header className="bg-warning text-dark text-center py-3">
                    <div className="small fw-bold text-uppercase opacity-75 mb-1" style={{ letterSpacing: '2px' }}>
                        You Are The Judge
                    </div>
                    <div className="fs-5 fw-bold">
                        {currentPrompt?.text || currentPrompt}
                    </div>
                </Card.Header>
                
                <Card.Body>
                    <p className="text-center text-muted fw-bold mb-3">
                        Read the answers on the TV, then tap your favorite to crown it!
                    </p>

                    {timeLeft !== null && submissions.length > 0 && (
                        <div className="text-center mb-3">
                            <h4 className={`fw-bold mb-1 ${timeLeft <= 10 ? 'text-danger' : 'text-info'}`}>⏱️ {timeLeft}s</h4>
                            <div className="small text-muted">No pick in time? A random answer wins.</div>
                        </div>
                    )}
                    
                    <div className="d-flex flex-column gap-2">
                        {submissions.length === 0 ? (
                            <div className="text-center text-danger fw-bold my-4">
                                No one submitted an answer! 
                            </div>
                        ) : (
                            submissions.map((sub, index) => (
                                <Button
                                    key={index}
                                    variant={selectedWinnerId === sub.playerId ? 'warning' : 'outline-dark'}
                                    className="text-start p-3 fw-semibold text-wrap shadow-sm"
                                    onClick={() => handlePickWinner(sub.playerId)}
                                    disabled={!!selectedWinnerId && selectedWinnerId !== sub.playerId}
                                >
                                    {sub.answer}
                                </Button>
                            ))
                        )}
                    </div>
                </Card.Body>
            </Card>
        </Container>
    );
}