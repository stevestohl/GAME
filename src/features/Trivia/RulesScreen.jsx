import React from 'react';
import { Container, Card, Button } from 'react-bootstrap';
import { triviaSocket as socket } from '../../socket.js';

export default function RulesScreen({ roomCode, isHost }) {
    const handleNext = () => {
        console.log(`Sending nextRound event for room:${roomCode }`)
        socket.emit('nextRound', { roomCode });
    };

    return (

    <div className="d-flex justify-content-center align-items-center p-1" style={{ minHeight: "80vh" }}>        
        <Card className="text-center shadow-lg border-0" style={{ maxWidth: "450px", width: "100%" }}>
            <Card.Header
                as="h5"
                className="d-flex align-items-center justify-content-center border-0 py-2 fw-bold text-uppercase fs-6"
                style={{ backgroundColor: '#014eb6', color: '#f1f2f5', letterSpacing: '0.2em' }}
            >
                TRIVIA-TEMPLE
            </Card.Header>
                <Card.Body className="text-center">
                    <Card.Title className="fs-3 fw-bold mb-3 text-primary">Game Rules</Card.Title>
                    
                    <Card.Text className="text-start fs-6 mb-4 p-3 bg-light rounded border">
                        <strong>How to play Temple-Trivia:</strong>
                        <br /><br />
                        1. The game consists of <strong>3 rounds</strong>.<br />
                        2. Read the question carefully.<br />
                        3. You earn <strong>1 point</strong> per correct answer.<br />
                        4. The scoreboard shifts instantly once everyone logs their vote!
                    </Card.Text>

                    {isHost ? (
                        <Button variant="primary" className="w-100 fw-bold py-2 shadow-sm" onClick={handleNext}>
                            Begin Round 1
                        </Button>
                    ) : (
                        <div className="text-muted small py-2 border border-dashed rounded bg-light">
                            Waiting for the host to launch the first question...
                        </div>
                    )}
                </Card.Body>
            </Card>
        </div>
    );
}