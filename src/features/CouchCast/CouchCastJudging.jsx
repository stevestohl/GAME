import React, { useState } from 'react';
import { Container, Card, Button, Spinner } from 'react-bootstrap';
import { couchCastSocket as socket } from '../../socket';

export default function CouchCastJudging({ roomCode, isJudge, currentPrompt, submissions =[] }) {
    // Local state for the Judge to highlight their favorite answer before submitting
    const [selectedWinnerId, setSelectedWinnerId] = useState(null);
    
    // NEW: State to handle the dramatic pause and disable the UI
    const [isLockingIn, setIsLockingIn] = useState(false); 

    const handlePickWinner = () => {
        // Prevent double-clicks if they mash the button
        if (!selectedWinnerId || isLockingIn) return;
        
        // 1. Instantly lock the judge's UI
        setIsLockingIn(true);
        
        // 2. Start the suspense timer (e.g., 2.5 seconds)
        setTimeout(() => {
            console.log(`[CouchCast] Judge picked winner ${selectedWinnerId} for room ${roomCode}`);
            socket.emit('pick_winner', { roomCode, winningPlayerId: selectedWinnerId });
            
            // Note: You don't necessarily need to reset isLockingIn to false here
            // because the server will emit a new game state and unmount this component anyway!
        }, 2500); 
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
                                    // NEW: Prevent changing the selection once the dramatic pause starts
                                    disabled={isLockingIn} 
                                >
                                    {sub.answer}
                                </Button>
                            ))
                        )}
                    </div>
                    <Button 
                        // NEW: Change the button color to info while loading for visual feedback
                        variant={isLockingIn ? "info" : "success"} 
                        size="lg" 
                        className="w-100 fw-bold py-3 shadow" 
                        // NEW: Keep button disabled if no winner is picked OR if we are locking in
                        disabled={!selectedWinnerId || isLockingIn}
                        onClick={handlePickWinner}
                    >
                        {/* NEW: Conditional rendering for the button text */}
                        {isLockingIn ? (
                            <>
                                <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                                Locking it in...
                            </>
                        ) : (
                            'Crown the Winner! 👑'
                        )}
                    </Button>
                </Card.Body>
            </Card>
        </Container>
    );
}