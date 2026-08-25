import React, { useState, useEffect } from 'react';
import { Container, Card, Button } from 'react-bootstrap';
import { couchCastSocket as socket } from '../../socket';

export default function CouchCastRules({ roomCode }) {
    const [timeLeft, setTimeLeft] = useState(30);

    // Run the countdown timer
    useEffect(() => {
        // When timer hits 0, auto-advance!
        if (timeLeft <= 0) {
            handleNext();
            return;
        }

        const timerId = setInterval(() => {
            setTimeLeft((prevTime) => prevTime - 1);
        }, 1000);

        // Cleanup interval on unmount
        return () => clearInterval(timerId);
    }, [timeLeft, roomCode]);

    const handleNext = () => {
        console.log(`Sending startPromptSelection event for room: ${roomCode}`);
        socket.emit('startPromptSelection', { roomCode });
    };

    return (
        <Container className='mt-5 d-flex justify-content-center'>
            <Card className='shadow-sm w-100' style={{ maxWidth: '500px' }}>
                <Card.Body className='text-center p-4'>
                    <Card.Title className='fw-bold mb-3 fs-3 text-primary'>
                        How to Play
                    </Card.Title>
                    
                    <div className='text-start fs-5 mb-4 p-3 bg-light rounded border'>
                        <ol className="ps-3 mb-0 text-secondary" style={{ gap: '14px', display: 'flex', flexDirection: 'column' }}>
                            <li><strong>Host Picks the Prompt:</strong> One player is chosen as the Host each round. They get to pick <strong>1 out of 3 random prompts</strong> to set the vibe.</li>
                            <li><strong>Players Respond:</strong> The other players look at their hand of <strong>7 options</strong> (6 pre-drawn cards + 1 custom "Write-In") and submit their funniest answer.</li>
                            <li><strong>Host Judges the Winner:</strong> The Host reads all the submissions anonymously and crowns the winner of the round!</li>
                        </ol>
                    </div>

                    <div className="mb-3 fw-bold text-danger fs-4">
                        Game starts in: {timeLeft}s
                    </div>

                    {/* Developer Skip Button */}
                    <Button 
                        variant='outline-secondary' 
                        size='sm' 
                        className='w-100 fw-bold mt-2' 
                        onClick={handleNext}
                    >
                        ⏭️ Skip Timer (Dev)
                    </Button>
                </Card.Body>
            </Card>
        </Container>
    );
}