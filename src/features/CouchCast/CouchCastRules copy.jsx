import React, { useState, useEffect } from 'react';
import { Card, Button } from 'react-bootstrap';
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
        <div className="page-container align-items-center">
            
            {/* Wide wrapper for landscape TV displays */}
            <div className="shadow-lg w-100 d-flex" style={{ maxWidth: '900px' }}>
                
                {/* overflow: 'hidden' ensures the inner grid doesn't break the rounded corners */}
                <Card className='border-0 w-100 m-0' style={{ borderRadius: '0.5rem', overflow: 'hidden' }}>
                    
                    {/* Using your custom stylesheet header */}
                    <Card.Header
                        as='h5'
                        className="main-card-header m-0">
                        COUCH CAST RULES
                    </Card.Header>

                    {/* Split Layout Container */}
                    <div className="row g-0">
                        
                        {/* --- LEFT COLUMN: Title & Timer --- */}
                        <div className="col-md-5 d-flex flex-column justify-content-center align-items-center bg-light p-4 p-md-5 border-end">
                            <h2 className="fw-bold text-primary mb-4 text-center">
                                How to Play
                            </h2>
                            
                            <div className="text-center mb-4">
                                <div className="text-muted fw-bold mb-1 text-uppercase" style={{ letterSpacing: '0.1em' }}>
                                    Game Starts In
                                </div>
                                {/* Massive timer font for TV readability */}
                                <div className="display-2 fw-bold text-danger">
                                    {timeLeft}s
                                </div>
                            </div>

                            {/* Developer Skip Button pushed to the bottom */}
                            <Button 
                                variant='outline-secondary' 
                                size='sm' 
                                className='w-100 fw-bold mt-auto' 
                                onClick={handleNext}
                            >
                                ⏭️ Skip Timer (Dev)
                            </Button>
                        </div>

                        {/* --- RIGHT COLUMN: The Rules --- */}
                        <div className="col-md-7 d-flex flex-column justify-content-center p-4 p-md-5">
                            {/* Increased gap and font size for better distance reading */}
                            <ol className="ps-4 mb-0 fs-5 text-secondary" style={{ gap: '24px', display: 'flex', flexDirection: 'column' }}>
                                <li>
                                    <strong className="text-dark">Host Picks the Prompt:</strong><br/>
                                    One player is chosen as the Host each round. They get to pick <strong>1 out of 3 random prompts</strong> to set the vibe.
                                </li>
                                <li>
                                    <strong className="text-dark">Players Respond:</strong><br/>
                                    The other players look at their hand of <strong>7 options</strong> (6 pre-drawn cards + 1 custom "Write-In") and submit their funniest answer.
                                </li>
                                <li>
                                    <strong className="text-dark">Host Judges the Winner:</strong><br/>
                                    The Host reads all the submissions anonymously and crowns the winner of the round!
                                </li>
                            </ol>
                        </div>

                    </div>
                </Card>
            </div>
        </div>
    );
}