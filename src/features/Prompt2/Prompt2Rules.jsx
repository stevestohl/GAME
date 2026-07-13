import React from 'react';
import { Container, Card, Button } from 'react-bootstrap';
import { prompt2Socket as socket } from '../../socket.js';

export default function Prompt2RulesScreen({ roomCode, isHost }) {
    const handleNext = () => {
        console.log(`Sending nextRound event for room: ${roomCode}`);
        socket.emit('nextRound', { roomCode });
    };

    return (
        <Container className='mt-5 d-flex justify-content-center'>
            <Card className='shadow-sm w-100' style={{ maxWidth: "420px" }}>
                <Card.Body className='text-center'>
                    <Card.Title className="fw-bold mb-3 fs-4 text-primary">
                        How to Play
                    </Card.Title>
                    
                    <div className='text-start fs-6 mb-4 p-3 bg-light rounded border'>
                        <ol className="ps-3 mb-0 text-secondary" style={{ gap: '14px', display: 'flex', flexDirection: 'column' }}>
                            <li>
                                <strong>Host Picks the Prompt:</strong> One player is chosen as the Host each round. They get to pick <strong>1 out of 3 random prompts</strong> to set the vibe.
                            </li>
                            <li>
                                <strong>Players Respond:</strong> The other players look at their hand of <strong>7 options</strong> (6 pre-drawn cards + 1 custom "Write-In") and submit their funniest answer.
                            </li>
                            <li>
                                <strong>Host Judges the Winner:</strong> The Host reads all the submissions anonymously and crowns the winner of the round!
                            </li>
                        </ol>
                    </div>
                    
                    {isHost ? (
                        <Button 
                            variant='primary' 
                            className='w-100 fw-bold py-2 shadow-sm' 
                            onClick={handleNext}
                        >
                            Begin Round 1
                        </Button>
                    ) : (
                        <div className='text-muted small py-2 border border-dashed rounded bg-light'>
                            Waiting for the host to start the game...
                        </div>
                    )}
                </Card.Body>
            </Card>
        </Container>
    );
}