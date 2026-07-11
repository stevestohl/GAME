import React from 'react';
import { Container, Card, Button } from 'react-bootstrap';
import { triviaSocket as socket } from '../socket.js';

export default function RulesScreen({ roomCode, isHost }) {
    const handleNext = () => {
        console.log(`Sending nextRound event for room:${roomCode }`)
        socket.emit('nextRound', { roomCode });
    };

    return (
        <Container className="mt-5 d-flex justify-content-center">
            <Card className="shadow-sm w-100" style={{ maxWidth: '420px' }}>
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
        </Container>
    );
}