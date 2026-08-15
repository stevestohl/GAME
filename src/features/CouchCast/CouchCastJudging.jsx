import React, { useState } from 'react';
import { Container, Card, Button, Spinner } from 'react-bootstrap';
import { couchCastSocket as socket } from '../../socket';

export default function CouchCastJudging({ roomCode, isJudge, currentPrompt, submissions = [] }) {
    // Local state for the Judge to highlight their favorite answer before submitting
    const [selectedWinnerId, setSelectedWinnerId] = useState(null);

    const handlePickWinner = () => {
        if (!selectedWinnerId) return;
        
        console.log(`[CouchCast] Judge picked winner ${selectedWinnerId} for room ${roomCode}`);
        socket.emit('pick_winner', { roomCode, winningPlayerId: selectedWinnerId });
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
                        {currentPrompt}
                    </div>
                </Card.Header>
                
                <Card.Body>
                    <p className="text-center text-muted fw-bold mb-3">
                        Read the answers on the TV, then pick your favorite!
                    </p>
                    
                    <div className="d-flex flex-column gap-2 mb-4">
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
                                    onClick={() => setSelectedWinnerId(sub.playerId)}
                                >
                                    {sub.answer}
                                </Button>
                            ))
                        )}
                    </div>

                    <Button 
                        variant="success" 
                        size="lg" 
                        className="w-100 fw-bold py-3 shadow" 
                        disabled={!selectedWinnerId}
                        onClick={handlePickWinner}
                    >
                        Crown the Winner! 👑
                    </Button>
                </Card.Body>
            </Card>
        </Container>
    );
}